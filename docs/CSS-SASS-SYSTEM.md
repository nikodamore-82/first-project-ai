# 🎨 Sistema di Gestione CSS/SCSS

## 📋 Panoramica

Questo progetto utilizza un sistema intelligente per mantenere sia file CSS che SCSS sincronizzati, preservando la sintassi SCSS con variabili, mixins e struttura organizzata.

## 🛠️ Strumenti Disponibili

### 1. **Watcher Automatico** (`scripts/run-watcher.sh`)
- **Scopo**: Monitora automaticamente le modifiche al file `main.css`
- **Funzionamento**: Quando `main.css` viene modificato, converte automaticamente il contenuto in `main.scss` mantenendo la sintassi SCSS
- **Utilizzo**: 
  ```bash
  ./scripts/run-watcher.sh
  ```

### 2. **Convertitore CSS→SCSS** (`scripts/css-to-sass-converter.py`)
- **Scopo**: Converte file CSS in SCSS strutturato
- **Caratteristiche**:
  - Mantiene variabili SCSS (`$primary-color`, `$spacer`, etc.)
  - Preserva mixins predefiniti (`@mixin glassmorphism`, `@mixin button-hover`)
  - Organizza il codice in sezioni logiche
  - Sostituisce valori CSS comuni con variabili SCSS
  - **Mantiene sintassi SCSS**: parentesi graffe `{}` e punti e virgola `;`
- **Utilizzo**:
  ```bash
  python3 scripts/css-to-sass-converter.py input.css output.scss
  ```

### 3. **Script di Aggiornamento Manuale** (`scripts/update-sass.sh`)
- **Scopo**: Aggiorna manualmente il file SCSS dal CSS
- **Caratteristiche**:
  - Crea backup automatici
  - Verifica la sintassi SCSS
  - Mostra anteprima del risultato
- **Utilizzo**:
  ```bash
  ./scripts/update-sass.sh
  ```

## 🎯 Variabili SCSS Disponibili

### Colori
```scss
$primary-color: #007bff;
$success-color: #28a745;
$danger-color: #dc3545;
$info-color: #0dcaf0;
$white: #ffffff;
$gray-100: #f8f9fa;
// ... altri colori
```

### Spaziature
```scss
$spacer: 1rem;
$spacer-sm: 0.5rem;
$spacer-lg: 1.5rem;
$spacer-xl: 2rem;
$spacer-xxl: 3rem;
```

### Border Radius
```scss
$border-radius: 10px;
$border-radius-lg: 15px;
$border-radius-xl: 20px;
$border-radius-pill: 25px;
$border-radius-circle: 50%;
```

### Ombre
```scss
$box-shadow-sm: 0 5px 15px rgba(0, 0, 0, 0.1);
$box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
$box-shadow-lg: 0 15px 40px rgba(0, 0, 0, 0.15);
```

## 🧩 Mixins Disponibili

### Glassmorphism
```scss
@include glassmorphism(0.1); // Effetto vetro con opacità personalizzabile
```

### Button Hover
```scss
@include button-hover; // Animazioni hover standardizzate per pulsanti
```

### Animazioni Modal
```scss
@include modal-animation; // Animazioni per modali
@include alert-animation; // Animazioni per alert
```

## 🔄 Workflow Consigliato

### Per Sviluppo Attivo
1. **Avvia il watcher**: `./scripts/run-watcher.sh`
2. **Modifica `main.css`** nel tuo editor
3. **Il sistema aggiorna automaticamente `main.scss`** mantenendo la sintassi SCSS

### Per Aggiornamenti Manuali
1. **Modifica `main.css`**
2. **Esegui**: `./scripts/update-sass.sh`
3. **Verifica il risultato** in `main.scss`

## 📁 Struttura File

```
src/assets/css/
├── main.css      # File CSS principale (sorgente)
└── main.scss     # File SCSS generato (con variabili e mixins)

scripts/
├── run-watcher.sh            # Watcher automatico
├── css-to-sass-converter.py  # Convertitore intelligente
└── update-sass.sh           # Aggiornamento manuale
```

## ⚠️ Note Importanti

1. **File Sorgente**: `main.css` è considerato il file sorgente
2. **Auto-generazione**: `main.scss` viene auto-generato ma mantiene struttura SCSS
3. **Sintassi SCSS**: Mantiene parentesi graffe `{}` e punti e virgola `;`
4. **Backup**: Gli script creano backup automatici prima delle modifiche
5. **Dipendenze**: Richiede Python 3 per la conversione intelligente

## 🚀 Vantaggi

- ✅ **Sintassi SCSS preservata** (variabili, mixins, nesting, `{}`, `;`)
- ✅ **Conversione automatica** CSS → SCSS
- ✅ **Struttura organizzata** con sezioni logiche
- ✅ **Backup automatici** per sicurezza
- ✅ **Validazione sintassi** integrata
- ✅ **Workflow flessibile** (automatico o manuale)

## 🛠️ Troubleshooting

### Watcher non funziona
```bash
# Verifica che inotify-tools sia installato
sudo apt install inotify-tools

# Avvia il watcher manualmente
./scripts/run-watcher.sh
```

### Errori di conversione
```bash
# Usa l'aggiornamento manuale con diagnostica
./scripts/update-sass.sh

# Verifica la sintassi Python
python3 -m py_compile scripts/css-to-sass-converter.py
```

### File SASS corrotto
```bash
# Ripristina da backup
cp src/assets/css/main.scss.backup.YYYYMMDD_HHMMSS src/assets/css/main.scss

# Rigenera da CSS
./scripts/update-sass.sh
```