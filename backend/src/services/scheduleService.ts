import cron from 'node-cron';
import { db } from '../database/index.js';
import { deviceService } from './deviceService.js';
import { wsHub } from '../websocket/server.js';

export class ScheduleService {
  private cronJob: cron.ScheduledTask | null = null;

  public init(): void {
    console.log('⏰ Initializing Schedule Engine (evaluates every minute)...');
    this.cronJob = cron.schedule('* * * * *', async () => {
      await this.evaluateSchedules();
    });
  }

  public async evaluateSchedules(): Promise<void> {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const currentDay = now.getDay(); // 0 = Sun ... 6 = Sat

    try {
      const activeSchedules = await db.all(
        'SELECT * FROM schedules WHERE enabled = 1 AND time = ?',
        [currentTimeStr]
      );

      for (const sched of activeSchedules) {
        let days: number[] = [0, 1, 2, 3, 4, 5, 6];
        try {
          days = JSON.parse(sched.days_json);
        } catch {
          // ignore
        }

        if (!days.includes(currentDay)) continue;

        console.log(`⏰ Executing Schedule: ${sched.name} (${sched.action.toUpperCase()})`);

        let deviceIds: string[] = [];
        try {
          deviceIds = JSON.parse(sched.device_ids_json);
        } catch {
          // ignore
        }

        let successCount = 0;
        for (const devId of deviceIds) {
          try {
            await deviceService.controlDevice(devId, sched.action as 'on' | 'off');
            successCount++;
          } catch (err: any) {
            console.error(`Error executing schedule on device ${devId}:`, err.message);
          }
        }

        // Record execution history
        await db.run(
          'INSERT INTO schedule_history (id, schedule_id, status, device_count, result_summary) VALUES (?, ?, ?, ?, ?)',
          [`sh-${Date.now()}`, sched.id, successCount > 0 ? 'SUCCESS' : 'FAILED', deviceIds.length, `${successCount}/${deviceIds.length} devices triggered`]
        );

        // Record activity log
        await db.run(
          'INSERT INTO activity_logs (id, category, level, title, detail, is_hardware_confirmed) VALUES (?, ?, ?, ?, ?, ?)',
          [`act-${Date.now()}`, 'schedule', 'success', `Schedule Triggered: ${sched.name}`, `${successCount} device(s) actuated via ESP32`, 1]
        );

        wsHub.broadcast({
          type: 'SCHEDULE_TRIGGERED',
          scheduleId: sched.id,
          name: sched.name,
          devicesTriggered: successCount,
        });
      }
    } catch (err: any) {
      console.error('Error in schedule evaluation:', err);
    }
  }

  public async getAllSchedules() {
    const rows = await db.all('SELECT * FROM schedules ORDER BY time ASC');
    return rows.map((r) => ({
      ...r,
      deviceIds: JSON.parse(r.device_ids_json || '[]'),
      days: JSON.parse(r.days_json || '[]'),
      enabled: r.enabled === 1,
    }));
  }

  public async createSchedule(data: {
    name: string;
    deviceIds: string[];
    action: string;
    time: string;
    repeat: string;
    days: number[];
  }) {
    const id = `sched-${Date.now()}`;
    await db.run(
      `INSERT INTO schedules (id, name, device_ids_json, action, time, repeat, days_json, enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, data.name, JSON.stringify(data.deviceIds), data.action, data.time, data.repeat, JSON.stringify(data.days)]
    );
    return { id, ...data, enabled: true };
  }

  public async toggleSchedule(id: string) {
    const sched = await db.get('SELECT enabled FROM schedules WHERE id = ?', [id]);
    if (!sched) throw new Error('Schedule not found');
    const newState = sched.enabled === 1 ? 0 : 1;
    await db.run('UPDATE schedules SET enabled = ? WHERE id = ?', [newState, id]);
    return { id, enabled: newState === 1 };
  }

  public async deleteSchedule(id: string) {
    await db.run('DELETE FROM schedules WHERE id = ?', [id]);
    return { success: true, id };
  }
}

export const scheduleService = new ScheduleService();
