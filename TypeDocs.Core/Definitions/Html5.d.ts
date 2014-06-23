interface HTMLTextAreaElement {
    selectionDirection: string;
}

interface HTMLInputElement {
    selectionDirection: string;
}

interface Window {
    chrome: any;
    ActiveXObject: any;
}

interface MessageEventListener extends EventListener {
    (evt: MessageEvent): void;
}

interface MouseEvent {
    // IE & Chrome
    wheelDelta?: number;
}

// The following parseInt is required here because lib.d supports only string as input.
// Even though TypeScript will not change the input to be any, it would be a big
// change in programming habits and language to transform all variables to a string
// before calling this function.
/**
 * Converts any into an integer.
 *
 * @param s A value to convert into a number.
 * @param radix A value between 2 and 36 that specifies the base of the number in numString. 
 * If this argument is not supplied, strings with a prefix of '0x' are considered hexadecimal.
 * All other strings are considered decimal.
 * @return Input converted to a number.
 */
declare function parseInt(s: any, radix?: number): number;

// The following focus is available on HTMLElement, however, focus is available on Element
interface Element {
    focus(): void;
}

interface StringMap<T> {
    [key: string]: T;
}

interface NumberMap<T> {
    [key: number]: T;
    length: number;
}

interface Error {
    stack: string;
}

interface Event {
    // Chrome & Opera
    horizontalOverflow: boolean;
    verticalOverflow: boolean;
}
