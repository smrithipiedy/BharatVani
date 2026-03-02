import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Cpu, Database, MessageSquare, ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const SolutionFlow = () => {
    const { t } = useLanguage();
    const steps = [
        { icon: <Phone size={24} />, title: t('pipeline.step1'), desc: t('pipeline.step1Desc') },
        { icon: <Cpu size={24} />, title: t('pipeline.step2'), desc: t('pipeline.step2Desc') },
        { icon: <Database size={24} />, title: t('pipeline.step3'), desc: t('pipeline.step3Desc') },
        { icon: <MessageSquare size={24} />, title: t('pipeline.step4'), desc: t('pipeline.step4Desc') },
    ];

    return (
        <section className="py-32 relative bg-tricolor-gradient">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-24 gap-8">
                    <div className="text-center lg:text-left">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-sm font-black uppercase tracking-[0.4em] text-[#FF9933] mb-4"
                        >
                            {t('pipeline.tag')}
                        </motion.h2>
                        <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-black"
                        >
                            {t('pipeline.heading')} <br /><span className="text-black/40">{t('pipeline.headingAccent')}</span>
                        </motion.h3>
                    </div>
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="max-w-md text-black/70 text-center lg:text-left lg:text-right leading-relaxed font-medium"
                    >
                        {t('pipeline.description')}
                    </motion.p>
                </div>

                <div className="relative">
                    {/* The Connection Line */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/5 -translate-y-1/2 hidden md:block overflow-hidden">
                        <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#FF9933]/20 to-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group"
                            >
                                <div className="space-y-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-3xl bg-white border border-black/5 flex items-center justify-center text-[#FF9933] mx-auto md:mx-0 group-hover:scale-110 group-hover:bg-[#FF9933]/10 group-hover:border-[#FF9933]/20 transition-all duration-500 shadow-sm group-hover:shadow-xl">
                                            <div className="absolute inset-0 bg-[#FF9933]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            {step.icon}
                                        </div>
                                        {/* Step Counter */}
                                        <div className="absolute -top-2 -right-2 md:right-auto md:left-[4.5rem] w-6 h-6 rounded-full bg-black text-white border border-white/10 flex items-center justify-center text-[8px] font-black">
                                            0{idx + 1}
                                        </div>
                                    </div>

                                    <div className="text-center md:text-left">
                                        <h4 className="text-lg font-bold mb-2 group-hover:text-[#FF9933] transition-colors text-black">{step.title}</h4>
                                        <p className="text-[13px] text-black/60 leading-relaxed font-medium">{step.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Technical Highlight */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 p-12 rounded-[3.5rem] bg-white border border-black/5 relative overflow-hidden group shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                        <Cpu size={120} />
                    </div>
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 text-center lg:text-left">
                            <h5 className="text-2xl font-black mb-4 text-black">{t('pipeline.latency')}</h5>
                            <p className="text-black/70 leading-relaxed font-medium italic">
                                "{t('pipeline.quote')}"
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                            <div className="px-6 py-4 rounded-2xl bg-black/5 border border-black/5 text-center">
                                <div className="text-2xl font-black text-[#FF9933]">800ms</div>
                                <div className="text-[10px] uppercase font-black tracking-widest text-black/40 mt-1">{t('pipeline.avgResponse')}</div>
                            </div>
                            <div className="px-6 py-4 rounded-2xl bg-black/5 border border-black/5 text-center">
                                <div className="text-2xl font-black text-[#128807]">99.9%</div>
                                <div className="text-[10px] uppercase font-black tracking-widest text-black/40 mt-1">{t('pipeline.uptime')}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SolutionFlow;
