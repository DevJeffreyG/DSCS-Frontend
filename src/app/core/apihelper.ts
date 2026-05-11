export class ApiHelper {
    static readonly ROOT = 'http://localhost:3000';
    static readonly ENDPOINTS = {
        alertsByServer: `${ApiHelper.ROOT}/api/servers/:serverid/alerts`,
        resolveAlert: `${ApiHelper.ROOT}/api/alerts/:alertid`,
        alertStats: `${ApiHelper.ROOT}/api/servers/:serverid/alerts/stats`,
        
        allServers: `${ApiHelper.ROOT}/api/servers`,
        serverById: `${ApiHelper.ROOT}/api/servers/:serverid`,
        addServer: `${ApiHelper.ROOT}/api/servers`,
        deleteServer: `${ApiHelper.ROOT}/api/servers/:serverid`,
        updateServer: `${ApiHelper.ROOT}/api/servers/:serverid`,

        allChangelogs: `${ApiHelper.ROOT}/api/changelogs`,
        newChangelog: `${ApiHelper.ROOT}/api/changelogs`,

        getConfig: `${ApiHelper.ROOT}/api/config`,
        saveConfig: `${ApiHelper.ROOT}/api/config`,

        allUsers: `${ApiHelper.ROOT}/api/users`,
        userById: `${ApiHelper.ROOT}/api/users/:userid`,
        addUser: `${ApiHelper.ROOT}/api/users`,
        deleteUser: `${ApiHelper.ROOT}/api/users/:userid`,
        updateUser: `${ApiHelper.ROOT}/api/users/:userid`,

        auth: `${ApiHelper.ROOT}/api/auth/login`
    };

    public static getEndpoint(key: keyof typeof ApiHelper.ENDPOINTS, params?: { [key: string]: any }): string {
        let endpoint = this.ENDPOINTS[key];
        if (params) {
            for (const [paramKey, paramValue] of Object.entries(params)) {
                endpoint = endpoint.replace(`:${paramKey}`, encodeURIComponent(String(paramValue)));
            }
        }
        return endpoint;
    }
}