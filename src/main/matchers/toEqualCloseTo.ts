/*
 * Copyright (C) 2020 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { expect } from "vitest";

import { isRecord } from "../util/record.js";

expect.extend({
	toEqualCloseTo(received: unknown, expected: unknown, precision: number = 3) {
		function round(obj: unknown): unknown {
			if (Array.isArray(obj)) {
				return obj.map(round);
			} else if (isRecord(obj)) {
				return Object.keys(obj).reduce((acc: { [key: string]: any }, key) => {
					acc[key] = round(obj[key]);
					return acc;
				}, {});
			} else if (typeof obj === "number") {
				return +obj.toFixed(precision);
			} else {
				return obj;
			}
		}
		const roundedReceived = round(received);
		const roundedExpected = round(expected);
		const pass = this.equals(roundedReceived, roundedExpected);
		const message = (): string => {
			const receivedSummary = this.utils.stringify(received, 1, {
				maxWidth: 5,
			});
			const expectedSummary = this.utils.stringify(expected, 1, {
				maxWidth: 5,
			});
			return (
				`expected ${receivedSummary} to ${this.isNot ? "not " : ""}deeply equal ${expectedSummary}` +
				` with numbers rounded to ${precision} decimals\n\n` +
				`${this.utils.printDiffOrStringify(roundedExpected, roundedReceived)}`
			);
		};
		return { pass, message };
	},
});
