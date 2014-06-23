module TypeDocs.Syntax {
    /**
     * Defines the attributes of a TypeScript interface.
     */
    export class Interface extends ClassInterfaceBase {
        /**
         * Creates a TypeScript interface element.
         */
        constructor() {
            super();
            this.elementType = ElementType.Interface;
        }
    }
}
