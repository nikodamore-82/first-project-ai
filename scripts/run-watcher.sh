#!/usr/bin/env bash
set -euo pipefail

CSS_PATH="src/assets/css/main.css"
SCSS_PATH="src/assets/css/main.scss"
CONVERTER_SCRIPT="scripts/css-to-sass-converter.py"

# Crea file se non esistono
mkdir -p "$(dirname "$CSS_PATH")"
touch "$CSS_PATH" "$SCSS_PATH"

# Rende eseguibile il convertitore
chmod +x "$CONVERTER_SCRIPT" 2>/dev/null || true

echo "🎨 Watcher CSS->SASS attivo su $CSS_PATH"
echo "📝 Manterrà la sintassi SASS con variabili e mixins"

while inotifywait -e close_write,moved_to,create "$CSS_PATH"; do
  echo "🔄 Rilevata modifica in $CSS_PATH - converto in SASS..."
  
  # Usa il convertitore Python per mantenere la sintassi SASS
  if command -v python3 >/dev/null 2>&1; then
    if python3 "$CONVERTER_SCRIPT" "$CSS_PATH" "$SCSS_PATH"; then
      echo "✅ Conversione SASS completata con successo"
    else
      echo "⚠️  Fallback: copia semplice CSS -> SCSS"
      {
        echo "// auto-generated from main.css on $(date -Iseconds)"
        echo "// ATTENZIONE: Conversione SASS fallita, sintassi CSS utilizzata"
        echo
        cat "$CSS_PATH"
      } > "$SCSS_PATH"
    fi
  else
    echo "⚠️  Python3 non disponibile - fallback: copia semplice"
    {
      echo "// auto-generated from main.css on $(date -Iseconds)"
      echo "// ATTENZIONE: Python3 richiesto per conversione SASS"
      echo
      cat "$CSS_PATH"
    } > "$SCSS_PATH"
  fi

  # Compila SCSS -> CSS se sass è disponibile
  if command -v sass >/dev/null 2>&1; then
    echo "🔧 Compilo SCSS -> CSS"
    if sass "$SCSS_PATH":"$CSS_PATH" --no-source-map 2>/dev/null; then
      echo "✅ Compilazione SCSS completata"
    else
      echo "⚠️  Compilazione SCSS fallita (usando CSS originale)"
    fi
  fi

  # Notifica timestamping
  if command -v lando >/dev/null 2>&1; then
    echo "📅 File aggiornato - timestamp: $(date)"
    # Touch per aggiornare il timestamp senza modificare il contenuto
    touch "$CSS_PATH" 2>/dev/null || true
  fi

  echo "👀 Watcher in ascolto per nuove modifiche..."
done