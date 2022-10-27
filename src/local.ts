import path from "path";
import { executeAction } from "./action";
import { ActionInputs } from "./action-inputs";
import { Config } from "./config";

async function executeLocally() {
    const inputs: ActionInputs = {
        token: "doesnt_matter",
        name: "Unit Tests",
        dir: path.resolve(__dirname, "..", "example"),
        outputJson: "test-output.json",
        testCmd: "go test -v -json -cover ./...",
        summarize: "failed",
    };

    await executeAction(inputs);
    console.error("Finito!");
}

(async function main() {
    try {
        await executeLocally();
    } catch (err) {
        console.error("FATAL", err);
    }
})();
