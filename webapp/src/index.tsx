/* eslint-disable @typescript-eslint/indent */
import {Store, Action} from 'redux';

import {GlobalState} from '@mattermost/types/lib/store';

import {Client4} from 'mattermost-redux/client';

import React from 'react';

import {manifest} from '@/manifest';
import {PluginRegistry} from '@/types/mattermost-webapp';

import {fetchGlobalConfig, setSiteUrl} from './client';
import BackStage from './components/backstage/BackStage';
import HeaderCentre from './components/backstage/HeaderCentre';
import HeaderRight from './components/backstage/HeaderRight';

type WindowObject = {
    location: {
        origin: string;
        protocol: string;
        hostname: string;
        port: string;
    };
    basename?: string;
};

// From mattermost-webapp/utils
function getSiteURLFromWindowObject(obj: WindowObject): string {
    let siteURL = '';
    if (obj.location.origin) {
        siteURL = obj.location.origin;
    } else {
        siteURL =
            obj.location.protocol +
            '//' +
            obj.location.hostname +
            (obj.location.port ? ':' + obj.location.port : '');
    }

    if (siteURL[siteURL.length - 1] === '/') {
        siteURL = siteURL.substring(0, siteURL.length - 1);
    }

    if (obj.basename) {
        siteURL += obj.basename;
    }

    if (siteURL[siteURL.length - 1] === '/') {
        siteURL = siteURL.substring(0, siteURL.length - 1);
    }

    return siteURL;
}

function getSiteURL(): string {
    return getSiteURLFromWindowObject(window);
}

export default class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(
        registry: PluginRegistry,
        store: Store<GlobalState, Action<Record<string, unknown>>>,
    ) {
        // @see https://developers.mattermost.com/extend/plugins/webapp/reference/

        // Consume the SiteURL so that the client is subpath aware. We also do this for Client4
        // in our version of the mattermost-redux, since webapp only does it in its copy.
        const siteUrl = getSiteURL();
        setSiteUrl(siteUrl);
        Client4.setUrl(siteUrl);

        const config = await fetchGlobalConfig();

        if (config.products) {
            config.products.forEach((item) => {
                // eslint-disable-next-line react/require-optimization, react/jsx-tag-spacing
                const Main = () => (
                    // eslint-disable-next-line react/jsx-tag-spacing
                    <BackStage url={item.siteUrl} />
                );
                // eslint-disable-next-line react/require-optimization, react/jsx-tag-spacing
                const HRight = () => <HeaderRight siteTitle={item.siteTitle} />;
                // eslint-disable-next-line react/require-optimization, react/jsx-tag-spacing
                const HCentre = () => <HeaderCentre siteUrl={item.siteUrl} />;

                registry.registerProduct(
                    // eslint-disable-next-line lines-around-comment
                    `/embed-${item.siteTitle}`,
                    'link-variant',
                    item.siteTitle,
                    `/embed-${item.siteTitle}`,
                    Main,
                    HCentre,
                    HRight,
                    false,
                );
            });
        }

        // // eslint-disable-next-line react/require-optimization
        // const GlobalHeaderCenter = () => {
        //     return <div>{'aaaaaaa'}</div>;
        // };
        // registry.registerGlobalComponent(GlobalHeaderCenter);
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: Plugin): void;
        Components: any;
        PostUtils: Record<
            'formatText' | 'messageHtmlToComponent',
            (args: any) => string | React.Component
        >;
        basename: string;
    }
}

window.registerPlugin(manifest.id, new Plugin());
