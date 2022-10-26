import { pipeline, Readable } from "stream";
import { Config } from "./config";
import { asyncPipeline, createStringSink, spawnStreamDuplex } from "./util/stream-helpers";



function buildGoTestFmtCommand(config: Config): string {
    const cmd = ['gotestfmt','-ci','gfm']

    switch(config.summaryDetail) {
        case 'failed':
            cmd.push('-hide', 'all')
            break;
        case 'not-passed':
            cmd.push('-hide', 'successful-tests,successful-packages')
    }

    return cmd.join(' ')
}

export async function generateSummary2(source: Readable, config: Config) {
    const gotestfmt = buildGoTestFmtCommand(config)

    const stringSink = createStringSink()
    await asyncPipeline(source, spawnStreamDuplex(gotestfmt), stringSink)

    return stringSink.value;
}


