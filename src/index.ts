import * as core from "@actions/core";
import { ActionInputs, CustomField } from "./types";
import { getInputs, getLoginData } from "./config";
import { sendRequest } from "./request";
import { AxiosResponse } from "axios";

(async function () {
    const login = getLoginData();
    const inputs = getInputs();
    const response: AxiosResponse = await sendRequest(login, inputs);
    _setOutput(response.data, inputs);
    core.info(`Data for Jira issue [${inputs.issue}] received.`);
})().catch((err) => {
    core.setFailed("Unexpected error occurred in action: " + err.message);
});

function _setOutput(json: any, inputs: ActionInputs) {
    core.setOutput("issue", json.key);
    core.setOutput("summary", json.fields.summary);
    core.setOutput("description", json.fields.description?.content[0]?.content[0]?.text);
    core.setOutput("type", json.fields.issuetype?.name);
    core.setOutput("typeID", json.fields.issuetype?.id);
    core.setOutput("status", json.fields.status?.name);
    core.setOutput("statusID", json.fields.status?.id);
    core.setOutput("priority", json.fields.priority?.name);
    core.setOutput("priorityID", json.fields.priority?.id);
    core.setOutput("resolution", json.fields.resolution);
    core.setOutput("labels", json.fields.labels?.join(","));
    core.setOutput("reporter", json.fields.reporter?.displayName);
    core.setOutput("reporterID", json.fields.reporter?.accountId);
    core.setOutput("assignee", json.fields.assignee?.displayName);
    core.setOutput("assigneeID", json.fields.assignee?.accountId);
    core.setOutput("components", json.fields.components?.map((c: any) => c.name).join(","));

    _addCustomFieldsToOutput(json, inputs.customFields);

    core.setOutput("json", JSON.stringify(json));
}

function _addCustomFieldsToOutput(json: any, fields: CustomField[]) {
    if (fields.length === 0) return;

    fields.forEach((field) => {
        const fieldName = "customfield_" + field.id;
        const value = json.fields[fieldName];

        if (value === null) {
            core.setOutput(field.outputID, "");
        } else if (typeof value === "string") {
            core.setOutput(field.outputID, value);
        } else if (typeof value === "object") {
            core.setOutput(field.outputID, value.value);
        }
    });
}
