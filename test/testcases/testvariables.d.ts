declare module "ModuleWithVariables" {
    /**
     * Defines an exported constant.
     */
    const exportedConstant: number;

    /**
     * Defines an exported let.
     */
    let modifiableVariable: string;

    /**
     * Defines an exported variable.
     */
    var bigintVar: bigint;
}
