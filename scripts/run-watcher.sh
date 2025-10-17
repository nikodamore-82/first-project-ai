#!/usr/bin/env bash
set -euo pipefail

CSS_PATH="src/assets/css/main.css"
SCSS_PATH="src/assets/css/main.scss"

# Crea file se non esistono
mkdir -p "$(dirname "$CSS_PATH")"
touch "$CSS_PATH" "$SCSS_PATH"

echo "Watcher attivo su $CSS_PATH"

while inotifywait -e close_write,moved_to,create "$CSS_PATH"; do
  echo "Rilevata modifica in $CSS_PATH - aggiorno $SCSS_PATH"
  {
    echo "/* auto-generated from main.css on $(date -Iseconds) */"
    echo
    cat "$CSS_PATH"
  } > "$SCSS_PATH"

  # Se si vuole compilare SCSS -> CSS (esempio), usare sass se presente
  if command -v sass >/dev/null 2>&1; then
    echo "Compilo SCSS -> CSS (opzionale)"
    sass "$SCSS_PATH":"$CSS_PATH" || echo "Compilazione SCSS fallita"
  fi

  # Notifica delle modifiche (sostituisce il comando drush per progetti non-Drupal)
  if command -v lando >/dev/null 2>&1; then
    echo "File CSS aggiornato - timestamp: $(date)"
    # Per progetti web statici, possiamo fare un semplice touch per aggiornare il timestamp
    touch "$CSS_PATH"
  fi

  echo "Watcher ciclo completato - in ascolto..."
done