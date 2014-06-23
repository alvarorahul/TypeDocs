module TypeDocs.Syntax {
    /**
     * Defines the attributes of a TypeScript type parameter.
     */
    export class TypeParameter extends ClassInterfaceBase {
        /**
         * Creates a TypeScript type parameter element.
         */
        constructor() {
            super();
            this.elementType = ElementType.TypeParameter;
        }
    }
}
