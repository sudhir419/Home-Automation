import { db } from '../database/index.js';
export class ActivityService {
    async getRecentActivity(limit = 50) {
        return await db.all('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ?', [limit]);
    }
    async logEvent(category, level, title, detail = null, isHardwareConfirmed = false) {
        const id = `act-${Date.now()}`;
        await db.run('INSERT INTO activity_logs (id, category, level, title, detail, is_hardware_confirmed) VALUES (?, ?, ?, ?, ?, ?)', [id, category, level, title, detail, isHardwareConfirmed ? 1 : 0]);
        return { id, category, level, title, detail, isHardwareConfirmed, timestamp: new Date().toISOString() };
    }
    async clearAll() {
        await db.run('DELETE FROM activity_logs');
        return { success: true };
    }
}
export const activityService = new ActivityService();
