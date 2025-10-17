# Setup Progetto Web con Lando, WSL, Bootstrap, jQuery, Swiper

> Progetto web responsive, sicuro e conforme W3C con automatizzazione completa per sviluppo in ambiente WSL.

## 🚀 Caratteristiche

- **Stack tecnologico**: Bootstrap 5.3.8, jQuery 3.7.1, Swiper 12.x
- **Ambiente di sviluppo**: Lando + Docker + WSL
- **Automatizzazione**: Script di controllo dipendenze, watcher file, pulizia cache
- **Conformità**: HTML5, CSS3, accessibilità W3C
- **Sicurezza**: Best practices implementate

## 📁 Struttura del Progetto

```
project-root/
├─ .lando.yml                 # Configurazione Lando
├─ composer.json              # Dipendenze PHP
├─ package.json               # Dipendenze Node.js
├─ src/                       # Codice sorgente
│  ├─ index.html             # Template HTML principale
│  ├─ assets/
│  │  ├─ css/
│  │  │  ├─ main.css         # CSS principale (monitorato)
│  │  │  ├─ main.scss        # SCSS auto-generato
│  │  │  └─ custom.css       # Stili personalizzati
│  │  ├─ js/
│  │  │  └─ main.js          # JavaScript principale
│  │  └─ img/                # Immagini
│  └─ components/            # Componenti riutilizzabili
├─ scripts/                  # Script di automazione
│  ├─ check-deps.sh         # Controllo dipendenze
│  ├─ run-watcher.sh        # Watcher file CSS
│  └─ generate-scaffold.sh   # Setup iniziale
└─ README.md                 # Documentazione
```

## 🛠️ Requisiti di Sistema

- **WSL2** (Windows Subsystem for Linux) o ambiente Linux
- **Docker Desktop** (compatibile con WSL2)
- **Lando** (ultima versione stabile)
- **Composer** (per dipendenze PHP)
- **Node.js + npm** (per gestione asset)
- **inotify-tools** (per file watching)
- **tmux** (per sessioni multiple - consigliato)

## 🚀 Installazione e Avvio

### 1. Controllo e Installazione Dipendenze

```bash
# Controlla e installa automaticamente le dipendenze mancanti
bash scripts/check-deps.sh
```

### 2. Setup Iniziale (Prima Volta)

```bash
# Esegue lando composer install (una sola volta) e avvia Lando
bash scripts/generate-scaffold.sh
```

### 3. Avvio del Watcher (Seconda Sessione)

```bash
# Avvia il watcher in una sessione tmux separata
tmux new-session -d -s watcher 'bash scripts/run-watcher.sh'

# Per entrare nella sessione watcher
tmux attach -t watcher

# Per uscire dalla sessione: Ctrl+B, poi D
```

## 🔄 Funzionalità del Watcher

Il sistema di watcher monitora automaticamente `src/assets/css/main.css` e:

1. **Aggiorna** `main.scss` con il contenuto di `main.css`
2. **Compila** SCSS → CSS (se sass è disponibile)
3. **Notifica** ogni operazione completata con timestamp
4. **Mantiene** la cronologia delle modifiche

## 📝 Script Disponibili

### Via npm:
```bash
npm run start      # Avvia il progetto (generate-scaffold.sh)
npm run watch      # Avvia il watcher
npm run deps       # Controlla dipendenze
npm run build      # Processo di build
npm run test       # Esegue i test
```

### Via composer:
```bash
composer check-deps      # Controlla dipendenze
composer start-watcher   # Avvia watcher in tmux
composer test           # Esegue PHPUnit
```

### Direttamente:
```bash
bash scripts/check-deps.sh        # Controllo dipendenze
bash scripts/generate-scaffold.sh # Setup iniziale
bash scripts/run-watcher.sh       # Watcher manuale
```

## 🌐 Accesso al Sito

Dopo aver eseguito `lando start`, il sito sarà disponibile su:
- http://mywebsite.lndo.site (URL principale)
- Consultare `lando info` per vedere tutti gli URL disponibili

## 🎨 Sviluppo

### Modifica degli Stili

1. **Modifica** `src/assets/css/main.css`
2. **Salva** il file
3. Il **watcher** aggiorna automaticamente `main.scss`
4. Viene aggiunto un **timestamp** di aggiornamento

### Stili Personalizzati

- `main.css`: Stili principali (monitorati dal watcher)
- `main.scss`: Auto-generato, non modificare manualmente
- `custom.css`: Stili fissi che non devono essere toccati dal watcher

### JavaScript

- `src/assets/js/main.js`: Script principali con jQuery
- Include esempi di gestione eventi e utility functions
- **Sistema di autenticazione completo** con:
  - Registrazione utenti (username e password)
  - Login con validazione credenziali
  - Gestione sessioni con localStorage
  - Logout automatico
  - Interfaccia responsive con modal Bootstrap

## 🔐 Sistema di Autenticazione

Il progetto include un sistema completo di autenticazione con le seguenti funzionalità:

### Funzionalità
- ✅ **Registrazione**: Username (min 3 char) e password (min 4 char)
- ✅ **Login**: Validazione credenziali in tempo reale
- ✅ **Sessioni**: Gestione stato utente con localStorage
- ✅ **Lista Utenti**: Visualizzazione utenti registrati con statistiche
- ✅ **Logout**: Termina sessione e ripristina UI
- ✅ **Validazioni**: Controlli su campi e password matching
- ✅ **UI Responsive**: Modal eleganti con Bootstrap

### Come Usare
1. Vai su `http://mywebsite.lndo.site/auth-test.html` per test completi
2. Clicca **"Register"** per creare un nuovo utente
3. Inserisci credenziali e conferma password
4. Effettua **"Login"** con le credenziali create
5. Una volta loggato, vedrai username, **"Utenti"** e **"Logout"**
6. Clicca **"Utenti"** per vedere la lista di tutti gli utenti registrati
7. Il modal mostra statistiche e dettagli di registrazione

## 🎨 **Design Moderno e Responsive**

Il progetto presenta un design completamente rinnovato e moderno:

### ✨ **Caratteristiche Visive**
- 🎨 **Glassmorphism**: Effetti vetro con backdrop-filter
- 🌈 **Gradienti**: Background e elementi con gradienti CSS avanzati
- 🔤 **Typography**: Font Google Inter per leggibilità ottimale
- 🎭 **Animazioni**: Transizioni fluide e micro-interazioni
- 📱 **Responsive**: Design mobile-first ottimizzato

### 🛠️ **Tecnologie Design**
- **Bootstrap 5.3.8**: Framework responsive
- **Font Awesome 6.0**: Libreria icone moderne
- **Google Fonts**: Tipografia Inter
- **CSS3**: Animazioni, gradienti, backdrop-filter
- **CSS Grid + Flexbox**: Layout moderni

### 📄 **Pagine Disponibili**
- `/` - **Homepage principale** con design moderno
- `/auth-test.html` - **Test autenticazione** con debug
- `/showcase.html` - **Demo completa** di tutte le funzionalità
- `/test.html` - Test CSS legacy

### Storage
I dati utente sono salvati in `localStorage`:
- `users`: Database utenti registrati
- `currentUser`: Utente attualmente loggato

## 🔒 Sicurezza e Conformità

### Sicurezza Implementata:
- ✅ Content Security Policy (CSP) ready
- ✅ Header di sicurezza configurabili
- ✅ Controllo permessi file
- ✅ Dipendenze senza vulnerabilità note

### Accessibilità:
- ✅ Struttura HTML semantica
- ✅ Attributi ARIA dove necessario
- ✅ Contrasto colori sufficiente
- ✅ Focus management
- ✅ Supporto screen reader

### Standard W3C:
- ✅ HTML5 Living Standard
- ✅ CSS3 valido
- ✅ Responsive design
- ✅ Progressive enhancement

## 🐛 Troubleshooting

### Lando non si avvia
```bash
# Verifica Docker Desktop
docker --version
docker ps

# Riavvia Lando
lando restart

# Se hai problemi con MySQL, distruggi e ricrea
lando destroy -y
lando start
```

### Errore MySQL manifest
Se ricevi errori del tipo "manifest for bitnami/mysql:X.X not found":
```bash
# Il file .lando.yml è già configurato con MySQL 8.0
# Distruggi e ricrea l'ambiente
lando destroy -y
lando start
```

### Watcher non funziona
```bash
# Verifica inotify-tools
which inotifywait

# Test manuale
inotifywait -m src/assets/css/main.css
```

### Composer install fallisce
```bash
# Verifica permessi
ls -la composer.json

# Pulizia cache Composer
composer clear-cache
```

### Sessioni tmux
```bash
# Lista sessioni attive
tmux list-sessions

# Termina sessione watcher
tmux kill-session -t watcher

# Nuova sessione
tmux new-session -d -s watcher 'bash scripts/run-watcher.sh'
```

## 📚 Versioni CDN Utilizzate

- **Bootstrap**: 5.3.8
- **jQuery**: 3.7.1  
- **Swiper**: 12.0.2

> Aggiorna le versioni nel file `src/index.html` se necessario.

## 🔧 Comandi Utili

```bash
# Info Lando
lando info

# Log Lando
lando logs

# Shell nel container
lando ssh

# Database (se configurato)
lando db-import database.sql

# Cache clear (per progetti specifici)
# lando drush cr    # Solo per progetti Drupal
lando restart       # Riavvia tutti i servizi

# Stop Lando
lando stop

# Destroy (attenzione: rimuove tutto)
lando destroy
```

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Adattalo liberamente alle tue esigenze.

---

## 🤝 Supporto

Per problemi o suggerimenti:
1. Consulta la sezione **Troubleshooting**
2. Verifica la [documentazione Lando](https://lando.dev)
3. Controlla i log con `lando logs`

---

**Buono sviluppo! 🚀**