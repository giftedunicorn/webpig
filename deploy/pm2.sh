#!/bin/sh

echo "DEPLOY BACKEND"
git pull
yarn
yarn run pm2-reload
echo "DEPLOY BACKEND FINISHED!"