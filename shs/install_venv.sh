#!/bin/bash

# use bash strict mode
set -euo pipefail

mkdir -p $HOME/www/python/src

python3 -m venv $HOME/www/python/venv

# activate it
source $HOME/www/python/venv/bin/activate

# upgrade pip inside the venv and add support for the wheel package format
pip install -U pip wheel

# install some concrete packages
pip install requests --upgrade
pip install flask flask_cors --upgrade
pip install uvicorn python-dotenv --upgrade

# toolforge-jobs run installvenv --image python3.13 --command "$HOME/shs/install_venv.sh"


