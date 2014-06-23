module TypeDocs {
    /**
     * Options used for controlling how documentation generation happens.
     */
    export interface GeneratorOptions {
        /**
         * The string to use to indicate that the JsDoc from the implemented entity should be used.
         */
        commentInImplementsIndicatorText?: string;

        /**
         * The string to use to indicate that the JsDoc from the extended entity should be used.
         */
        commentInExtendsIndicatorText?: string;

        /**
         * If true, then all entities starting with underscore are considered private.
         */
        underscoreIsPrivate?: boolean;
    }
}
