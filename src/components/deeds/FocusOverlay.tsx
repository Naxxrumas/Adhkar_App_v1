import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Deed, ProgressLog, SubItem } from '../../../types';
import { X, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface FocusOverlayProps {
    deed: Deed;
    log?: ProgressLog;
    onUpdate: (value: number, valueSecondary?: number, subValues?: Record<string, number>) => void;
    onClose: () => void;
}

const FocusOverlay: React.FC<FocusOverlayProps> = ({ deed, log, onUpdate, onClose }) => {
    const { c } = useTheme();

    // Default to an empty object if no subValues exist
    const initialSubValues = useMemo(() => log?.subValues || {}, [log?.subValues]);
    const [subValues, setSubValues] = useState<Record<string, number>>(initialSubValues);

    // Default value
    const [overallValue, setOverallValue] = useState<number>(log?.value || 0);

    // Track which item we are currently looking at
    const [viewIndex, setViewIndex] = useState<number>(() => {
        if (!deed.subItems || deed.subItems.length === 0) return 0;
        const idx = deed.subItems.findIndex((item) => {
            const currentCount = initialSubValues[item.id] || 0;
            return currentCount < item.target;
        });
        return idx === -1 ? 0 : idx;
    });

    const isAllCompleted = useMemo(() => {
        if (!deed.subItems || deed.subItems.length === 0) {
            return overallValue >= deed.target;
        }
        return deed.subItems.every(item => (subValues[item.id] || 0) >= item.target);
    }, [deed.subItems, subValues, overallValue, deed.target]);

    const activeItem = deed.subItems ? deed.subItems[viewIndex] : null;

    const currentCount = activeItem ? (subValues[activeItem.id] || 0) : overallValue;
    const targetCount = activeItem ? activeItem.target : deed.target;
    // Calculate progress as overall or item-specific
    const progressPercent = Math.min(100, (currentCount / (targetCount || 1)) * 100);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (deed.subItems && viewIndex < deed.subItems.length - 1) {
            setViewIndex(viewIndex + 1);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (deed.subItems && viewIndex > 0) {
            setViewIndex(viewIndex - 1);
        }
    };

    const handleTap = useCallback(() => {
        if (isAllCompleted) return;

        if (activeItem) {
            // Processing a sub-item tap
            const currentItemCount = subValues[activeItem.id] || 0;
            if (currentItemCount < activeItem.target) {
                const newCount = currentItemCount + 1;
                const newSubValues = { ...subValues, [activeItem.id]: newCount };
                setSubValues(newSubValues);

                // Check if this sub-item is now fully completed
                let newOverallValue = overallValue;
                if (newCount === activeItem.target) {
                    newOverallValue += 1; // Completed a sub-item, so increase overall completion by 1
                    setOverallValue(newOverallValue);

                    // Auto-advance to next item if available
                    if (deed.subItems && viewIndex < deed.subItems.length - 1) {
                        setTimeout(() => {
                            setViewIndex((prev) => prev + 1);
                        }, 200);
                    }
                }

                // Call onUpdate to save
                onUpdate(newOverallValue, log?.valueSecondary, newSubValues);

                // Vibrate feedback on mobile if supported
                try {
                    if (navigator.vibrate) navigator.vibrate(50);
                } catch (e) { }
            }
        } else {
            // General counter mode (no subItems)
            if (overallValue < deed.target) {
                const newVal = overallValue + 1;
                setOverallValue(newVal);
                onUpdate(newVal, log?.valueSecondary, subValues);

                try {
                    if (navigator.vibrate) navigator.vibrate(50);
                } catch (e) { }
            }
        }
    }, [activeItem, isAllCompleted, overallValue, subValues, deed, log?.valueSecondary, onUpdate, viewIndex]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 text-white backdrop-blur-md animate-in fade-in duration-300" dir="rtl">
            {/* Header */}
            <header className="flex justify-between items-center p-6 border-b border-white/10 relative z-20">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: c.primaryLight }}>{deed.name}</h2>
                    {deed.subItems && !isAllCompleted && (
                        <p className="text-sm opacity-70">
                            الذكر {viewIndex + 1} من {deed.subItems.length}
                        </p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white tap-scale"
                >
                    <X size={24} />
                </button>
            </header>

            {/* Main Content Area */}
            <main
                className="flex-1 flex flex-col items-center justify-center p-6 cursor-pointer select-none relative z-10"
                onClick={handleTap}
            >
                {isAllCompleted ? (
                    <div className="text-center animate-in zoom-in slide-in-from-bottom-4 duration-500">
                        <div
                            className="w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-6 shadow-2xl"
                            style={{ backgroundColor: c.primary, boxShadow: `0 0 40px ${c.primaryShadow}` }}
                        >
                            <Check size={64} strokeWidth={3} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black mb-2" style={{ color: c.primaryLight }}>تقبل الله طاعتكم!</h1>
                        <p className="text-lg opacity-80">لقد أتممت جميع الأذكار في هذا الورد بنجاح.</p>

                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="mt-8 px-8 py-3 rounded-xl font-bold text-lg bg-white/10 hover:bg-white/20 transition-all"
                        >
                            العودة للرئيسية
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Huge Circular Counter button visually */}
                        <div className="relative group perspective-1000 mb-12">
                            <div className="absolute inset-0 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-300" style={{ backgroundColor: c.primary }}></div>
                            <div
                                className="w-56 h-56 md:w-64 md:h-64 rounded-full flex flex-col items-center justify-center relative shadow-2xl border-4 active:scale-95 transition-all duration-200"
                                style={{ backgroundColor: c.surface, borderColor: c.primary, color: c.heading }}
                            >
                                <span className="text-6xl md:text-7xl font-black">{currentCount}</span>
                                <span className="text-lg font-bold opacity-50 mt-1">من {targetCount}</span>
                            </div>
                        </div>

                        <div className="w-full max-w-sm text-center px-2 animate-in fade-in duration-500" key={activeItem?.id || 'main'}>
                            <p className="text-xl md:text-2xl leading-relaxed md:leading-loose font-medium opacity-90 max-h-48 overflow-y-auto scrollbar-hide">
                                {activeItem ? activeItem.text : (deed.description || deed.name)}
                            </p>
                            <p className="mt-4 text-xs opacity-50">اضغط في أي مكان بالشاشة للمتابعة</p>
                        </div>

                        {/* Navigation Controls */}
                        {deed.subItems && viewIndex !== undefined && !isAllCompleted && (
                            <div className="absolute left-6 right-6 bottom-16 flex justify-between items-center z-10">
                                <button
                                    onClick={handlePrev}
                                    disabled={viewIndex === 0}
                                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white disabled:opacity-30 tap-scale"
                                >
                                    <ChevronRight size={24} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={deed.subItems && viewIndex === deed.subItems.length - 1}
                                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white disabled:opacity-30 tap-scale"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                            </div>
                        )}

                        {/* Interactive Progress bar at the bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/10 z-20">
                            <div
                                className="h-full transition-all duration-300 ease-out"
                                style={{ width: `${progressPercent}%`, backgroundColor: c.primary }}
                            />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default FocusOverlay;
