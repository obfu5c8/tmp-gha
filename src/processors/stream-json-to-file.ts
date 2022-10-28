import fs from 'fs';
import { Readable } from 'stream';

import { asyncPipeline } from '../util/streams';

export async function streamJsonToFile(source: Readable, filePath: string): Promise<string> {
    await asyncPipeline(source, fs.createWriteStream(filePath));

    return filePath;
}
