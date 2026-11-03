import { db } from '../database/index.js';

export class ActivityService {
  public async getRecentActivity(limit: number = 50) {
    return await db.all(
      'SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
  }

  public async logEvent(category: string, level: string, title: string, detail: string | null = null, isHardwareConfirmed: boolean = false) {
    const id = `act-${Date.now()}`;
    await db.run(
      'INSERT INTO activity_logs (id, category, level, title, detail, is_hardware_confirmed) VALUES (?, ?, ?, ?, ?, ?)',
      [id, category, level, title, detail, isHardwareConfirmed ? 1 : 0]
    );
    return { id, category, level, title, detail, isHardwareConfirmed, timestamp: new Date().toISOString() };
  }

  public async clearAll() {
    await db.run('DELETE FROM activity_logs');
    return { success: true };
  }
}

export const activityService = new ActivityService();
