# TypeDocs

[![Build Status](https://travis-ci.org/alvarorahul/TypeDocs.png?branch=master)](https://travis-ci.org/alvarorahul/TypeDocs)
[![npm version](https://badge.fury.io/js/typedocs.svg)](https://badge.fury.io/js/typedocs)

TypeDocs is a library that helps generate API documentation for TypeScript code.

<!-- ![alt text](https://raw.githubusercontent.com/alvarorahul/TypeDocs/master/TypeDocs.Samples/DocumentationWebPage.png "Documentation web page") -->

## Installing

```
npm install typedocs
```

## Usage

```ts
import * as typedocs from "typedocs";

"use strict";

// Generate documentation by calling the generate function
// passing in the definition files.
const result = typedocs.generate([sourceFileName]);

// Optionally you can flatten the modules to include
// separate items for nested modules.
const flatResult = typedocs.flattenModules(result);
```

## Samples

The samples folder contains an app that demonstrates the usage above. You can run the below command to exercise it.

```
node sampleapp.js
```
