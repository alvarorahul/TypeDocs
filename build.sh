#!/bin/bash
node ./node_modules/typescript/bin/tsc --project .

cp ./package.json ./out/
cp ./LICENSE ./out/
cp ./README.md ./out/

mkdir -p out/src/content

cp -R src/content/* out/src/content/
