import "./index";
import { ResultAsync, ok, err } from "neverthrow";
import { describe, expect, it } from "vitest";

describe("ok", () => {
	it("correctly identifies valid equals implementation", () => {
		expect(ok(1)).okv.toEqual(1);
		expect(err(1)).errv.toEqual(1);
	});
});

describe("async", () => {
	it("correctly identifies valid equals implementation", async () => {
		await expect(ResultAsync.fromSafePromise(Promise.resolve(1))).aokv.toEqual(
			1,
		);
		await expect(
			ResultAsync.fromSafePromise(Promise.resolve({ x: 10 })),
		).aokv.toMatchObject({
			x: expect.any(Number),
		});
		// await expect(Promise.resolve(true)).aokv.toMatchObject({
		// 	x: expect.any(Number),
		// });
	});
});
