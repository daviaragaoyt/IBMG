import { useState, useEffect } from 'react';
import { ShoppingBag, X, User, QrCode, Trash2, Loader2, Mail, CreditCard } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency } from '../../components/StaffComponents';
import { maskPhone } from './config';

const maskCPF = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

export const FlowModal = ({ isOpen, onClose, cart, setCart, total, onConfirm, loading }: any) => {
    const [step, setStep] = useState<'CART' | 'REGISTER' | 'PIX_WAIT'>('CART');
    const [formData, setFormData] = useState({ name: '', phone: '', age: '', email: '', cpf: '', church: '' });
    const [pixData, setPixData] = useState<any>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Reset ao abrir
    useEffect(() => {
        if (isOpen) {
            setStep('CART');
            setPixData(null);
            setCopySuccess(false);
        }
    }, [isOpen]);

    // Polling Robusto
    useEffect(() => {
        let interval: any;

        if (step === 'PIX_WAIT' && pixData?.paymentId) {
            console.log("📡 [POLLING] Iniciando monitoramento:", pixData.paymentId);

            interval = setInterval(async () => {
                try {
                    // Força URL única para evitar qualquer cache residual
                    const response = await api.checkPaymentStatus(`${pixData.paymentId}?t=${Date.now()}`);

                    // LOG CRÍTICO: Abre o F12 e veja o que aparece aqui!
                    console.log("📦 [POLLING] Resposta completa do servidor:", response);

                    // Normaliza o status para maiúsculo para evitar erro de digitação da API
                    const currentStatus = String(response?.status).toUpperCase();

                    if (currentStatus === 'PAID' || currentStatus === 'COMPLETED') {
                        console.log("✅ [POLLING] SUCESSO DETECTADO!");
                        clearInterval(interval);

                        // Executa confirmação
                        onConfirm({ orderCode: response.orderCode || 'OK' });

                        // Redirecionamento após 3 segundos
                        setTimeout(() => {
                            window.location.href = 'https://ibmg-three.vercel.app/ekklesia';
                        }, 3000);
                    }
                } catch (e) {
                    console.error("⚠️ [POLLING] Erro na requisição:", e);
                }
            }, 3000);
        }

        return () => { if (interval) clearInterval(interval); };
    }, [step, pixData]);

    if (!isOpen) return null;

    const handleGeneratePix = async () => {
        if (!formData.name || !formData.cpf || !formData.email || !formData.phone) {
            return alert("Preencha Nome, CPF, Email e WhatsApp.");
        }
        onConfirm(formData, null, (data: any) => {
            if (data?.pixData) {
                setPixData(data.pixData);
                setStep('PIX_WAIT');
            }
        });
    };

    const copyToClipboard = () => {
        if (pixData?.copyPaste) {
            navigator.clipboard.writeText(pixData.copyPaste);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-white rounded-t-[2rem] md:rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up text-gray-900 h-[85vh] md:max-h-[90vh] flex flex-col">
                <div className="p-5 flex justify-between items-center shrink-0 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-2 text-purple-600">
                        {step === 'PIX_WAIT' ? <QrCode /> : step === 'REGISTER' ? <User /> : <ShoppingBag />}
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                            {step === 'PIX_WAIT' ? 'Pague com PIX' : step === 'CART' ? 'Carrinho' : 'Seus Dados'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {step === 'CART' && (
                        <div className="space-y-6">
                            {cart.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 bg-white rounded-lg overflow-hidden border">
                                            <img src={item.imageUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div><p className="font-bold text-sm">{item.name}</p><p className="text-xs">{formatCurrency(item.price)}</p></div>
                                    </div>
                                    <button onClick={() => { const n = cart.filter((_: any, i: number) => i !== idx); setCart(n); if (!n.length) onClose(); }} className="text-red-400"><Trash2 size={16} /></button>
                                </div>
                            ))}
                            <div className="flex justify-between items-end border-t pt-4">
                                <span className="text-xs font-bold text-gray-400">TOTAL</span>
                                <span className="text-3xl font-black text-purple-900">{formatCurrency(total)}</span>
                            </div>
                            <button onClick={() => setStep('REGISTER')} disabled={cart.length === 0} className="w-full py-4 bg-purple-600 text-white font-black rounded-xl uppercase">CONTINUAR</button>
                        </div>
                    )}

                    {step === 'REGISTER' && (
                        <div className="space-y-4">
                            <input type="text" placeholder="NOME COMPLETO *" className="w-full p-4 bg-gray-50 rounded-xl border font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <div className="relative">
                                <CreditCard size={18} className="absolute left-4 top-4 text-gray-400" />
                                <input type="text" placeholder="CPF *" className="w-full p-4 pl-12 bg-gray-50 rounded-xl border font-bold" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: maskCPF(e.target.value) })} />
                            </div>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-4 text-gray-400" />
                                <input type="email" placeholder="E-MAIL *" className="w-full p-4 pl-12 bg-gray-50 rounded-xl border font-bold" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="flex gap-2">
                                <input type="text" placeholder="WHATSAPP *" className="w-full p-4 bg-gray-50 rounded-xl border font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })} />
                                <input type="number" placeholder="IDADE" className="w-24 p-4 bg-gray-50 rounded-xl border font-bold" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                            </div>
                            <button onClick={handleGeneratePix} disabled={loading} className="w-full py-4 bg-green-600 text-white font-black rounded-xl flex justify-center items-center gap-2">
                                {loading ? <Loader2 className="animate-spin" /> : "GERAR PIX"}
                            </button>
                        </div>
                    )}

                    {step === 'PIX_WAIT' && pixData && (
                        <div className="text-center space-y-4">
                            <Loader2 className="animate-spin mx-auto" />
                            <p className="font-bold">Aguardando pagamento...</p>

                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                                    pixData.copyPaste
                                )}`}
                                className="mx-auto"
                            />

                            <button onClick={copyToClipboard}>
                                {copySuccess ? 'Copiado!' : 'Copiar código PIX'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};