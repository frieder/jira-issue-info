export type JiraLogin = {
    baseUrl: string;
    email: string;
    token: string;
};

export type ActionInputs = {
    retries: number;
    retryDelay: number;
    timeout: number;
    issue: string;
};
