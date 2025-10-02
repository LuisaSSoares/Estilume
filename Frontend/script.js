document.addEventListener('DOMContentLoaded', () => {
  // Recupera o objeto user do localStorage
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) return; // se não existir, não faz nada

  // Exibe no header
  document.getElementById("email").textContent = usuario.email || "sem email";
  document.getElementById("tipoPerfil").innerHTML = `Perfil de: <strong>${usuario.tipo || "sem tipo"}</strong>`;

    // Exibe o nome no h1
    const helloUser = document.querySelector(".helloUserContainer h1");
    if (helloUser) {
      helloUser.textContent = `Olá, ${usuario.nome || "Usuário"}`;
    }

    const containerProf = document.querySelector(".containerProf");
    const listaAlunosProfs = document.querySelector(".listaAlunosProfsContainer");

  // Decide layout
  if (usuario.tipo === "professor") {
    if (containerProf) containerProf.style.display = "block";
    if (listaAlunosProfs) listaAlunosProfs.style.display = "none";
    configurarLayoutProfessor();

    const subtitulo = document.getElementById("subtituloDisciplina");
    if (subtitulo) subtitulo.textContent = "Minhas turmas:";

    const containerNotas = document.querySelector(".containerNotas");
    if (containerNotas) containerNotas.style.display = "none";
    const containerTurma = document.querySelector(".containerTurma");
    if (containerTurma) containerTurma.style.display = "block";

  } else {
    // Mostra somente o layout de aluno
    if (containerProf) containerProf.style.display = "none";
    if (listaAlunosProfs) listaAlunosProfs.style.display = "block";
  }

});
document.querySelectorAll(".btnVer").forEach(botao => {
  botao.addEventListener("click", () => {
    window.location.href = './turma.html'
  })
})


function configurarLayoutProfessor() {
  // Esconde menus extras
  document.querySelectorAll(".containerMenu .navSections a").forEach(a => {
    if (!["./index.html", "./tarefas.html"].includes(a.getAttribute("href"))) {
      a.parentElement.style.display = "none";
    }
  });

  // Troca "Ver notas" → "Ver turmas"
  document.querySelectorAll(".disciplinaContainer a p:last-child")
    .forEach(p => p.textContent = "Ver turmas");
}


document.getElementById("btnChamada").addEventListener("click", () => {
  const listaAlunos = document.getElementById("listaAlunosProf"); // agora usa a certa
  const alunos = Array.from(listaAlunos.querySelectorAll("li p")); 

  listaAlunos.innerHTML = ""; // limpa lista atual

  alunos.forEach((aluno, index) => {
    const li = document.createElement("li");
    li.classList.add("alunoChamada");

    li.innerHTML = `
      <label>
        <input type="checkbox" class="checkPresenca" data-index="${index}">
        <img src="./icons/person-circle (1).svg" alt="">
        <span class="nomeAluno">${aluno.textContent.trim()}</span>
      </label>
      <span class="faltas">Faltas: 0</span>
      <input type="text" class="justificativa" placeholder="Justificativa">
    `;

    listaAlunos.appendChild(li);
  });
});


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

document.querySelectorAll(".tarefa").forEach(item => {
  item.addEventListener("click", () => {
    const tarefaId = item.dataset.id; 
    window.location.href = `exibicaoTarefa.html?id=${tarefaId}`;
  });
});