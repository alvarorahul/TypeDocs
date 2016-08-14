# TypeDocs

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
const result = typedocs.generate([
    sourceFileName,
]);

// Optionally you can flatten the modules to include
// separate items for nested modules.
const flatResult = typedocs.flattenModules(result);
```

<!--
It also contains a Sample folder which you can host on a web server and see TypeDocs at work.

### View your documentation on a web page
To consume the library in a web page, all you need to do in the Sample folder is
* Place your TypeScript definition file (.d.ts) inside the Sample\Definitions folder
* Edit the index.html file and update the name of the file passed to the program.run function call

### Create custom views
You can create custom views of your documentation by referencing the typescript.js and typedocs.js files in your custom solution.
Here's a code snippet of how you can generate the documentation objects ready for your consumption.

```
var definitionFilePath = "/SomePath/SomeFile.d.ts",
    options = { underscoreIsPrivate: true },
    inputs = [{
        sourceText: data,
        isDeclaration: true,
        sourceFileName: definitionFilePath
    }],
    generator = new TypeDocs.Generator(inputs, options);

generator.process();
```
At this point, generator.modules contains a list of root modules with documentation. Also, generator.modulesWithElements contains a flattened list of all modules in the definition file.
-->