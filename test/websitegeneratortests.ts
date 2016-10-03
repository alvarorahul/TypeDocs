import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as tmp from "tmp";

import * as syntax from "../src/syntax";
import * as typedocs from "../src/typedocs";
import * as websitegenerator from "../src/websitegenerator";

"use strict";

function getFilePath(fileName: string) {
    return `${__dirname}\\..\\..\\test\\testcases\\${fileName}.d.ts`;
}

describe("Generate website - folder generation", function () {
    if (fs.existsSync(path.resolve("out/test/A/B/index.html"))) {
        fs.unlinkSync(path.resolve("out/test/A/B/index.html"));
    }

    if (fs.existsSync(path.resolve("out/test/A/B"))) {
        fs.rmdirSync(path.resolve("out/test/A/B"));
    }

    if (fs.existsSync(path.resolve("out/test/A"))) {
        fs.rmdirSync(path.resolve("out/test/A"));
    }

    websitegenerator.generate(
        [
            <syntax.ModuleDeclaration>{
                name: "\"A/B\"",
                documentation: "",
                kind: syntax.SyntaxKind.ModuleDeclaration,
                parent: null,
                amd: true,
                members: [
                    <syntax.VariableDeclaration>{
                        name: "Test",
                        documentation: "Test documentation",
                        kind: syntax.SyntaxKind.VariableDeclaration,
                        type: "string",
                    }
                ]
            }
        ],
        {
            dir: "out/test",
            resources: {
                productName: "",
                productDescription: ""
            }
        });

    it("should create directory structure if it doesn't exist", function () {
        assert.ok(fs.existsSync(path.resolve("out/test/A")));
        assert.ok(fs.existsSync(path.resolve("out/test/A/B")));
        assert.ok(fs.existsSync(path.resolve("out/test/A/B/index.html")));
    });
});

interface ResultFile {
    path: string;
    content: string;
}

function verifyAndRemoveThemeCssFiles(files: ResultFile[]) {
    websitegenerator.themeFiles.forEach((themeFile) => {
        const idx = files.findIndex(c => c.path === themeFile);
        if (idx >= 0) {
            files.splice(idx, 1);
        } else {
            assert.ok(false, "couldn't find the theme file.");
        }
    });
}

const sampleProductName = "Sample product name";
const sampleCopyrightText = "© 2016 Sample copyright text";

function verifyHeaderAndFooter(file: ResultFile) {
    assert.ok(file.content.indexOf(sampleProductName) >= 0);
    assert.ok(file.content.indexOf(sampleCopyrightText) >= 0);
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
                    productName: sampleProductName,
                    copyright: sampleCopyrightText,
                    productDescription: ""
                },
                writeFile: (path, content) => {
                    resultFiles.push({ path: path, content: content });
                }
            }
        });

    it("should generate correct files", function () {
        verifyAndRemoveThemeCssFiles(resultFiles);
        resultFiles.forEach(verifyHeaderAndFooter);
        assert.equal(resultFiles.length, 5, "5 files should be generated" + JSON.stringify(resultFiles.map(c => c.path)));
        assert.equal(resultFiles[0].path, "index.html");
        assert.equal(resultFiles[1].path.replace(/\//g, "\\"), "A\\B\\C\\index.html");
        assert.equal(resultFiles[2].path.replace(/\//g, "\\"), "D\\index.html");
        assert.equal(resultFiles[3].path.replace(/\//g, "\\"), "A\\B\\C\\D.html");
        assert.equal(resultFiles[4].path.replace(/\//g, "\\"), "A\\B\\C\\E.html");
    });

    it("should generate correct link tags within sections", function () {
        assert.ok(resultFiles[0].content.indexOf("<a href=\"/A/B/C/\">\"A/B/C\"</a>") >= 0, "link to A/B/C should be present" + resultFiles[0].content);
        assert.ok(resultFiles[1].content.indexOf("<a href=\"/A/B/C/D.html\">D</a>") >= 0, "link to A/B/C/D.html should be present" + resultFiles[1].content);
        assert.ok(resultFiles[1].content.indexOf("<a href=\"/A/B/C/E.html\">E</a>") >= 0, "link to A/B/C/E.html should be present" + resultFiles[1].content);
    })

    it("should generate correct link to parent within breadcrumb", function () {
        assert.ok(resultFiles[3].content.indexOf("<a href=\"/A/B/C/\">\"A/B/C\"</a>") >= 0, "link to A/B/C/ should be present" + resultFiles[2].content);
        assert.ok(resultFiles[4].content.indexOf("<a href=\"/A/B/C/\">\"A/B/C\"</a>") >= 0, "link to A/B/C/ should be present" + resultFiles[3].content);
    })
});

describe("Generate website - Non AMD", function () {
    const elements = typedocs.generate([getFilePath("testmodules-namespace")]);

    const resultFiles: { path: string; content: string; }[] = [];
    websitegenerator.generate(elements, {
        dir: ".",
        resources: {
            productName: sampleProductName,
            copyright: sampleCopyrightText,
            productDescription: ""
        },
        writeFile: (path, content) => {
            resultFiles.push({ path: path, content: content });
        }
    });

    it("should generate files correctly", function () {
        verifyAndRemoveThemeCssFiles(resultFiles);
        resultFiles.forEach(verifyHeaderAndFooter);
        assert.equal(resultFiles.length, 4, "4 files present in result");
    });

    it("should generate first documentation file correctly", function () {
        const fileOne = resultFiles[0];
        assert.equal(fileOne.path, "index.html", "name of the file is correct");
        assert.ok(
            fileOne.content.indexOf("Test module documentation.") >= 0
            && fileOne.content.indexOf("Second test module documentation.") >= 0,
            "documentation found in file");
    });

    it("should generate second documentation file correctly", function () {
        const fileTwo = resultFiles[1];
        assert.equal(fileTwo.path, "A.html", "name of the file is correct");
        assert.ok(fileTwo.content.indexOf("Test module documentation.") >= 0, "documentation found in file");
    });

    it("should generate third documentation file correctly", function () {
        const fileThree = resultFiles[2];
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
                    productName: sampleProductName,
                    copyright: sampleCopyrightText,
                    productDescription: ""
                },
                writeFile: (path, content) => {
                    resultFiles.push({ path: path, content: content });
                }
            }
        });

    it("should generate correct files", function () {
        verifyAndRemoveThemeCssFiles(resultFiles);
        resultFiles.forEach(verifyHeaderAndFooter);
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

describe("Generate website - Types", function () {
    const resultFiles: { path: string; content: string; }[] = [];
    typedocs.generate(
        [
            getFilePath("testtypes"),
        ],
        {
            websiteOptions: {
                dir: ".",
                resources: {
                    productName: sampleProductName,
                    copyright: sampleCopyrightText,
                    productDescription: ""
                },
                writeFile: (path, content) => {
                    resultFiles.push({ path: path, content: content });
                }
            }
        });

    it("should generate correct files", function () {
        verifyAndRemoveThemeCssFiles(resultFiles);
        resultFiles.forEach(verifyHeaderAndFooter);
        assert.equal(resultFiles.length, 1, "1 file should be generated" + JSON.stringify(resultFiles.map(c => c.path)));
        assert.equal(resultFiles[0].path, "index.html");
    });

    it("should have specified content in files", function () {
        assert.ok(resultFiles[0].content.indexOf("Documentation for my type.") >= 0);
    });
});

describe("Generate website - SomeModule", function () {
    const resultFiles: { path: string; content: string; }[] = [];
    typedocs.generate(
        [
            getFilePath("somemodule"),
        ],
        {
            websiteOptions: {
                dir: ".",
                resources: {
                    productName: sampleProductName,
                    copyright: sampleCopyrightText,
                    productDescription: ""
                },
                writeFile: (path, content) => {
                    resultFiles.push({ path: path, content: content });
                }
            }
        });

    it("should generate correct files", function () {
        verifyAndRemoveThemeCssFiles(resultFiles);
        resultFiles.forEach(verifyHeaderAndFooter);
        assert.equal(resultFiles.length, 3, "3 files should be generated" + JSON.stringify(resultFiles.map(c => c.path)));
        assert.equal(resultFiles[0].path, "index.html");
        assert.ok(resultFiles[1].path.replace(/\//g, "\\").endsWith("\\testcases\\somemodule.d.ts\\index.html"));
        assert.ok(resultFiles[2].path.replace(/\//g, "\\").endsWith("\\testcases\\somemodule.d.ts\\SyntaxKind.html"));
    });

    it("should have specified content in files", function () {
        assert.ok(resultFiles[0].content.indexOf("Describes the module.") >= 0);
        assert.ok(resultFiles[1].content.indexOf("Defines the type of element.") >= 0);
        assert.ok(resultFiles[2].content.indexOf("Defines the type of element.") >= 0);
    });
});
