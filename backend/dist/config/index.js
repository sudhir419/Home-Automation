import dotenv from 'dotenv';
dotenv.config();
export const config = {
    port: parseInt(process.env.PORT || '5001', 10),
    host: process.env.HOST || '0.0.0.0',
    wsPort: parseInt(process.env.WS_PORT || '5001', 10),
    mqttBrokerPort: parseInt(process.env.MQTT_BROKER_PORT || '1883', 10),
    mqttEmbedded: process.env.MQTT_EMBEDDED === 'true',
    mqttBrokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://127.0.0.1:1883',
    dbPath: process.env.DB_PATH || './home_automation.db',
    jwtSecret: process.env.JWT_SECRET || 'super_secret_home_automation_jwt_key_2026',
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin',
    defaultTariffRate: parseFloat(process.env.DEFAULT_TARIFF_RATE || '8.0'),
    currency: process.env.CURRENCY || 'INR',
};
