function showForm(formId) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');

    if (formId === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
}

// Manejo de registro y login con redirección
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('newUsername').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('newPassword').value;

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    })
    .then(() => window.location.reload())  
    .catch(() => showAlert("Error en el registro", 'error'));
});

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json().then(data => ({ ok: response.ok, message: data.message })))
    .then(result => {
        showAlert(result.message, result.ok ? 'success' : 'error');
    })
    .catch(() => showAlert("Error en el inicio de sesión", 'error'));
});

function showForm(formId) {
    document.getElementById('login').classList.remove('active');
    document.getElementById('register').classList.remove('active');
    document.getElementById(formId).classList.add('active');
    document.getElementById('loginTab').classList.toggle('active', formId === 'login');
    document.getElementById('registerTab').classList.toggle('active', formId === 'register');
}
