/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Checks if the specified object is a record. Only direct instances of the Object type are recognized as record.
 * Types extending Object (Like Array, Date or custom types) are not records.
 *
 * @param object - The object to check.
 * @return True if object is a record, false if not.
 */
export function isRecord(object: unknown): object is Record<string, unknown> {
	return object != null && (object as object).constructor === Object;
}
