/*
 * Copyright (C) 2020 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { matcherHint, printExpected, printReceived } from "jest-matcher-utils";

const passMessage = (actual: unknown, expected: unknown, numDigits: number) => () =>
    matcherHint(".not.toEqualCloseTo")
        + "\n\n"
        + `Expected value (rounded to ${numDigits} fractional digits) to not equal:\n`
        + `  ${printExpected(expected)}\n`
        + "Received:\n"
        + `  ${printReceived(actual)}`;

const failMessage = (actual: unknown, expected: unknown, numDigits: number) => () =>
    matcherHint(".toEqualCloseTo")
        + "\n\n"
        + `Expected value (rounded to ${numDigits} fractional digits) to equal:\n`
        + `  ${printExpected(expected)}\n`
        + "Received:\n"
        + `  ${printReceived(actual)}`;

expect.extend({
    toEqualCloseTo(received: unknown, expected: unknown, numDigits: number = 2): jest.CustomMatcherResult {
        const pass = this.equals(received, expected, [
            (a: unknown, b: unknown) => {
                if (typeof a === "number" && typeof b === "number") {
                    return Math.abs(a - b) < 10 ** -numDigits / numDigits;
                } else {
                    return undefined;
                }
            }
        ]);
        const message = (pass ? passMessage : failMessage)(received, expected, numDigits);
        return { pass, message };
    }
});
