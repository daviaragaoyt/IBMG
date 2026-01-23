import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ArrowRight, UserCheck, ShoppingBag, UtensilsCrossed } from 'lucide-react';

interface EventoProps { isLightMode: boolean; }

export const HomeEvento = ({ isLightMode }: EventoProps) => {
    const theme = {
        gradient: 'linear-gradient(135deg, #A800E0, #FF3D00)',
        bg: isLightMode ? '#FFFFFF' : '#0F0014',
        textPrimary: isLightMode ? '#1A1A1A' : '#FFFFFF',
        textSecondary: isLightMode ? '#666666' : '#AAAAAA',
        // --- ADICIONADO PARA CORRIGIR O ERRO ---
        cardBg: isLightMode ? '#FFFFFF' : '#1A0524',
        cardBorder: isLightMode ? '#F3F4F6' : '#2D0A3D',
    };

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const mouseRef = useRef<HTMLDivElement>(null);

    // Animação do Mouse (Física Suave)
    const requestRef = useRef<number>(null);
    const targetPos = useRef({ x: 0, y: 0 });
    const currentPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => { targetPos.current = { x: e.clientX, y: e.clientY }; };
        const animate = () => {
            const ease = 0.08;
            currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
            currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;
            if (mouseRef.current) mouseRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`;
            requestRef.current = requestAnimationFrame(animate);
        };
        window.addEventListener('mousemove', handleMouseMove);
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // Countdown
    useEffect(() => {
        const targetDate = new Date('2026-02-14T00:00:00').getTime();
        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                });
            }
        };
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col font-sans transition-colors duration-500 overflow-hidden relative" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>

            {/* Mouse Flow Effect */}
            <div ref={mouseRef} className={`fixed top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none blur-[100px] z-0 transition-opacity duration-500 ${isLightMode ? 'opacity-30 mix-blend-multiply' : 'opacity-20 mix-blend-screen'}`} style={{ background: theme.gradient }}></div>

            <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32">
                <div className="relative z-10 animate-fade-in space-y-8 max-w-4xl mx-auto w-full">

                    <span className="inline-block py-2 px-4 rounded-full text-sm font-bold tracking-wider uppercase shadow-sm border" style={{ backgroundColor: isLightMode ? 'rgba(168, 0, 224, 0.1)' : 'rgba(255, 255, 255, 0.1)', borderColor: isLightMode ? 'rgba(168, 0, 224, 0.2)' : 'rgba(255, 255, 255, 0.2)', color: isLightMode ? '#A800E0' : '#FFFFFF' }}>Conferência HG 2026</span>

                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none" style={{ fontFamily: 'Playfair Display, serif' }}><span className="bg-clip-text text-transparent" style={{ backgroundImage: theme.gradient }}>Ekklesia</span></h1>

                    {/* COUNTDOWN */}
                    <div className="flex gap-4 md:gap-10 justify-center my-6">
                        {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
                            <div key={unit} className="flex flex-col items-center">
                                <span className="text-3xl md:text-6xl font-black bg-clip-text text-transparent leading-tight" style={{ backgroundImage: theme.gradient }}>
                                    {String((timeLeft as any)[unit]).padStart(2, '0')}
                                </span>
                                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold opacity-60">
                                    {{ days: 'DIAS', hours: 'HRS', minutes: 'MIN', seconds: 'SEG' }[unit as keyof typeof timeLeft]}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>Um tempo de comunhão, alinhamento e avivamento.</p>

                    {/* --- BOTÕES DE AÇÃO --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 w-full px-4">

                        {/* 1. Credencial (Destaque) */}
                        <Link to="/ekklesia/credencial" className="flex items-center justify-center gap-2 px-6 py-5 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:brightness-110 sm:col-span-2 lg:col-span-4" style={{ background: theme.gradient }}>
                            <QrCode size={20} /> Minha Credencial <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link to="/ekklesia/loja" className="flex items-center justify-center gap-2 px-6 py-5 rounded-2xl font-bold text-lg border-2 transition-all hover:bg-cyan-500/10 hover:border-cyan-500 hover:text-cyan-500 hover:-translate-y-1" style={{ borderColor: isLightMode ? '#06B6D4' : '#FFFFFF30', color: isLightMode ? '#06B6D4' : '#FFFFFF' }}>
                            <ShoppingBag size={20} /> Loja Psalms
                        </Link>

                        {/* 3. Praça Gourmet (Laranja) */}
                        <Link to="/ekklesia/gourmet" className="flex items-center justify-center gap-2 px-6 py-5 rounded-2xl font-bold text-lg border-2 transition-all hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-500 hover:-translate-y-1" style={{ borderColor: isLightMode ? '#F59E0B' : '#FFFFFF30', color: isLightMode ? '#F59E0B' : '#FFFFFF' }}>
                            <UtensilsCrossed size={20} /> Praça Gourmet
                        </Link>

                        <Link to="/ekklesia/admin" className="flex items-center justify-center gap-2 px-6 py-5 rounded-2xl font-bold text-lg border-2 transition-all hover:bg-purple-500/10 hover:border-purple-500 hover:text-purple-500 sm:col-span-2" style={{ borderColor: isLightMode ? '#A800E0' : '#FFFFFF30', color: isLightMode ? '#A800E0' : '#FFFFFF' }}>
                            <UserCheck size={20} /> Acesso Staff
                        </Link>

                    </div>
                </div>
            </div>
            <div className="relative z-10 text-center py-8 text-sm border-t" style={{ color: theme.textSecondary, borderColor: theme.cardBorder }}>© 2026 Evento Ekklesia - IBMG</div>
        </div>
    );
};