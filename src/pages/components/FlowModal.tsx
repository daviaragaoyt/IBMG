import { useState, useEffect } from 'react';
import { ShoppingBag, X, User, QrCode, Trash2, Loader2, CheckCircle2, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency } from '../../components/StaffComponents';
import { maskPhone } from './config';

export const FlowModal = ({ isOpen, onClose, cart, setCart, total, onConfirm, loading }: any) => {
    const [step, setStep] = useState<'CART' | 'REGISTER' | 'PIX_WAIT'>('CART');
    const [formData, setFormData] = useState({ name: '', phone: '', age: '', email: '', church: '' });
    const [pixData, setPixData] = useState<any>(null);
    const [saleId, setSaleId] = useState<string>('');
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => { if (isOpen) { setStep('CART'); setPixData(null); setCopySuccess(false); } }, [isOpen]);

    useEffect(() => {
        let interval: any;
        if (step === 'PIX_WAIT' && pixData && saleId) {
            interval = setInterval(async () => {
                try {
                    const response = await api.checkPayment(pixData.paymentId, saleId);
                    if (response.status === 'PAID') { onConfirm({ orderCode: response.orderCode || 'OK' }); clearInterval(interval); }
                } catch (e) { }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [step, pixData, saleId]);

    if (!isOpen) return null;

    const handleGeneratePix = async () => {
        if (!formData.name || !formData.phone || !formData.age) return alert("Preencha os dados obrigatórios.");
        onConfirm(formData, null, (data: any) => { setPixData(data.pixData); setSaleId(data.sale.id); setStep('PIX_WAIT'); });
    };

    const copyToClipboard = () => {
        if (pixData?.copyPaste) { navigator.clipboard.writeText(pixData.copyPaste); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white rounded-t-[2rem] md:rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up text-gray-900 h-[85vh] md:max-h-[90vh] flex flex-col">
                <div className="p-5 flex justify-between items-center shrink-0 border-b border-gray-100 bg-white z-20">
                    <div className="flex items-center gap-2 text-purple-600">
                        {step === 'PIX_WAIT' ? <QrCode /> : step === 'REGISTER' ? <User /> : <ShoppingBag />}
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">{step === 'PIX_WAIT' ? 'Pague com PIX' : step === 'CART' ? 'Carrinho' : 'Seus Dados'}</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-all active:scale-90"><X size={20} strokeWidth={2.5} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {step === 'CART' && (
                        <div className="space-y-6">
                            {cart.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 animate-fade-in">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 bg-white rounded-lg overflow-hidden border border-gray-200"><img src={item.imageUrl} className="w-full h-full object-cover" /></div>
                                        <div><p className="font-bold text-sm text-gray-800">{item.name}</p><p className="text-xs text-gray-500">{formatCurrency(item.price)}</p></div>
                                    </div>
                                    <button onClick={() => { const n = cart.filter((_: any, i: number) => i !== idx); setCart(n); if (!n.length) onClose(); }} className="text-red-400 p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button>
                                </div>
                            ))}
                            <div className="flex justify-between items-end border-t pt-4"><span className="text-xs font-bold text-gray-400 uppercase">Total</span><span className="text-3xl font-black text-purple-900">{formatCurrency(total)}</span></div>
                            <button onClick={() => setStep('REGISTER')} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl uppercase shadow-lg shadow-purple-200 transition-all active:scale-95">CONTINUAR</button>
                        </div>
                    )}
                    {step === 'REGISTER' && (
                        <div className="space-y-4 animate-fade-in">
                            <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-xl text-blue-600 font-bold border border-blue-100">Identificação para retirada.</p>
                            <input type="text" placeholder="NOME COMPLETO *" className="w-full p-4 bg-gray-50 rounded-xl border font-bold focus:bg-white focus:border-purple-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <div className="flex gap-2">
                                <input type="text" placeholder="WHATSAPP *" className="w-full p-4 bg-gray-50 rounded-xl border font-bold focus:bg-white focus:border-purple-500 outline-none transition-all" value={formData.phone} onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })} />
                                <input type="number" placeholder="IDADE *" className="w-24 p-4 bg-gray-50 rounded-xl border font-bold focus:bg-white focus:border-purple-500 outline-none transition-all" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                            </div>
                            <input type="text" placeholder="IGREJA" className="w-full p-4 bg-gray-50 rounded-xl border font-bold focus:bg-white focus:border-purple-500 outline-none transition-all" value={formData.church} onChange={e => setFormData({ ...formData, church: e.target.value })} />
                            <button onClick={handleGeneratePix} disabled={loading} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl uppercase shadow-lg shadow-green-200 mt-2 flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100">
                                {loading ? <Loader2 className="animate-spin" /> : <><QrCode size={18} /> GERAR PIX</>}
                            </button>
                        </div>
                    )}
                    {step === 'PIX_WAIT' && pixData && (
                        <div className="flex flex-col items-center text-center space-y-5 animate-scale-up">
                            <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-bold animate-pulse flex items-center gap-2 border border-orange-100"><Loader2 size={12} className="animate-spin" /> Aguardando pagamento...</div>
                            <div className="text-4xl font-black text-gray-900 tracking-tight">{formatCurrency(total)}</div>
                            <div className="p-4 border-4 border-gray-900 rounded-3xl bg-white shadow-xl"><img src={`data:image/jpeg;base64,${pixData.qrCode}`} alt="QR Code PIX" className="w-48 h-48 object-contain" /></div>
                            <div className="w-full">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Copia e Cola</p>
                                <button onClick={copyToClipboard} className={`w-full p-4 rounded-xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-2 active:scale-95 ${copySuccess ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-500 hover:text-purple-600'}`}>
                                    {copySuccess ? <><CheckCircle2 size={18} /> COPIADO!</> : <><FileText size={18} /> COPIAR CÓDIGO</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};