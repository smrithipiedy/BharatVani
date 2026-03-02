import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, CheckCircle2, Settings, Play, MessageSquare } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Demo = () => {
    const { t } = useLanguage();
    const [status, setStatus] = useState('idle'); // idle, calling, connected, verifying, finished
    const [transcript, setTranscript] = useState([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript]);

    const startCall = () => {
        if (status !== 'idle') return;
        setStatus('calling');
        setTranscript([]);

        // Step 1: Connecting
        setTimeout(() => {
            setStatus('connected');
            addTranscript('AI', t('demo.greet') || "Namaste!");
            addTranscript('AI', t('demo.ask') || "How can I help?");

            // Step 2: User Inquiry
            setTimeout(() => {
                addTranscript('User', t('demo.userQuery') || "Explain PM-Kisan");

                // Step 3: AI Explanation
                setTimeout(() => {
                    addTranscript('AI', t('demo.aiExplain'));
                    addTranscript('AI', t('demo.aiPrompt'));

                    // Step 4: User Consent
                    setTimeout(() => {
                        addTranscript('User', t('demo.userConsent'));

                        // Step 5: Verification Mode
                        setTimeout(() => {
                            setStatus('verifying');
                            addTranscript('AI', t('demo.aiSuccess'));

                            // Step 6: OTP Submission & Finish
                            setTimeout(() => {
                                addTranscript('User', "4-8-3-2");
                                addTranscript('AI', t('demo.aiConfirm'));
                                setStatus('finished');
                            }, 3000);
                        }, 2000);
                    }, 2000);
                }, 2000);
            }, 2000);
        }, 2000);
    };

    const addTranscript = (speaker, text) => {
        setTranscript(prev => [...prev, {
            speaker,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    return (
        <section id="demo" className="py-24 bg-tricolor-gradient">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black mb-1 text-black/60 tracking-tight">{t('demo.title')}</h2>
                    <h3 className="text-3xl font-black tracking-tight text-black">{t('demo.subtitle')}</h3>
                </div>

                <div className="max-w-4xl mx-auto glass rounded-[2.5rem] md:rounded-[40px] border border-white/10 overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-2xl">
                    {/* Phone Screen */}
                    <div className="md:col-span-5 bg-[#1A1A1E] p-6 md:p-10 flex flex-col items-center justify-between min-h-[450px] md:min-h-[600px] border-b md:border-b-0 md:border-r border-white/5">
                        <div className="text-center w-full">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 mx-auto mb-6 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/20 to-[#FFCC33]/20 opacity-50"></div>
                                <Phone size={32} className="text-[#FF9933] relative z-10 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[#FF9933] font-black tracking-[0.2em] text-[10px] uppercase">{t('demo.verified')}</p>
                                <h4 className="text-3xl font-black tracking-tight">1800-BHARAT-VANI</h4>
                                <p className="text-white/50 text-xs font-bold uppercase tracking-widest">{t('demo.access')}</p>
                            </div>
                        </div>

                        {/* Interactive Waveform / Speaker */}
                        <div className="w-full space-y-8">
                            <div className="flex justify-center items-end gap-1.5 h-16">
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            height: status === 'idle' ? 4 :
                                                status === 'calling' ? [4, 12, 4] :
                                                    [8, Math.random() * 50 + 10, 8]
                                        }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05 }}
                                        className="w-1.5 rounded-full bg-[#FF9933] shadow-[0_0_10px_rgba(255,153,51,0.3)]"
                                    />
                                ))}
                            </div>

                            <div className="flex justify-center">
                                {status === 'idle' ? (
                                    <button
                                        onClick={startCall}
                                        className="group relative px-8 py-4 rounded-2xl bg-green-500 text-black font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-[0_20px_40px_rgba(34,197,94,0.3)]"
                                    >
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                                        <Play size={18} fill="black" />
                                        {t('demo.initiate')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { setStatus('idle'); setTranscript([]); }}
                                        className="px-8 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest flex items-center gap-3 hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <PhoneOff size={18} />
                                        {t('demo.end')}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="w-full flex justify-between items-center px-4 opacity-30 text-[10px] font-black uppercase tracking-[0.2em]">
                            <span>{t('demo.encrypted')}</span>
                            <div className="flex gap-4">
                                <Mic size={14} />
                                <Settings size={14} />
                            </div>
                            <span>{t('demo.voiceOnly')}</span>
                        </div>
                    </div>

                    {/* Transcript & Analytics Panel */}
                    <div className="md:col-span-7 p-6 md:p-10 flex flex-col bg-black/90 backdrop-blur-3xl shadow-2xl">
                        <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                            <div>
                                <h5 className="font-black text-xl tracking-tight mb-1">{t('demo.processor')}</h5>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${status === 'idle' ? 'bg-white/10' : 'bg-green-500 animate-pulse'}`}></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                                        {status === 'idle' ? t('demo.statusIdle') :
                                            status === 'calling' ? t('demo.statusCalling') :
                                                status === 'verifying' ? t('demo.statusVerifying') : t('demo.statusStream')}
                                    </span>
                                </div>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-[#FF9933]/10 border border-[#FF9933]/20 text-[#FF9933] text-[10px] font-black uppercase tracking-widest">
                                {t('demo.stable')}
                            </div>
                        </div>

                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto space-y-6 pr-4 no-scrollbar max-h-[450px] scroll-smooth"
                        >
                            {transcript.length === 0 && (status === 'idle') && (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-16 h-16 rounded-full border border-dashed border-white/10 flex items-center justify-center mb-6 opacity-40">
                                        <MessageSquare size={24} className="text-white" />
                                    </div>
                                    <h6 className="text-white/60 font-black uppercase tracking-widest text-[10px]">{t('demo.ready')}</h6>
                                    <p className="text-white/40 text-xs mt-2">{t('demo.streamDesc')}</p>
                                </div>
                            )}

                            <AnimatePresence initial={false}>
                                {transcript.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col ${item.speaker === 'AI' ? 'items-start' : 'items-end'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2 px-1">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${item.speaker === 'AI' ? 'text-[#FF9933]' : 'text-blue-400'}`}>
                                                {item.speaker === 'AI' ? t('demo.systemRes') : t('demo.userInput')}
                                            </span>
                                            <span className="text-[9px] text-white/10 tabular-nums">{item.time}</span>
                                        </div>
                                        <div
                                            className={`p-5 rounded-[2rem] text-sm leading-relaxed max-w-[90%] font-medium ${item.speaker === 'AI'
                                                ? 'bg-white/[0.03] border border-white/5 text-white/90'
                                                : 'bg-[#FF9933]/10 border border-[#FF9933]/20 text-[#FF9933]'
                                                }`}
                                        >
                                            {item.text}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {status === 'verifying' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-8 rounded-[2.5rem] bg-black/60 border border-white/5 text-center shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF9933] to-transparent"></div>
                                    <div className="text-[10px] font-black text-[#FF9933] mb-4 uppercase tracking-[0.3em]">{t('demo.twoFactor')}</div>
                                    <p className="text-xs text-white/60 mb-6">{t('demo.otpDesc')}</p>
                                    <div className="flex justify-center gap-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-10 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white/90">
                                                {transcript.find(t => t.text === "4-8-3-2") ? "4832"[i - 1] : "•"}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Workflow Steps Indicator */}
                        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-4 gap-4">
                            {[
                                { label: 'ASR', active: status !== 'idle' },
                                { label: 'NLU', active: status === 'connected' || status === 'verifying' || status === 'finished' },
                                { label: 'Logic', active: status === 'verifying' || status === 'finished' },
                                { label: 'Polly', active: status === 'finished' }
                            ].map((step, i) => (
                                <div key={i} className="space-y-2">
                                    <div className={`h-1 rounded-full transition-all duration-700 ${step.active ? 'bg-[#FF9933] shadow-[0_0_10px_#FF9933]' : 'bg-white/10'}`}></div>
                                    <div className={`text-[8px] font-black uppercase tracking-widest text-center ${step.active ? 'text-white' : 'text-white/40'}`}>{step.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Demo;
