import { Readable } from "stream";
import { Config } from "../config";
import { spawnGotestfmt } from "../util/gotestfmt";
import { asyncPipeline } from "../util/stream-helpers";

export async function streamFormattedResultsToStdout(source: Readable, config: Config): Promise<void> {
    const gotestfmt = spawnGotestfmt();

    return asyncPipeline(source, gotestfmt, process.stdout);
}
