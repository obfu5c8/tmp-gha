import type { Exclude } from 'ts-toolbelt/out/Union/Exclude';
import type { Has } from 'ts-toolbelt/out/Union/Has';

export type PromiseValue<P extends Promise<any>> = P extends Promise<infer T> ? T : never;
export type MapOfPromises = { [key: string]: Promise<any> };
export type MapOfResolvedPromises<T extends MapOfPromises> = {
    [Key in keyof T]: PromiseValue<T[Key]>;
};
export type MapOfOptionalPromises = { [key: string]: Promise<any> | unknown };
export type MapOfResolvedOptionalPromises<T extends MapOfOptionalPromises> = {
    [Key in keyof T]: T[Key] extends Promise<any>
        ? // value is a promise, return its resolved type
          PromiseValue<T[Key]>
        : // value is either not a promise, or a union of promise + something else
        Has<T[Key], Promise<any>> extends 1
        ? // value is a union of promise and something else, offer both options
          PromiseValue<Extract<T[Key], Promise<any>>> | Exclude<T[Key], Promise<any>>
        : // value is not in any way a promose, just give its type
          T[Key];
};

export async function promiseMapAll<T extends MapOfOptionalPromises>(
    mapOfPromises: T
): Promise<MapOfResolvedOptionalPromises<T>> {
    const labels: (keyof T)[] = Object.keys(mapOfPromises);
    const promises = labels.map((label) => mapOfPromises[label]);
    const promiseYields = await Promise.all(promises);

    return promiseYields.reduce((results, result, i) => {
        return {
            ...results,
            [labels[i]]: result,
        };
    }, {} as MapOfResolvedOptionalPromises<T>);
}
