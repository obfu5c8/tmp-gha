import * as es from 'event-stream';

import { Config } from '../config';
import { asyncPipeline } from '../util/stream-helpers';
import { streamReducer } from '../util/streams/reduce';
import { map } from '../util/types';

// Stoopid type definitions are missing this one
declare module 'event-stream' {
    export function parse(opts: any): MapStream;
}

interface resultCounter {
    total: number;
    passed: number;
    skipped: number;
    passRate: number;
}

export interface TestResultTotals extends resultCounter {
    packages: map<resultCounter>;
}

export async function countTestResults(source: es.MapStream, config: Config): Promise<TestResultTotals> {
    // Spawn the gotestfmt process to parse the stream

    const totals: TestResultTotals = {
        total: 0,
        passed: 0,
        skipped: 0,
        passRate: -1,
        packages: {},
    };

    const reducer = streamReducer((acc, data: { Action: string; Package: string }) => {
        if (['pass', 'fail', 'skip'].includes(data.Action)) {
            if (!totals.packages[data.Package]) {
                totals.packages[data.Package] = {
                    total: 0,
                    passed: 0,
                    skipped: 0,
                    passRate: -1,
                };
            }
            const pkg = totals.packages[data.Package];

            totals.total++;
            pkg.total++;

            if (data.Action == 'pass') {
                totals.passed++;
                pkg.passed++;
            }
            if (data.Action == 'skip') {
                totals.skipped++;
                pkg.skipped++;
            }
        }
        return undefined;
    }, undefined);

    await asyncPipeline(source, es.split(), es.parse({ error: true }), reducer);

    totals.passRate = totals.passed / (totals.total - totals.skipped);
    for (const key in totals.packages) {
        const pkg = totals.packages[key];
        pkg.passRate = pkg.passed / (pkg.total - pkg.skipped);
    }

    return totals;
}
