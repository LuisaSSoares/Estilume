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