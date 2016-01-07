#!/bin/bash

babel=node_modules/.bin/babel

rm -rf gh-pages/*
$babel javascripts/**/*.es --out-dir gh-pages
mkdir -p gh-pages/stylesheets
cp stylesheets/*.css gh-pages/stylesheets
cp *.html favicon.ico gh-pages
cp -R assets gh-pages/
