/*
 * Copyright (C) 2020 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { expect } from "vitest";

import { isEquatable } from "../util/Equatable.js";

expect.extend({
    toBeEquatable(value: unknown, equalValues: unknown[], unequalValues: unknown[]) {
        const successes: string[] = [];
        const failures: string[] = [];

        if (isEquatable(value)) {
            successes.push("value has equals method");

            // Test if equals method is reflexive
            if (value.equals(value)) {
                successes.push("reflexive (value.equals(value) returned true)");
            } else {
                failures.push("not reflexive (value.equals(value) returned false)");
            }

            // Test against null and undefined
            if (value.equals(null) || value.equals(undefined)) {
                failures.push("value.equals(null|undefined) returned true");
            } else {
                successes.push("value.equals(null|undefined) returned false");
            }

            // Test against equal values
            let index = 1;
            for (const equalValue of equalValues) {
                if (value.equals(equalValue)) {
                    successes.push(`value.equals(equalValue#${index}) returned true`);
                    // Test if value is symmetric
                    if (isEquatable(equalValue)) {
                        if (equalValue.equals(value)) {
                            successes.push(`symmetric (equalValue#${index}.equals(value) returned true)`);
                        } else {
                            failures.push(`not symmetric (equalValue#${index}.equals(value) returned false)`);
                        }
                    } else {
                        failures.push(`not symmetric (equalValue#${index} has no equals method)`);
                    }
                } else {
                    failures.push(`value.equals(equalValue#${index}) returned false`);
                }
                index++;
            }

            // Test against unequal values
            index = 1;
            for (const unequalValue of unequalValues) {
                if (value.equals(unequalValue)) {
                    failures.push(`value.equals(unequalValue#${index}) returned true`);
                } else {
                    successes.push(`value.equals(unequalValue#${index}) returned false`);
                    // Test if equals method is symmetric
                    if (isEquatable(unequalValue)) {
                        if (unequalValue.equals(value)) {
                            failures.push(`not symmetric (unequalValue#${index}.equals(value) returned true)`);
                        } else {
                            successes.push(`symmetric (unequalValue#${index}.equals(value) returned false)`);
                        }
                    }
                }
                index++;
            }
        } else {
            failures.push("value has no equals method");
        }

        const pass = failures.length === 0;
        const message = pass
            ? () => `Equality contract is fulfilled:\n\n  * ${successes.join("\n  * ")}`
            : () => `Equality contract is not fulfilled:\n\n  * ${failures.join("\n  * ")}`;

        return { pass, message };
    }
});
