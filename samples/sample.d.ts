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

declare abstract class Animal {
}

declare class Class1 {
    prop1: null;
    prop2: undefined;
}
