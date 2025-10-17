#!/usr/bin/env bash

# ================================
# Script per aggiornare SASS mantenendo la sintassi
# ================================

set -euo pipefail

CSS_FILE="src/assets/css/main.css"
SCSS_FILE="src/assets/css/main.scss"
CONVERTER="scripts/css-to-sass-converter.py"

echo "🎨 Aggiornamento SASS da CSS..."

# Controlla se i file esistono
if [ ! -f "$CSS_FILE" ]; then
    echo "❌ File CSS non trovato: $CSS_FILE"
    exit 1
fi

if [ ! -f "$CONVERTER" ]; then
    echo "❌ Convertitore non trovato: $CONVERTER"
    exit 1
fi

# Backup del file SCSS esistente
if [ -f "$SCSS_FILE" ]; then
    cp "$SCSS_FILE" "${SCSS_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "📁 Backup creato: ${SCSS_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Esegue la conversione
echo "🔄 Converto CSS in SASS..."
if python3 "$CONVERTER" "$CSS_FILE" "$SCSS_FILE"; then
    echo "✅ Conversione SASS completata!"
    echo "📝 File aggiornato: $SCSS_FILE"
    
    # Mostra un'anteprima del file
    echo ""
    echo "🔍 Prime righe del file SASS:"
    head -20 "$SCSS_FILE"
    echo "..."
    echo ""
    
    # Compila SCSS se sass è disponibile
    if command -v sass >/dev/null 2>&1; then
        echo "🔧 Compilo SCSS per verificare la sintassi..."
        if sass "$SCSS_FILE" --check; then
            echo "✅ Sintassi SASS valida!"
        else
            echo "⚠️  Attenzione: errori di sintassi SASS rilevati"
        fi
    else
        echo "ℹ️  Installa 'sass' per la compilazione automatica"
    fi
    
else
    echo "❌ Errore durante la conversione"
    exit 1
fi

echo ""
echo "🎉 Processo completato!"