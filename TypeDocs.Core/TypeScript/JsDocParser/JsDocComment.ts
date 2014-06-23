module TypeDocs.JsDocParser {
    /**
     * Defines the attributes of a JsDoc comment.
     */
    export class JsDocComment {
        /**
         * The description of the comment.
         */
        public description: string = "";

        /**
         * The parameters defined in the comment by the @param tag as a string map.
         */
        public parameters: StringMap<string> = {};

        /**
         * The return value defined in the comment by the @return or @returns tag.
         */
        public returns: string = "";
    }
}
