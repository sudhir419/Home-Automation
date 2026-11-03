import express from 'express';
import cors from 'cors';
import http from 'http';
import { config } from './config/index.js';
import { db } from './database/index.js';
import { startEmbeddedBroker } from './mqtt/broker.js';
import { mqttManager } from './mqtt/client.js';
import { wsHub } from './websocket/server.js';
import { scheduleService } from './services/scheduleService.js';
import { apiRouter } from './routes/api.js';
async function bootstrap() {
    console.log('\n===============================================================');
    console.log('   CENTRALIZED SMART HOME AUTOMATION BACKEND (ESP32-WROOM-32)  ');
    console.log('===============================================================\n');
    // 1. Initialize Database
    await db.initSchema();
    // 2. Start Embedded MQTT Broker (Port 1883)
    if (config.mqttEmbedded) {
        try {
            await startEmbeddedBroker();
        }
        catch (e) {
            console.warn('Continuing without embedded broker:', e.message);
        }
    }
    // 3. Connect Backend MQTT Client
    await mqttManager.init();
    // 4. Create Express & HTTP Server
    const app = express();
    app.use(cors({ origin: '*' }));
    app.use(express.json());
    // Mount API router
    app.use('/api', apiRouter);
    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.json({
            status: 'HEALTHY',
            controller: 'esp32-main-01',
            wsClients: wsHub.getConnectedCount(),
            timestamp: new Date().toISOString(),
        });
    });
    const server = http.createServer(app);
    // 5. Attach WebSocket Hub to HTTP server
    wsHub.init(server);
    // 6. Initialize Background Scheduler
    scheduleService.init();
    // 7. Start Listening
    server.listen(config.port, config.host, () => {
        console.log(`\n🚀 Backend REST API running at: http://${config.host}:${config.port}/api`);
        console.log(`🌐 WebSocket Server live at:   ws://${config.host}:${config.port}/ws`);
        console.log(`📡 MQTT Broker running at:     tcp://0.0.0.0:${config.mqttBrokerPort}`);
        console.log('===============================================================\n');
    });
}
bootstrap().catch((err) => {
    console.error('❌ Fatal error bootstrapping backend:', err);
    process.exit(1);
});
