import type { PromisifyAssertion } from "@vitest/expect";
import * as chai from "chai";
import { Err, Ok, ResultAsync } from "neverthrow";
import "vitest";

declare module "vitest" {
	interface Assertion<T> {
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
		$asyncOk: PromisifyAssertion<T>;
		$asyncErr: PromisifyAssertion<T>;
	}
}

function safeIsOk(obj: unknown) {
	return obj && obj instanceof Ok && obj.isOk();
}

function safeIsErr(obj: unknown) {
	return obj && obj instanceof Err && obj.isErr();
}

chai.use((chai, utils) => {
	utils.addChainableMethod(
		chai.Assertion.prototype,
		"$ok",
		function (this: any) {},
		function (this: typeof chai.Assertion.prototype) {
			const obj = utils.flag(this, "object");
			const isOk = safeIsOk(obj);
			this.assert(
				// expression to be tested
				isOk,
				// if message fails
				`expected #{this} to be Ok`,
				// if this has been negated and fails
				`expected #{this} not to be Ok`,
			);
			utils.flag(this, "object", obj.value);
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
			utils.flag(this, "object", obj.error);
			return this;
		},
	);

	// https://github.com/vitest-dev/vitest/blob/c1f78d2adc78ef08ef8b61b0dd6a925fb08f20b6/packages/expect/src/jest-expect.ts#L1050C1-L1115C4
	utils.addProperty(
		chai.Assertion.prototype,
		"$asyncOk",
		function resolver(this: typeof chai.Assertion.prototype) {
			const error = new Error("resolves");
			utils.flag(this, "promise", "resolves");
			utils.flag(this, "error", error);
			const obj = utils.flag(this, "object");

			if (utils.flag(this, "poll")) {
				throw new SyntaxError(
					`expect.poll() is not supported in combination with .resolves`,
				);
			}

			if (!(obj instanceof ResultAsync)) {
				throw new TypeError(
					`You must provide a ResultAsync to expect() when using .$asyncOk, not '${typeof obj}'.`,
				);
			}

			const proxy: any = new Proxy(this, {
				get: (target, key, receiver) => {
					const result = Reflect.get(target, key, receiver);

					if (typeof result !== "function") {
						return result instanceof chai.Assertion ? proxy : result;
					}

					return (...args: any[]) => {
						utils.flag(this, "_name", key);
						const promise = obj.then(
							(resolved: any) => {
								this.assert(
									safeIsOk(resolved),
									`expected #{this} to be Ok`,
									`expected #{this} not to be Ok with value`,
								);
								utils.flag(this, "object", resolved.value);
								return result.call(this, ...args);
							},
							(err: any) => {
								this.assert(
									false,
									`expected #{this} to be Ok with value, but it rejected the promise`,
									`expected #{this} not to be Ok with value, but it rejected the promise`,
									null,
									err,
								);
							},
						);

						return promise;
					};
				},
			});

			return proxy;
		},
	);

	utils.addProperty(
		chai.Assertion.prototype,
		"$asyncErr",
		function resolver(this: typeof chai.Assertion.prototype) {
			const error = new Error("resolves");
			utils.flag(this, "promise", "resolves");
			utils.flag(this, "error", error);
			const obj = utils.flag(this, "object");

			if (utils.flag(this, "poll")) {
				throw new SyntaxError(
					`expect.poll() is not supported in combination with .resolves`,
				);
			}

			if (!(obj instanceof ResultAsync)) {
				throw new TypeError(
					`You must provide a ResultAsync to expect() when using .$asyncErr, not '${typeof obj}'.`,
				);
			}

			const proxy: any = new Proxy(this, {
				get: (target, key, receiver) => {
					const result = Reflect.get(target, key, receiver);

					if (typeof result !== "function") {
						return result instanceof chai.Assertion ? proxy : result;
					}

					return (...args: any[]) => {
						utils.flag(this, "_name", key);
						const promise = obj.then(
							(resolved: any) => {
								this.assert(
									safeIsErr(resolved),
									`expected #{this} to be Err`,
									`expected #{this} not to be Err with value`,
								);
								utils.flag(this, "object", resolved.error);
								return result.call(this, ...args);
							},
							(err: any) => {
								this.assert(
									false,
									`expected #{this} to be Err with value, but it rejected the promise`,
									`expected #{this} not to be Err with value, but it rejected the promise`,
									null,
									err,
								);
							},
						);

						return promise;
					};
				},
			});

			return proxy;
		},
	);
});
