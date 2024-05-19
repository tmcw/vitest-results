import "../main/toBeGarbageCollected";

import { sleep } from "../main/util/sleep";

describe("toBeGarbageCollected", () => {
    it("passes when object was garbage collected", async () => {
        let o: Record<string, unknown> | undefined = { a: 34 };
        await expect(new WeakRef(o)).toBeGarbageCollected(() => { o = undefined; });
    });
    it("passes when object was garbage collected a little bit later", async () => {
        let o: Record<string, unknown> | undefined = { a: 34 };
        await expect(new WeakRef(o)).toBeGarbageCollected(async () => {
            await sleep(250);
            o = undefined;
        });
    });
    it("fails when object was not garbage collected", async () => {
        let o: Record<string, unknown> | undefined = { a: 34 };
        await expect(new WeakRef(o)).not.toBeGarbageCollected(() => {}, 250);
        o = undefined;
    });
});
