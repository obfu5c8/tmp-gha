import { pipeline, Readable } from "stream";
import { Config } from "../config";
import { gotestfmtArgs, spawnGotestfmt } from "../util/gotestfmt";
import { asyncPipeline, createStringSink, spawnStreamDuplex } from "../util/stream-helpers";
import { spawnChildProcessDuplex } from "../util/streams/child-process-streams";

export async function generateSummary(source: Readable, config: Config) {
    // Spawn the gotestfmt process to parse the stream

    const gotestfmt = spawnGotestfmt(buildGotestfmtArgs(config));

    // Create a string sink to capture the output
    const stringSink = createStringSink();

    // Execute the pipeline
    await asyncPipeline(source, gotestfmt, stringSink);

    // Resolve with the captured string
    return stringSink.value;
}

function buildGotestfmtArgs(config: Config): gotestfmtArgs {
    const args: gotestfmtArgs = {
        ci: "gfm",
    };

    switch (config.summaryDetail) {
        case "failed":
            args.hide = "all";
            break;
        case "not-passed":
            args.hide = "successful-tests,successful-packages";
    }

    return args;
}
