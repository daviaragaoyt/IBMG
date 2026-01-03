import React from 'react';

interface HomeProps {
    isLightMode: boolean;
}

export const Home = ({ isLightMode }: HomeProps) => {

    const logoSrc = isLightMode ? '/assets/logo-colorida.png' : '/assets/nome.png';

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = '/assets/nome.png';
    };

    return (
        // MUDANÇA: min-h-[calc(100vh-160px)] calcula a altura da tela menos navbar e footer
        // Isso força o flexbox a centralizar o conteúdo no espaço vazio
        <div className="flex flex-col justify-center items-center w-full min-h-[calc(100vh-160px)] animate-fade-in text-center">

            <img
                className="max-w-[600px] w-[90%] h-auto transition-all duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] light:drop-shadow-[0_0_15px_rgba(0,0,0,0.2)] mx-auto hover:scale-105"
                src={logoSrc}
                onError={handleImageError}
                alt="Sorteador IBMG - Logo Principal"
            />

        </div>
    );
};