module TypeDocs.Syntax {
    "use strict";

    /**
     * Defines the attributes of a TypeScript function.
     */
    export class Function extends Element {
        /**
         * The parameters of the function.
         */
        public parameters: Parameter[] = [];

        /**
         * The return value of the function.
         */
        public returns: Parameter;

        /**
         * Creates a TypeScript function element.
         */
        constructor() {
            super();
            this.elementType = ElementType.Function;
        }
    }
}
