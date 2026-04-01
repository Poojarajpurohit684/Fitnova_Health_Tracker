import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-container">
      <div class="legal-content">
        <h1>Terms of Service</h1>
        
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using FitNova, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        </section>

        <section>
          <h2>2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on FitNova for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
          <ul>
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on FitNova</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
          </ul>
        </section>

        <section>
          <h2>3. Disclaimer</h2>
          <p>The materials on FitNova are provided on an 'as is' basis. FitNova makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        </section>

        <section>
          <h2>4. Limitations</h2>
          <p>In no event shall FitNova or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on FitNova, even if FitNova or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
        </section>

        <section>
          <h2>5. Accuracy of Materials</h2>
          <p>The materials appearing on FitNova could include technical, typographical, or photographic errors. FitNova does not warrant that any of the materials on its website are accurate, complete, or current. FitNova may make changes to the materials contained on its website at any time without notice.</p>
        </section>

        <section>
          <h2>6. Links</h2>
          <p>FitNova has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by FitNova of the site. Use of any such linked website is at the user's own risk.</p>
        </section>

        <section>
          <h2>7. Modifications</h2>
          <p>FitNova may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>
        </section>

        <section>
          <h2>8. Governing Law</h2>
          <p>These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which FitNova operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
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
  scroll-behavior: smooth;
  max-width: 900px;
  width: 100%;
  background: var(--color-bg-card);
  padding: 3rem;
  border-radius: 16px;
  border: 1px solid var(--color-border-subtle);
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
}

/* PAGE TITLE */

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
  text-decoration: none;
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
    scroll-behavior: smooth;
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
export class TermsComponent {}
