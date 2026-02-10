import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { getTheme, Toast, StaffLogin } from '../../components/Staff/StaffShared';
import { ReceptionScreen, EvangelismScreen, PrayerScreen, MartyrsScreen } from '../../components/Staff/DepartmentScreens';
import { StoreScreen } from '../../components/Staff/StoreScreen';

export const EkklesiaStaff = ({ isLightMode }: { isLightMode: boolean }) => {
    const [staffUser, setStaffUser] = useState<any>(() => {
        const s = localStorage.getItem('ekklesia_staff_user');
        return s ? JSON.parse(s) : null;
    });

    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [selectedSpot, setSelectedSpot] = useState('');
    const [toasts, setToasts] = useState<any[]>([]);
    const theme = getTheme(isLightMode);

    useEffect(() => {
        if (staffUser) {
            api.getCheckpoints().then((data: any) => {
                setCheckpoints(data);
                if (data.length > 0 && staffUser.department) {
                    const dept = staffUser.department.toUpperCase();

                    // Helper para normalizar strings (remover acentos)
                    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

                    const match = data.find((c: any) => {
                        const name = normalize(c.name);

                        if (dept === 'RECEPTION' && (name.includes('RECEP') || name.includes('ENTRADA'))) return true;
                        if (dept === 'EVANGELISM' && (name.includes('KOMBI') || name.includes('EVANGELISMO'))) return true;
                        if (dept === 'MARTIRES' && name.includes('MARTIRES')) return true;
                        if ((dept === 'PRAYER' || dept === 'PROPHETIC') && (name.includes('TENDA') || name.includes('PROFETICA') || name.includes('ORACAO'))) return true;
                        if (dept === 'STORE' && (name.includes('STORE') || name.includes('LIVRARIA') || name.includes('LOJA'))) return true;

                        return false;
                    });

                    if (match) setSelectedSpot(match.id);
                }
            }).catch(console.error);
        }
    }, [staffUser]);

    const addToast = (msg: string, type: 'success' | 'error' | 'warning') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    const handleLogout = () => {
        setStaffUser(null);
        localStorage.removeItem('ekklesia_staff_user');
    };

    const handleCount = async (payload: any, label: string) => {
        if (!selectedSpot) return addToast("Selecione o Local no topo!", 'error');
        if (navigator.vibrate) navigator.vibrate(50);
        try {
            await api.count({ checkpointId: selectedSpot, quantity: 1, ...payload });
            addToast(label, 'success');
        } catch (e) {
            addToast("Erro de conexão", 'error');
        }
    };

    if (!staffUser) return <StaffLogin onLogin={(user: any) => { setStaffUser(user); localStorage.setItem('ekklesia_staff_user', JSON.stringify(user)); }} isLightMode={isLightMode} />;

    const commonProps = { user: staffUser, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout: handleLogout, theme, addToast };
    const dept = staffUser.department?.toUpperCase();

    return (
        <div className="h-full">
            <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none w-auto">
                {toasts.map(t => <div key={t.id} className="pointer-events-auto"><Toast msg={t.msg} type={t.type} /></div>)}
            </div>

            {dept === 'RECEPTION' ? <ReceptionScreen {...commonProps} /> :
                dept === 'MARTIRES' ? <MartyrsScreen {...commonProps} /> :
                    (dept === 'PRAYER' || dept === 'PROPHETIC') ? <PrayerScreen {...commonProps} /> :
                        dept === 'STORE' ? <StoreScreen {...commonProps} /> :
                            <EvangelismScreen {...commonProps} />}
        </div>
    );
};