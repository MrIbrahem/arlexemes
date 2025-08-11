#!/bin/bash
set -euo pipefail

cd $HOME

source $HOME/www/python/venv/bin/activate

python3 python3 www/python/src/jobs/update_wd/wd_data.py
