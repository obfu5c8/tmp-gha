import { Readable, Writable } from 'stream';

import { Config } from '../config';
import { streamGotestfmt } from '../util/gotestfmt';
import { asyncPipeline } from '../util/streams';

export async function streamFormattedResultsToStdout(source: Readable, _: Config): Promise<void> {
    // const gotestfmt = spawnGotestfmt();

    const formatter = streamGotestfmt({
        noFail: true,
        onExit(code, _signal) {
            if (code && code >= 2) {
                return new Error('gotestfmt error');
            }
        },
    });

    source.on('error', (err) => {
        formatter.emit('error', err);
    });

    // We have to proxy the writes to stdout because otherwise it
    // gets paused, and console.log doesn't work afterwards =\
    const sink = new Writable({
        writev(chunks, callback) {
            for (const chunk of chunks) {
                process.stdout.write(chunk.chunk as Buffer);
            }
            callback();
        },
    });

    return asyncPipeline(source, formatter, sink);
}
