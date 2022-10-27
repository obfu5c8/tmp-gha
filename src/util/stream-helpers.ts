import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import duplexer from 'duplexer2';
import fs from 'fs';
import { PassThrough, pipeline, Writable } from 'stream';
import { promisify } from 'util';

type Sink = Promise<void> & Writable;

export function createSink(writer: Writable): Sink {
    const promise = new Promise<void>((resolve, reject) => {
        writer.on('finish', () => {
            resolve();
        });
        writer.on('error', (err) => {
            reject(err);
        });
    });

    const sink: Sink = writer as Sink;

    sink.then = promise.then.bind(promise);
    sink.catch = promise.catch.bind(promise);
    sink.finally = promise.finally.bind(promise);

    return sink;
}

export function createFileSink(filePath: string): Sink {
    const stream = new PassThrough();

    const promise = new Promise<void>((resolve, reject) => {
        try {
            const fileWriter = fs.createWriteStream(filePath);
            fileWriter.on('finish', resolve);
            fileWriter.on('error', reject);
            stream.pipe(fileWriter);
        } catch (err) {
            reject(err);
        }
    });

    const sink: Sink = stream as unknown as Sink; // eww
    sink.then = (onfulfilled?, onrejected?) => promise.then(onfulfilled, onrejected);
    sink.catch = (onrejected?) => promise.catch(onrejected);
    sink.finally = (onfinally?) => promise.finally(onfinally);

    return sink;
}

export const asyncPipeline = promisify(pipeline);

export function spawnStreamDuplex(cmd: string, opts?: SpawnOptionsWithoutStdio): NodeJS.ReadWriteStream {
    const stdin = new PassThrough();
    const stdout = new PassThrough();

    const proc = spawn('bash', ['-c', cmd], {
        ...opts,
    });

    stdin.pipe(proc.stdin);
    proc.stdout.pipe(stdout);

    const stderr: string[] = [];
    proc.stderr.on('data', (chunk: string | Buffer) => {
        stderr.push(chunk.toString());
    });

    const stream = duplexer(stdin, stdout);

    proc.on('exit', (code) => {
        if (code == 2) {
            stream.emit('error', new Error(`Process '${cmd}' failed: ${stderr.join(' ')}`));
        }
    });

    return stream;
}

export type StringSink = Writable & {
    readonly value?: string;
};

export function createStringSink(): StringSink {
    const chunks: Buffer[] = [];
    let value: string;

    const writer = new Writable({
        write(chunk, encoding, callback) {
            chunks.push(chunk as Buffer);
            callback();
        },
    });

    writer.on('finish', () => {
        value = Buffer.concat(chunks).toString();
    });

    Object.defineProperty(writer, 'value', {
        get: function () {
            return value;
        },
    });

    return writer;
}
