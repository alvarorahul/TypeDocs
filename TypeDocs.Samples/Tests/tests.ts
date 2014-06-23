module TypeDocs.Tests {

    QUnit.module("TypeDocs.JsDocParser");

    test("comments with single-line descriptions", () => {
        var inputs = [
            "/**\r\n    * Defines the attributes common to all syntax elements.\r\n    */",
            "/**\r    * Defines the attributes common to all syntax elements.\r    */      ",
            "    /**\n    * Defines the attributes common to all syntax elements.\n    */",
            "      /**\r    * Defines the attributes common to all syntax elements.\n    */       ",
            "\r\n/**\n    * Defines the attributes common to all syntax elements.\r    */",
            "\r\n/**\n    * Defines the attributes common\r\nto all syntax elements.\r    */",
            "\r\n/**\n    * Defines the attributes common\r\n            to all syntax elements.\r    */",
            "\r\n/**\n    * Defines the attributes common           \r\nto all syntax elements.\r    */",
            "\r\n/**\n    * Defines the attributes common    \r\n      to all syntax elements.\r    */",
            "\r\n/**\n    * Defines\r\n the\r\n attributes\r\n common    \r\n      to all syntax elements.\r    */",
        ];

        expect(inputs.length * 3);

        inputs.forEach(input => {
            var result = TypeDocs.JsDocParser.parse(input);
            strictEqual(result.description, "Defines the attributes common to all syntax elements.", "JsDoc description parsed correctly");
            strictEqual(Object.keys(result.parameters).length, 0, "JsDoc doesn't have any parameters");
            strictEqual(result.returns, undefined, "JsDoc doesn't have a return value");
        });
    });

    test("comments with multi-line descriptions", () => {
        var inputs = [
            "\r\n/**\n    * Defines the attributes common.\r\nto all syntax elements.\r    */",
            "\r\n/**\n    * Defines the attributes common.\r\n            to all syntax elements.\r    */",
            "\r\n/**\n    * Defines the attributes common.           \r\nto all syntax elements.\r    */",
            "\r\n/**\n    * Defines the attributes common.            \r\n          to all syntax elements.\r    */",
            "\r\n/**\n    * Defines the\r\nattributes common.\r\nto all syntax elements.\r    */",
            "\r\n/**\n    * Defines the\r\n     attributes common.\r\nto all syntax elements.\r    */",
            "\r\n/**\n    * Defines the            \r\nattributes common.\r\nto all syntax elements.\r    */",
            "\r\n/**\n    * Defines the     \r\n           attributes common.\r\nto all syntax elements.\r    */",
            "\r\n/**\n    * Defines the \r\nattributes common.\r\nto all\r\n syntax\r\n elements.\r    */",
        ];

        expect(inputs.length * 3);

        inputs.forEach(input => {
            var result = TypeDocs.JsDocParser.parse(input);
            strictEqual(result.description, "Defines the attributes common.\r\nto all syntax elements.", "JsDoc description parsed correctly");
            strictEqual(Object.keys(result.parameters).length, 0, "JsDoc doesn't have any parameters");
            strictEqual(result.returns, undefined, "JsDoc doesn't have a return value");
        });
    });

    test("comments with single-line parameters", () => {
        var inputs = [
            "/**@param test test param*/",
            "/**            @param test test param*/",
            "/**@param test test param*/                 ",
            "/**            @param test test param                */",
            "/**@param                  test                  test param*/",
            "/**@param test test\r\nparam*/",
            "/**@param test test           \r\nparam*/",
            "/**@param test test\r\n            param*/",
            "/**@param test test        \r\n           param*/",
        ];

        expect(inputs.length * 4);

        inputs.forEach(input => {
            var result = TypeDocs.JsDocParser.parse(input);
            strictEqual(result.description, "", "JsDoc description parsed correctly");
            strictEqual(Object.keys(result.parameters).length, 1, "JsDoc has 1 parameter");
            strictEqual(result.parameters["test"], "test param", "JsDoc parameter parsed correctly");
            strictEqual(result.returns, undefined, "JsDoc doesn't have a return value");
        });
    });

    test("comments with multi-line parameters", () => {
        var inputs = [
            "/**@param test test param*/",
            "/**            @param test test param*/",
            "/**@param test test param*/                 ",
            "/**            @param test test param                */",
            "/**@param                  test                  test param*/",
            "/**@param test test\r\nparam*/",
            "/**@param test test           \r\nparam*/",
            "/**@param test test\r\n            param*/",
            "/**@param test test        \r\n           param*/",
        ];

        expect(inputs.length * 3);

        inputs.forEach(input => {
            var result = TypeDocs.JsDocParser.parse(input);
            strictEqual(result.description, "", "JsDoc description parsed correctly");
            strictEqual(Object.keys(result.parameters).length, 1, "JsDoc has 1 parameter");
            strictEqual(result.returns, undefined, "JsDoc doesn't have a return value");
        });
    });

    QUnit.module("TypeDocs.Syntax");

    QUnit.module("TypeDocs.Generator");

    test("parse typescript without jsdocs", () => {
        var testInputs = [
            { moduleCount: 1, childCount: 0, gcCount: null, text: "module Test {}" },
            { moduleCount: 1, childCount: 0, gcCount: null, text: "         module Test {}" },
            { moduleCount: 1, childCount: 0, gcCount: null, text: "module Test {}       " },
            { moduleCount: 1, childCount: 0, gcCount: null, text: "    module Test {}     " },
            { moduleCount: 1, childCount: 0, gcCount: null, text: "module Test {     }" },
            { moduleCount: 1, childCount: 1, gcCount: 0, text: "module Test {  module Helo {}   }" },
            { moduleCount: 1, childCount: 1, gcCount: 1, text: "module Test {  module Helo {module Helo2 { module Helo44 {}} }   }" },
            { moduleCount: 1, childCount: 3, gcCount: 2, text: "module Test {  module Helo {module Helo2 {}  module Helo123 {}}  module Helo2 {}  module Helo44 {}   }" },
        ],
            expectedAssertions = testInputs.length * 5;

        testInputs.forEach((input) => {
            var inputs = [{
                    sourceText: input.text,
                    isDeclaration: true,
                    sourceFileName: "test.ts"
                }],
                options = {
                    underscoreIsPrivate: true
                },
                generator = new TypeDocs.Generator(inputs, options);
            generator.process();
            strictEqual(generator.modules.length, input.moduleCount, input.moduleCount + " module(s) should be in the text");
            strictEqual(generator.modules[0].name, "Test", "module name populated correctly");
            strictEqual(generator.modules[0].fullName, "Test", "module fullName populated correctly");
            strictEqual(generator.modules[0].items.length, input.childCount, input.childCount + " item(s) should be in text");
            if (typeof input.gcCount === "number") {
                strictEqual(
                    (<Syntax.ContainerElement>generator.modules[0].items[0]).items.length,
                    input.gcCount,
                    input.gcCount + " item(s) should be in text");
            } else {
                expectedAssertions--;
            }
        });

        expect(expectedAssertions);
    });

    interface ParseTypescriptFunctionInput {
        text: string;
        description?: string;
        parama?: string;
        paramb?: string;
        paramc?: string;
    }

    test("parse typescript function with jsdocs", () => {
        var testInputs: ParseTypescriptFunctionInput[] = [
                {
                    text: "module Test {\r\n    /**\r\n     *test function\r\n     */\r\n    function test(a,b,c): void; }",
                    description: "test function"
                },
                {
                    text: "module Test {\r\n    /**\r\n     *test function\r\n*@param a param a   \r\n  * @param b param b\r\n     */\r\n    function test(a,b,c): void; }",
                    description: "test function",
                    parama: "param a",
                    paramb: "param b"
                },
                {
                    text: "module Test {\r\n    /**@param a param a   \r\n  * @param c param c\r\n     */\r\n    function test(a,b,c): void; }",
                    description: "",
                    parama: "param a",
                    paramc: "param c"
                },
            ],
            expectedAssertions = testInputs.length * 9;

        testInputs.forEach((input) => {
            var inputs = [{
                    sourceText: input.text,
                    isDeclaration: true,
                    sourceFileName: "test.ts"
                }],
                options = {
                    underscoreIsPrivate: true
                },
                generator = new TypeDocs.Generator(inputs, options);
            generator.process();
            strictEqual(generator.modules[0].items.length, 1, "1 function should be in text");
            var functionToVerify = <Syntax.Function>generator.modules[0].items[0];
            strictEqual(functionToVerify.description, input.description, "description correctly populated");
            strictEqual(functionToVerify.parameters.length, 3, "");
            strictEqual(functionToVerify.parameters[0].name, "a", "param a present in list of parameters");
            strictEqual(functionToVerify.parameters[1].name, "b", "param b present in list of parameters");
            strictEqual(functionToVerify.parameters[2].name, "c", "param c present in list of parameters");

            if (input.parama === undefined) {
                expectedAssertions--;
            } else {
                strictEqual(functionToVerify.parameters[0].description, input.parama, "param a description correctly populated");
            }

            if (input.paramb === undefined) {
                expectedAssertions--;
            } else {
                strictEqual(functionToVerify.parameters[1].description, input.paramb, "param b description correctly populated");
            }

            if (input.paramc === undefined) {
                expectedAssertions--;
            } else {
                strictEqual(functionToVerify.parameters[2].description, input.paramc, "param c description correctly populated");
            }
        });

        expect(expectedAssertions);
    });

    test("test doc generation for multiple files - with just single root module", 2, () => {
        var options: TypeDocs.GeneratorOptions = { underscoreIsPrivate: false },
            inputs: TypeDocs.GeneratorInput[] = [
                {
                    sourceText: "module ModuleA { export class ClassA { public PropertyA: string = \"Yellow\"; }}",
                    isDeclaration: true,
                    sourceFileName: "TestA.js"
                },
                {
                    sourceText: "module ModuleA { export class ClassB { public PropertyB: string = \"Green\"; }}",
                    isDeclaration: true,
                    sourceFileName: "TestB.js"
                }
            ],
            generator = new TypeDocs.Generator(inputs, options);

        generator.process();

        strictEqual(generator.modules.length, 1, "1 module present");
        strictEqual(generator.modules[0].items.length, 2, "2 classes present");
    });

    test("test doc generation for multiple files - with just multiple root modules", 3, () => {
        var options: TypeDocs.GeneratorOptions = { underscoreIsPrivate: false },
            inputs: TypeDocs.GeneratorInput[] = [
                {
                    sourceText: "module ModuleA { export class ClassA { public PropertyA: string = \"Yellow\"; }}",
                    isDeclaration: true,
                    sourceFileName: "TestA.js"
                },
                {
                    sourceText: "module ModuleA { export class ClassB { public PropertyB: string = \"Green\"; }}",
                    isDeclaration: true,
                    sourceFileName: "TestB.js"
                },
                {
                    sourceText: "module ModuleB { export class ClassB { public PropertyB: string = \"Green\"; }}",
                    isDeclaration: true,
                    sourceFileName: "TestB.js"
                }
            ],
            generator = new TypeDocs.Generator(inputs, options);

        generator.process();

        strictEqual(generator.modules.length, 2, "2 modules present");
        strictEqual(generator.modules[0].items.length, 2, "2 classes present in ModuleA");
        strictEqual(generator.modules[1].items.length, 1, "1 class present in ModuleB");
    });

    test("test doc generation for multiple files - with same module defined in different files", 7, () => {
        var options: TypeDocs.GeneratorOptions = { underscoreIsPrivate: false },
            inputs: TypeDocs.GeneratorInput[] = [
                {
                    sourceText: "module ModuleA { export module ModuleB { export class ClassA { public PropertyA: string = \"Yellow\"; } } }",
                    isDeclaration: true,
                    sourceFileName: "TestA.js"
                },
                {
                    sourceText: "module ModuleA.ModuleB { export class ClassB { public PropertyB: string = \"Green\"; }}",
                    isDeclaration: true,
                    sourceFileName: "TestB.js"
                },
                {
                    sourceText: "module ModuleA { export class ClassC { public PropertyB: string = \"Green\"; }}",
                    isDeclaration: true,
                    sourceFileName: "TestB.js"
                }
            ],
            generator = new TypeDocs.Generator(inputs, options);

        generator.process();

        strictEqual(generator.modules.length, 1, "1 module present");
        strictEqual(generator.modules[0].items.length, 2, "2 items present in ModuleA");
        strictEqual(generator.modules[0].items[1].name, "ClassC", "ClassC present in ModuleA");
        var moduleB = <TypeDocs.Syntax.ContainerElement>generator.modules[0].items[0];
        strictEqual(moduleB.name, "ModuleB", "ModuleB present in ModuleA");
        strictEqual(moduleB.items.length, 2, "2 items present in ModuleB");
        strictEqual(moduleB.items[0].name, "ClassA", "ClassA present in ModuleB");
        strictEqual(moduleB.items[1].name, "ClassB", "ClassB present in ModuleB");
    });

    test("test doc generation for JsDoc comment in base class", 5, () => {
        var options: TypeDocs.GeneratorOptions = {
                commentInExtendsIndicatorText: "get from base class",
                underscoreIsPrivate: false
            },
            inputs: TypeDocs.GeneratorInput[] = [
                {
                    sourceText: "module ModuleA {\r\n /**\r\n     * Creates a class\r\n     */\r\n    export class ClassA { \r\n /**\r\n     * property A of class A\r\n     */\r\npublic PropertyA: string = \"Yellow\"; } }",
                    isDeclaration: true,
                    sourceFileName: "TestA.js"
                },
                {
                    sourceText: "module ModuleA {\r\n /**\r\n     * get from base class\r\n     */\r\n    export class ClassB extends ClassA { public PropertyB: string = \"Green\"; }}",
                    isDeclaration: true,
                    sourceFileName: "TestB.js"
                },
                {
                    sourceText: "module ModuleA {\r\n /**\r\n     * testing class C\r\n     */\r\n    export class ClassC extends ClassA {  \r\n /**\r\n     * get from base class\r\n     */\r\npublic PropertyA: string = \"Red\"; }}",
                    isDeclaration: true,
                    sourceFileName: "TestB.js"
                }
            ],
            generator = new TypeDocs.Generator(inputs, options);

        generator.process();

        var classB = <Syntax.Class>generator.modules[0].items[1];
        strictEqual(classB.name, "ClassB", "ClassB present in ModuleA");
        strictEqual(classB.description, "Creates a class", "ClassB has the same description as ClassA");
        var classC = <Syntax.Class>generator.modules[0].items[2];
        strictEqual(classC.name, "ClassC", "ClassC present in ModuleA");
        strictEqual(classC.description, "testing class C", "ClassC has its own description");
        strictEqual(classC.items[0].name, "property A of class A", "ClassC.PropertyA has same description as ClassA.PropertyA");
    });
}
