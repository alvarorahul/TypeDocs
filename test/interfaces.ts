import * as assert from "assert";

import * as syntax from "../src/syntax";
import * as typedocs from "../src/typedocs";

"use strict";

function getFilePath(fileName: string) {
    return `${__dirname}\\..\\..\\test\\testcases\\${fileName}.d.ts`;
}

describe("Interface", function () {
    const elements = typedocs.generate([getFilePath("testinterfaces")]);
    it("should generate documentation elements correctly", function () {
        assert.equal(elements.length, 1, "1 interface present in result");
    });

    const testInterface = <syntax.InterfaceDeclaration>elements[0];
    it("should generate documentation for abstract class correctly", function () {
        assert.equal(testInterface.name, "TestInterface2", "name of the interface is correct");
        assert.equal(testInterface.documentation, "Documentation for test interface.", "documentation of module is correct");
    });

    const indexSignatureOne = <syntax.MethodInfo>testInterface.members[0];
    it("should generate documentation correctly for first index signature", function () {
        assert.equal(indexSignatureOne.name, undefined, "name of the index signature is correctly captured");
        assert.equal(indexSignatureOne.parameters.length, 0);
        assert.equal(indexSignatureOne.type, "string", "type of index signature is correctly captured");
    });

    const indexSignatureTwo = <syntax.MethodInfo>testInterface.members[1];
    it("should generate documentation correctly for second index signature", function () {
        assert.equal(indexSignatureTwo.name, undefined, "name of the index signature is correctly captured");
        assert.equal(indexSignatureTwo.parameters.length, 1);
        assert.equal(indexSignatureTwo.type, "string", "type of index signature is correctly captured");
    });

    const numberProperty = <syntax.PropertyInfo>testInterface.members[2];
    it("should generate documentation correctly for number property", function () {
        assert.equal(numberProperty.name, "count", "name of the number property is correctly captured");
        assert.equal(numberProperty.type, "number", "type of index signature is correctly captured");
    });
});
