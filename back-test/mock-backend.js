const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

const alertTypes = ['CRITICAL', 'WARNING', 'INFO'];
const alertResources = ['CPU', 'RAM', 'DISCO', 'RED', 'CONECTIVIDAD', 'GENERAL'];

function createAlert({
  id,
  serverId,
  tipo,
  recurso,
  mensaje,
  valor,
  umbral,
  timestamp = new Date(),
  resuelto = false,
  resueltoEn,
}) {
  return {
    id,
    serverId,
    tipo,
    recurso,
    mensaje,
    valor,
    umbral,
    timestamp,
    resuelto,
    resueltoEn,
  };
}

// Base de datos simulada
const alerts = [
  createAlert({
    id: '1',
    serverId: 1,
    tipo: 'CRITICAL',
    recurso: 'CPU',
    mensaje: 'CPU usage exceeds 90%',
    valor: 94,
    umbral: 90,
    timestamp: new Date(Date.now() - 5 * 60000), // 5 minutos atrás
  }),
  createAlert({
    id: '2',
    serverId: 1,
    tipo: 'WARNING',
    recurso: 'RAM',
    mensaje: 'Memory usage exceeds 80%',
    valor: 82,
    umbral: 80,
    timestamp: new Date(Date.now() - 10 * 60000), // 10 minutos atrás
  }),
  createAlert({
    id: '3',
    serverId: 2,
    tipo: 'CRITICAL',
    recurso: 'DISCO',
    mensaje: 'Disk space critically low',
    valor: 97,
    umbral: 90,
    timestamp: new Date(Date.now() - 15 * 60000), // 15 minutos atrás
  }),
];

const serverSubscriptions = new Map();

// WebSocket eventos
io.on('connection', (socket) => {
  console.log(`✅ Cliente conectado: ${socket.id}`);

  socket.on('subscribe-server', (serverId) => {
    console.log(`📡 Cliente ${socket.id} suscrito al servidor ${serverId}`);
    if (!serverSubscriptions.has(serverId)) {
      serverSubscriptions.set(serverId, new Set());
    }
    serverSubscriptions.get(serverId).add(socket.id);
  });

  socket.on('unsubscribe-server', (serverId) => {
    console.log(`🔕 Cliente ${socket.id} desuscrito del servidor ${serverId}`);
    if (serverSubscriptions.has(serverId)) {
      serverSubscriptions.get(serverId).delete(socket.id);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

// Rutas HTTP
app.get('/api/servers/:serverId/alerts', (req, res) => {
  const { serverId } = req.params;
  const { limit = 100, resueltas, tipo, recurso, desde, hasta } = req.query;

  console.log(`🔍 GET /api/servers/${serverId}/alerts con parámetros:`, { limit, resueltas, tipo, recurso, desde, hasta });

  let filtered = alerts.filter((alert) => alert.serverId === parseInt(serverId));
  
  console.log(`   📍 Alertas del servidor ${serverId}: ${filtered.length}`);

  // Filtrar por estado de resolución
  if (resueltas !== undefined) {
    const resolvido = resueltas === 'true' || resueltas === true;
    filtered = filtered.filter((alert) => alert.resuelto === resolvido);
    console.log(`   ✓ Después de filtrar por resueltas=${resolvido}: ${filtered.length} alertas`);
  }

  // Filtrar por tipo
  if (tipo) {
    filtered = filtered.filter((alert) => alert.tipo === tipo);
    console.log(`   ✓ Después de filtrar por tipo=${tipo}: ${filtered.length} alertas`);
  }

  // Filtrar por recurso
  if (recurso) {
    filtered = filtered.filter((alert) => alert.recurso === recurso);
    console.log(`   ✓ Después de filtrar por recurso=${recurso}: ${filtered.length} alertas`);
  }

  // Filtrar por rango de fechas
  if (desde) {
    const desdeDate = new Date(desde);
    filtered = filtered.filter((alert) => alert.timestamp >= desdeDate);
    console.log(`   ✓ Después de filtrar por desde=${desde}: ${filtered.length} alertas`);
  }

  if (hasta) {
    const hastaDate = new Date(hasta);
    filtered = filtered.filter((alert) => alert.timestamp <= hastaDate);
    console.log(`   ✓ Después de filtrar por hasta=${hasta}: ${filtered.length} alertas`);
  }

  // Ordenar por timestamp descendente (más recientes primero)
  filtered = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Aplicar límite
  const limitNum = Math.min(parseInt(limit) || 100, 1000);
  filtered = filtered.slice(0, limitNum);

  console.log(`📊 GET /api/servers/${serverId}/alerts - Respondiendo con ${filtered.length} alertas\n`);
  res.json(filtered);
});

app.get('/api/servers/:serverId/alerts/stats', (req, res) => {
  const { serverId } = req.params;
  const serverAlerts = alerts.filter((alert) => alert.serverId === parseInt(serverId));

  const stats = {
    total: serverAlerts.length,
    criticas: serverAlerts.filter((a) => a.tipo === 'CRITICAL').length,
    advertencias: serverAlerts.filter((a) => a.tipo === 'WARNING').length,
    informativas: serverAlerts.filter((a) => a.tipo === 'INFO').length,
    resueltas: serverAlerts.filter((a) => a.resuelto).length,
  };

  console.log(`📈 GET /api/servers/${serverId}/alerts/stats`);
  res.json(stats);
});

app.patch('/api/alerts/:alertId', (req, res) => {
  const { alertId } = req.params;
  const alert = alerts.find((a) => a.id === alertId);

  if (!alert) {
    return res.status(404).json({ error: 'Alerta no encontrada' });
  }

  const { resuelto, resueltoEn } = req.body;
  alert.resuelto = Boolean(resuelto);
  alert.resueltoEn = alert.resuelto ? (resueltoEn ? new Date(resueltoEn) : new Date()) : undefined;

  console.log(`✔️ PATCH /api/alerts/${alertId} - Alerta resuelta`);
  res.json(alert);
});

// Función para simular alertas en tiempo real
function broadcastSimulatedAlerts() {
  const tipo = alertTypes[Math.floor(Math.random() * alertTypes.length)];
  const recurso = alertResources[Math.floor(Math.random() * alertResources.length)];

  const alertByType = {
    CRITICAL: {
      valor: 92 + Math.floor(Math.random() * 8),
      umbral: 90,
      mensaje: `${recurso} por encima del umbral crítico`,
    },
    WARNING: {
      valor: 75 + Math.floor(Math.random() * 15),
      umbral: 80,
      mensaje: `${recurso} por encima del umbral de advertencia`,
    },
    INFO: {
      valor: 50 + Math.floor(Math.random() * 20),
      umbral: undefined,
      mensaje: `${recurso} sin incidencias relevantes`,
    },
  };

  const currentAlert = alertByType[tipo];

  const newAlert = {
    id: `${Date.now()}`,
    serverId: Math.floor(Math.random() * 3) + 1,
    tipo,
    recurso,
    mensaje: currentAlert.mensaje,
    valor: currentAlert.valor,
    umbral: currentAlert.umbral,
    timestamp: new Date(),
    resuelto: false,
  };

  alerts.push(newAlert);

  // Enviar a todos los clientes conectados
  io.emit('alert', newAlert);

  // Enviar a suscriptores específicos del servidor
  if (serverSubscriptions.has(newAlert.serverId)) {
    serverSubscriptions.get(newAlert.serverId).forEach((socketId) => {
      io.to(socketId).emit('alert', newAlert);
    });
  }

  console.log(`🚨 Alerta simulada emitida: ${newAlert.tipo} ${newAlert.recurso} - Servidor: ${newAlert.serverId}`);
}

// Iniciar simulación de alertas cada 10 segundos
setInterval(broadcastSimulatedAlerts, 10000);

// Rutas de prueba y debug
app.get('/health', (req, res) => {
  res.json({ status: '✅ Backend provisional activo' });
});

// Debug: Ver todas las alertas sin filtros
app.get('/debug/alerts', (req, res) => {
  console.log(`🐛 DEBUG - Total de alertas en la BD: ${alerts.length}`);
  res.json({
    total: alerts.length,
    alerts: alerts.map(a => ({
      id: a.id,
      serverId: a.serverId,
      tipo: a.tipo,
      recurso: a.recurso,
      valor: a.valor,
      umbral: a.umbral,
      resuelto: a.resuelto,
      resueltoEn: a.resueltoEn,
      timestamp: a.timestamp,
    }))
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║   🚀 BACKEND PROVISIONAL DE ALERTAS                   ║
║   Escuchando en: http://localhost:${PORT}            ║
║   WebSocket activo para alertas en tiempo real       ║
║   Simulador de alertas cada 10 segundos              ║
╚═══════════════════════════════════════════════════════╝
  `);
});
