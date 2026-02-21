
import React, { useState } from 'react';
import { Deed, ProgressLog, MetricType, WorshipType } from '../types';
import { WORSHIP_TYPE_LABELS, WORSHIP_TYPE_COLORS } from '../constants';
import { Check, Plus, Minus, Hash, Clock, BookOpen, RotateCcw } from 'lucide-react';

interface DeedCardProps {
  deed: Deed;
  log?: ProgressLog;
  onUpdate: (value: number, valueSecondary?: number) => void;
  isGracePeriod?: boolean;
}

const DeedCard: React.FC<DeedCardProps> = ({ deed, log, onUpdate, isGracePeriod }) => {
  const [undoTimeout, setUndoTimeout] = useState<number | null>(null);
  const [prevValue, setPrevValue] = useState<number>(log?.value || 0);

  const currentValue = log?.value || 0;
  const currentSecondary = log?.valueSecondary || 0;
  const progressPercent = Math.min(100, (currentValue / (deed.target || 1)) * 100);

  const handleAction = (val: number, secVal?: number) => {
    // Basic local undo logic could go here, but for MVP we trigger immediate update
    onUpdate(val, secVal);
  };

  const toggleBinary = () => {
    handleAction(currentValue === 1 ? 0 : 1);
  };

  const changeCount = (delta: number) => {
    const newVal = Math.max(0, currentValue + delta);
    handleAction(newVal);
  };

  const changeDual = (delta: number, isSecondary: boolean) => {
    if (isSecondary) {
        handleAction(currentValue, Math.max(0, currentSecondary + delta));
    } else {
        handleAction(Math.max(0, currentValue + delta), currentSecondary);
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${isGracePeriod ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${WORSHIP_TYPE_COLORS[deed.worshipType]}`}>
            {WORSHIP_TYPE_LABELS[deed.worshipType]}
          </span>
          <h3 className="text-lg font-bold text-slate-800 mt-1">{deed.name}</h3>
          {deed.description && <p className="text-xs text-slate-500">{deed.description}</p>}
        </div>
        
        {deed.metricType !== MetricType.BINARY && (
          <div className="text-left">
             <span className="text-2xl font-black text-emerald-600">
                {currentValue}
             </span>
             <span className="text-xs text-slate-400 mr-1">/ {deed.target}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full mb-4 overflow-hidden">
        <div 
          className="bg-emerald-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {deed.metricType === MetricType.BINARY ? (
          <button 
            onClick={toggleBinary}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all tap-scale ${
              currentValue === 1 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'
            }`}
          >
            <Check size={20} strokeWidth={3} />
            {currentValue === 1 ? 'تم الإنجاز' : 'تحديد كمنجز'}
          </button>
        ) : deed.metricType === MetricType.DUAL ? (
            <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-blue-500" />
                        <span className="text-sm font-medium">الصفحات</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => changeDual(-1, false)} className="p-1 text-slate-400"><Minus size={18} /></button>
                        <span className="w-6 text-center font-bold">{currentValue}</span>
                        <button onClick={() => changeDual(1, false)} className="p-1 text-emerald-600"><Plus size={18} /></button>
                    </div>
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-amber-500" />
                        <span className="text-sm font-medium">الدقائق</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => changeDual(-5, true)} className="p-1 text-slate-400"><Minus size={18} /></button>
                        <span className="w-6 text-center font-bold">{currentSecondary}</span>
                        <button onClick={() => changeDual(5, true)} className="p-1 text-emerald-600"><Plus size={18} /></button>
                    </div>
                </div>
            </div>
        ) : (
          <div className="flex items-center w-full gap-2">
            <button 
              onClick={() => changeCount(-1)}
              className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400 tap-scale"
            >
              <Minus size={20} />
            </button>
            <div className="flex-1 h-12 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl">
               <span className="font-bold text-lg">{currentValue}</span>
            </div>
            <button 
              onClick={() => changeCount(1)}
              className="w-12 h-12 flex items-center justify-center bg-emerald-600 text-white shadow-lg shadow-emerald-200 rounded-xl tap-scale"
            >
              <Plus size={20} />
            </button>
          </div>
        )}
      </div>

      {isGracePeriod && (
        <div className="mt-2 text-[10px] text-amber-600 font-medium flex items-center gap-1">
          <Clock size={10} /> تعديل لليوم السابق
        </div>
      )}
    </div>
  );
};

export default DeedCard;
