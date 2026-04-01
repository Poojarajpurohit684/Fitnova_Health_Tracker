import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CardComponent } from '../../shared/components/Card/card.component';
import { ButtonComponent } from '../../shared/components/Button/button.component';
import { AnalyticsService } from './services/analytics.service';

@Component({
  standalone: true,
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  imports: [
    CommonModule,
    CardComponent,
    ButtonComponent
  ]
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  timeRanges: ('week' | 'month' | 'year')[] = ['week', 'month', 'year'];
  timeRange: 'week' | 'month' | 'year' = 'week';
  loading = false;
  error: string | null = null;

  totalWorkouts = 0;
  totalDuration = 0;
  totalCalories = 0;
  consistency = 0;

  currentStreak = 0;
  bestStreak = 0;
  trendPercentage = 0;

  workoutFrequencyData = {
    labels: [] as string[],
    values: [] as number[]
  };

  goalProgressData: Array<{ name: string; percentage: number }> = [];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTimeRange(range: 'week' | 'month' | 'year') {
    this.timeRange = range;
    this.loadAnalyticsData();
  }

  private loadAnalyticsData(): void {
    this.loading = true;
    this.error = null;

    const currentRange = this.getDateRange(this.timeRange, false);
    const previousRange = this.getDateRange(this.timeRange, true);

    forkJoin({
      current: this.analyticsService.getDashboard(currentRange.startDate, currentRange.endDate),
      previous: this.analyticsService.getDashboard(previousRange.startDate, previousRange.endDate)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ current, previous }) => {
          this.totalWorkouts = current.totalWorkouts || 0;
          this.totalDuration = current.totalDuration || 0;
          this.totalCalories = current.totalCalories || 0;
          this.goalProgressData = (current.goals || []).map(goal => ({
            name: goal.name,
            percentage: goal.progress || 0
          }));

          this.buildWorkoutChart(current.weeklyTrends || []);
          this.calculateStreaks(current.weeklyTrends || []);
          this.consistency = this.calculateConsistency(current.weeklyTrends || []);
          this.trendPercentage = this.calculateTrendPercentage(current.totalWorkouts || 0, previous.totalWorkouts || 0);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = 'Unable to load analytics data right now.';
        }
      });
  }

  private buildWorkoutChart(trends: Array<{ date: string; workouts: number }>): void {
    const sorted = [...trends].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (!sorted.length) {
      this.workoutFrequencyData = { labels: [], values: [] };
      return;
    }

    if (this.timeRange === 'year') {
      const monthTotals = new Map<string, { label: string; workouts: number; sortKey: number }>();

      sorted.forEach((item) => {
        const d = new Date(item.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const sortKey = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
        if (!monthTotals.has(key)) {
          monthTotals.set(key, {
            label: d.toLocaleDateString(undefined, { month: 'short' }),
            workouts: 0,
            sortKey,
          });
        }
        monthTotals.get(key)!.workouts += item.workouts || 0;
      });

      const months = Array.from(monthTotals.entries())
        .map(([key, v]) => ({ key, ...v }))
        .sort((a, b) => a.sortKey - b.sortKey);

      this.workoutFrequencyData = {
        labels: months.map((m) => m.label),
        values: months.map((m) => m.workouts),
      };
      return;
    }

    if (this.timeRange === 'month') {
      const start = new Date(sorted[0].date);
      const weekMs = 7 * 24 * 60 * 60 * 1000;
      const maxBins = 6;

      const bins = Array.from({ length: maxBins }, (_v, i) => ({
        label: `W${i + 1}`,
        workouts: 0,
        index: i,
      }));

      sorted.forEach((item) => {
        const d = new Date(item.date);
        const binIndex = Math.floor((d.getTime() - start.getTime()) / weekMs);
        const clamped = Math.max(0, Math.min(maxBins - 1, binIndex));
        bins[clamped].workouts += item.workouts || 0;
      });

      const lastNonZero = [...bins].reverse().findIndex((b) => b.workouts > 0);
      const keepCount = lastNonZero === -1 ? 0 : bins.length - lastNonZero;

      this.workoutFrequencyData = {
        labels: keepCount ? bins.slice(0, keepCount).map((b) => b.label) : [],
        values: keepCount ? bins.slice(0, keepCount).map((b) => b.workouts) : [],
      };
      return;
    }

    this.workoutFrequencyData = {
      labels: sorted.map((item) => this.formatDateLabel(item.date)),
      values: sorted.map((item) => item.workouts || 0),
    };
  }

  private calculateConsistency(trends: Array<{ workouts: number }>): number {
    if (!trends.length) return 0;
    const activeDays = trends.filter((day) => (day.workouts || 0) > 0).length;
    return Math.round((activeDays / trends.length) * 100);
  }

  private calculateStreaks(trends: Array<{ date: string; workouts: number }>): void {
    if (!trends.length) {
      this.currentStreak = 0;
      this.bestStreak = 0;
      return;
    }

    const sorted = [...trends].sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    let best = 0;

    for (const day of sorted) {
      if ((day.workouts || 0) > 0) {
        running += 1;
        if (running > best) best = running;
      } else {
        running = 0;
      }
    }

    let current = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if ((sorted[i].workouts || 0) > 0) current += 1;
      else break;
    }

    this.currentStreak = current;
    this.bestStreak = best;
  }

  private calculateTrendPercentage(currentTotal: number, previousTotal: number): number {
    if (previousTotal <= 0) {
      return currentTotal > 0 ? 100 : 0;
    }
    return Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
  }

  private getDateRange(range: 'week' | 'month' | 'year', isPreviousPeriod: boolean): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    if (range === 'week') {
      startDate.setDate(endDate.getDate() - 6);
      if (isPreviousPeriod) {
        endDate.setDate(endDate.getDate() - 7);
        startDate.setDate(startDate.getDate() - 7);
      }
    } else if (range === 'month') {
      startDate.setDate(endDate.getDate() - 29);
      if (isPreviousPeriod) {
        endDate.setDate(endDate.getDate() - 30);
        startDate.setDate(startDate.getDate() - 30);
      }
    } else {
      startDate.setFullYear(endDate.getFullYear() - 1);
      startDate.setDate(startDate.getDate() + 1);
      if (isPreviousPeriod) {
        endDate.setFullYear(endDate.getFullYear() - 1);
        startDate.setFullYear(startDate.getFullYear() - 1);
      }
    }

    return { startDate, endDate };
  }

  private formatDateLabel(rawDate: string): string {
    const date = new Date(rawDate);
    if (this.timeRange === 'week') {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    }
    if (this.timeRange === 'month') {
      return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    }
    return date.toLocaleDateString(undefined, { month: 'short' });
  }

  exportPDF() {
    const currentRange = this.getDateRange(this.timeRange, false);
    this.analyticsService.exportPDF(currentRange.startDate, currentRange.endDate).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'analytics-report.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.error = 'Unable to export report right now.';
      }
    });
  }

  getChartBarHeight(value: number, max: number): number {
    if (!max) return 0;
    return (value / max) * 100;
  }

  get maxChartValue(): number {
    return Math.max(...this.workoutFrequencyData.values, 1);
  }

  get hasWorkoutChartActivity(): boolean {
    return this.workoutFrequencyData.values.some((v) => (v || 0) > 0);
  }

  shouldShowLabel(index: number): boolean {
    if (this.workoutFrequencyData.labels.length <= 14) return true;

    if (this.timeRange === 'week') return true;
    return index % 3 === 0 || index === this.workoutFrequencyData.labels.length - 1;
  }
}