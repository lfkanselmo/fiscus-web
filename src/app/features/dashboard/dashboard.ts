import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { MetricsService } from '../../core/services/metrics.service';
import { BudgetStatus } from '../../core/models/budget-status.model';
import { MonthlyCategoryMetric } from '../../core/models/monthly-metric.model';
import { MonthlyTrendPoint } from '../../core/models/monthly-trend.model';
import { currentMonthValue, parseMonthValue } from '../../core/utils/month-value';
import { readChartTheme } from '../../core/utils/css-theme';
import { BudgetBar } from '../../shared/components/budget-bar/budget-bar';
import { MonthPicker } from '../../shared/components/month-picker/month-picker';
import { buildCategoryChartOptions, buildTrendChartOptions } from './chart-options';

const TREND_MONTHS = 6;

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'app-dashboard',
  imports: [NgxEchartsDirective, MonthPicker, BudgetBar],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly metricsService = inject(MetricsService);

  readonly selectedMonth = signal(currentMonthValue());
  readonly monthlyMetrics = signal<MonthlyCategoryMetric[]>([]);
  readonly monthlyTrend = signal<MonthlyTrendPoint[]>([]);
  readonly budgetStatuses = signal<BudgetStatus[]>([]);

  readonly categoryChartOptions = computed(() =>
    buildCategoryChartOptions(this.monthlyMetrics(), readChartTheme()),
  );

  readonly trendChartOptions = computed(() =>
    buildTrendChartOptions(this.monthlyTrend(), readChartTheme()),
  );

  constructor() {
    this.reload();
    this.metricsService.trend(TREND_MONTHS).subscribe((trend) => this.monthlyTrend.set(trend));
  }

  onMonthChange(value: string): void {
    this.selectedMonth.set(value);
    this.reload();
  }

  private reload(): void {
    const { year, month } = parseMonthValue(this.selectedMonth());
    this.metricsService
      .monthly(year, month)
      .subscribe((metrics) => this.monthlyMetrics.set(metrics));
    this.metricsService
      .budgets(year, month)
      .subscribe((statuses) => this.budgetStatuses.set(statuses));
  }
}
