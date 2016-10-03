"use strict";
const fs = require("fs");
const path = require("path");
const typedocs = require("../src/typedocs");
var Main;
(function (Main) {
    "use strict";
    const typeDocsSourceFiles = fs.readdirSync("out/src")
        .filter(c => c.endsWith(".d.ts"))
        .map(fileName => {
        return path.resolve(`./out/src/${fileName}`);
    });
    const declarationFileNames = [
        "jquery.d.ts",
        "knockout.d.ts",
        "vscode.d.ts",
    ];
    const declarationFiles = declarationFileNames.map(fileName => {
        return path.resolve(`./samples/${fileName}`);
    });
    const sourceFiles = [path.resolve("./samples/sample.d.ts")].concat(typeDocsSourceFiles, declarationFiles);
    const outFileName = path.resolve("./out/sampleoutput.json");
    const flatOutFileName = path.resolve("./out/sampleoutput-flat.json");
    const websiteFolderName = path.resolve("./out/website");
    if (!fs.existsSync(websiteFolderName)) {
        fs.mkdirSync(websiteFolderName);
    }
    const result = typedocs.generate(sourceFiles, {
        websiteOptions: {
            dir: websiteFolderName,
            themeName: "default",
            resources: {
                productName: "My awesome product",
                productDescription: "This is an awesome product.",
            }
        }
    });
    const flatResult = typedocs.flattenModules(result);
    fs.writeFileSync(outFileName, JSON.stringify(result, null, 4));
    fs.writeFileSync(flatOutFileName, JSON.stringify(flatResult, null, 4));
    process.exit();
})(Main || (Main = {}));
