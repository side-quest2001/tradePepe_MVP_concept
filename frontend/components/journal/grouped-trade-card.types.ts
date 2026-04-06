import { OrderExecution } from '@/lib/api/types';

export type MetricTone = 'success' | 'danger';

export type MetricItem = {
  label: string;
  value: string;
  tone?: MetricTone;
  subValue?: string;
};

export type GroupedTradeRow = {
  id: string;
  left?: OrderExecution;
  right?: OrderExecution;
  result: number;
};

export type GroupedTradeMetrics = {
  left: MetricItem[];
  center: {
    value: string;
    tone: MetricTone;
  };
  right: MetricItem[];
};
