
import React, { useState } from 'react';
import { Deed, ProgressLog, MetricType, WorshipType } from '../types';
import { WORSHIP_TYPE_LABELS, WORSHIP_TYPE_COLORS } from '../constants';
import { Check, Plus, Minus, Hash, Clock, BookOpen, RotateCcw, Trash2, X, Target } from 'lucide-react';
import FocusOverlay from '../src/components/deeds/FocusOverlay';
import { useTheme } from '../src/hooks/useTheme';

interface DeedCardProps {
  deed: Deed;
  log?: ProgressLog;
  onUpdate: (value: number, valueSecondary?: number, subValues?: Record<string, number>) => void;
  onDelete?: (deedId: string) => void;
  isGracePeriod?: boolean;
}

const DeedCard: React.FC<DeedCardProps> = ({ deed, log, onUpdate, onDelete, isGracePeriod }) => {
  const [undoTimeout, setUndoTimeout] = useState<number | null>(null);
  const [prevValue, setPrevValue] = useState<number>(log?.value || 0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const { c } = useTheme();

  const currentValue = log?.value || 0;
  const currentSecondary = log?.valueSecondary || 0;
  const progressPercent = Math.min(100, (currentValue / (deed.target || 1)) * 100);

  const handleAction = (val: number, secVal?: number) => {
    // Basic local undo logic could go here, but for MVP we trigger immediate update
    onUpdate(val, secVal, log?.subValues);
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
    <>
      <div className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${isGracePeriod ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'}`} style={{ backgroundColor: c.card, borderColor: c.cardBorder }}>
        {/* Header: badge + name on right, counter on left */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${WORSHIP_TYPE_COLORS[deed.worshipType]}`}>
              {WORSHIP_TYPE_LABELS[deed.worshipType]}
            </span>
            <h3 className="text-lg font-bold mt-1" style={{ color: c.heading }}>{deed.name}</h3>
            {deed.description && <p className="text-xs" style={{ color: c.muted }}>{deed.description}</p>}
          </div>

          {deed.metricType !== MetricType.BINARY && !deed.subItems && (
            <div className="text-left">
              <span className="text-2xl font-black" style={{ color: c.primary }}>
                {currentValue}
              </span>
              <span className="text-xs mr-1" style={{ color: c.muted }}>/ {deed.target}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full mb-4 overflow-hidden" style={{ backgroundColor: c.progressBg }}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%`, backgroundColor: c.primary }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {deed.subItems && deed.subItems.length > 0 ? (
            <button
              onClick={() => setIsFocusMode(true)}
              className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all tap-scale shadow-lg"
              style={{ backgroundColor: c.primary, color: '#fff', boxShadow: `0 4px 14px ${c.primaryShadow}` }}
            >
              <Target size={20} strokeWidth={3} />
              البدء (وضع التركيز)
            </button>
          ) : deed.metricType === MetricType.BINARY ? (
            <button
              onClick={toggleBinary}
              className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all tap-scale shadow-lg"
              style={{
                backgroundColor: currentValue === 1 ? c.primary : c.inputBg,
                color: currentValue === 1 ? '#fff' : c.muted,
                boxShadow: currentValue === 1 ? `0 4px 14px ${c.primaryShadow}` : 'none',
                border: currentValue === 1 ? 'none' : `1px solid ${c.inputBorder}`
              }}
            >
              <Check size={20} strokeWidth={3} />
              {currentValue === 1 ? 'تم الإنجاز' : 'تحديد كمنجز'}
            </button>
          ) : deed.metricType === MetricType.DUAL ? (
            <div className="flex flex-col w-full gap-2">
              <div className="flex items-center justify-between p-2 rounded-xl border" style={{ backgroundColor: c.inputBg, borderColor: c.inputBorder }}>
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-500" />
                  <span className="text-sm font-medium" style={{ color: c.heading }}>الصفحات</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => changeDual(-1, false)} className="p-1" style={{ color: c.muted }}><Minus size={18} /></button>
                  <span className="w-6 text-center font-bold" style={{ color: c.heading }}>{currentValue}</span>
                  <button onClick={() => changeDual(1, false)} className="p-1" style={{ color: c.primary }}><Plus size={18} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl border" style={{ backgroundColor: c.inputBg, borderColor: c.inputBorder }}>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" />
                  <span className="text-sm font-medium" style={{ color: c.heading }}>الدقائق</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => changeDual(-5, true)} className="p-1" style={{ color: c.muted }}><Minus size={18} /></button>
                  <span className="w-6 text-center font-bold" style={{ color: c.heading }}>{currentSecondary}</span>
                  <button onClick={() => changeDual(5, true)} className="p-1" style={{ color: c.primary }}><Plus size={18} /></button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center w-full gap-2">
              <button
                onClick={() => changeCount(-1)}
                className="w-12 h-12 flex items-center justify-center border rounded-xl tap-scale"
                style={{ backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.muted }}
              >
                <Minus size={20} />
              </button>
              <div className="flex-1 h-12 flex items-center justify-center border rounded-xl" style={{ backgroundColor: c.inputBg, borderColor: c.inputBorder }}>
                <span className="font-bold text-lg" style={{ color: c.heading }}>{currentValue}</span>
              </div>
              <button
                onClick={() => changeCount(1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl tap-scale shadow-lg"
                style={{ backgroundColor: c.primary, color: '#fff', boxShadow: `0 4px 14px ${c.primaryShadow}` }}
              >
                <Plus size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Footer: Grace period label on right, Delete button on left */}
        {(isGracePeriod || onDelete) && (
          <div className="flex justify-between items-center mt-3 pt-2 border-t" style={{ borderColor: c.cardBorder }}>
            {/* Delete button - left side */}
            <div>
              {onDelete && !showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all text-[11px]"
                  style={{ color: c.muted }}
                  title="حذف العمل"
                >
                  <Trash2 size={13} />
                  <span className="font-medium">حذف</span>
                </button>
              )}
              {showDeleteConfirm && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={async () => {
                      setIsDeleting(true);
                      await onDelete?.(deed.id);
                      setIsDeleting(false);
                    }}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-red-500 text-white text-[11px] font-bold rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                    style={{ backgroundColor: c.dangerText }}
                  >
                    {isDeleting ? '...' : 'تأكيد الحذف'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-1 rounded-lg transition text-[11px] font-medium"
                    style={{ backgroundColor: c.inputBg, color: c.muted }}
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>

            {/* Grace period label - right side */}
            {isGracePeriod && (
              <div className="text-[10px] font-medium flex items-center gap-1" style={{ color: c.dangerText }}>
                <Clock size={10} /> تعديل لليوم السابق
              </div>
            )}
          </div>
        )}
      </div>

      {isFocusMode && (
        <FocusOverlay
          deed={deed}
          log={log}
          onUpdate={onUpdate}
          onClose={() => setIsFocusMode(false)}
        />
      )}
    </>
  );
};

export default DeedCard;
