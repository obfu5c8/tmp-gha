import * as core from "@actions/core"
import { executeAction } from "./action";
import { getActionInputs } from "./action-inputs";


(async function main() {
    try {
        const inputs = getActionInputs()
        await executeAction(inputs)
    } catch (err: any) {
        core.setFailed(err.message);
    }
})()
