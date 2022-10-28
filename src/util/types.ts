export type map<T> = { [key: string]: T };

/**
 * Check whether `U` contains `U1`
 * @param U to be inspected
 * @param U1 to check within
 * @returns [[Boolean]]
 * @example
 * ```ts
 * ```
 */
export type UnionHas<U, U1> = [U1] extends [U] ? true : false;
