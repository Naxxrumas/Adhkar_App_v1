
import React from 'react';
import { Group, GroupMember, User } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface GroupDashboardProps {
  group: Group;
  members: (GroupMember & { user: User })[];
  encouragementMsg?: string;
}

const GroupDashboard: React.FC<GroupDashboardProps> = ({ group, members, encouragementMsg }) => {
  const data = members.map(m => ({
    name: m.user.name,
    ratio: m.progressRatio * 100
  }));

  const totalAvg = members.reduce((acc, curr) => acc + curr.progressRatio, 0) / (members.length || 1);

  return (
    <div className="space-y-6">
      {/* Group Encouragement Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">{group.name}</h2>
            <p className="text-emerald-100 text-sm">إنجاز العائلة لليوم</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-full w-16 h-16 flex items-center justify-center border border-white/30">
            <span className="text-xl font-black">{(totalAvg * 100).toFixed(0)}%</span>
          </div>
        </div>
        
        {encouragementMsg && (
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 italic text-sm">
            "{encouragementMsg}"
          </div>
        )}
      </div>

      {/* Ratios List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          نسب إنجاز الأفراد
          <span className="text-xs font-normal text-slate-400">(نِسب فقط للخصوصية)</span>
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: -20 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }} 
                width={80} 
              />
              <Bar dataKey="ratio" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.ratio >= 100 ? '#059669' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 space-y-4">
          {members.map((member) => (
            <div key={member.userId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                  {member.user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-700">{member.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-slate-100 h-2 rounded-full hidden sm:block">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${member.progressRatio * 100}%` }} 
                  />
                </div>
                <span className="text-xs font-bold text-slate-500 w-10 text-left">
                  {(member.progressRatio * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
            <p className="text-xs text-slate-400 mb-1">المُنجزون 100%</p>
            <p className="text-xl font-bold text-emerald-600">
                {members.filter(m => m.progressRatio >= 1).length}
            </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
            <p className="text-xs text-slate-400 mb-1">على الطريق</p>
            <p className="text-xl font-bold text-amber-600">
                {members.filter(m => m.progressRatio > 0 && m.progressRatio < 1).length}
            </p>
        </div>
      </div>
    </div>
  );
};

export default GroupDashboard;
