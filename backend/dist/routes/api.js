import { Router } from 'express';
import { deviceService } from '../services/deviceService.js';
import { energyService } from '../services/energyService.js';
import { scheduleService } from '../services/scheduleService.js';
import { activityService } from '../services/activityService.js';
import { db } from '../database/index.js';
import { config } from '../config/index.js';
import jwt from 'jsonwebtoken';
export const apiRouter = Router();
// ==========================================
// 1. AUTHENTICATION
// ==========================================
apiRouter.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (username === config.adminUsername && password === config.adminPassword) {
        const token = jwt.sign({ username, role: 'admin' }, config.jwtSecret, { expiresIn: '7d' });
        return res.json({
            token,
            user: { id: 'admin-01', username: 'admin', role: 'admin' },
        });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
});
apiRouter.get('/auth/me', (req, res) => {
    return res.json({ id: 'admin-01', username: 'admin', role: 'admin' });
});
// ==========================================
// 2. CONTROLLER (Single ESP32-WROOM-32)
// ==========================================
apiRouter.get('/controllers', async (_req, res) => {
    try {
        const controllers = await db.all('SELECT * FROM controllers');
        res.json(controllers);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
apiRouter.get('/controllers/:id/status', async (req, res) => {
    try {
        const controller = await db.get('SELECT * FROM controllers WHERE id = ?', [req.params.id]);
        if (!controller)
            return res.status(404).json({ error: 'Controller not found' });
        res.json(controller);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ==========================================
// 3. ROOMS & DEVICES
// ==========================================
apiRouter.get('/rooms', async (_req, res) => {
    try {
        const rooms = await deviceService.getAllRooms();
        res.json(rooms);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
apiRouter.get('/devices', async (_req, res) => {
    try {
        const devices = await deviceService.getAllDevices();
        res.json(devices);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
apiRouter.get('/devices/:id', async (req, res) => {
    try {
        const device = await deviceService.getDeviceById(req.params.id);
        if (!device)
            return res.status(404).json({ error: 'Device not found' });
        res.json(device);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
apiRouter.post('/devices/:id/control', async (req, res) => {
    try {
        const { action, demoMode } = req.body;
        if (!action || !['on', 'off'].includes(action.toLowerCase())) {
            return res.status(400).json({ error: 'Action must be "on" or "off"' });
        }
        const result = await deviceService.controlDevice(req.params.id, action.toLowerCase(), !!demoMode);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ==========================================
// 4. ELECTRICITY & ENERGY ANALYTICS
// ==========================================
apiRouter.get('/electricity/summary', async (req, res) => {
    try {
        const filter = req.query.filter || 'today';
        const summary = await energyService.getEnergySummary(filter);
        res.json(summary);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
apiRouter.get('/electricity/device/:id', async (req, res) => {
    try {
        const data = await energyService.getDeviceEnergy(req.params.id);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ==========================================
// 5. SCHEDULES
// ==========================================
apiRouter.get('/schedules', async (_req, res) => {
    try {
        const schedules = await scheduleService.getAllSchedules();
        res.json(schedules);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
apiRouter.post('/schedules', async (req, res) => {
    try {
        const schedule = await scheduleService.createSchedule(req.body);
        res.status(201).json(schedule);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
apiRouter.put('/schedules/:id/toggle', async (req, res) => {
    try {
        const result = await scheduleService.toggleSchedule(req.params.id);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
apiRouter.delete('/schedules/:id', async (req, res) => {
    try {
        const result = await scheduleService.deleteSchedule(req.params.id);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ==========================================
// 6. ACTIVITY LOGS
// ==========================================
apiRouter.get('/activity', async (_req, res) => {
    try {
        const activities = await activityService.getRecentActivity(100);
        res.json(activities);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
apiRouter.delete('/activity', async (_req, res) => {
    try {
        const result = await activityService.clearAll();
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
