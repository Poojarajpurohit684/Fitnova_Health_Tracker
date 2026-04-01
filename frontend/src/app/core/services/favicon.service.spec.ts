import { TestBed } from '@angular/core/testing';

/**
 * Unit Tests for Favicon Configuration
 * These tests verify that favicon links are properly configured in the application
 */
describe('Favicon Configuration', () => {
  it('should have favicon links in document head', () => {
    // Check if favicon links exist in the document
    const faviconLinks = document.querySelectorAll('link[rel*="icon"]');
    expect(faviconLinks.length).toBeGreaterThan(0);
  });

  it('should have SVG favicon link', () => {
    const svgFavicon = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
    expect(svgFavicon).toBeTruthy();
  });

  it('should have PNG favicon link', () => {
    const pngFavicon = document.querySelector('link[rel="icon"][type="image/png"]');
    expect(pngFavicon).toBeTruthy();
  });

  it('should have Apple touch icon link', () => {
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    expect(appleTouchIcon).toBeTruthy();
  });

  it('should have favicon with href attribute', () => {
    const faviconLinks = document.querySelectorAll('link[rel*="icon"]');
    faviconLinks.forEach(link => {
      expect(link.getAttribute('href')).toBeTruthy();
    });
  });
});

/**
 * Property-Based Test: Favicon Links Are Properly Configured
 * Validates: Requirements 1.3, 1.6
 * 
 * This test verifies that all favicon links are present and properly configured
 */
describe('Favicon Links - Property Test', () => {
  it('should have all required favicon link types', () => {
    const requiredTypes = [
      { rel: 'icon', type: 'image/svg+xml' },
      { rel: 'icon', type: 'image/png' },
      { rel: 'apple-touch-icon' }
    ];

    requiredTypes.forEach(required => {
      let selector = `link[rel="${required.rel}"]`;
      if (required.type) {
        selector += `[type="${required.type}"]`;
      }
      const link = document.querySelector(selector);
      expect(link).toBeTruthy(`Missing favicon link: ${selector}`);
    });
  });

  it('should have favicon links with valid href attributes', () => {
    const faviconLinks = document.querySelectorAll('link[rel*="icon"]');
    expect(faviconLinks.length).toBeGreaterThan(0);
    
    faviconLinks.forEach(link => {
      const href = link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/\.(svg|png|ico)$/i);
    });
  });
});

