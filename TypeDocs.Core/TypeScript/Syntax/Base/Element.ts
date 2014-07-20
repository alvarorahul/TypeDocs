module TypeDocs.Syntax {
    "use strict";

    /**
     * Defines the attributes common to all syntax elements.
     */
    export class Element {
        /**
         * The name of the element.
         */
        public name: string;

        /**
         * The description of the element.
         */
        public description: string;

        /**
         * The type of the element.
         */
        public elementType: ElementType;

        /**
         * The display text for the type of the element.
         */
        public elementTypeText: string;

        /**
         * True if element is public; else false.
         */
        public isPublic = true;

        /**
         * True if element is private; else false.
         */
        public isPrivate = false;

        /**
         * True if element is public through explicit modifier; else false.
         */
        public isPublicExplicit = false;

        /**
         * True if element is private; else false.
         */
        public isStatic = false;

        /**
         * Creates a new instance of the DocBase class.
         */
        constructor() {
            // Ensures that the elementTypeText property cannot be set while still being enumerable.
            // This ensures that the default JSON.stringify picks this up.
            Object.defineProperty(
                this,
                "elementTypeText",
                {
                    get: (): string => {
                        return ElementType[this.elementType];
                    },
                    set: (value: string): void => {
                        throw new Error("elementTypeText property cannot be set.");
                    },
                    enumerable: true
                });
        }
    }
}