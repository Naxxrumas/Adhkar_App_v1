import React from 'react';
import { useTheme, THEMES, ThemeKey } from '../../hooks/useTheme';
import { Palette, Check } from 'lucide-react';

const ThemePicker: React.FC = () => {
    const { theme, setTheme, c } = useTheme();

    const themeKeys = Object.keys(THEMES) as ThemeKey[];

    return (
        <div
            className="rounded-2xl p-4 shadow-sm border"
            style={{ backgroundColor: c.card, borderColor: c.cardBorder }}
        >
            <div className="flex items-center gap-2 mb-4">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: c.primaryLight, color: c.primary }}
                >
                    <Palette size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-sm" style={{ color: c.heading }}>سمة التطبيق</h3>
                    <p className="text-[10px]" style={{ color: c.muted }}>اختر لون واجهة التطبيق</p>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
                {themeKeys.map((key) => {
                    const t = THEMES[key];
                    const isActive = theme === key;

                    return (
                        <button
                            key={key}
                            onClick={() => setTheme(key)}
                            className="group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all"
                            style={{
                                backgroundColor: isActive ? c.primaryLight : 'transparent',
                                border: isActive ? `2px solid ${c.primary}` : '2px solid transparent',
                            }}
                        >
                            {/* Color swatch */}
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110 shadow-md relative"
                                style={{
                                    background: key === 'dark'
                                        ? `linear-gradient(135deg, #1e293b, #334155)`
                                        : `linear-gradient(135deg, ${t.colors.gradientFrom}, ${t.colors.gradientTo})`,
                                }}
                            >
                                {isActive ? (
                                    <Check size={18} strokeWidth={3} />
                                ) : (
                                    <span className="text-sm">{t.icon}</span>
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className="text-[10px] font-bold"
                                style={{ color: isActive ? c.primary : c.body }}
                            >
                                {t.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ThemePicker;
