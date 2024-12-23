/*
 * Copyright (C) 2024 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information
 */

import "../main/index.js";

import { describe, expect, it } from "vitest";

describe("index", () => {
    it("registers jest-extended matchers", () => {
        expect("Test").toStartWith("Te");
        expect("Test").not.toStartWith("st");
    });
});
