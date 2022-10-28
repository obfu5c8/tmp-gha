import { ChildProcess, spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { Duplex } from 'stream';

import { duplex } from './duplex';

export type ChildProcessDuplex = Duplex & {
    readonly process: ChildProcess;
};

/**
 * Create a duplex stream from the stdin & stdout of a child process
 *
 * @param childProcess The child process to stream through
 */
export function child(childProcess: ChildProcess, onExit?: spawnExitCallback): ChildProcessDuplex {
    if (childProcess.stdin === null) {
        throw new Error('childProcess.stdin is null');
    } else if (childProcess.stdout === null) {
        throw new Error('childProcess.stdout is null');
    }

    const stream = duplex(childProcess.stdin, childProcess.stdout);

    if (onExit) {
        childProcess.addListener('exit', (code: number | null, signal: NodeJS.Signals | null) => {
            const err = onExit(code, signal);
            if (err) {
                stream.emit('error', err);
            }
        });
    }

    Object.defineProperty(stream, 'process', {
        get() {
            return childProcess;
        },
    });

    return stream as ChildProcessDuplex;
}

export type spawnExitCallback = (
    code: number | null,
    signal: NodeJS.Signals | null
) => Error | void;

/**
 * Create a duplex stream by spawning a child process and piping to/from
 * its stdin and stdout streams
 * @param spawnArgs Arguments passed to child_process.spawn()
 */
export function spawnChild(cmd: string): ChildProcessDuplex;
export function spawnChild(cmd: string, opts: spawnChildOpts): ChildProcessDuplex;
export function spawnChild(cmd: string, args: string[], opts: spawnChildOpts): ChildProcessDuplex;
export function spawnChild(
    cmd: string,
    maybeArgsOrOpts?: string[] | spawnChildOpts,
    maybeOpts?: spawnChildOpts
): ChildProcessDuplex {
    // Handle nasty signature overrides
    let args: string[] | undefined;
    let spawnOpts: SpawnOptionsWithoutStdio | undefined;
    let onExit: spawnExitCallback | undefined;
    if (Array.isArray(maybeArgsOrOpts)) {
        args = maybeArgsOrOpts;
    } else if (typeof maybeArgsOrOpts === 'object') {
        const { onExit: exitFn, ...spOpts } = maybeArgsOrOpts;
        onExit = exitFn;
        spawnOpts = spOpts;
    }
    if (maybeOpts) {
        const { onExit: exitFn, ...spOpts } = maybeOpts;
        onExit = exitFn;
        spawnOpts = spOpts;
    }

    const proc = spawn(cmd, args, spawnOpts);
    return child(proc, onExit);
}
type spawnChildOpts = SpawnOptionsWithoutStdio & {
    onExit?: spawnExitCallback;
};
