/*
 * Copyright (C) 2024 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import "jest-extended";

import * as matchers from "jest-extended";
import { expect } from "vitest";

expect.extend(matchers);

declare module "vitest" {
    interface Assertion<T = any> extends CustomMatchers<T> {}
    interface AsymmetricMatchersContaining<T = any> extends CustomMatchers<T> {}
    interface ExpectStatic<T = any> extends CustomMatchers<T> {}
}
