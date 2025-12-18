#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Error: USERNAME is required as the first argument"
    echo "Usage: $0 <username>"
    exit 1
fi

USERNAME=$1

yarn install
yarn build
docker build --platform=linux/amd64 -f Dockerfile.dev -t quay.io/${USERNAME}/genie-web-client:latest .
docker push quay.io/${USERNAME}/genie-web-client:latest
oc rollout restart deployment/genie-web-client -n genie-web-client