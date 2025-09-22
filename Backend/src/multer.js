const multer = require('multer');
const path = require('path');

// Storage para foto de perfil
const storageProfile = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './src/profile'),
    filename: (req, file, cb) => {
        const nome = file.originalname.trim().split(' ').join('_');
        cb(null, `${Date.now()}_${nome}`);
    }
});

// Storage para arquivos de tarefas dos alunos
const storageFiles = multer.diskStorage({
    // Define o destino dos arquivos
    destination: (req, file, cb) => cb(null, './src/files'),
    
    // Define o nome do arquivo no servidor
    filename: (req, file, cb) => {
        // Constrói um nome único para evitar conflitos,
        // usando a data atual e o nome original do arquivo
        const nome = file.originalname.trim().split(' ').join('_');
        cb(null, `${Date.now()}_${nome}`);
    }
});

// Filtro de tipos de arquivo
function imageOnlyFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedImages = ['.jpg', '.jpeg', '.png', '.webp'];

    if (allowedImages.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo inválido. Somente imagens (JPG, JPEG, PNG, WEBP) são permitidas.'));
    }
}

function filesFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Lista de tipos de arquivo permitidos para as tarefas
    const allowedFileTypes = [
        '.jpg', '.jpeg', '.png', '.webp', // Imagens
        '.pdf', // Documentos PDF
        '.doc', '.docx', // Documentos do Word
        '.xls', '.xlsx', // Planilhas do Excel
        '.ppt', '.pptx', // Apresentações do PowerPoint
        '.txt', // Texto simples
        '.zip', '.rar' // Arquivos comprimidos
    ];

    if (allowedFileTypes.includes(ext)) {
        cb(null, true);
    } else {
        // Retorna um erro caso o tipo de arquivo não seja permitido
        cb(new Error(`Tipo de arquivo inválido. Somente os seguintes formatos são permitidos: ${allowedFileTypes.join(', ')}`));
    }
}

// Upload para foto de perfil
const uploadProfile = multer({ storage: storageProfile, fileFilter:imageOnlyFilter });

// Upload para os arquivos de tarefas
const uploadFiles = multer({storage: storageFiles, fileFilter: filesFilter }).array('arquivos', 5);

module.exports = {
    uploadProfile,
    uploadFiles
};
