#!/bin/bash
REPOSITORY=/home/ec2-user/app

cd $REPOSITORY

npm ci --production

npm run start:prod