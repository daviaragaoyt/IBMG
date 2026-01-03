import QRCode from 'react-qr-code';

export const TicketUser = ({ user }: { user: any }) => {
    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg max-w-sm mx-auto border border-gray-100 text-gray-900">
            <div className="w-full bg-blue-600 h-2 rounded-t-full mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Passaporte</h2>
            <p className="text-gray-500 text-sm mb-6">Evento 13 a 17 Fev</p>
            <div className="p-4 bg-white border-4 border-dashed border-gray-800 rounded-xl mb-6">
                <QRCode value={user.id} size={180} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
            <span className={`px-4 py-1 rounded-full text-sm font-bold mt-2 ${user.type === 'VISITOR' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                {user.type === 'VISITOR' ? 'VISITANTE' : 'MEMBRO'}
            </span>
            <p className="mt-6 text-center text-xs text-gray-400">Apresente este código na entrada.</p>
        </div>
    );
};