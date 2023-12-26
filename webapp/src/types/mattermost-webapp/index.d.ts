export interface PluginRegistry {
    registerPostTypeComponent(typeName: string, component: React.ElementType);

    registerProduct(
        baseURL: string,
        switcherIcon: string,
        switcherText: string,
        switcherLinkURL: string,
        mainComponent: React.ElementType,
        headerCentreComponent: React.ElementType,
        headerRightComponent?: React.ElementType,
        showTeamSidebar: boolean,
    );

    // Add more if needed from https://developers.mattermost.com/extend/plugins/webapp/reference
}
