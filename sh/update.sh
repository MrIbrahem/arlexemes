#!/bin/bash
source ~/.bashrc
TOKEN="${GH_TOKEN}"

if [ -z "$TOKEN" ]; then
    echo "Usage: $0 <TOKEN>"
    exit 1
fi

REPO_URL="https://MrIbrahem:${TOKEN}@github.com/MrIbrahem/arlexemes.git"

BRANCH="${1:-main}"

echo ">>> clone --branch ${BRANCH} ."

cd "$HOME" || { echo "Failed to change directory to home directory"; exit 1; }

echo "Removing old temp_dir directory if exists..."
rm -rf temp_dir

if ! git clone --branch "$BRANCH" "$REPO_URL" "$HOME/temp_dir"; then
    echo "Failed to clone repository" >&2
    exit 1
fi

rm -rf temp_dir/.git

echo "Copying files to public_html..."

cp -rf -v ~/temp_dir/public_html/* ~/public_html/ || { echo "Failed to copy files to public_html directory"; exit 1; }

chmod -R 6774 ~/public_html

rm -rf temp_dir