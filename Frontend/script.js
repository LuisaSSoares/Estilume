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

document.addEventListener("DOMContentLoaded", () => {
  let currentPath = window.location.pathname.split("/").pop(); 
  if (currentPath === "" || currentPath === "index.html") {
    currentPath = "index.html"; // força index.html como padrão
  }

  const navLinks = document.querySelectorAll(".containerMenu .navSections a");

  navLinks.forEach(link => {
    const linkPath = link.getAttribute("href").replace("./", "");
    if (linkPath === currentPath) {
      link.classList.add("active");
    }
  });
});
//Animação de navegação com indicator
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
function setActiveTurma(tabNameTurma) {
    links.forEach(a => a.classList.toggle('active', a.dataset.tab === tabNameTurma));
    const link = links.find(a => a.dataset.tab === tabNameTurma);
    moveIndicatorTo(link);
  
    // Mostra só o container referente à aba
    document.querySelectorAll('.alunosProfsContainer').forEach(c => c.style.display = 'none');
    if (tabNameTurma === 'alunos') {
      document.getElementById('alunosContainer').style.display = 'block';
    } else if (tabNameTurma === 'professores') {
      document.getElementById('profsContainer').style.display = 'block';
    }
  }

// Listener nos cliques
links.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    setActiveTurma(a.dataset.tab);
  });
});

// Inicializa com a aba que já tem .active no HTML
window.addEventListener('load', () => {
  const activeLink = nav.querySelector('a.active');
  moveIndicatorTo(activeLink);
});

const navTarefas = document.querySelector('.navBar[data-scope="perfil"]'); // seleciona só a nav de tarefas
if (navTarefas) {
  const linksTarefas = Array.from(navTarefas.querySelectorAll('a'));
  const indicatorTarefas = navTarefas.querySelector('.indicator');

  function moveIndicatorTarefas(link) {
    if (!link) return;
    const navRect = navTarefas.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const left = linkRect.left - navRect.left + navTarefas.scrollLeft;
    const width = linkRect.width;
    requestAnimationFrame(() => {
      indicatorTarefas.style.left = left + 'px';
      indicatorTarefas.style.width = width + 'px';
    });
  }

  function setActiveTarefas(tabName) {
    // Atualiza a classe active apenas nesta nav
    linksTarefas.forEach(a => a.classList.toggle('active', a.dataset.tab === tabName));
    const link = linksTarefas.find(a => a.dataset.tab === tabName);
    moveIndicatorTarefas(link);

    // Mostra apenas o container correspondente
    document.querySelectorAll('.tarefasContainer').forEach(c => c.style.display = 'none');
    if (tabName === 'pendentes') document.getElementById('pendentesContainer').style.display = 'block';
    else if (tabName === 'atraso') document.getElementById('atrasoContainer').style.display = 'block';
    else if (tabName === 'concluidas') document.getElementById('concluidasContainer').style.display = 'block';
  }

  // Clique nas abas
  linksTarefas.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      setActiveTarefas(a.dataset.tab);
    });
  });

  // Inicializa com a aba ativa
  const activeLinkTarefas = navTarefas.querySelector('a.active');
  if (activeLinkTarefas) setActiveTarefas(activeLinkTarefas.dataset.tab);
}
