
import { Shirt, Utensils } from 'lucide-react';

export const HERO_CONFIG: any = {
    STORE: {
        title: "Loja Psalms",
        subtitle: "Vista a identidade do Reino.",
        gradientDark: "from-blue-900 via-[#0F0014] to-[#0F0014]",
        gradientLight: "from-blue-600 via-gray-100 to-gray-100",
        icon: <Shirt size={48} className="opacity-30" />,
        bgPattern: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1500&q=80"
    },
    CANTINA: {
        title: "Praça Gourmet",
        subtitle: "Confira nossas delícias.",
        gradientDark: "from-orange-900 via-[#0F0014] to-[#0F0014]",
        gradientLight: "from-orange-500 via-gray-100 to-gray-100",
        icon: <Utensils size={48} className="opacity-30" />,
        bgPattern: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1500&q=80"
    }
};

export const MOCK_SIZES = ['P', 'M', 'G', 'GG', 'XG'];

export const maskPhone = (v: string) => {
    return v.replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d)(\d{4})$/, "$1-$2")
        .slice(0, 15);
};