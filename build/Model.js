'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _lodash = require('lodash');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _saralaJsonApiDataFormatter = require('sarala-json-api-data-formatter');

var _QueryBuilder = require('./QueryBuilder');

var _QueryBuilder2 = _interopRequireDefault(_QueryBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var formatter = new _saralaJsonApiDataFormatter.Formatter();

var Model = function () {
    function Model() {
        (0, _classCallCheck3.default)(this, Model);

        this.queryBuilder = new _QueryBuilder2.default();
        this.selfValidate();
        this.type = this.resourceName();
        this.links = {};
    }

    // override

    (0, _createClass3.default)(Model, [{
        key: 'fields',
        value: function fields() {
            return [];
        }
    }, {
        key: 'dates',
        value: function dates() {
            return [];
        }
    }, {
        key: 'relationships',
        value: function relationships() {
            return {};
        }
    }, {
        key: 'computed',
        value: function computed() {
            return {};
        }
    }, {
        key: 'resourceName',
        value: function resourceName() {
            return null;
        }
    }, {
        key: 'request',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(config) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function request(_x) {
                return _ref.apply(this, arguments);
            }

            return request;
        }()
    }, {
        key: 'makeFetchRequest',


        // fetch requests

        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(url) {
                var requestConfig, response;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                requestConfig = {
                                    method: 'GET',
                                    url: url,
                                    headers: {
                                        'Accept': 'application/vnd.api+json'
                                    }
                                };

                                this.queryBuilder.reset();
                                _context2.next = 4;
                                return this.request(requestConfig);

                            case 4:
                                response = _context2.sent;
                                return _context2.abrupt('return', this.respond(response.data));

                            case 6:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function makeFetchRequest(_x2) {
                return _ref2.apply(this, arguments);
            }

            return makeFetchRequest;
        }()
    }, {
        key: 'get',
        value: function get() {
            return this.makeFetchRequest('' + this.resourceUrl() + this.queryBuilder.getQuery());
        }
    }, {
        key: 'find',
        value: function find(id) {
            return this.makeFetchRequest('' + this.resourceUrl() + id + this.queryBuilder.getQuery());
        }
    }, {
        key: 'all',
        value: function all() {
            return this.get();
        }
    }, {
        key: 'paginate',
        value: function paginate() {
            var perPage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
            var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            this.queryBuilder.paginate(perPage, page);

            return this.makeFetchRequest('' + this.resourceUrl() + this.queryBuilder.getQuery());
        }
    }, {
        key: 'fetchRelation',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(relationship) {
                var links = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if ((0, _lodash.isUndefined)(links.self)) {
                                    links.self = this.getRelationshipUrl(relationship);
                                }

                                _context3.next = 3;
                                return this.relationships()[relationship].makeFetchRequest(links.self);

                            case 3:
                                this[relationship] = _context3.sent;
                                return _context3.abrupt('return', this[relationship]);

                            case 5:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function fetchRelation(_x5) {
                return _ref3.apply(this, arguments);
            }

            return fetchRelation;
        }()

        // persist requests

    }, {
        key: 'makePersistRequest',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(config) {
                var response;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                config.headers = {
                                    'Content-Type': 'application/vnd.api+json',
                                    'Accept': 'application/vnd.api+json'
                                };

                                _context4.next = 3;
                                return this.request(config);

                            case 3:
                                response = _context4.sent;

                                if (!(response.status === 204)) {
                                    _context4.next = 6;
                                    break;
                                }

                                return _context4.abrupt('return', this.respond(this.clone()));

                            case 6:
                                return _context4.abrupt('return', this.respond(response.data));

                            case 7:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function makePersistRequest(_x7) {
                return _ref4.apply(this, arguments);
            }

            return makePersistRequest;
        }()
    }, {
        key: 'save',
        value: function save() {
            if (this.hasOwnProperty('id')) {
                return this.update();
            }

            return this.create();
        }
    }, {
        key: 'create',
        value: function create() {
            return this.makePersistRequest({
                url: this.resourceUrl(),
                method: 'POST',
                data: this.serialize(this.data())
            });
        }
    }, {
        key: 'update',
        value: function update() {
            return this.makePersistRequest({
                url: this.getSelfUrl(),
                method: 'PATCH',
                data: this.serialize(this.data())
            });
        }
    }, {
        key: 'delete',
        value: function _delete() {
            return this.makePersistRequest({
                url: this.getSelfUrl(),
                method: 'DELETE'
            });
        }
    }, {
        key: 'attach',
        value: function attach(model) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var config = {
                url: this.getSelfUrl() + '/' + model.type + '/' + model.id,
                method: 'POST'
            };

            if (data) {
                config.data = data;
            }

            return this.makePersistRequest(config);
        }
    }, {
        key: 'detach',
        value: function detach(model) {
            return this.makePersistRequest({
                url: this.getSelfUrl() + '/' + model.type + '/' + model.id,
                method: 'DELETE'
            });
        }
    }, {
        key: 'sync',
        value: function sync(relationship) {
            var data = this.serialize(this.data());

            return this.makePersistRequest({
                url: this.getSelfUrl() + '/' + relationship,
                method: 'PATCH',
                data: data.data.relationships[relationship]
            });
        }

        // modify query string

    }, {
        key: 'with',
        value: function _with(resourceName) {
            this.queryBuilder.include(resourceName);

            return this;
        }
    }, {
        key: 'orderBy',
        value: function orderBy(column) {
            var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'asc';

            this.queryBuilder.orderBy(column, direction);

            return this;
        }
    }, {
        key: 'orderByDesc',
        value: function orderByDesc(column) {
            return this.orderBy(column, 'desc');
        }
    }, {
        key: 'where',
        value: function where(key) {
            var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var group = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            this.queryBuilder.where(key, value, group);

            return this;
        }
    }, {
        key: 'filter',
        value: function filter(_filter) {
            var group = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            return this.where(_filter, null, group);
        }
    }, {
        key: 'limit',
        value: function limit(_limit) {
            return this.where('limit', _limit);
        }
    }, {
        key: 'offset',
        value: function offset(_offset) {
            return this.where('offset', _offset);
        }
    }, {
        key: 'select',
        value: function select(fields) {
            if ((0, _lodash.isArray)(fields)) {
                var selectFields = (0, _lodash.clone)(fields);
                fields = {};
                fields[this.resourceName()] = selectFields;
            }

            this.queryBuilder.select(fields);

            return this;
        }

        // build model

    }, {
        key: 'respond',
        value: function respond(response) {
            var data = this.deserialize(response);

            if (this.isCollection(data)) {
                return this.resolveCollection(data);
            }

            return this.resolveItem(data);
        }
    }, {
        key: 'resolveCollection',
        value: function resolveCollection(data) {
            var _this = this;

            var resolved = {};

            if (data.hasOwnProperty('links')) {
                resolved.links = data.links;
            }

            if (data.hasOwnProperty('meta')) {
                resolved.meta = data.meta;
            }

            resolved.data = this.newCollection((0, _lodash.map)(data.data, function (item) {
                return _this.resolveItem(item);
            }));

            return resolved;
        }
    }, {
        key: 'resolveItem',
        value: function resolveItem(data) {
            return this.hydrate(data);
        }
    }, {
        key: 'hydrate',
        value: function hydrate(data) {
            var _this2 = this;

            var model = this.clone();

            model.id = data.id;
            model.type = data.type;

            if (data.hasOwnProperty('relationships')) {
                model.relationshipNames = data.relationships;
            }

            if (data.hasOwnProperty('links')) {
                model.links = data.links;
            }

            (0, _lodash.forEach)(model.fields(), function (field) {
                model[field] = data[field];
            });

            (0, _lodash.forOwn)(model.dates(), function (format, field) {
                model[field] = (0, _moment2.default)(data[field]);
            });

            (0, _lodash.forEach)(data.relationships, function (relationship) {
                var relation = model.relationships()[relationship];

                if ((0, _lodash.isUndefined)(relation)) {
                    throw new Error('Sarale: Relationship ' + relationship + ' has not been defined in ' + model.constructor.name + ' model.');
                }

                var fetch = function fetch() {
                    return model.fetchRelation(relationship, data[relationship].links);
                };

                if (_this2.isCollection(data[relationship])) {
                    model[relationship] = (0, _extends3.default)({}, relation.resolveCollection(data[relationship]), {
                        fetch: fetch
                    });
                } else if (data[relationship].data) {
                    model[relationship] = relation.resolveItem(data[relationship].data);
                    model[relationship].fetch = fetch;
                }
            });

            // forOwn(model.relationships(), (relatedModel, relationshipName) => {
            //     if (isUndefined(model[relationshipName])) {
            //         model[relationshipName] = {
            //             fetch: () => {
            //                 return model.fetchRelation(relationshipName)
            //             }
            //         }
            //     }
            // })

            (0, _lodash.forOwn)(model.computed(), function (computation, key) {
                model[key] = computation(model);
            });

            return model;
        }

        // extract data from model

    }, {
        key: 'data',
        value: function data() {
            var _this3 = this;

            var data = {};

            data.type = this.type;

            if (this.hasOwnProperty('id')) {
                data.id = this.id;
            }

            if (this.hasOwnProperty('relationshipNames')) {
                data.relationships = this.relationshipNames;
            }

            (0, _lodash.forEach)(this.fields(), function (field) {
                if (!(0, _lodash.isUndefined)(_this3[field])) {
                    data[field] = _this3[field];
                }
            });

            (0, _lodash.forOwn)(this.dates(), function (format, field) {
                if (!(0, _lodash.isUndefined)(_this3[field])) {
                    data[field] = (0, _moment2.default)(_this3[field]).format(format);
                }
            });

            (0, _lodash.forEach)(this.relationships(), function (model, relationship) {
                if (!(0, _lodash.isUndefined)(_this3[relationship]) && !(0, _lodash.isUndefined)(_this3[relationship].data)) {
                    if ((0, _lodash.isArray)(_this3[relationship].data)) {
                        data[relationship] = {
                            data_collection: true,
                            data: (0, _lodash.map)(_this3[relationship].data, function (relation) {
                                return relation.data();
                            })
                        };
                    } else {
                        data[relationship] = {
                            data: _this3[relationship].data()
                        };
                    }
                }
            });

            return data;
        }

        // helpers

    }, {
        key: 'resourceUrl',
        value: function resourceUrl() {
            return this.baseUrl() + '/' + this.resourceName() + '/';
        }
    }, {
        key: 'getSelfUrl',
        value: function getSelfUrl() {
            if (this.links.hasOwnProperty('self')) {
                return this.links.self;
            }

            if (!this.hasOwnProperty('id')) {
                throw new Error('Sarala: Unidentifiable resource exception. ' + this.constructor.name + ' id property is undefined.');
            }

            this.links.self = '' + this.resourceUrl() + this.id;

            return this.links.self;
        }
    }, {
        key: 'getRelationshipUrl',
        value: function getRelationshipUrl(relationship) {
            return this.getSelfUrl() + '/relationships/' + relationship;
        }
    }, {
        key: 'isCollection',
        value: function isCollection(data) {
            return data.hasOwnProperty('data_collection') && data.data_collection === true && (0, _lodash.isArray)(data.data);
        }
    }, {
        key: 'deserialize',
        value: function deserialize(data) {
            return formatter.deserialize(data);
        }
    }, {
        key: 'serialize',
        value: function serialize(data) {
            return formatter.serialize(data);
        }
    }, {
        key: 'selfValidate',
        value: function selfValidate() {
            var name = this.resourceName();

            if (name === null || !(0, _lodash.isString)(name) || name.length === 0) {
                throw new Error('Sarale: Resource name not defined in ' + this.constructor.name + ' model. Implement resourceName method in the ' + this.constructor.name + ' model to resolve this error.');
            }
        }
    }, {
        key: 'clone',
        value: function clone() {
            return (0, _lodash.cloneDeep)(this);
        }
    }, {
        key: 'newCollection',
        value: function newCollection(data) {
            return data;
        }
    }]);
    return Model;
}();

exports.default = Model;