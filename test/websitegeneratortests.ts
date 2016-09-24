import * as assert from "assert";

import * as syntax from "../src/syntax";
import * as typedocs from "../src/typedocs";
import * as websitegenerator from "../src/websitegenerator";

"use strict";

function getFilePath(fileName: string) {
    return `${__dirname}\\..\\..\\test\\testcases\\${fileName}.d.ts`;
}

describe("Generate website", function () {
    const elements = typedocs.generate([getFilePath("testmodules-namespace")]);

    const resultFiles: { path: string; content: string; }[] = [];
    websitegenerator.generate(elements, {
        dir: ".",
        resources: {
            productName: "",
            productDescription: ""
        },
        writeFile: (path, content) => {
            resultFiles.push({ path: path, content: content });
        }
    });

    it("should generate files correctly", function () {
        assert.equal(resultFiles.length, 3, "three files present in result");
    });

    const fileOne = resultFiles[0];
    it("should generate first documentation file correctly", function () {
        assert.equal(fileOne.path, "index.html", "name of the file is correct");
        assert.ok(
            fileTwo.content.indexOf("Test module documentation.") >= 0
            && fileThree.content.indexOf("Second test module documentation.") >= 0,
            "documentation found in file");
    });

    const fileTwo = resultFiles[1];
    it("should generate second documentation file correctly", function () {
        assert.equal(fileTwo.path, "A.html", "name of the file is correct");
        assert.ok(fileTwo.content.indexOf("Test module documentation.") >= 0, "documentation found in file");
    });

    const fileThree = resultFiles[2];
    it("should generate third documentation file correctly", function () {
        assert.equal(fileThree.path, "B.html", "name of the file is correct");
        assert.ok(fileThree.content.indexOf("Second test module documentation.") >= 0, "documentation found in file");
    });
});
