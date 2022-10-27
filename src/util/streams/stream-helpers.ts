import { Transform, Writable } from 'stream';

const noop = () => {
    throw new Error('Not implemented!');
};

const lineSplitter = noop;

const childProcess = noop;

/**
 * Stream transformer that takes a string/buffer containing JSON
 * and then emits the parsed object
 */
const jsonParser = () => {
    return new Transform({
        writableObjectMode: false,
        readableObjectMode: true,
        transform(chunk: string | Buffer, enc: BufferEncoding, next) {
            if (chunk instanceof Buffer) {
                chunk = chunk.toString(enc);
            } else if (typeof chunk !== 'string') {
                next(new Error('Chunk is not a string or Buffer'));
            }
            next(null, JSON.parse(chunk));
        },
    });
};

type Sink<T> = Writable & {
    readonly value: T;
};

/**
 * Works like Array.reduce() on a stream of objects, collecting them.
 * Once the stream is finished, final value is available on the readonly
 * `value` property.
 *
 * @param fn Reducer function
 * @param initial Initial value
 */
const objectReducerSink = <T, C>(fn: (acc: T, obj: C) => T, initial: T): Sink<T> => {
    let value: T = initial;

    const transform = new Transform({
        objectMode: true,
        transform(chunk: C, _, next) {
            value = fn(value, chunk);
            next();
        },
    });

    Object.defineProperty(transform, 'value', {
        get: () => value,
    });

    return transform as ObjectReducer<T>;
};

const stringSink = noop;

export { childProcess, objectReducerSink, lineSplitter, jsonParser, stringSink };
