import "./index";
import { ok, err } from "true-myth/result";
import { describe, expect, it } from "vitest";

describe("sync", () => {
	it("$ok", () => {
		expect(ok(1)).$ok.toEqual(1);
	});
	describe("$ok", () => {
		it("$ok()", () => {
			expect(ok(1)).$ok;
		});
		it("not.$err", () => {
			expect(err(1)).$err;
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
