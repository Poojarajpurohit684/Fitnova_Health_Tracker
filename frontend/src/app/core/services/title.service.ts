import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Service for managing dynamic page titles
 * Formats titles as "Page Name | FitNova"
 */
@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private readonly APP_NAME = 'FitNova';
  private readonly TITLE_SEPARATOR = ' | ';

  constructor(
    private titleService: Title,
    private router: Router
  ) {
    this.initializeRouteListener();
  }

  /**
   * Set the page title
   * @param pageTitle The page title (will be formatted as "pageTitle | FitNova")
   */
  setTitle(pageTitle: string): void {
    const formattedTitle = this.formatTitle(pageTitle);
    this.titleService.setTitle(formattedTitle);
  }

  /**
   * Set the page title with custom format
   * @param pageTitle The page title
   * @param appName Optional custom app name (defaults to "FitNova")
   */
  setTitleWithCustomApp(pageTitle: string, appName: string = this.APP_NAME): void {
    const formattedTitle = `${pageTitle}${this.TITLE_SEPARATOR}${appName}`;
    this.titleService.setTitle(formattedTitle);
  }

  /**
   * Get the current page title
   */
  getTitle(): string {
    return this.titleService.getTitle();
  }

  /**
   * Reset title to default
   */
  resetTitle(): void {
    this.setTitle('Your Fitness Journey');
  }

  /**
   * Format title with app name
   * @param pageTitle The page title
   * @returns Formatted title string
   */
  private formatTitle(pageTitle: string): string {
    return `${pageTitle}${this.TITLE_SEPARATOR}${this.APP_NAME}`;
  }

  /**
   * Initialize route listener to update title on navigation
   */
  private initializeRouteListener(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        // Title will be set by route data or component
        // This listener ensures proper timing for title updates
      });
  }
}
