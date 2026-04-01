import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page-container">
    <div class="page-card">

      <h1>Contact Us</h1>
      <p class="subtitle">We would love to hear from you.</p>

      <div class="contact-info">

        <div class="contact-item">
          <strong>Email</strong>
          <p>support&#64;fitnova.com</p>
        </div>

        <div class="contact-item">
          <strong>Phone</strong>
          <p>+91 98765 43210</p>
        </div>

        <div class="contact-item">
          <strong>Office Hours</strong>
          <p>Monday – Friday<br>9:00 AM – 6:00 PM</p>
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
    max-width:700px;
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

  .contact-info{
    display:flex;
    flex-direction:column;
    gap:1.5rem;
  }

  .contact-item{
    padding:1rem;
    background:var(--color-bg-surface);
    border-radius:10px;
    border:1px solid var(--color-border-subtle);
  }

  .contact-item strong{
    color:var(--color-text-main);
  }

  .contact-item p{
    color:var(--color-text-light);
    margin-top:.3rem;
  }
  `]
})
export class ContactComponent {}