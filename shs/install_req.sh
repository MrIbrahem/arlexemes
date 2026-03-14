#!/bin/bash

# use bash strict mode
set -euo pipefail

cd $HOME

# Activate the virtual environment and install dependencies
source $HOME/www/python/venv/bin/activate

pip install -r $HOME/www/python/src/requirements.txt
pip install flask flask_cors
pip install tqdm
pip install psutil humanize

exit

webservice python3.11 restart

# toolforge-jobs run installreq --image python3.11 --command "$HOME/install_req.sh"
# toolforge-jobs run installreq --image python3.11 --command "$HOME/sh/install_req.sh"

