import { Duplex } from 'stream';

import { spawnChild } from './streams';
import { spawnExitCallback } from './streams/_functions/child';
import { spawnChildProcessDuplex } from './streams/child-process-streams';

export interface gotestfmtArgs {
    ci?: string;
    formatter?: string;
    hide?: string;
    noFail?: boolean;
    showTestStatus?: boolean;
    cwd?: string;
    onExit?: spawnExitCallback;
}

export function streamGotestfmt(opts: gotestfmtArgs = {}): Duplex {
    const args: string[] = [];

    if (opts.ci) {
        args.push('-ci', opts.ci);
    }
    if (opts.formatter) {
        args.push('-formatter', opts.formatter);
    }
    if (opts.hide) {
        args.push('-hide', opts.hide);
    }
    if (opts.noFail) {
        args.push('-nofail');
    }
    if (opts.showTestStatus) {
        args.push('-showteststatus');
    }

    return spawnChild('gotestfmt', args, {
        cwd: opts.cwd,
        onExit: opts.onExit,
    });
}

export function spawnGotestfmt(opts: gotestfmtArgs = {}): NodeJS.ReadWriteStream {
    const args: string[] = [];

    if (opts.ci) {
        args.push('-ci', opts.ci);
    }
    if (opts.formatter) {
        args.push('-formatter', opts.formatter);
    }
    if (opts.hide) {
        args.push('-hide', opts.hide);
    }
    if (opts.noFail) {
        args.push('-nofail');
    }
    if (opts.showTestStatus) {
        args.push('-showteststatus');
    }

    return spawnChildProcessDuplex('gotestfmt', args, {
        onNonZeroExit(code, stderr, throwErr) {
            if (code >= 2) {
                throwErr(new Error('gotestfmt error: ' + stderr));
            }
        },
    });
}
