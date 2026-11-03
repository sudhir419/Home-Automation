import { WebSocketServer, WebSocket } from 'ws';
export class WebSocketHub {
    wss = null;
    clients = new Set();
    init(server) {
        this.wss = new WebSocketServer({ server, path: '/ws' });
        this.wss.on('connection', (ws) => {
            this.clients.add(ws);
            console.log(`🌐 Frontend WebSocket Client Connected (Total: ${this.clients.size})`);
            // Send initial welcome/status event
            ws.send(JSON.stringify({
                type: 'SYSTEM_STATUS',
                status: 'CONNECTED',
                timestamp: new Date().toISOString(),
            }));
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    console.log('📩 Received WebSocket message from client:', data);
                }
                catch {
                    // ignore malformed ping
                }
            });
            ws.on('close', () => {
                this.clients.delete(ws);
                console.log(`🌐 Frontend WebSocket Client Disconnected (Remaining: ${this.clients.size})`);
            });
            ws.on('error', (err) => {
                console.error('WebSocket Client Error:', err);
            });
        });
        console.log('✅ WebSocket Server attached to HTTP server on /ws');
    }
    broadcast(event) {
        const payload = JSON.stringify({
            ...event,
            timestamp: event.timestamp || new Date().toISOString(),
        });
        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        }
    }
    getConnectedCount() {
        return this.clients.size;
    }
}
export const wsHub = new WebSocketHub();
