
import { User, Group, Deed, ProgressLog, WorshipType, MetricType, Recurrence } from '../types';

const STORAGE_KEY = 'mousabaqah_data';

interface AppData {
  currentUser: User | null;
  groups: Group[];
  deeds: Deed[];
  logs: ProgressLog[];
}

const INITIAL_DATA: AppData = {
  currentUser: {
    id: 'user_1',
    name: 'عبدالله محمد',
    timezone: 'Asia/Riyadh'
  },
  groups: [
    {
      id: 'group_1',
      name: 'عائلة آل محمد',
      adminId: 'user_1',
      cutoffTime: '00:00',
      gracePeriodHours: 6,
      visibility: 'private'
    }
  ],
  deeds: [
    {
      id: 'deed_1',
      userId: 'user_1',
      groupId: 'group_1',
      worshipType: WorshipType.BODY,
      name: 'الصلوات الخمس',
      metricType: MetricType.COUNT,
      target: 5,
      recurrence: Recurrence.DAILY,
      isCounterMode: false,
      privacyLevel: 'ratio'
    },
    {
      id: 'deed_2',
      userId: 'user_1',
      groupId: 'group_1',
      worshipType: WorshipType.TONGUE,
      name: 'أذكار الصباح',
      metricType: MetricType.BINARY,
      target: 1,
      recurrence: Recurrence.DAILY,
      isCounterMode: false,
      privacyLevel: 'ratio'
    },
    {
        id: 'deed_3',
        userId: 'user_1',
        groupId: 'group_1',
        worshipType: WorshipType.TONGUE,
        name: 'قراءة القرآن',
        metricType: MetricType.DUAL,
        target: 10,
        targetSecondary: 30,
        recurrence: Recurrence.DAILY,
        isCounterMode: false,
        privacyLevel: 'ratio'
      }
  ],
  logs: []
};

export const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : INITIAL_DATA;
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getTodayStr = (timezone: string = 'Asia/Riyadh') => {
  return new Date().toLocaleDateString('en-CA', { timeZone: timezone });
};

export const getYesterdayStr = (timezone: string = 'Asia/Riyadh') => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString('en-CA', { timeZone: timezone });
};
