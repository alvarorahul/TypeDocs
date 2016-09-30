declare module "A/B/C" {
    /**
     * Test module documentation.
     */
    module D {
    }

    /**
     * Second test module documentation.
     * More information about the module.
     */
    module E {
    }
}

declare module "D" {
    export = Main;
    module Main {
        /**
         * Defines an item.
         */
        const item: string;
    }
}
