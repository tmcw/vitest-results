/*
 * Copyright (C) 2024 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import type { SerializedConfig } from "vitest";

/**
 * @returns True if environment is Node.js, false if not.
 */
export function isNodeJS(): boolean {
    return globalThis.process?.release?.name === "node";
}

/**
 * @returns True if environment is a browser (has window object), false if not.
 */
export function isBrowser(): boolean {
    return typeof window === "object";
}

/**
 * @returns True if running on a Linux.
 */
export function isLinux(): boolean {
    const platform = isNodeJS() ? process.platform : navigator.userAgent;
    return /\bLinux\b/i.test(platform);
}

/**
 * @returns True if running on a Windows.
 */
export function isWindows(): boolean {
    const platform = isNodeJS() ? process.platform : navigator.userAgent;
    return /\bWindows\b/i.test(platform) || /\bWin32\b/i.test(platform) || /\bWin64\b/i.test(platform);
}

/**
 * @returns True if running on a MacOS.
 */
export function isMacOS(): boolean {
    const platform = isNodeJS() ? process.platform : navigator.userAgent;
    return /\bMac OS X\b/i.test(platform) || /\bDarwin\b/i.test(platform);
}

/**
 * Resolves the given path to a URI loadable via HTTP by Node.JS or browser. For Node.JS the path is returned as-is because it is already correct. For browser
 * a slash is prepended because the project root is also the web root.
 *
 * @param path - The path relative to the root directory of the project.
 * @returns The URI which loadable via HTTP by Node.js or browser.
 */
export function resolveURI(path: string): string {
    return isNodeJS() ? path : `/${path}`;
}

/**
 * Resolves the given path to an absolute path suitable for readFile/writeFile commands.
 *
 * @param path - The path relative to the root directory of the project.
 * @returns The absolute path.
 */
export function resolvePath(path: string): string {
    const worker = (globalThis as Record<string, unknown>)["__vitest_worker__"] as Record<string, unknown>;
    const config = worker.config as SerializedConfig;
    const rootDir = config.root;
    return `${rootDir}/${path}`;
}

/**
 * Reads a file. Binaries can be read by using buffer encoding 'base64' and then decoding the returned string.
 *
 * @param path     - The file path relative to the project root directory.
 * @param encoding - Optional buffer encoding. Defaults to 'utf-8'.
 * @returns The read file.
 */
export async function readFile(path: string, encoding: BufferEncoding = "utf-8"): Promise<string> {
    if (isNodeJS()) {
        const { readFile } = await import("node:fs/promises");
        return readFile(resolvePath(path), encoding);
    } else {
        const { server } = await import("@vitest/browser/context");
        const { readFile } = server.commands;
        return readFile(resolvePath(path), encoding);
    }
}

/**
 * Writes a file. Parent directories are created recursively if not already present. Binaries can be written by using base64 encoded data string and the
 * buffer encoding 'base64'.
 *
 * @param path     - The file path relative to the project root directory.
 * @param content  - The content to write.
 * @param encoding - Optional buffer encoding. Defaults to 'utf-8'.
 */
export async function writeFile(path: string, content: string, encoding: BufferEncoding = "utf-8"): Promise<void> {
    const absolutePath = resolvePath(path);
    if (isNodeJS()) {
        const { writeFile, mkdir } = await import("node:fs/promises");
        const { dirname } = await import("node:path");
        await mkdir(dirname(absolutePath), { recursive: true });
        await writeFile(absolutePath, content, encoding);
    } else {
        const { server } = await import("@vitest/browser/context");
        const { writeFile } = server.commands;
        await writeFile(absolutePath, content, encoding);
    }
}

/**
 * Removes the given file. Directories cannot be removed (because vitest browser commands don't support it).
 *
 * @param path - The file path relative to the project root directory.
 */
export async function removeFile(path: string): Promise<void> {
    if (isNodeJS()) {
        const { unlink } = await import("node:fs/promises");
        await unlink(resolvePath(path));
    } else {
        const { server } = await import("@vitest/browser/context");
        const { removeFile } = server.commands;
        await removeFile(resolvePath(path));
    }
}
