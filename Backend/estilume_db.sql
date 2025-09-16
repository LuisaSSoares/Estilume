CREATE DATABASE estilume_db; 
USE estilume_db;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('professor','estudante','admin') NOT NULL
);

CREATE TABLE disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    professor_id INT,
    FOREIGN KEY (professor_id) REFERENCES usuarios(id)
);

CREATE TABLE turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    disciplina_id INT,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id)
);

CREATE TABLE turma_estudantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    turma_id INT,
    estudante_id INT,
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    FOREIGN KEY (estudante_id) REFERENCES usuarios(id)
);

CREATE TABLE tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_entrega DATE,
    turma_id INT,
    professor_id INT,
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    FOREIGN KEY (professor_id) REFERENCES usuarios(id)
);

CREATE TABLE entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarefa_id INT,
    estudante_id INT,
    data_entrega DATETIME,
    status ENUM('pendente','entregue','atrasada') DEFAULT 'pendente',
    observacao TEXT,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id),
    FOREIGN KEY (estudante_id) REFERENCES usuarios(id)
);

CREATE TABLE presencas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    turma_id INT,
    estudante_id INT,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    presente BOOLEAN DEFAULT FALSE,
    justificativa TEXT,
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    FOREIGN KEY (estudante_id) REFERENCES usuarios(id)
);
