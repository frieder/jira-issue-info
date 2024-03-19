export interface JiraLogin {
    baseUrl: string;
    email: string;
    token: string;
}

export interface CustomField {
    id: string;
    outputID: string;
}

export interface ActionInputs {
    retries: number;
    retryDelay: number;
    timeout: number;
    issue: string;
    customFields: CustomField[];
}
