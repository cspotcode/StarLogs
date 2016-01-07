#!/bin/bash

./build.sh

pushd gh-pages
git add -A *
git commit -m "Updates static site"
git push
popd
