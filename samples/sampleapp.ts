import * as fs from "fs";
import * as path from "path";
import * as typedocs from "../src/typedocs";

module Main {
    "use strict";

    const sourceFileName = path.resolve("./samples/sample.d.ts");
    const outFileName = path.resolve("./out/sampleoutput.json");
    const flatOutFileName = path.resolve("./out/sampleoutput-flat.json");
    const result = typedocs.generate([
        sourceFileName,
    ]);
    const flatResult = typedocs.flattenModules(result);

    fs.writeFileSync(outFileName, JSON.stringify(result, null, 4));
    fs.writeFileSync(flatOutFileName, JSON.stringify(flatResult, null, 4));
    process.exit();
}
