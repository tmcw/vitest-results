/*
 * Copyright (C) 2019 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

export function sleep(ms = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
