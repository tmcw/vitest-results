import { PromisifyAssertion } from "@vitest/expect";
import * as chai from "chai";
import { Err, Ok, ResultAsync } from "neverthrow";
import "vitest";

declare module "vitest" {
	interface Assertion<T> {
		okv: Assertion;
		errv: Assertion;
		aokv: PromisifyAssertion<T>;
	}
}

chai.use((chai, utils) => {
	utils.addChainableMethod(
		chai.Assertion.prototype,
		"okv",
		function (this: any) {},
		function (this: any) {
			const obj = utils.flag(this, "object");
			if (obj && obj instanceof Ok && obj.isOk()) {
				utils.flag(this, "object", obj.value);
				return this;
			} else {
				this.assert(
					false,
					`expected #{this} to be Ok with value`,
					`expected #{this} not to be Ok with value`,
					true,
					false,
				);
				return this;
			}
		},
	);

	utils.addChainableMethod(
		chai.Assertion.prototype,
		"errv",
		function (this: any) {},
		function (this: any) {
			const obj = utils.flag(this, "object");
			if (obj && obj instanceof Err && obj.isErr()) {
				utils.flag(this, "object", obj.error);
				return this;
			} else {
				this.assert(
					false,
					`expected #{this} to be Ok with value`,
					`expected #{this} not to be Ok with value`,
					true,
					false,
				);
				return this;
			}
		},
	);

	// https://github.com/vitest-dev/vitest/blob/c1f78d2adc78ef08ef8b61b0dd6a925fb08f20b6/packages/expect/src/jest-expect.ts#L1050C1-L1115C4
	utils.addProperty(
		chai.Assertion.prototype,
		"aokv",
		function aokvResolver(this: any) {
			const error = new Error("resolves");
			utils.flag(this, "promise", "resolves");
			utils.flag(this, "error", error);
			const obj = utils.flag(this, "object");

			if (utils.flag(this, "poll")) {
				throw new SyntaxError(
					`expect.poll() is not supported in combination with .resolves`,
				);
			}

			if (typeof obj?.then !== "function") {
				throw new TypeError(
					`You must provide a Promise to expect() when using .resolves, not '${typeof obj}'.`,
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
								if (resolved && resolved instanceof Ok && resolved.isOk()) {
									utils.flag(this, "object", resolved.value);
								} else {
									utils.flag(this, "object", resolved);
									this.assert(
										false,
										`expected #{this} to be Ok`,
										`expected #{this} not to be Ok with value`,
										true,
										false,
									);
								}
								return result.call(this, ...args);
							},
							(err: any) => {
								this.assert(
									false,
									`expected #{this} to be Ok with value`,
									`expected #{this} not to be Ok with value`,
									true,
									false,
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
