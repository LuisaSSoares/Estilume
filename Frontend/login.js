document.addEventListener('DOMContentLoaded', function () {
    const formElement = document.querySelector('.form');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
  
    // Limpa erro customizado ao digitar no email e senha
    emailInput.addEventListener('input', () => {
      emailInput.setCustomValidity('');
    });
  
    senhaInput.addEventListener('input', () => {
      senhaInput.setCustomValidity('');
    });
  
    // Evento de envio do formulário
    formElement.addEventListener('submit', function (event) {
      event.preventDefault();
      realizarLogin();
    });
  
    function realizarLogin() {
      const email = emailInput.value.trim();
      const senha = senhaInput.value;
  
      // Validação simples local do email
      if (!validarEmail(email)) {
        emailInput.setCustomValidity('Por favor, insira um email válido.');
        emailInput.reportValidity();
        return;
      } else {
        emailInput.setCustomValidity('');
      }
  
      if (!senha) {
        senhaInput.setCustomValidity('Por favor, insira a senha.');
        senhaInput.reportValidity();
        return;
      } else {
        senhaInput.setCustomValidity('');
      }
  
      const dadosLogin = {
        email: email,
        senha: senha
      };
  
      fetch('http://localhost:3100/usuario/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosLogin)
      })
        .then(response => response.json())
        .then(data => {
            
          if (data.success) {
            // Salva token e dados do usuário
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.usuario.id);
            localStorage.setItem('usuario', JSON.stringify(data.usuario))
            localStorage.setItem('userType', data.usuario.tipo);
            window.location.href = 'index.html';
          } else {
            // Exibir mensagens de erro específicas nos inputs
            if (data.message.toLowerCase().includes('email')) {
              emailInput.setCustomValidity(data.message);
              emailInput.reportValidity();
            } else {
              emailInput.setCustomValidity('');
            }
  
            if (data.message.toLowerCase().includes('senha')) {
              senhaInput.setCustomValidity(data.message);
              senhaInput.reportValidity();
            } else {
              senhaInput.setCustomValidity('');
            }
  
            // Caso não seja erro específico de email ou senha, alerta
            if (!data.message.toLowerCase().includes('email') && !data.message.toLowerCase().includes('senha')) {
              alert(data.message || 'Erro ao realizar login.');
            }
          }
        })
        .catch(error => {
          console.error('Erro:', error);
          alert('Erro na conexão com o servidor.');
        });
    }
  
    function validarEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
  });
  