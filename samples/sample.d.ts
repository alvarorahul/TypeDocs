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
    }

    enum TestEnum {
        None = 0,
        First = 1,
    }

    interface TestInterface {
        "interface-property": number;
    }
}
