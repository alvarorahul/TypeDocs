module TypeDocs.Syntax {
    /**
     * Defines the attributes of a TypeScript module.
     */
    export class Module extends ContainerElement {
        /**
         * The parent module.
         */
        public parent: Module;

        /**
         * The full name of the module.
         */
        public fullName: string;

        /**
         * Creates the module element.
         */
        constructor() {
            super();
            this.elementType = ElementType.Module;
        }

        /**
         * Clones the module.
         *
         * @return The cloned module.
         */
        public clone(): Module {
            var newDoc = new Module();
            newDoc.name = this.name;
            newDoc.fullName = this.fullName;
            newDoc.description = this.description;
            newDoc.parent = this.parent;
            newDoc.items.push.apply(newDoc.items, this.items);
            return newDoc;
        }
    }
}
