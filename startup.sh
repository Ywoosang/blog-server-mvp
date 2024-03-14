#!/bin/bash
REPOSITORY=/home/ec2-user/app

cd $REPOSITORY

npm ci --production

pm2 delete all

npm run start:prod