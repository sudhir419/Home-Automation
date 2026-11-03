import Aedes from 'aedes';
import net from 'net';
import { config } from '../config/index.js';
export function startEmbeddedBroker() {
    return new Promise((resolve, reject) => {
        const aedesInstance = Aedes();
        const server = net.createServer(aedesInstance.handle);
        server.listen(config.mqttBrokerPort, '0.0.0.0', () => {
            console.log(`✅ Embedded Aedes MQTT Broker listening on port: ${config.mqttBrokerPort}`);
            resolve(server);
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.warn(`⚠️ Port ${config.mqttBrokerPort} is already in use (external Mosquitto or broker running). Continuing with client connection...`);
                resolve(server);
            }
            else {
                console.error('❌ MQTT Broker error:', err);
                reject(err);
            }
        });
        aedesInstance.on('client', (client) => {
            console.log(`🔌 MQTT Client Connected: ${client.id}`);
        });
        aedesInstance.on('clientDisconnect', (client) => {
            console.log(`🔌 MQTT Client Disconnected: ${client.id}`);
        });
    });
}
