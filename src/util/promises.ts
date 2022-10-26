



export class LabelledPromiseWaitier {

    private readonly _promises: Promise<any>[] = []


    add<T>(label: string, promise: Promise<T>) {
        this._promises.push(new Promise((resolve, reject) => {
            promise.then(r => {
                resolve({
                    label,
                    value: r
                })
            }, err => {
                reject({
                    label,
                    value: err
                })
            })
        }))
    }

    async wait(): Promise<{[label: string]: any}> {
        const results = await Promise.all(this._promises)

        return results.reduce( (o, res) => {
            return {
                ...o,
                [res.label]: res.value
            }
        }, {} as {[key: string]: any})
    }
}
