export interface Equatable {
    equals(object: unknown): boolean;
}

export function isEquatable(object: unknown): object is Equatable {
    return object != null && typeof (object as Equatable).equals === "function";
}
