import { mkdir } from 'node:fs/promises'
import path from 'node:path'

import Git from 'simple-git'

import saveAdvisoriesJson from './saveAdvisoriesJson'
import mongoDb from '../database/mongo'
import { log4js } from '../logger'

import type { SimpleGit, SimpleGitOptions } from 'simple-git'

async function updateAdvisories() {
    const logger = log4js.getLogger('updateAdvisories')
    //TODO: change directory to tmp or /opt directory
    const dir_name = path.join(process.cwd(), '../advisory')

    try {
        await mkdir(dir_name)
    } catch (error: any) {
        if (error.code === 'EEXIST') {
            logger.info(error.message)
        } else throw error
    }

    const remoteRepo = 'https://github.com/github/advisory-database.git'
    const remote = 'origin'
    const branch = 'main'

    const options: Partial<SimpleGitOptions> = {
        baseDir: dir_name,
        binary: 'git',
        maxConcurrentProcesses: 10
    }
    const gitPullConfig = [
        '--depth=2',
        '--no-tags',
        '--rebase',
        '--no-commit',
        '--no-edit',
        '--allow-unrelated-histories'
    ]

    const git: SimpleGit = Git(options)

    await mongoDb.connect()

    git.checkIsRepo()
        .then(isRepo =>
            !isRepo
                ? git.init().then(() => git.addRemote(remote, remoteRepo))
                : null
        )
        .then(() => git.pull(remote, branch, gitPullConfig))
        .then(() => saveAdvisoriesJson(path.join(dir_name, 'advisories/github-reviewed/**/*.json')).subscribe({
            complete: () => logger.info('Adding advisories complete')
        }))
}

export default updateAdvisories


/**
 * 
 * TODO: Only refresh database for the changes pushed in github repository.
 * concat keys of deletions and insertions > unique > saveAdvisoriesJson.ts
 * 
 * ! For first iteration deletions and insertions will be empty array
 * 
 * * Sample Response from git pull origin --depth=2
 * 
 * ```json
 * {
 *    "remoteMessages": {
 *        "all": []
 *    },
 *    "created": [],
 *    "deleted": [
 *        "routes/posts.js"
 *    ],
 *    "files": [
 *        "routes/posts.js"
 *    ],
 *    "deletions": {
 *        "routes/posts.js": 1
 *    },
 *    "insertions": {
 *        "routes/users.js": 1,
 *        "routes/posts.js": 1
 *    },
 *    "summary": {
 *        "changes": 0,
 *        "deletions": 0,
 *        "insertions": 0
 *    }
 * }
 * ```
 *
 */
