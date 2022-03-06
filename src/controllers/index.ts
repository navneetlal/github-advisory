import { Router } from 'express'
import updateAdvisories from '../services/updateAdvisories'

const router = Router()

router.get('/', async (req, res) => {
    const {  } = req.params
    await updateAdvisories()
    res.status(200).send('All is well!')
})

export default router