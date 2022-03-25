'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var QueryBuilder = function () {
    function QueryBuilder() {
        (0, _classCallCheck3.default)(this, QueryBuilder);

        this.reset();
    }

    (0, _createClass3.default)(QueryBuilder, [{
        key: 'reset',
        value: function reset() {
            this.query = '';
            this.includes = [];
            this.sort = [];
            this.filters = {};
            this.fields = {};
            this.pagination = {};
        }
    }, {
        key: 'include',
        value: function include(resourceName) {
            if (!this.includes[resourceName]) {
                this.includes.push(resourceName);
            }
        }
    }, {
        key: 'paginate',
        value: function paginate(perPage, page) {
            this.pagination = {
                size: perPage,
                number: page
            };
        }
    }, {
        key: 'orderBy',
        value: function orderBy(column, direction) {
            if ((0, _lodash.indexOf)(['asc', 'desc'], direction) === -1) {
                throw new Error('Sarale: Invalid sort direction: "' + direction + '". Allowed only "asc" or "desc".');
            }

            if (direction === 'desc') {
                column = '-' + column;
            }

            this.sort.push(column);
        }
    }, {
        key: 'where',
        value: function where(key, value, group) {
            if ((0, _lodash.isNull)(group)) {
                this.filters[key] = value;
            } else {
                if ((0, _lodash.isUndefined)(this.filters[group])) {
                    this.filters[group] = {};
                }

                this.filters[group][key] = value;
            }
        }
    }, {
        key: 'select',
        value: function select(fields) {
            var _this = this;

            if (!(0, _lodash.isObject)(fields)) {
                throw new Error('Sarala: Invalid fields list.');
            }

            (0, _lodash.forOwn)(fields, function (value, resource) {
                _this.fields[resource] = value.toString();
            });
        }
    }, {
        key: 'getQuery',
        value: function getQuery() {
            this.appendIncludes();
            this.appendFields();
            this.appendFilters();
            this.appendSort();
            this.appendPagination();

            if (this.query.length) {
                this.query = '?' + this.query;
            }

            return this.query;
        }
    }, {
        key: 'appendIncludes',
        value: function appendIncludes() {
            if (this.includes.length) {
                this.appendQuery('include=' + this.includes.toString());
            }
        }
    }, {
        key: 'appendFields',
        value: function appendFields() {
            var query = '';
            var prepend = '';

            (0, _lodash.forOwn)(this.fields, function (fields, resource) {
                query += prepend + 'fields[' + resource + ']=' + fields.toString();
                prepend = '&';
            });

            if (query.length) {
                this.appendQuery(query);
            }
        }
    }, {
        key: 'appendFilters',
        value: function appendFilters() {
            var query = '';
            var prepend = '';

            (0, _lodash.forOwn)(this.filters, function (value, filter) {
                if ((0, _lodash.isObject)(value)) {
                    (0, _lodash.forOwn)(value, function (innerValue, innerFilter) {
                        query += prepend + 'filter[' + filter + '][' + innerFilter + ']=' + innerValue.toString();
                        prepend = '&';
                    });
                } else {
                    query += (0, _lodash.isNull)(value) ? prepend + 'filter[' + filter + ']' : prepend + 'filter[' + filter + ']=' + value.toString();
                }
                prepend = '&';
            });

            if (query.length) {
                this.appendQuery(query);
            }
        }
    }, {
        key: 'appendSort',
        value: function appendSort() {
            if (this.sort.length) {
                this.appendQuery('sort=' + this.sort.toString());
            }
        }
    }, {
        key: 'appendPagination',
        value: function appendPagination() {
            if (!(0, _lodash.isEmpty)(this.pagination)) {
                this.appendQuery('page[size]=' + this.pagination.size + '&page[number]=' + this.pagination.number);
            }
        }
    }, {
        key: 'appendQuery',
        value: function appendQuery(append) {
            if (this.query.length) {
                append = '&' + append;
            }

            this.query += append;
        }
    }]);
    return QueryBuilder;
}();

exports.default = QueryBuilder;