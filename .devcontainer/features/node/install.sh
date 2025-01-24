#!/usr/bin/env bash

set -e

VERSION=${VERSION:-22.11.0}

MAJOR=$(echo $VERSION | cut -d. -f1)

echo "Activating NodeJS"

curl -fsSL https://deb.nodesource.com/setup_${MAJOR}.x -o- | sudo -E bash

sudo apt-get update --yes
sudo apt-get install --yes --no-install-recommends nodejs=${VERSION}-1nodesource1
