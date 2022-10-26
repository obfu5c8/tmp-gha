import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { PassThrough, Readable, Writable } from "stream";
import { Config } from "./config";
import { spawnStreamDuplex } from "./util/stream-helpers";




export const spawnBashCommand = (cmd: string, opts: SpawnOptionsWithoutStdio): MultiOutputCommand => new MultiOutputCommand(cmd, opts)


class MultiOutputCommand {


    private readonly _passthrough: PassThrough


    constructor(private readonly cmd: string, private readonly opts: SpawnOptionsWithoutStdio) {
        this._passthrough = new PassThrough()
    }


    pipeStdoutTo(dest: Writable): this {
        this._passthrough.pipe(dest)
        return this
    }

    get stdout(): Readable {
        return this._passthrough
    }


    execute(): Promise<{code: number|null, err: any}> {
        return new Promise((resolve, reject) => {
            const p = spawn('bash', ['-c', this.cmd], {
                ...this.opts
            })
        
            let stdout = ''
            p.stderr.on('data', (chunk: any) => {
                stdout += chunk.toString()
            })
            p.stdout.pipe(this._passthrough)

            p.on('exit', (code, sig) => {
                resolve({
                    code,
                    err: stdout
                })
            })
        })
    }
}




type PromiseProc = Promise<{code: number|null}> & {
    stdin: Writable
    stdout: Readable
    stderr: Readable
}

export function spawnAsync(cmd: string, opts?: SpawnOptionsWithoutStdio): PromiseProc {

    const proc = spawn('bash', ['-c', cmd], {
        ...opts
    })

    const promise = new Promise((resolve, reject) => {
        proc.on('exit', (code, sig) => {
            resolve({
                code,
            })
        })
    }) as PromiseProc


    promise.stdin = proc.stdin
    promise.stdout = proc.stdout
    promise.stderr = proc.stderr

    return promise
}



export function streamTestResultsToSummaryString(source: Readable): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const chunks: Buffer[] = []

        try {
            const formattedStream = source.pipe(spawnStreamDuplex('gotestfmt -ci gfm')).pipe(new PassThrough())
            for await (const chunk of formattedStream) {
                chunks.push(Buffer.from(chunk))
            }
        } catch (err) {
            reject(err)
        }

        resolve(Buffer.concat(chunks).toString('utf-8'))
    })
}

