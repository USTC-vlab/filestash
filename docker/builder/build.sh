#!/bin/bash

if ! [ -e "Makefile" ]; then
    echo "Please run this script at project root directory!"
    exit 1
fi
commit_id=$(git rev-parse HEAD)

docker build -t vlab/filestash:SNAPSHOT-"${commit_id}" -f docker/builder/Dockerfile .
