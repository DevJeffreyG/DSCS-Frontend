# Sistema de Alertas - DSCS Frontend (AI Assisted)

Sistema de alertas sin IndexedDB. Todo depende del backend.

> Se puede probar un backend en este mismo repositorio: /back-test
```
npm i
node mock-backend.js
```

## 🏗️ Arquitectura

```
Backend WebSocket → AlertListener → AlertManager → UI
```

- **AlertListenerService**: Conexión WebSocket + HTTP al backend
- **AlertManagerService**: Gestión en memoria (se pierde al recargar)
- **ServerService**: API con métodos de alertas

## ⚡ Quick Start

### 1. Configurar Backend URL

[alert-listener.service.ts](./alert-listener.service.ts):
```typescript
private backendUrl = 'http://localhost:3000';
```

### 2. Usar en Componentes

```typescript
export class MyComponent {
  alerts$ = this.serverService.getServerAlerts(1);
  
  constructor(private serverService: ServerService) {}
}
```

## 📋 Métodos Principales

```typescript
// Obtener alertas activas
getServerAlerts(serverId)

// Suscribirse a nuevas alertas
subscribeToServerAlerts(serverId)

// Obtener historial desde backend
getHistoricalAlerts(serverId, filters)

// Marcar como resuelta
resolveAlert(alertId)

// Estadísticas
getAlertStats(serverId)

// Todas las críticas
getAllCriticalAlerts()
```

## 🔧 Backend Requirements

### Endpoints
```
GET  /api/servers/:serverId/alerts
PATCH /api/alerts/:alertId
```

### WebSocket
```
socket.on('alert', alert => {})
```

## 💾 Almacenamiento

- **En memoria**: Mientras el navegador esté abierto
- **Al recargar**: Se pierden (todo viene del backend)

## 📱 Componentes

```html
<!-- Vista completa -->
<app-alerts-viewer [serverId]="1"></app-alerts-viewer>

<!-- Badge compacto -->
<app-alert-badge [serverId]="1"></app-alert-badge>
```
