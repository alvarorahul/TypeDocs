import * as assert from "assert";

import * as syntax from "../src/syntax";
import * as typedocs from "../src/typedocs";

"use strict";

function getFilePath(fileName: string) {
    return `${__dirname}\\..\\..\\test\\testcases\\${fileName}.d.ts`;
}

describe("Enum", function () {
    const elements = typedocs.generate([getFilePath("testenums")]);
    it("should generate documentation elements correctly", function () {
        assert.equal(elements.length, 2, "2 enums present in result");
    });

    const testEnum = <syntax.EnumDeclaration>elements[0];
    it("should generate documentation for test enum correctly", function () {
        assert.equal(testEnum.name, "MyEnum", "name of enum is correct");
        assert.equal(testEnum.documentation, "Documentation for my enum.", "documentation of enum is correct");
    });

    const firstEnumValue = testEnum.members[0];
    it("should generate documentation for first enum value", function () {
        assert.equal(firstEnumValue.name, "None", "name of enum member is correct");
        assert.equal(firstEnumValue.documentation, "", "documentation of enum member is correct");
    });

    const secondEnumValue = testEnum.members[1];
    it("should generate documentation for second enum value", function () {
        assert.equal(secondEnumValue.name, "MyEnumValue", "name of enum member is correct");
        assert.equal(secondEnumValue.documentation, "Documentation for my enum value.", "documentation of enum member is correct");
    });

    const constEnum = <syntax.EnumDeclaration>elements[1];
    it("should generate documentation for test enum correctly", function () {
        assert.equal(constEnum.name, "ConstEnum", "name of enum is correct");
        assert.equal(constEnum.documentation, "Documentation for const enum.", "documentation of enum is correct");
        assert.ok(constEnum.isConst, "it is a const enum");
    });

    const constEnumValue = constEnum.members[0];
    it("should generate documentation for first enum value", function () {
        assert.equal(constEnumValue.name, "ConstEnumValue", "name of enum member is correct");
        assert.equal(constEnumValue.documentation, "Documentation for my enum value.", "documentation of enum member is correct");
        assert.equal(constEnumValue.value, 5, "value of the enum member");
    });
});
