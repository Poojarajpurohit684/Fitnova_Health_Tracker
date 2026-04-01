import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { UserContextService } from './user-context.service';
import { OfflineService } from './offline.service';
import { of } from 'rxjs';

describe('ApiService - Rate Limiting', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let userContextService: jasmine.SpyObj<UserContextService>;
  let offlineService: jasmine.SpyObj<OfflineService>;

  beforeEach(() => {
    const userContextSpy = jasmine.createSpyObj('UserContextService', [], {
      userId$: of('test-user-id'),
    });
    const offlineSpy = jasmine.createSpyObj('OfflineService', ['isOnline', 'queueRequest']);
    offlineSpy.isOnline.and.returnValue(true);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: UserContextService, useValue: userContextSpy },
        { provide: OfflineService, useValue: offlineSpy },
      ],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    userContextService = TestBed.inject(UserContextService) as jasmine.SpyObj<UserContextService>;
    offlineService = TestBed.inject(OfflineService) as jasmine.SpyObj<OfflineService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('GET requests with rate limiting', () => {
    it('should queue GET request on 429 rate limit error', (done) => {
      service.get('/test').subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.message).toContain('Too many requests');
          expect(offlineService.queueRequest).toHaveBeenCalledWith(
            'GET',
            '/test',
            undefined,
            undefined,
            true,
            jasmine.any(Number)
          );
          done();
        }
      );

      const req = httpMock.expectOne('http://localhost:3000/api/v1/test?userId=test-user-id');
      req.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });
    });

    it('should respect retry-after header when queuing', (done) => {
      const futureTime = new Date(Date.now() + 60000).toISOString();

      service.get('/test').subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(offlineService.queueRequest).toHaveBeenCalledWith(
            'GET',
            '/test',
            undefined,
            undefined,
            true,
            jasmine.any(Number)
          );
          done();
        }
      );

      const req = httpMock.expectOne('http://localhost:3000/api/v1/test?userId=test-user-id');
      req.flush('Too many requests', {
        status: 429,
        statusText: 'Too Many Requests',
        headers: { 'retry-after': futureTime },
      });
    });
  });

  describe('POST requests with rate limiting', () => {
    it('should queue POST request on 429 rate limit error', (done) => {
      const testData = { name: 'test' };

      service.post('/test', testData).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.message).toContain('Too many requests');
          expect(offlineService.queueRequest).toHaveBeenCalledWith(
            'POST',
            '/test',
            testData,
            undefined,
            true,
            jasmine.any(Number)
          );
          done();
        }
      );

      const req = httpMock.expectOne('http://localhost:3000/api/v1/test');
      req.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });
    });
  });

  describe('PUT requests with rate limiting', () => {
    it('should queue PUT request on 429 rate limit error', (done) => {
      const testData = { name: 'updated' };

      service.put('/test', testData).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.message).toContain('Too many requests');
          expect(offlineService.queueRequest).toHaveBeenCalledWith(
            'PUT',
            '/test',
            testData,
            undefined,
            true,
            jasmine.any(Number)
          );
          done();
        }
      );

      const req = httpMock.expectOne('http://localhost:3000/api/v1/test');
      req.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });
    });
  });

  describe('DELETE requests with rate limiting', () => {
    it('should queue DELETE request on 429 rate limit error', (done) => {
      service.delete('/test').subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.message).toContain('Too many requests');
          expect(offlineService.queueRequest).toHaveBeenCalledWith(
            'DELETE',
            '/test',
            undefined,
            undefined,
            true,
            jasmine.any(Number)
          );
          done();
        }
      );

      const req = httpMock.expectOne('http://localhost:3000/api/v1/test?userId=test-user-id');
      req.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });
    });
  });

  describe('Exponential backoff with rate limiting', () => {
    it('should retry with exponential backoff before queuing', (done) => {
      let requestCount = 0;

      service.get('/test').subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.message).toContain('Too many requests');
          // Should have retried 3 times + initial request = 4 total
          expect(requestCount).toBe(4);
          done();
        }
      );

      // Initial request
      let req = httpMock.expectOne('http://localhost:3000/api/v1/test?userId=test-user-id');
      requestCount++;
      req.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });

      // Retry 1
      setTimeout(() => {
        req = httpMock.expectOne('http://localhost:3000/api/v1/test?userId=test-user-id');
        requestCount++;
        req.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });
      }, 1100);

      // Retry 2
      setTimeout(() => {
        req = httpMock.expectOne('http://localhost:3000/api/v1/test?userId=test-user-id');
        requestCount++;
        req.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });
      }, 3200);

      // Retry 3
      setTimeout(() => {
        req = httpMock.expectOne('http://localhost:3000/api/v1/test?userId=test-user-id');
        requestCount++;
        req.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });
      }, 7400);
    }, 10000);
  });
});
