import * as fs from "fs";
import * as path from "path";
import * as typedocs from "../src/typedocs";

module Main {
    "use strict";

    const sourceFiles = [
        "jquery.d.ts",
        "knockout.d.ts",
        "sample.d.ts",
        "vscode.d.ts",
    ];
    const sourceFileNames = sourceFiles.map(fileName => path.resolve(`./samples/${fileName}`));
    const outFileName = path.resolve("./out/sampleoutput.json");
    const flatOutFileName = path.resolve("./out/sampleoutput-flat.json");
    const websiteFolderName = path.resolve("./out/website");

    if (!fs.existsSync(websiteFolderName)) {
        fs.mkdirSync(websiteFolderName);
    }

    const result = typedocs.generate(
        sourceFileNames,
        {
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
}
