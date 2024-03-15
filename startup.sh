#!/bin/bash

REPOSITORY=/home/ec2-user/app
NVM_DIR="$HOME/.nvm"

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

cd $REPOSITORY
 
npm ci --omit=dev

pm2 delete all
npm run start:prod
