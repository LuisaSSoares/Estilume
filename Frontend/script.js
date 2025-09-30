// document.addEventListener('DOMContentLoaded', function() {
//     const userType = localStorage.getItem('userType');
//     const messageElement = document.getElementById('user-type-message');

//     if (userType) {
//         let displayMessage = '';

//         // 2. Definir a mensagem com base no tipo de usuário
//         if (userType.toLowerCase() === 'estudante') {
//             displayMessage = `Você é um usuário do tipo: ESTUDANTE`;
//         } else if (userType.toLowerCase() === 'professor') {
//             displayMessage = `Você é um usuário do tipo: PROFESSOR`;
//         } else if (userType.toLowerCase() === 'admin') {
//             displayMessage = `Você é um usuário do tipo: ADMINISTRADOR`;
//         } else {
//             displayMessage = `Tipo de usuário não reconhecido: ${userType}`;
//         }
        
//         // 3. Exibir a mensagem na tela
//         messageElement.textContent = displayMessage;
//     }
// });

const nav = document.querySelector('.navBar');
const links = Array.from(nav.querySelectorAll('a'));
let indicator = nav.querySelector('.indicator');

// Função que move a barrinha pro link ativo
function moveIndicatorTo(link) {
  if (!link) return;
  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const left = (linkRect.left - navRect.left) + nav.scrollLeft;
  const width = linkRect.width;

  requestAnimationFrame(() => {
    indicator.style.left = left + 'px';
    indicator.style.width = width + 'px';
  });
}

// Ativa a aba clicada
function setActive(tabName) {
    links.forEach(a => a.classList.toggle('active', a.dataset.tab === tabName));
    const link = links.find(a => a.dataset.tab === tabName);
    moveIndicatorTo(link);
  
    // Mostra só o container referente à aba
    document.querySelectorAll('.alunosProfsContainer').forEach(c => c.style.display = 'none');
    if (tabName === 'alunos') {
      document.getElementById('alunosContainer').style.display = 'block';
    } else if (tabName === 'professores') {
      document.getElementById('profsContainer').style.display = 'block';
    }
  }

// Listener nos cliques
links.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    setActive(a.dataset.tab);
  });
});

// Inicializa com a aba que já tem .active no HTML
window.addEventListener('load', () => {
  const activeLink = nav.querySelector('a.active');
  moveIndicatorTo(activeLink);
});
