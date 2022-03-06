import { Glob } from 'glob'
import { Observable } from 'rxjs'

/**
 * 
 * @param {String} pattern Pattern to be matched
 * @param {Object} options All the options that can be passed to Minimatch
 * @returns {Observable<String>} Observable of advisory object
 */
const readAdvisoriesJson = (pattern: string, options: object = {}): Observable<string> => {
    return new Observable(observer => {
        const glob = new Glob(pattern, options)

        glob.on('match', (filename: string) => observer.next(filename))

        glob.on('end', _ => observer.complete())

        glob.on('error', err => observer.error(err))
    })
}

export default readAdvisoriesJson
