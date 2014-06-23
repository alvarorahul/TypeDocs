module TypeDocs.Syntax {
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
