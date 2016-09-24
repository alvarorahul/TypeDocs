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
        assert.equal(elements.length, 4, "4 items present in result");
    });

    const abstractClass = <syntax.ClassDeclaration>elements[0];
    it("should generate documentation for abstract class correctly", function () {
        assert.equal(abstractClass.name, "Mammal", "name of the module is correct");
        assert.ok(abstractClass.isAbstract, "isAbstract flag has been set");
        assert.equal(abstractClass.documentation, "Documentation for abstract class.", "documentation of module is correct");
    });

    const numberProperty = <syntax.PropertyInfo>abstractClass.members[0];
    it("should generate documentation correctly for number property", function () {
        assert.equal(numberProperty.name, "limbs", "name of the property is correctly captured");
        assert.equal(numberProperty.type, "number", "type of property is correctly captured");
    });

    const abstractProperty = <syntax.PropertyInfo>abstractClass.members[1];
    it("should generate documentation correctly for abstract class property", function () {
        assert.equal(abstractProperty.name, "mutation", "name of the property is correctly captured");
        assert.ok(abstractProperty.isAbstract, "isAbstract flag has been set");
        assert.equal(abstractProperty.type, "any", "type of property is correctly captured");
    });

    const abstractMethod = <syntax.MethodInfo>abstractClass.members[2];
    it("should generate documentation correctly for abstract class method", function () {
        assert.equal(abstractMethod.name, "getSoundType", "name of the method is correctly captured");
        assert.ok(abstractMethod.isAbstract, "isAbstract flag has been set");
        assert.equal(abstractMethod.type, "string", "type of method is correctly captured");
    });

    const derivedClass = <syntax.ClassDeclaration>elements[1];
    it("should generate documentation for derived class correctly", function () {
        assert.equal(derivedClass.name, "Dog", "name of the class is correct");
        assert.equal(derivedClass.documentation, "Documentation for derived class.", "documentation of module is correct");
    });

    const overriddenProperty = <syntax.PropertyInfo>derivedClass.members[0];
    it("should generate documentation correctly for overridden class property", function () {
        assert.equal(overriddenProperty.name, "mutation", "name of the property is correctly captured");
        assert.ok(!overriddenProperty.isAbstract, "isAbstract flag has NOT been set");
        assert.equal(overriddenProperty.type, "string", "type of s is correctly captured");
    });

    const overriddenMethod = <syntax.MethodInfo>derivedClass.members[1];
    it("should generate documentation correctly for overridden class method", function () {
        assert.equal(overriddenMethod.name, "getSoundType", "name of the method is correctly captured");
        assert.ok(!overriddenMethod.isAbstract, "isAbstract flag has NOT been set");
        assert.equal(overriddenMethod.type, `"bark"`, "type of method is correctly captured");
    });

    const testClass = <syntax.ClassDeclaration>elements[3];

    const implementsClause = testClass.implements;
    it("should generate valid implements clause for test class", function () {
        assert.equal(implementsClause.types.length, 1, "one interface implemented");
        assert.equal(implementsClause.types[0], "TestInterface", "correct interface implemented");
    });

    const nullProperty = <syntax.PropertyInfo>testClass.members[0];
    it("should generate documentation correctly for null property", function () {
        assert.equal(nullProperty.name, "prop1", "name of the property is correctly captured");
        assert.equal(nullProperty.type, "null", "type of property is correctly captured. Actual: " + JSON.stringify(nullProperty));
    });

    const undefinedProperty = <syntax.PropertyInfo>testClass.members[1];
    it("should generate documentation correctly for undefined property", function () {
        assert.equal(undefinedProperty.name, "prop2", "name of the property is correctly captured");
        assert.equal(undefinedProperty.type, "undefined", "type of property is correctly captured. Actual: " + JSON.stringify(undefinedProperty));
    });

    const unionTypeProperty = <syntax.PropertyInfo>testClass.members[2];
    it("should generate documentation correctly for undefined property", function () {
        assert.equal(unionTypeProperty.name, "prop3", "name of the property is correctly captured");
        assert.equal(unionTypeProperty.type, "\"a\" | \"b\"", "type of property is correctly captured. Actual: " + JSON.stringify(unionTypeProperty));
    });

    const stringLiteralProperty = <syntax.PropertyInfo>testClass.members[3];
    it("should generate documentation correctly for undefined property", function () {
        assert.equal(stringLiteralProperty.name, "prop4", "name of the property is correctly captured");
        assert.equal(stringLiteralProperty.type, "\"c\"", "type of property is correctly captured. Actual: " + JSON.stringify(stringLiteralProperty));
    });
});
