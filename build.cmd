node node_modules\typescript\bin\tsc --project .

copy package.json out\
copy LICENSE out\
copy README.md out\

if not exist (out\src\pages\) md out\src\pages\

copy src\pages\ out\src\pages\
