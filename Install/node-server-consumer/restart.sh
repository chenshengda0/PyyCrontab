#!/bin/bash
screen -S DexNodeApi -X quit
screen -dmS DexNodeApi
screen -x -S DexNodeApi -p 0 -X stuff $'/usr/local/bin/node /opt/build/index.js >> /opt/build/log.md'
screen -x -S DexNodeApi -p 0 -X stuff $'\n'

echo "重启api"
