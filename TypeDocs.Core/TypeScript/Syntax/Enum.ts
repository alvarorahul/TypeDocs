module TypeDocs.Syntax {
    /**
     * Defines the attributes of a TypeScript enum.
     */
    export class Enum extends ContainerElement {
        /**
         * Creates a TypeScript enum element.
         */
        constructor() {
            super();
            this.elementType = ElementType.Enum;

            Object.defineProperty(
                this,
                "enumValues",
                {
                    get: () => {
                        return this.items.filter(c => c.elementType === ElementType.EnumValue);
                    },
                    set: (value) => {
                        throw new Error("properties property cannot be set.");
                    },
                    enumerable: true
                });
        }
    }
}
