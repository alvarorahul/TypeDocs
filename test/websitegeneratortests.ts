import * as assert from "assert";

import * as syntax from "../src/syntax";
import * as typedocs from "../src/typedocs";
import * as websitegenerator from "../src/websitegenerator";

"use strict";

function getFilePath(fileName: string) {
    return `${__dirname}\\..\\..\\test\\testcases\\${fileName}.d.ts`;
}

describe("Generate website - AMD", function () {
    it("should throw if root folder doesn't exist", function () {
        assert.throws(() => {
            typedocs.generate(
                [
                    getFilePath("testmodules"),
                ],
                {
                    websiteOptions: {
                        dir: "./non/existing/folder",
                        resources: {
                            productName: "",
                            productDescription: ""
                        },
                        writeFile: (path, content) => {
                            resultFiles.push({ path: path, content: content });
                        }
                    }
                });
        });
    });

    const resultFiles: { path: string; content: string; }[] = [];
    typedocs.generate(
        [
            getFilePath("testmodules"),
        ],
        {
            websiteOptions: {
                dir: ".",
                resources: {
                    productName: "",
                    productDescription: ""
                },
                writeFile: (path, content) => {
                    resultFiles.push({ path: path, content: content });
                }
            }
        });

    it("should generate correct files", function () {
        assert.equal(resultFiles.length, 4, "4 files should be generated" + JSON.stringify(resultFiles.map(c => c.path)));
        assert.equal(resultFiles[0].path, "index.html");
        assert.equal(resultFiles[1].path.replace(/\//g, "\\"), "A\\B\\C\\index.html");
        assert.equal(resultFiles[2].path.replace(/\//g, "\\"), "A\\B\\C\\D.html");
        assert.equal(resultFiles[3].path.replace(/\//g, "\\"), "A\\B\\C\\E.html");
    });
});

describe("Generate website - Non AMD", function () {
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
        assert.equal(resultFiles.length, 4, "4 files present in result");
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

describe("Generate website - Classes", function () {
    const resultFiles: { path: string; content: string; }[] = [];
    typedocs.generate(
        [
            getFilePath("testclasses"),
        ],
        {
            websiteOptions: {
                dir: ".",
                resources: {
                    productName: "",
                    productDescription: ""
                },
                writeFile: (path, content) => {
                    resultFiles.push({ path: path, content: content });
                }
            }
        });

    it("should generate correct files", function () {
        assert.equal(resultFiles.length, 5, "5 files should be generated" + JSON.stringify(resultFiles.map(c => c.path)));
        assert.equal(resultFiles[0].path, "index.html");
        assert.equal(resultFiles[1].path, "TestInterface.html");
        assert.equal(resultFiles[2].path, "Mammal.html");
        assert.equal(resultFiles[3].path, "Dog.html");
        assert.equal(resultFiles[4].path, "TestClass.html");
    });

    it("should have specified content in files", function () {
        assert.ok(resultFiles[2].content.indexOf("Documentation for abstract class.") >= 0);
        assert.ok(resultFiles[3].content.indexOf("Documentation for derived class.") >= 0);

        const expectedStrings = ["prop1", "prop2", "prop3", "prop4", "prop5", "prop6", "method1"];
        assert.ok(expectedStrings.every(c => resultFiles[4].content.indexOf(c) >= 0), "all specified strings should be present in file");
    });
});
