#!/bin/bash

if [ ! -f ~/bin/docker-compose ]; then
    echo "Installing docker-compose"
    [ -d ~/bin ] || mkdir ~/bin
    curl -L "https://github.com/docker/compose/releases/download/1.9.0/docker-compose-$(uname -s)-$(uname -m)" -o ~/bin/docker-compose
    chmod +x ~/bin/docker-compose
else
    echo "docker-compose already installed"
fi

echo "You need to make sure that $HOME/bin is in PATH"
