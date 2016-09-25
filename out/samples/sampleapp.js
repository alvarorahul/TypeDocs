"use strict";
const fs = require("fs");
const path = require("path");
const typedocs = require("../src/typedocs");
var Main;
(function (Main) {
    "use strict";
    const sourceFiles = [
        "jquery.d.ts",
        "knockout.d.ts",
        "sample.d.ts",
    ];
    const outFileName = path.resolve("./out/sampleoutput.json");
    const flatOutFileName = path.resolve("./out/sampleoutput-flat.json");
    const websiteFolderName = path.resolve("./out/website");
    if (!fs.existsSync(websiteFolderName)) {
        fs.mkdirSync(websiteFolderName);
    }
    const result = typedocs.generate(sourceFiles.map(fileName => path.resolve(`./samples/${fileName}`)), {
        websiteOptions: {
            dir: websiteFolderName,
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
