CREATE DATABASE estilume_db;
USE estilume_db;

-- Tabela de Usuários (sem alterações)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    imagemPerfil VARCHAR(255),
    tipo ENUM('professor', 'estudante', 'admin') NOT NULL
);

-- Tabela de Disciplinas (sem alterações)
CREATE TABLE disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

-- Tabela para Turmas (sem alterações)
CREATE TABLE turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

-- ----------------------------------------
-- Tabelas de Junção (As grandes mudanças)
-- ----------------------------------------

-- Tabela de junção para conectar professores e disciplinas (vários professores podem dar várias disciplinas)
CREATE TABLE professor_disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professor_id INT,
    disciplina_id INT,
    FOREIGN KEY (professor_id) REFERENCES usuarios(id),
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id)
);

-- Tabela de junção para conectar turmas e disciplinas (uma turma tem várias disciplinas)
CREATE TABLE turma_disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    turma_id INT,
	professor_disciplina_id INT, 
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
	FOREIGN KEY (professor_disciplina_id) REFERENCES professor_disciplinas(id)
);

-- Tabela de junção para conectar estudantes a turmas (um estudante pertence a uma turma)
CREATE TABLE turma_estudantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    turma_id INT,
    estudante_id INT,
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    FOREIGN KEY (estudante_id) REFERENCES usuarios(id)
);

-- ----------------------------------------
-- Tabelas de Conteúdo e Avaliação
-- ----------------------------------------

-- Tabela de Tarefas (alterada para refletir a nova estrutura)
CREATE TABLE tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_entrega DATETIME,
    turma_disciplina_id INT,
    FOREIGN KEY (turma_disciplina_id) REFERENCES turma_disciplinas(id)
);

-- Tabela de Entregas (com adição da nota)
CREATE TABLE entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarefa_id INT,
    estudante_id INT,
    status ENUM('pendente', 'entregue') DEFAULT 'pendente',
    nota DECIMAL(5, 2), -- Adicionado para registrar a nota da tarefa
    observacao TEXT,
    arquivo1 VARCHAR(255),
    arquivo2 VARCHAR(255),
    arquivo3 VARCHAR(255),
    arquivo4 VARCHAR(255),
    arquivo5 VARCHAR(255),
    data_entrega DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id),
    FOREIGN KEY (estudante_id) REFERENCES usuarios(id)
);

-- Tabela de Presenças (sem alterações, mas note que a lógica se baseia em turma_id)
CREATE TABLE presencas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    turma_estudante_id INT,
    presente BOOLEAN DEFAULT FALSE,
    justificativa TEXT,
	data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (turma_estudante_id) REFERENCES turma_estudantes(id)
);

-- Tabela para Média Final (Adicionada para armazenar médias por disciplina)
CREATE TABLE medias_finais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudante_id INT,
    turma_disciplina_id INT,
    media DECIMAL(5, 2),
    FOREIGN KEY (estudante_id) REFERENCES usuarios(id),
    FOREIGN KEY (turma_disciplina_id) REFERENCES turma_disciplinas(id)
);

-- Inserção automática de exemplos de dados para testar servidor
INSERT INTO usuarios (nome, email, senha, tipo) VALUES 
('Ana Silva', 'ana.silva@escola.com', 'Senha123', 'professor'),
('Bruno Costa', 'bruno.costa@escola.com', 'Senha123', 'professor'),
('Carla Mendes', 'carla.mendes@escola.com', 'Senha123', 'professor'),
('Daniel Sousa', 'daniel.sousa@escola.com', 'Senha123', 'professor'),
('Eliane Rocha', 'eliane.rocha@escola.com', 'Senha123', 'professor');

INSERT INTO usuarios (nome, email, senha, tipo) VALUES
('Lucas Almeida', 'lucas.almeida@escola.com', 'Senha123', 'estudante'),
('Mariana Pinto', 'mariana.pinto@escola.com', 'Senha123', 'estudante'),
('Pedro Lima', 'pedro.lima@escola.com', 'Senha123', 'estudante'),
('Sofia Carvalho', 'sofia.carvalho@escola.com', 'Senha123', 'estudante'),
('Thiago Fernandes', 'thiago.fernandes@escola.com', 'Senha123', 'estudante');

INSERT INTO disciplinas (nome) VALUES
('História'),
('Matemática'),
('Física'),
('Química'),
('Geografia');

INSERT INTO turmas (nome) VALUES
('Turma 1A'),
('Turma 1B'),
('Turma 2A'),
('Turma 2B'),
('Turma 3A');
