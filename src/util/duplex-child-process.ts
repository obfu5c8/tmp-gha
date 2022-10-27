import {
    ChildProcessWithoutNullStreams,
    spawn,
    SpawnOptionsWithoutStdio,
} from "child_process";
import {
    Duplex,
    PassThrough,
    Readable,
    TransformOptions,
    Writable,
} from "stream";

type ExternalProcessDuplexOptions = TransformOptions & {
    killSignal?: number;
};

export class ExternalProcessDuplex extends Duplex {
    constructor(private readonly _options?: ExternalProcessDuplexOptions) {
        super(_options);

        this._reader = new PassThrough(_options);
        this._reader.on("error", (err) => {
            this.emit("error", err);
        });

        this._writer = new PassThrough(_options);
        this._writer.on("error", (err) => {
            this.emit("error", err);
        });
    }

    private _process?: ChildProcessWithoutNullStreams;
    private readonly _reader: PassThrough;
    private readonly _writer: PassThrough;

    private _stdin?: Writable;
    private _stderr?: Readable;
    private _stdout?: Readable;

    /** Has the process exited? */
    private _exited = true;
    /** Was the process killed? */
    private _killed: boolean | null = false;
    /** Has the stream ended? */
    private _ended = false;

    /** Last error generated  */
    private _ex?: any;

    /** Chunks emitted to stderr */
    private _stderrChunks: any[] = [];

    //==> Delegate the streamy stuff
    //=============================================<

    pipe<T extends NodeJS.WritableStream>(
        destination: T,
        options?: { end?: boolean | undefined } | undefined
    ): T {
        return this._reader.pipe(destination, options);
    }

    unpipe(destination?: NodeJS.WritableStream | undefined): this {
        this._reader.unpipe(destination);
        return this;
    }

    setEncoding(encoding: BufferEncoding): this {
        this._reader.setEncoding(encoding);
        return this;
    }

    read(size?: number | undefined) {
        return this._reader.read(size);
    }

    end(cb?: (() => void) | undefined): this;
    end(chunk: any, cb?: (() => void) | undefined): this;
    end(
        chunk: any,
        encoding?: BufferEncoding | undefined,
        cb?: (() => void) | undefined
    ): this;
    end(chunk?: unknown, encoding?: unknown, cb?: unknown): this {
        this._reader.end(
            chunk,
            encoding as BufferEncoding | undefined,
            cb as (() => void) | undefined
        );
        return this;
    }

    write(
        chunk: any,
        encoding?: BufferEncoding | undefined,
        cb?: ((error: Error | null | undefined) => void) | undefined
    ): boolean;
    write(
        chunk: any,
        cb?: ((error: Error | null | undefined) => void) | undefined
    ): boolean;
    write(chunk: unknown, encoding?: unknown, cb?: unknown): boolean {
        return this._writer.write(
            chunk,
            encoding as BufferEncoding | undefined,
            cb as (error: Error | null | undefined) => void
        );
    }

    destroy(error?: Error | undefined): this {
        !!this._process && this._kill(noop);
        return this;
    }

    //==> Spawn our process & hook everything up
    //=============================================<

    spawnBash(cmd: string, opts?: SpawnOptionsWithoutStdio): this {
        return this.spawn("bash", ["-c", cmd], opts);
    }

    spawn(cmd: string, args: string[], opts?: SpawnOptionsWithoutStdio): this {
        // Spawn the child process
        const proc = (this._process = spawn(cmd, args, opts));
        this._stdin = proc.stdin;
        this._stdout = proc.stdout;
        this._stderr = proc.stderr;

        // Pipe input to process's stdin
        this._writer.pipe(proc.stdin);
        // Pipe proc output to our output
        this._stdout.pipe(this._reader, { end: false });

        // Listen to stderr
        this._stderr.on("data", (chunk: any) => {
            this._stderrChunks.push(chunk);
        });

        // In some cases ECONNRESET can be emitted by stdin because the process is not interested in any
        // more data but the _writer is still piping. Forget about errors emitted on stdin and stdout
        this._stdin.on("error", noop);
        this._stdout.on("error", noop);

        // Handle process stdout ending
        this._stdout.on("end", this._onStdoutEnd);

        // Listen for the process ending
        this._process.once("close", this._onExit);
        this._process.once("error", this._onError);

        return this;
    }

    //==> Internals
    //=============================================<

    private _onExit = (code?: number | null, signal?: any) => {
        if (this._exited) {
            return;
        }
        this._exited = true;

        if (this._killed) {
            // do nothing
        } else if (code == 0 && signal === null) {
            // All is well
            this._onStdoutEnd();
        } else {
            // Everything else
            const ex = (this._ex = new ProcessError(
                "Command failed: " +
                    Buffer.concat(this._stderrChunks).toString("utf8")
            ));
            ex.killed = this._process!.killed || this._killed;
            ex.code = code;
            ex.signal = signal;
            this.emit("error", ex);
            this.emit("close");
        }

        this._cleanup();
    };

    /**
     * Kill the process
     * @param cb
     */
    private _kill = (cb: () => void) => {
        this._stdout!.destroy();
        this._stderr!.destroy();

        this._killed = true;

        try {
            this._process!.kill(
                (this._options && this._options.killSignal) || "SIGTERM"
            );
        } catch (err) {
            this._ex = err;
            this._onExit();
        }
        cb && cb();
    };

    /**
     * Handle stdout stream end
     */
    private _onStdoutEnd = () => {
        if (this._exited && !this._ended) {
            this._ended = true;
            this._reader.end(this.emit.bind(this, "close"));
        }
    };

    /** Clean up after the process has exited, resetting all the things */
    private _cleanup = () => {
        this._process = undefined;
        this._stderr = undefined;
        this._stdout = undefined;
        this._stdin = undefined;
        this._stderr = undefined;
        this._ex = undefined;
        this._exited = false;
        this._killed = null;

        this.destroy = noop as any;
    };

    /** Handle errors */
    private _onError = (err: ProcessError) => {
        this._ex = err;
        this._stdout?.destroy();
        this._stderr?.destroy();
        this._onExit();
    };
}

class ProcessError extends Error {
    killed?: boolean | null;
    code?: number | null;
    signal?: any;
}

const noop = () => {};
