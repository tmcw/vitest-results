/*
 * Copyright (C) 2020 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import "../../main/matchers/toBeEquatable.js";

import { describe, expect, it } from "vitest";

// Test class with correctly implemented equals method
class Test {
    public constructor(public readonly x: number, public readonly y: number) {}

    public equals(o: unknown): boolean {
        if (o == null) {
            return false;
        }
        if (o === this) {
            return true;
        }
        const other = o as Test;
        if (this.equals !== other.equals) {
            return false;
        }
        return other.x === this.x && other.y === this.y;
    }
}

describe("toBeEquatable", () => {
    it("correctly identifies valid equals implementation", () => {
        expect(new Test(1, 2)).toBeEquatable([ new Test(1, 2) ], [ new Test(1, 20), new Test(10, 2) ]);
    });

    it("rejects when value is not equatable", () => {
        expect("test").not.toBeEquatable([], []);
    });

    it("rejects equals implementation which returns true when comparing with non-equatable object", () => {
        class Test {
            public equals(other: unknown): boolean {
                return true;
            }
        }
        const test = new Test();
        expect(test).not.toBeEquatable([ "test" ], []);
    });

    it("rejects equals implementation which is not reflexive", () => {
        class Test2 extends Test {
            public override equals(other: unknown): boolean {
                if (this === other) {
                    return false;
                }
                return super.equals(other);
            }
        }
        expect(new Test2(1, 2)).not.toBeEquatable([], []);
    });

    it("rejects equals implementation which reports equality for unequal object", () => {
        expect(new Test(1, 2)).not.toBeEquatable([], [ new Test(1, 2) ]);
    });

    it("rejects equals implementation which reports non-equality for equal object", () => {
        expect(new Test(1, 2)).not.toBeEquatable([ new Test(1, 1) ], []);
    });

    it("rejects equals implementation which is not symmetric", () => {
        class Test2 {
            public constructor(private readonly equal: boolean) {}
            public equals(other: unknown): boolean {
                return this.equal;
            }
        }
        expect(new Test2(true)).not.toBeEquatable([ new Test2(false) ], []);
        expect(new Test2(false)).not.toBeEquatable([], [ new Test2(true), "test" ]);
    });
});
