#!/usr/bin/env bash
set -euo pipefail

LOCKFILE=.lando_composer_installed.lock

# Controllo dipendenze
bash scripts/check-deps.sh

# Avvia Docker/Lando in background (assicurarsi che Docker sia running)
# Avvia Lando start solo se necessario, ma non chiameremo composer più di una volta.

if [ ! -f "$LOCKFILE" ]; then
  echo "Eseguo prima installazione composer Lando..."
  lando composer install || { echo "composer install fallito"; exit 1; }
  touch "$LOCKFILE"
  echo "Composer install eseguito e lockfile creato"
else
  echo "Lockfile trovato: salto composer install"
fi

# Ora avviamo Lando (start) se non è già avviato
if ! lando info >/dev/null 2>&1; then
  echo "Avvio Lando..."
  lando start
else
  echo "Lando sembra già attivo"
fi