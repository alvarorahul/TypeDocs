module TypeDocs.Syntax {
    /**
     * Defines the attributes of a TypeScript indexer.
     */
    export class Indexer extends ParameterPropertyBase {
        /**
         * Creates a TypeScript indexer element.
         */
        constructor() {
            super();
            this.elementType = ElementType.Indexer;
        }
    }
}
