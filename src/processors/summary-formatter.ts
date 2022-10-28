import { Readable } from 'stream';

import { Config } from '../config';
import { gotestfmtArgs, spawnGotestfmt } from '../util/gotestfmt';
import { asyncPipeline, stringSink } from '../util/streams';

export async function generateSummary(source: Readable, config: Config): Promise<string> {
    // Spawn the gotestfmt process to parse the stream
    const gotestfmt = spawnGotestfmt(buildGotestfmtArgs(config));

    // Create a string sink to capture the output
    const sink = stringSink();

    // Execute the pipeline
    await asyncPipeline(source, gotestfmt, sink);

    // Resolve with the captured string
    return await sink.value;
}

function buildGotestfmtArgs(config: Config): gotestfmtArgs {
    const args: gotestfmtArgs = {
        ci: 'gfm',
    };

    switch (config.summaryDetail) {
        case 'failed':
            args.hide = 'all';
            break;
        case 'not-passed':
            args.hide = 'successful-tests,successful-packages';
    }

    return args;
}
