module TypeDocs.Syntax {
    "use strict";

    /**
     * Defines the attributes common to all parameter and property elements.
     */
    export class ParameterPropertyBase extends Element {
        /**
         * The type of the element.
         */
        public type: string;

        /**
         * True if the element is optional; else false.
         */
        public optional = false;
    }
}
