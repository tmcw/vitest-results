import * as chai from "chai";
import { Ok } from "neverthrow";
import "vitest";

declare module "vitest" {
	interface Assertion {
		okv: Assertion;
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
});
