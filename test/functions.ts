import * as assert from "assert";

import * as syntax from "../src/syntax";
import * as typedocs from "../src/typedocs";

"use strict";

function getFilePath(fileName: string) {
    return `${__dirname}\\..\\..\\test\\testcases\\${fileName}.d.ts`;
}

describe("Function", function () {
    const elements = typedocs.generate([getFilePath("testfunctions")]);
    it("should generate documentation elements correctly", function () {
        assert.equal(elements.length, 1, "one function present in result");
    });

    const testFunction = <syntax.FunctionDeclaration>elements[0];
    it("should generate documentation for test function correctly", function () {
        assert.equal(testFunction.name, "myFunction", "name of the function is correct");
        assert.equal(testFunction.documentation, "Documentation for test function.", "documentation of function is correct");
    });

    const param1 = testFunction.parameters[0];
    it("should generate documentation for first parameter correctly", function () {
        assert.equal(param1.name, "param1", "name of the parameter is correct");
        assert.equal(param1.type, "string", "type of the parameter is correct");
        assert.equal(param1.documentation, "The first parameter.", "documentation of parameter is correct");
        assert.ok(!param1.optional, "param1 is not optional");
    });

    const param2 = testFunction.parameters[1];
    it("should generate documentation for second parameter correctly", function () {
        assert.equal(param2.name, "param2", "name of the parameter is correct");
        assert.equal(param2.type, "number", "type of the parameter is correct");
        assert.equal(param2.documentation, "The second parameter.", "documentation of parameter is correct");
        assert.ok(param2.optional, "param1 is optional");
    });

    const restArgs = testFunction.parameters[2];
    it("should generate documentation for restArgs parameter correctly", function () {
        assert.equal(restArgs.name, "restArgs", "name of the parameter is correct");
        assert.equal(restArgs.type, "any[]", "type of the parameter is correct");
        assert.equal(restArgs.documentation, "Variable list of arguments.", "documentation of parameter is correct");
        assert.ok(restArgs.isDotDotDot, "param1 is a rest args parameter");
    });
});
