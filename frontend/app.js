document.addEventListener('DOMContentLoaded', () => {
    // URLs de la API
    const API_URL = 'http://localhost:3001/api'; // El backend corre en el puerto 3001 por defecto

    // Vistas
    const authView = document.getElementById('auth-view');
    const loggedInView = document.getElementById('logged-in-view');

    // Formularios
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');

    // Botones y Enlaces
    const logoutButton = document.getElementById('logout-button');
    const showLoginLink = document.getElementById('show-login');
    const showRegisterLink = document.getElementById('show-register');

    // Contenedores de información
    const messageContainer = document.getElementById('message');
    const userInfoContainer = document.getElementById('user-info');

    // --- FUNCIONES ---

    /** Muestra un mensaje en la UI */
    const showMessage = (message, type = 'error') => {
        messageContainer.textContent = message;
        messageContainer.className = type; // 'error' o 'success'
        messageContainer.style.display = 'block';
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
    };

    /** Actualiza la UI según el estado de autenticación */
    const updateUI = () => {
        const token = localStorage.getItem('token');
        if (token) {
            // Usuario autenticado
            authView.style.display = 'none';
            loggedInView.style.display = 'block';
            
            // Decodificar token para mostrar info (forma simple, sin validar firma)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                userInfoContainer.innerHTML = `<pre>ID de Usuario: ${payload.uid}\nEmail: ${payload.email}</pre>`;
            } catch (e) {
                userInfoContainer.textContent = 'No se pudo decodificar el token.';
            }
        } else {
            // No autenticado
            authView.style.display = 'block';
            loggedInView.style.display = 'none';
        }
    };

    /** Maneja el evento de login */
    const handleLogin = async (event) => {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Error en el inicio de sesión');
            }

            localStorage.setItem('token', data.token);
            updateUI();

        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    /** Maneja el evento de registro */
    const handleRegister = async (event) => {
        event.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value;

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Error en el registro');
            }
            
            showMessage('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
            // Cambiar a la vista de login
            loginFormContainer.style.display = 'block';
            registerFormContainer.style.display = 'none';
            loginForm.reset();

        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    /** Maneja el evento de logout */
    const handleLogout = () => {
        localStorage.removeItem('token');
        updateUI();
    };

    // --- EVENT LISTENERS ---

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutButton.addEventListener('click', handleLogout);

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'block';
        registerFormContainer.style.display = 'none';
    });

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerFormContainer.style.display = 'block';
        loginFormContainer.style.display = 'none';
    });

    // --- INICIALIZACIÓN ---
    
    updateUI();
});
