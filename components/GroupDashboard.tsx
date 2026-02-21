
import React, { useState } from 'react';
import { Group, GroupMember, User } from '../types';
import { Settings, Copy, CheckCircle2, Trophy, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../src/hooks/useAuth';
import { updateGroupCutoffTime } from '../src/services/groups';

interface EnrichedMember extends GroupMember {
  user: any;
  progressRatio: number;
}

interface GroupDashboardProps {
  group: Group;
  members: EnrichedMember[];
  encouragementMsg?: string;
}

// Bar colors by ranking
const BAR_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

const GroupDashboard: React.FC<GroupDashboardProps> = ({ group, members, encouragementMsg }) => {
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cutoff, setCutoff] = useState(group.cutoffTime);

  const isAdmin = members.find(m => m.userId === user?.uid)?.role === 'admin';

  // Sort members by progress (highest first)
  const sortedMembers = [...members].sort((a, b) => b.progressRatio - a.progressRatio);

  const totalAvg = members.reduce((acc, curr) => acc + (curr.progressRatio || 0), 0) / (members.length || 1);

  const getMemberName = (member: EnrichedMember): string => {
    return member.user?.name || member.user?.displayName || member.userId?.slice(0, 8) || 'عضو';
  };

  const getMemberInitial = (member: EnrichedMember): string => {
    const name = getMemberName(member);
    return name.charAt(0);
  };

  // Calculate max bar height for scaling
  const maxRatio = Math.max(...members.map(m => m.progressRatio || 0), 0.01);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Group Header Banner */}
      <div className="bg-gradient-to-bl from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {group.name}
              {isAdmin && (
                <button onClick={() => setShowSettings(!showSettings)} className="p-1 hover:bg-white/20 rounded-md transition">
                  <Settings size={18} />
                </button>
              )}
            </h2>
            <p className="text-emerald-100 text-sm">إنجاز العائلة لليوم</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-full w-16 h-16 flex items-center justify-center border border-white/30 shrink-0">
            <span className="text-xl font-black">{(totalAvg * 100).toFixed(0)}%</span>
          </div>
        </div>

        {showSettings && (
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 mb-4 animate-in fade-in space-y-4 text-sm">
            <div>
              <label className="block text-emerald-100 mb-1 text-xs">رمز الانضمام للأعضاء الجدد</label>
              <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                <code className="flex-1 text-center font-mono text-emerald-100 select-all" dir="ltr">{group.id}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(group.id);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-1.5 bg-emerald-700 hover:bg-emerald-600 rounded-md transition"
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-emerald-100 mb-1 text-xs">وقت قفل اليوم (Cutoff Time)</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={cutoff}
                  onChange={e => setCutoff(e.target.value)}
                  className="flex-1 p-2 rounded-lg bg-emerald-900/50 border border-emerald-500/30 text-emerald-50 focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={() => updateGroupCutoffTime(group.id, cutoff).then(() => alert('تم حفظ التعديل!'))}
                  className="px-4 py-2 bg-white text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition"
                >
                  حفظ
                </button>
              </div>
            </div>
          </div>
        )}

        {encouragementMsg && (
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 italic text-sm">
            "{encouragementMsg}"
          </div>
        )}
      </div>

      {/* Vertical Bar Chart - RTL */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-600" />
          نسب إنجاز الأفراد
          <span className="text-xs font-normal text-slate-400">(نِسب فقط للخصوصية)</span>
        </h3>

        {sortedMembers.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            <Users size={40} className="mx-auto mb-3 text-slate-300" />
            لا يوجد بيانات أعضاء حالياً
          </div>
        ) : (
          /* Vertical bar chart - pure CSS, RTL friendly */
          <div className="flex items-end justify-center gap-3 h-52 mb-4 px-2">
            {sortedMembers.map((member, idx) => {
              const ratio = (member.progressRatio || 0) * 100;
              const barHeight = maxRatio > 0 ? ((member.progressRatio || 0) / maxRatio) * 100 : 0;
              const color = BAR_COLORS[Math.min(idx, BAR_COLORS.length - 1)];
              const isCurrentUser = member.userId === user?.uid;

              return (
                <div key={member.userId} className="flex flex-col items-center flex-1 max-w-20 min-w-12">
                  {/* Percentage above bar */}
                  <span className={`text-xs font-bold mb-1 ${ratio >= 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {ratio.toFixed(0)}%
                  </span>

                  {/* Bar */}
                  <div className="w-full relative flex items-end" style={{ height: '140px' }}>
                    <div
                      className="w-full rounded-t-lg transition-all duration-700 ease-out"
                      style={{
                        height: `${Math.max(barHeight, 4)}%`,
                        backgroundColor: color,
                        boxShadow: isCurrentUser ? `0 0 12px ${color}60` : 'none',
                        border: isCurrentUser ? '2px solid #047857' : 'none'
                      }}
                    />
                  </div>

                  {/* Avatar + Name below bar */}
                  <div className="mt-2 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCurrentUser
                      ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400'
                      : 'bg-slate-100 text-slate-500'
                      }`}>
                      {idx === 0 && ratio > 0 ? <Trophy size={14} className="text-amber-500" /> : getMemberInitial(member)}
                    </div>
                    <span className={`text-[10px] mt-1 text-center leading-tight max-w-16 truncate ${isCurrentUser ? 'font-bold text-emerald-700' : 'text-slate-500'
                      }`}>
                      {isCurrentUser ? 'أنت' : getMemberName(member)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Members Detail List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Users size={18} className="text-emerald-600" />
          ترتيب الأعضاء
        </h3>
        <div className="space-y-3">
          {sortedMembers.map((member, idx) => {
            const ratio = (member.progressRatio || 0) * 100;
            const isCurrentUser = member.userId === user?.uid;
            return (
              <div key={member.userId} className={`flex items-center gap-3 p-3 rounded-xl transition ${isCurrentUser ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50'
                }`}>
                {/* Rank */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${idx === 0 && ratio > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                  {idx + 1}
                </div>

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isCurrentUser ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                  {getMemberInitial(member)}
                </div>

                {/* Name + Progress bar */}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium block truncate ${isCurrentUser ? 'text-emerald-800' : 'text-slate-700'}`}>
                    {isCurrentUser ? `${getMemberName(member)} (أنت)` : getMemberName(member)}
                  </span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(ratio, 100)}%`,
                        backgroundColor: ratio >= 100 ? '#059669' : ratio >= 50 ? '#10b981' : '#f59e0b'
                      }}
                    />
                  </div>
                </div>

                {/* Percentage */}
                <span className={`text-sm font-bold w-12 text-left shrink-0 ${ratio >= 100 ? 'text-emerald-600' : ratio >= 50 ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                  {ratio.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 mb-1">عدد الأعضاء</p>
          <p className="text-xl font-bold text-slate-700">
            {members.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 mb-1">أنجزوا 100%</p>
          <p className="text-xl font-bold text-emerald-600">
            {members.filter(m => (m.progressRatio || 0) >= 1).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 mb-1">على الطريق</p>
          <p className="text-xl font-bold text-amber-500">
            {members.filter(m => (m.progressRatio || 0) > 0 && (m.progressRatio || 0) < 1).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupDashboard;
