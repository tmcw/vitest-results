/*
 * Copyright (C) 2019 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { matcherHint, printExpected, printReceived } from "jest-matcher-utils";

const passMessage = (actual: unknown, expected: unknown, precision: number) => () =>
    matcherHint(".not.toEqualCloseTo")
        + "\n\n"
        + `Expected value (Rounded with precision ${precision}) to not equal:\n`
        + `  ${printExpected(expected)}\n`
        + "Received:\n"
        + `  ${printReceived(actual)}`;

const failMessage = (actual: unknown, expected: unknown, precision: number) => () =>
    matcherHint(".toEqualCloseTo")
        + "\n\n"
        + `Expected value (Rounded with precision ${precision}) to equal:\n`
        + `  ${printExpected(expected)}\n`
        + "Received:\n"
        + `  ${printReceived(actual)}`;

function isRecord(object: unknown): object is Record<string, unknown> {
    return object != null && (object as object).constructor === Object;
}

expect.extend({
    toEqualCloseTo(received: unknown, expected: unknown, precision = 3): jest.CustomMatcherResult {
        function round(obj: unknown): unknown {
            if (typeof obj === "number") {
                return +obj.toFixed(precision);
            } else if (obj instanceof Array) {
                return obj.map(round);
            } else if (isRecord(obj)) {
                return Object.keys(obj).reduce((acc: { [ key: string]: unknown }, key) => {
                    acc[key] = round(obj[key]);
                    return acc;
                }, {});
            } else {
                return obj;
            }
        }
        const roundedReceived = round(received);
        const roundedExpected = round(expected);
        const pass = this.equals(roundedReceived, roundedExpected);
        const message = (pass ? passMessage : failMessage)(roundedReceived, roundedExpected, precision);
        return { pass, message };
    }
});
