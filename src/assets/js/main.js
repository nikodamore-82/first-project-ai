// main.js - JavaScript principale del progetto
$(document).ready(function() {
    console.log('jQuery caricato e pronto');
    
    // Esempio di utilizzo jQuery
    $('body').addClass('js-loaded');
    
    // Gestione eventi personalizzati
    $('.swiper-slide').on('click', function() {
        console.log('Slide cliccata:', $(this).text());
    });

    // Inizializza sistema di autenticazione
    initAuth();
});

// Sistema di Autenticazione
function initAuth() {
    // Controlla se l'utente è già loggato
    checkLoginStatus();
    
    // Event listeners per i bottoni
    document.getElementById('registerBtn').addEventListener('click', () => openModal('registerModal'));
    document.getElementById('loginBtn').addEventListener('click', () => openModal('loginModal'));
    document.getElementById('usersBtn').addEventListener('click', showUsersList);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Event listeners per i form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
    clearAlerts();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    clearForms();
    clearAlerts();
}

function clearForms() {
    document.getElementById('registerForm').reset();
    document.getElementById('loginForm').reset();
}

function clearAlerts() {
    document.getElementById('registerAlert').innerHTML = '';
    document.getElementById('loginAlert').innerHTML = '';
}

function showAlert(elementId, message, type) {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    document.getElementById(elementId).innerHTML = 
        `<div class="alert ${alertClass}">${message}</div>`;
}

function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validazioni
    if (username.length < 3) {
        showAlert('registerAlert', 'Username deve essere di almeno 3 caratteri', 'error');
        return;
    }
    
    if (password.length < 4) {
        showAlert('registerAlert', 'Password deve essere di almeno 4 caratteri', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('registerAlert', 'Le password non coincidono', 'error');
        return;
    }
    
    // Controlla se l'utente esiste già
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        showAlert('registerAlert', 'Username già esistente', 'error');
        return;
    }
    
    // Salva l'utente
    users[username] = {
        password: password, // In produzione dovrebbe essere hashata
        registeredAt: new Date().toISOString()
    };
    localStorage.setItem('users', JSON.stringify(users));
    
    showAlert('registerAlert', 'Registrazione completata con successo!', 'success');
    
    setTimeout(() => {
        closeModal('registerModal');
        showAlert('loginAlert', 'Ora puoi effettuare il login', 'success');
        openModal('loginModal');
    }, 1500);
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Controlla credenziali
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (!users[username]) {
        showAlert('loginAlert', 'Username non trovato', 'error');
        return;
    }
    
    if (users[username].password !== password) {
        showAlert('loginAlert', 'Password errata', 'error');
        return;
    }
    
    // Login riuscito
    localStorage.setItem('currentUser', username);
    showAlert('loginAlert', 'Login effettuato con successo!', 'success');
    
    setTimeout(() => {
        closeModal('loginModal');
        updateUIAfterLogin(username);
    }, 1000);
}

function checkLoginStatus() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        updateUIAfterLogin(currentUser);
    }
}

function updateUIAfterLogin(username) {
    // Nascondi bottoni Register e Login
    document.getElementById('registerBtn').classList.add('hidden');
    document.getElementById('loginBtn').classList.add('hidden');
    
    // Mostra info utente, bottone Utenti e bottone Logout
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('userInfo').textContent = `Benvenuto, ${username}`;
    document.getElementById('usersBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    
    console.log(`Utente ${username} ha effettuato il login`);
}

function logout() {
    localStorage.removeItem('currentUser');
    
    // Ripristina UI
    document.getElementById('registerBtn').classList.remove('hidden');
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('usersBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    
    console.log('Logout effettuato');
    showMessage('Logout effettuato con successo', 'success');
}

function showUsersList() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const currentUser = localStorage.getItem('currentUser');
    const userEntries = Object.entries(users);
    
    if (userEntries.length === 0) {
        document.getElementById('usersContent').innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-users fa-3x text-muted mb-3"></i>
                <p class="text-muted">Nessun utente registrato</p>
            </div>
        `;
    } else {
        // Statistiche
        const totalUsers = userEntries.length;
        const currentUserIndex = userEntries.findIndex(([username]) => username === currentUser) + 1;
        
        // Genera HTML per la lista utenti
        const usersHTML = userEntries.map(([username, userData], index) => {
            const isCurrentUser = username === currentUser;
            const registrationDate = new Date(userData.registeredAt);
            const formattedDate = registrationDate.toLocaleDateString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Avatar con iniziale
            const initial = username.charAt(0).toUpperCase();
            
            return `
                <div class="user-item ${isCurrentUser ? 'current-user' : ''}">
                    <div class="user-avatar">${initial}</div>
                    <div class="user-details">
                        <div class="user-name">
                            ${username}
                            ${isCurrentUser ? '<i class="fas fa-crown text-warning ms-2" title="Sei tu"></i>' : ''}
                        </div>
                        <div class="user-date">Registrato il ${formattedDate}</div>
                    </div>
                    <div class="user-status">
                        ${isCurrentUser ? 'Online' : 'Utente'}
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('usersContent').innerHTML = `
            <div class="users-stats">
                <div class="stats-item">
                    <div class="stats-number">${totalUsers}</div>
                    <div class="stats-label">Utenti Totali</div>
                </div>
                <div class="stats-item">
                    <div class="stats-number">#${currentUserIndex}</div>
                    <div class="stats-label">Il tuo numero</div>
                </div>
            </div>
            <div class="users-list">
                ${usersHTML}
            </div>
        `;
    }
    
    openModal('usersModal');
}

// Chiudi modal cliccando fuori
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('auth-modal')) {
        closeModal(e.target.id);
    }
});

// Chiudi modal con tasto ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.auth-modal');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                closeModal(modal.id);
            }
        });
    }
});

// Funzioni utility originali
function showMessage(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Qui si può implementare un sistema di notifiche
}

// Inizializzazione personalizzata dopo il caricamento completo
window.addEventListener('load', function() {
    showMessage('Pagina completamente caricata', 'success');
});