import { Router } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import PDFDocument from 'pdfkit';

const router = Router();
const analyticsService = new AnalyticsService();

router.use(authMiddleware);

// Dashboard
router.get('/dashboard', async (req: AuthRequest, res): Promise<void> => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const dashboard = await analyticsService.getDashboard(req.userId!, startDate, endDate);
    res.status(200).json(dashboard);
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// Export Analytics PDF (uses the same dashboard data as the UI)
router.get('/export', async (req: AuthRequest, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const safeStart = startDate && !isNaN(startDate.getTime()) ? startDate : undefined;
    const safeEnd = endDate && !isNaN(endDate.getTime()) ? endDate : undefined;

    const dashboard = await analyticsService.getDashboard(req.userId!, safeStart, safeEnd);
    const sortedTrends = [...(dashboard.weeklyTrends || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Derived metrics for a nicer PDF "hero" section.
    const totalTrendPoints = sortedTrends.length || 0;
    const activeDays = sortedTrends.filter((d) => (d.workouts || 0) > 0).length;
    const consistency = totalTrendPoints ? Math.round((activeDays / totalTrendPoints) * 100) : 0;

    let bestStreak = 0;
    let running = 0;
    for (const day of sortedTrends) {
      if ((day.workouts || 0) > 0) {
        running += 1;
        bestStreak = Math.max(bestStreak, running);
      } else {
        running = 0;
      }
    }

    let currentStreak = 0;
    for (let i = sortedTrends.length - 1; i >= 0; i--) {
      if ((sortedTrends[i].workouts || 0) > 0) currentStreak += 1;
      else break;
    }

    // Trend vs previous period (same duration as the current request range)
    const currentStart = safeStart || (sortedTrends[0] ? new Date(sortedTrends[0].date) : undefined);
    const currentEnd = safeEnd || (sortedTrends[sortedTrends.length - 1] ? new Date(sortedTrends[sortedTrends.length - 1].date) : undefined);

    let trendPercentage = 0;
    if (currentStart && currentEnd) {
      const rangeMs = currentEnd.getTime() - currentStart.getTime();
      const previousStart = new Date(currentStart.getTime() - rangeMs);
      const previousEnd = new Date(currentStart.getTime());

      const previousDashboard = await analyticsService.getDashboard(req.userId!, previousStart, previousEnd);
      const prevTotal = previousDashboard.totalWorkouts || 0;
      const curTotal = dashboard.totalWorkouts || 0;
      trendPercentage = prevTotal <= 0 ? (curTotal > 0 ? 100 : 0) : Math.round(((curTotal - prevTotal) / prevTotal) * 100);
    }

    const doc = new PDFDocument({ margin: 48 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.pdf');

    doc.pipe(res);

    doc.fontSize(20).text('FitNova Analytics Report', { align: 'center' });
    doc.moveDown();

    const startLabel = safeStart ? safeStart.toISOString().slice(0, 10) : '...';
    const endLabel = safeEnd ? safeEnd.toISOString().slice(0, 10) : '...';
    doc.fontSize(12).text(`Date Range: ${startLabel} - ${endLabel}`);
    doc.moveDown(0.5);

    doc.fontSize(14).text('Summary');
    doc.fontSize(12);
    doc.text(`Workouts: ${dashboard.totalWorkouts}`);
    doc.text(`Total Duration: ${dashboard.totalDuration} minutes`);
    doc.text(`Total Calories: ${dashboard.totalCalories}`);
    doc.text(`Average Workout Duration: ${dashboard.averageDuration} minutes`);
    doc.moveDown(0.75);

    doc.fontSize(14).text('Performance');
    doc.fontSize(12);
    doc.text(`Current Streak: ${currentStreak} day(s)`);
    doc.text(`Best Streak: ${bestStreak} day(s)`);
    doc.text(`Consistency: ${consistency}%`);
    doc.text(`Trend: ${trendPercentage >= 0 ? '↑' : '↓'} ${Math.abs(trendPercentage)}%`);
    doc.moveDown(0.75);

    doc.fontSize(14).text('Macros (from Nutrition Logs)');
    doc.fontSize(12);
    doc.text(`Protein: ${dashboard.macroBreakdown.protein} g`);
    doc.text(`Carbohydrates: ${dashboard.macroBreakdown.carbohydrates} g`);
    doc.text(`Fats: ${dashboard.macroBreakdown.fats} g`);
    doc.moveDown(0.75);

    doc.fontSize(14).text('Goals Progress (Active Goals)');
    doc.fontSize(12);
    if (!dashboard.goals?.length) {
      doc.text('No active goals found for this period.');
    } else {
      dashboard.goals.forEach((g, idx) => {
        doc.text(`${idx + 1}. ${g.name}: ${g.progress}% (Target: ${g.target})`);
      });
    }

    doc.moveDown();
    doc.fontSize(9).fillColor('#777777').text(`Generated at ${new Date().toISOString()}`);
    doc.end();
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;