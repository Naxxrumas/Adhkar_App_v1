
export enum WorshipType {
  HEART = 'HEART',           // عبادة قلب
  TONGUE = 'TONGUE',         // عبادة لسان
  BODY = 'BODY',             // عبادة بدن
  COMPREHENSIVE = 'COMPREHENSIVE' // عبادة شاملة/متكاملة
}

export enum MetricType {
  BINARY = 'BINARY',     // تم/لم يتم
  COUNT = 'COUNT',       // عدد
  PAGES = 'PAGES',       // صفحات
  MINUTES = 'MINUTES',   // دقائق
  DUAL = 'DUAL'          // صفحات + دقائق (قرآن)
}

export enum Recurrence {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  SPECIFIC_DAYS = 'SPECIFIC_DAYS'
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  timezone: string;
}

export interface SubItem {
  id: string; // unique ID for sub-item (could be index or hash)
  text: string;
  target: number;
}

export interface Deed {
  id: string;
  userId: string;
  groupId: string;
  worshipType: WorshipType;
  name: string;
  description?: string;
  metricType: MetricType;
  target: number;
  targetSecondary?: number; // For DUAL type
  recurrence: Recurrence;
  isCounterMode: boolean;
  privacyLevel: 'hidden' | 'ratio' | 'details';
  subItems?: SubItem[]; // For complex deeds like Adhkar
}

export interface ProgressLog {
  id: string;
  deedId: string;
  date: string; // YYYY-MM-DD
  value: number;
  valueSecondary?: number;
  subValues?: Record<string, number>; // Used for tracking SubItem progress (id -> current count)
  updatedAt: number;
}

export interface Group {
  id: string;
  name: string;
  adminId: string;
  cutoffTime: string; // HH:mm
  gracePeriodHours: number;
  visibility: 'private' | 'public_approval' | 'public_open';
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  progressRatio: number; // For the dashboard
}
