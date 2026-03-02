import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext';

const Counter = ({ target, label, suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [target]);

    return (
        <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2 tracking-tighter">
                {count.toLocaleString()}{suffix}
            </div>
            <div className="text-sm font-bold text-white/60 uppercase tracking-widest">{label}</div>
        </div>
    );
};

const Impact = () => {
    const { t } = useLanguage();
    return (
        <section className="py-24 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <Counter target={700} label={t('impact.stat1')} suffix="M+" />
                    <Counter target={22} label={t('impact.stat2')} suffix="+" />
                    <Counter target={99} label={t('impact.stat3')} suffix="%" />
                </div>

                <div className="mt-20 glass rounded-[40px] p-12 text-center border border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[#FF9933]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h3 className="text-5xl md:text-6xl font-extrabold mb-8 tracking-tighter">
                        {t('impact.missionTitle')} <br />
                        <span className="text-gradient-saffron">{t('impact.missionAccent')}</span>
                    </h3>
                    <div className="flex flex-wrap justify-center gap-6">
                        <button className="px-10 py-5 rounded-full bg-[#FF9933] text-black font-bold hover:scale-105 transition-transform flex items-center gap-2">
                            {t('impact.join')}
                        </button>
                        <button className="px-10 py-5 rounded-full glass border border-white/10 hover:bg-white/5 transition-colors font-bold">
                            {t('impact.partner')}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Impact;
