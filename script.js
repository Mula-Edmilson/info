document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DO MENU HAMBURGUER ---
    const hamburguer = document.getElementById('hamburguer');
    const menuLinks = document.getElementById('menu-links');

    if (hamburguer) {
        hamburguer.addEventListener('click', () => {
            menuLinks.classList.toggle('ativo');
        });
    }

    // --- LÓGICA DO FILTRO DO PORTFÓLIO ---
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (portfolioGrid) {
        const filterButtons = document.querySelectorAll('.categorias button');
        const portfolioItems = document.querySelectorAll('.portfolio-item');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filter = button.getAttribute('data-filter');

                portfolioItems.forEach(item => {
                    if (filter === 'todos' || item.getAttribute('data-categoria') === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
});