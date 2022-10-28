import { Writable } from 'stream';

type ValueSink<T> = Writable & {
    readonly value: Promise<T>;
};

type reducer<T, O> = (prev: T, obj: O) => T;
export const reducerSink = <T, O>(fn: reducer<T, O>, initial: T): ValueSink<T> => {
    let value = initial;
    const sink = new Writable({
        objectMode: true,
        write(chunk: O, _, callback) {
            value = fn(value, chunk);
            callback();
        },
    });

    const valuePromise = new Promise((resolve, reject) => {
        sink.once('finish', () => {
            resolve(value);
        });
        sink.once('error', (err) => {
            reject(err);
        });
    });

    Object.defineProperty(sink, 'value', {
        get() {
            return valuePromise;
        },
    });

    return sink as ValueSink<T>;
};

/**
 * Creates a string sink that will buffer all data received into a string value
 * that is available after the stream has closed.
 *
 * ### Examples
 * @example
 *
 *   const file = fs.createReadStream('my-file.csv')
 *   const someProcess = new Transform()
 *   const sink = stringSink()
 *
 *   file.pipe(someProcess).pipe(sink)
 *
 *   sink.value.then( (output: string) => {
 *      console.log(output)
 *   })
 *
 * @example
 *   async function getValue() {
 *       const file = fs.createReadStream('my-file.csv')
 *       const someProcess = new Transform()
 *       const sink = stringSink()
 *
 *       file.pipe(someProcess).pipe(sink)
 *
 *       await asyncPipeline(file, someProcess, sink)
 *
 *       const output = await sink.value
 *       console.log(output)
 *   }
 */
export const stringSink = (): ValueSink<string> => {
    const buffer: string[] = [];

    const sink = new Writable({
        write(chunk: string | Buffer, _, callback) {
            let err: Error | undefined;
            if (chunk instanceof Buffer) {
                buffer.push(chunk.toString());
            } else if (typeof chunk === 'string') {
                buffer.push(chunk);
            } else {
                err = new Error('Chunk was not string|buffer');
            }
            callback(err);
        },
    });

    const valuePromise = new Promise((resolve, reject) => {
        sink.once('finish', () => {
            resolve(buffer);
        });
        sink.once('error', (err) => {
            reject(err);
        });
    });

    Object.defineProperty(sink, 'value', {
        get() {
            return valuePromise;
        },
    });

    return sink as ValueSink<string>;
};
