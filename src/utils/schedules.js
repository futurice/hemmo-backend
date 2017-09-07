import schedule from 'node-schedule';
import { notifyUnreviewed } from './email';

export default function initSchedules() {
  // schedule evey Monday morning a notification email about un-reviewed sessions
  //schedule.scheduleJob({ hour: 5, minute: 0, dayOfWeek: 1 }, notifyUnreviewed);
}
