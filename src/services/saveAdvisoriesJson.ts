import { readFile } from "node:fs/promises";
import { of } from "rxjs";
import { bufferCount, map, mergeMap, tap } from "rxjs/operators";

import readAdvisoriesJson from "./readAdvisoriesJson";
import mongoDb from '../database/mongo'

import { log4js } from '../logger'

/**
 * 
 * @param {String} pattern Pattern to be matched
 * @returns 
 */
const saveAdvisoriesJson = (pattern: string) => {
    const logger = log4js.getLogger('saveAdvisoriesJson')
    const collection = mongoDb.collection('advisories')
    return readAdvisoriesJson(pattern)
        .pipe(
            mergeMap((filename: string) => readFile(filename, { encoding: 'utf8' })),
            mergeMap(fileString => of(JSON.parse(fileString))),
            map(advisory => ({
                updateOne: {
                    filter: { id: advisory.id },
                    update: { $set: advisory },
                    upsert: true,
                }
            })),
            bufferCount(5000),
            tap(_ => logger.info(`Adding advisories documents to database`)),
            mergeMap(advisories => collection.bulkWrite(advisories)),
            tap(result => logger.info(`+${result.nModified} documents updated`)),
            tap(result => logger.info(`+${result.nUpserted} documents inserted`))
        )
}

export default saveAdvisoriesJson