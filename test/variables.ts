import * as assert from "assert";

import * as syntax from "../src/syntax";
import * as typedocs from "../src/typedocs";

"use strict";

function getFilePath(fileName: string) {
    return `${__dirname}\\..\\..\\test\\testcases\\${fileName}.d.ts`;
}

describe("Variables", function () {
    const elements = typedocs.generate([getFilePath("testvariables")]);
    it("should contain a single module", function () {
        assert.equal(elements.length, 1, "1 module present in result");
        assert.equal(elements[0].name, "\"ModuleWithVariables\"", "name of first module is correct");
    });

    it("should generate documentation for exported constant correctly", function () {
        const exportedConstant = <syntax.VariableDeclaration>(<syntax.ModuleDeclaration>elements[0]).members[0];
        assert.equal(exportedConstant.name, "exportedConstant", "name of constant is correct");
        assert.equal(exportedConstant.type, "number", "type of constant is correct");
        assert.equal(exportedConstant.documentation, "Defines an exported constant.", "documentation of constant is correct");
        assert.equal(exportedConstant.isConst, true, `isConst flag should be set to true. Actual: ${JSON.stringify(exportedConstant)}`);
    });

    it("should generate documentation for exported let correctly", function () {
        const exportedLet = <syntax.VariableDeclaration>(<syntax.ModuleDeclaration>elements[0]).members[1];
        assert.equal(exportedLet.name, "modifiableVariable", `name of let is correct.`);
        assert.equal(exportedLet.type, "string", "type of let is correct");
        assert.equal(exportedLet.documentation, "Defines an exported let.", "documentation of constant is correct");
        assert.equal(exportedLet.isConst, false, `isConst flag should be set to false. Actual: ${JSON.stringify(exportedLet)}`);
    });

    it("should generate documentation for exported variable correctly", function () {
        const exportedVariable = <syntax.VariableDeclaration>(<syntax.ModuleDeclaration>elements[0]).members[2];
        assert.equal(exportedVariable.name, "bigintVar", `name of variable is correct.`);
        assert.equal(exportedVariable.type, "bigint", "type of let is correct");
        assert.equal(exportedVariable.documentation, "Defines an exported variable.", "documentation of constant is correct");
        assert.equal(exportedVariable.isConst, false, `isConst flag should be set to false. Actual: ${JSON.stringify(exportedVariable)}`);
    });
});
