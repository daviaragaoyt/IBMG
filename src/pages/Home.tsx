
interface HomeProps {
    isLightMode: boolean;
}

export const Home = ({ isLightMode }: HomeProps) => {

    const logoSrc = isLightMode ? '/assets/logo-colorida.png' : '/assets/nome.png';

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = '/assets/nome.png';
    };

    return (
        // Adicionei 'text-center' e 'min-h-[50vh]' para garantir altura mínima visual
        <div className="flex flex-col justify-center items-center w-full animate-fade-in text-center py-10">

            <img
                className="max-w-[600px] w-[90%] h-auto mb-[30px] transition-all duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] light:drop-shadow-[0_0_15px_rgba(0,0,0,0.2)] mx-auto"
                src={logoSrc}
                onError={handleImageError}
                alt="Sorteador IBMG - Logo Principal"
            />

            {/* Grid de botões (Se você for usar os cards de novo no futuro) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full max-w-[700px]">
                {/* Seus cards viriam aqui */}
            </div>
        </div>
    );
};