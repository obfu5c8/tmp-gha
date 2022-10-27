import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import duplexer2 from "duplexer2";
import { Duplex, PassThrough, Readable } from "stream";

type ChildProcessStreamOpts = SpawnOptionsWithoutStdio & {
    onNonZeroExit?: (code: number, stderr: string, throwErr: (err: Error) => void) => void;
};

export function spawnChildProcessDuplex(cmd: string): NodeJS.ReadWriteStream;
export function spawnChildProcessDuplex(cmd: string, opts: ChildProcessStreamOpts): NodeJS.ReadWriteStream;
export function spawnChildProcessDuplex(
    cmd: string,
    args: string[],
    opts?: ChildProcessStreamOpts
): NodeJS.ReadWriteStream;
export function spawnChildProcessDuplex(cmd: string, arg1?: unknown, arg2?: unknown): NodeJS.ReadWriteStream {
    // Gather variadic function arguments
    let args: string[] = [];
    let opts: ChildProcessStreamOpts;
    if (arg1 && Array.isArray(arg1)) {
        args = arg1;
        opts = arg2 as ChildProcessStreamOpts;
    } else {
        opts = arg1 as ChildProcessStreamOpts;
    }

    const { onNonZeroExit, ...spawnOpts } = opts;

    // Set up our streams
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const stream = duplexer2(stdin, stdout);

    // Spawn the child process
    const proc = spawn(cmd, args, spawnOpts);

    // Hook up stdin & stdout
    stdin.pipe(proc.stdin);
    proc.stdout.pipe(stdout);

    // Capture stderr to a buffer for error reporting
    const stdoutChunks: string[] = [];
    proc.stdout.on("data", (chunk) => {
        stdoutChunks.push(chunk.toString());
    });

    // When proc exits, check its exit code and throw an
    // error if it's not a 'good one'. This has to be left
    // up to the user since a non-zero exit code does not
    // always indicade an error.
    proc.on("exit", (code, signal) => {
        if (!signal && code && code != 0) {
            if (opts && opts.onNonZeroExit) {
                opts.onNonZeroExit(code, stdoutChunks.join(""), (err: Error) => {
                    stream.emit("error", err);
                });
            }
        }
    });

    return stream;
}

export function spawnExternalProcessDuplex(cmd: string): NodeJS.ReadWriteStream {
    const stdin = new PassThrough();
    const stdout = new PassThrough();

    const proc = spawn("bash", ["-c", cmd]);

    stdin.pipe(proc.stdin);

    proc.stdout.pipe(stdout);
    proc.stderr.pipe(stdout);

    const stream = duplexer2(stdin, stdout);

    return stream;
}

export function spawnExternalProcessSource(cmd: string, opts?: SpawnOptionsWithoutStdio): Readable {
    const proc = spawn("bash", ["-c", cmd], opts);

    const stdout = new PassThrough();

    stdout.on("pause", () => {
        proc.stdout.pause();
    });
    stdout.on("resume", () => {
        proc.stdout.resume();
    });
    proc.stdout.pipe(stdout);
    return stdout;
}
