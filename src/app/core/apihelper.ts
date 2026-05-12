export class ApiHelper {
    static readonly ROOT = 'http://localhost:3000';
    static readonly ENDPOINTS = {
        alertsByServer: `${ApiHelper.ROOT}/api/servers/:serverid/alerts`, // done
        getActiveAlerts: `${ApiHelper.ROOT}/api/servers/:serverid/alerts/active`, // done
        resolveAlert: `${ApiHelper.ROOT}/api/alerts/:id/resolve`, // done
        
        allServers: `${ApiHelper.ROOT}/api/servers`, // done
        serverById: `${ApiHelper.ROOT}/api/servers/:serverid`, // TODO: realizable desde front?
        addServer: `${ApiHelper.ROOT}/api/servers`, // done
        deleteServer: `${ApiHelper.ROOT}/api/servers/:serverid`, // TODO: se puede hacer?
        updateServer: `${ApiHelper.ROOT}/api/servers/:serverid`, // TODO: se puede hacer?
        getServerUsage: `${ApiHelper.ROOT}/api/servers/:serverid/usage`, // done ; TODO: se va a usar el monitoreo, o esto?

        allChangelogs: `${ApiHelper.ROOT}/api/changelog`, // done

        getConfig: `${ApiHelper.ROOT}/api/config`, // done
        saveConfig: `${ApiHelper.ROOT}/api/config`, // done

        allUsers: `${ApiHelper.ROOT}/api/users`, // TODO: FALTA
        userById: `${ApiHelper.ROOT}/api/users/:userid`, // TODO: realizable desde el front?, si existe allUsers
        addUser: `${ApiHelper.ROOT}/api/users`, // TODO: FALTA
        deleteUser: `${ApiHelper.ROOT}/api/users/:userid`, // TODO: FALTA
        updateUser: `${ApiHelper.ROOT}/api/users/:userid`, // TODO: FALTA

        auth: `${ApiHelper.ROOT}/api/auth/login` // done, falta implementacion
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