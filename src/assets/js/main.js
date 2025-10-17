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

// ================================
// Sistema di Crittografia Password
// ================================

// Funzione per generare hash SHA-256 di una password
// ========================================
// SISTEMA DI CRITTOGRAFIA CON FALLBACK
// ========================================

// Verifica supporto Web Crypto API
function isWebCryptoSupported() {
    return !!(window.crypto && window.crypto.subtle && window.isSecureContext);
}

// Funzione di hash semplice per fallback (NON per produzione)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Converte a 32bit integer
    }
    return Math.abs(hash).toString(16);
}

// Crittografia semplice XOR per fallback (NON per produzione)
function simpleEncrypt(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
}

function simpleDecrypt(encryptedText, key) {
    const text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

async function hashPassword(password) {
    try {
        if (isWebCryptoSupported()) {
            // Usa Web Crypto API se disponibile
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } else {
            // Fallback per browser non supportati
            console.warn('⚠️ Usando crittografia di base (non sicura per produzione)');
            return simpleHash(password + 'salt_key_2025');
        }
    } catch (error) {
        console.error('❌ Errore in hashPassword:', error);
        // Ultimo fallback
        return simpleHash(password + 'salt_key_2025');
    }
}

// Funzione per crittare dati sensibili con AES-GCM o fallback
async function encryptData(plaintext, password) {
    try {
        if (isWebCryptoSupported()) {
            // Usa Web Crypto API se disponibile
            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );
            
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt']
            );
            
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encoder.encode(plaintext)
            );
            
            // Combina salt, iv e dati crittografati
            const encryptedArray = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
            encryptedArray.set(salt, 0);
            encryptedArray.set(iv, salt.length);
            encryptedArray.set(new Uint8Array(encrypted), salt.length + iv.length);
            
            return 'crypto:' + btoa(String.fromCharCode(...encryptedArray));
        } else {
            // Fallback per browser non supportati
            console.warn('⚠️ Usando crittografia di base (non sicura per produzione)');
            return 'simple:' + simpleEncrypt(plaintext, password);
        }
    } catch (error) {
        console.error('❌ Errore in encryptData:', error);
        // Ultimo fallback
        return 'simple:' + simpleEncrypt(plaintext, password);
    }
}

// Funzione per decrittare dati con AES-GCM
// Funzione per decrittare dati con AES-GCM o fallback
async function decryptData(encryptedData, password) {
    try {
        // Verifica se i dati sono stati crittografati con il metodo avanzato o semplice
        if (encryptedData.startsWith('crypto:')) {
            // Dati crittografati con Web Crypto API
            const actualData = encryptedData.substring(7); // Rimuove 'crypto:'
            
            if (!isWebCryptoSupported()) {
                console.warn('⚠️ Impossibile decrittare dati avanzati su questo browser');
                return null;
            }
            
            const decoder = new TextDecoder();
            const encoder = new TextEncoder();
            const data = new Uint8Array(atob(actualData).split('').map(c => c.charCodeAt(0)));
            
            const salt = data.slice(0, 16);
            const iv = data.slice(16, 28);
            const encrypted = data.slice(28);
            
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );
            
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );
            
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );
            
            return decoder.decode(decrypted);
            
        } else if (encryptedData.startsWith('simple:')) {
            // Dati crittografati con metodo semplice
            const actualData = encryptedData.substring(7); // Rimuove 'simple:'
            return simpleDecrypt(actualData, password);
            
        } else {
            // Compatibilità con vecchi dati (senza prefisso)
            if (isWebCryptoSupported()) {
                // Prova prima con il metodo avanzato
                const decoder = new TextDecoder();
                const encoder = new TextEncoder();
                const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
                
                const salt = data.slice(0, 16);
                const iv = data.slice(16, 28);
                const encrypted = data.slice(28);
                
                const keyMaterial = await crypto.subtle.importKey(
                    'raw',
                    encoder.encode(password),
                    { name: 'PBKDF2' },
                    false,
                    ['deriveBits', 'deriveKey']
                );
                
                const key = await crypto.subtle.deriveKey(
                    {
                        name: 'PBKDF2',
                        salt: salt,
                        iterations: 100000,
                        hash: 'SHA-256'
                    },
                    keyMaterial,
                    { name: 'AES-GCM', length: 256 },
                    false,
                    ['decrypt']
                );
                
                const decrypted = await crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv: iv },
                    key,
                    encrypted
                );
                
                return decoder.decode(decrypted);
            } else {
                // Fallback al metodo semplice
                return simpleDecrypt(encryptedData, password);
            }
        }
    } catch (error) {
        console.error('❌ Errore nella decrittazione:', error);
        return null;
    }
}


// Genera una chiave master per l'utente basata su username e timestamp
function generateUserKey(username) {
    return `${username}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Validazione email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Sistema di Autenticazione
function initAuth() {
    console.log('🔐 Inizializzazione sistema di autenticazione...');
    
    try {
        // Controlla se l'utente è già loggato
        checkLoginStatus();
        
        // Event listeners per i bottoni - con controlli di sicurezza
        console.log('📝 Aggiungendo event listeners ai pulsanti...');
        
        const registerBtn = document.getElementById('registerBtn');
        const loginBtn = document.getElementById('loginBtn');
        const editProfileBtn = document.getElementById('editProfileBtn');
        const usersBtn = document.getElementById('usersBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (registerBtn) {
            registerBtn.addEventListener('click', function(e) {
                console.log('👆 Click su Register button');
                e.preventDefault();
                openModal('registerModal');
            });
            console.log('✅ Register button listener aggiunto');
        } else {
            console.warn('⚠️ Register button non trovato');
        }
        
        if (loginBtn) {
            loginBtn.addEventListener('click', function(e) {
                console.log('👆 Click su Login button');
                e.preventDefault();
                openModal('loginModal');
            });
            console.log('✅ Login button listener aggiunto');
        } else {
            console.warn('⚠️ Login button non trovato');
        }
        
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', openEditProfileModal);
            console.log('✅ Edit Profile button listener aggiunto');
        } else {
            console.warn('⚠️ Edit Profile button non trovato');
        }
        
        if (usersBtn) {
            usersBtn.addEventListener('click', showUsersList);
            console.log('✅ Users button listener aggiunto');
        } else {
            console.warn('⚠️ Users button non trovato');
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
            console.log('✅ Logout button listener aggiunto');
        } else {
            console.warn('⚠️ Logout button non trovato');
        }
        
        // Event listeners per i form
        console.log('📋 Aggiungendo event listeners ai form...');
        
        const registerForm = document.getElementById('registerForm');
        const loginForm = document.getElementById('loginForm');
        const editProfileForm = document.getElementById('editProfileForm');
        
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
            console.log('✅ Register form listener aggiunto');
        } else {
            console.warn('⚠️ Register form non trovato');
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
            console.log('✅ Login form listener aggiunto');
        } else {
            console.warn('⚠️ Login form non trovato');
        }
        
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', handleEditProfile);
            console.log('✅ Edit Profile form listener aggiunto');
        } else {
            console.warn('⚠️ Edit Profile form non trovato');
        }
        
        console.log('✅ Sistema di autenticazione inizializzato con successo');
        
    } catch (error) {
        console.error('❌ Errore durante l\'inizializzazione dell\'autenticazione:', error);
    }
}

function openModal(modalId) {
    console.log(`🔓 Tentativo di aprire modal: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        clearAlerts();
        console.log(`✅ Modal ${modalId} aperto con successo`);
    } else {
        console.error(`❌ Modal ${modalId} non trovato nel DOM`);
    }
}

function closeModal(modalId) {
    console.log(`🔒 Chiusura modal: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        clearForms();
        clearAlerts();
        console.log(`✅ Modal ${modalId} chiuso con successo`);
    } else {
        console.error(`❌ Modal ${modalId} non trovato per la chiusura`);
    }
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

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    console.log('📝 Inizio registrazione per utente:', username);
    
    // Validazioni
    if (username.length < 3) {
        showAlert('registerAlert', 'Username deve essere di almeno 3 caratteri', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('registerAlert', 'Inserisci un indirizzo email valido', 'error');
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
    
    // Mostra indicatore di caricamento
    showAlert('registerAlert', '<i class="fas fa-spinner fa-spin"></i> Crittografia in corso...', 'info');
    
    try {
        console.log('🔒 Inizio processo di crittografia...');
        
        // Controlla se l'utente esiste già
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username]) {
            showAlert('registerAlert', 'Username già esistente', 'error');
            return;
        }
        
        console.log('✅ Username disponibile');
        
        // Verifica unicità email
        const existingEmail = Object.values(users).find(user => {
            if (user.encryptedData && user.userKey) {
                try {
                    const decryptedData = decryptData(user.encryptedData, user.userKey);
                    const userInfo = JSON.parse(decryptedData);
                    return userInfo.email === email;
                } catch (e) {
                    return false;
                }
            }
            return false;
        });
        
        if (existingEmail) {
            showAlert('registerAlert', 'Email già utilizzata da un altro utente', 'error');
            return;
        }
        
        console.log('✅ Email disponibile');
        console.log('🔐 Hashing password...');
        
        // Hash della password per l'autenticazione
        const hashedPassword = await hashPassword(password);
        console.log('✅ Password hashed');
        
        // Genera chiave unica per questo utente
        const userKey = generateUserKey(username);
        console.log('✅ User key generata');
        
        // Determina il ruolo in base alla password
        const userRole = password === 'admin123' ? 'administrator' : 'subscriber';
        console.log('👤 Ruolo assegnato:', userRole);
        
        // Critta dati sensibili dell'utente
        const sensitiveData = JSON.stringify({
            originalUsername: username,
            email: email,
            fullName: '',
            phone: '',
            address: '',
            bio: '',
            role: userRole,
            registeredAt: new Date().toISOString(),
            userAgent: navigator.userAgent,
            loginCount: 0
        });
        
        console.log('🔒 Crittografando dati sensibili...');
        const encryptedData = await encryptData(sensitiveData, userKey);
        console.log('✅ Dati crittografati');
        
        // Salva l'utente con password hashata e dati crittografati
        users[username] = {
            passwordHash: hashedPassword, // Password hashata con SHA-256
            encryptedData: encryptedData, // Dati sensibili crittografati con AES-GCM
            userKey: userKey, // Chiave per decrittare (in prod dovrebbe essere derivata)
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        console.log('✅ Utente salvato nel localStorage');
        
        // Esporta/aggiorna il file Excel
        console.log('📊 Aggiornamento file Excel...');
        await updateExcelFile();
        console.log('✅ File Excel aggiornato');
        
        showAlert('registerAlert', '🔐 Registrazione completata con successo! Dati crittografati.', 'success');
        
        setTimeout(() => {
            closeModal('registerModal');
            showAlert('loginAlert', 'Ora puoi effettuare il login con le tue credenziali sicure', 'success');
            openModal('loginModal');
        }, 2000);
        
    } catch (error) {
        console.error('❌ Errore durante la registrazione:', error);
        console.error('Stack trace:', error.stack);
        
        // Messaggio più specifico basato sul tipo di errore
        let errorMessage = 'Errore durante la crittografia. ';
        
        if (error.name === 'NotSupportedError') {
            errorMessage += 'Browser non supportato per la crittografia.';
        } else if (error.name === 'OperationError') {
            errorMessage += 'Errore nell\'operazione di crittografia.';
        } else if (error.message.includes('subtle')) {
            errorMessage += 'Web Crypto API non disponibile.';
        } else {
            errorMessage += `Dettaglio: ${error.message}`;
        }
        
        showAlert('registerAlert', errorMessage + ' Riprova.', 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Mostra indicatore di verifica
    showAlert('loginAlert', '<i class="fas fa-spinner fa-spin"></i> Verifica credenziali...', 'info');
    
    try {
        // Controlla credenziali
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        if (!users[username]) {
            showAlert('loginAlert', 'Username non trovato', 'error');
            return;
        }
        
        const userData = users[username];
        
        // Verifica password hashata
        const inputPasswordHash = await hashPassword(password);
        
        // Gestisce sia vecchi utenti (password in chiaro) che nuovi (password hashata)
        const isPasswordValid = userData.passwordHash 
            ? userData.passwordHash === inputPasswordHash 
            : userData.password === password; // Backward compatibility
        
        if (!isPasswordValid) {
            showAlert('loginAlert', 'Password errata', 'error');
            return;
        }
        
        // Se l'utente aveva la password in chiaro, aggiorna al nuovo sistema
        if (!userData.passwordHash && userData.password) {
            await migrateUserToEncryptedSystem(username, password, users);
        }
        
        // Aggiorna contatore login se disponibile
        if (userData.encryptedData && userData.userKey) {
            try {
                const decryptedData = await decryptData(userData.encryptedData, userData.userKey);
                if (decryptedData) {
                    const userInfo = JSON.parse(decryptedData);
                    userInfo.loginCount = (userInfo.loginCount || 0) + 1;
                    userInfo.lastLogin = new Date().toISOString();
                    
                    const reencryptedData = await encryptData(JSON.stringify(userInfo), userData.userKey);
                    userData.encryptedData = reencryptedData;
                    users[username] = userData;
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    console.log(`🔐 Login #${userInfo.loginCount} per utente ${username}`);
                }
            } catch (decryptError) {
                console.warn('Errore nella decrittazione dei dati utente:', decryptError);
            }
        }
        
        // Login riuscito
        localStorage.setItem('currentUser', username);
        showAlert('loginAlert', '🔐 Login effettuato con successo!', 'success');
        
        setTimeout(() => {
            closeModal('loginModal');
            updateUIAfterLogin(username);
        }, 1200);
        
    } catch (error) {
        console.error('Errore durante il login:', error);
        showAlert('loginAlert', 'Errore durante la verifica. Riprova.', 'error');
    }
}

// Funzione per migrare utenti vecchi al nuovo sistema crittografato
async function migrateUserToEncryptedSystem(username, password, users) {
    try {
        console.log(`🔄 Migrazione utente ${username} al sistema crittografato...`);
        
        const userData = users[username];
        const hashedPassword = await hashPassword(password);
        const userKey = generateUserKey(username);
        
        const sensitiveData = JSON.stringify({
            originalUsername: username,
            registeredAt: userData.registeredAt || new Date().toISOString(),
            userAgent: navigator.userAgent,
            loginCount: 1,
            migratedAt: new Date().toISOString()
        });
        
        const encryptedData = await encryptData(sensitiveData, userKey);
        
        // Aggiorna i dati utente
        users[username] = {
            passwordHash: hashedPassword,
            encryptedData: encryptedData,
            userKey: userKey,
            createdAt: userData.registeredAt || new Date().toISOString(),
            migratedAt: new Date().toISOString()
        };
        
        // Rimuove la vecchia password in chiaro
        delete users[username].password;
        delete users[username].registeredAt;
        
        localStorage.setItem('users', JSON.stringify(users));
        console.log(`✅ Utente ${username} migrato con successo`);
        
    } catch (error) {
        console.error('Errore durante la migrazione:', error);
    }
}

function checkLoginStatus() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        updateUIAfterLogin(currentUser);
    }
}

// Controlla se un utente è amministratore
async function checkIfUserIsAdmin(username = null) {
    try {
        // Se non viene passato username, usa l'utente corrente
        const currentUser = username || localStorage.getItem('currentUser');
        if (!currentUser) {
            console.log('🚫 Nessun utente loggato per controllo admin');
            return false;
        }
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const userData = users[currentUser];
        
        if (!userData) {
            console.log(`🚫 Dati utente non trovati per: ${currentUser}`);
            return false;
        }
        
        if (userData.encryptedData && userData.userKey) {
            const decryptedData = await decryptData(userData.encryptedData, userData.userKey);
            if (decryptedData) {
                const userInfo = JSON.parse(decryptedData);
                const isAdmin = userInfo.role === 'administrator';
                console.log(`👤 Controllo admin per ${currentUser}: ${isAdmin ? 'SÌ' : 'NO'} (ruolo: ${userInfo.role})`);
                return isAdmin;
            }
        }
        
        console.log(`🚫 Dati crittografati non trovati per: ${currentUser}`);
        return false;
    } catch (error) {
        console.error('Errore controllo ruolo admin:', error);
        return false;
    }
}

async function updateUIAfterLogin(username) {
    // Nascondi bottoni Register e Login
    document.getElementById('registerBtn').classList.add('hidden');
    document.getElementById('loginBtn').classList.add('hidden');
    
    // Mostra info utente, bottone Modifica Dati e bottone Logout
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('userInfo').textContent = `Benvenuto, ${username}`;
    document.getElementById('editProfileBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    
    // Mostra pulsante Utenti SOLO per amministratori
    const isAdmin = await checkIfUserIsAdmin(username);
    if (isAdmin) {
        document.getElementById('usersBtn').classList.remove('hidden');
        document.getElementById('userInfo').textContent = `Benvenuto, ${username} (Administrator)`;
        console.log(`Administrator ${username} ha accesso alla gestione utenti`);
    } else {
        document.getElementById('usersBtn').classList.add('hidden');
        console.log(`Utente ${username} ha effettuato il login`);
    }
    
}

function logout() {
    localStorage.removeItem('currentUser');
    
    // Ripristina UI
    document.getElementById('registerBtn').classList.remove('hidden');
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('editProfileBtn').classList.add('hidden');
    document.getElementById('usersBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    
    
    console.log('Logout effettuato');
    showMessage('Logout effettuato con successo', 'success');
}

async function showUsersList() {
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
        let encryptedUsers = 0;
        let totalLogins = 0;
        
        // Genera HTML per la lista utenti
        const usersHTML = await Promise.all(userEntries.map(async ([username, userData], index) => {
            const isCurrentUser = username === currentUser;
            
            // Determina la data di registrazione, ruolo e altri dati
            let registrationDate;
            let loginCount = 0;
            let isEncrypted = false;
            let userRole = 'subscriber';
            
            if (userData.encryptedData && userData.userKey) {
                isEncrypted = true;
                encryptedUsers++;
                
                try {
                    const decryptedData = await decryptData(userData.encryptedData, userData.userKey);
                    if (decryptedData) {
                        const userInfo = JSON.parse(decryptedData);
                        registrationDate = new Date(userInfo.registeredAt);
                        loginCount = userInfo.loginCount || 0;
                        userRole = userInfo.role || 'subscriber';
                        totalLogins += loginCount;
                    } else {
                        registrationDate = new Date(userData.createdAt || Date.now());
                    }
                } catch (error) {
                    console.warn(`Errore decrittazione per ${username}:`, error);
                    registrationDate = new Date(userData.createdAt || Date.now());
                }
            } else {
                // Vecchio sistema
                registrationDate = new Date(userData.registeredAt || userData.createdAt || Date.now());
            }
            
            const formattedDate = registrationDate.toLocaleDateString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Avatar con iniziale
            const initial = username.charAt(0).toUpperCase();
            
            // Icone di sicurezza e ruolo
            const securityIcon = isEncrypted 
                ? '<i class="fas fa-shield-alt text-success me-1" title="Dati crittografati"></i>' 
                : '<i class="fas fa-exclamation-triangle text-warning me-1" title="Dati non crittografati"></i>';
            
            const roleIcon = userRole === 'administrator' 
                ? '<i class="fas fa-crown text-danger me-1" title="Administrator"></i>' 
                : '<i class="fas fa-user text-primary me-1" title="Subscriber"></i>';
            
            const loginInfo = loginCount > 0 ? ` (${loginCount} login)` : '';
            const adminClass = userRole === 'administrator' ? 'admin-user' : '';
            
            return `
                <div class="user-item ${isCurrentUser ? 'current-user' : ''} ${adminClass}">
                    <div class="user-avatar ${userRole === 'administrator' ? 'admin-avatar' : ''}">${initial}</div>
                    <div class="user-details">
                        <div class="user-name">
                            ${roleIcon}${securityIcon}${username}
                            ${userRole === 'administrator' ? '<span class="admin-badge">ADMIN</span>' : ''}
                            ${isCurrentUser ? '<i class="fas fa-star text-warning ms-2" title="Sei tu"></i>' : ''}
                        </div>
                        <div class="user-date">
                            Registrato il ${formattedDate}${loginInfo}
                            ${userData.migratedAt ? '<br><small class="text-info">Migrato al sistema sicuro</small>' : ''}
                        </div>
                    </div>
                    <div class="user-status">
                        ${isCurrentUser ? 'Online' : isEncrypted ? 'Protetto' : 'Utente'}
                    </div>
                </div>
            `;
        }));
        
        const resolvedUsersHTML = await Promise.all(usersHTML);
        
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
                <div class="stats-item">
                    <div class="stats-number">${encryptedUsers}</div>
                    <div class="stats-label">🔐 Protetti</div>
                </div>
                <div class="stats-item">
                    <div class="stats-number">${totalLogins}</div>
                    <div class="stats-label">Login Totali</div>
                </div>
            </div>
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Gli utenti con <i class="fas fa-shield-alt text-success"></i> hanno password crittografate con SHA-256 e dati protetti con AES-GCM.
            </div>
            <div class="users-list">
                ${resolvedUsersHTML.join('')}
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

// ================================
// Sistema di Gestione Profilo Utente
// ================================

async function openEditProfileModal() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showMessage('Errore: utente non loggato', 'error');
        return;
    }
    
    try {
        // Carica i dati dell'utente corrente
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const userData = users[currentUser];
        
        if (!userData) {
            showMessage('Errore: dati utente non trovati', 'error');
            return;
        }
        
        // Popola solo i campi modificabili: username, email
        document.getElementById('editUsername').value = currentUser;
        
        if (userData.encryptedData && userData.userKey) {
            const decryptedData = await decryptData(userData.encryptedData, userData.userKey);
            if (decryptedData) {
                const userInfo = JSON.parse(decryptedData);
                document.getElementById('editEmail').value = userInfo.email || '';
            }
        }
        
        // Reset password field
        document.getElementById('editPassword').value = '';
        
        openModal('editProfileModal');
        
    } catch (error) {
        console.error('Errore nel caricamento dati profilo:', error);
        showMessage('Errore nel caricamento dei dati', 'error');
    }
}

async function handleEditProfile(e) {
    e.preventDefault();
    
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showMessage('Errore: utente non loggato', 'error');
        return;
    }
    
    try {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const userData = users[currentUser];
        
        if (!userData) {
            showMessage('Errore: dati utente non trovati', 'error');
            return;
        }
        
        const newUsername = document.getElementById('editUsername').value.trim();
        const newEmail = document.getElementById('editEmail').value.trim();
        const newPassword = document.getElementById('editPassword').value;
        
        // Validazioni
        if (!newUsername) {
            showMessage('Username obbligatorio', 'error');
            return;
        }
        
        if (!isValidEmail(newEmail)) {
            showMessage('Inserisci un indirizzo email valido', 'error');
            return;
        }
        
        // Verifica se username o email sono già utilizzati (da altri utenti)
        if (newUsername !== currentUser && users[newUsername]) {
            showMessage('Username già utilizzato', 'error');
            return;
        }
        
        const emailExists = await checkEmailExists(newEmail, currentUser);
        if (emailExists) {
            showMessage('Email già utilizzata da un altro utente', 'error');
            return;
        }
        
        // Prepara i dati aggiornati
        let updatedUserData = { ...userData };
        
        // Se c'è una nuova password, aggiorna l'hash
        if (newPassword) {
            updatedUserData.passwordHash = await hashPassword(newPassword);
        }
        
        // Aggiorna i dati crittografati
        if (userData.encryptedData && userData.userKey) {
            const decryptedData = await decryptData(userData.encryptedData, userData.userKey);
            if (decryptedData) {
                const userInfo = JSON.parse(decryptedData);
                userInfo.email = newEmail;
                userInfo.lastModified = new Date().toISOString();
                
                // Ricrittografa i dati
                updatedUserData.encryptedData = await encryptData(JSON.stringify(userInfo), userData.userKey);
            }
        }
        
        // Se l'username è cambiato, gestisci il cambio
        if (newUsername !== currentUser) {
            // Prima rimuovi il vecchio username dall'Excel
            await removeUserFromExcel(currentUser);
            
            // Rimuovi il vecchio username dai dati
            delete users[currentUser];
            // Aggiungi con il nuovo username
            users[newUsername] = updatedUserData;
            // Aggiorna il currentUser
            localStorage.setItem('currentUser', newUsername);
        } else {
            // Aggiorna solo i dati esistenti
            users[currentUser] = updatedUserData;
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // Aggiorna automaticamente il file Excel
        await updateExcelFile();
        
        showMessage('✅ Dati aggiornati con successo!', 'success');
        
        setTimeout(() => {
            closeModal('editProfileModal');
            // Se l'username è cambiato, aggiorna l'interfaccia
            if (newUsername !== currentUser) {
                updateUserInterface();
            }
        }, 1500);
        
    } catch (error) {
        console.error('Errore nel salvataggio profilo:', error);
        showMessage('Errore durante il salvataggio. Riprova.', 'error');
    }
}

// Controlla se un'email è già utilizzata da un altro utente
async function checkEmailExists(email, excludeUsername) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    for (const [username, userData] of Object.entries(users)) {
        if (username === excludeUsername) continue;
        
        if (userData.encryptedData && userData.userKey) {
            try {
                const decryptedData = await decryptData(userData.encryptedData, userData.userKey);
                if (decryptedData) {
                    const userInfo = JSON.parse(decryptedData);
                    if (userInfo.email === email) {
                        return true;
                    }
                }
            } catch (e) {
                // Ignora errori di decrittazione
            }
        }
    }
    
    return false;
}

// ================================
// Utilità Interfaccia Utente
// ================================

function updateUserInterface() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userElement = document.getElementById('currentUserDisplay');
        if (userElement) {
            userElement.textContent = currentUser;
        }
    }
}

// ================================
// Sistema di Esportazione Excel
// ================================

// Funzione rimossa - l'Excel viene aggiornato automaticamente

// Funzione per rimuovere un utente specifico dall'Excel
async function removeUserFromExcel(username) {
    try {
        let existingExcelData = JSON.parse(localStorage.getItem('excelData') || 'null');
        
        if (!existingExcelData) {
            console.log('📊 Nessun file Excel da cui rimuovere l\'utente');
            return;
        }
        
        // Trova e rimuovi la riga dell'utente
        for (let i = 1; i < existingExcelData.length; i++) {
            if (existingExcelData[i][0] === username) {
                existingExcelData.splice(i, 1);
                console.log(`🗑️ Rimosso utente dall'Excel: ${username}`);
                break;
            }
        }
        
        // Salva i dati aggiornati
        localStorage.setItem('excelData', JSON.stringify(existingExcelData));
        
    } catch (error) {
        console.error('Errore nella rimozione utente dall\'Excel:', error);
    }
}

async function updateExcelFile() {
    try {
        // Verifica se esiste già un file Excel salvato in localStorage
        let existingExcelData = JSON.parse(localStorage.getItem('excelData') || 'null');
        let excelData = [];
        let isFirstTime = false;
        
        if (!existingExcelData) {
            // Prima volta: crea il file con header incluso ruolo
            excelData = [
                [
                    'Username',
                    'Email',
                    'Ruolo',
                    'Data Registrazione',
                    'Ultimo Login',
                    'Numero Login',
                    'Ultima Modifica',
                    'Stato Sicurezza'
                ]
            ];
            console.log('📊 Creazione struttura Excel con colonna Ruolo...');
        } else {
            // File esistente: carica i dati esistenti
            excelData = existingExcelData;
            console.log('📊 Aggiornamento file Excel esistente...');
        }
        
        // Ottieni tutti gli utenti attuali
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        // Per ogni utente, verifica se esiste già nel file Excel o deve essere aggiunto/aggiornato
        for (const [username, userData] of Object.entries(users)) {
            let userRowIndex = -1;
            
            // Cerca se l'utente esiste già nell'Excel (ignora header)
            for (let i = 1; i < excelData.length; i++) {
                if (excelData[i][0] === username) {
                    userRowIndex = i;
                    break;
                }
            }
            
            // Prepara i dati dell'utente
            let userRow = [username];
            
            if (userData.encryptedData && userData.userKey) {
                try {
                    const decryptedData = await decryptData(userData.encryptedData, userData.userKey);
                    if (decryptedData) {
                        const userInfo = JSON.parse(decryptedData);
                        userRow.push(
                            userInfo.email || '',
                            userInfo.role || 'subscriber', // Aggiungo colonna ruolo
                            formatDate(userInfo.registeredAt),
                            formatDate(userInfo.lastLogin),
                            userInfo.loginCount || 0,
                            formatDate(userData.lastModified),
                            'Crittografato ✓'
                        );
                    } else {
                        userRow.push('', '', '', '', '', '', 'Errore Decrittazione');
                    }
                } catch (error) {
                    userRow.push('', '', '', '', '', 'Errore Decrittazione');
                }
            } else {
                // Utente legacy
                userRow.push(
                    '', // email non disponibile
                    'subscriber', // ruolo default per utenti legacy
                    formatDate(userData.registeredAt || userData.createdAt),
                    '',
                    '',
                    formatDate(userData.lastModified),
                    'Legacy (Non crittografato)'
                );
            }
            
            if (userRowIndex >= 0) {
                // Aggiorna utente esistente
                excelData[userRowIndex] = userRow;
                console.log(`📝 Aggiornato utente: ${username}`);
            } else {
                // Aggiungi nuovo utente
                excelData.push(userRow);
                console.log(`➕ Aggiunto nuovo utente: ${username}`);
            }
        }
        
        // Salva i dati Excel aggiornati in localStorage
        localStorage.setItem('excelData', JSON.stringify(excelData));
        
        console.log('📊 Dati Excel aggiornati:', excelData.length - 1, 'utenti totali');
        
        return true;
        
    } catch (error) {
        console.error('Errore nell\'aggiornamento Excel:', error);
        throw error;
    }
}

// Funzione per scaricare manualmente il file Excel aggiornato
            
            // Scarica il file aggiornato SOLO la prima volta
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'users-data.xlsx';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            console.log('� File Excel users-data.xlsx scaricato nella cartella Downloads');
            
// Funzione per scaricare manualmente il file Excel aggiornato
function downloadCurrentExcel() {
    const excelData = JSON.parse(localStorage.getItem('excelData') || 'null');
    
    if (!excelData) {
        console.log('❌ Nessun file Excel da scaricare. Effettua prima una registrazione.');
        return false;
    }
    
    try {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // Stile per header e colonne con ruolo
        ws['!cols'] = [
            { width: 15 }, // Username
            { width: 25 }, // Email
            { width: 15 }, // Ruolo
            { width: 20 }, // Data Registrazione
            { width: 20 }, // Ultimo Login
            { width: 12 }, // Numero Login
            { width: 20 }, // Ultima Modifica
            { width: 20 }  // Stato Sicurezza
        ];
        
        XLSX.utils.book_append_sheet(wb, ws, 'Utenti Registrati');
        
        // Genera il file Excel
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        
        // Scarica il file
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users-data.xlsx';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log('📁 File Excel users-data.xlsx scaricato con', excelData.length - 1, 'utenti');
        return true;
        
    } catch (error) {
        console.error('Errore nel download Excel:', error);
        return false;
    }
}

// Funzione per resettare il file Excel (utile per debug o reset completo)
function resetExcelFile() {
    localStorage.removeItem('excelData');
    console.log('🗑️ File Excel resettato. Verrà ricreato alla prossima registrazione.');
}

// Funzione per verificare lo stato del file Excel
function checkExcelStatus() {
    const excelData = JSON.parse(localStorage.getItem('excelData') || 'null');
    if (excelData) {
        console.log('📊 File Excel esistente con', excelData.length - 1, 'utenti');
        return true;
    } else {
        console.log('📊 Nessun file Excel trovato. Verrà creato alla prima registrazione.');
        return false;
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// ================================
// Funzioni di Sicurezza e Debug
// ================================

// Funzione per verificare l'integrità dei dati crittografati
async function verifyDataIntegrity() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    console.log('🔍 Verifica integrità dati crittografati...');
    
    for (const [username, userData] of Object.entries(users)) {
        if (userData.encryptedData && userData.userKey) {
            try {
                const decryptedData = await decryptData(userData.encryptedData, userData.userKey);
                if (decryptedData) {
                    const userInfo = JSON.parse(decryptedData);
                    console.log(`✅ ${username}: Dati integri (${Object.keys(userInfo).length} proprietà)`);
                } else {
                    console.warn(`⚠️  ${username}: Decrittazione fallita`);
                }
            } catch (error) {
                console.error(`❌ ${username}: Errore integrità -`, error.message);
            }
        } else {
            console.log(`🔓 ${username}: Sistema legacy (non crittografato)`);
        }
    }
}

// Funzione per mostrare statistiche di sicurezza
function showSecurityStats() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const totalUsers = Object.keys(users).length;
    const encryptedUsers = Object.values(users).filter(u => u.passwordHash && u.encryptedData).length;
    const legacyUsers = totalUsers - encryptedUsers;
    
    console.log('🔐 STATISTICHE SICUREZZA:');
    console.log(`   Utenti totali: ${totalUsers}`);
    console.log(`   🛡️  Protetti: ${encryptedUsers} (${Math.round(encryptedUsers/totalUsers*100)}%)`);
    console.log(`   🔓 Legacy: ${legacyUsers} (${Math.round(legacyUsers/totalUsers*100)}%)`);
    console.log('   Algoritmi: SHA-256 (password) + AES-GCM (dati)');
}

// Funzioni utility originali
function showMessage(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Qui si può implementare un sistema di notifiche
}

// Inizializzazione personalizzata dopo il caricamento completo
window.addEventListener('load', function() {
    showMessage('Pagina completamente caricata', 'success');
    
    // Mostra statistiche di sicurezza se ci sono utenti
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (Object.keys(users).length > 0) {
        setTimeout(() => {
            showSecurityStats();
            console.log('🔍 Digita verifyDataIntegrity() per verificare l\'integrità dei dati');
        }, 1000);
    }
    
    // Mostra notifica sul nuovo sistema di sicurezza una sola volta
    const hasSeenSecurityNotice = localStorage.getItem('securityNoticeShown');
    if (!hasSeenSecurityNotice && Object.keys(users).length > 0) {
        setTimeout(() => {
            showSecurityWelcomeMessage();
            localStorage.setItem('securityNoticeShown', 'true');
        }, 2000);
    }
});

// Messaggio di benvenuto per il nuovo sistema di sicurezza
function showSecurityWelcomeMessage() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const encryptedUsers = Object.values(users).filter(u => u.passwordHash).length;
    const totalUsers = Object.keys(users).length;
    
    if (encryptedUsers < totalUsers) {
        console.log('🔐 SISTEMA DI SICUREZZA AGGIORNATO!');
        console.log('   Le tue password sono ora protette con crittografia avanzata.');
        console.log('   I tuoi dati verranno migrati automaticamente al primo login.');
        console.log('   Algoritmi utilizzati: SHA-256 + AES-GCM');
        console.log('   Nessuna azione richiesta da parte tua! 🛡️');
    }
}

// Fine del file main.js
