import * as assert from "assert";

import * as syntax from "../src/syntax";
import * as typedocs from "../src/typedocs";

"use strict";

function getFilePath(fileName: string) {
    return `${__dirname}\\..\\..\\test\\testcases\\${fileName}.d.ts`;
}

describe("Type", function () {
    const elements = typedocs.generate([getFilePath("testtypes")]);
    it("should generate documentation elements correctly", function () {
        assert.equal(elements.length, 1, "one type present in result");
    });

    const testType = <syntax.TypeAliasDeclaration>elements[0];
    it("should generate documentation for test enum correctly", function () {
        assert.equal(testType.name, "MyType", "name of type is correct");
        assert.equal(testType.documentation, "Documentation for my type.", "documentation of type is correct");
        assert.equal(testType.type, "string", "type of type is correct");
    });
});
