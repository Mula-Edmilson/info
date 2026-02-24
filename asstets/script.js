// sidebar toggle variables
const menuToggler = document.querySelector('.menu-toggler');
const sideBar = document.querySelector('.side-bar');

// page navigation variables
const navItemLinks = document.querySelectorAll('.nav li a');
const pages = document.querySelectorAll('.page');

// variables for filtering
const filterBtn = document.querySelectorAll('.filter-item');
const itemCategory = document.querySelectorAll('.item-category');

// toggling sidebar in mobile
menuToggler.addEventListener('click', function(){
  sideBar.classList.toggle('active');
});

// page navigation functionality
for (let i = 0; i < navItemLinks.length; i++) {
  navItemLinks[i].addEventListener('click', function(e){
    e.preventDefault(); // Prevent default link behavior
    
    const itemLinkText = this.textContent.toLowerCase().trim();
    
    // Map Portuguese menu items to English class names
    let pageClass = '';
    switch (itemLinkText) {
      case 'sobre':
        pageClass = 'about';
        break;
      case 'currículo':
        pageClass = 'resume';
        break;
      case 'portfólio':
        pageClass = 'portfolio';
        break;
      case 'blog':
        pageClass = 'blog';
        break;
      case 'contacto':
        pageClass = 'contact';
        break;
      default:
        pageClass = itemLinkText;
    }
    
    // Remove active class from all nav links
    for (let j = 0; j < navItemLinks.length; j++) {
      navItemLinks[j].classList.remove('active');
    }
    
    // Add active class to clicked nav link
    this.classList.add('active');
    
    // Remove active class from all pages
    for (let j = 0; j < pages.length; j++) {
      pages[j].classList.remove('active');
    }
    
    // Add active class to corresponding page
    for (let j = 0; j < pages.length; j++) {
      if (pages[j].classList.contains(pageClass)) {
        pages[j].classList.add('active');
        break;
      }
    }
    
    // FECHAR O MENU HAMBÚRGUER APÓS NAVEGAR
    // Verificar se o menu está aberto (em mobile)
    if (window.innerWidth <= 1024) { // Apenas em mobile
      sideBar.classList.remove('active');
    }
  });
}

// Fechar menu ao clicar fora dele
document.addEventListener('click', function(e) {
  // Verificar se está em mobile e se o menu está aberto
  if (window.innerWidth <= 1024 && sideBar.classList.contains('active')) {
    // Se o clique não foi no menu e não foi no botão toggler
    if (!sideBar.contains(e.target) && !menuToggler.contains(e.target)) {
      sideBar.classList.remove('active');
    }
  }
});

// Fechar menu ao redimensionar a tela para desktop
window.addEventListener('resize', function() {
  if (window.innerWidth > 1024) {
    sideBar.classList.remove('active');
  }
});

// Filter functionality
for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener('click', function(){
    // Remove active class from all filter buttons
    for (let j = 0; j < filterBtn.length; j++) {
      filterBtn[j].classList.remove('active');
    }
    
    // Add active class to clicked filter button
    this.classList.add('active');
    
    const filterText = this.textContent;
    
    // Show/hide portfolio items based on filter
    for (let j = 0; j < itemCategory.length; j++) {
      const itemCategoryText = itemCategory[j].textContent;
      
      if (filterText === 'Todos' || filterText === itemCategoryText) {
        itemCategory[j].closest('.portfolio-item').classList.add('active');
      } else {
        itemCategory[j].closest('.portfolio-item').classList.remove('active');
      }
    }
  });
}

// ========== PROTEÇÃO PARA VÍDEOS ==========

// Prevenir clique direito em vídeos e containers
document.querySelectorAll('.video-container, video, iframe').forEach(element => {
  if (element) {
    element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  }
});

// Desabilitar atalhos de teclado para download
document.addEventListener('keydown', (e) => {
  // Prevenir Ctrl+S (salvar página)
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    return false;
  }
  
  // Prevenir Ctrl+Shift+S (salvar como)
  if (e.ctrlKey && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    return false;
  }
  
  // Prevenir F12 (DevTools)
  if (e.key === 'F12') {
    e.preventDefault();
    return false;
  }
  
  // Prevenir Ctrl+Shift+I (DevTools)
  if (e.ctrlKey && e.shiftKey && e.key === 'I') {
    e.preventDefault();
    return false;
  }
  
  // Prevenir Ctrl+U (ver código fonte)
  if (e.ctrlKey && e.key === 'u') {
    e.preventDefault();
    return false;
  }
});

// Desabilitar arrastar de imagens e vídeos
document.querySelectorAll('img, video').forEach(element => {
  if (element) {
    element.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });
  }
});

// ========== FUNCIONALIDADE DO FORMULÁRIO DE CONTACTO ==========

// Função para mostrar mensagens de feedback
function showMessage(message, type) {
  const messageContainer = document.getElementById('form-message');
  if (!messageContainer) return;
  
  messageContainer.innerHTML = '';
  messageContainer.style.cssText = `
    padding: 15px;
    margin-top: 20px;
    border-radius: 5px;
    text-align: center;
    font-size: 14px;
    animation: slideIn 0.3s ease;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    transition: all 0.3s ease;
  `;
  messageContainer.textContent = message;
  
  // Remover após 5 segundos
  setTimeout(() => {
    messageContainer.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      messageContainer.innerHTML = '';
      messageContainer.style.cssText = '';
    }, 300);
  }, 5000);
}

// Adicionar estilos para as animações (apenas uma vez)
if (!document.getElementById('form-styles')) {
  const style = document.createElement('style');
  style.id = 'form-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
    
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);
}

// Processar o formulário de contacto
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.querySelector('.contact-form form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      // Validar campos antes de enviar
      const nome = this.querySelector('input[name="nome"]').value.trim();
      const email = this.querySelector('input[name="email"]').value.trim();
      const assunto = this.querySelector('input[name="assunto"]').value.trim();
      const mensagem = this.querySelector('textarea[name="mensagem"]').value.trim();
      
      if (!nome || !email || !assunto || !mensagem) {
        e.preventDefault();
        showMessage('Por favor, preencha todos os campos.', 'error');
        return;
      }
      
      if (!email.includes('@') || !email.includes('.')) {
        e.preventDefault();
        showMessage('Por favor, insira um email válido.', 'error');
        return;
      }
      
      // Se passar na validação, o formulário será enviado naturalmente
      showMessage('A enviar mensagem... Aguarde.', 'success');
      
      // Desabilitar botão durante o envio
      const submitBtn = this.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      setTimeout(() => {
        submitBtn.disabled = false;
      }, 5000);
    });
  }
});

// Verificar se há parâmetros de retorno do FormSubmit na URL
window.addEventListener('load', function() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('success') || window.location.href.includes('obrigado.html')) {
    // Não fazer nada, a página obrigado.html já mostra a mensagem
  } else if (urlParams.has('error')) {
    showMessage('Erro ao enviar mensagem. Por favor, tente novamente.', 'error');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

