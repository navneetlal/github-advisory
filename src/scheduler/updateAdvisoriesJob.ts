import { scheduleJob, RecurrenceRule } from 'node-schedule'
import { log4js } from '../logger';
import updateAdvisories from '../services/updateAdvisories';

const rule = new RecurrenceRule();
rule.hour = [ 6, 14, 22 ]
rule.tz = 'Asia/Kolkata'

scheduleJob(rule, async (fireDate) => {
    const logger = log4js.getLogger('Scheduler')
    logger.info(`Starting scheduled job for updateAdvisories (${fireDate.toDateString()})`)
    await updateAdvisories()
})