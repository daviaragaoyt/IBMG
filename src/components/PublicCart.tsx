import React, { useState } from 'react';
import { ShoppingBag, X, CheckCircle2, Upload, User, CreditCard, Trash2 } from 'lucide-react';
import QRCode from 'react-qr-code';

export const PublicCart = ({ cart, products, setCart, onClose }: any) => {
    // Passos: CART -> REGISTER -> PAYMENT -> SUCCESS
    const [step, setStep] = useState('CART');
    const [loading, setLoading] = useState(false);
    const [voucherData, setVoucherData] = useState<any>(null);

    // Formulário de Cadastro
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', age: '', church: ''
    });

    // Arquivo do Comprovante
    const [proofFile, setProofFile] = useState<File | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;

    // Totais
    const cartItems = cart.map((item: any) => {
        const product = products.find((p: any) => p.id === item.productId);
        if (!product) return null;
        return { ...product, quantity: item.quantity };
    }).filter(Boolean);
    const total = cartItems.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setProofFile(e.target.files[0]);
    };

    const handleFinalSubmit = async () => {
        if (!proofFile) return alert("Por favor, anexe o comprovante de pagamento.");
        setLoading(true);

        try {
            // Usamos FormData para enviar Arquivo + Dados
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('age', formData.age);
            data.append('church', formData.church);
            data.append('items', JSON.stringify(cart)); // Envia array como string
            data.append('proof', proofFile); // O arquivo

            const res = await fetch(`${API_URL}/checkout/full`, {
                method: 'POST',
                body: data // Não precisa de Content-Type header aqui, o navegador põe automático
            });
            const response = await res.json();

            if (response.success) {
                setVoucherData(response);
                setStep('SUCCESS');
                setCart([]);
            } else {
                alert("Erro: " + response.error);
            }
        } catch (e) {
            alert("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-slide-up flex flex-col max-h-[90vh]">

                {step !== 'SUCCESS' && (
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 z-10 hover:bg-gray-200"><X size={20} /></button>
                )}

                {/* PASSO 1: CARRINHO */}
                {step === 'CART' && (
                    <div className="p-6 flex flex-col h-full">
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-gray-800"><ShoppingBag className="text-purple-600" /> Carrinho</h2>
                        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                            {cartItems.map((item: any) => (
                                <div key={item.id} className="flex justify-between border-b pb-2">
                                    <div><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-gray-500">{item.quantity}x R$ {item.price}</p></div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">R$ {(item.quantity * item.price).toFixed(2)}</span>
                                        <button onClick={() => setCart((p: any) => p.filter((x: any) => x.productId !== item.id))} className="text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl mb-4 flex justify-between font-black text-xl"><span>Total</span><span>R$ {total.toFixed(2)}</span></div>
                        <button onClick={() => setStep('REGISTER')} disabled={cartItems.length === 0} className="w-full py-4 bg-purple-600 text-white rounded-xl font-black shadow-lg">CONTINUAR</button>
                    </div>
                )}

                {/* PASSO 2: CADASTRO COMPLETO */}
                {step === 'REGISTER' && (
                    <div className="p-6 overflow-y-auto">
                        <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><User className="text-purple-600" /> Seus Dados</h2>
                        <p className="text-xs text-gray-500 mb-6">Cadastre-se para gerar sua credencial e o pedido.</p>

                        <div className="space-y-4">
                            <div><label className="text-xs font-bold uppercase text-gray-400">Nome Completo</label>
                                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border font-bold" placeholder="Seu nome" /></div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold uppercase text-gray-400">WhatsApp</label>
                                    <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border font-bold" placeholder="(00) 00000-0000" /></div>
                                <div><label className="text-xs font-bold uppercase text-gray-400">Idade</label>
                                    <input value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} type="number" className="w-full p-3 bg-gray-50 rounded-xl border font-bold" placeholder="Ex: 25" /></div>
                            </div>

                            <div><label className="text-xs font-bold uppercase text-gray-400">E-mail (Opcional)</label>
                                <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border font-bold" placeholder="email@exemplo.com" /></div>

                            <div><label className="text-xs font-bold uppercase text-gray-400">Igreja</label>
                                <input value={formData.church} onChange={e => setFormData({ ...formData, church: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border font-bold" placeholder="Qual igreja você frequenta?" /></div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setStep('CART')} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold text-gray-600">Voltar</button>
                            <button onClick={() => {
                                if (!formData.name || !formData.phone) return alert("Nome e Telefone são obrigatórios");
                                setStep('PAYMENT');
                            }} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-black shadow-lg">IR PARA PAGAMENTO</button>
                        </div>
                    </div>
                )}

                {/* PASSO 3: PAGAMENTO + UPLOAD */}
                {step === 'PAYMENT' && (
                    <div className="p-6 overflow-y-auto">
                        <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><CreditCard className="text-green-600" /> Pagamento</h2>

                        {/* Área do PIX */}
                        <div className="bg-gray-100 p-4 rounded-xl mb-6 text-center border-2 border-dashed border-gray-300">
                            <p className="text-xs font-bold uppercase text-gray-500 mb-2">Chave PIX (CNPJ)</p>
                            <p className="text-xl font-black text-gray-800 select-all">00.000.000/0001-00</p>
                            <p className="text-xs text-gray-400 mt-1">Banco Inter - Igreja Batista</p>
                            <div className="my-4 text-3xl font-black text-green-600">R$ {total.toFixed(2)}</div>
                            <p className="text-xs text-red-500 font-bold animate-pulse">Faça o PIX e anexe o comprovante abaixo</p>
                        </div>

                        {/* Upload */}
                        <div className="mb-6">
                            <label className="block w-full cursor-pointer">
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                <div className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${proofFile ? 'border-green-500 bg-green-50' : 'border-purple-300 bg-purple-50 hover:bg-purple-100'}`}>
                                    {proofFile ? (
                                        <>
                                            <CheckCircle2 size={32} className="text-green-500 mb-2" />
                                            <p className="text-sm font-bold text-green-700">{proofFile.name}</p>
                                            <p className="text-xs text-green-600">Clique para trocar</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={32} className="text-purple-500 mb-2" />
                                            <p className="text-sm font-bold text-purple-700">Toque para enviar Comprovante</p>
                                            <p className="text-xs text-purple-500">JPG, PNG ou PDF</p>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep('REGISTER')} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold text-gray-600">Voltar</button>
                            <button onClick={handleFinalSubmit} disabled={loading} className="flex-[2] py-3 bg-green-600 text-white rounded-xl font-black shadow-lg flex items-center justify-center gap-2">
                                {loading ? 'Enviando...' : 'FINALIZAR COMPRA'}
                            </button>
                        </div>
                    </div>
                )}

                {/* PASSO 4: SUCESSO */}
                {step === 'SUCCESS' && (
                    <div className="p-8 text-center bg-purple-600 h-full flex flex-col items-center justify-center relative">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-purple-600 shadow-xl">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-black mb-2 text-white">Pedido Enviado!</h2>
                        <p className="text-white/80 text-sm mb-6">Recebemos seu comprovante. Validaremos em breve.</p>

                        <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6">
                            <QRCode value={voucherData?.orderCode} size={180} />
                        </div>
                        <p className="text-white font-mono font-black text-2xl mb-8">#{voucherData?.orderCode}</p>

                        <button onClick={onClose} className="w-full py-4 bg-white text-purple-600 rounded-xl font-bold shadow-lg">FECHAR</button>
                    </div>
                )}
            </div>
        </div>
    );
};