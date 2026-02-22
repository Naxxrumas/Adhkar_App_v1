import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createGroup, joinGroup, leaveGroup, GroupCreateData } from '../../services/groups';
import { Users, Plus, ShieldCheck, Clock, LogOut, X } from 'lucide-react';

interface GroupManagerProps {
    groups: any[];
    refreshGroups: () => Promise<void>;
}

const GroupManager: React.FC<GroupManagerProps> = ({ groups, refreshGroups }) => {
    const { user } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [formData, setFormData] = useState<GroupCreateData>({
        name: '',
        description: '',
        visibilityMode: 'private',
        cutoffTime: '00:00'
    });
    const [leavingGroupId, setLeavingGroupId] = useState<string | null>(null);
    const [isLeavingLoading, setIsLeavingLoading] = useState(false);

    const handleLeaveGroup = async (groupId: string) => {
        if (!user) return;
        setIsLeavingLoading(true);
        try {
            await leaveGroup(user.id, groupId);
            setLeavingGroupId(null);
            await refreshGroups();
        } catch (error: any) {
            console.error('Failed to leave group', error);
            alert('فشل الخروج من المجموعة: ' + (error.message || 'خطأ غير معروف'));
        } finally {
            setIsLeavingLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("handleCreate clicked!", user);
        if (!user) {
            console.error("No user found in GroupManager handleCreate!");
            return;
        }
        try {
            console.log("Calling createGroup with data:", formData);
            await createGroup(user.id, formData);
            console.log("createGroup succeeded!");
            setIsCreating(false);
            await refreshGroups();
            alert('تم إنشاء المجموعة بنجاح!');
        } catch (error: any) {
            console.error("Failed to create group", error);
            alert('فشل إنشاء المجموعة: ' + (error.message || 'خطأ غير معروف'));
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !joinCode) return;
        try {
            await joinGroup(user.id, joinCode);
            setIsJoining(false);
            setJoinCode('');
            await refreshGroups();
            alert('تم الانضمام بنجاح!');
        } catch (error: any) {
            console.error("Failed to join group", error);
            alert('فشل الانضمام: ' + (error.message || 'خطأ غير معروف'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                        <Users size={24} />
                    </div>
                    <div className="text-right">
                        <h2 className="font-bold text-slate-800">مجموعاتي</h2>
                        <p className="text-xs text-slate-500">العائلات التي تشترك بها</p>
                    </div>
                </div>
                {!isCreating && !isJoining && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsJoining(true)}
                            className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-xs font-bold transition"
                        >
                            انضمام
                        </button>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                )}
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-4 text-right">
                    <h3 className="font-bold border-b pb-2 mb-4">إنشاء مجموعة جديدة</h3>

                    <div>
                        <label className="block text-xs font-medium mb-1 text-slate-500">اسم المجموعة (أو العائلة)</label>
                        <input
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white text-sm"
                            placeholder="عائلة القحطاني"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-1 text-slate-500">وصف المجموعة</label>
                        <input
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white text-sm"
                            placeholder="لنتعاون على البر والتقوى"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium mb-1 text-slate-500 flex items-center gap-1 justify-end"><ShieldCheck size={14} /> الظهور</label>
                            <select
                                value={formData.visibilityMode}
                                onChange={e => setFormData({ ...formData, visibilityMode: e.target.value as any })}
                                className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
                            >
                                <option value="private">خاصة (عائلية)</option>
                                <option value="public-approval">عامة (بموافقة)</option>
                                <option value="public-open">عامة (مفتوحة)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1 text-slate-500 flex items-center gap-1 justify-end"><Clock size={14} /> وقت قفل اليوم</label>
                            <input
                                type="time"
                                value={formData.cutoffTime}
                                onChange={e => setFormData({ ...formData, cutoffTime: e.target.value })}
                                className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold transition">إنشاء</button>
                        <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-bold transition">إلغاء</button>
                    </div>
                </form>
            )}

            {isJoining && (
                <form onSubmit={handleJoin} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-4 text-right">
                    <h3 className="font-bold border-b pb-2 mb-4">الانضمام لمجموعة</h3>
                    <div>
                        <label className="block text-xs font-medium mb-1 text-slate-500">رمز الانضمام (معرف المجموعة)</label>
                        <input
                            required
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white text-sm"
                            placeholder="مثال: group_xyz"
                            dir="ltr"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold transition">تأكيد</button>
                        <button type="button" onClick={() => setIsJoining(false)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-bold transition">إلغاء</button>
                    </div>
                </form>
            )}

            <div className="grid gap-3">
                {groups.map(g => (
                    <div key={g.id || g.name} className="bg-white p-4 rounded-xl border border-slate-100 transition hover:border-emerald-200">
                        <div className="flex justify-between items-center">
                            <div className="text-right flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 truncate">{g.name}</h4>
                                <p className="text-xs text-slate-500">{g.visibilityMode === 'private' ? 'خاصة' : 'عامة'} • إقفال: {g.cutoffTime}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mr-3">
                                <Users size={16} />
                            </div>
                        </div>

                        {/* Leave group actions */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                            <div className="text-[10px] text-slate-400 truncate" dir="ltr">{g.id}</div>
                            {leavingGroupId === g.id ? (
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => handleLeaveGroup(g.id)}
                                        disabled={isLeavingLoading}
                                        className="px-3 py-1 bg-red-500 text-white text-[11px] font-bold rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                                    >
                                        {isLeavingLoading ? '...' : 'تأكيد الخروج'}
                                    </button>
                                    <button
                                        onClick={() => setLeavingGroupId(null)}
                                        className="px-2 py-1 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg transition text-[11px] font-medium"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setLeavingGroupId(g.id)}
                                    className="flex items-center gap-1 px-2 py-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-[11px]"
                                    title="الخروج من المجموعة"
                                >
                                    <LogOut size={13} />
                                    <span className="font-medium">خروج</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {groups.length === 0 && !isCreating && !isJoining && (
                    <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-2xl">
                        لا تنتمي لأي مجموعة حالياً.
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupManager;
