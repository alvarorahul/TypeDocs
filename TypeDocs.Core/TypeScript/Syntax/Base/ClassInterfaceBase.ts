module TypeDocs.Syntax {
    /**
     * Defines the attributes common to all class and interface elements.
     */
    export class ClassInterfaceBase extends ContainerElement {
        /**
         * The name of the element with generic type parameters.
         */
        public nameWithParameters: string;

        /**
         * The constructor of the element.
         */
        public ctor: Function;

        /**
         * The type parameters of the element.
         */
        public typeParameters: TypeParameter[] = [];

        /**
         * The indexer of the element.
         */
        public indexer: Indexer;

        /**
         * The extends clause of the element.
         */
        public extendsClause: string;

        /**
         * The implements clause of the element.
         */
        public implementsClause: string;

        /**
         * Creates a new instance of the element.
         */
        constructor() {
            super();
            Object.defineProperty(
                this,
                "nameWithParameters",
                {
                    get: () => {
                        var parameterList: string = "";
                        for (var i = 0; i < this.typeParameters.length; i++) {
                            parameterList = parameterList + this.typeParameters[i].name + (i === this.typeParameters.length - 1 ? "" : ", ");
                        }

                        if (parameterList) {
                            parameterList = "<" + parameterList + ">";
                        }

                        return this.name + parameterList;
                    },
                    set: (value: string) => {
                        throw new Error("nameWithParameters property cannot be set.");
                    },
                    enumerable: true
                });

            Object.defineProperty(
                this,
                "properties",
                {
                    get: () => {
                        return this.items.filter(c => c.elementType === ElementType.Property);
                    },
                    set: (value) => {
                        throw new Error("properties property cannot be set.");
                    },
                    enumerable: true
                });

            Object.defineProperty(
                this,
                "functions",
                {
                    get: () => {
                        return this.items.filter(c => c.elementType === ElementType.Function);
                    },
                    set: (value) => {
                        throw new Error("properties property cannot be set.");
                    },
                    enumerable: true
                });
        }
    }
}