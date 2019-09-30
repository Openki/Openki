#!/bin/bash

set -xe

export METEOR_ALLOW_SUPERUSER='true'

apt-get update -qq && apt-get upgrade -qqy
apt-get install -qq build-essential python git libxss1 libappindicator1 libindicator7 curl wget xvfb libxtst6 libxss1 libgconf2-4 libnss3 libgtk2.0-0 libgtk-3-0 libasound2
curl -sL https://deb.nodesource.com/setup_8.x | bash -

export DISPLAY=':99.0'
Xvfb "${DISPLAY}" -screen 0 1024x768x24 > /dev/null 2>&1 &

# Download Meteor
PATH=$PATH:$HOME/.meteor
mkdir -p .meteor/ .npm/ node_modules/
if [ ! -e $HOME/.meteor/meteor ]; then curl -k https://install.meteor.com | sh; fi

#install google-chrome
#wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
#sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
apt-get install -qqy ./google-chrome*.deb
rm google-chrome-stable_current_amd64.deb


mv /usr/bin/google-chrome /usr/bin/google-chrome-original

printf  '#!/bin/bash\n\ngoogle-chrome-original --no-sandbox --headless --disable-setuid-sandbox --disable-gpu --enable-debugging "$@"\n' > /usr/bin/google-chrome

chmod +x /usr/bin/google-chrome

export CHROME_BIN=/usr/bin/google-chrome

meteor update --patch
meteor npm i
meteor node -v && meteor npm version

#meteor npm run test

meteor npm run app-test
