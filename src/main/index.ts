/*
 * Copyright (C) 2024 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import "vitest";

export * from "./matchers/toBeOk.js";

interface CustomMatchers<R = unknown> {
	// Chainable properties for Result types
	okv: R;
	okx: R;
}

declare module "vitest" {
	interface Assertion<T = any> extends CustomMatchers<T> {}
	interface AsymmetricMatchersContaining extends CustomMatchers {}
	interface ExpectStatic<T = any> extends CustomMatchers<T> {}
}
