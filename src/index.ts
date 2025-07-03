import * as chai from "chai";
import { Err, Ok, ResultAsync } from "neverthrow";
import "vitest";

declare module "vitest" {
	interface Assertion {
		okv: Assertion;
		errv: Assertion;
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
			} else if (obj && obj instanceof ResultAsync) {
				const mapped = obj.match(
					(v) => v,
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
				console.log("re-mapped");
				utils.flag(this, "object", mapped);
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
});
