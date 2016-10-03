# Contributing to TypeDocs

TypeDocs is a library that helps generate API documentation for TypeScript code.
Any changes that help improve the library's documentation generation
capabilities are welcome.

Please open an issue for the fix/improvement/enhancement you want to make. Then,
submit a pull request which contains the changes accompanied by tests. This
should start a new [Travis CI build](https://travis-ci.org/alvarorahul/TypeDocs)
which will build the project and run tests and get code coverage numbers.

## Design overview

TypeDocs is a lightweight library written in TypScript. This is then compiled
into ES6-compatible JavaScript within CommonJS modules that can be executed
using node. The library is divided into 3 modules.

### typedocs

This is the main entry-point to the library. It exposes a generate method used
to generate documentation for the specified TypeScript code input.

### syntax

This module contains the syntax for all TypeScript documentation elements.

### websitegenerator

This module provides website generation capabilities to the library. It uses
the JSON output from typedocs to generate a full-functioning website with static
pages containing documentation for all the input TypeScript.

## Getting started

As a first step run the following commands at the root of the repository.

```
npm install

typings install
```

If you're using a windows prompt, you can also simply run `init.cmd` to
initialize the repository.

## Build

To build the project, run the below commands

```
node node_modules\typescript\bin\tsc --project .
```

If you're using a windows prompt, you can also simply run `build.cmd` to build.

Note that this command performs a few additional steps, i.e.

```
copy package.json out\
copy LICENSE out\
copy README.md out\

if not exist (out\src\content\) md out\src\content\

copy src\content\ out\src\content\
```

## Tests

Once you've built the project, you can run tests by running

```
npm test
```

You can check code coverage by running

```
npm run cover
```