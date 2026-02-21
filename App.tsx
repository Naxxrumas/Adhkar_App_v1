
import React, { useState, useEffect, useMemo } from 'react';
import { loadData, saveData, getTodayStr, getYesterdayStr } from './services/storage';
import { User, Group, Deed, ProgressLog, WorshipType, MetricType, GroupMember } from './types';
import DeedCard from './components/DeedCard';
import GroupDashboard from './components/GroupDashboard';
import { generateEncouragement } from './services/gemini';
import { Layout, Home, Users, BarChart3, User as UserIcon, Plus, Settings, ShieldAlert, Sparkles, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState(loadData());
  const [activeTab, setActiveTab] = useState<'today' | 'group' | 'profile'>('today');
  const [encouragement, setEncouragement] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  const todayStr = getTodayStr(data.currentUser?.timezone);
  const yesterdayStr = getYesterdayStr(data.currentUser?.timezone);

  // Check Grace Period
  const activeGroup = data.groups[0]; // Simplified for MVP
  const isGraceWindow = useMemo(() => {
    if (!activeGroup) return false;
    const now = new Date();
    const [h, m] = activeGroup.cutoffTime.split(':').map(Number);
    const cutoff = new Date();
    cutoff.setHours(h, m, 0, 0);
    const diff = (now.getTime() - cutoff.getTime()) / (1000 * 60 * 60);
    return diff >= 0 && diff <= activeGroup.gracePeriodHours;
  }, [activeGroup]);

  // Derived State
  const todayLogs = data.logs.filter(l => l.date === todayStr);
  const yesterdayLogs = data.logs.filter(l => l.date === yesterdayStr);

  const myDeeds = data.deeds.filter(d => d.userId === data.currentUser?.id);

  const updateProgress = (deedId: string, value: number, valueSecondary?: number, dateStr: string = todayStr) => {
    setIsSyncing(true);
    const newData = { ...data };
    const logIndex = newData.logs.findIndex(l => l.deedId === deedId && l.date === dateStr);
    
    if (logIndex > -1) {
      newData.logs[logIndex] = {
        ...newData.logs[logIndex],
        value,
        valueSecondary,
        updatedAt: Date.now()
      };
    } else {
      newData.logs.push({
        id: `log_${Date.now()}`,
        deedId,
        date: dateStr,
        value,
        valueSecondary,
        updatedAt: Date.now()
      });
    }

    setData(newData);
    saveData(newData);
    setTimeout(() => setIsSyncing(false), 500);
  };

  useEffect(() => {
    const fetchEncouragement = async () => {
        if (activeTab === 'group') {
            const completed = data.logs.filter(l => l.date === todayStr && l.value > 0).length;
            const msg = await generateEncouragement({ 
                totalCompleted: completed, 
                totalMembers: 4 // Mocked for UI
            });
            setEncouragement(msg);
        }
    };
    fetchEncouragement();
  }, [activeTab, data.logs.length]);

  // Fix: Added missing groupId and explicitly typed the array to match (GroupMember & { user: User })[]
  const groupMembers: (GroupMember & { user: User })[] = [
    { groupId: activeGroup?.id || 'group_1', userId: 'user_1', role: 'admin', progressRatio: calculateUserRatio('user_1', todayStr), user: data.currentUser! },
    { groupId: activeGroup?.id || 'group_1', userId: 'user_2', role: 'member', progressRatio: 0.85, user: { id: 'user_2', name: 'سارة خالد', timezone: 'Asia/Riyadh' } },
    { groupId: activeGroup?.id || 'group_1', userId: 'user_3', role: 'member', progressRatio: 0.4, user: { id: 'user_3', name: 'فهد محمد', timezone: 'Asia/Riyadh' } },
    { groupId: activeGroup?.id || 'group_1', userId: 'user_4', role: 'member', progressRatio: 1.0, user: { id: 'user_4', name: 'نورة عبدالله', timezone: 'Asia/Riyadh' } },
  ];

  function calculateUserRatio(userId: string, date: string) {
    const userDeeds = data.deeds.filter(d => d.userId === userId);
    if (userDeeds.length === 0) return 0;
    
    let totalProgress = 0;
    userDeeds.forEach(d => {
      const log = data.logs.find(l => l.deedId === d.id && l.date === date);
      if (log) {
        totalProgress += Math.min(1, log.value / (d.target || 1));
      }
    });
    return totalProgress / userDeeds.length;
  }

  const unfinishedYesterdayDeeds = myDeeds.filter(d => {
      const log = yesterdayLogs.find(l => l.deedId === d.id);
      return !log || log.value < d.target;
  });

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-slate-50 flex flex-col pb-24 relative">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
                <Sparkles className="text-white" size={20} />
            </div>
            <div>
                <h1 className="text-lg font-black text-slate-800">مُسابقَة</h1>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Group Deeds</p>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            {isSyncing && <div className="text-[10px] text-slate-400 animate-pulse">جاري المزامنة...</div>}
            <button className="p-2 text-slate-400 hover:text-emerald-600"><Settings size={20} /></button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6">
        {activeTab === 'today' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Grace Period Alert */}
            {isGraceWindow && unfinishedYesterdayDeeds.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                  <Clock size={18} />
                  <span className="font-bold">فترة السماح (إغلاق الأمس)</span>
                </div>
                <p className="text-xs text-amber-600 mb-3">لديك {unfinishedYesterdayDeeds.length} أعمال متبقية من يوم أمس. يمكنك إكمالها الآن.</p>
                <div className="space-y-3">
                  {unfinishedYesterdayDeeds.map(deed => (
                    <DeedCard 
                      key={`yesterday-${deed.id}`}
                      deed={deed}
                      isGracePeriod
                      log={yesterdayLogs.find(l => l.deedId === deed.id)}
                      onUpdate={(v, sv) => updateProgress(deed.id, v, sv, yesterdayStr)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Today Header */}
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-slate-800">طاعة اليوم</h2>
                <p className="text-slate-500 text-sm">{new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <div className="text-left">
                 <span className="text-3xl font-black text-emerald-600">
                    {(calculateUserRatio(data.currentUser!.id, todayStr) * 100).toFixed(0)}%
                 </span>
                 <p className="text-[10px] text-slate-400 uppercase font-bold">نسبة الإنجاز</p>
              </div>
            </div>

            {/* Deeds List */}
            <div className="grid gap-4">
              {myDeeds.map(deed => (
                <DeedCard 
                  key={deed.id} 
                  deed={deed} 
                  log={todayLogs.find(l => l.deedId === deed.id)}
                  onUpdate={(v, sv) => updateProgress(deed.id, v, sv)}
                />
              ))}
              
              <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-all">
                <Plus size={20} />
                <span className="font-bold">إضافة عمل صالح جديد</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'group' && (
          <div className="animate-in slide-in-from-left duration-300">
            <GroupDashboard 
                group={activeGroup} 
                members={groupMembers} 
                encouragementMsg={encouragement}
            />
          </div>
        )}

        {activeTab === 'profile' && (
            <div className="p-8 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto flex items-center justify-center">
                    <UserIcon size={48} className="text-slate-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">{data.currentUser?.name}</h2>
                    <p className="text-slate-500">عضو منذ ٢٠٢٦</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-xs text-slate-400">سلسلة الإنجاز</p>
                        <p className="text-xl font-bold text-orange-500">٧ أيام 🔥</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-xs text-slate-400">أعمال تم تتبعها</p>
                        <p className="text-xl font-bold text-emerald-600">٤٣٢</p>
                    </div>
                </div>
                <button className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">تعديل الملف الشخصي</button>
                <button className="w-full py-3 text-red-500 font-bold">تسجيل الخروج</button>
            </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3 pb-6 flex justify-around items-center z-30 max-w-lg mx-auto shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'today' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <Home size={24} strokeWidth={activeTab === 'today' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">اليوم</span>
        </button>
        <button 
          onClick={() => setActiveTab('group')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'group' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <Users size={24} strokeWidth={activeTab === 'group' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">العائلة</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <UserIcon size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">حسابي</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
