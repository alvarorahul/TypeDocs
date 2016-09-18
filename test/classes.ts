import * as assert from "assert";

import * as syntax from "../src/syntax";
import * as typedocs from "../src/typedocs";

"use strict";

function getFilePath(fileName: string) {
    return `${__dirname}\\..\\..\\test\\testcases\\${fileName}.d.ts`;
}

describe("Class", function () {
    const elements = typedocs.generate([getFilePath("testclasses")]);
    it("should generate documentation elements correctly", function () {
        assert.equal(elements.length, 2, "two classes present in result");
    });

    const classOne = <syntax.ClassDeclaration>elements[0];
    it("should generate documentation for abstract class correctly", function () {
        assert.equal(classOne.name, "Mammal", "name of the module is correct");
        assert.ok(classOne.isAbstract, "isAbstract flag has been set");
        assert.equal(classOne.documentation, "Documentation for abstract class.", "documentation of module is correct");
    });

    const numberProperty = <syntax.PropertyInfo>classOne.members[0];
    it("should generate documentation correctly for number property", function () {
        assert.equal(numberProperty.name, "limbs", "name of the property is correctly captured");
        assert.equal(numberProperty.type, "number", "type of property is correctly captured");
    });

    const abstractProperty = <syntax.PropertyInfo>classOne.members[1];
    it("should generate documentation correctly for abstract class property", function () {
        assert.equal(abstractProperty.name, "mutation", "name of the property is correctly captured");
        assert.ok(abstractProperty.isAbstract, "isAbstract flag has been set");
        assert.equal(abstractProperty.type, "any", "type of property is correctly captured");
    });

    const abstractMethod = <syntax.MethodInfo>classOne.members[2];
    it("should generate documentation correctly for abstract class method", function () {
        assert.equal(abstractMethod.name, "getSoundType", "name of the method is correctly captured");
        assert.ok(abstractMethod.isAbstract, "isAbstract flag has been set");
        assert.equal(abstractMethod.type, "string", "type of method is correctly captured");
    });

    const classTwo = <syntax.ClassDeclaration>elements[1];
    it("should generate documentation for derived class correctly", function () {
        assert.equal(classTwo.name, "Dog", "name of the class is correct");
        assert.equal(classTwo.documentation, "Documentation for derived class.", "documentation of module is correct");
    });

    const overriddenProperty = <syntax.PropertyInfo>classTwo.members[0];
    it("should generate documentation correctly for overridden class property", function () {
        assert.equal(overriddenProperty.name, "mutation", "name of the property is correctly captured");
        assert.ok(!overriddenProperty.isAbstract, "isAbstract flag has NOT been set");
        assert.equal(overriddenProperty.type, "string", "type of s is correctly captured");
    });

    const overriddenMethod = <syntax.MethodInfo>classTwo.members[1];
    it("should generate documentation correctly for overridden class method", function () {
        assert.equal(overriddenMethod.name, "getSoundType", "name of the method is correctly captured");
        assert.ok(!overriddenMethod.isAbstract, "isAbstract flag has NOT been set");
        assert.equal(overriddenMethod.type, `"bark"`, "type of method is correctly captured");
    });
});
