import { map } from './types';

type labelledResolution = {
    label: string;
    value: unknown;
};

export class LabelledPromiseWaitier {
    private readonly _promises: Promise<labelledResolution>[] = [];

    add<T>(label: string, promise: Promise<T>) {
        this._promises.push(
            new Promise((resolve, reject) => {
                promise.then(
                    (r) => {
                        resolve({
                            label,
                            value: r,
                        });
                    },
                    (err) => {
                        reject({
                            label,
                            value: err as unknown,
                        });
                    }
                );
            })
        );
    }

    async wait(): Promise<map<any>> {
        const results = await Promise.all(this._promises);

        return results.reduce((o, res) => {
            return {
                ...o,
                [res.label]: res.value,
            };
        }, {} as map<unknown>);
    }
}
