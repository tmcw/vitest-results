import "./index";
import { ResultAsync, ok, err } from "neverthrow";
import { describe, expect, it } from "vitest";

describe("sync", () => {
	it("$ok", () => {
		expect(ok(1)).$ok.toEqual(1);
	});
	it("$ok()", () => {
		expect(ok(1)).$ok;
		expect(ok(1)).not.$err;
	});
	it("not.$err", () => {
		// expect(err(1)).$err;
		expect(ok(1)).not.$err;
	});
	it("$err", () => {
		expect(err(1)).$err.toEqual(1);
	});
});

describe("async", () => {
	it("$asyncOk", async () => {
		await expect(
			ResultAsync.fromSafePromise(Promise.resolve(1)),
		).$asyncOk.toEqual(1);

		await expect(
			ResultAsync.fromSafePromise(Promise.resolve({ x: 10 })),
		).$asyncOk.toMatchObject({
			x: expect.any(Number),
		});
	});

	it("$asyncErr", async () => {
		const parse = ResultAsync.fromThrowable((str) => JSON.parse(str));
		await expect(parse("x")).$asyncErr.toBeInstanceOf(SyntaxError);
		await expect(parse("x")).not.$asyncOk.toBeTruthy();
	});
});
