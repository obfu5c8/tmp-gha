import { spawnChildProcessDuplex } from './streams/child-process-streams';

export interface gotestfmtArgs {
    ci?: string;
    formatter?: string;
    hide?: string;
    noFail?: boolean;
    showTestStatus?: boolean;
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
