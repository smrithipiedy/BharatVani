import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Globe, Wifi, Battery, Mic, MicOff, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const PhoneScreen = ({ type, language = "English" }) => {
    return (
        <div className="w-full h-full flex flex-col bg-[#0F0F12] text-white">
            {/* Status Bar */}
            <div className="p-2 flex justify-between items-center opacity-40">
                <div className="text-[8px] font-bold">12:00</div>
                <div className="flex gap-1 items-center">
                    <Wifi size={8} />
                    <Battery size={8} />
                </div>
            </div>

            {/* Call UI */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 overflow-hidden p-3 shadow-2xl">
                    <img src="/logo.png" alt="Logo" className="w-full h-auto drop-shadow-[0_0_12px_rgba(255,153,51,0.6)]" />
                </div>
                <div className="text-[16px] font-black uppercase tracking-widest text-[#FF9933] mb-1">BharatVani</div>
                <div className="text-[10px] opacity-60 mb-4 tracking-tight">1800-VOICE-STACK</div>

                {/* Voice Waves */}
                <div className="flex gap-0.5 items-center h-4 mb-4">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ height: ['20%', '100%', '20%'] }}
                            transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                            className="w-[1.5px] bg-[#FF9933] rounded-full"
                        />
                    ))}
                </div>

                <div className="text-[8px] font-medium text-center px-4 opacity-80 leading-tight">
                    "नमस्ते, मुझे फसल बीमा के बारे में जानना है"
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="p-4 flex justify-around items-center opacity-40 border-t border-white/5">
                <Mic size={10} />
                <MicOff size={10} />
                <MoreHorizontal size={10} />
            </div>
        </div>
    );
};

const Hero = () => {
    const { t } = useLanguage();

    return (
        <section className="relative min-h-[95vh] flex flex-col items-center pt-32 pb-20 overflow-hidden bg-tricolor-gradient">
            <div className="max-w-4xl mx-auto px-6 relative z-10 text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/10 border border-black/10 text-[10px] font-bold text-black/70 mb-8 tracking-widest uppercase"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9933] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF9933]"></span>
                    </span>
                    {t('hero.badge')}
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-6xl md:text-[7.5rem] leading-[1.0] mb-8 tracking-tighter text-black"
                >
                    <span className="hero-heading block">{t('hero.title1')}</span>
                    <span className="hero-heading-italic block text-[#FF9933]">{t('hero.title2')}</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-lg md:text-xl text-black/70 leading-relaxed hero-body max-w-2xl mx-auto font-medium"
                >
                    {t('hero.description')}
                </motion.p>
            </div>

            {/* 3-Phone Graphic: Feature Phone, Old Smartphone, iPhone 17 Pro */}
            <div className="relative w-full max-w-5xl mx-auto h-[550px] md:h-[650px] flex items-center justify-center">

                {/* 1. Feature Phone (Button Phone) - Left & Deep */}
                <motion.div
                    initial={{ opacity: 0, x: -100, rotateY: 20, z: -50 }}
                    animate={{ opacity: 1, x: -215, y: 60, rotateY: 15, rotateX: 5, z: 0 }}
                    transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                    className="absolute z-10 w-[180px] h-[340px] bg-[#222226] rounded-[2rem] border-[4px] border-[#3A3A3E] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden hidden md:block"
                >
                    <div className="w-full h-full flex flex-col pt-4 px-3 pb-6">
                        {/* Speaker Grille */}
                        <div className="flex justify-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-1 h-1 rounded-full bg-white/10"></div>
                            ))}
                        </div>

                        {/* Screen */}
                        <div className="h-[170px] bg-[#0F0F12] rounded-lg overflow-hidden border border-white/10 shadow-inner">
                            <PhoneScreen type="feature" />
                        </div>

                        {/* Navigation Ring (D-pad) */}
                        <div className="mt-4 flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-4 bg-[#FF4444]/20 rounded-md border border-[#FF4444]/30"></div> {/* End Key */}
                                <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center relative">
                                    <div className="w-4 h-4 rounded-full bg-white/10"></div>
                                </div>
                                <div className="w-8 h-4 bg-[#44FF44]/20 rounded-md border border-[#44FF44]/30"></div> {/* Call Key */}
                            </div>

                            {/* Keypad */}
                            <div className="grid grid-cols-3 gap-1.5 w-full mt-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num, i) => (
                                    <div key={i} className="h-7 bg-white/5 rounded-md border border-white/5 flex flex-col items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <span className="text-[10px] font-bold text-white/60">{num}</span>
                                        <span className="text-[5px] text-white/20 uppercase font-black">
                                            {num === 2 ? 'abc' : num === 3 ? 'def' : num === 4 ? 'ghi' : num === 5 ? 'jkl' : num === 6 ? 'mno' : num === 7 ? 'pqrs' : num === 8 ? 'tuv' : num === 9 ? 'wxyz' : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Early Stage Smartphone - Right & Mid */}
                <motion.div
                    initial={{ opacity: 0, x: 100, rotateY: -20, z: -20 }}
                    animate={{ opacity: 1, x: 200, y: -40, rotateY: -25, rotateX: 5, z: 0 }}
                    transition={{ delay: 0.7, duration: 1.2, ease: "easeOut" }}
                    className="absolute z-20 w-[240px] h-[480px] bg-[#1A1A1E] rounded-[2.5rem] border-[6px] border-[#2A2A2E] shadow-2xl overflow-hidden hidden md:block"
                >
                    <div className="w-full h-full flex flex-col p-4">
                        {/* Top Bezel */}
                        <div className="flex justify-between items-center mb-4 px-4 opacity-40">
                            <div className="w-2 h-2 rounded-full bg-[#2A2A2E]"></div>
                            <div className="w-8 h-1 bg-[#2A2A2E] rounded-full"></div>
                        </div>

                        <div className="flex-1 rounded-[1.5rem] overflow-hidden border border-white/10 bg-black relative">
                            {/* Camera cutout */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-black/40 rounded-full z-10 transition-all"></div>
                            <PhoneScreen type="android" />
                        </div>

                        {/* Home Button/Chin */}
                        <div className="mt-4 flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 shadow-inner"></div>
                            <div className="text-[6px] font-bold text-white/10 uppercase tracking-widest">Global Connect</div>
                        </div>
                    </div>
                </motion.div>

                {/* 3. iPhone 17 Pro - Center & Front */}
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.8 }}
                    animate={{ opacity: 1, y: -20, scale: 1 }}
                    transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                    className="relative z-30 w-[280px] h-[580px] bg-black rounded-[4rem] border-[2px] border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden"
                >
                    {/* Metal Frame Inner Glow */}
                    <div className="absolute inset-0 rounded-[4rem] border-[10px] border-[#1A1A1E] z-10 pointer-events-none"></div>

                    {/* Screen Content */}
                    <div className="w-full h-full relative p-2">
                        {/* Dynamic Island */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-[100] flex items-center justify-around px-2 border border-white/5">
                            <div className="w-1 h-1 rounded-full bg-blue-500/50"></div>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-1.5 h-1.5 rounded-full bg-[#FF9933]"
                            ></motion.div>
                        </div>

                        <div className="w-full h-full rounded-[3.2rem] overflow-hidden border-[1px] border-white/10 shadow-inner relative">
                            {/* Side buttons */}
                            <div className="absolute -left-1 top-32 w-1 h-12 bg-white/10 rounded-r-md"></div>
                            <div className="absolute -left-1 top-48 w-1 h-20 bg-white/10 rounded-r-md"></div>
                            <div className="absolute -right-1 top-40 w-1 h-24 bg-white/10 rounded-l-md"></div>

                            <PhoneScreen type="iphone" />
                        </div>
                    </div>
                </motion.div>

                {/* Floating Information Components */}
                {/* 1. Language Bubble */}
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] left-[5%] md:left-[15%] glass-dark border border-white/10 p-4 rounded-3xl flex items-center gap-4 shadow-2xl z-40"
                >
                    <div className="w-10 h-10 rounded-2xl bg-[#FF9933]/20 flex items-center justify-center">
                        <Globe size={20} className="text-[#FF9933]" />
                    </div>
                    <div className="text-left">
                        <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-0.5">Languages</div>
                        <div className="text-sm font-bold text-white">22 Official</div>
                    </div>
                </motion.div>

                {/* 2. Latency Bubble */}
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[20%] right-[0%] md:right-[15%] glass-dark border border-white/10 p-4 rounded-3xl flex items-center gap-4 shadow-2xl z-40"
                >
                    <div className="w-10 h-10 rounded-2xl bg-[#128807]/20 flex items-center justify-center">
                        <Mic size={20} className="text-[#128807]" />
                    </div>
                    <div className="text-left">
                        <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-0.5">Latency</div>
                        <div className="text-sm font-bold text-white">&lt; 800ms</div>
                    </div>
                </motion.div>

                {/* 3. Coverage Bubble */}
                <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[40%] right-[3%] md:right-[3%] glass-dark border border-white/10 p-4 rounded-3xl flex items-center gap-4 shadow-2xl z-40 hidden md:flex"
                >
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                        <Wifi size={20} className="text-blue-500" />
                    </div>
                    <div className="text-left">
                        <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-0.5">Access</div>
                        <div className="text-sm font-bold text-white">Universal</div>
                    </div>
                </motion.div>

                {/* 4. Pillars Bubble - LEFT */}
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    className="absolute top-[50%] left-[2%] md:left-[3%] glass-dark border border-white/10 p-4 rounded-3xl items-center gap-4 shadow-2xl z-40 hidden md:flex"
                >
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                        <Battery size={20} className="text-purple-500" />
                    </div>
                    <div className="text-left">
                        <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-0.5">Pillar</div>
                        <div className="text-sm font-bold text-white">Zero Barrier</div>
                    </div>
                </motion.div>

                {/* 5. Population Bubble - LEFT */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-[20%] left-[4%] md:left-[6%] glass-dark border border-white/10 p-4 rounded-3xl items-center gap-4 shadow-2xl z-40 hidden md:flex"
                >
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                        <Globe size={20} className="text-orange-500" />
                    </div>
                    <div className="text-left">
                        <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-0.5">Coverage</div>
                        <div className="text-sm font-bold text-white">99% Users</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
