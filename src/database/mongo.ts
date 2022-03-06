import { MongoClient, MongoServerError } from 'mongodb'
import { log4js } from '../logger'

import type { Collection, Document, MongoClientOptions } from 'mongodb'
import type { Logger } from 'log4js'

class Database {
    private readonly _url: string = 'mongodb://localhost:27017/github_advisories'
    private readonly _options: MongoClientOptions
    private readonly _client: MongoClient
    private readonly _db_name: string | undefined = undefined
    private readonly _logger: Logger

    /**
     * 
     * @param {MongoClientOptions} options Describes all possible URI query options for the mongo client
     * @see - https://docs.mongodb.com/manual/reference/connection-string
     */
    constructor(options: MongoClientOptions, logger: Logger) {
        this._logger = logger
        this._options = options
        this._client = new MongoClient(this._url, this._options);
    }

    /**
     * Connect to MongoDB
     * @returns {Promise<MongoClient>} MongoClient
     */
    public async connect(): Promise<MongoClient> {
        return this._client.connect()
    }

    public async initialize() {
        try {
            await this._client.db(this._db_name).createCollection('advisories')
            this._logger.info('Created collection - advisories')
        } catch (error) {
            if (error instanceof MongoServerError && error.codeName === 'NamespaceExists') {
                this._logger.warn(`${error.codeName}: ${error.message}`)
            } else throw error;
        }
        try {
            const advisories = this.collection('advisories')
            await advisories.createIndexes([
                {
                    name: 'GHSA_ID',
                    key: { id: 1 },
                    unique: true
                },
                {
                    name: 'aliases',
                    key: { aliases: 1 }
                },
                {
                    name: 'package_name_ecosystem_severity',
                    key: {
                        'affected.package.name': 1,
                        'affected.package.ecosystem': 1,
                        'database_specific.severity': 1
                    }
                }
            ])
            this._logger.info('Created indexes for collection - advisories')
        } catch (error) {
            if (error instanceof MongoServerError) {
                this._logger.error(`${error.name} - ${error.codeName}: ${error.message}`)
            } else throw error
        }
    }

    /**
     * Returns a reference to a MongoDB Collection. If it does not exist it will be created implicitly.
     * @param collName The collection name we wish to access.
     * @returns 
     */
    public collection(collName: string): Collection<Document> {
        return this._client.db(this._db_name).collection(collName)
    }
}

export default new Database({
    maxPoolSize: 100,
    minPoolSize: 5
}, log4js.getLogger('mongo'))