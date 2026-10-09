import QRCode from 'react-qr-code';
import { Printer } from 'lucide-react';
import { HCAMP_COLORS as C, FONTS, TEAMS, Scrap, HcampTitle, HcampShell, BackLink } from './hcampTheme';
import { TEAM_IDS } from '../../../services/hcampService';

interface Props { isLightMode: boolean; }

// Tela para projetar no telão ou imprimir. Aponta para a página inicial do HCAMP.
export const HcampQrCode = ({ isLightMode }: Props) => {
    const url = `${window.location.origin}/hcamp`;

    return (
        <HcampShell isLightMode={isLightMode} footer={false}>
            <div className="w-full max-w-3xl flex flex-col items-center text-center">
                <BackLink to="/hcamp/staff" label="Painel do staff" />

                <HcampTitle size="clamp(2.6rem, 9vw, 5.5rem)" />

                <p className="mt-8 text-3xl md:text-4xl" style={{ fontFamily: FONTS.marker, color: isLightMode ? C.red : C.peach }}>
                    Aponte a câmera e descubra seu time!
                </p>

                <div className="mt-10">
                    <Scrap bg={C.cream} rot={-1.5} torn={1} hover={false}>
                        <div className="p-8 sm:p-10">
                            <div className="bg-white p-4">
                                <QRCode value={url} size={320} fgColor={C.ink} bgColor="#ffffff" style={{ width: 'min(320px, 70vw)', height: 'auto' }} />
                            </div>
                        </div>
                    </Scrap>
                </div>

                <p className="mt-8 text-lg opacity-80 break-all" style={{ fontFamily: FONTS.type }}>{url.replace(/^https?:\/\//, '')}</p>

                <div className="mt-8 flex gap-3">
                    {TEAM_IDS.map((id, i) => (
                        <div key={id} className="w-10 h-10 sm:w-14 sm:h-14" style={{ background: TEAMS[id].color, transform: `rotate(${[-6, 4, -3, 7][i]}deg)`, boxShadow: '0 4px 8px rgba(0,0,0,.3)' }} title={TEAMS[id].name} />
                    ))}
                </div>

                <button onClick={() => window.print()} className="hc-noprint mt-10 inline-flex items-center gap-2 px-5 py-3 rounded-full border text-sm opacity-80 hover:opacity-100"
                    style={{ borderColor: 'currentColor', fontFamily: FONTS.type }}>
                    <Printer size={16} /> Imprimir
                </button>
            </div>
        </HcampShell>
    );
};
