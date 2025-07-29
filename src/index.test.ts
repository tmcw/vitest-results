import "./index";
import { ResultAsync, ok, err } from "neverthrow";
import { describe, expect, it } from "vitest";

describe("sync", () => {
	it("$ok", () => {
		expect(ok(1)).$ok.toEqual(1);
	});
	describe("$ok", () => {
		it("$ok()", () => {
			expect(ok(1)).$ok;
			expect(ok(1)).not.$err;
		});
		it("not.$err", () => {
			// expect(err(1)).$err;
			expect(ok(1)).not.$err;
		});
		it.fails("$ok() (is an err)", () => {
			expect(ok(1)).$err;
		});
		it.fails("$ok() (bad expectation)", () => {
			expect(ok(1)).$ok.toEqual(2);
		});
	});
	describe("$err", () => {
		it("ok", () => {
			expect(err(1)).$err.toEqual(1);
		});
		it.fails("ok", () => {
			expect(err(1)).$ok.toEqual(1);
		});
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

	describe("$asyncErr", () => {
		const parse = ResultAsync.fromThrowable((str) => JSON.parse(str));
		it("ok", async () => {
			await expect(parse("x")).$asyncErr.toBeInstanceOf(SyntaxError);
			await expect(parse("x")).not.$asyncOk.toBeTruthy();
			await expect(parse("x")).$asyncOk.not.toBeTruthy();
		});
		it.fails("not a ResultAsync instance", async () => {
			await expect(1).$asyncOk.toBeTruthy();
		});
		it.fails("not ok", async () => {
			await expect(parse("x")).$asyncOk.toEqual("x");
		});
	});
});
