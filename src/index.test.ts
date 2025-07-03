/*
 * Copyright (C) 2020 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import "./index.js";
import { ResultAsync, ok, err } from "neverthrow";
import { describe, expect, it } from "vitest";

describe("ok", () => {
	it("correctly identifies valid equals implementation", () => {
		expect(ok(1)).okv.toEqual(1);
		expect(err(1)).errv.toEqual(1);
	});
});

describe.todo("async", () => {
	it("correctly identifies valid equals implementation", async () => {
		await expect(
			ResultAsync.fromSafePromise(Promise.resolve(1)),
		).resolves.okv.toEqual(1);
	});
});
