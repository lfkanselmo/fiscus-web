import type { EChartsOption } from 'echarts';

import { formatMonthShortLabel } from '../../core/utils/month-value';
import { formatCents } from '../../core/utils/currency';
import { ChartTheme } from '../../core/utils/css-theme';
import { MonthlyCategoryMetric } from '../../core/models/monthly-metric.model';
import { MonthlyTrendPoint } from '../../core/models/monthly-trend.model';

export function buildCategoryChartOptions(
  metrics: MonthlyCategoryMetric[],
  theme: ChartTheme,
): EChartsOption {
  const ordered = [...metrics].reverse();
  return {
    grid: { left: 140, right: 32, top: 8, bottom: 8 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: theme.surface,
      borderColor: theme.border,
      textStyle: { color: theme.ink },
      valueFormatter: (value) => formatCents(Number(value) * 100),
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: theme.mutedInk, formatter: (value: number) => formatCents(value * 100) },
      axisLine: { lineStyle: { color: theme.border } },
      splitLine: { lineStyle: { color: theme.border } },
    },
    yAxis: {
      type: 'category',
      data: ordered.map((metric) => metric.category.name),
      axisLabel: { color: theme.mutedInk },
      axisLine: { lineStyle: { color: theme.border } },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        barWidth: 16,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        data: ordered.map((metric) => ({
          value: metric.total_cents / 100,
          itemStyle: { color: metric.category.color_hex },
        })),
      },
    ],
  };
}

export function buildTrendChartOptions(
  trend: MonthlyTrendPoint[],
  theme: ChartTheme,
): EChartsOption {
  return {
    grid: { left: 64, right: 24, top: 20, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.surface,
      borderColor: theme.border,
      textStyle: { color: theme.ink },
      valueFormatter: (value) => formatCents(Number(value) * 100),
    },
    xAxis: {
      type: 'category',
      data: trend.map((point) => formatMonthShortLabel(point.year, point.month)),
      axisLabel: { color: theme.mutedInk },
      axisLine: { lineStyle: { color: theme.border } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: theme.mutedInk, formatter: (value: number) => formatCents(value * 100) },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: theme.border } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbolSize: 8,
        lineStyle: { color: theme.brand, width: 2 },
        itemStyle: { color: theme.brand },
        areaStyle: { color: theme.brand, opacity: 0.12 },
        data: trend.map((point) => point.total_cents / 100),
      },
    ],
  };
}
