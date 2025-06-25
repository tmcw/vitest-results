/*
 * Copyright (C) 2024 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information
 */

import { describe, expect, it, vi } from "vitest";

import {
	isBrowser,
	isLinux,
	isMacOS,
	isNodeJS,
	isWindows,
	readFile,
	removeFile,
	resolvePath,
	resolveURI,
	writeFile,
} from "../../main/support/environment.js";

const linuxUserAgent =
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const windowsUserAgent =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const macosUserAgent =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

describe("environment", () => {
	describe("resolveURI", () => {
		it("resolves root-relative path to correct relative path matching the test environment", () => {
			if (isBrowser()) {
				expect(resolveURI("data/test.txt")).toBe("/data/test.txt");
			} else {
				expect(resolveURI("data/test.txt")).toBe("data/test.txt");
			}
		});
	});

	describe("resolvePath", () => {
		it("resolves root-relative path to correct absolute path", async () => {
			let expectedRootDir: string;
			if (isNodeJS()) {
				expectedRootDir = process.cwd().replaceAll("\\", "/");
			} else {
				const { server } = await import("@vitest/browser/context");
				expectedRootDir = server.config.root;
			}
			expect(resolvePath("data/test.txt")).toBe(
				`${expectedRootDir}/data/test.txt`,
			);
		});
	});

	describe("isNodeJS", () => {
		it("returns true if environment is Node.JS or false if not", () => {
			expect(isNodeJS()).toBe(globalThis.process?.release?.name === "node");
		});
	});

	describe("isBrowser", () => {
		it("returns true if environment is a Browser (has a window object)", () => {
			expect(isBrowser()).toBe(typeof window === "object");
		});
	});

	describe("readFile", () => {
		it("reads the given file", async () => {
			const content = await readFile("src/test/data/utf-8.txt");
			expect(content).toBe("Test äöü\n");
		});
		it("reads the given file with specific encoding", async () => {
			const content = await readFile("src/test/data/latin1.txt", "latin1");
			expect(content).toBe("Test äöü\n");
		});
		it("reads the given file as base64", async () => {
			const content = await readFile("src/test/data/latin1.txt", "base64");
			expect(content).toBe("VGVzdCDk9vwK");
		});
	});

	describe("writeFile", () => {
		it("creates parent directories", async () => {
			const path = `lib/${crypto.randomUUID()}/${crypto.randomUUID()}/${crypto.randomUUID()}/test.txt`;
			await writeFile(path, "Test");
			try {
				expect(await readFile(path)).toBe("Test");
			} finally {
				await removeFile(path);
			}
		});
		it("writes text to given file", async () => {
			const path = `lib/.test-files/${crypto.randomUUID()}.txt`;
			await writeFile(path, "Test äöü");
			try {
				const content = await readFile(path);
				expect(content).toBe("Test äöü");
			} finally {
				await removeFile(path);
			}
		});
		it("writes text to given file in specific encoding", async () => {
			const path = `lib/.test-files/${crypto.randomUUID()}.txt`;
			await writeFile(path, "Test äöü", "latin1");
			try {
				const content = await readFile(path, "latin1");
				expect(content).toBe("Test äöü");
			} finally {
				await removeFile(path);
			}
		});
		it("writes binary via base64 string", async () => {
			const path = `lib/.test-files/${crypto.randomUUID()}.txt`;
			await writeFile(path, "VGVzdCDk9vwK", "base64");
			try {
				const content = await readFile(path, "latin1");
				expect(content).toBe("Test äöü\n");
			} finally {
				await removeFile(path);
			}
		});
	});

	describe("removeFile", () => {
		it("removes the given file", async () => {
			const path = `lib/.test-files/${crypto.randomUUID()}.txt`;
			await writeFile(path, "Test");
			await removeFile(path);
			await expect(readFile(path)).rejects.toThrow();
		});
		it("throws error when removing non-existing file", async () => {
			await expect(
				removeFile("lib/.test-files/not-here.txt"),
			).rejects.toThrow();
		});
	});

	describe("isLinux", () => {
		it("returns false if platform is Windows", () => {
			if (isNodeJS()) {
				const mock = vi
					.spyOn(process, "platform", "get")
					.mockReturnValue("win32");
				try {
					expect(isLinux()).toBe(false);
				} finally {
					mock.mockRestore();
				}
			} else {
				const mock = vi
					.spyOn(navigator, "userAgent", "get")
					.mockReturnValue(windowsUserAgent);
				try {
					expect(isLinux()).toBe(false);
				} finally {
					mock.mockRestore();
				}
			}
		});
		it("returns true if platform is Linux", () => {
			if (isNodeJS()) {
				const mock = vi
					.spyOn(process, "platform", "get")
					.mockReturnValue("linux");
				try {
					expect(isLinux()).toBe(true);
				} finally {
					mock.mockRestore();
				}
			} else {
				const mock = vi
					.spyOn(navigator, "userAgent", "get")
					.mockReturnValue(linuxUserAgent);
				try {
					expect(isLinux()).toBe(true);
				} finally {
					mock.mockRestore();
				}
			}
		});
	});

	describe("isWindows", () => {
		it("returns false if platform is Linux", () => {
			if (isNodeJS()) {
				const mock = vi
					.spyOn(process, "platform", "get")
					.mockReturnValue("linux");
				try {
					expect(isWindows()).toBe(false);
				} finally {
					mock.mockRestore();
				}
			} else {
				const mock = vi
					.spyOn(navigator, "userAgent", "get")
					.mockReturnValue(linuxUserAgent);
				try {
					expect(isWindows()).toBe(false);
				} finally {
					mock.mockRestore();
				}
			}
		});
		it("returns true if platform is Linux", () => {
			if (isNodeJS()) {
				const mock = vi
					.spyOn(process, "platform", "get")
					.mockReturnValue("win32");
				try {
					expect(isWindows()).toBe(true);
				} finally {
					mock.mockRestore();
				}
			} else {
				const mock = vi
					.spyOn(navigator, "userAgent", "get")
					.mockReturnValue(windowsUserAgent);
				try {
					expect(isWindows()).toBe(true);
				} finally {
					mock.mockRestore();
				}
			}
		});
	});

	describe("isMacOS", () => {
		it("returns false if platform is Linux", () => {
			if (isNodeJS()) {
				const mock = vi
					.spyOn(process, "platform", "get")
					.mockReturnValue("linux");
				try {
					expect(isMacOS()).toBe(false);
				} finally {
					mock.mockRestore();
				}
			} else {
				const mock = vi
					.spyOn(navigator, "userAgent", "get")
					.mockReturnValue(linuxUserAgent);
				try {
					expect(isMacOS()).toBe(false);
				} finally {
					mock.mockRestore();
				}
			}
		});
		it("returns true if platform is Mac OS", () => {
			if (isNodeJS()) {
				const mock = vi
					.spyOn(process, "platform", "get")
					.mockReturnValue("darwin");
				try {
					expect(isMacOS()).toBe(true);
				} finally {
					mock.mockRestore();
				}
			} else {
				const mock = vi
					.spyOn(navigator, "userAgent", "get")
					.mockReturnValue(macosUserAgent);
				try {
					expect(isMacOS()).toBe(true);
				} finally {
					mock.mockRestore();
				}
			}
		});
	});
});
