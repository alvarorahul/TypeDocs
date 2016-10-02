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
        assert.equal(elements.length, 2, "2 interfaces present in result");
    });

    const testInterface = <syntax.InterfaceDeclaration>elements[0];
    it("should generate documentation for abstract class correctly", function () {
        assert.equal(testInterface.name, "TestInterface2", "name of the interface is correct");
        assert.equal(testInterface.documentation, "Documentation for test interface.", "documentation of module is correct");
    });

    const callSignatureOne = <syntax.MethodInfo>testInterface.members[0];
    it("should generate documentation correctly for first index signature", function () {
        assert.equal(callSignatureOne.name, undefined, "name of the index signature is correctly captured");
        assert.equal(callSignatureOne.parameters.length, 0);
        assert.equal(callSignatureOne.type, "string", "type of index signature is correctly captured");
    });

    const callSignatureTwo = <syntax.MethodInfo>testInterface.members[1];
    it("should generate documentation correctly for second index signature", function () {
        assert.equal(callSignatureTwo.name, undefined, "name of the index signature is correctly captured");
        assert.equal(callSignatureTwo.parameters.length, 1);
        assert.equal(callSignatureTwo.type, "string", "type of index signature is correctly captured");
    });

    const numberProperty = <syntax.PropertyInfo>testInterface.members[2];
    it("should generate documentation correctly for number property", function () {
        assert.equal(numberProperty.name, "count", "name of the number property is correctly captured");
        assert.equal(numberProperty.type, "number", "type of index signature is correctly captured");
    });

    const stringMapInterface = <syntax.InterfaceDeclaration>elements[1];
    it("should generate documentation for generic interface", function () {
        assert.equal(stringMapInterface.name, "StringMap");
        assert.equal(stringMapInterface.documentation, "Defines a map with string keys.");
        assert.equal(stringMapInterface.typeParameters.length, 1, "single generic parameter defined");
        assert.equal(stringMapInterface.typeParameters[0].type, "T");
    });

    const indexSignature = stringMapInterface.indexSignature;
    it("should generate documentation for index signature", function () {
        assert.equal(indexSignature.name, undefined);
        assert.equal(indexSignature.type, "T");
        assert.equal(indexSignature.key.name, "key");
        assert.equal(indexSignature.key.type, "string");
    });
});
