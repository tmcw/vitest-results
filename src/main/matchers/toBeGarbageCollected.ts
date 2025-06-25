/*
 * Copyright (C) 2019 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { expect } from "vitest";

import { sleep } from "../util/sleep.js";

expect.extend({
	async toBeGarbageCollected(
		ref: WeakRef<Record<string, unknown>>,
		destructor: () => void,
		timeout: number = 5000,
	) {
		destructor();
		let pass = false;
		const end = Date.now() + timeout;
		while (!pass && Date.now() < end) {
			await sleep();
			if (globalThis.gc == null) {
				throw new Error("gc() function not found");
			}
			globalThis.gc();
			await sleep();
			pass = ref.deref() === undefined;
		}
		const message = (): string =>
			pass
				? "Expected object not to be garbage collected but it was"
				: "Expected object to be garbage collected but it was not";
		return { pass, message };
	},
});
