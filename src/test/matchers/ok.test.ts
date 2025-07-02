/*
 * Copyright (C) 2020 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import "../../main/matchers/toBeOk.js";
import { ok } from "neverthrow";
import { describe, expect, it } from "vitest";

describe("ok", () => {
	it("correctly identifies valid equals implementation", () => {
		expect(ok(1)).okv.toEqual(1);
	});
});
