import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page-container">
    <div class="page-card">

      <h1>Support Center</h1>
      <p class="subtitle">How can we help you?</p>

      <div class="support-grid">

        <div class="support-item">
          <h3>Account Issues</h3>
          <p>Help with login, password reset, or profile updates.</p>
        </div>

        <div class="support-item">
          <h3>Workout Tracking</h3>
          <p>Learn how to log workouts and monitor progress.</p>
        </div>

        <div class="support-item">
          <h3>Nutrition Tracking</h3>
          <p>Track calories, macros, and meals effectively.</p>
        </div>

        <div class="support-item">
          <h3>Technical Problems</h3>
          <p>Report bugs or issues with the FitNova platform.</p>
        </div>

      </div>

    </div>
  </div>
  `,
  styles: [`
  .page-container{
    min-height:100vh;
    background:linear-gradient(135deg,#0f172a 20%,#000000 100%);
    padding:2rem;
    display:flex;
    justify-content:center;
  }

  .page-card{
    max-width:900px;
    width:100%;
    background:var(--color-bg-card);
    padding:3rem;
    border-radius:16px;
    border:1px solid var(--color-border-subtle);
  }

  h1{
    font-size:2rem;
    color:var(--color-primary-base);
    margin-bottom:.5rem;
  }

  .subtitle{
    color:var(--color-text-light);
    margin-bottom:2rem;
  }

  .support-grid{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:1.5rem;
  }

  .support-item{
    background:var(--color-bg-surface);
    padding:1.5rem;
    border-radius:10px;
    border:1px solid var(--color-border-subtle);
  }

  .support-item h3{
    color:var(--color-text-main);
    margin-bottom:.5rem;
  }

  .support-item p{
    color:var(--color-text-light);
    font-size:.9rem;
  }
  `]
})
export class SupportComponent {}