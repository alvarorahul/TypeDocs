module TypeDocs.Syntax {
    /**
     * Defines the attributes of a TypeScript parameter.
     */
    export class Parameter extends ParameterPropertyBase {
        /**
         * Creates a TypeScript parameter element.
         */
        constructor() {
            super();
            this.elementType = ElementType.Parameter;
        }
    }
}
 