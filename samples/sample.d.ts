
declare module "E" {
    export = Main;
    module Main {
        /**
         * Defines an item.
         */
        const item: string;
    }
}

declare module "A/B/C" {
    /**
     * Test module documentation.
     */
    module D {
    }

    /**
     * Second test module documentation.
     * More information about the module.
     */
    module E {
    }
}

declare module "A/B" {
    export = Main;
    module Main {
        /**
         * Defines an item.
         */
        interface Item {
        }
        /**
         * Defines some value.
         */
        const SomeValue: string;
        /**
         * Defines some class.
         */
        class SomeClass {
            /**
             * Creates an instance of some class.
             *
             * @param data Data for some class.
             */
            constructor(data: any);
        }
    }
}

declare module TestModule {
    /**
     * Class that does this.
     */
    class TestClass {
        /**
         * Creates a new instance of TestClass.
         *
         * @param paramA Parameter A.
         * @param paramB Parameter B.
         */
        constructor(paramA: string, paramB?: string);

        /**
         * Docs for sample method.
         * 
         * @param a test.
         * @returns The return value.
         */
        public testMethod(a: number): number;
    }

    enum TestEnum {
        None = 0,
        First = 1,
    }

    interface TestInterface {
        "interface-property": number;
    }

    export module Inner {
        export const test: string;

        export type foo = string;
    }
}

declare module "OtherModule" {
    import Impl = TestModule.Inner;
    export = Impl;
}

declare module "OtherModule/InnerModule" {
    class Foo {
        public bar: string;
    }
}

declare abstract class Animal {
}

declare class Class1 {
    prop1: null;
    prop2: undefined;
}
