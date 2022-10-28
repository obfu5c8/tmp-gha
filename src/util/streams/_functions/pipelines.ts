import { pipeline } from 'stream';
import { promisify } from 'util';

export const asyncPipeline = promisify(pipeline);
