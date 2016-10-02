/**
 * Documentation for test interface.
 */
declare interface TestInterface2 {
    (): string;
    (input: string): string;
    count: number;
}

/**
 * Defines a map with string keys.
 */
declare interface StringMap<T> {
    [key: string]: T;
}
