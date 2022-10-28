import * as es from 'event-stream';
import { Readable, Transform } from 'stream';

import { Config } from '../config';
import { asyncPipeline, reducerSink } from '../util/streams';
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

type gotestfmtevent = { Action: string; Package: string; Output?: string };

export async function calculateTotals(source: Readable, _: Config): Promise<TestResultTotals> {
    const reducer = reducerSink<TestResultTotals, gotestfmtevent>(testCountReducer, {
        total: 0,
        passed: 0,
        skipped: 0,
        passRate: -1,
        packages: {},
    });

    const jsonParser = es.parse({ error: true });

    // If first message is 'output' action, there's probably been an error
    let isFirst = true;
    const failFast = new Transform({
        objectMode: true,
        transform(evt: gotestfmtevent, _, callback) {
            isFirst = false;
            if (isFirst && evt.Action === 'output') {
                return callback(new Error('Bad "go test" output: ' + (evt.Output || '')));
            }
            callback(null, evt);
        },
    });

    await asyncPipeline(
        source,
        es.split(),
        jsonParser,
        failFast,
        filterByEventAction(['pass', 'fail', 'skip']),
        reducer
    );

    return await reducer.value;
}

const filterByEventAction = (actions: string[]) =>
    es.filterSync((evt: gotestfmtevent): boolean => actions.includes(evt.Action));

function testCountReducer(totals: TestResultTotals, evt: gotestfmtevent): TestResultTotals {
    const pkg = ensurePackage(totals, evt.Package);

    totals.total++;
    pkg.total++;

    if (evt.Action == 'pass') {
        totals.passed++;
        pkg.passed++;
    }
    if (evt.Action == 'skip') {
        totals.skipped++;
        pkg.skipped++;
    }

    return totals;
}

function ensurePackage(totals: TestResultTotals, pkg: string) {
    if (!totals.packages[pkg]) {
        totals.packages[pkg] = {
            total: 0,
            passed: 0,
            skipped: 0,
            passRate: -1,
        };
    }
    return totals.packages[pkg];
}
