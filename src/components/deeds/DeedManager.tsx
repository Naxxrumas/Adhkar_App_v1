import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import { createDeed, getDeedPresets } from '../../services/deeds';
import { Deed, Recurrence, WorshipType, MetricType } from '../../../types';
import { Plus } from 'lucide-react';

interface DeedManagerProps {
    onDeedAdded: () => Promise<void>;
}

const DeedManager: React.FC<DeedManagerProps> = ({ onDeedAdded }) => {
    const { user } = useAuth();
    const { activeGroup } = useGroups();
    const [isAdding, setIsAdding] = useState(false);
    const [mode, setMode] = useState<'preset' | 'custom'>('preset');

    const presets = getDeedPresets();

    const [formData, setFormData] = useState<Omit<Deed, 'id' | 'userId' | 'groupId'>>({
        name: '',
        worshipType: WorshipType.BODY,
        metricType: MetricType.COUNT,
        target: 1,
        recurrence: Recurrence.DAILY,
        isCounterMode: false,
        privacyLevel: 'ratio'
    });

    const handleCreate = async (e?: React.FormEvent | null, preset?: Partial<Deed>) => {
        if (e) e.preventDefault();
        if (!user) return alert("يجب تسجيل الدخول أولاً");

        try {
            const groupId = activeGroup?.id || 'personal';
            const dataToSave = preset ? { ...formData, ...preset, groupId } : { ...formData, groupId };
            await createDeed(user.uid, dataToSave as any);
            setIsAdding(false);
            await onDeedAdded();
        } catch (error: any) {
            console.error("Failed to add deed", error);
            alert("فشل إضافة العمل: " + (error.message || 'خطأ غير معروف'));
        }
    };

    if (!isAdding) {
        return (
            <button
                onClick={() => setIsAdding(true)}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-all"
            >
                <Plus size={20} />
                <span className="font-bold">إضافة عمل صالح جديد</span>
            </button>
        );
    }

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4 text-right animate-in slide-in-from-top-4">
            <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold">إضافة عمل صالح {activeGroup ? `لـ (${activeGroup.name})` : ''}</h3>
            </div>

            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setMode('preset')} className={`flex-1 py-1.5 rounded-md text-sm font-bold transition ${mode === 'preset' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}>أعمال جاهزة</button>
                <button onClick={() => setMode('custom')} className={`flex-1 py-1.5 rounded-md text-sm font-bold transition ${mode === 'custom' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}>عمل مخصص</button>
            </div>

            {mode === 'preset' ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {presets.map((preset, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 hover:border-emerald-200 transition">
                            <div>
                                <p className="font-bold text-sm text-slate-800">{preset.name}</p>
                                <p className="text-xs text-slate-500">الهدف: {preset.target} • {preset.metricType === MetricType.BINARY ? 'إنجاز' : 'عدد'}</p>
                            </div>
                            <button onClick={() => handleCreate(null as any, preset)} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2 rounded-lg font-bold text-xs transition">
                                إضافة
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium mb-1 text-slate-500">الاسم</label>
                        <input
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:bg-white text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium mb-1 text-slate-500">نوع العبادة</label>
                            <select value={formData.worshipType} onChange={e => setFormData({ ...formData, worshipType: e.target.value as any })} className="w-full p-2 border rounded-lg text-sm">
                                <option value={WorshipType.BODY}>بدنية (صلاة، صيام)</option>
                                <option value={WorshipType.TONGUE}>لسانية (ذكر، قرآن)</option>
                                <option value={WorshipType.HEART}>قلبية (نية، تدبر)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1 text-slate-500">طريقة القياس</label>
                            <select value={formData.metricType} onChange={e => setFormData({ ...formData, metricType: e.target.value as any })} className="w-full p-2 border rounded-lg text-sm">
                                <option value={MetricType.BINARY}>تم/لم يتم</option>
                                <option value={MetricType.COUNT}>عدد المرات</option>
                                <option value={MetricType.PAGES}>صفحات</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1 text-slate-500">الهدف اليومي</label>
                            <input type="number" min="1" value={formData.target} onChange={e => setFormData({ ...formData, target: parseInt(e.target.value) })} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1 text-slate-500">تكرار</label>
                            <select value={formData.recurrence} onChange={e => setFormData({ ...formData, recurrence: e.target.value as any })} className="w-full p-2 border rounded-lg text-sm">
                                <option value={Recurrence.DAILY}>يومياً</option>
                                <option value={Recurrence.WEEKLY}>أسبوعياً</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold">حفظ</button>
                        <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-bold">إلغاء</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default DeedManager;
