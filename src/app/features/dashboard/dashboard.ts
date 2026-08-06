import { Component, computed, inject, signal } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { MetricsService } from '../../core/services/metrics.service';
import { MonthlyCategoryMetric } from '../../core/models/monthly-metric.model';
import { MonthlyTrendPoint } from '../../core/models/monthly-trend.model';
import { currentMonthValue, parseMonthValue } from '../../core/utils/month-value';
import { readChartTheme } from '../../core/utils/css-theme';
import { MonthPicker } from '../../shared/components/month-picker/month-picker';
import { buildCategoryChartOptions, buildTrendChartOptions } from './chart-options';

const TREND_MONTHS = 6;

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'app-dashboard',
  imports: [NgxEchartsDirective, MonthPicker],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly metricsService = inject(MetricsService);

  readonly selectedMonth = signal(currentMonthValue());
  readonly monthlyMetrics = signal<MonthlyCategoryMetric[]>([]);
  readonly monthlyTrend = signal<MonthlyTrendPoint[]>([]);

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
  }
}
