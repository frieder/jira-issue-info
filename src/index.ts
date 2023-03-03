import * as core from "@actions/core";
import { ActionInputs } from "./types";
import { getInputs, getLoginData } from "./config";
import { sendRequest } from "./request";
import { AxiosError } from "axios";

let inputs: ActionInputs;

function run() {
    try {
        const login = getLoginData();
        inputs = getInputs();

        sendRequest(login, inputs)
            .then((data) => {
                console.log(`Jira issue [${inputs.issue}] data received.`);
                core.setOutput("json", data);
            })
            .catch((error: AxiosError) => {
                core.setFailed(`Jira issue [${inputs.issue}] data not received.`);
                console.log("HTTP response:");
                console.log(error.response);
            });
    } catch (error) {
        core.setFailed(`Jira issue [${inputs?.issue}] data not received.`);
        console.log(error);
    }
}

run();
