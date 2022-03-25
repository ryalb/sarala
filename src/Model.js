import {
    isUndefined,
    forOwn,
    isArray,
    clone,
    cloneDeep,
    map,
    forEach,
    isString
} from 'lodash'
import moment from 'moment'
import { Formatter } from 'sarala-json-api-data-formatter'
import QueryBuilder from './QueryBuilder'

const formatter = new Formatter()

export default class Model {
    constructor () {
        this.queryBuilder = new QueryBuilder()
        this.selfValidate()
        this.type = this.resourceName()
        this.links = {}
    }

    // override

    fields () {
        return []
    }

    dates () {
        return []
    }

    relationships () {
        return {}
    }

    computed () {
        return {}
    }

    resourceName () {
        return null
    }

    async request (config) {
        // to be implemented in base model
    }

    // fetch requests

    async makeFetchRequest (url) {
        const requestConfig = {
            method: 'GET',
            url,
            headers: {
                'Accept': 'application/vnd.api+json'
            }
        }
        this.queryBuilder.reset()
        let response = await this.request(requestConfig)

        return this.respond(response.data)
    }

    get () {
        return this.makeFetchRequest(`${this.resourceUrl()}${this.queryBuilder.getQuery()}`)
    }

    find (id) {
        return this.makeFetchRequest(`${this.resourceUrl()}${id}${this.queryBuilder.getQuery()}`)
    }

    all () {
        return this.get()
    }

    paginate (perPage = 10, page = 1) {
        this.queryBuilder.paginate(perPage, page)

        return this.makeFetchRequest(`${this.resourceUrl()}${this.queryBuilder.getQuery()}`)
    }

    async fetchRelation (relationship, links = {}) {
        if (isUndefined(links.self)) {
            links.self = this.getRelationshipUrl(relationship)
        }

        this[relationship] = await this.relationships()[relationship].makeFetchRequest(links.self)

        return this[relationship]
    }

    // persist requests

    async makePersistRequest (config) {
        config.headers = {
            'Content-Type': 'application/vnd.api+json',
            'Accept': 'application/vnd.api+json'
        }

        let response = await this.request(config)

        if (response.status === 204) {
            return this.respond(this.clone())
        }

        return this.respond(response.data)
    }

    save () {
        if (this.hasOwnProperty('id')) {
            return this.update()
        }

        return this.create()
    }

    create () {
        return this.makePersistRequest({
            url: this.resourceUrl(),
            method: 'POST',
            data: this.serialize(this.data())
        })
    }

    update () {
        return this.makePersistRequest({
            url: this.getSelfUrl(),
            method: 'PATCH',
            data: this.serialize(this.data())
        })
    }

    delete () {
        return this.makePersistRequest({
            url: this.getSelfUrl(),
            method: 'DELETE'
        })
    }

    attach (model, data = null) {
        let config = {
            url: `${this.getSelfUrl()}/${model.type}/${model.id}`,
            method: 'POST'
        }

        if (data) {
            config.data = data
        }

        return this.makePersistRequest(config)
    }

    detach (model) {
        return this.makePersistRequest({
            url: `${this.getSelfUrl()}/${model.type}/${model.id}`,
            method: 'DELETE'
        })
    }

    sync (relationship) {
        const data = this.serialize(this.data())

        return this.makePersistRequest({
            url: `${this.getSelfUrl()}/${relationship}`,
            method: 'PATCH',
            data: data.data.relationships[relationship]
        })
    }

    // modify query string

    with (resourceName) {
        this.queryBuilder.include(resourceName)

        return this
    }

    orderBy (column, direction = 'asc') {
        this.queryBuilder.orderBy(column, direction)

        return this
    }

    orderByDesc (column) {
        return this.orderBy(column, 'desc')
    }

    where (key, value = null, group = null) {
        this.queryBuilder.where(key, value, group)

        return this
    }

    filter (filter, group = null) {
        return this.where(filter, null, group)
    }

    limit (limit) {
        return this.where('limit', limit)
    }

    offset (offset) {
        return this.where('offset', offset)
    }

    select (fields) {
        if (isArray(fields)) {
            const selectFields = clone(fields)
            fields = {}
            fields[this.resourceName()] = selectFields
        }

        this.queryBuilder.select(fields)

        return this
    }

    // build model

    respond (response) {
        let data = this.deserialize(response)

        if (this.isCollection(data)) {
            return this.resolveCollection(data)
        }

        return this.resolveItem(data)
    }

    resolveCollection (data) {
        let resolved = {}

        if (data.hasOwnProperty('links')) {
            resolved.links = data.links
        }

        if (data.hasOwnProperty('meta')) {
            resolved.meta = data.meta
        }

        resolved.data = this.newCollection(map(data.data, item => {
            return this.resolveItem(item)
        }))

        return resolved
    }

    resolveItem (data) {
        return this.hydrate(data)
    }

    hydrate (data) {
        let model = this.clone()

        model.id = data.id
        model.type = data.type

        if (data.hasOwnProperty('relationships')) {
            model.relationshipNames = data.relationships
        }

        if (data.hasOwnProperty('links')) {
            model.links = data.links
        }

        forEach(model.fields(), field => {
            model[field] = data[field]
        })

        forOwn(model.dates(), (format, field) => {
            model[field] = moment(data[field])
        })

        forEach(data.relationships, relationship => {
            let relation = model.relationships()[relationship]

            if (isUndefined(relation)) {
                throw new Error(`Sarale: Relationship ${relationship} has not been defined in ${model.constructor.name} model.`)
            }

            const fetch = () => {
                return model.fetchRelation(relationship, data[relationship].links)
            }

            if (this.isCollection(data[relationship])) {
                model[relationship] = {
                    ...relation.resolveCollection(data[relationship]),
                    fetch
                }
            } else if (data[relationship].data) {
                model[relationship] = relation.resolveItem(data[relationship].data)
                model[relationship].fetch = fetch
            }
        })

        // forOwn(model.relationships(), (relatedModel, relationshipName) => {
        //     if (isUndefined(model[relationshipName])) {
        //         model[relationshipName] = {
        //             fetch: () => {
        //                 return model.fetchRelation(relationshipName)
        //             }
        //         }
        //     }
        // })

        forOwn(model.computed(), (computation, key) => {
            model[key] = computation(model)
        })

        return model
    }

    // extract data from model

    data () {
        let data = {}

        data.type = this.type

        if (this.hasOwnProperty('id')) {
            data.id = this.id
        }

        if (this.hasOwnProperty('relationshipNames')) {
            data.relationships = this.relationshipNames
        }

        forEach(this.fields(), field => {
            if (!isUndefined(this[field])) {
                data[field] = this[field]
            }
        })

        forOwn(this.dates(), (format, field) => {
            if (!isUndefined(this[field])) {
                data[field] = moment(this[field]).format(format)
            }
        })

        forEach(this.relationships(), (model, relationship) => {
            if (!isUndefined(this[relationship]) && !isUndefined(this[relationship].data)) {
                if (isArray(this[relationship].data)) {
                    data[relationship] = {
                        data_collection: true,
                        data: map(this[relationship].data, relation => {
                            return relation.data()
                        })
                    }
                } else {
                    data[relationship] = {
                        data: this[relationship].data()
                    }
                }
            }
        })

        return data
    }

    // helpers

    resourceUrl () {
        return `${this.baseUrl()}/${this.resourceName()}/`
    }

    getSelfUrl () {
        if (this.links.hasOwnProperty('self')) {
            return this.links.self
        }

        if (!this.hasOwnProperty('id')) {
            throw new Error(`Sarala: Unidentifiable resource exception. ${this.constructor.name} id property is undefined.`)
        }

        this.links.self = `${this.resourceUrl()}${this.id}`

        return this.links.self
    }

    getRelationshipUrl (relationship) {
        return `${this.getSelfUrl()}/relationships/${relationship}`
    }

    isCollection (data) {
        return data.hasOwnProperty('data_collection') && data.data_collection === true && isArray(data.data)
    }

    deserialize (data) {
        return formatter.deserialize(data)
    }

    serialize (data) {
        return formatter.serialize(data)
    }

    selfValidate () {
        const name = this.resourceName()

        if (name === null || !isString(name) || name.length === 0) {
            throw new Error(`Sarale: Resource name not defined in ${this.constructor.name} model. Implement resourceName method in the ${this.constructor.name} model to resolve this error.`)
        }
    }

    clone () {
        return cloneDeep(this)
    }

    newCollection (data) {
        return data
    }
}
