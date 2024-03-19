import * as core from "@actions/core";
import { ActionInputs, JiraLogin } from "./types";
import axios, { AxiosError, AxiosInstance } from "axios";
import axiosRetry from "axios-retry";

export async function sendRequest(jira: JiraLogin, inputs: ActionInputs): Promise<any> {
    const httpClient = _createHTTPClient(jira, inputs);
    _setRetrySettings(httpClient, inputs);

    return await httpClient.get(`/rest/api/3/issue/${inputs.issue}`);
}

function _createHTTPClient(jira: JiraLogin, inputs: ActionInputs): AxiosInstance {
    return axios.create({
        baseURL: jira.baseUrl,
        auth: {
            username: jira.email,
            password: jira.token,
        },
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        timeout: inputs.timeout,
    });
}

function _setRetrySettings(httpClient: AxiosInstance, inputs: ActionInputs) {
    const retryCondition = (error: AxiosError): boolean => {
        return (
            axiosRetry.isNetworkOrIdempotentRequestError(error) ||
            (error.response !== undefined && ![200].includes(error.response.status))
        );
    };

    axiosRetry(httpClient, {
        retries: inputs.retries,
        retryCondition: retryCondition,
        retryDelay: () => inputs.retryDelay * 1000,
        shouldResetTimeout: true,
        onRetry: (retryCount, error) => {
            core.info(
                `[${retryCount}/${inputs.retries}] Request failed with rc = ${error.response?.status}, wait for ${inputs.retryDelay} seconds and try again`
            );
        },
    });
}
