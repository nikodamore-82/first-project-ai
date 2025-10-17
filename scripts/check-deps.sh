#!/usr/bin/env bash
set -euo pipefail

MISSING=()

function exists() { command -v "$1" >/dev/null 2>&1; }

echo "Controllo dipendenze..."

if ! exists docker; then
  MISSING+=(docker)
fi
if ! exists lando; then
  MISSING+=(lando)
fi
if ! exists composer; then
  MISSING+=(composer)
fi
if ! exists node; then
  MISSING+=(node)
fi
if ! exists npm; then
  MISSING+=(npm)
fi
if ! exists inotifywait; then
  MISSING+=(inotifywait)
fi
if ! exists tmux; then
  MISSING+=(tmux)
fi

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "Tutte le dipendenze sono presenti."
  exit 0
fi

echo "Dipendenze mancanti: ${MISSING[*]}"

# Esempio di installazioni (adattare alla distribuzione WSL):
for pkg in "${MISSING[@]}"; do
  case $pkg in
    docker)
      echo "Installo Docker...";
      sudo apt-get update && sudo apt-get install -y docker.io || true
      ;;
    lando)
      echo "Installo Lando...";
      sudo apt-get install -y lando || echo "Installa Lando manualmente: https://lando.dev";
      ;;
    composer)
      echo "Installo Composer...";
      php -r "copy('https://getcomposer.org/installer','composer-setup.php');";
      php composer-setup.php --install-dir=/usr/local/bin --filename=composer;
      php -r "unlink('composer-setup.php');";
      ;;
    node|npm)
      echo "Installo Node.js + npm...";
      sudo apt-get install -y nodejs npm || sudo apt-get install -y curl && curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs;
      ;;
    inotifywait)
      echo "Installo inotify-tools...";
      sudo apt-get install -y inotify-tools;
      ;;
    tmux)
      echo "Installo tmux...";
      sudo apt-get install -y tmux;
      ;;
    *)
      echo "Installa manualmente: $pkg";
      ;;
  esac
done

echo "Verifiche finali..."
for cmd in docker lando composer node npm inotifywait tmux; do
  if ! exists $cmd; then
    echo "Attenzione: $cmd non trovato dopo tentativo d'installazione"
  else
    echo "$cmd OK"
  fi
done

exit 0