/*
 * Copyright (C) 2019 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/// <reference types="jest" />

declare namespace jest {
    interface Matchers<R> {
        toBeEquatable(equalValues: unknown[], unequalValues: unknown[]): R;
        toEqualCloseTo(value: unknown, precision?: number): R;
   }
}
