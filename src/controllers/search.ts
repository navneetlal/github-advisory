import { Router } from 'express'

import mongoDb from '../database/mongo'
import { log4js } from '../logger'

const router = Router()

router.get('/', async (req, res) => {
    const logger = log4js.getLogger('SearchController')

    const {
        package_name,
        severity,
        ecosystem,
        ghsa_id,
        cve_id,
        per_page = 10,
        page = 1
    } = req.query

    const collection = mongoDb.collection('advisories')

    const advisories = await collection.find({
        ...package_name && ({ 'affected.package.name': package_name }),
        ...ecosystem && ({ 'affected.package.ecosystem': ecosystem }),
        ...severity && ({ 'database_specific.severity': severity }),
        ...ghsa_id && ({ 'id': ghsa_id }),
        ...cve_id && ({ 'aliases': cve_id })
    }, {
        skip: (+page - 1) * +per_page,
        limit: +per_page
    }).toArray()

    return res.status(200).send(advisories)
})

export default router