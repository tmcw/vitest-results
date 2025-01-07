/*
 * Copyright (C) 2024 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information
 */

import { describe, expect, it } from "vitest";

import * as exports from "../main/index.js";
import {
    isBrowser, isLinux, isMacOS, isNodeJS, isWindows, readFile, removeFile, resolvePath, resolveURI, writeFile
} from "../main/support/environment.js";

describe("index", () => {
     it("exports relevant types and functions and nothing more", () => {
        // Check exported functions
        expect({ ...exports }).toEqual({
            isBrowser,
            isNodeJS,
            isLinux,
            isWindows,
            isMacOS,
            resolveURI,
            resolvePath,
            readFile,
            writeFile,
            removeFile
        });
    });

    it("registers jest-extended matchers", () => {
        expect("Test").toStartWith("Te");
        expect("Test").not.toStartWith("st");
    });
});
