module TypeDocs {
    "use strict";

    /**
     * Input for the generator to process.
     */
    export interface GeneratorInput {
        /**
         * The TypeScript source to parse.
         */
        sourceText: string;

        /**
         * True if the data is a declaration file; else false.
         */
        isDeclaration: boolean;

        /**
         * The name of the source file corresponding to the data.
         */
        sourceFileName: string;
    }
}
