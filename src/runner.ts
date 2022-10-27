import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { PassThrough, Readable, Writable } from 'stream';

export const spawnBashCommand = (cmd: string, opts: SpawnOptionsWithoutStdio): MultiOutputCommand =>
    new MultiOutputCommand(cmd, opts);

class MultiOutputCommand {
    private readonly _passthrough: PassThrough;

    constructor(private readonly cmd: string, private readonly opts: SpawnOptionsWithoutStdio) {
        this._passthrough = new PassThrough();
    }

    pipeStdoutTo(dest: Writable): this {
        this._passthrough.pipe(dest);
        return this;
    }

    get stdout(): Readable {
        return this._passthrough;
    }

    execute(): Promise<{ code: number | null; signal: NodeJS.Signals | null; err: any }> {
        return new Promise((resolve, _) => {
            const p = spawn('bash', ['-c', this.cmd], {
                ...this.opts,
            });

            let stdout = '';
            p.stderr.on('data', (chunk: string | Buffer) => {
                stdout += chunk.toString();
            });
            p.stdout.pipe(this._passthrough);

            p.on('exit', (code, signal) => {
                resolve({
                    code,
                    signal,
                    err: stdout,
                });
            });
        });
    }
}
