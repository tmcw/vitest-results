import type { Assertion } from "@vitest/expect";
import * as chai from "chai";
import { isOk, isErr } from "true-myth/result";
import "@vitest/runner/types";

declare module "vitest" {
	interface Assertion {
		/**
		 * Unwrap the ok value of a neverthrow result
		 * and produce an assertion on which you can
		 * run other matchers.
		 */
		$ok: Assertion<never>;
		/**
		 * Unwrap the err value of a neverthrow result
		 * and produce an assertion on which you can
		 * run other matchers.
		 */
		$err: Assertion<never>;
		// $asyncOk: PromisifyAssertion<T>;
		// $asyncErr: PromisifyAssertion<T>;
	}
}

// vendored from https://github.com/vitest-dev/vitest/blob/c1f78d2adc78ef08ef8b61b0dd6a925fb08f20b6/packages/expect/src/utils.ts
export function createAssertionMessage(
	util: Chai.ChaiUtils,
	assertion: Assertion,
	hasArgs: boolean,
) {
	const not = util.flag(assertion, "negate") ? "not." : "";
	const name = `${util.flag(assertion, "_name")}(${hasArgs ? "expected" : ""})`;
	const promiseName = util.flag(assertion, "promise");
	const promise = promiseName ? `.${promiseName}` : "";
	return `expect(actual)${promise}.${not}${name}`;
}

/**
 * A (fairly) safe method to check whether something is a proper
 * Ok class. Maybe we could duck-type here instead of checking
 * instanceof, just to catch obscure stuff like multiple
 * neverthrow versions floating around?
 */
function safeIsOk(obj: unknown) {
	return obj && isOk(obj as any);
}

function safeIsErr(obj: unknown) {
	return obj && isErr(obj as any);
}

chai.use((chai, utils) => {
	utils.addChainableMethod(
		chai.Assertion.prototype,
		"$ok",
		function (this: any) {},
		function (this: typeof chai.Assertion.prototype) {
			// Get the value inside the expect chain
			const obj = utils.flag(this, "object");

			// Check that it is an Ok type.
			const isOk = safeIsOk(obj);
			this.assert(
				// expression to be tested
				isOk,
				// if message fails
				`expected #{this} to be Ok`,
				// if this has been negated and fails
				`expected #{this} not to be Ok`,
			);

			// Replace the value inside the expect chain
			// with the value inside of the Ok
			const negate = utils.flag(this, "negate");
			utils.flag(this, "object", negate ? obj.error : obj.value);
			return this;
		},
	);

	utils.addChainableMethod(
		chai.Assertion.prototype,
		"$err",
		function (this: any) {},
		function (this: typeof chai.Assertion.prototype) {
			const obj = utils.flag(this, "object");
			const isErr = safeIsErr(obj);
			this.assert(
				// expression to be tested
				isErr,
				// if message fails
				`expected #{this} to be Err`,
				// if this has been negated and fails
				`expected #{this} not to be Err`,
			);
			const negate = utils.flag(this, "negate");
			utils.flag(this, "object", negate ? obj.value : obj.error);
			return this;
		},
	);
});
