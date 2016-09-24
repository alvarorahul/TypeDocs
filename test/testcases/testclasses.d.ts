/**
 * Documentation for abstract class.
 */
declare abstract class Mammal {
    public limbs: number;
    protected abstract mutation: any;
    public abstract getSoundType(): string;
}

/**
 * Documentation for derived class.
 */
declare class Dog extends Mammal {
    public mutation: string;
    public getSoundType(): "bark";
}

declare interface TestInterface {
    prop2: undefined;
}

declare class TestClass<T5> implements TestInterface {
    prop1: null;
    prop2: undefined;
    prop3: "a" | "b";
    prop4: "c";
    prop5: T5;
}
