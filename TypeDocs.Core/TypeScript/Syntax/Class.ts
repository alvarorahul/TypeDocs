module TypeDocs.Syntax {
    /**
     * Defines the attributes of a TypeScript class.
     */
    export class Class extends ClassInterfaceBase {
        /**
         * Creates a TypeScript class element.
         */
        constructor() {
            super();
            this.elementType = ElementType.Class;
        }
    }
}
