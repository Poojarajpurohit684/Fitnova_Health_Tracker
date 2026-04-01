import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { ModalService } from '../../../../shared/services/modal.service';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container" *ngIf="workout">

      <!-- HEADER -->
      <div class="header">
        <div>
          <h1>{{ workout.exerciseType }}</h1>
          <p class="date">{{ workout.createdAt | date:'fullDate' }}</p>
        </div>

        <div class="actions">
          <button class="btn edit" (click)="editWorkout()">Edit</button>
          <button class="btn delete" (click)="deleteWorkout()">Delete</button>
        </div>
      </div>

      <!-- MAIN STATS -->
      <div class="stats-grid">
        <div class="card">
          <span class="label">Duration</span>
          <span class="value">{{ workout.duration }} min</span>
        </div>

        <div class="card">
          <span class="label">Calories</span>
          <span class="value">{{ workout.caloriesBurned }} kcal</span>
        </div>

        <div class="card" *ngIf="workout.distance">
          <span class="label">Distance</span>
          <span class="value">{{ workout.distance }} km</span>
        </div>

        <div class="card" *ngIf="workout.weight">
          <span class="label">Weight</span>
          <span class="value">{{ workout.weight }} kg</span>
        </div>
      </div>

      <!-- EXTRA DETAILS -->
      <div class="details" *ngIf="workout.notes">
        <h3>Notes</h3>
        <p>{{ workout.notes }}</p>
      </div>

    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      max-width: 900px;
      margin: auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2rem;
      font-weight: 800;
      margin: 0;
    }

    .date {
      color: #9CA3AF;
      font-size: 0.9rem;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: 0.2s;
    }

    .btn.edit {
      background: #6366F1;
      color: white;
    }

    .btn.delete {
      background: #EF4444;
      color: white;
    }

    .btn:hover {
      opacity: 0.85;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 1rem;
      border-radius: 12px;
    }

    .label {
      display: block;
      font-size: 0.75rem;
      color: #9CA3AF;
      margin-bottom: 5px;
    }

    .value {
      font-size: 1.4rem;
      font-weight: 700;
    }

    .details {
      background: rgba(255,255,255,0.03);
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
    }

    h3 {
      margin-bottom: 0.5rem;
    }
  `]
})
export class WorkoutDetailComponent implements OnInit {

  workout: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;

    this.api.get(`/workouts/${id}`).subscribe({
      next: (res: any) => {
        this.workout = res;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // 🔥 EDIT
  editWorkout() {
    this.router.navigate(['/workouts', this.workout._id, 'edit']);
  }

  // 🔥 DELETE
  deleteWorkout() {
    this.modalService.confirm(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      'Delete',
      'Cancel',
      'error'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.api.delete(`/workouts/${this.workout._id}`).subscribe({
          next: () => {
            this.modalService.success('Workout deleted');
            this.router.navigate(['/workouts']);
          },
          error: (err) => {
            console.error(err);
            this.modalService.error('Delete failed');
          }
        });
      }
    });
  }
}