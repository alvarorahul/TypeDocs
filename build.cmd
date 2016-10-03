node node_modules\typescript\bin\tsc --project .

copy package.json out\
copy LICENSE out\
copy README.md out\

if not exist (out\src\content\) md out\src\content\

copy src\content\ out\src\content\
