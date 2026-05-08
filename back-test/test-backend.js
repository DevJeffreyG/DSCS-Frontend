/**
 * Script de prueba para el backend de alertas
 * Ejecutar: node test-backend.js
 */

const http = require('http');
const { io } = require('socket.io-client');

const BACKEND_URL = 'http://localhost:3000';

console.log(`\n🧪 INICIANDO PRUEBAS DEL BACKEND\n`);

// Prueba 1: Verificar conexión
console.log('1️⃣  Probando conexión HTTP...');
http.get(`${BACKEND_URL}/health`, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log(`   ✅ Health check: ${data}\n`);
    testAlertsHTTP();
  });
}).on('error', (err) => {
  console.error(`   ❌ Error de conexión: ${err.message}`);
  console.error('   ¿Backend ejecutándose en puerto 3000?\n');
  process.exit(1);
});

// Prueba 2: Obtener alertas por HTTP
function testAlertsHTTP() {
  console.log('2️⃣  Obteniendo todas las alertas (sin filtros)...');
  http.get(`${BACKEND_URL}/debug/alerts`, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      const alerts = JSON.parse(data);
      console.log(`   ✅ Total de alertas: ${alerts.total}`);
      alerts.alerts.forEach((a) => {
        console.log(`      - ID: ${a.id}, Servidor: ${a.serverId}, Tipo: ${a.tipo}, Resuelto: ${a.resuelto}`);
      });
      console.log();
      testActiveAlertsFilter();
    });
  });
}

// Prueba 3: Filtrar alertas activas del servidor 1
function testActiveAlertsFilter() {
  console.log('3️⃣  Obteniendo alertas ACTIVAS del servidor 1 (resueltas=false)...');
  http.get(`${BACKEND_URL}/api/servers/1/alerts?resueltas=false`, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      const alerts = JSON.parse(data);
      console.log(`   ✅ Alertas sin resolver: ${alerts.length}`);
      alerts.forEach((a) => {
        console.log(`      - ID: ${a.id}, Tipo: ${a.tipo}, Resuelto: ${a.resuelto}`);
      });
      console.log();
      testStats();
    });
  });
}

// Prueba 4: Obtener estadísticas
function testStats() {
  console.log('4️⃣  Obteniendo estadísticas del servidor 1...');
  http.get(`${BACKEND_URL}/api/servers/1/alerts/stats`, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      const stats = JSON.parse(data);
      console.log(`   ✅ Estadísticas:`, stats);
      console.log();
      testWebSocket();
    });
  });
}

// Prueba 5: WebSocket
function testWebSocket() {
  console.log('5️⃣  Conectando por WebSocket...');
  const socket = io(BACKEND_URL);

  socket.on('connect', () => {
    console.log(`   ✅ Conectado al WebSocket`);
    console.log(`   📡 Suscribiendo al servidor 1...`);
    socket.emit('subscribe-server', 1);

    console.log(`   ⏱️  Esperando alertas en tiempo real por 15 segundos...\n`);

    let alertCount = 0;
    const timeout = setTimeout(() => {
      console.log(`\n   ✅ Prueba completada. Recibidas ${alertCount} alertas por WebSocket.`);
      socket.disconnect();
      console.log('\n✨ Todas las pruebas completadas\n');
      process.exit(0);
    }, 15000);

    socket.on('alert', (alert) => {
      alertCount++;
      console.log(`   🚨 ALERTA #${alertCount}: ${alert.tipo} - Servidor ${alert.serverId}`);
    });

    socket.on('disconnect', () => {
      clearTimeout(timeout);
      console.log('\n   ❌ Desconectado del WebSocket');
      process.exit(0);
    });

    socket.on('error', (error) => {
      clearTimeout(timeout);
      console.log(`\n   ❌ Error WebSocket: ${error}`);
      process.exit(1);
    });
  });

  socket.on('connect_error', (error) => {
    console.log(`   ❌ Error de conexión WebSocket: ${error.message}`);
    process.exit(1);
  });
}
