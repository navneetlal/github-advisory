import { Router } from 'express'
import saveAdvisoriesJson from '../services/saveAdvisoriesJson'

const router = Router()

router.get('/', (req, res) => {
    const {  } = req.params
    saveAdvisoriesJson('advisories/github-reviewed/**/*.json')
        .subscribe()
    res.status(200).send('All is well!')
})

export default router