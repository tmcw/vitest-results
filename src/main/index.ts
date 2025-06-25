/*
 * Copyright (C) 2024 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import "vitest";

export * from "./jest-extended.js";
export * from "./matchers/toBeEquatable.js";
export * from "./matchers/toBeGarbageCollected.js";
export * from "./matchers/toEqualCloseTo.js";
export * from "./support/environment.js";

interface CustomMatchers<R = unknown> {
	toBeEquatable(equalValues: unknown[], unequalValues: unknown[]): R;
	toBeGarbageCollected(destructor: () => void, timeout?: number): Promise<R>;
	toEqualCloseTo(value: unknown, precision?: number): R;
}

declare module "vitest" {
	interface Assertion<T = any> extends CustomMatchers<T> {}
	interface AsymmetricMatchersContaining extends CustomMatchers {}
	interface ExpectStatic<T = any> extends CustomMatchers<T> {}
}
