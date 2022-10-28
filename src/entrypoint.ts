import * as core from '@actions/core';

import { executeAction } from './action';
import { getActionInputs, getConfigFromActionInputs } from './action-inputs';

(async function main() {
    try {
        const inputs = getActionInputs();
        const config = getConfigFromActionInputs(inputs);
        await executeAction(config);
    } catch (err: any) {
        if (err instanceof Error || typeof err === 'string') {
            core.setFailed(err);
        } else {
            core.setFailed('unknown error');
        }
    }
})();
