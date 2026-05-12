<details>
<summary>APIs Needed</summary>

- [ServerService](https://github.com/DevJeffreyG/DSCS-Frontend/blob/b6944ec283386f796bdd23341e3e07742fc936e1/src/app/shared/services/server.service.ts#L11)
  - getAllServers(): [servers[]](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/server.ts#L1)
  - getServerById(id): [server](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/server.ts#L1)
  - addServer([server](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/server.ts#L1)): void
  - updateServer([server](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/server.ts#L1)): void
  - deleteServer(id): void
- [UserService](https://github.com/DevJeffreyG/DSCS-Frontend/blob/b6944ec283386f796bdd23341e3e07742fc936e1/src/app/shared/services/user.service.ts#L9)
  - getUsers(): [users[]](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/user.ts#L3)
  - getUserById(id): [user](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/user.ts#L3)
  - addUser([user](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/user.ts#L3)): void
  - updateUser(id, [user](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/user.ts#L3)): void
  - deleteUser(id): void
  - login(correo, pass): [user](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/user.ts#L3)
- [ConfigService](https://github.com/DevJeffreyG/DSCS-Frontend/blob/b6944ec283386f796bdd23341e3e07742fc936e1/src/app/shared/services/config.service.ts#L7)
  - getConfig(): [config](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/config.ts#L1)
  - saveConfig([config](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/config.ts#L1)): void
- [ChangelogService](https://github.com/DevJeffreyG/DSCS-Frontend/blob/b6944ec283386f796bdd23341e3e07742fc936e1/src/app/shared/services/changelog.service.ts#L10)
  - getChangelogs(): [changelogs[]](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/changelog.ts#L3)
  - newChangelog([changelog](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/changelog.ts#L3)): void
- [AlertListenerService](https://github.com/DevJeffreyG/DSCS-Frontend/blob/b6944ec283386f796bdd23341e3e07742fc936e1/src/app/shared/services/alert-listener.service.ts#L11)
  - getHistoricalAlerts(serverId, [filters](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/alert.ts#L21)): [serveralerts[]](https://github.com/DevJeffreyG/DSCS-Frontend/blob/7dd74b08c3898e35f8a15e9da041e45c157f89ed/src/app/shared/interfaces/alert.ts#L1)
  - resolveAlert(alertId): void
</details>

## Installation

### Prerequisites

Before you start, make sure you have:

* **Node.js 20.x or later** (Node.js 20.x recommended)
* **Angular CLI** installed globally:

```bash
npm install -g @angular/cli
```

---

### Install Dependencies

```bash
npm install
# or
yarn install
```

---

### Start Development Server

```bash
npm start
```

Then open:
👉 `http://localhost:4200`

### Credits

- ✨ [TailAdmin](https://tailadmin.com/)