/* assets/js/theme.js */

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const body = document.body;

    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        updateBtnIcon(true);
        updateLogo(true);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');

            // Save preference
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            updateBtnIcon(isLight);
            updateLogo(isLight);
        });
    }

    // Hamburger Menu Logic
    const menuToggle = document.querySelector('.menu-toggle');
    const navUl = document.querySelector('nav ul');

    if (menuToggle && navUl) {
        menuToggle.addEventListener('click', () => {
            navUl.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Fechar menu ao clicar em um link (melhor UX)
        const navLinks = navUl.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navUl.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

    function updateBtnIcon(isLight) {
        if (themeToggleBtn) {
            themeToggleBtn.textContent = isLight ? '☾' : '☀';
            themeToggleBtn.setAttribute('title', isLight ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro');
        }
    }

    function updateLogo(isLight) {
        // Alvo: Apenas a logo principal da tela inicial
        const mainLogo = document.querySelector('.name-logo');
        if (mainLogo) {
            const currentSrc = mainLogo.getAttribute('src');
            // Como estamos em subpastas ou raiz, vamos tentar manter o caminho relativo seguro ou usar includes
            // Assumimos que a estrutura é ./assets/... ou ../assets/...

            if (isLight) {
                // Tema Claro: Usar logo-colorida.png
                if (currentSrc.includes('nome.png')) {
                    mainLogo.setAttribute('src', currentSrc.replace('nome.png', 'logo-colorida.png'));
                }
            } else {
                // Tema Escuro: Usar nome.png
                if (currentSrc.includes('logo-colorida.png')) {
                    mainLogo.setAttribute('src', currentSrc.replace('logo-colorida.png', 'nome.png'));
                }
            }
        }
    }
});
