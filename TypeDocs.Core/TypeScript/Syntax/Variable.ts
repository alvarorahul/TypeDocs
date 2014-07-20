module TypeDocs.Syntax {
    "use strict";

    /**
     * Defines the attributes of a TypeScript variable.
     */
    export class Variable extends ParameterPropertyBase {
        /**
         * Creates a TypeScript variable element.
         */
        constructor() {
            super();
            this.elementType = ElementType.Property;
        }
    }
}
