import { useState, useEffect } from 'react';
import { ShoppingBag, X, User, QrCode, Trash2, Loader2, Mail, CreditCard } from 'lucide-react';
// Note que NÃO importamos api aqui. O Modal é "burro", só exibe dados.
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
            if (cart.length === 0) onClose();
        }
    }, [isOpen]);

    // ❌ REMOVI O POLLING DAQUI.
    // Agora quem vigia o pagamento é o PublicCatalog.tsx (o Pai).
    // Quando o Pai detectar o pagamento, ele vai chamar setIsFlowOpen(false),
    // o que desmonta este modal automaticamente. Sem conflitos.

    if (!isOpen) return null;

    const handleGeneratePix = async () => {
        if (!formData.name || !formData.cpf || !formData.email || !formData.phone) {
            return alert("Preencha Nome, CPF, Email e WhatsApp.");
        }

        // Chama o Pai para criar o pedido
        onConfirm(formData, null, (data: any) => {
            if (data?.pixData) {
                setPixData(data.pixData);
                setStep('PIX_WAIT');
                // O Pai vai começar a monitorar o pagamento agora.
                // Nós apenas ficamos aqui exibindo o QR Code.
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
                                            <img src={item.imageUrl || item.images?.[0]} className="w-full h-full object-cover" alt={item.name} />
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
                            <button onClick={() => setStep('REGISTER')} disabled={cart.length === 0} className="w-full py-4 bg-purple-600 text-white font-black rounded-xl uppercase active:scale-95 transition-transform">CONTINUAR</button>
                        </div>
                    )}

                    {step === 'REGISTER' && (
                        <div className="space-y-4">
                            <input type="text" placeholder="NOME COMPLETO *" className="w-full p-4 bg-gray-50 rounded-xl border font-bold focus:ring-2 ring-purple-500 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <div className="relative">
                                <CreditCard size={18} className="absolute left-4 top-4 text-gray-400" />
                                <input type="text" placeholder="CPF *" className="w-full p-4 pl-12 bg-gray-50 rounded-xl border font-bold focus:ring-2 ring-purple-500 outline-none" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: maskCPF(e.target.value) })} />
                            </div>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-4 text-gray-400" />
                                <input type="email" placeholder="E-MAIL *" className="w-full p-4 pl-12 bg-gray-50 rounded-xl border font-bold focus:ring-2 ring-purple-500 outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="flex gap-2">
                                <input type="text" placeholder="WHATSAPP *" className="w-full p-4 bg-gray-50 rounded-xl border font-bold focus:ring-2 ring-purple-500 outline-none" value={formData.phone} onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })} />
                                <input type="number" placeholder="IDADE" className="w-24 p-4 bg-gray-50 rounded-xl border font-bold focus:ring-2 ring-purple-500 outline-none" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                            </div>
                            <button onClick={handleGeneratePix} disabled={loading} className="w-full py-4 bg-green-600 text-white font-black rounded-xl flex justify-center items-center gap-2 active:scale-95 transition-transform">
                                {loading ? <Loader2 className="animate-spin" /> : "GERAR PIX"}
                            </button>
                        </div>
                    )}

                    {step === 'PIX_WAIT' && pixData && (
                        <div className="text-center space-y-4 animate-fade-in">
                            <Loader2 className="animate-spin mx-auto text-purple-600" />
                            <p className="font-bold text-gray-600">Aguardando pagamento...</p>

                            <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl inline-block">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                                        pixData.copyPaste
                                    )}`}
                                    className="mx-auto mix-blend-multiply"
                                    alt="QR Code PIX"
                                />
                            </div>

                            <button onClick={copyToClipboard} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl active:scale-95 transition-transform hover:bg-gray-200">
                                {copySuccess ? 'Copiado! ✅' : 'Copiar código PIX 📋'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};