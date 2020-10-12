#!/bin/sh

# sudo apt-get update -y
# sudo apt-get install -y xvfb


#cd monopoly-one-bot
xvfb-run -a --server-args="-screen 0 1280x800x24 -ac -nolisten tcp -dpi 96 +extension RANDR" node auto.js
