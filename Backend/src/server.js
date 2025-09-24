const express = require("express");
const app = express();
const port = 3100;
const db = require("./db_config");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'senhajwt'
const multer = require('multer')

app.use(express.json());
app.use(cors());
app.use("/uploads/profile", express.static("src/profile"));
app.use("/uploads/files", express.static("src/files"));

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido ou expirado.' });
    }
    req.user = decoded;
    next();
  });
}

// Storage para foto de perfil
const storageProfile = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./src/profile"),
  filename: (req, file, cb) => {
    const fileName = file.originalname.replace(/\s+/g, "_") + "_" + Date.now();
    cb(null, fileName);
  },
});

// Storage para arquivos de entrega
const storageFiles = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./src/files"),
  filename: (req, file, cb) => {
    const fileName = file.originalname.replace(/\s+/g, "_") + "_" + Date.now();
    cb(null, fileName);
  },
});

// Configurar o multer para cada tipo de upload
const uploadProfile = multer({ storage: storageProfile });
const uploadFiles = multer({ storage: storageFiles }).array('arquivos', 5);

//ROTAS DE USUARIO//
// Criar usuário (testado; funcionando)
app.post("/usuario/create", async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });
  }

  try {

    const sql = "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)";
    db.query(sql, [nome, email, senha, tipo], (err, result) => {
      if (err) {
        console.error("Erro ao criar usuário:", err);
        return res.status(500).json({ success: false, message: "Erro ao criar usuário." });
      }

      const token = jwt.sign({ id: result.insertId, email, tipo}, jwtSecret, { expiresIn: "5h" });
      res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso.",
        token,
        user: { id: result.insertId, nome, email, tipo }
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro interno no servidor." });
  }
});

// Login (testado; funcionando)
app.post("/usuario/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ success: false, message: "Informe email e senha!" });
  }

  const sql = "SELECT * FROM usuarios WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro no servidor." });
    if (results.length === 0) return res.status(401).json({ success: false, message: "Email ou senha incorretos." });
    
    const usuario = results[0];
    if (senha !== usuario.senha) {
      return res.status(401).json({ success: false, message: "Email ou senha incorretos." });
    }
    const token = jwt.sign({ id: usuario.id, email: usuario.email, tipo: usuario.tipo }, jwtSecret, { expiresIn: "5h" });

    res.json({ success: true, message: "Login realizado com sucesso.", token, usuario });
  });
});

// Listar usuários (testado; funcionando)
app.get("/usuarios", (req, res) => {
  db.query("SELECT id, nome, email, tipo FROM usuarios", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao listar usuários." });
    res.json({ success: true, data: results });
  });
});

// Atualizar usuário (testado; funcionando, mas não sabemos se deixamos pra atualizar o "tipo" do user)
app.put("/usuario/edit/:id", (req, res) => {
  const { id } = req.params;
  const { nome, email, tipo } = req.body;

  const sql = "UPDATE usuarios SET nome=?, email=?, tipo=? WHERE id=?";
  db.query(sql, [nome, email, tipo, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao atualizar usuário." });
    res.json({ success: true, message: "Usuário atualizado com sucesso." });
  });
});

// Deletar usuário (testado)
app.delete("/usuario/delete/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM usuarios WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao remover usuário." });
    res.json({ success: true, message: "Usuário removido com sucesso." });
  });
});

//Atualizar imagem de perfil (testado; funcionando)
app.put("/usuario/uploadImage/:id", uploadProfile.single("imagemPerfil"), (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Nenhum arquivo enviado." });
  }

  const imagemPerfil = req.file.filename;
  const sql = "UPDATE usuarios SET imagemPerfil = ? WHERE id = ?";
  db.query(sql, [imagemPerfil, id], (err) => {
    if (err) {
      console.error("Erro ao atualizar imagem de perfil:", err);
      return res.status(500).json({ success: false, message: "Erro ao atualizar imagem de perfil." });
    }
    res.json({ success: true, message: "Imagem de perfil atualizada com sucesso.", imagemPerfil });
  });
});

// Remover imagem de perfil (setar NULL) (testado; funcionando)
app.delete("/usuarios/removeImage/:id", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE usuarios SET imagemPerfil = NULL WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao remover imagem de perfil." });
    res.json({ success: true, message: "Imagem de perfil removida com sucesso." });
  });
});

//ROTAS DE DISCIPLINAS//
// Criar disciplina (testando; funcionando)
app.post("/disciplina/create", (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ success: false, message: "O nome da disciplina é obrigatório." });

  const sql = "INSERT INTO disciplinas (nome) VALUES (?)";
  db.query(sql, [nome], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao criar disciplina." });
    res.status(201).json({ success: true, message: "Disciplina criada com sucesso.", disciplina: { id: result.insertId, nome } });
  });
});

// Atualizar disciplina (testado; funcionando)
app.put("/disciplina/upload/:id", (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ success: false, message: "O nome da disciplina é obrigatório." });

  const sql = "UPDATE disciplinas SET nome=? WHERE id=?";
  db.query(sql, [nome, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao atualizar disciplina." });
    res.json({ success: true, message: "Disciplina atualizada com sucesso." });
  });
});

// Listar todas as disciplinas
app.get("/disciplinas", (req, res) => {
  const sql = "SELECT * FROM disciplinas";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao listar disciplinas." });
    res.json({ success: true, data: results });
  });
});


// Deletar disciplina (testado; funcionando)
app.delete("/disciplina/delete/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM disciplinas WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao remover disciplina." });
    res.json({ success: true, message: "Disciplina removida com sucesso." });
  });
});

//ROTAS DE TURMA//
// Criar turma (testado; funcionando)
app.post("/turma/create", (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ success: false, message: "O nome da turma é obrigatório." });

  const sql = "INSERT INTO turmas (nome) VALUES (?)";
  db.query(sql, [nome], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao criar turma." });
    res.status(201).json({ success: true, message: "Turma criada com sucesso.", turma: { id: result.insertId, nome } });
  });
});

// Atualizar turma (testado; funcionando)
app.put("/turma/edit/:id", (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ success: false, message: "O nome da turma é obrigatório." });

  const sql = "UPDATE turmas SET nome=? WHERE id=?";
  db.query(sql, [nome, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao atualizar turma." });
    res.json({ success: true, message: "Turma atualizada com sucesso." });
  });
});

// Listar turmas (testado; funcionando)
app.get("/turmas", (req, res) => {
  const sql = "SELECT * FROM turmas";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao listar turmas." });
    res.json({ success: true, data: results });
  });
});

// Deletar turma (testado; funcionando)
app.delete("/turma/delete/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM turmas WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao remover turma." });
    res.json({ success: true, message: "Turma removida com sucesso." });
  });
});

//ROTAS DE RELAÇÃO ENTRE PROFESSOR E DISCIPLINA
//Primeiro, add função que valide somente professores 
function validarProfessor(req, res, next) {
  const { professor_id } = req.body;
  if (!professor_id) return res.status(400).json({ message: "Professor é obrigatório." });

  const sql = "SELECT * FROM usuarios WHERE id=? AND tipo='professor'";
  db.query(sql, [professor_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Erro no servidor." });
    if (results.length === 0) return res.status(400).json({ message: "O usuário não é professor." });
    next();
  });
}

//Adicionar relação de um prof a uma disciplina (chama função criada) (testado; funcionando)
app.post("/professorDisciplina/insert", validarProfessor, (req, res) => {
  const { professor_id, disciplina_id } = req.body;
  const sql = "INSERT INTO professor_disciplinas (professor_id, disciplina_id) VALUES (?, ?)";
  db.query(sql, [professor_id, disciplina_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Erro ao adicionar relação." });
    res.status(201).json({ message: "Relação adicionada com sucesso.", id: result.insertId });
  });
});

//Alterar relação (trocar prof ou disciplina)(testado; funcionando)
app.put("/professorDisciplina/update/:id", validarProfessor, (req, res) => {
  const { id } = req.params;
  const { professor_id, disciplina_id } = req.body;

  const sql = "UPDATE professor_disciplinas SET professor_id=?, disciplina_id=? WHERE id=?";
  db.query(sql, [professor_id, disciplina_id, id], (err) => {
    if (err) return res.status(500).json({ message: "Erro ao atualizar relação." });
    res.json({ message: "Relação atualizada com sucesso." });
  });
});

//Listar relações (testado; funcionando)
app.get("/professorDisciplinas", (req, res) => {
  const sql = `
    SELECT pd.id, u.nome AS professor, d.nome AS disciplina
    FROM professor_disciplinas pd
    JOIN usuarios u ON pd.professor_id = u.id
    JOIN disciplinas d ON pd.disciplina_id = d.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Erro ao listar relações." });
    res.json({ success: true, data: results });
  });
});

//Remover relação (testado; funcionando)
app.delete("/professorDisciplina/remove/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM professor_disciplinas WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: "Erro ao remover relação." });
    res.json({ message: "Relação removida com sucesso." });
  });
});

//ROTA DE RELAÇÃO ENTRE TURMA E DISCIPLINAS 
//Tabela respectiva foi feita usando como chave estrangeira a tabela professor_disciplina, pois vários prof pode dar aula a várias matérias 

// Cria relação entre turma e professor de determinada disciplina (testado; funcionando)
app.post("/turmaDisciplina/insert", (req, res) => {
  const { turma_id, professor_disciplina_id } = req.body;

  if (!turma_id || !professor_disciplina_id)
    return res.status(400).json({ message: "Turma e relação professor-disciplina são obrigatórios." });

  const sql = "INSERT INTO turma_disciplinas (turma_id, professor_disciplina_id) VALUES (?, ?)";
  db.query(sql, [turma_id, professor_disciplina_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Erro ao adicionar relação." });
    res.status(201).json({ message: "Relação criada com sucesso.", id: result.insertId });
  });
});

// Altera relação (turma ou professor de determinada disciplina) (testado; funcionando)
app.put("/turmaDisciplina/update/:id", (req, res) => {
  const { id } = req.params;
  const { turma_id, professor_disciplina_id } = req.body;

  if (!turma_id || !professor_disciplina_id)
    return res.status(400).json({ message: "Turma e relação professor-disciplina são obrigatórios." });

  const sql = "UPDATE turma_disciplinas SET turma_id=?, professor_disciplina_id=? WHERE id=?";
  db.query(sql, [turma_id, professor_disciplina_id, id], (err) => {
    if (err) return res.status(500).json({ message: "Erro ao atualizar relação." });
    res.json({ message: "Relação atualizada com sucesso." });
  });
});

// Lista todas as relações de turmas com as disciplinas e respectivos professores (testado; funcionando)
app.get("/turmaDisciplinas", (req, res) => {
  const sql = `
    SELECT td.id, t.nome AS turma, d.nome AS disciplina, u.nome AS professor
    FROM turma_disciplinas td
    JOIN turmas t ON td.turma_id = t.id
    JOIN professor_disciplinas pd ON td.professor_disciplina_id = pd.id
    JOIN usuarios u ON pd.professor_id = u.id
    JOIN disciplinas d ON pd.disciplina_id = d.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Erro ao listar relações." });
    res.json({ success: true, data: results });
  });
});

// Remove relação (testado; funcionando)
app.delete("/turmaDisciplina/remove/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM turma_disciplinas WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: "Erro ao remover relação." });
    res.json({ message: "Relação removida com sucesso." });
  });
});

//ROTAS PARA RELACIONAR ESTUDANTES COM AS TURMAS 
// Função para validar se o usuário é estudante 
function validarEstudante(req, res, next) {
  const { estudante_id } = req.body;
  if (!estudante_id) return res.status(400).json({ message: "ID do estudante é obrigatório." });

  const sql = "SELECT * FROM usuarios WHERE id=? AND tipo='estudante'";
  db.query(sql, [estudante_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Erro no servidor." });
    if (results.length === 0) return res.status(400).json({ message: "O usuário não é estudante." });
    next();
  });
}

//Cria relação entre estudante e turma (testado; funcionando)
app.post("/turmaEstudante/insert", validarEstudante, (req, res) => {
  const { turma_id, estudante_id } = req.body;

  if (!turma_id) return res.status(400).json({ message: "ID da turma é obrigatório." });

  const sql = "INSERT INTO turma_estudantes (turma_id, estudante_id) VALUES (?, ?)";
  db.query(sql, [turma_id, estudante_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Erro ao adicionar estudante à turma." });
    res.status(201).json({ message: "Estudante adicionado à turma com sucesso.", id: result.insertId });
  });
});

//Atualiza relação (trocar turma de um estudante e vice-versa) (testado; funcionando)
app.put("/turmaEstudante/update/:id", validarEstudante, (req, res) => {
  const { id } = req.params;
  const { turma_id, estudante_id } = req.body;

  if (!turma_id) return res.status(400).json({ message: "ID da turma é obrigatório." });

  const sql = "UPDATE turma_estudantes SET turma_id=?, estudante_id=? WHERE id=?";
  db.query(sql, [turma_id, estudante_id, id], (err) => {
    if (err) return res.status(500).json({ message: "Erro ao atualizar relação." });
    res.json({ message: "Relação atualizada com sucesso." });
  });
});

//Lista todas as relações entre turma e estudante (testado; funcionando)
app.get("/turmaEstudantes", (req, res) => {
  const sql = `
    SELECT te.id, t.nome AS turma, u.nome AS estudante
    FROM turma_estudantes te
    JOIN turmas t ON te.turma_id = t.id
    JOIN usuarios u ON te.estudante_id = u.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Erro ao listar estudantes por turma." });
    res.json({ success: true, data: results });
  });
});

//Remove relação (testado; funcionando)
app.delete("/turmaEstudante/remove/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM turma_estudantes WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: "Erro ao remover estudante da turma." });
    res.json({ message: "Estudante removido da turma com sucesso." });
  });
});

//ROTA PARA AS TAREFAS
//Cria tarefa (testado; funcionando)
app.post("/tarefa/create", (req, res) => {
  const { titulo, descricao, data_entrega, turma_disciplina_id } = req.body;

  if (!titulo || !data_entrega || !turma_disciplina_id) {
    return res.status(400).json({ success: false, message: "Título, data de entrega e turma-disciplina são obrigatórios." });
  }

  const sql = "INSERT INTO tarefas (titulo, descricao, data_entrega, turma_disciplina_id) VALUES (?, ?, ?, ?)";
  db.query(sql, [titulo, descricao, data_entrega, turma_disciplina_id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao criar tarefa." });
    res.status(201).json({ success: true, message: "Tarefa criada com sucesso.", id: result.insertId });
  });
});

//Atualiza tarefa (testado; funcionando)
app.put("/tarefa/update/:id", (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, data_entrega, turma_disciplina_id } = req.body;

  if (!titulo || !turma_disciplina_id) {
    return res.status(400).json({ success: false, message: "Título e turma-disciplina são obrigatórios." });
  }
  const sql = "UPDATE tarefas SET titulo=?, descricao=?, data_entrega=?, turma_disciplina_id=? WHERE id=?";
  db.query(sql, [titulo, descricao || null, data_entrega || null, turma_disciplina_id, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao atualizar tarefa.", error: err });
    res.json({ success: true, message: "Tarefa atualizada com sucesso." });
  });
});


//Lista tarefas (testado; funcionando)
app.get("/tarefas", (req, res) => {
  const sql = `
    SELECT t.id, t.titulo, t.descricao, t.data_criacao, t.data_entrega,
           td.id AS turma_disciplina_id, t.turma_disciplina_id,
           u.nome AS professor, d.nome AS disciplina, tr.nome AS turma
    FROM tarefas t
    JOIN turma_disciplinas td ON t.turma_disciplina_id = td.id
    JOIN professor_disciplinas pd ON td.professor_disciplina_id = pd.id
    JOIN usuarios u ON pd.professor_id = u.id
    JOIN disciplinas d ON pd.disciplina_id = d.id
    JOIN turmas tr ON td.turma_id = tr.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao listar tarefas.", error: err });
    res.json({ success: true, data: results });
  });
});

// Remove tarefa (testado; funcionando)
app.delete("/tarefa/remove/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM tarefas WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao remover tarefa.", error: err });
    res.json({ success: true, message: "Tarefa removida com sucesso." });
  });
});

//ROTAS DE ENTREGAS
// Cria entrega (com upload de arquivos) (testado; funcionando)
app.post("/entrega/create", (req, res) => {
  uploadFiles(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: "Erro no upload dos arquivos", error: err.message });

    const { tarefa_id, estudante_id } = req.body;

    const arquivos = req.files ? req.files.map(file => file.filename) : [];
    while (arquivos.length < 5) arquivos.push(null);
    const [arquivo1, arquivo2, arquivo3, arquivo4, arquivo5] = arquivos;

    const status = arquivos.some(a => a !== null) ? "entregue" : "pendente";

    const sql = `
      INSERT INTO entregas (
        tarefa_id, estudante_id, status,
        arquivo1, arquivo2, arquivo3, arquivo4, arquivo5
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [tarefa_id, estudante_id, status, arquivo1, arquivo2, arquivo3, arquivo4, arquivo5], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Erro ao criar entrega.", error: err });
      res.json({ success: true, message: "Entrega criada com sucesso!", data: result });
    });
  });
});

// Envia avaliacao para uma entrega (testado; funcionando)
app.put("/entrega/nota/:id", (req, res) => {
  const { id } = req.params;
  const { nota, observacao } = req.body;

  if (nota === undefined) {
    return res.status(400).json({ success: false, message: "Nota é obrigatória." });
  }

  const sql = "UPDATE entregas SET nota=?, observacao=? WHERE id=?";
  db.query(sql, [nota, observacao || null, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao enviar nota." });
    res.json({ success: true, message: "Nota enviada com sucesso." });
  });
});

//Atualiza arquivos de uma entrega (testado; funcionando, mas mantem arquivos que não foram substituidos)
app.put("/entrega/updateFiles/:id", (req, res) => {
  uploadFiles(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });

    const { id } = req.params;

    db.query("SELECT * FROM entregas WHERE id=?", [id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Erro ao buscar entrega." });
      if (result.length === 0) return res.status(404).json({ success: false, message: "Entrega não encontrada." });

      const entrega = result[0];
      const arquivos = req.files || [];
      const arquivosAtualizados = [
        arquivos[0]?.filename || entrega.arquivo1,
        arquivos[1]?.filename || entrega.arquivo2,
        arquivos[2]?.filename || entrega.arquivo3,
        arquivos[3]?.filename || entrega.arquivo4,
        arquivos[4]?.filename || entrega.arquivo5
      ];

      const status = arquivos.some(a => a !== null) ? "entregue" : entrega.status;

      const sql = `
        UPDATE entregas
        SET status=?, arquivo1=?, arquivo2=?, arquivo3=?, arquivo4=?, arquivo5=?
        WHERE id=?
      `;

      db.query(sql, [status, ...arquivosAtualizados, id], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Erro ao atualizar arquivos.", error: err });
        res.json({ success: true, message: "Arquivos atualizados com sucesso." });
      });
    });
  });
});

//Atualiza notas e obs de uma entrega
app.put("/entrega/update-nota/:id", (req, res) => {
  const { id } = req.params;
  const { nota, observacao } = req.body;

  if (nota === undefined && observacao === undefined) {
    return res.status(400).json({ success: false, message: "É necessário enviar nota ou observação." });
  }

  const sql = `
    UPDATE entregas
    SET nota = COALESCE(?, nota),
        observacao = COALESCE(?, observacao)
    WHERE id = ?
  `;

  db.query(sql, [nota, observacao, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao atualizar nota/observação.", error: err });
    res.json({ success: true, message: "Nota/observação atualizada com sucesso." });
  });
});


// Listar todas as entregas (testado; funcionando)
app.get("/entregas", (req, res) => {
  const sql = `
    SELECT e.*, t.titulo AS tarefa, u.nome AS estudante
    FROM entregas e
    JOIN tarefas t ON e.tarefa_id = t.id
    JOIN usuarios u ON e.estudante_id = u.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao listar entregas." });
    res.json({ success: true, data: results });
  });
});

// Lista entregas de um estudante específico (testado; funcionando)
app.get("/entregas/estudante/:id", (req, res) => {
  const id = req.params.id; 
  const sql = "SELECT * FROM entregas WHERE estudante_id = ?"; 

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao listar entregas." });
    res.json({ success: true, data: results });
  });
});

// Deletar entrega (testado; funcionando)
app.delete("/entrega/delete/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM entregas WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao remover entrega." });
    res.json({ success: true, message: "Entrega removida com sucesso." });
  });
});

//ROTAS DE PRESENÇA
// Cria presença (testado; funcionando)
app.post("/presenca/create", (req, res) => {
  const { turma_estudante_id, presente, justificativa } = req.body;

  const sql = `
    INSERT INTO presencas (turma_estudante_id, presente, justificativa)
    VALUES (?, ?, ?)
  `;
  db.query(sql, [turma_estudante_id, presente || false, justificativa || null], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Erro ao registrar presença.", error: err });
    }
    res.json({ success: true, message: "Presença registrada com sucesso.", data: result });
  });
});

// Busca presença por ID (testado; funcionando)
app.get("/presenca/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.id, p.data, p.presente, p.justificativa,
           u.nome AS estudante, t.nome AS turma
    FROM presencas p
    JOIN turma_estudantes te ON p.turma_estudante_id = te.id
    JOIN usuarios u ON te.estudante_id = u.id
    JOIN turmas t ON te.turma_id = t.id
    WHERE p.id = ?
  `;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Erro ao buscar presença.", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Presença não encontrada." });
    }
    res.json({ success: true, data: result[0] });
  });
});

// Listar presenças por turma (testado; funcionando)
app.get("/presencas/turma/:turma_id", (req, res) => {
  const { turma_id } = req.params;

  const sql = `
    SELECT p.id, p.data, p.presente, p.justificativa,
           u.nome AS estudante, t.nome AS turma
    FROM presencas p
    JOIN turma_estudantes te ON p.turma_estudante_id = te.id
    JOIN usuarios u ON te.estudante_id = u.id
    JOIN turmas t ON te.turma_id = t.id
    WHERE t.id = ?
    ORDER BY p.data DESC
  `;

  db.query(sql, [turma_id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Erro ao listar presenças da turma.", error: err });
    }
    res.json({ success: true, data: results });
  });
});

// Atualiza presença (testado; funcionando)
app.put("/presenca/update/:id", (req, res) => {
  const { id } = req.params;
  const { presente, justificativa } = req.body;

  const sql = `
    UPDATE presencas
    SET presente=?, justificativa=?
    WHERE id=?
  `;
  db.query(sql, [presente, justificativa || null, id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Erro ao atualizar presença.", error: err });
    }
    res.json({ success: true, message: "Presença atualizada com sucesso." });
  });
});

// Deleta presença (testado; funcionando)
app.delete("/presenca/delete/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM presencas WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Erro ao deletar presença.", error: err });
    }
    res.json({ success: true, message: "Presença removida com sucesso." });
  });
});

//ROTAS DE MÉDIA FINAL
// Cria média final de um estudante em uma disciplina
app.post("/media/create", (req, res) => {
  const { estudante_id, turma_disciplina_id } = req.body;

  // Calcula a média com base nas entregas
  const sqlMedia = `
    SELECT AVG(nota) AS media
    FROM entregas e
    JOIN tarefas t ON e.tarefa_id = t.id
    WHERE e.estudante_id = ? AND t.turma_disciplina_id = ?
  `;

  db.query(sqlMedia, [estudante_id, turma_disciplina_id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao calcular média.", error: err });

    const media = result[0].media || 0;

    const sqlInsert = `
      INSERT INTO medias_finais (estudante_id, turma_disciplina_id, media)
      VALUES (?, ?, ?)
    `;
    db.query(sqlInsert, [estudante_id, turma_disciplina_id, media], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Erro ao criar média final.", error: err });
      res.json({ success: true, message: "Média final criada com sucesso.", data: { estudante_id, turma_disciplina_id, media } });
    });
  });
});

//Atualiza média
app.put("/medias/update/:id", (req, res) => {
  const { id } = req.params;

  // Pega estudante_id e turma_disciplina_id da média final
  const sqlGet = "SELECT estudante_id, turma_disciplina_id FROM medias_finais WHERE id=?";
  db.query(sqlGet, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao buscar média final.", error: err });
    if (result.length === 0) return res.status(404).json({ success: false, message: "Média final não encontrada." });

    const { estudante_id, turma_disciplina_id } = result[0];

    // Recalcula a média
    const sqlMedia = `
      SELECT AVG(nota) AS media
      FROM entregas e
      JOIN tarefas t ON e.tarefa_id = t.id
      WHERE e.estudante_id = ? AND t.turma_disciplina_id = ?
    `;
    db.query(sqlMedia, [estudante_id, turma_disciplina_id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Erro ao calcular média.", error: err });

      const media = result[0].media || 0;

      const sqlUpdate = "UPDATE medias_finais SET media=? WHERE id=?";
      db.query(sqlUpdate, [media, id], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Erro ao atualizar média final.", error: err });
        res.json({ success: true, message: "Média final atualizada com sucesso.", data: { id, media } });
      });
    });
  });
});

//Recupera médias 
app.get("/medias", (req, res) => {
  const sql = `
    SELECT mf.id, u.nome AS estudante, td.id AS turma_disciplina_id, mf.media
    FROM medias_finais mf
    JOIN usuarios u ON mf.estudante_id = u.id
    JOIN turma_disciplinas td ON mf.turma_disciplina_id = td.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao listar médias finais.", error: err });
    res.json({ success: true, data: results });
  });
});

//Recupera média final de um estudante
app.get("/medias/estudante/:estudante_id", (req, res) => {
  const { estudante_id } = req.params;
  const sql = `
    SELECT mf.id, u.nome AS estudante, td.id AS turma_disciplina_id, mf.media
    FROM medias_finais mf
    JOIN usuarios u ON mf.estudante_id = u.id
    JOIN turma_disciplinas td ON mf.turma_disciplina_id = td.id
    WHERE mf.estudante_id = ?
  `;
  db.query(sql, [estudante_id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao buscar médias do estudante.", error: err });
    res.json({ success: true, data: results });
  });
});

//Deleta média final
app.delete("/medias_finais/delete/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM medias_finais WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao deletar média final.", error: err });
    res.json({ success: true, message: "Média final removida com sucesso." });
  });
});

//FIM DAS ROTAS//
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`))


