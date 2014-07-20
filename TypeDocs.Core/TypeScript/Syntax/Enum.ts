module TypeDocs.Syntax {
    "use strict";

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
                    get: (): EnumValue[] => {
                        return this.items.filter(c => c.elementType === ElementType.EnumValue);
                    },
                    set: (value: EnumValue[]): void => {
                        throw new Error("properties property cannot be set.");
                    },
                    enumerable: true
                });
        }
    }
}
