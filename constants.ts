
import { WorshipType, MetricType, Recurrence } from './types';

export const WORSHIP_TYPE_LABELS: Record<WorshipType, string> = {
  [WorshipType.HEART]: 'عبادة قلب',
  [WorshipType.TONGUE]: 'عبادة لسان',
  [WorshipType.BODY]: 'عبادة بدن'
};

export const WORSHIP_TYPE_COLORS: Record<WorshipType, string> = {
  [WorshipType.HEART]: 'bg-pink-100 text-pink-700 border-pink-200',
  [WorshipType.TONGUE]: 'bg-blue-100 text-blue-700 border-blue-200',
  [WorshipType.BODY]: 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

export const DEED_TEMPLATES = [
  { name: 'الإخلاص', type: WorshipType.HEART, metric: MetricType.BINARY },
  { name: 'أذكار الصباح', type: WorshipType.TONGUE, metric: MetricType.BINARY },
  { name: 'أذكار المساء', type: WorshipType.TONGUE, metric: MetricType.BINARY },
  { name: 'تلاوة القرآن', type: WorshipType.TONGUE, metric: MetricType.DUAL },
  { name: 'الاستغفار', type: WorshipType.TONGUE, metric: MetricType.COUNT, target: 100 },
  { name: 'الصلوات الخمس', type: WorshipType.BODY, metric: MetricType.COUNT, target: 5 },
  { name: 'الوتر', type: WorshipType.BODY, metric: MetricType.BINARY },
  { name: 'الضحى', type: WorshipType.BODY, metric: MetricType.BINARY },
  { name: 'بر الوالدين', type: WorshipType.BODY, metric: MetricType.BINARY }
];

export const APP_PRIMARY_COLOR = '#059669'; // Emerald 600
