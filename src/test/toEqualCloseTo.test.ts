/*
 * Copyright (C) 2019 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import "../main/toEqualCloseTo";

describe("toEqualCloseTo", () => {
    it("can compare numbers with specified precision", () => {
        expect(123).not.toEqualCloseTo(124);
        expect(123.45).toEqualCloseTo(123.45);
        expect(123.4567).toEqualCloseTo(123.4568, 3);
        expect(123.4567).not.toEqualCloseTo(123.4568, 4);
    });
    it("can compare number arrays with specified precision", () => {
        expect([ 123 ]).not.toEqualCloseTo([ 124 ]);
        expect([ 123.45 ]).toEqualCloseTo([ 123.45 ]);
        expect([ 123.4567 ]).toEqualCloseTo([ 123.4568 ], 3);
        expect([ 123.4567 ]).not.toEqualCloseTo([ 123.4568 ], 4);
    });
    it("can compare number properties in objects with specified precision", () => {
        expect({ a: 123 }).not.toEqualCloseTo({ a: 124 });
        expect({ a: 123.45 }).toEqualCloseTo({ a: 123.45 });
        expect({ a: 123.4567 }).toEqualCloseTo({ a: 123.4568 }, 3);
        expect({ a: 123.4567 }).not.toEqualCloseTo({ a: 123.4568 }, 4);
    });
    it("can compare number arrays in objects with specified precision", () => {
        expect({ a: [ 123 ] }).not.toEqualCloseTo({ a: [ 124 ] });
        expect({ a: [ 123.45 ] }).toEqualCloseTo({ a: [ 123.45 ] });
        expect({ a: [ 123.4567 ] }).toEqualCloseTo({ a: [ 123.4568 ] }, 3);
        expect({ a: [ 123.4567 ] }).not.toEqualCloseTo({ a: [ 123.4568 ] }, 4);
    });
    it("can compare other types as well", () => {
        expect({ a: 123, b: "test" }).toEqualCloseTo({ a: 123, b: "test" });
        expect({ a: 123, b: "test" }).not.toEqualCloseTo({ a: 123, b: "test2" });
    });
});
