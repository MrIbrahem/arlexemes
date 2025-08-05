#!/bin/bash
set -euo pipefail

source ~/.bashrc
TOKEN="${GH_TOKEN}"

if [ -z "$TOKEN" ]; then
    echo "Error: GH_TOKEN environment variable is required"
    exit 1
fi

BRANCH="${1:-main}"
echo ">>> Updating from branch: ${BRANCH}"

REPO_URL="https://MrIbrahem:${TOKEN}@github.com/MrIbrahem/arlexemes.git"

cd "$HOME" || { echo "Failed to change directory to home directory"; exit 1; }

TARGET_DIR="$HOME/www/python/src"
BACKUP_DIR="$HOME/www/python/src_backup_$(date +%Y%m%d_%H%M%S)"
CLONE_DIR="$HOME/srcx"

# If the current folder exists → back it up
if [ -d "$TARGET_DIR" ]; then
    echo "Backing up current source to $BACKUP_DIR"
    mv "$TARGET_DIR" "$BACKUP_DIR"
else
    echo "No existing source found, creating fresh deployment."
fi

# Clean the temporary clone directory
rm -rf "$CLONE_DIR"

# Clone the repository into a temporary folder
if git clone --branch "$BRANCH" "$REPO_URL" "$CLONE_DIR"; then
    echo "Repository cloned successfully."
else
    echo "Failed to clone repository" >&2
    # Restore the backup if it exists
    if [ -d "$BACKUP_DIR" ]; then
        mv "$BACKUP_DIR" "$TARGET_DIR"
    fi
    exit 1
fi

# Move the new version to the final directory
mv "$CLONE_DIR/python/src" "$TARGET_DIR"

cp -rf "$CLONE_DIR/sh/*" "$HOME/sh"
cp -f "$CLONE_DIR/*.yaml" "$HOME/"

chmod -R 6770 ~/sh

# Activate the Python virtual environment and install requirements
if source "$HOME/www/python/venv/bin/activate"; then
    pip install -r "$TARGET_DIR/requirements.txt"
else
    echo "Failed to activate virtual environment" >&2
fi

echo ">>> Update completed successfully."
