import * as assert from "assert";

import * as syntax from "../src/syntax";
import * as typedocs from "../src/typedocs";

"use strict";

function getFilePath(fileName: string) {
    return `${__dirname}\\..\\..\\test\\testcases\\${fileName}.d.ts`;
}

describe("Module - non-AMD", function () {
    const elements = typedocs.generate([getFilePath("testmodules-namespace")]);
    it("should generate documentation elements correctly", function () {
        assert.equal(elements.length, 2, "two modules present in result");
    });

    const moduleOne = elements[0];
    it("should generate documentation for first module correctly", function () {
        assert.equal(moduleOne.name, "A", "name of the module is correct");
        assert.equal(moduleOne.documentation, "Test module documentation.", "documentation of module is correct");
    });

    const moduleTwo = elements[1];
    it("should generate documentation for second module correctly", function () {
        assert.equal(moduleTwo.name, "B", "name of the module is correct");
        assert.equal(moduleTwo.documentation, "Second test module documentation.\nMore information about the module.", "documentation of module is correct");
    });

    const flatList = typedocs.flattenModules(elements);
    it ("should flatten the specified elements into a flat list of modules", function () {
        assert.equal(flatList.length, 2, "two items in flat list");
        assert.equal(flatList[0].name, "A", "full name of first item in list.");
        assert.equal(flatList[1].name, "B.C", "full name of second item in list.");
    });
});

describe("Module - AMD/CommonJS modules", function () {
    const elements = typedocs.generate([getFilePath("testmodules")]);
    it("should generate documentation elements correctly", function () {
        assert.equal(elements.length, 1, "one module present in result");
        assert.equal(elements[0].name, "\"A/B/C\"", "name of module is correct");
    });

    const innerModuleOne = (<syntax.ModuleDeclaration>elements[0]).members[0];
    it("should generate documentation for first inner module correctly", function () {
        assert.equal(innerModuleOne.name, "D", "name of the inner module is correct");
        assert.equal(innerModuleOne.documentation, "Test module documentation.", "documentation of inner module is correct");
    });

    const innerModuleTwo = (<syntax.ModuleDeclaration>elements[0]).members[1];
    it("should generate documentation for second inner module correctly", function () {
        assert.equal(innerModuleTwo.name, "E", "name of the inner module is correct");
        assert.equal(innerModuleTwo.documentation, "Second test module documentation.\nMore information about the module.", "documentation of inner module is correct");
    });

    const flatList = typedocs.flattenModules(elements);
    it ("should create empty flat list since modules are empty", function () {
        assert.equal(flatList.length, 1, "1 item in flat list");
    });
});