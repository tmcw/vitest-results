/*
 * Copyright (C) 2019 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { matcherHint } from "jest-matcher-utils";

import { sleep } from "./util/sleep";

const passMessage = () => () =>
    matcherHint(".not.toBeGarbageCollected")
        + "\n\n"
        + "Expected object not to be garbage collected but it was";

const failMessage = () => () =>
    matcherHint(".toBeGarbageCollected")
        + "\n\n"
        + "Expected object to be garbage collected but it was not";

expect.extend({
    async toBeGarbageCollected(ref: WeakRef<Record<string, unknown>>, destructor: () => void, timeout: number = 5000):
            Promise<jest.CustomMatcherResult> {
        destructor();
        let pass = false;
        const end = Date.now() + timeout;
        while (!pass && Date.now() < end) {
            await sleep();
            if (global.gc == null) {
                throw new Error("gc() function not found");
            }
            global.gc();
            await sleep();
            pass = ref.deref() === undefined;
        }
        const message = (pass ? passMessage : failMessage)();
        return { pass, message };
    }
});

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeGarbageCollected(destructor: () => void, timeout?: number): Promise<R>;
        }
    }
}
