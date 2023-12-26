import {AnyAction, Dispatch} from 'redux';

import {GetStateFunc} from 'mattermost-redux/types/actions';
import {IntegrationTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';
import {ClientError} from 'mattermost-redux/client/client4';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {id as pluginId} from './manifest';
import {GlobalConfig} from './types';

let siteURL = '';
let basePath = '';
let apiUrl = `${basePath}/plugins/${pluginId}/api/v1`;

export const setSiteUrl = (url?: string): void => {
    if (url) {
        basePath = new URL(url).pathname.replace(/\/+$/, '');
        siteURL = url;
    } else {
        basePath = '';
        siteURL = '';
    }

    apiUrl = `${basePath}/plugins/${pluginId}/api/v1`;
};

export const getSiteUrl = (): string => {
    return siteURL;
};

export const getApiUrl = (): string => {
    return apiUrl;
};

export async function fetchGlobalConfig(): Promise<GlobalConfig> {
    const data = await doGet(`${apiUrl}/config`);
    return data;
}

export async function fetchCheckAndSendMessageOnJoin(channelId: string) {
    const data = await doGet(
        `${apiUrl}/actions/channels/${channelId}/check-and-send-message-on-join`,
    );
    return Boolean(data.viewed);
}

export function fetchPlaybookRunChannels(teamID: string, userID: string) {
    return doGet(
        `${apiUrl}/runs/channels?team_id=${teamID}&participant_id=${userID}`,
    );
}

export async function finishRun(playbookRunId: string) {
    try {
        return await doPut(`${apiUrl}/runs/${playbookRunId}/finish`);
    } catch (error) {
        return {error};
    }
}

export const doGet = async <TData = any>(url: string) => {
    const {data} = await doFetchWithResponse<TData>(url, {method: 'get'});

    return data;
};

export const doPost = async <TData = any>(url: string, body = {}) => {
    const {data} = await doFetchWithResponse<TData>(url, {
        method: 'POST',
        body,
    });

    return data;
};

export const doPut = async <TData = any>(url: string, body = {}) => {
    const {data} = await doFetchWithResponse<TData>(url, {
        method: 'PUT',
        body,
    });

    return data;
};

export const doFetchWithResponse = async <TData = any>(
    url: string,
    options = {},
) => {
    const response = await fetch(url, Client4.getOptions(options));
    let data;
    if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType === 'application/json') {
            data = (await response.json()) as TData;
        }

        return {
            response,
            data,
        };
    }

    data = await response.text();

    throw new ClientError(Client4.url, {
        message: data || '',
        status_code: response.status,
        url,
    });
};

export const doFetchWithTextResponse = async <TData extends string>(
    url: string,
    options = {},
) => {
    const response = await fetch(url, Client4.getOptions(options));

    let data;
    if (response.ok) {
        data = (await response.text()) as TData;

        return {
            response,
            data,
        };
    }

    data = await response.text();

    throw new ClientError(Client4.url, {
        message: data || '',
        status_code: response.status,
        url,
    });
};

export const doFetchWithoutResponse = async (url: string, options = {}) => {
    const response = await fetch(url, Client4.getOptions(options));

    if (response.ok) {
        return;
    }

    throw new ClientError(Client4.url, {
        message: '',
        status_code: response.status,
        url,
    });
};
