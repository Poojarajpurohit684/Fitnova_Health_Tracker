import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-container">
      <div class="legal-content">
        <h1>Privacy Policy</h1>
        
        <section>
          <h2>1. Introduction</h2>
          <p>FitNova ("we" or "us" or "our") operates the FitNova website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
        </section>

        <section>
          <h2>2. Information Collection and Use</h2>
          <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
          
          <h3>Types of Data Collected:</h3>
          <ul>
            <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to:
              <ul style="margin-top: 0.5rem;">
                <li>Email address</li>
                <li>First name and last name</li>
                <li>Phone number</li>
                <li>Address, State, Province, ZIP/Postal code, City</li>
                <li>Cookies and Usage Data</li>
              </ul>
            </li>
            <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage Data"). This may include information such as your computer's Internet Protocol address, browser type, browser version, the pages you visit, the time and date of your visit, and other diagnostic data.</li>
          </ul>
        </section>

        <section>
          <h2>3. Use of Data</h2>
          <p>FitNova uses the collected data for various purposes:</p>
          <ul>
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information so that we can improve our Service</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </section>

        <section>
          <h2>4. Security of Data</h2>
          <p>The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
        </section>

        <section>
          <h2>5. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the bottom of this Privacy Policy.</p>
        </section>

        <section>
          <h2>6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <ul>
            <li>Email: <a href="mailto:privacy@fitnova.com">privacy&#64;fitnova.com</a></li>
            <li>Phone: +1 (555) 123-4567</li>
          </ul>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Data portability</li>
          </ul>
        </section>

        <div class="legal-footer">
          <p>Last updated: March 15, 2026</p>
          <a routerLink="/" class="back-link">← Back to Home</a>
        </div>
      </div>
    </div>
  `,
  // styles: [`
  //   .legal-container {
  //     min-height: 100vh;
  //     background: #F8FAFC;
  //     padding: 2rem;
  //   }

  //   .legal-content {
  //     max-width: 900px;
  //     margin: 0 auto;
  //     background: white;
  //     padding: 3rem;
  //     border-radius: 12px;
  //     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  //   }

  //   h1 {
  //     font-size: 2.5rem;
  //     font-weight: 800;
  //     color: #10B981;
  //     margin-bottom: 2rem;
  //     letter-spacing: -0.02em;
  //   }

  //   section {
  //     margin-bottom: 2rem;
  //   }

  //   h2 {
  //     font-size: 1.5rem;
  //     font-weight: 700;
  //     color: #111827;
  //     margin-bottom: 1rem;
  //     margin-top: 1.5rem;
  //   }

  //   h3 {
  //     font-size: 1.1rem;
  //     font-weight: 600;
  //     color: #212121;
  //     margin-bottom: 0.75rem;
  //     margin-top: 1rem;
  //   }

  //   p {
  //     font-size: 1rem;
  //     line-height: 1.8;
  //     color: #424242;
  //     margin-bottom: 1rem;
  //   }

  //   ul {
  //     list-style: none;
  //     padding-left: 0;
  //     margin-bottom: 1rem;
  //   }

  //   li {
  //     font-size: 1rem;
  //     line-height: 1.8;
  //     color: #424242;
  //     margin-bottom: 0.75rem;
  //     padding-left: 2rem;
  //     position: relative;
  //   }

  //   li:before {
  //     content: "•";
  //     position: absolute;
  //     left: 0;
  //     color: #10B981;
  //     font-weight: bold;
  //   }

  //   a {
  //     color: #10B981;
  //     text-decoration: none;
  //     transition: color 200ms ease;
  //   }

  //   a:hover {
  //     color: #059669;
  //     text-decoration: underline;
  //   }

  //   .legal-footer {
  //     margin-top: 3rem;
  //     padding-top: 2rem;
  //     border-top: 2px solid #E0E0E0;
  //     text-align: center;
  //   }

  //   .legal-footer p {
  //     font-size: 0.9rem;
  //     color: #9CA3AF;
  //     margin-bottom: 1rem;
  //   }

  //   .back-link {
  //     display: inline-block;
  //     color: #10B981;
  //     text-decoration: none;
  //     font-weight: 600;
  //     transition: all 200ms ease;
  //     padding: 0.5rem 1rem;
  //     border-radius: 8px;
  //   }

  //   .back-link:hover {
  //     background: rgba(16, 185, 129, 0.1);
  //     transform: translateX(-4px);
  //   }

  //   @media (max-width: 768px) {
  //     .legal-container {
  //       padding: 1rem;
  //     }

  //     .legal-content {
  //       padding: 1.5rem;
  //     }

  //     h1 {
  //       font-size: 1.75rem;
  //     }

  //     h2 {
  //       font-size: 1.25rem;
  //     }

  //     h3 {
  //       font-size: 1rem;
  //     }

  //     p, li {
  //       font-size: 0.95rem;
  //     }
  //   }
  // `]
   styles: [`
.legal-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 20%, #000000 100%);
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.legal-content {
  max-width: 900px;
  width: 100%;
  background: var(--color-bg-card);
  padding: 3rem;
  border-radius: 16px;
  border: 1px solid var(--color-border-subtle);
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
}

/* TITLE */

h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--color-primary-base);
  margin-bottom: 2rem;
}

/* SECTIONS */

section {
  margin-bottom: 2rem;
  transition: transform .2s ease;
}

section:hover {
  transform: translateX(3px);
}

h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

h3 {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 0.75rem;
  margin-top: 1rem;
}

/* TEXT */

p {
  font-size: 0.95rem;
  line-height: 1.8;
  color: var(--color-text-light);
  margin-bottom: 1rem;
}

/* LISTS */

ul {
  list-style: none;
  padding-left: 0;
  margin-bottom: 1rem;
}

li {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--color-text-light);
  margin-bottom: 0.6rem;
  padding-left: 1.5rem;
  position: relative;
}

li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color-primary-base);
  font-weight: bold;
}

/* LINKS */

a {
  color: var(--color-primary-base);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* FOOTER */

.legal-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border-subtle);
  text-align: center;
}

.legal-footer p {
  font-size: 0.85rem;
  color: var(--color-text-light);
  margin-bottom: 1rem;
}

.back-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  color: var(--color-primary-base);
  transition: all 0.2s ease;
}

.back-link:hover {
  background: rgba(255,255,255,0.05);
  transform: translateX(-3px);
}

/* MOBILE */

@media (max-width: 768px) {

  .legal-container {
    padding: 1rem;
  }

  .legal-content {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.7rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  p, li {
    font-size: 0.9rem;
  }
    
}
  `]
})
export class PrivacyComponent {}
