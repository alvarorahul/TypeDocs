module TypeDocs.Syntax {
    "use strict";

    /**
     * Defines a TypeScript enum value.
     */
    export class EnumValue extends Element {
        /**
         * Creates a TypeScript enum value element.
         */
        constructor() {
            super();
            this.elementType = ElementType.EnumValue;
        }
    }
}
