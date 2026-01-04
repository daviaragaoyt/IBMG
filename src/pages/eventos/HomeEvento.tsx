import { Link } from 'react-router-dom';
import { QrCode, ArrowRight, UserCheck } from 'lucide-react';

interface EventoProps { isLightMode: boolean; }

export const HomeEvento = ({ isLightMode }: EventoProps) => {
    const theme = {
        gradient: 'linear-gradient(135deg, #A800E0, #FF3D00)',
        bg: isLightMode ? '#FFFFFF' : '#0F0014',
        textPrimary: isLightMode ? '#1A1A1A' : '#FFFFFF',
        textSecondary: isLightMode ? '#666666' : '#AAAAAA',
        cardBg: isLightMode ? '#FFFFFF' : '#1A0524',
        cardBorder: isLightMode ? '#F3F4F6' : '#2D0A3D',
    };

    return (
        <div className="min-h-screen w-full flex flex-col font-sans transition-colors duration-500" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>
            <div className="relative overflow-hidden w-full flex-1 flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-20 blur-[120px] pointer-events-none" style={{ background: theme.gradient }}></div>
                <div className="relative z-10 animate-fade-in space-y-8 max-w-4xl mx-auto">
                    <span className="inline-block py-2 px-4 rounded-full text-sm font-bold tracking-wider uppercase shadow-sm border" style={{ backgroundColor: isLightMode ? 'rgba(168, 0, 224, 0.1)' : 'rgba(255, 255, 255, 0.1)', borderColor: isLightMode ? 'rgba(168, 0, 224, 0.2)' : 'rgba(255, 255, 255, 0.2)', color: isLightMode ? '#A800E0' : '#FFFFFF' }}>Conferência HG 2026</span>
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none" style={{ fontFamily: 'Playfair Display, serif' }}><span className="bg-clip-text text-transparent" style={{ backgroundImage: theme.gradient }}>Ekklesia</span></h1>
                    <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>Um tempo de comunhão, alinhamento e avivamento.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                        <Link to="/ekklesia/credencial" className="group flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:brightness-110" style={{ background: theme.gradient }}><QrCode size={20} />Minha Credencial<ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></Link>
                        <Link to="/ekklesia/admin" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg border-2 transition-colors" style={{ borderColor: isLightMode ? '#A800E0' : '#FFFFFF', color: isLightMode ? '#A800E0' : '#FFFFFF', backgroundColor: 'transparent' }}><UserCheck size={20} />Acesso Staff</Link>
                    </div>
                </div>
            </div>
            <div className="text-center py-8 text-sm border-t" style={{ color: theme.textSecondary, borderColor: theme.cardBorder }}>© 2026 Evento Ekklesia - IBMG</div>
        </div>
    );
};