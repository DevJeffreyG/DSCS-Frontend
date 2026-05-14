import { environment } from '../../environments/environment';

export class ApiHelper {
    static readonly ROOT = environment.apiUrl;
    static readonly ENDPOINTS = {
        alertsByServer: `${ApiHelper.ROOT}/api/servers/:serverid/alerts`,
        getActiveAlerts: `${ApiHelper.ROOT}/api/servers/:serverid/alerts/active`,
        resolveAlert: `${ApiHelper.ROOT}/api/alerts/:id/resolve`,
        
        allServers: `${ApiHelper.ROOT}/api/servers`,
        addServer: `${ApiHelper.ROOT}/api/servers`,
        getServerUsage: `${ApiHelper.ROOT}/api/servers/:serverid/usage`,

        allChangelogs: `${ApiHelper.ROOT}/api/changelog`,

        getConfig: `${ApiHelper.ROOT}/api/config`,
        saveConfig: `${ApiHelper.ROOT}/api/config`,

        allUsers: `${ApiHelper.ROOT}/api/users`,
        userById: `${ApiHelper.ROOT}/api/users/:id`,
        addUser: `${ApiHelper.ROOT}/api/users`, // TODO: FALTA
        deleteUser: `${ApiHelper.ROOT}/api/users/:id`,
        updateUser: `${ApiHelper.ROOT}/api/users/:id`,

        auth: `${ApiHelper.ROOT}/api/auth/login`,
        validateToken: `${ApiHelper.ROOT}/api/auth/me` 
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

    public static AuthorizedHeaders() {
        const token = localStorage.getItem('auth');

        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }
}