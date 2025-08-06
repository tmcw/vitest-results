import type { Assertion, PromisifyAssertion } from "@vitest/expect";
import * as chai from "chai";
import { Err, Ok, ResultAsync } from "neverthrow";
import "@vitest/runner/types";
import type { Test } from "vitest";

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

export function recordAsyncExpect(
	_test: any,
	promise: Promise<any>,
	assertion: string,
	error: Error,
): Promise<any> {
	const test = _test as Test | undefined;
	// record promise for test, that resolves before test ends
	if (test && promise instanceof Promise) {
		// if promise is explicitly awaited, remove it from the list
		promise = promise.finally(() => {
			if (!test.promises) {
				return;
			}
			const index = test.promises.indexOf(promise);
			if (index !== -1) {
				test.promises.splice(index, 1);
			}
		});

		// record promise
		if (!test.promises) {
			test.promises = [];
		}
		test.promises.push(promise);

		let resolved = false;
		test.onFinished ??= [];
		test.onFinished.push(() => {
			if (!resolved) {
				const processor =
					(globalThis as any).__vitest_worker__?.onFilterStackTrace ||
					((s: string) => s || "");
				const stack = processor(error.stack);
				console.warn(
					[
						`Promise returned by \`${assertion}\` was not awaited. `,
						"Vitest currently auto-awaits hanging assertions at the end of the test, but this will cause the test to fail in Vitest 3. ",
						"Please remember to await the assertion.\n",
						stack,
					].join(""),
				);
			}
		});

		return {
			// biome-ignore lint/suspicious/noThenProperty: this is weird magic
			then(onFulfilled, onRejected) {
				resolved = true;
				return promise.then(onFulfilled, onRejected);
			},
			catch(onRejected) {
				return promise.catch(onRejected);
			},
			finally(onFinally) {
				return promise.finally(onFinally);
			},
			[Symbol.toStringTag]: "Promise",
		} satisfies Promise<any>;
	}

	return promise;
}

/**
 * A (fairly) safe method to check whether something is a proper
 * Ok class. Maybe we could duck-type here instead of checking
 * instanceof, just to catch obscure stuff like multiple
 * neverthrow versions floating around?
 */
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

	/**
	 * There is not much documentation of how to do this kind of chaining
	 * thing. Refer to https://tinyurl.com/2ewnxytr for an example.
	 */
	utils.addProperty(
		chai.Assertion.prototype,
		"$asyncOk",
		function resolver(this: typeof chai.Assertion.prototype) {
			const error = new Error("resolves");
			utils.flag(this, "promise", "resolves");
			utils.flag(this, "error", error);
			const obj = utils.flag(this, "object");

			recordAsyncExpect;

			if (utils.flag(this, "poll")) {
				throw new SyntaxError(
					`expect.poll() is not supported in combination with .$asyncOk`,
				);
			}

			if (!(obj instanceof ResultAsync)) {
				throw new TypeError(
					`You must provide a ResultAsync to expect() when using .$asyncOk, not '${typeof obj}'.`,
				);
			}

			/**
			 * We want it to be possible to call any
			 * method off of $asyncOk and for that method to be called
			 * when the ResultAsync resolves. This proxy lets us defer
			 * those calls. This is all nearly 1:1 with how .resolves
			 * works in core vitest.
			 */
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
			const test: Test = utils.flag(this, "vitest-test");
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

						return recordAsyncExpect(
							test,
							promise as Promise<any>,
							createAssertionMessage(
								utils,
								this as unknown as Assertion<any>,
								!!args.length,
							),
							error,
						);
					};
				},
			});

			return proxy;
		},
	);
});
