document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (usuario) {
    document.getElementById("email").textContent = usuario.email || "sem email";
    document.getElementById("tipoPerfil").innerHTML = `Perfil de: <strong>${usuario.tipo || "sem tipo"}</strong>`;
    const helloUser = document.querySelector(".helloUserContainer h1");
    if (helloUser) helloUser.textContent = `Olá, ${usuario.nome || "Usuário"}`;
  }

  const btnAluno = document.getElementById("btnAluno");
  if (btnAluno) {
    btnAluno.addEventListener("click", () => {
      window.location.href = "./aluno.html";
    });
  }

  // Detecta a página atual
  const currentPage = window.location.pathname.split("/").pop();

  const navHistorico = document.querySelector('.navSections a[href="./historico.html"]')?.parentElement;
  if (navHistorico) {
    if (usuario?.tipo === "professor") {
      // Professor só vê histórico se estiver na página aluno.html
      navHistorico.style.display = (currentPage === "aluno.html") ? "flex" : "none";
    } else {
      // Aluno sempre vê
      navHistorico.style.display = "flex";
    }
  }

  const containerProf = document.querySelector(".containerProf");
  const listaAlunosProfs = document.querySelector(".listaAlunosProfsContainer");

  if (usuario?.tipo === "professor") {
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
    if (containerProf) containerProf.style.display = "none";
    if (listaAlunosProfs) listaAlunosProfs.style.display = "block";
  }

  document.querySelectorAll(".btnVer").forEach(botao => {
    botao.addEventListener("click", () => {
      const turmaId = botao.dataset.turma;
      window.location.href = `./turma.html?id=${turmaId}`;
    });
  });

  const btnChamada = document.getElementById("btnChamada");
  if (btnChamada) {
    btnChamada.addEventListener("click", () => {
      const listaAlunos = document.getElementById("listaAlunosProf");
      const alunos = Array.from(listaAlunos.querySelectorAll("li p"));
      listaAlunos.innerHTML = "";
      alunos.forEach((aluno, index) => {
        const li = document.createElement("li");
        li.classList.add("alunoChamada");
        li.innerHTML = `
          <input type="checkbox" class="checkPresenca" data-index="${index}">
          <img src="./icons/person-circle (1).svg" alt="">
          <p>${aluno.textContent}</p>
          <span class="faltas">0 faltas</span>
          <input type="text" class="justificativa" placeholder="Justificativa">
        `;
        listaAlunos.appendChild(li);
      });

      // troca botões
      btnChamada.outerHTML = `
        <div id="acoesChamada">
          <button id="btnTerminar" class="btnTerminarCancelar">
            <img src="./icons/check-lg.svg" alt="">
            Terminar chamada
          </button>
          <button id="btnCancelar" class="btnTerminarCancelar">Cancelar chamada</button>
        </div>
      `;
      document.getElementById("btnTerminar").addEventListener("click", () => alert("Chamada finalizada!"));
      document.getElementById("btnCancelar").addEventListener("click", () => location.reload());
    });
  }

  let currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".containerMenu .navSections a").forEach(link => {
    const linkPath = link.getAttribute("href").replace("./", "");
    if (linkPath === currentPath) link.classList.add("active");
  });

  const nav = document.querySelector('.navBar');
  if (nav) {
    const links = Array.from(nav.querySelectorAll('a'));
    const indicator = nav.querySelector('.indicator');
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
    function setActiveTurma(tabName) {
      links.forEach(a => a.classList.toggle('active', a.dataset.tab === tabName));
      const link = links.find(a => a.dataset.tab === tabName);
      moveIndicatorTo(link);
      document.querySelectorAll('.alunosProfsContainer').forEach(c => c.style.display = 'none');
      if (tabName === 'alunos') document.getElementById('alunosContainer').style.display = 'block';
      else if (tabName === 'professores') document.getElementById('profsContainer').style.display = 'block';
    }
    links.forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      setActiveTurma(a.dataset.tab);
    }));
    const activeLink = nav.querySelector('a.active');
    moveIndicatorTo(activeLink);
  }

  const navTarefas = document.querySelector('.navBar[data-scope="perfil"]');
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
      linksTarefas.forEach(a => a.classList.toggle('active', a.dataset.tab === tabName));
      const link = linksTarefas.find(a => a.dataset.tab === tabName);
      moveIndicatorTarefas(link);
      document.querySelectorAll('.tarefasContainer').forEach(c => c.style.display = 'none');
      const container = document.getElementById(tabName + "Container");
      if (container) container.style.display = "block";
    }
    linksTarefas.forEach(a => a.addEventListener("click", e => {
      e.preventDefault();
      setActiveTarefas(a.dataset.tab);
    }));
    const activeLinkTarefas = navTarefas.querySelector('a.active');
    if (activeLinkTarefas) setActiveTarefas(activeLinkTarefas.dataset.tab);
  }


  document.querySelectorAll(".tarefa").forEach(item => {
    item.addEventListener("click", () => {
      const tarefaId = item.dataset.id;
      window.location.href = `exibicaoTarefa.html?id=${tarefaId}`;
    });
  });
});


function configurarLayoutProfessor() {
  document.querySelectorAll(".containerMenu .navSections a").forEach(a => {
    const href = a.getAttribute("href");
    // Deixa index e tarefas sempre visíveis
    if (!["./index.html", "./tarefas.html"].includes(href)) {
      if (href === "./historico.html" && window.location.pathname.split("/").pop() === "aluno.html") {
        a.parentElement.style.display = "flex"; // Professor em aluno.html vê histórico
      } else {
        a.parentElement.style.display = "none"; // Em qualquer outra página, esconde
      }
    }
  });
}