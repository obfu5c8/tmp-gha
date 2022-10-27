import { Transform } from 'readable-stream';

/**
 * Like Array.prototype.reduce but for streams.
 *
 * Given a sync reduce function and an initial value it will
 * return a through stream that emits a single data event with
 * the reduced value once the input stream ends.
 */
export function streamReducer<TIn, TOut>(fn: (acc: TOut, data: TIn) => TOut, initial: TOut) {
    let value = initial;

    return new Transform({
        objectMode: true,
        transform(chunk: TIn, _, callback) {
            value = fn(value, chunk);
            callback();
        },
        final(callback) {
            this.emit('data', value);
            callback();
        },
    });
}
