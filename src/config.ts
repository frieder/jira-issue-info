import { ActionInputs, CustomField, JiraLogin } from "./types";
import * as core from "@actions/core";
import * as fs from "fs";
import * as YAML from "yaml";

export function getLoginData(): JiraLogin {
    const configPath = `${process.env.HOME}/jira/config.yml`;
    const login: JiraLogin = YAML.parse(fs.readFileSync(configPath, "utf8"));

    _verifyLogin(login);

    return login;
}

export function getInputs(): ActionInputs {
    const inputs: ActionInputs = {
        retries: _getNumber("retries", 1),
        retryDelay: _getNumber("retryDelay", 10),
        timeout: _getNumber("timeout", 2000),
        issue: core.getInput("issue", { required: false }),
        customFields: _getCustomFields(),
    };

    if (!inputs.issue || inputs.issue.length === 0) {
        throw new Error("The issue property must be set.");
    }

    return inputs;
}

function _verifyLogin(login: JiraLogin) {
    if (!login.baseUrl || !login.email || !login.token) {
        throw new Error(
            "All login properties must be set. Do you use the jira-login action properly?"
        );
    }
}

function _getNumber(name: string, defaultValue: number): number {
    const value = core.getInput(name, { required: false });
    if (!value || value.length === 0) {
        return defaultValue;
    }
    return /^\d+$/.exec(value) ? Number(value) : defaultValue;
}

function _getCustomFields(): CustomField[] {
    const fieldsRaw = core.getMultilineInput("customFields", { required: false });

    return fieldsRaw
        .filter((line) => line.trim() !== "" && line.includes(":"))
        .map((line) => {
            const parts = line.split(":");
            return {
                id: parts[1].trim(),
                outputID: parts[0].trim(),
            } as CustomField;
        });
}
