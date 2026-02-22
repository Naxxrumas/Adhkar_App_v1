import React, { useState, useEffect, useMemo } from 'react';
import { getTodayStr, getYesterdayStr } from '../../../services/storage'; // Reusing simple date helpers
import { User, GroupMember, Deed, ProgressLog } from '../../../types';
import DeedCard from '../../../components/DeedCard';
import GroupDashboard from '../../../components/GroupDashboard';
import GroupManager from '../groups/GroupManager';
import DeedManager from '../deeds/DeedManager';
import { generateEncouragement } from '../../../services/gemini';
import { Layout, Home, Users, BarChart3, User as UserIcon, Settings, Sparkles, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import { getUserDeeds, deleteDeed } from '../../services/deeds';
import { getDailyLogs, logProgress } from '../../services/logs';
import { updateUserProfileData } from '../../services/user';
import { getGroupDashboardData } from '../../services/groups';
import ThemePicker from '../settings/ThemePicker';

const Dashboard: React.FC = () => {
    const { user, signOut, userProfile } = useAuth();
    const { groups, activeGroup, refreshGroups } = useGroups();

    // State
    const [activeTab, setActiveTab] = useState<'today' | 'group' | 'profile'>('today');
    const [encouragement, setEncouragement] = useState<string>('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileName, setProfileName] = useState(user?.user_metadata?.full_name || '');

    useEffect(() => {
        if (userProfile?.displayName) setProfileName(userProfile.displayName);
        else if (user?.user_metadata?.full_name) setProfileName(user.user_metadata.full_name);
    }, [userProfile, user]);
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
    const [isLoadingGroup, setIsLoadingGroup] = useState(false);

    // The group currently being viewed in the family tab
    const selectedGroupForTab = groups.length > 0 ? groups[Math.min(selectedGroupIndex, groups.length - 1)] : null;

    // Data State
    const [deeds, setDeeds] = useState<Deed[]>([]);
    const [todayLogs, setTodayLogs] = useState<ProgressLog[]>([]);
    const [yesterdayLogs, setYesterdayLogs] = useState<ProgressLog[]>([]);
    const [groupMembers, setGroupMembers] = useState<(GroupMember & { user: User })[]>([]);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const todayStr = getTodayStr(timezone);
    const yesterdayStr = getYesterdayStr(timezone);

    const fetchData = async () => {
        if (!user) return;
        try {
            const fetchedDeeds = await getUserDeeds(user.id);
            setDeeds(fetchedDeeds);
            const [tLogs, yLogs] = await Promise.all([
                getDailyLogs(user.id, todayStr),
                getDailyLogs(user.id, yesterdayStr)
            ]);
            setTodayLogs(tLogs);
            setYesterdayLogs(yLogs);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, todayStr]);

    // Check Grace Period
    const isGraceWindow = useMemo(() => {
        if (!activeGroup) return false;
        const now = new Date();
        const [h, m] = activeGroup.cutoffTime.split(':').map(Number);
        const cutoff = new Date();
        cutoff.setHours(h, m, 0, 0);
        const diff = (now.getTime() - cutoff.getTime()) / (1000 * 60 * 60);
        return diff >= 0 && diff <= (activeGroup.gracePeriodHours || 6); // Grace period
    }, [activeGroup]);

    const updateProgress = async (deedId: string, value: number, valueSecondary?: number, subValues?: Record<string, number>, dateStr: string = todayStr) => {
        if (!user) return;
        setIsSyncing(true);

        // Optimistic Update
        const targetLogs = dateStr === todayStr ? todayLogs : yesterdayLogs;
        const setTargetLogs = dateStr === todayStr ? setTodayLogs : setYesterdayLogs;

        const existingIdx = targetLogs.findIndex(l => l.deedId === deedId);
        const newLogs = [...targetLogs];
        const newLogMock = { id: 'temp', deedId, date: dateStr, value, valueSecondary, subValues, updatedAt: Date.now() };

        if (existingIdx > -1) {
            newLogs[existingIdx] = { ...newLogs[existingIdx], value, valueSecondary, subValues };
        } else {
            newLogs.push(newLogMock);
        }
        setTargetLogs(newLogs);

        try {
            await logProgress(user.id, activeGroup?.id || 'personal', deedId, dateStr, value, valueSecondary, subValues);
        } catch (error) {
            console.error("Failed to sync log", error);
            await fetchData(); // rollback
        } finally {
            setTimeout(() => setIsSyncing(false), 500);
        }
    };

    const handleDeleteDeed = async (deedId: string) => {
        if (!user) return;
        try {
            await deleteDeed(user.id, deedId);
            await fetchData();
        } catch (error: any) {
            console.error('Failed to delete deed', error);
            alert('فشل حذف العمل: ' + (error.message || 'خطأ غير معروف'));
        }
    };

    useEffect(() => {
        const fetchEncouragement = async () => {
            if (activeTab === 'group' && todayLogs.length > 0) {
                const completed = todayLogs.filter(l => l.value > 0).length;
                const msg = await generateEncouragement({
                    totalCompleted: completed,
                    totalMembers: groupMembers.length || 1
                });
                setEncouragement(msg);
            }
        };
        fetchEncouragement();
    }, [activeTab, todayLogs.length, groupMembers.length]);

    useEffect(() => {
        const fetchGroupData = async () => {
            if (activeTab === 'group' && selectedGroupForTab) {
                setIsLoadingGroup(true);
                try {
                    const members = await getGroupDashboardData(selectedGroupForTab.id, todayStr);
                    setGroupMembers(members as any);
                } catch (e) {
                    console.error("Failed to fetch group data", e);
                    setGroupMembers([]);
                } finally {
                    setIsLoadingGroup(false);
                }
            }
        };
        fetchGroupData();
    }, [activeTab, selectedGroupForTab?.id, todayStr]);

    const switchGroup = (direction: 'next' | 'prev') => {
        if (groups.length <= 1) return;
        setSelectedGroupIndex(prev => {
            if (direction === 'next') return (prev + 1) % groups.length;
            return (prev - 1 + groups.length) % groups.length;
        });
    };

    function calculateUserRatio(userDeeds: Deed[], userLogs: ProgressLog[]) {
        if (userDeeds.length === 0) return 0;
        let totalProgress = 0;
        userDeeds.forEach(d => {
            const log = userLogs.find(l => l.deedId === d.id);
            if (log) {
                totalProgress += Math.min(1, log.value / (d.target || 1));
            }
        });
        return totalProgress / userDeeds.length;
    }

    const unfinishedYesterdayDeeds = deeds.filter(d => {
        const log = yesterdayLogs.find(l => l.deedId === d.id);
        return !log || log.value < d.target;
    });

    return (
        <div className="max-w-lg mx-auto min-h-screen bg-slate-50 flex flex-col pb-24 relative" dir="rtl">
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

            <main className="flex-1 p-4 space-y-6">
                {activeTab === 'today' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {isGraceWindow && unfinishedYesterdayDeeds.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                                <div className="flex items-center gap-2 text-amber-800 mb-2">
                                    <Clock size={18} />
                                    <span className="font-bold">فترة السماح (إغلاق الأمس)</span>
                                </div>
                                <p className="text-xs text-amber-600 mb-3">لديك {unfinishedYesterdayDeeds.length} أعمال متبقية من يوم أمس. يمكنك إكمالها الآن قبل الإغلاق التام.</p>
                                <div className="space-y-3">
                                    {unfinishedYesterdayDeeds.map(deed => (
                                        <DeedCard
                                            key={`yesterday-${deed.id}`}
                                            deed={deed}
                                            isGracePeriod
                                            log={yesterdayLogs.find(l => l.deedId === deed.id)}
                                            onUpdate={(v, sv, subVals) => updateProgress(deed.id, v, sv, subVals, yesterdayStr)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">طاعة اليوم</h2>
                                <p className="text-slate-500 text-sm">{new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>
                            <div className="text-left">
                                <span className="text-3xl font-black text-emerald-600">
                                    {(calculateUserRatio(deeds, todayLogs) * 100).toFixed(0)}%
                                </span>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">نسبة الإنجاز</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {deeds.length === 0 && (
                                <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 shadow-sm text-sm">
                                    ليس لديك أي أعمال مضافة بعد، أضف عملك الأول لتبدأ.
                                </div>
                            )}

                            {deeds.map(deed => (
                                <DeedCard
                                    key={deed.id}
                                    deed={deed}
                                    log={todayLogs.find(l => l.deedId === deed.id)}
                                    onUpdate={(v, sv, subVals) => updateProgress(deed.id, v, sv, subVals)}
                                    onDelete={handleDeleteDeed}
                                />
                            ))}

                            <DeedManager onDeedAdded={fetchData} />
                        </div>
                    </div>
                )}

                {activeTab === 'group' && (
                    <div className="animate-in slide-in-from-left duration-300 space-y-4">
                        {groups.length > 0 ? (
                            <>
                                {/* Group Switcher */}
                                {groups.length > 1 && (
                                    <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                                        <div className="flex items-center justify-between gap-2">
                                            <button
                                                onClick={() => switchGroup('next')}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                                            >
                                                <ChevronRight size={20} />
                                            </button>

                                            <div className="flex-1 overflow-x-auto scrollbar-hide">
                                                <div className="flex gap-2 justify-center">
                                                    {groups.map((g: any, idx: number) => (
                                                        <button
                                                            key={g.id}
                                                            onClick={() => setSelectedGroupIndex(idx)}
                                                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${idx === selectedGroupIndex
                                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            {g.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => switchGroup('prev')}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                        </div>
                                        <p className="text-center text-[10px] text-slate-400 mt-1">
                                            {selectedGroupIndex + 1} من {groups.length} مجموعات
                                        </p>
                                    </div>
                                )}

                                {/* Loading State */}
                                {isLoadingGroup ? (
                                    <div className="text-center py-12">
                                        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
                                        <p className="text-sm text-slate-400">جاري تحميل بيانات المجموعة...</p>
                                    </div>
                                ) : selectedGroupForTab ? (
                                    <GroupDashboard
                                        group={selectedGroupForTab}
                                        members={groupMembers}
                                        encouragementMsg={encouragement}
                                    />
                                ) : null}
                            </>
                        ) : (
                            <div className="text-center py-12 text-slate-500 text-sm bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                <Users size={40} className="mx-auto mb-3 text-slate-300" />
                                <p className="mb-4">يرجى إنشاء مجموعة أو الانضمام لمجموعة أولاً لترى إنجاز العائلة هنا.</p>
                                <button onClick={() => setActiveTab('profile')} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-bold">الذهاب لمجموعاتي</button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="p-4 space-y-6 text-right">
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-2">
                            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                                {userProfile?.photoUrl || user?.user_metadata?.avatar_url ? <img src={userProfile?.photoUrl || user?.user_metadata?.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon size={32} className="text-slate-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-slate-800">{userProfile?.displayName || user?.user_metadata?.full_name || user?.phone || 'المستخدم'}</h2>
                                <p className="text-slate-500 text-sm">عضو نشط</p>
                                {userProfile?.email && (
                                    <p className="text-xs text-slate-400 mt-1 truncate" dir="ltr">📧 {userProfile.email}</p>
                                )}
                                {userProfile?.phoneNumber && (
                                    <p className="text-xs text-slate-400 mt-0.5" dir="ltr">📱 {userProfile.phoneNumber}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                                <p className="text-xs text-slate-400">سلسلة الإنجاز</p>
                                <p className="text-xl font-bold text-orange-500">٧ أيام 🔥</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                                <p className="text-xs text-slate-400">كافة الإنجازات</p>
                                <p className="text-xl font-bold text-emerald-600">{deeds.length} عمل</p>
                            </div>
                        </div>

                        <ThemePicker />

                        <div className="mt-6">
                            <GroupManager groups={groups} refreshGroups={refreshGroups} />
                        </div>

                        <div className="pt-6 space-y-3">
                            {isEditingProfile ? (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-3 animate-in fade-in">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">الاسم</label>
                                        <input
                                            value={profileName}
                                            onChange={e => setProfileName(e.target.value)}
                                            className="w-full p-2 border rounded-lg focus:bg-white text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={async () => {
                                                if (user && profileName) {
                                                    await updateUserProfileData(user, { displayName: profileName });
                                                    alert('تم التحديث بنجاح! قد تحتاج لتحديث الصفحة لترى التغيير في كل مكان.');
                                                    setIsEditingProfile(false);
                                                }
                                            }}
                                            className="flex-1 bg-emerald-600 text-white rounded-lg py-2 font-bold text-sm"
                                        >
                                            حفظ
                                        </button>
                                        <button
                                            onClick={() => setIsEditingProfile(false)}
                                            className="flex-1 bg-slate-100 text-slate-600 rounded-lg py-2 font-bold text-sm"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditingProfile(true)} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">تعديل الملف الشخصي</button>
                            )}
                            <button onClick={signOut} className="w-full py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition">تسجيل الخروج</button>
                        </div>
                    </div>
                )}
            </main>

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

export default Dashboard;
