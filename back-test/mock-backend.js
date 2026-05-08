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

// Base de datos simulada
const alerts = [
  {
    id: '1',
    serverId: 1,
    tipo: 'CPU',
    recurso: 'CPU Usage',
    nivel: 'critical',
    mensaje: 'CPU usage exceeds 90%',
    timestamp: new Date(Date.now() - 5 * 60000), // 5 minutos atrás
    resuelto: false,
  },
  {
    id: '2',
    serverId: 1,
    tipo: 'Memory',
    recurso: 'Memory Usage',
    nivel: 'warning',
    mensaje: 'Memory usage exceeds 80%',
    timestamp: new Date(Date.now() - 10 * 60000), // 10 minutos atrás
    resuelto: false,
  },
  {
    id: '3',
    serverId: 2,
    tipo: 'Disk',
    recurso: 'Disk Space',
    nivel: 'critical',
    mensaje: 'Disk space critically low',
    timestamp: new Date(Date.now() - 15 * 60000), // 15 minutos atrás
    resuelto: false,
  },
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
    resueltas: serverAlerts.filter((a) => a.resuelto).length,
    sin_resolver: serverAlerts.filter((a) => !a.resuelto).length,
    critical: serverAlerts.filter((a) => a.nivel === 'critical').length,
    warning: serverAlerts.filter((a) => a.nivel === 'warning').length,
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

  alert.resuelto = req.body.resuelto || false;
  alert.resueltoEn = req.body.resueltoEn ? new Date(req.body.resueltoEn) : undefined;

  console.log(`✔️ PATCH /api/alerts/${alertId} - Alerta resuelta`);
  res.json({ success: true });
});

// Función para simular alertas en tiempo real
function broadcastSimulatedAlerts() {
  const tipos = ['CPU', 'Memory', 'Disk', 'Network'];
  const niveles = ['warning', 'critical'];
  const recursos = ['CPU Usage', 'Memory Usage', 'Disk Space', 'Network Latency'];

  const newAlert = {
    id: `${Date.now()}`,
    serverId: Math.floor(Math.random() * 3) + 1,
    tipo: tipos[Math.floor(Math.random() * tipos.length)],
    recurso: recursos[Math.floor(Math.random() * recursos.length)],
    nivel: niveles[Math.floor(Math.random() * niveles.length)],
    mensaje: 'Alerta simulada desde backend provisional',
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

  console.log(`🚨 Alerta simulada emitida: ${newAlert.tipo} - Servidor: ${newAlert.serverId}`);
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
      resuelto: a.resuelto,
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
