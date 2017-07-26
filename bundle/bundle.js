(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],3:[function(require,module,exports){
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

},{}],4:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":5}],5:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(require,module,exports){
module.exports = "<navBar step=\"{{step}}\"/>\n<detailModal\n    showDetailModal=\"{{showDetailModal}}\"\n    applicationMethods=\"{{methods}}\"\n    bookmarks=\"{{bookmarks}}\"\n    favourites=\"{{favourites}}\"\n    appDetail=\"{{appDetail}}\"\n    step=\"{{step}}\"\n/>\n{{# step=='Applications'}}\n\n    <div class=\"container listings\">\n        <div class=\"grid relaxed-gutters\">\n            <div class=\"desktop-three hidden-tablet hidden-phone\">\n                <div data-sticky-element>\n                    <sidebar\n                        facets=\"{{facets}}\"\n                        searchOnFacet=\"{{methods.searchOnFacet}}\"\n                        removeSearchTag=\"{{methods.removeSearchTag}}\"\n                        filterCriteria=\"{{filterCriteria}}\"\n                        sortApplications=\"{{methods.sortApplications}}\"\n                        sortCriteria=\"{{sortCriteria}}\"\n                    />\n                </div>\n            </div>\n\n            <div class=\"tablet-twelve phone-twelve hidden-desktop\">\n                <sidebar\n                    facets=\"{{facets}}\"\n                    searchOnFacet=\"{{methods.searchOnFacet}}\"\n                    removeSearchTag=\"{{methods.removeSearchTag}}\"\n                    sortApplications=\"{{methods.sortApplications}}\"\n                    filterCriteria=\"{{filterCriteria}}\"\n                />\n            </div>\n\n            <div class=\"desktop-nine tablet-twelve phone-twelve\">\n                <listings\n                    step=\"{{step}}\"\n                    applications=\"{{applications}}\"\n                    applicationMethods=\"{{methods}}\"\n                    bookmarks=\"{{bookmarks}}\"\n                    favourites=\"{{favourites}}\"\n                />\n            </div>\n        </div>\n    </div>\n{{/}}\n\n{{# step=='Bookmarks'}}\n    <div class=\"container listings\">\n        <div class=\"grid relaxed-gutters\">\n            <div class=\"desktop-twelve tablet-twelve phone-twelve\">\n                <listings\n                    step=\"{{step}}\"\n                    applications=\"{{bookmarkedApps}}\"\n                    applicationMethods=\"{{methods}}\"\n                    bookmarks=\"{{bookmarks}}\"\n                    favourites=\"{{favourites}}\"\n                />\n            </div>\n        </div>\n    </div>\n{{/}}\n\n{{# step=='Favourites'}}\n    <div class=\"container listings\">\n        <div class=\"grid relaxed-gutters\">\n            <div class=\"desktop-twelve tablet-twelve phone-twelve\">\n                <listings\n                    step=\"{{step}}\"\n                    applications=\"{{favouriteApps}}\"\n                    applicationMethods=\"{{methods}}\"\n                    bookmarks=\"{{bookmarks}}\"\n                    favourites=\"{{favouriteApps}}\"\n                />\n            </div>\n        </div>\n    </div>\n{{/}}\n";

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Main Dashboard Component
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

var _ractive = require('ractive');

var _ractive2 = _interopRequireDefault(_ractive);

var _listings = require('./services/listings');

var _listings2 = _interopRequireDefault(_listings);

var _dataService = require('./services/data-service');

var _dataService2 = _interopRequireDefault(_dataService);

var _adminServices = require('./services/admin-services');

var _adminServices2 = _interopRequireDefault(_adminServices);

require('./styles/index.less');

var _nav = require('./components/nav');

var _nav2 = _interopRequireDefault(_nav);

var _filter_sidebar = require('./components/filter_sidebar');

var _filter_sidebar2 = _interopRequireDefault(_filter_sidebar);

var _application_listings = require('./components/application_listings');

var _application_listings2 = _interopRequireDefault(_application_listings);

var _applicationDetail = require('./components/application-detail');

var _applicationDetail2 = _interopRequireDefault(_applicationDetail);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ListingFactory = (0, _listings2.default)(),
    ListingDataService = (0, _dataService2.default)(),
    AdminService = (0, _adminServices2.default)();

// style main file


// components includes


var jobComponent = new _ractive2.default({
    el: '[app-main-mount]',
    template: require('./app.html'),
    data: {
        step: 'Applications',
        sortCriteria: {
            on: 'appliedOn',
            type: 'desc'
        }
    },
    components: {
        navBar: _nav2.default,
        sidebar: _filter_sidebar2.default,
        listings: _application_listings2.default,
        detailModal: _applicationDetail2.default
    },

    setSearchData: function setSearchData(filterCriteria) {
        var self = this;

        ListingFactory.getApplications(filterCriteria, self.get('sortCriteria')).then(function (searchData) {
            self.set({
                applications: ListingDataService.mapAvailabilityDays(searchData.results),
                facets: searchData.facets,
                filterCriteria: filterCriteria
            });
        }).catch(function (err) {
            console.error('something went wrong ', err);
        });
    },
    mapBookMarkedApps: function mapBookMarkedApps() {
        var self = this;

        var _self$get = self.get(),
            bookmarks = _self$get.bookmarks;

        var promises = bookmarks.map(function (bookmark) {
            return ListingFactory.getApplicationDetail(bookmark);
        });
        Promise.all(promises).then(function (results) {
            self.set('bookmarkedApps', results);
        });
    },
    mapFavourites: function mapFavourites() {
        var self = this;

        var _self$get2 = self.get(),
            favourites = _self$get2.favourites;

        var promises = favourites.map(function (favourite) {
            return ListingFactory.getApplicationDetail(favourite);
        });
        Promise.all(promises).then(function (results) {
            self.set('favouriteApps', results);
        });
    },


    onrender: RenderCtrl
});

function RenderCtrl() {
    var self = this;

    // get all applications data on render
    var promises = [ListingFactory.getApplications([], self.get('sortCriteria')), AdminService.getBookmarks(), AdminService.getFavourites()];

    Promise.all(promises).then(function (replies) {
        var searchData = void 0,
            bookmarks = void 0,
            favourites = void 0;

        var _replies = _slicedToArray(replies, 3);

        searchData = _replies[0];
        bookmarks = _replies[1];
        favourites = _replies[2];

        console.log('see search data here ', searchData);
        self.set({
            applications: ListingDataService.mapAvailabilityDays(searchData.results),
            bookmarks: bookmarks,
            favourites: favourites,
            filterCriteria: [],
            facets: searchData.facets,
            showDetailModal: false
        });
    }).catch(function (err) {
        console.error('Error while fetching data ', err);
    });

    self.set({

        /**
         * [Centralised actions that are used in the application]
         * @type {Object}
         */

        methods: {
            searchOnFacet: function searchOnFacet(_ref) {
                var facetType = _ref.facetType,
                    facetValue = _ref.facetValue;

                var _self$get3 = self.get(),
                    filterCriteria = _self$get3.filterCriteria;

                var criteriaWithType = filterCriteria.find(function (criteria) {
                    return criteria.type === facetType && criteria.value === facetValue;
                });
                if (!criteriaWithType || typeof criteriaWithType === 'undefined') {
                    filterCriteria.push({ type: facetType, value: facetValue });
                    self.setSearchData(filterCriteria);
                }
            },
            removeSearchTag: function removeSearchTag(id) {
                var _self$get4 = self.get(),
                    filterCriteria = _self$get4.filterCriteria;

                filterCriteria.splice(id, 1);
                self.setSearchData(filterCriteria);
            },
            sortApplications: function sortApplications(sortCriteria) {
                self.set('sortCriteria', sortCriteria);
                self.setSearchData(self.get('filterCriteria'));
            },
            bookmarkApplication: function bookmarkApplication(id) {
                AdminService.setBookmark(id).then(function (bookmarks) {
                    self.set('bookmarks', bookmarks);
                    self.mapBookMarkedApps();
                }).catch(function (err) {
                    console.error('Something went wrong ', err);
                });
            },
            favouriteApplication: function favouriteApplication(id) {
                AdminService.setFavourite(id).then(function (favourites) {
                    self.set('favourites', favourites);
                    self.mapFavourites();
                }).catch(function (err) {
                    console.error('Something went wrong ', err);
                });
            },
            removeAppFromBookmarks: function removeAppFromBookmarks(id) {
                AdminService.removeBookmark(id).then(function (bookmarks) {
                    self.set('bookmarks', bookmarks);
                    self.mapBookMarkedApps();
                }).catch(function (err) {
                    console.error('Something went wrong ', err);
                });
            },
            removeAppFromFavourites: function removeAppFromFavourites(id) {
                AdminService.removeFavourite(id).then(function (favourites) {
                    self.set('favourites', favourites);
                    self.mapFavourites();
                }).catch(function (err) {
                    console.error('Something went wrong ', err);
                });
            },
            displayApplicationDetail: function displayApplicationDetail(id) {
                var _self$get5 = self.get(),
                    applications = _self$get5.applications;

                self.set({
                    showDetailModal: true,
                    appDetail: applications.find(function (application) {
                        return application.id === id;
                    })
                });
            },
            hideDetailModal: function hideDetailModal() {
                self.set('showDetailModal', false);
            }
        }
    });
}

exports.default = jobComponent;

},{"./app.html":6,"./components/application-detail":9,"./components/application_listings":10,"./components/filter_sidebar":12,"./components/nav":14,"./services/admin-services":137,"./services/data-service":138,"./services/listings":139,"./styles/index.less":140,"ractive":117}],8:[function(require,module,exports){
module.exports = "{{# showDetailModal}}\n    <div class=\"overlay\" on-click=\"hideModal\"></div>\n    <div class=\"modal\">\n        <div class=\"container\">\n            {{# appDetail}}\n                <div class=\"application-detail-modal\">\n                    <a role=\"button\">{{position}}</a>\n                    <p>{{name}}</p>\n                    <p class=\"applied-at\">\n                        <strong>Applied: </strong>{{applied}}\n                    </p>\n\n                    <div class=\"grid no-gutters\">\n                        <p class=\"info\">\n                            <strong>Experience: </strong> {{experience}} years\n                        </p>\n\n                        <div class=\"availability\">\n                            <p><strong>Availability :</strong></p>\n                            <div class=\"day-tags\">\n                                <div class=\"grid\">\n                                    {{#each availableOnDays}}\n                                        <div class=\"tag\">{{this}}</div>\n                                    {{/each}}\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n\n                    <div class=\"controls\">\n                        <div class=\"grid\">\n                            {{# step !== 'Favourites' && step !== 'Bookmarks' }}\n                                {{#if isInFavourites(id)}}\n                                    <i\n                                        class=\"fa fa-heart\"\n                                        title=\"Favourite\"\n                                        data-id=\"{{id}}\"\n                                        data-action=\"removeFromFavourites\"\n                                        on-click=\"applicationEvent\"\n                                    >\n                                    </i>\n                                    {{else}}\n                                    <i\n                                        class=\"fa fa-heart-o\"\n                                        title=\"Favourite\"\n                                        data-id=\"{{id}}\"\n                                        data-action=\"favouriteApllication\"\n                                        on-click=\"applicationEvent\"\n                                    >\n                                    </i>\n                                {{/if}}\n                                {{#if isInBookmarks(id)}}\n                                    <i\n                                        class=\"fa fa-bookmark\"\n                                        title=\"Bookmark\"\n                                        data-action=\"removeFromBookmarks\"\n                                        data-id=\"{{id}}\"\n                                        on-click=\"applicationEvent\"\n                                    >\n                                    </i>\n                                    {{else}}\n                                    <i\n                                        class=\"fa fa-bookmark-o\"\n                                        title=\"Bookmark\"\n                                        data-action=\"bookamrkApplication\"\n                                        data-id=\"{{id}}\"\n                                        on-click=\"applicationEvent\"\n                                    >\n                                    </i>\n                                {{/if}}\n                            {{/}}\n                        </div>\n                    </div>\n\n                    <div class=\"grid no-gutters\">\n                        <h4>Questions?</h4>\n                    </div>\n\n                    {{#each questions}}\n                        <div class=\"grid no-gutters\">\n                            <div class=\"question\">\n                                <p>{{text}}</p>\n                            </div>\n                        </div>\n                        <div class=\"grid no-gutters\">\n                            <p><strong>Answer: </strong>{{answer}}</p>\n                        </div>\n                    {{/each}}\n                </div>\n            {{/}}\n        </div>\n    </div>\n{{/}}\n";

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ractive = require('ractive');

var _ractive2 = _interopRequireDefault(_ractive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appDetailComponent = _ractive2.default.extend({
    isolated: true,
    template: require('./detail_modal.html'),
    isInBookmarks: function isInBookmarks(id) {
        var _get = this.get(),
            bookmarks = _get.bookmarks;

        return bookmarks.indexOf(id) !== -1;
    },
    isInFavourites: function isInFavourites(id) {
        var _get2 = this.get(),
            favourites = _get2.favourites;

        return favourites.indexOf(id) !== -1;
    },
    onrender: function onrender() {
        var self = this;
        self.on({
            hideModal: function hideModal(e) {
                var _self$get = self.get(),
                    applicationMethods = _self$get.applicationMethods;

                applicationMethods.hideDetailModal();
            },
            applicationEvent: function applicationEvent(e) {
                e.original.preventDefault();
                var id = e.node.getAttribute('data-id'),
                    action = e.node.getAttribute('data-action'),
                    _self$get2 = self.get(),
                    applicationMethods = _self$get2.applicationMethods;


                switch (action) {
                    case 'favouriteApllication':
                        applicationMethods.favouriteApplication(id);
                        break;

                    case 'bookamrkApplication':
                        applicationMethods.bookmarkApplication(id);
                        break;

                    case 'removeFromBookmarks':
                        applicationMethods.removeAppFromBookmarks(id);
                        break;

                    case 'removeFromFavourites':
                        applicationMethods.removeAppFromFavourites(id);
                        break;

                    default:
                        console.log('do nothing here ');
                }
            }
        });
    }
}); /**
     *
     * Application Detail Component
     *
     */

exports.default = appDetailComponent;

},{"./detail_modal.html":8,"ractive":117}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ractive = require('ractive');

var _ractive2 = _interopRequireDefault(_ractive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var listingComponent = _ractive2.default.extend({
    isolated: true,
    template: require('./listings.html'),

    isInBookmarks: function isInBookmarks(id) {
        var _get = this.get(),
            bookmarks = _get.bookmarks;

        return bookmarks.indexOf(id) !== -1;
    },
    isInFavourites: function isInFavourites(id) {
        var _get2 = this.get(),
            favourites = _get2.favourites;

        return favourites.indexOf(id) !== -1;
    },
    onrender: function onrender() {
        var self = this;

        self.on({
            showApplicationDetail: function showApplicationDetail(e) {
                e.original.preventDefault();
                var id = e.node.getAttribute('data-id'),
                    _get3 = this.get(),
                    applicationMethods = _get3.applicationMethods;

                applicationMethods.displayApplicationDetail(id);
            },
            applicationEvent: function applicationEvent(e) {
                e.original.preventDefault();
                var id = e.node.getAttribute('data-id'),
                    action = e.node.getAttribute('data-action'),
                    _self$get = self.get(),
                    applicationMethods = _self$get.applicationMethods;


                switch (action) {
                    case 'favouriteApllication':
                        applicationMethods.favouriteApplication(id);
                        break;

                    case 'bookamrkApplication':
                        applicationMethods.bookmarkApplication(id);
                        break;

                    case 'removeFromBookmarks':
                        applicationMethods.removeAppFromBookmarks(id);
                        break;

                    case 'removeFromFavourites':
                        applicationMethods.removeAppFromFavourites(id);
                        break;

                    default:
                        console.log('do nothing here ');
                }
            }
        });
    }
}); /**
     *
     * Listings Display Component
     *
     */

exports.default = listingComponent;

},{"./listings.html":11,"ractive":117}],11:[function(require,module,exports){
module.exports = "<div class=\"card\">\n    <div class=\"card-header\">\n        <h3>{{step}}</h3>\n    </div>\n\n    {{#each applications}}\n        <div class=\"job-application\">\n            <a role=\"button\" on-click=\"showApplicationDetail\" data-id=\"{{id}}\">{{position}}</a>\n            <p>{{name}}</p>\n            <p class=\"applied-at\">\n                <strong>Applied: </strong>{{applied}}\n            </p>\n\n            <div class=\"grid no-gutters\">\n                <p class=\"info\">\n                    <strong>Experience: </strong> {{experience}} years\n                </p>\n\n                <div class=\"availability\">\n                    <p><strong>Availability :</strong></p>\n                    <div class=\"day-tags\">\n                        <div class=\"grid\">\n                            {{#each availableOnDays}}\n                                <div class=\"tag\">{{this}}</div>\n                            {{/each}}\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"controls\">\n                <div class=\"grid\">\n                    {{#step == 'Favourites'}}\n                        <a role=\"button\" class=\"remove-btn\" data-id=\"{{id}}\" data-action=\"removeFromFavourites\" on-click=\"applicationEvent\">Remove</a>\n                    {{/}}\n                    {{#step == 'Bookmarks'}}\n                        <a role=\"button\" class=\"remove-btn\" data-id=\"{{id}}\" data-action=\"removeFromBookmarks\" on-click=\"applicationEvent\">Remove</a>\n                    {{/}}\n                    {{# step !== 'Favourites' && step !== 'Bookmarks' }}\n                        {{#if isInFavourites(id)}}\n                            <i\n                                class=\"fa fa-heart\"\n                                title=\"Favourite\"\n                                data-id=\"{{id}}\"\n                                data-action=\"removeFromFavourites\"\n                                on-click=\"applicationEvent\"\n                            >\n                            </i>\n                            {{else}}\n                            <i\n                                class=\"fa fa-heart-o\"\n                                title=\"Favourite\"\n                                data-id=\"{{id}}\"\n                                data-action=\"favouriteApllication\"\n                                on-click=\"applicationEvent\"\n                            >\n                            </i>\n                        {{/if}}\n                        {{#if isInBookmarks(id)}}\n                            <i\n                                class=\"fa fa-bookmark\"\n                                title=\"Bookmark\"\n                                data-action=\"removeFromBookmarks\"\n                                data-id=\"{{id}}\"\n                                on-click=\"applicationEvent\"\n                            >\n                            </i>\n                            {{else}}\n                            <i\n                                class=\"fa fa-bookmark-o\"\n                                title=\"Bookmark\"\n                                data-action=\"bookamrkApplication\"\n                                data-id=\"{{id}}\"\n                                on-click=\"applicationEvent\"\n                            >\n                            </i>\n                        {{/if}}\n                    {{/}}\n                </div>\n            </div>\n        </div>\n    {{/each}}\n\n</div>\n";

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ractive = require('ractive');

var _ractive2 = _interopRequireDefault(_ractive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sideBarComponent = _ractive2.default.extend({
    isolated: true,
    template: require('./sidebar.html'),
    showAvailaBility: function showAvailaBility() {
        var _get = this.get(),
            filterCriteria = _get.filterCriteria;

        if (typeof filterCriteria === 'undefined') return true;
        var filtered = filterCriteria.find(function (criteria) {
            return criteria.type === 'availability';
        });
        return !filtered || typeof filtered === 'undefined';
    },
    onrender: function onrender() {

        this.on({
            removeSearchTag: function removeSearchTag(e) {
                var searhTagId = e.node.getAttribute('data-tag-index'),
                    _get2 = this.get(),
                    removeSearchTag = _get2.removeSearchTag;

                removeSearchTag(searhTagId);
            },
            searchApplications: function searchApplications(e) {
                var facetType = e.node.getAttribute('data-facet'),
                    facetValue = e.node.value,
                    _get3 = this.get(),
                    searchOnFacet = _get3.searchOnFacet;


                if (facetValue !== '') searchOnFacet({ facetValue: facetValue, facetType: facetType });
            },
            sortApplications: function sortApplications(e) {
                var _get4 = this.get(),
                    sortCriteria = _get4.sortCriteria,
                    sortApplications = _get4.sortApplications;

                sortApplications(sortCriteria);
            },
            chagneSortType: function chagneSortType(e) {
                var _get5 = this.get(),
                    sortCriteria = _get5.sortCriteria,
                    sortApplications = _get5.sortApplications;

                sortCriteria.type = e.node.getAttribute('data-type');
                sortApplications(sortCriteria);
            }
        });
    }
}); /**
     *
     * Filter SIdebar COmponet
     *
     */

exports.default = sideBarComponent;

},{"./sidebar.html":13,"ractive":117}],13:[function(require,module,exports){
module.exports = "<div class=\"sidebar\">\n    <div class=\"card-header\">\n        <h3>Sort On</h3>\n    </div>\n\n    <div class=\"grid facet\">\n        <div class=\"desktop-four tablet-four mobile-four\">\n            <p>Sort</p>\n        </div>\n\n        <div class=\"desktop-seven tablet-seven mobile-seven\">\n            <select class=\"select-box\" on-change=\"sortApplications\" value=\"{{sortCriteria.on}}\">\n                <option value=\"appliedOn\">Applied On</option>\n                <option value=\"name\">Name</option>\n                <option value=\"experience\">Experience</option>\n                <option value=\"position\">Position</option>\n            </select>\n        </div>\n\n        <div class=\"desktop-one tablet-one mobile-one sort-control\">\n            {{# sortCriteria.type=='desc'}}\n                <i class=\"fa fa-arrow-up\" title=\"ascending\" data-type=\"asc\" on-click=\"chagneSortType\" aria-hidden=\"true\"></i>\n            {{/}}\n            {{# sortCriteria.type=='asc'}}\n                <i class=\"fa fa-arrow-down\" title=\"descending\" data-type=\"desc\" on-click=\"chagneSortType\" aria-hidden=\"true\"></i>\n            {{/}}\n        </div>\n    </div>\n\n    <div class=\"card-header\">\n        <h3>Filter On</h3>\n    </div>\n\n    {{#each filterCriteria}}\n        <div class=\"searh-tag\" on-click=\"removeSearchTag\" data-tag-index=\"{{@index}}\">\n            <div>{{type}}: {{value}}</div>\n            <i class=\"fa fa-times\"></i>\n        </div>\n    {{/each}}\n\n    {{# facets.positions.length > 1}}\n        <div class=\"grid facet\">\n            <div class=\"desktop-four tablet-four mobile-four\">\n                <p>Position</p>\n            </div>\n\n            <div class=\"desktop-eight tablet-eight mobile-eight\">\n                <select class=\"select-box\" on-change=\"searchApplications\" data-facet=\"position\">\n                    <option value=\"\">Select Position</option>\n                    {{#each facets.positions}}\n                        <option value=\"{{this}}\">{{this}}</option>\n                    {{/each}}\n                </select>\n            </div>\n        </div>\n    {{/}}\n\n    {{#if showAvailaBility()}}\n        <div class=\"grid facet\">\n            <div class=\"desktop-four tablet-four mobile-four\">\n                <p>Availability</p>\n            </div>\n\n            <div class=\"desktop-eight tablet-eight mobile-eight\">\n                <select class=\"select-box\" on-change=\"searchApplications\" data-facet=\"availability\">\n                    <option value=\"\">Select Day</option>\n                    <option value=\"M\">Monday</option>\n                    <option value=\"T\">Tuesday</option>\n                    <option value=\"W\">Wednesday</option>\n                    <option value=\"Th\">Thursday</option>\n                    <option value=\"F\">Friday</option>\n                    <option value=\"S\">Saturday</option>\n                    <option value=\"Su\">Sunday</option>\n                </select>\n            </div>\n        </div>\n    {{/if}}\n\n\n    {{# facets.experience.length > 1}}\n        <div class=\"grid facet\">\n            <div class=\"desktop-four tablet-four mobile-four\">\n                <p>Experience</p>\n            </div>\n\n            <div class=\"desktop-eight tablet-eight mobile-eight\">\n                <select class=\"select-box\" on-change=\"searchApplications\" data-facet=\"experience\">\n                    <option value=\"\">Select Experience</option>\n                    {{#each facets.experience}}\n                        <option value=\"{{this}}\">{{this}} Years</option>\n                    {{/each}}\n                </select>\n            </div>\n        </div>\n    {{/}}\n</div>\n";

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ractive = require('ractive');

var _ractive2 = _interopRequireDefault(_ractive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var navComponent = _ractive2.default.extend({
    isolated: true,
    template: require('./tpl.html'),
    data: function data() {
        return {
            navLinks: ['Applications', 'Bookmarks', 'Favourites']
        };
    },
    onrender: function onrender() {
        this.on({
            changeLink: function changeLink(e) {
                this.set('step', e.node.getAttribute('data-link'));
            }
        });
    }
}); /**
     *
     * Nav bar Component
     *
     */

exports.default = navComponent;

},{"./tpl.html":15,"ractive":117}],15:[function(require,module,exports){
module.exports = "<div class=\"nav\">\n    <div class=\"nav-item\">\n        <a href=\"/\" class=\"logo\">\n            jobportal\n        </a>\n    </div>\n\n    {{#each navLinks}}\n        <div class=\"nav-item\" on-click=\"changeLink\" data-link=\"{{this}}\">\n            <a role=\"button\" class=\"link {{# this===step}}active{{/}}\">\n                {{this}}\n            </a>\n        </div>\n    {{/each}}\n</div>\n";

},{}],16:[function(require,module,exports){
'use strict';

require('./app');

window.addEventListener('scroll', function () {
    var stickyElement = document.querySelector('[data-sticky-element]');
    if (stickyElement) {
        stickyElement.style.position = 'fixed';
        stickyElement.style.width = stickyElement.parentNode.offsetWidth + 'px';
    }
});
// app main component require


window.addEventListener('resize', function () {
    var stickyElement = document.querySelector('[data-sticky-element]');
    if (stickyElement) {
        stickyElement.style.position = 'fixed';
        stickyElement.style.width = stickyElement.parentNode.offsetWidth + 'px';
    }
});

},{"./app":7}],17:[function(require,module,exports){
(function (process,__filename){
/** vim: et:ts=4:sw=4:sts=4
 * @license amdefine 1.0.1 Copyright (c) 2011-2016, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/amdefine for details
 */

/*jslint node: true */
/*global module, process */
'use strict';

/**
 * Creates a define for node.
 * @param {Object} module the "module" object that is defined by Node for the
 * current module.
 * @param {Function} [requireFn]. Node's require function for the current module.
 * It only needs to be passed in Node versions before 0.5, when module.require
 * did not exist.
 * @returns {Function} a define function that is usable for the current node
 * module.
 */
function amdefine(module, requireFn) {
    'use strict';
    var defineCache = {},
        loaderCache = {},
        alreadyCalled = false,
        path = require('path'),
        makeRequire, stringRequire;

    /**
     * Trims the . and .. from an array of path segments.
     * It will keep a leading path segment if a .. will become
     * the first path segment, to help with module name lookups,
     * which act like paths, but can be remapped. But the end result,
     * all paths that use this function should look normalized.
     * NOTE: this method MODIFIES the input array.
     * @param {Array} ary the array of path segments.
     */
    function trimDots(ary) {
        var i, part;
        for (i = 0; ary[i]; i+= 1) {
            part = ary[i];
            if (part === '.') {
                ary.splice(i, 1);
                i -= 1;
            } else if (part === '..') {
                if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                    //End of the line. Keep at least one non-dot
                    //path segment at the front so it can be mapped
                    //correctly to disk. Otherwise, there is likely
                    //no path mapping for a path starting with '..'.
                    //This can still fail, but catches the most reasonable
                    //uses of ..
                    break;
                } else if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }

    function normalize(name, baseName) {
        var baseParts;

        //Adjust any relative paths.
        if (name && name.charAt(0) === '.') {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                baseParts = baseName.split('/');
                baseParts = baseParts.slice(0, baseParts.length - 1);
                baseParts = baseParts.concat(name.split('/'));
                trimDots(baseParts);
                name = baseParts.join('/');
            }
        }

        return name;
    }

    /**
     * Create the normalize() function passed to a loader plugin's
     * normalize method.
     */
    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(id) {
        function load(value) {
            loaderCache[id] = value;
        }

        load.fromText = function (id, text) {
            //This one is difficult because the text can/probably uses
            //define, and any relative paths and requires should be relative
            //to that id was it would be found on disk. But this would require
            //bootstrapping a module/require fairly deeply from node core.
            //Not sure how best to go about that yet.
            throw new Error('amdefine does not implement load.fromText');
        };

        return load;
    }

    makeRequire = function (systemRequire, exports, module, relId) {
        function amdRequire(deps, callback) {
            if (typeof deps === 'string') {
                //Synchronous, single module require('')
                return stringRequire(systemRequire, exports, module, deps, relId);
            } else {
                //Array of dependencies with a callback.

                //Convert the dependencies to modules.
                deps = deps.map(function (depName) {
                    return stringRequire(systemRequire, exports, module, depName, relId);
                });

                //Wait for next tick to call back the require call.
                if (callback) {
                    process.nextTick(function () {
                        callback.apply(null, deps);
                    });
                }
            }
        }

        amdRequire.toUrl = function (filePath) {
            if (filePath.indexOf('.') === 0) {
                return normalize(filePath, path.dirname(module.filename));
            } else {
                return filePath;
            }
        };

        return amdRequire;
    };

    //Favor explicit value, passed in if the module wants to support Node 0.4.
    requireFn = requireFn || function req() {
        return module.require.apply(module, arguments);
    };

    function runFactory(id, deps, factory) {
        var r, e, m, result;

        if (id) {
            e = loaderCache[id] = {};
            m = {
                id: id,
                uri: __filename,
                exports: e
            };
            r = makeRequire(requireFn, e, m, id);
        } else {
            //Only support one define call per file
            if (alreadyCalled) {
                throw new Error('amdefine with no module ID cannot be called more than once per file.');
            }
            alreadyCalled = true;

            //Use the real variables from node
            //Use module.exports for exports, since
            //the exports in here is amdefine exports.
            e = module.exports;
            m = module;
            r = makeRequire(requireFn, e, m, module.id);
        }

        //If there are dependencies, they are strings, so need
        //to convert them to dependency values.
        if (deps) {
            deps = deps.map(function (depName) {
                return r(depName);
            });
        }

        //Call the factory with the right dependencies.
        if (typeof factory === 'function') {
            result = factory.apply(m.exports, deps);
        } else {
            result = factory;
        }

        if (result !== undefined) {
            m.exports = result;
            if (id) {
                loaderCache[id] = m.exports;
            }
        }
    }

    stringRequire = function (systemRequire, exports, module, id, relId) {
        //Split the ID by a ! so that
        var index = id.indexOf('!'),
            originalId = id,
            prefix, plugin;

        if (index === -1) {
            id = normalize(id, relId);

            //Straight module lookup. If it is one of the special dependencies,
            //deal with it, otherwise, delegate to node.
            if (id === 'require') {
                return makeRequire(systemRequire, exports, module, relId);
            } else if (id === 'exports') {
                return exports;
            } else if (id === 'module') {
                return module;
            } else if (loaderCache.hasOwnProperty(id)) {
                return loaderCache[id];
            } else if (defineCache[id]) {
                runFactory.apply(null, defineCache[id]);
                return loaderCache[id];
            } else {
                if(systemRequire) {
                    return systemRequire(originalId);
                } else {
                    throw new Error('No module with ID: ' + id);
                }
            }
        } else {
            //There is a plugin in play.
            prefix = id.substring(0, index);
            id = id.substring(index + 1, id.length);

            plugin = stringRequire(systemRequire, exports, module, prefix, relId);

            if (plugin.normalize) {
                id = plugin.normalize(id, makeNormalize(relId));
            } else {
                //Normalize the ID normally.
                id = normalize(id, relId);
            }

            if (loaderCache[id]) {
                return loaderCache[id];
            } else {
                plugin.load(id, makeRequire(systemRequire, exports, module, relId), makeLoad(id), {});

                return loaderCache[id];
            }
        }
    };

    //Create a define function specific to the module asking for amdefine.
    function define(id, deps, factory) {
        if (Array.isArray(id)) {
            factory = deps;
            deps = id;
            id = undefined;
        } else if (typeof id !== 'string') {
            factory = id;
            id = deps = undefined;
        }

        if (deps && !Array.isArray(deps)) {
            factory = deps;
            deps = undefined;
        }

        if (!deps) {
            deps = ['require', 'exports', 'module'];
        }

        //Set up properties for this module. If an ID, then use
        //internal cache. If no ID, then use the external variables
        //for this node module.
        if (id) {
            //Put the module in deep freeze until there is a
            //require call for it.
            defineCache[id] = [id, deps, factory];
        } else {
            runFactory(id, deps, factory);
        }
    }

    //define.require, which has access to all the values in the
    //cache. Useful for AMD modules that all have IDs in the file,
    //but need to finally export a value to node based on one of those
    //IDs.
    define.require = function (id) {
        if (loaderCache[id]) {
            return loaderCache[id];
        }

        if (defineCache[id]) {
            runFactory.apply(null, defineCache[id]);
            return loaderCache[id];
        }
    };

    define.amd = {};

    return define;
}

module.exports = amdefine;

}).call(this,require('_process'),"/node_modules/amdefine/amdefine.js")
},{"_process":5,"path":4}],18:[function(require,module,exports){
module.exports = function (css, customDocument) {
  var doc = customDocument || document;
  if (doc.createStyleSheet) {
    var sheet = doc.createStyleSheet()
    sheet.cssText = css;
    return sheet.ownerNode;
  } else {
    var head = doc.getElementsByTagName('head')[0],
        style = doc.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(doc.createTextNode(css));
    }

    head.appendChild(style);
    return style;
  }
};

module.exports.byUrl = function(url) {
  if (document.createStyleSheet) {
    return document.createStyleSheet(url).ownerNode;
  } else {
    var head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = url;

    head.appendChild(link);
    return link;
  }
};

},{}],19:[function(require,module,exports){
var Handlebars = require('handlebars');
var fecha = require('fecha');
var numbro = require('numbro');
var mockdata = require('./lib/mockdata');
var helpers = require('./lib/helpers');
var utils = require('./lib/utils');

var dummyjson = {
  // Global seed for the random number generator
  seed: null,

  parse: function (string, options) {
    options = options || {};

    // Merge custom mockdata/helpers into the defaults, items with the same name will override
    options.mockdata = Handlebars.Utils.extend({}, mockdata, options.mockdata);
    options.helpers = Handlebars.Utils.extend({}, helpers, options.helpers);

    // If a seed is passed in the options it will override the default one
    utils.setRandomSeed(options.seed || dummyjson.seed);

    // Certain helpers, such as name and email, attempt to synchronise and use the same values when
    // called after one-another. This object acts as a cache so the helpers can share their values.
    options.mockdata.__cache = {};

    return Handlebars.compile(string)(options.mockdata, {
      helpers: options.helpers,
      partials: options.partials
    });
  },

  // Expose the built-in modules so people can use them in their own helpers
  mockdata: mockdata,
  helpers: helpers,
  utils: utils,

  // Also expose the number and date formatters so people can modify their settings
  fecha: fecha,
  numbro: numbro
};

module.exports = dummyjson;

},{"./lib/helpers":20,"./lib/mockdata":21,"./lib/utils":22,"fecha":23,"handlebars":53,"numbro":116}],20:[function(require,module,exports){
var os = require('os');
var Handlebars = require('handlebars');
var numbro = require('numbro');
var fecha = require('fecha');
var utils = require('./utils');

// Generating int and floats is very similar so we route both to this single function
function getNumber (type, min, max, format, options) {
  var ret;

  // Juggle the arguments if the user didn't supply a format string
  if (!options) {
    options = format;
    format = null;
  }

  if (type === 'int') {
    ret = utils.randomInt(min, max);
  } else if (type === 'float') {
    ret = utils.randomFloat(min, max);
  }

  if (typeof options.hash.round === 'number') {
    ret = Math.round(ret / options.hash.round) * options.hash.round;
  }

  if (format) {
    ret = numbro(ret).format(format);
  }

  return ret;
}

// Generating time and dates is very similar so we route both to this single function
function getDate (type, min, max, format, options) {
  var ret;

  // Juggle the arguments if the user didn't supply a format string
  if (!options) {
    options = format;
    format = null;
  }

  if (type === 'date') {
    min = Date.parse(min);
    max = Date.parse(max);
  } else if (type === 'time') {
    min = Date.parse('1970-01-01T' + min);
    max = Date.parse('1970-01-01T' + max);
  }

  ret = utils.randomDate(min, max);

  if (format === 'unix') {
    // We need to undo the timezone offset fix from utils.randomDate()
    ret = Math.floor((ret.getTime() - ret.getTimezoneOffset() * 60000) / 1000);
  } else if (format) {
    ret = fecha.format(ret, format);
  } else if (type === 'time') {
    // Time has a default format if one is not specified
    ret = fecha.format(ret, 'HH:mm');
  }

  return ret;
}

function getFirstName (options) {
  // The value is cached so that other helpers can use it.
  // Each helper is allowed to use the cached value just once.
  var cache = options.data.root.__cache;
  var ret = utils.randomArrayItem(options.data.root.firstNames);
  cache.firstName = ret;
  cache.username_firstName = ret;
  cache.email_firstName = ret;
  return ret;
}

function getLastName (options) {
  // The value is cached so that other helpers can use it.
  // Each helper is allowed to use the cached value just once.
  var cache = options.data.root.__cache;
  var ret = utils.randomArrayItem(options.data.root.lastNames);
  cache.lastName = ret;
  cache.username_lastName = ret;
  cache.email_lastName = ret;
  return ret;
}

function getCompany (options) {
  // The value is cached so that other helpers can use it.
  // Each helper is allowed to use the cached value just once.
  var cache = options.data.root.__cache;
  var ret = utils.randomArrayItem(options.data.root.companies);
  cache.company = ret;
  cache.domain_company = ret;
  cache.email_company = ret;
  return ret;
}

function getTld (options) {
  // The value is cached so that other helpers can use it.
  // Each helper is allowed to use the cached value just once.
  var cache = options.data.root.__cache;
  var tld = utils.randomArrayItem(options.data.root.tlds);
  cache.tld = tld;
  cache.domain_tld = tld;
  cache.email_tld = tld;
  return tld;
}

var helpers = {
  repeat: function (min, max, options) {
    var ret = '';
    var total = 0;
    var data;
    var i;

    if (arguments.length === 3) {
      // If given two numbers then pick a random one between the two
      total = utils.randomInt(min, max);
    } else if (arguments.length === 2) {
      // If given one number then just use it as a fixed repeat total
      options = max;
      total = min;
    } else {
      throw new Error('The repeat helper requires a numeric param');
    }

    // Create a shallow copy of data so we can add variables without modifying the original
    data = Handlebars.Utils.extend({}, options.data);

    for (i = 0; i < total; i++) {
      // Clear the linked values on each iteration so a new set of names/companies is generated
      options.data.root.__cache = {};

      // You can access these in your template using @index, @total, @first, @last
      data.index = i;
      data.total = total;
      data.first = i === 0;
      data.last = i === total - 1;

      // By using 'this' as the context the repeat block will inherit the current scope
      ret = ret + options.fn(this, {data: data});

      if (options.hash.comma !== false) {
        // Trim any whitespace left by handlebars and add a comma if it doesn't already exist,
        // also trim any trailing commas that might be at the end of the loop
        ret = ret.trimRight();
        if (i < total - 1 && ret.charAt(ret.length - 1) !== ',') {
          ret += ',';
        } else if (i === total - 1 && ret.charAt(ret.length - 1) === ',') {
          ret = ret.slice(0, -1);
        }
        ret += os.EOL;
      }
    }

    return ret;
  },

  int: function (min, max, format, options) {
    if (arguments.length !== 3 && arguments.length !== 4) {
      throw new Error('The int helper requires two numeric params');
    }
    return getNumber('int', min, max, format, options);
  },

  float: function (min, max, format, options) {
    if (arguments.length !== 3 && arguments.length !== 4) {
      throw new Error('The float helper requires two numeric params');
    }
    return getNumber('float', min, max, format, options);
  },

  boolean: function () {
    return utils.randomBoolean().toString();
  },

  date: function (min, max, format, options) {
    if (arguments.length !== 3 && arguments.length !== 4) {
      throw new Error('The date helper requires two string params');
    }
    return getDate('date', min, max, format, options);
  },

  time: function (min, max, format, options) {
    if (arguments.length !== 3 && arguments.length !== 4) {
      throw new Error('The time helper requires two string params');
    }
    return getDate('time', min, max, format, options);
  },

  title: function (options) {
    return utils.randomArrayItem(options.data.root.titles);
  },

  firstName: function (options) {
    // Try to use the cached values first, otherwise generate a new value
    var cache = options.data.root.__cache;
    var ret = cache.firstName || getFirstName(options);

    // The cached values are cleared so they can't be used again
    cache.firstName = null;
    return ret;
  },

  lastName: function (options) {
    // Try to use the cached values first, otherwise generate a new value
    var cache = options.data.root.__cache;
    var ret = cache.lastName || getLastName(options);

    // The cached values are cleared so they can't be used again
    cache.lastName = null;
    return ret;
  },

  username: function (options) {
    // Try to use the cached values first, otherwise generate a new value
    var cache = options.data.root.__cache;
    var first = cache.username_firstName || getFirstName(options);
    var last = cache.username_lastName || getLastName(options);

    // The cached values are cleared so they can't be used again
    cache.username_firstName = null;
    cache.username_lastName = null;

    return first.substr(0, 1).toLowerCase() + last.toLowerCase();
  },

  company: function (options) {
    // Try to use the cached values first, otherwise generate a new value
    var cache = options.data.root.__cache;
    var company = cache.company || getCompany(options);

    // The cached values are cleared so they can't be used again
    cache.company = null;
    return company;
  },

  tld: function (options) {
    // Try to use the cached values first, otherwise generate a new value
    var cache = options.data.root.__cache;
    var tld = cache.tld || getTld(options);

    // The cached values are cleared so they can't be used again
    cache.tld = null;
    return tld;
  },

  domain: function (options) {
    // Try to use the cached values first, otherwise generate a new value
    var cache = options.data.root.__cache;
    var company = cache.domain_company || getCompany(options);
    var tld = cache.domain_tld || getTld(options);

    // The cached values are cleared so they can't be used again
    cache.domain_company = null;
    cache.domain_tld = null;

    return company.toLowerCase() + '.' + tld;
  },

  email: function (options) {
    // Try to use the cached values first, otherwise generate a new value
    var cache = options.data.root.__cache;
    var first = cache.email_firstName || getFirstName(options);
    var last = cache.email_lastName || getLastName(options);
    var company = cache.email_company || getCompany(options);
    var tld = cache.email_tld || getTld(options);

    // The cached values are cleared so they can't be used again
    cache.email_firstName = null;
    cache.email_lastName = null;
    cache.email_company = null;
    cache.email_tld = null;

    return first.toLowerCase() + '.' + last.toLowerCase() +
      '@' + company.toLowerCase() + '.' + tld;
  },

  street: function (options) {
    return utils.randomArrayItem(options.data.root.streets);
  },

  city: function (options) {
    return utils.randomArrayItem(options.data.root.cities);
  },

  country: function (options) {
    var ret;
    var rootData = options.data.root;
    var cache = rootData.__cache;

    // Try to use the cached values first, otherwise generate a new value
    if (cache.country) {
      ret = cache.country;
    } else {
      var pos = utils.randomInt(0, rootData.countries.length - 1);
      ret = rootData.countries[pos];
      cache.countryCode = rootData.countryCodes[pos];
    }

    // The cached values are cleared so they can't be used again
    cache.country = null;
    return ret;
  },

  countryCode: function (options) {
    var ret;
    var rootData = options.data.root;
    var cache = rootData.__cache;

    // Try to use the cached values first, otherwise generate a new value
    if (cache.countryCode) {
      ret = cache.countryCode;
    } else {
      var pos = utils.randomInt(0, rootData.countries.length - 1);
      ret = rootData.countryCodes[pos];
      cache.country = rootData.countries[pos];
    }

    // The cached values are cleared so they can't be used again
    cache.countryCode = null;
    return ret;
  },

  zipcode: function () {
    return ('0' + utils.randomInt(1000, 99999).toString()).slice(-5);
  },

  postcode: function () {
    return utils.randomChar() + utils.randomChar() + utils.randomInt(0, 9) + ' ' +
      utils.randomInt(0, 9) + utils.randomChar() + utils.randomChar();
  },

  lat: function (options) {
    return getNumber('float', -90, 90, '0.000000', options);
  },

  long: function (options) {
    return getNumber('float', -180, 180, '0.000000', options);
  },

  phone: function (format) {
    // Provide a default format if one is not given
    format = (typeof format === 'string') ? format : 'xxx-xxx-xxxx';
    return format.replace(/x/g, function () {
      return utils.randomInt(0, 9);
    });
  },

  guid: function () {
    var ret = '';
    var i = 0;
    var mask = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    var c, r, v;

    while (i++ < 36) {
      c = mask[i - 1];
      r = utils.random() * 16 | 0;
      v = (c === 'x') ? r : (r & 0x3 | 0x8);
      ret += (c === '-' || c === '4') ? c : v.toString(16);
    }

    return ret;
  },

  ipv4: function () {
    return utils.randomInt(1, 255) + '.' + utils.randomInt(0, 255) + '.' +
      utils.randomInt(0, 255) + '.' + utils.randomInt(0, 255);
  },

  ipv6: function () {
    return utils.randomInt(1, 0xffff).toString(16) + ':' +
      utils.randomInt(0, 0xffff).toString(16) + ':' +
      utils.randomInt(0, 0xffff).toString(16) + ':' +
      utils.randomInt(0, 0xffff).toString(16) + ':' +
      utils.randomInt(0, 0xffff).toString(16) + ':' +
      utils.randomInt(0, 0xffff).toString(16) + ':' +
      utils.randomInt(0, 0xffff).toString(16) + ':' +
      utils.randomInt(0, 0xffff).toString(16);
  },

  color: function (options) {
    return utils.randomArrayItem(options.data.root.colors);
  },

  hexColor: function (options) {
    var r = utils.randomInt(0, 0xff);
    var g = utils.randomInt(0, 0xff);
    var b = utils.randomInt(0, 0xff);

    if (options.hash.websafe === true) {
      r = Math.round(r / 0x33) * 0x33;
      g = Math.round(g / 0x33) * 0x33;
      b = Math.round(b / 0x33) * 0x33;
    }

    // Ensure that single digit values are padded with leading zeros
    return '#' +
      ('0' + r.toString(16)).slice(-2) +
      ('0' + g.toString(16)).slice(-2) +
      ('0' + b.toString(16)).slice(-2);
  },

  lorem: function (totalWords, options) {
    var ret = '';
    var i, word;
    var isNewSentence = true;
    var lastPunctuationIndex = 0;

    // Juggle the arguments if totalWords wasn't provided
    if (!options) {
      options = totalWords;
      totalWords = 25;
    }

    for (i = 0; i < totalWords; i++) {
      word = utils.randomArrayItem(options.data.root.lorem);

      // If the last iteration triggered a new sentence then capitalize the first letter
      if (isNewSentence) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
        isNewSentence = false;
      }

      // Only introduce new punctuation if we're more then 3 words away from the end,
      // and more than 3 words since the last punctuation, and a 1 in 3 chance.
      if (i < totalWords - 3 && i - lastPunctuationIndex > 3 && utils.random() < 0.3) {
        isNewSentence = utils.random() < 0.6;
        word = word + (isNewSentence ? '.' : ',');
        lastPunctuationIndex = i;
      }

      ret = ret + word + ' ';
    }

    // Add a period/full-stop at the very end
    ret = ret.trimRight() + '.';
    return ret;
  },

  lowercase: function (value) {
    return value.toLowerCase();
  },

  uppercase: function (value) {
    return value.toUpperCase();
  }
};

module.exports = helpers;

},{"./utils":22,"fecha":23,"handlebars":53,"numbro":116,"os":3}],21:[function(require,module,exports){
var titles = [
  'Mr', 'Mrs', 'Dr', 'Prof', 'Lord', 'Lady', 'Sir', 'Madam'
];

var firstNames = [
  'Leanne', 'Edward', 'Haydee', 'Lyle', 'Shea', 'Curtis', 'Roselyn', 'Marcus', 'Lyn', 'Lloyd',
  'Isabelle', 'Francis', 'Olivia', 'Roman', 'Myong', 'Jamie', 'Alexis', 'Vernon', 'Chloe', 'Max',
  'Kirstie', 'Tyler', 'Katelin', 'Alejandro', 'Hannah', 'Gavin', 'Lynetta', 'Russell', 'Neida',
  'Kurt', 'Dannielle', 'Aiden', 'Janett', 'Vaughn', 'Michelle', 'Brian', 'Maisha', 'Theo', 'Emma',
  'Cedric', 'Jocelyn', 'Darrell', 'Grace', 'Ivan', 'Rikki', 'Erik', 'Madeleine', 'Rufus',
  'Florance', 'Raymond', 'Jenette', 'Danny', 'Kathy', 'Michael', 'Layla', 'Rolf', 'Selma', 'Anton',
  'Rosie', 'Craig', 'Victoria', 'Andy', 'Lorelei', 'Drew', 'Yuri', 'Miles', 'Raisa', 'Rico',
  'Rosanne', 'Cory', 'Dori', 'Travis', 'Joslyn', 'Austin', 'Haley', 'Ian', 'Liza', 'Rickey',
  'Susana', 'Stephen', 'Richelle', 'Lance', 'Jetta', 'Heath', 'Juliana', 'Rene', 'Madelyn', 'Stan',
  'Eleanore', 'Jason', 'Alexa', 'Adam', 'Jenna', 'Warren', 'Cecilia', 'Benito', 'Elaine', 'Mitch',
  'Raylene', 'Cyrus'
];

var lastNames = [
  'Flinn', 'Bryd', 'Milligan', 'Keesee', 'Mercer', 'Chapman', 'Zobel', 'Carter', 'Pettey',
  'Starck', 'Raymond', 'Pullman', 'Drolet', 'Higgins', 'Matzen', 'Tindel', 'Winter', 'Charley',
  'Schaefer', 'Hancock', 'Dampier', 'Garling', 'Verde', 'Lenihan', 'Rhymer', 'Pleiman', 'Dunham',
  'Seabury', 'Goudy', 'Latshaw', 'Whitson', 'Cumbie', 'Webster', 'Bourquin', 'Young', 'Rikard',
  'Brier', 'Luck', 'Porras', 'Gilmore', 'Turner', 'Sprowl', 'Rohloff', 'Magby', 'Wallis', 'Mullens',
  'Correa', 'Murphy', 'Connor', 'Gamble', 'Castleman', 'Pace', 'Durrett', 'Bourne', 'Hottle',
  'Oldman', 'Paquette', 'Stine', 'Muldoon', 'Smit', 'Finn', 'Kilmer', 'Sager', 'White', 'Friedrich',
  'Fennell', 'Miers', 'Carroll', 'Freeman', 'Hollis', 'Neal', 'Remus', 'Pickering', 'Woodrum',
  'Bradbury', 'Caffey', 'Tuck', 'Jensen', 'Shelly', 'Hyder', 'Krumm', 'Hundt', 'Seal', 'Pendergast',
  'Kelsey', 'Milling', 'Karst', 'Helland', 'Risley', 'Grieve', 'Paschall', 'Coolidge', 'Furlough',
  'Brandt', 'Cadena', 'Rebelo', 'Leath', 'Backer', 'Bickers', 'Cappel'
];

var companies = [
  'Unilogic', 'Solexis', 'Dalserve', 'Terrasys', 'Pancast', 'Tomiatech', 'Kancom', 'Iridimax',
  'Proline', 'Qualcore', 'Thermatek', 'VTGrafix', 'Sunopia', 'WestGate', 'Chromaton', 'Tecomix',
  'Galcom', 'Zatheon', 'OmniTouch', 'Hivemind', 'MultiServ', 'Citisys', 'Polygan', 'Dynaroc',
  'Storex', 'Britech', 'Thermolock', 'Cryptonica', 'LoopSys', 'ForeTrust', 'TrueXT', 'LexiconLabs',
  'Bellgate', 'Dynalab', 'Logico', 'Terralabs', 'CoreMax', 'Polycore', 'Infracom', 'Coolinga',
  'MultiLingua', 'Conixco', 'QuadNet', 'FortyFour', 'TurboSystems', 'Optiplex', 'Nitrocam',
  'CoreXTS', 'PeerSys', 'FastMart', 'Westercom', 'Templatek', 'Cirpria', 'FastFreight', 'Baramax',
  'Superwire', 'Celmax', 'Connic', 'Forecore', 'SmartSystems', 'Ulogica', 'Seelogic', 'DynaAir',
  'OpenServ', 'Maxcast', 'SixtySix', 'Protheon', 'SkyCenta', 'Eluxa', 'GrafixMedia', 'VenStrategy',
  'Keycast', 'Opticast', 'Cameratek', 'CorpTek', 'Sealine', 'Playtech', 'Anaplex', 'Hypervision',
  'Xenosys', 'Hassifix', 'Infratouch', 'Airconix', 'StrategyLine', 'Helixicon', 'MediaDime',
  'NitroSystems', 'Viewtopia', 'Cryosoft', 'DuoServe', 'Acousticom', 'Freecast', 'CoreRobotics',
  'Quadtek', 'Haltheon', 'TrioSys', 'Amsquare', 'Sophis', 'Keysoft', 'Creatonix'
];

var tlds = [
  'com', 'org', 'net', 'info', 'edu', 'gov', 'co', 'biz', 'name', 'me', 'mobi', 'club', 'xyz', 'eu'
];

var streets = [
  'Warner Street', 'Ceder Avenue', 'Glendale Road', 'Chester Square', 'Beechmont Parkway',
  'Carter Street', 'Hinton Road', 'Pitman Street', 'Winston Road', 'Cottontail Road',
  'Buckley Street', 'Concord Avenue', 'Clemont Street', 'Sleepy Lane', 'Bushey Crescent',
  'Randolph Street', 'Radcliffe Road', 'Canal Street', 'Ridgewood Drive', 'Highland Drive',
  'Orchard Road', 'Foster Walk', 'Walford Way', 'Harrington Crescent', 'Emmet Road',
  'Berkeley Street', 'Clarendon Street', 'Sherman Road', 'Mount Street', 'Hunter Street',
  'Pearl Street', 'Barret Street', 'Taylor Street', 'Shaftsbury Avenue', 'Paxton Street',
  'Park Avenue', 'Seaside Drive', 'Tavistock Place', 'Prospect Place', 'Harvard Avenue',
  'Elton Way', 'Green Street', 'Appleton Street', 'Banner Street', 'Piermont Drive', 'Brook Street',
  'Main Street', 'Fairmont Avenue', 'Arlington Road', 'Rutherford Street', 'Windsor Avenue',
  'Maple Street', 'Wandle Street', 'Grosvenor Square', 'Hunt Street', 'Haredale Road',
  'Glenn Drive', 'Mulholland Drive', 'Baker Street', 'Fuller Road', 'Coleman Avenue', 'Wall Street',
  'Robinson Street', 'Blakeley Street', 'Alexander Avenue', 'Gartland Street', 'Wooster Road',
  'Brentwood Drive', 'Colwood Place', 'Rivington Street', 'Bramble Lane', 'Hartswood Road',
  'Albion Place', 'Waverton Street', 'Sawmill Lane', 'Templeton Parkway', 'Hill Street',
  'Marsham Street', 'Stockton Lane', 'Lake Drive', 'Elm Street', 'Winchester Drive',
  'Crockett Street', 'High Street', 'Longford Crescent', 'Moreland Street', 'Sterling Street',
  'Golden Lane', 'Mercer Street', 'Dunstable Street', 'Chestnut Walk', 'Rutland Drive',
  'Buckfield Lane', 'Pembrooke Street', 'Tower Lane', 'Willow Avenue', 'Faraday Street',
  'Springfield Street', 'Crawford Street', 'Hudson Street'
];

var cities = [
  'Beaverton', 'Stanford', 'Baltimore', 'Newcastle', 'Halifax', 'Rockhampton', 'Coventry',
  'Medford', 'Boulder', 'Dover', 'Waterbury', 'Christchurch', 'Manchester', 'Perth', 'Norwich',
  'Redmond', 'Plymouth', 'Tacoma', 'Newport', 'Bradford', 'Aspen', 'Wellington', 'Oakland',
  'Norfolk', 'Durham', 'Portsmouth', 'Detroit', 'Portland', 'Northampton', 'Dayton', 'Charleston',
  'Irvine', 'Dallas', 'Albany', 'Petersburg', 'Melbourne', 'Southampton', 'Stafford', 'Bridgeport',
  'Fairfield', 'Dundee', 'Spokane', 'Oakleigh', 'Bristol', 'Sacramento', 'Sheffield', 'Lewisburg',
  'Miami', 'Brisbane', 'Denver', 'Kingston', 'Burwood', 'Rochester', 'Fresno', 'Cardiff',
  'Auckland', 'Sudbury', 'Hastings', 'Reno', 'Hillboro', 'Palmerston', 'Oxford', 'Hobart',
  'Atlanta', 'Wilmington', 'Vancouver', 'Youngstown', 'Hartford', 'London', 'Danbury', 'Birmingham',
  'Columbia', 'Dublin', 'Chicago', 'Toronto', 'Orlando', 'Toledo', 'Pheonix', 'Bakersfield',
  'Nottingham', 'Newark', 'Fargo', 'Walkerville', 'Exeter', 'Woodville', 'Greenville', 'Frankston',
  'Bangor', 'Seattle', 'Canterbury', 'Colchester', 'Boston', 'York', 'Cambridge', 'Brighton',
  'Lancaster', 'Adelaide', 'Cleveland', 'Telford', 'Richmond'
];

var countries = [
  'Andorra', 'United Arab Emirates', 'Afghanistan', 'Antigua and Barbuda', 'Anguilla', 'Albania',
  'Armenia', 'Angola', 'Antarctica', 'Argentina', 'American Samoa', 'Austria', 'Australia', 'Aruba',
  'Åland Islands', 'Azerbaijan', 'Bosnia and Herzegovina', 'Barbados', 'Bangladesh', 'Belgium',
  'Burkina Faso', 'Bulgaria', 'Bahrain', 'Burundi', 'Benin', 'Saint Barthélemy', 'Bermuda',
  'Brunei Darussalam', 'Bolivia, Plurinational State of', 'Bonaire, Sint Eustatius and Saba',
  'Brazil', 'Bahamas', 'Bhutan', 'Bouvet Island', 'Botswana', 'Belarus', 'Belize', 'Canada',
  'Cocos (Keeling) Islands', 'Congo, the Democratic Republic of the', 'Central African Republic',
  'Congo', 'Switzerland', 'Côte d\'Ivoire', 'Cook Islands', 'Chile', 'Cameroon', 'China',
  'Colombia', 'Costa Rica', 'Cuba', 'Cabo Verde', 'Curaçao', 'Christmas Island', 'Cyprus',
  'Czech Republic', 'Germany', 'Djibouti', 'Denmark', 'Dominica', 'Dominican Republic', 'Algeria',
  'Ecuador', 'Estonia', 'Egypt', 'Western Sahara', 'Eritrea', 'Spain', 'Ethiopia', 'Finland',
  'Fiji', 'Falkland Islands (Malvinas)', 'Micronesia, Federated States of', 'Faroe Islands',
  'France', 'Gabon', 'United Kingdom of Great Britain and Northern Ireland', 'Grenada', 'Georgia',
  'French Guiana', 'Guernsey', 'Ghana', 'Gibraltar', 'Greenland', 'Gambia', 'Guinea', 'Guadeloupe',
  'Equatorial Guinea', 'Greece', 'South Georgia and the South Sandwich Islands', 'Guatemala',
  'Guam', 'Guinea-Bissau', 'Guyana', 'Hong Kong', 'Heard Island and McDonald Islands', 'Honduras',
  'Croatia', 'Haiti', 'Hungary', 'Indonesia', 'Ireland', 'Israel', 'Isle of Man', 'India',
  'British Indian Ocean Territory', 'Iraq', 'Iran, Islamic Republic of', 'Iceland', 'Italy',
  'Jersey', 'Jamaica', 'Jordan', 'Japan', 'Kenya', 'Kyrgyzstan', 'Cambodia', 'Kiribati', 'Comoros',
  'Saint Kitts and Nevis', 'Korea, Democratic People\'s Republic of', 'Korea, Republic of',
  'Kuwait', 'Cayman Islands', 'Kazakhstan', 'Lao People\'s Democratic Republic', 'Lebanon',
  'Saint Lucia', 'Liechtenstein', 'Sri Lanka', 'Liberia', 'Lesotho', 'Lithuania', 'Luxembourg',
  'Latvia', 'Libya', 'Morocco', 'Monaco', 'Moldova, Republic of', 'Montenegro',
  'Saint Martin (French part)', 'Madagascar', 'Marshall Islands',
  'Macedonia, the former Yugoslav Republic of', 'Mali', 'Myanmar', 'Mongolia', 'Macao',
  'Northern Mariana Islands', 'Martinique', 'Mauritania', 'Montserrat', 'Malta', 'Mauritius',
  'Maldives', 'Malawi', 'Mexico', 'Malaysia', 'Mozambique', 'Namibia', 'New Caledonia', 'Niger',
  'Norfolk Island', 'Nigeria', 'Nicaragua', 'Netherlands', 'Norway', 'Nepal', 'Nauru', 'Niue',
  'New Zealand', 'Oman', 'Panama', 'Peru', 'French Polynesia', 'Papua New Guinea', 'Philippines',
  'Pakistan', 'Poland', 'Saint Pierre and Miquelon', 'Pitcairn', 'Puerto Rico',
  'Palestine, State of', 'Portugal', 'Palau', 'Paraguay', 'Qatar', 'Réunion', 'Romania', 'Serbia',
  'Russian Federation', 'Rwanda', 'Saudi Arabia', 'Solomon Islands', 'Seychelles', 'Sudan',
  'Sweden', 'Singapore', 'Saint Helena, Ascension and Tristan da Cunha', 'Slovenia',
  'Svalbard and Jan Mayen', 'Slovakia', 'Sierra Leone', 'San Marino', 'Senegal', 'Somalia',
  'Suriname', 'South Sudan', 'Sao Tome and Principe', 'El Salvador', 'Sint Maarten (Dutch part)',
  'Syrian Arab Republic', 'Swaziland', 'Turks and Caicos Islands', 'Chad',
  'French Southern Territories', 'Togo', 'Thailand', 'Tajikistan', 'Tokelau', 'Timor-Leste',
  'Turkmenistan', 'Tunisia', 'Tonga', 'Turkey', 'Trinidad and Tobago', 'Tuvalu',
  'Taiwan, Province of China', 'Tanzania, United Republic of', 'Ukraine', 'Uganda',
  'United States Minor Outlying Islands', 'United States of America', 'Uruguay', 'Uzbekistan',
  'Holy See', 'Saint Vincent and the Grenadines', 'Venezuela, Bolivarian Republic of',
  'Virgin Islands, British', 'Virgin Islands, U.S.', 'Viet Nam', 'Vanuatu', 'Wallis and Futuna',
  'Samoa', 'Yemen', 'Mayotte', 'South Africa', 'Zambia', 'Zimbabwe'
];

var countryCodes = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
  'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
  'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
  'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
  'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
  'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
  'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
  'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
  'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
  'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
  'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
  'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
  'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
  'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
];

var colors = [
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black',
  'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse',
  'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan',
  'darkgoldenrod', 'darkgray', 'darkgreen', 'darkkhaki', 'darkmagenta', 'darkolivegreen',
  'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue',
  'darkslategray', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray',
  'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite',
  'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo',
  'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
  'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightpink',
  'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightsteelblue', 'lightyellow',
  'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue',
  'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen',
  'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin',
  'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid',
  'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru',
  'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue',
  'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue',
  'slateblue', 'slategray', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato',
  'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'
];

var lorem = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'morbi',
  'vulputate', 'eros', 'ut', 'mi', 'laoreet', 'viverra', 'nunc', 'lacinia', 'non', 'condimentum',
  'aenean', 'lacus', 'nisl', 'auctor', 'at', 'tortor', 'ac', 'fringilla', 'sodales', 'pretium',
  'quis', 'iaculis', 'in', 'aliquam', 'ultrices', 'felis', 'accumsan', 'ornare', 'etiam',
  'elementum', 'aliquet', 'finibus', 'maecenas', 'dignissim', 'vel', 'blandit', 'placerat', 'sed',
  'tempor', 'ex', 'faucibus', 'velit', 'nam', 'erat', 'augue', 'quisque', 'nulla', 'maximus',
  'vitae', 'e', 'lobortis', 'euismod', 'tristique', 'metus', 'vehicula', 'purus', 'diam', 'mollis',
  'neque', 'eu', 'porttitor', 'mauris', 'a', 'risus', 'orci', 'tincidunt', 'scelerisque',
  'vestibulum', 'dui', 'ante', 'posuere', 'turpis', 'enim', 'cras', 'massa', 'cursus', 'suscipit',
  'tempus', 'facilisis', 'ultricies', 'i', 'eget', 'imperdiet', 'donec', 'arcu', 'ligula',
  'sagittis', 'hendrerit', 'justo', 'pellentesque', 'mattis', 'lacinia', 'leo', 'est', 'magna',
  'nibh', 'sem', 'natoque', 'consequat', 'proin', 'eti', 'commodo', 'rhoncus', 'dictum', 'id',
  'pharetra', 'sapien', 'gravida', 'sollicitudin', 'curabitur', 'au', 'nisi', 'bibendum', 'lectus',
  'et', 'pulvinar'
];

module.exports = {
  titles: titles,
  firstNames: firstNames,
  lastNames: lastNames,
  companies: companies,
  tlds: tlds,
  streets: streets,
  cities: cities,
  countries: countries,
  countryCodes: countryCodes,
  colors: colors,
  lorem: lorem
};

},{}],22:[function(require,module,exports){
var seedrandom = require('seedrandom');

// Create an instance of the prng without a seed (so it'll be a random sequence every time)
var prng = seedrandom();

var utils = {
  setRandomSeed: function (seed) {
    prng = seedrandom(seed);
  },

  random: function () {
    return prng();
  },

  randomInt: function (min, max) {
    return Math.floor(utils.random() * (max - min + 1)) + min;
  },

  randomFloat: function (min, max) {
    return utils.random() * (max - min) + min;
  },

  randomBoolean: function () {
    return utils.random() < 0.5;
  },

  randomDate: function (min, max) {
    // We add the timezone offset to avoid the date falling outside the supplied range
    var d = new Date(Math.floor(utils.random() * (max - min)) + min);
    d.setTime(d.getTime() + d.getTimezoneOffset() * 60000);
    return d;
  },

  randomArrayItem: function (array) {
    return array[utils.randomInt(0, array.length - 1)];
  },

  randomChar: function (charset) {
    charset = charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return charset.charAt(utils.randomInt(0, charset.length - 1));
  }
};

module.exports = utils;

},{"seedrandom":118}],23:[function(require,module,exports){
(function (main) {
  'use strict';

  /**
   * Parse or format dates
   * @class fecha
   */
  var fecha = {},
    token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g,
    dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    amPm = ['am', 'pm'],
    twoDigits = /\d\d?/, threeDigits = /\d{3}/, fourDigits = /\d{4}/,
    word = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
    noop = function () {},
    dayNamesShort, monthNamesShort,
    parseFlags = {
      D: [twoDigits, function (d, v) {
        d.day = v;
      }],
      M: [twoDigits, function (d, v) {
        d.month = v - 1;
      }],
      YY: [twoDigits, function (d, v) {
        var da = new Date(), cent = +('' + da.getFullYear()).substr(0, 2);
        d.year = '' + (v > 68 ? cent - 1 : cent) + v;
      }],
      h: [twoDigits, function (d, v) {
        d.hour = v;
      }],
      m: [twoDigits, function (d, v) {
        d.minute = v;
      }],
      s: [twoDigits, function (d, v) {
        d.second = v;
      }],
      YYYY: [fourDigits, function (d, v) {
        d.year = v;
      }],
      S: [/\d/, function (d, v) {
        d.millisecond = v * 100;
      }],
      SS: [/\d{2}/, function (d, v) {
        d.millisecond = v * 10;
      }],
      SSS: [threeDigits, function (d, v) {
        d.millisecond = v;
      }],
      d: [twoDigits, noop],
      ddd: [word, noop],
      MMM: [word, monthUpdate('monthNamesShort')],
      MMMM: [word, monthUpdate('monthNames')],
      a: [word, function (d, v) {
        var val = v.toLowerCase();
        if (val === amPm[0]) {
          d.isPm = false;
        } else if (val === amPm[1]) {
          d.isPm = true;
        }
      }],
      ZZ: [/[\+\-]\d\d:?\d\d/, function (d, v) {
        var parts = (v + '').match(/([\+\-]|\d\d)/gi), minutes;

        if (parts) {
          minutes = +(parts[1] * 60) + parseInt(parts[2], 10);
          d.timezoneOffset = parts[0] === '+' ? minutes : -minutes;
        }

      }]
    };
  parseFlags.dd = parseFlags.d;
  parseFlags.dddd = parseFlags.ddd;
  parseFlags.Do = parseFlags.DD = parseFlags.D;
  parseFlags.mm = parseFlags.m;
  parseFlags.hh = parseFlags.H = parseFlags.HH = parseFlags.h;
  parseFlags.MM = parseFlags.M;
  parseFlags.ss = parseFlags.s;
  parseFlags.A = parseFlags.a;

  monthNamesShort = shorten(monthNames, 3);
  dayNamesShort = shorten(dayNames, 3);

  function monthUpdate(arrName) {
    return function (d, v) {
      var index = fecha.i18n[arrName].indexOf(v.charAt(0).toUpperCase() + v.substr(1).toLowerCase());
      if (~index) {
        d.month = index;
      }
    }
  }

  function pad(val, len) {
    val = String(val);
    len = len || 2;
    while (val.length < len) {
      val = '0' + val;
    }
    return val;
  }

  function shorten(arr, sLen) {
    var newArr = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      newArr.push(arr[i].substr(0, sLen));
    }
    return newArr;
  }

  function DoFn(D) {
    return D + ['th', 'st', 'nd', 'rd'][D % 10 > 3 ? 0 : (D - D % 10 !== 10) * D % 10];
  }

  fecha.i18n = {
    dayNamesShort: dayNamesShort,
    dayNames: dayNames,
    monthNamesShort: monthNamesShort,
    monthNames: monthNames,
    amPm: amPm,
    DoFn: DoFn
  };

  // Some common format strings
  fecha.masks = {
    'default': 'ddd MMM DD YYYY HH:mm:ss',
    shortDate: 'M/D/YY',
    mediumDate: 'MMM D, YYYY',
    longDate: 'MMMM D, YYYY',
    fullDate: 'dddd, MMMM D, YYYY',
    shortTime: 'HH:mm',
    mediumTime: 'HH:mm:ss',
    longTime: 'HH:mm:ss.SSS'
  };

  /***
   * Format a date
   * @method format
   * @param {Date|number} dateObj
   * @param {string} mask Format of the date, i.e. 'mm-dd-yy' or 'shortDate'
   */
  fecha.format = function (dateObj, mask) {
    if (typeof dateObj === 'number') {
      dateObj = new Date(dateObj);
    }

    if (!dateObj || typeof dateObj !== 'object' && typeof dateObj.getDate !== 'function') {
      throw new Error('Invalid Date in fecha.format');
    }

    mask = fecha.masks[mask] || mask || fecha.masks['default'];

    var D = dateObj.getDate(),
      d = dateObj.getDay(),
      M = dateObj.getMonth(),
      y = dateObj.getFullYear(),
      H = dateObj.getHours(),
      m = dateObj.getMinutes(),
      s = dateObj.getSeconds(),
      S = dateObj.getMilliseconds(),
      o = dateObj.getTimezoneOffset(),
      flags = {
        D: D,
        DD: pad(D),
        Do: fecha.i18n.DoFn(D),
        d: d,
        dd: pad(d),
        ddd: fecha.i18n.dayNamesShort[d],
        dddd: fecha.i18n.dayNames[d],
        M: M + 1,
        MM: pad(M + 1),
        MMM: fecha.i18n.monthNamesShort[M],
        MMMM: fecha.i18n.monthNames[M],
        YY: String(y).slice(2),
        YYYY: y,
        h: H % 12 || 12,
        hh: pad(H % 12 || 12),
        H: H,
        HH: pad(H),
        m: m,
        mm: pad(m),
        s: s,
        ss: pad(s),
        S: Math.round(S / 100),
        SS: pad(Math.round(S / 10), 2),
        SSS: pad(S, 3),
        a: H < 12 ? fecha.i18n.amPm[0] : fecha.i18n.amPm[1],
        A: H < 12 ? fecha.i18n.amPm[0].toUpperCase() : fecha.i18n.amPm[1].toUpperCase(),
        ZZ: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4)
      };

    return mask.replace(token, function ($0) {
      return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
  };

  /**
   * Parse a date string into an object, changes - into /
   * @method parse
   * @param {string} dateStr Date string
   * @param {string} format Date parse format
   * @returns {Date|boolean}
   */
  fecha.parse = function (dateStr, format) {
    var isValid, dateInfo, today, date, info, index;

    if (typeof format !== 'string') {
      throw new Error('Invalid format in fecha.parse');
    }

    format = fecha.masks[format] || format;

    // Avoid regular expression denial of service, fail early for really long strings
    // https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS
    if (dateStr.length > 1000) {
      return false;
    }

    isValid = true;
    dateInfo = {};
    format.replace(token, function ($0) {
      if (parseFlags[$0]) {
        info = parseFlags[$0];
        index = dateStr.search(info[0]);
        if (!~index) {
          isValid = false;
        } else {
          dateStr.replace(info[0], function (result) {
            info[1](dateInfo, result);
            dateStr = dateStr.substr(index + result.length);
            return result;
          });
        }
      }

      return parseFlags[$0] ? '' : $0.slice(1, $0.length - 1);
    });

    if (!isValid) {
      return false;
    }

    today = new Date();
    if (dateInfo.isPm === true && dateInfo.hour != null && +dateInfo.hour !== 12) {
      dateInfo.hour = +dateInfo.hour + 12;
    } else if (dateInfo.isPm === false && +dateInfo.hour === 12) {
      dateInfo.hour = 0;
    }

    if (dateInfo.timezoneOffset != null) {
      dateInfo.minute = +(dateInfo.minute || 0) - +dateInfo.timezoneOffset;
      date = new Date(Date.UTC(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1,
        dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0));
    } else {
      date = new Date(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1,
        dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0);
    }
    return date;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = fecha;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return fecha;
    });
  } else {
    main.fecha = fecha;
  }
})(this);

},{}],24:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _handlebarsRuntime = require('./handlebars.runtime');

var _handlebarsRuntime2 = _interopRequireDefault(_handlebarsRuntime);

// Compiler imports

var _handlebarsCompilerAst = require('./handlebars/compiler/ast');

var _handlebarsCompilerAst2 = _interopRequireDefault(_handlebarsCompilerAst);

var _handlebarsCompilerBase = require('./handlebars/compiler/base');

var _handlebarsCompilerCompiler = require('./handlebars/compiler/compiler');

var _handlebarsCompilerJavascriptCompiler = require('./handlebars/compiler/javascript-compiler');

var _handlebarsCompilerJavascriptCompiler2 = _interopRequireDefault(_handlebarsCompilerJavascriptCompiler);

var _handlebarsCompilerVisitor = require('./handlebars/compiler/visitor');

var _handlebarsCompilerVisitor2 = _interopRequireDefault(_handlebarsCompilerVisitor);

var _handlebarsNoConflict = require('./handlebars/no-conflict');

var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

var _create = _handlebarsRuntime2['default'].create;
function create() {
  var hb = _create();

  hb.compile = function (input, options) {
    return _handlebarsCompilerCompiler.compile(input, options, hb);
  };
  hb.precompile = function (input, options) {
    return _handlebarsCompilerCompiler.precompile(input, options, hb);
  };

  hb.AST = _handlebarsCompilerAst2['default'];
  hb.Compiler = _handlebarsCompilerCompiler.Compiler;
  hb.JavaScriptCompiler = _handlebarsCompilerJavascriptCompiler2['default'];
  hb.Parser = _handlebarsCompilerBase.parser;
  hb.parse = _handlebarsCompilerBase.parse;

  return hb;
}

var inst = create();
inst.create = create;

_handlebarsNoConflict2['default'](inst);

inst.Visitor = _handlebarsCompilerVisitor2['default'];

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];


},{"./handlebars.runtime":25,"./handlebars/compiler/ast":27,"./handlebars/compiler/base":28,"./handlebars/compiler/compiler":30,"./handlebars/compiler/javascript-compiler":32,"./handlebars/compiler/visitor":35,"./handlebars/no-conflict":49}],25:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _handlebarsBase = require('./handlebars/base');

var base = _interopRequireWildcard(_handlebarsBase);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)

var _handlebarsSafeString = require('./handlebars/safe-string');

var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);

var _handlebarsException = require('./handlebars/exception');

var _handlebarsException2 = _interopRequireDefault(_handlebarsException);

var _handlebarsUtils = require('./handlebars/utils');

var Utils = _interopRequireWildcard(_handlebarsUtils);

var _handlebarsRuntime = require('./handlebars/runtime');

var runtime = _interopRequireWildcard(_handlebarsRuntime);

var _handlebarsNoConflict = require('./handlebars/no-conflict');

var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = _handlebarsSafeString2['default'];
  hb.Exception = _handlebarsException2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_handlebarsNoConflict2['default'](inst);

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];


},{"./handlebars/base":26,"./handlebars/exception":39,"./handlebars/no-conflict":49,"./handlebars/runtime":50,"./handlebars/safe-string":51,"./handlebars/utils":52}],26:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('./utils');

var _exception = require('./exception');

var _exception2 = _interopRequireDefault(_exception);

var _helpers = require('./helpers');

var _decorators = require('./decorators');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var VERSION = '4.0.10';
exports.VERSION = VERSION;
var COMPILER_REVISION = 7;

exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1',
  7: '>= 4.0.0'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials, decorators) {
  this.helpers = helpers || {};
  this.partials = partials || {};
  this.decorators = decorators || {};

  _helpers.registerDefaultHelpers(this);
  _decorators.registerDefaultDecorators(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: _logger2['default'],
  log: _logger2['default'].log,

  registerHelper: function registerHelper(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple helpers');
      }
      _utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (_utils.toString.call(name) === objectType) {
      _utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  },

  registerDecorator: function registerDecorator(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple decorators');
      }
      _utils.extend(this.decorators, name);
    } else {
      this.decorators[name] = fn;
    }
  },
  unregisterDecorator: function unregisterDecorator(name) {
    delete this.decorators[name];
  }
};

var log = _logger2['default'].log;

exports.log = log;
exports.createFrame = _utils.createFrame;
exports.logger = _logger2['default'];


},{"./decorators":37,"./exception":39,"./helpers":40,"./logger":48,"./utils":52}],27:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var AST = {
  // Public API used to evaluate derived attributes regarding AST nodes
  helpers: {
    // a mustache is definitely a helper if:
    // * it is an eligible helper, and
    // * it has at least one parameter or hash segment
    helperExpression: function helperExpression(node) {
      return node.type === 'SubExpression' || (node.type === 'MustacheStatement' || node.type === 'BlockStatement') && !!(node.params && node.params.length || node.hash);
    },

    scopedId: function scopedId(path) {
      return (/^\.|this\b/.test(path.original)
      );
    },

    // an ID is simple if it only has one part, and that part is not
    // `..` or `this`.
    simpleId: function simpleId(path) {
      return path.parts.length === 1 && !AST.helpers.scopedId(path) && !path.depth;
    }
  }
};

// Must be exported as an object rather than the root of the module as the jison lexer
// must modify the object to operate properly.
exports['default'] = AST;
module.exports = exports['default'];


},{}],28:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.parse = parse;
// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _whitespaceControl = require('./whitespace-control');

var _whitespaceControl2 = _interopRequireDefault(_whitespaceControl);

var _helpers = require('./helpers');

var Helpers = _interopRequireWildcard(_helpers);

var _utils = require('../utils');

exports.parser = _parser2['default'];

var yy = {};
_utils.extend(yy, Helpers);

function parse(input, options) {
  // Just return if an already-compiled AST was passed in.
  if (input.type === 'Program') {
    return input;
  }

  _parser2['default'].yy = yy;

  // Altering the shared object here, but this is ok as parser is a sync operation
  yy.locInfo = function (locInfo) {
    return new yy.SourceLocation(options && options.srcName, locInfo);
  };

  var strip = new _whitespaceControl2['default'](options);
  return strip.accept(_parser2['default'].parse(input));
}


},{"../utils":52,"./helpers":31,"./parser":33,"./whitespace-control":36}],29:[function(require,module,exports){
/* global define */
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

var SourceNode = undefined;

try {
  /* istanbul ignore next */
  if (typeof define !== 'function' || !define.amd) {
    // We don't support this in AMD environments. For these environments, we asusme that
    // they are running on the browser and thus have no need for the source-map library.
    var SourceMap = require('source-map');
    SourceNode = SourceMap.SourceNode;
  }
} catch (err) {}
/* NOP */

/* istanbul ignore if: tested but not covered in istanbul due to dist build  */
if (!SourceNode) {
  SourceNode = function (line, column, srcFile, chunks) {
    this.src = '';
    if (chunks) {
      this.add(chunks);
    }
  };
  /* istanbul ignore next */
  SourceNode.prototype = {
    add: function add(chunks) {
      if (_utils.isArray(chunks)) {
        chunks = chunks.join('');
      }
      this.src += chunks;
    },
    prepend: function prepend(chunks) {
      if (_utils.isArray(chunks)) {
        chunks = chunks.join('');
      }
      this.src = chunks + this.src;
    },
    toStringWithSourceMap: function toStringWithSourceMap() {
      return { code: this.toString() };
    },
    toString: function toString() {
      return this.src;
    }
  };
}

function castChunk(chunk, codeGen, loc) {
  if (_utils.isArray(chunk)) {
    var ret = [];

    for (var i = 0, len = chunk.length; i < len; i++) {
      ret.push(codeGen.wrap(chunk[i], loc));
    }
    return ret;
  } else if (typeof chunk === 'boolean' || typeof chunk === 'number') {
    // Handle primitives that the SourceNode will throw up on
    return chunk + '';
  }
  return chunk;
}

function CodeGen(srcFile) {
  this.srcFile = srcFile;
  this.source = [];
}

CodeGen.prototype = {
  isEmpty: function isEmpty() {
    return !this.source.length;
  },
  prepend: function prepend(source, loc) {
    this.source.unshift(this.wrap(source, loc));
  },
  push: function push(source, loc) {
    this.source.push(this.wrap(source, loc));
  },

  merge: function merge() {
    var source = this.empty();
    this.each(function (line) {
      source.add(['  ', line, '\n']);
    });
    return source;
  },

  each: function each(iter) {
    for (var i = 0, len = this.source.length; i < len; i++) {
      iter(this.source[i]);
    }
  },

  empty: function empty() {
    var loc = this.currentLocation || { start: {} };
    return new SourceNode(loc.start.line, loc.start.column, this.srcFile);
  },
  wrap: function wrap(chunk) {
    var loc = arguments.length <= 1 || arguments[1] === undefined ? this.currentLocation || { start: {} } : arguments[1];

    if (chunk instanceof SourceNode) {
      return chunk;
    }

    chunk = castChunk(chunk, this, loc);

    return new SourceNode(loc.start.line, loc.start.column, this.srcFile, chunk);
  },

  functionCall: function functionCall(fn, type, params) {
    params = this.generateList(params);
    return this.wrap([fn, type ? '.' + type + '(' : '(', params, ')']);
  },

  quotedString: function quotedString(str) {
    return '"' + (str + '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028') // Per Ecma-262 7.3 + 7.8.4
    .replace(/\u2029/g, '\\u2029') + '"';
  },

  objectLiteral: function objectLiteral(obj) {
    var pairs = [];

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var value = castChunk(obj[key], this);
        if (value !== 'undefined') {
          pairs.push([this.quotedString(key), ':', value]);
        }
      }
    }

    var ret = this.generateList(pairs);
    ret.prepend('{');
    ret.add('}');
    return ret;
  },

  generateList: function generateList(entries) {
    var ret = this.empty();

    for (var i = 0, len = entries.length; i < len; i++) {
      if (i) {
        ret.add(',');
      }

      ret.add(castChunk(entries[i], this));
    }

    return ret;
  },

  generateArray: function generateArray(entries) {
    var ret = this.generateList(entries);
    ret.prepend('[');
    ret.add(']');

    return ret;
  }
};

exports['default'] = CodeGen;
module.exports = exports['default'];


},{"../utils":52,"source-map":126}],30:[function(require,module,exports){
/* eslint-disable new-cap */

'use strict';

exports.__esModule = true;
exports.Compiler = Compiler;
exports.precompile = precompile;
exports.compile = compile;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

var _utils = require('../utils');

var _ast = require('./ast');

var _ast2 = _interopRequireDefault(_ast);

var slice = [].slice;

function Compiler() {}

// the foundHelper register will disambiguate helper lookup from finding a
// function in a context. This is necessary for mustache compatibility, which
// requires that context functions in blocks are evaluated by blockHelperMissing,
// and then proceed as if the resulting value was provided to blockHelperMissing.

Compiler.prototype = {
  compiler: Compiler,

  equals: function equals(other) {
    var len = this.opcodes.length;
    if (other.opcodes.length !== len) {
      return false;
    }

    for (var i = 0; i < len; i++) {
      var opcode = this.opcodes[i],
          otherOpcode = other.opcodes[i];
      if (opcode.opcode !== otherOpcode.opcode || !argEquals(opcode.args, otherOpcode.args)) {
        return false;
      }
    }

    // We know that length is the same between the two arrays because they are directly tied
    // to the opcode behavior above.
    len = this.children.length;
    for (var i = 0; i < len; i++) {
      if (!this.children[i].equals(other.children[i])) {
        return false;
      }
    }

    return true;
  },

  guid: 0,

  compile: function compile(program, options) {
    this.sourceNode = [];
    this.opcodes = [];
    this.children = [];
    this.options = options;
    this.stringParams = options.stringParams;
    this.trackIds = options.trackIds;

    options.blockParams = options.blockParams || [];

    // These changes will propagate to the other compiler components
    var knownHelpers = options.knownHelpers;
    options.knownHelpers = {
      'helperMissing': true,
      'blockHelperMissing': true,
      'each': true,
      'if': true,
      'unless': true,
      'with': true,
      'log': true,
      'lookup': true
    };
    if (knownHelpers) {
      for (var _name in knownHelpers) {
        /* istanbul ignore else */
        if (_name in knownHelpers) {
          this.options.knownHelpers[_name] = knownHelpers[_name];
        }
      }
    }

    return this.accept(program);
  },

  compileProgram: function compileProgram(program) {
    var childCompiler = new this.compiler(),
        // eslint-disable-line new-cap
    result = childCompiler.compile(program, this.options),
        guid = this.guid++;

    this.usePartial = this.usePartial || result.usePartial;

    this.children[guid] = result;
    this.useDepths = this.useDepths || result.useDepths;

    return guid;
  },

  accept: function accept(node) {
    /* istanbul ignore next: Sanity code */
    if (!this[node.type]) {
      throw new _exception2['default']('Unknown type: ' + node.type, node);
    }

    this.sourceNode.unshift(node);
    var ret = this[node.type](node);
    this.sourceNode.shift();
    return ret;
  },

  Program: function Program(program) {
    this.options.blockParams.unshift(program.blockParams);

    var body = program.body,
        bodyLength = body.length;
    for (var i = 0; i < bodyLength; i++) {
      this.accept(body[i]);
    }

    this.options.blockParams.shift();

    this.isSimple = bodyLength === 1;
    this.blockParams = program.blockParams ? program.blockParams.length : 0;

    return this;
  },

  BlockStatement: function BlockStatement(block) {
    transformLiteralToPath(block);

    var program = block.program,
        inverse = block.inverse;

    program = program && this.compileProgram(program);
    inverse = inverse && this.compileProgram(inverse);

    var type = this.classifySexpr(block);

    if (type === 'helper') {
      this.helperSexpr(block, program, inverse);
    } else if (type === 'simple') {
      this.simpleSexpr(block);

      // now that the simple mustache is resolved, we need to
      // evaluate it by executing `blockHelperMissing`
      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);
      this.opcode('emptyHash');
      this.opcode('blockValue', block.path.original);
    } else {
      this.ambiguousSexpr(block, program, inverse);

      // now that the simple mustache is resolved, we need to
      // evaluate it by executing `blockHelperMissing`
      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);
      this.opcode('emptyHash');
      this.opcode('ambiguousBlockValue');
    }

    this.opcode('append');
  },

  DecoratorBlock: function DecoratorBlock(decorator) {
    var program = decorator.program && this.compileProgram(decorator.program);
    var params = this.setupFullMustacheParams(decorator, program, undefined),
        path = decorator.path;

    this.useDecorators = true;
    this.opcode('registerDecorator', params.length, path.original);
  },

  PartialStatement: function PartialStatement(partial) {
    this.usePartial = true;

    var program = partial.program;
    if (program) {
      program = this.compileProgram(partial.program);
    }

    var params = partial.params;
    if (params.length > 1) {
      throw new _exception2['default']('Unsupported number of partial arguments: ' + params.length, partial);
    } else if (!params.length) {
      if (this.options.explicitPartialContext) {
        this.opcode('pushLiteral', 'undefined');
      } else {
        params.push({ type: 'PathExpression', parts: [], depth: 0 });
      }
    }

    var partialName = partial.name.original,
        isDynamic = partial.name.type === 'SubExpression';
    if (isDynamic) {
      this.accept(partial.name);
    }

    this.setupFullMustacheParams(partial, program, undefined, true);

    var indent = partial.indent || '';
    if (this.options.preventIndent && indent) {
      this.opcode('appendContent', indent);
      indent = '';
    }

    this.opcode('invokePartial', isDynamic, partialName, indent);
    this.opcode('append');
  },
  PartialBlockStatement: function PartialBlockStatement(partialBlock) {
    this.PartialStatement(partialBlock);
  },

  MustacheStatement: function MustacheStatement(mustache) {
    this.SubExpression(mustache);

    if (mustache.escaped && !this.options.noEscape) {
      this.opcode('appendEscaped');
    } else {
      this.opcode('append');
    }
  },
  Decorator: function Decorator(decorator) {
    this.DecoratorBlock(decorator);
  },

  ContentStatement: function ContentStatement(content) {
    if (content.value) {
      this.opcode('appendContent', content.value);
    }
  },

  CommentStatement: function CommentStatement() {},

  SubExpression: function SubExpression(sexpr) {
    transformLiteralToPath(sexpr);
    var type = this.classifySexpr(sexpr);

    if (type === 'simple') {
      this.simpleSexpr(sexpr);
    } else if (type === 'helper') {
      this.helperSexpr(sexpr);
    } else {
      this.ambiguousSexpr(sexpr);
    }
  },
  ambiguousSexpr: function ambiguousSexpr(sexpr, program, inverse) {
    var path = sexpr.path,
        name = path.parts[0],
        isBlock = program != null || inverse != null;

    this.opcode('getContext', path.depth);

    this.opcode('pushProgram', program);
    this.opcode('pushProgram', inverse);

    path.strict = true;
    this.accept(path);

    this.opcode('invokeAmbiguous', name, isBlock);
  },

  simpleSexpr: function simpleSexpr(sexpr) {
    var path = sexpr.path;
    path.strict = true;
    this.accept(path);
    this.opcode('resolvePossibleLambda');
  },

  helperSexpr: function helperSexpr(sexpr, program, inverse) {
    var params = this.setupFullMustacheParams(sexpr, program, inverse),
        path = sexpr.path,
        name = path.parts[0];

    if (this.options.knownHelpers[name]) {
      this.opcode('invokeKnownHelper', params.length, name);
    } else if (this.options.knownHelpersOnly) {
      throw new _exception2['default']('You specified knownHelpersOnly, but used the unknown helper ' + name, sexpr);
    } else {
      path.strict = true;
      path.falsy = true;

      this.accept(path);
      this.opcode('invokeHelper', params.length, path.original, _ast2['default'].helpers.simpleId(path));
    }
  },

  PathExpression: function PathExpression(path) {
    this.addDepth(path.depth);
    this.opcode('getContext', path.depth);

    var name = path.parts[0],
        scoped = _ast2['default'].helpers.scopedId(path),
        blockParamId = !path.depth && !scoped && this.blockParamIndex(name);

    if (blockParamId) {
      this.opcode('lookupBlockParam', blockParamId, path.parts);
    } else if (!name) {
      // Context reference, i.e. `{{foo .}}` or `{{foo ..}}`
      this.opcode('pushContext');
    } else if (path.data) {
      this.options.data = true;
      this.opcode('lookupData', path.depth, path.parts, path.strict);
    } else {
      this.opcode('lookupOnContext', path.parts, path.falsy, path.strict, scoped);
    }
  },

  StringLiteral: function StringLiteral(string) {
    this.opcode('pushString', string.value);
  },

  NumberLiteral: function NumberLiteral(number) {
    this.opcode('pushLiteral', number.value);
  },

  BooleanLiteral: function BooleanLiteral(bool) {
    this.opcode('pushLiteral', bool.value);
  },

  UndefinedLiteral: function UndefinedLiteral() {
    this.opcode('pushLiteral', 'undefined');
  },

  NullLiteral: function NullLiteral() {
    this.opcode('pushLiteral', 'null');
  },

  Hash: function Hash(hash) {
    var pairs = hash.pairs,
        i = 0,
        l = pairs.length;

    this.opcode('pushHash');

    for (; i < l; i++) {
      this.pushParam(pairs[i].value);
    }
    while (i--) {
      this.opcode('assignToHash', pairs[i].key);
    }
    this.opcode('popHash');
  },

  // HELPERS
  opcode: function opcode(name) {
    this.opcodes.push({ opcode: name, args: slice.call(arguments, 1), loc: this.sourceNode[0].loc });
  },

  addDepth: function addDepth(depth) {
    if (!depth) {
      return;
    }

    this.useDepths = true;
  },

  classifySexpr: function classifySexpr(sexpr) {
    var isSimple = _ast2['default'].helpers.simpleId(sexpr.path);

    var isBlockParam = isSimple && !!this.blockParamIndex(sexpr.path.parts[0]);

    // a mustache is an eligible helper if:
    // * its id is simple (a single part, not `this` or `..`)
    var isHelper = !isBlockParam && _ast2['default'].helpers.helperExpression(sexpr);

    // if a mustache is an eligible helper but not a definite
    // helper, it is ambiguous, and will be resolved in a later
    // pass or at runtime.
    var isEligible = !isBlockParam && (isHelper || isSimple);

    // if ambiguous, we can possibly resolve the ambiguity now
    // An eligible helper is one that does not have a complex path, i.e. `this.foo`, `../foo` etc.
    if (isEligible && !isHelper) {
      var _name2 = sexpr.path.parts[0],
          options = this.options;

      if (options.knownHelpers[_name2]) {
        isHelper = true;
      } else if (options.knownHelpersOnly) {
        isEligible = false;
      }
    }

    if (isHelper) {
      return 'helper';
    } else if (isEligible) {
      return 'ambiguous';
    } else {
      return 'simple';
    }
  },

  pushParams: function pushParams(params) {
    for (var i = 0, l = params.length; i < l; i++) {
      this.pushParam(params[i]);
    }
  },

  pushParam: function pushParam(val) {
    var value = val.value != null ? val.value : val.original || '';

    if (this.stringParams) {
      if (value.replace) {
        value = value.replace(/^(\.?\.\/)*/g, '').replace(/\//g, '.');
      }

      if (val.depth) {
        this.addDepth(val.depth);
      }
      this.opcode('getContext', val.depth || 0);
      this.opcode('pushStringParam', value, val.type);

      if (val.type === 'SubExpression') {
        // SubExpressions get evaluated and passed in
        // in string params mode.
        this.accept(val);
      }
    } else {
      if (this.trackIds) {
        var blockParamIndex = undefined;
        if (val.parts && !_ast2['default'].helpers.scopedId(val) && !val.depth) {
          blockParamIndex = this.blockParamIndex(val.parts[0]);
        }
        if (blockParamIndex) {
          var blockParamChild = val.parts.slice(1).join('.');
          this.opcode('pushId', 'BlockParam', blockParamIndex, blockParamChild);
        } else {
          value = val.original || value;
          if (value.replace) {
            value = value.replace(/^this(?:\.|$)/, '').replace(/^\.\//, '').replace(/^\.$/, '');
          }

          this.opcode('pushId', val.type, value);
        }
      }
      this.accept(val);
    }
  },

  setupFullMustacheParams: function setupFullMustacheParams(sexpr, program, inverse, omitEmpty) {
    var params = sexpr.params;
    this.pushParams(params);

    this.opcode('pushProgram', program);
    this.opcode('pushProgram', inverse);

    if (sexpr.hash) {
      this.accept(sexpr.hash);
    } else {
      this.opcode('emptyHash', omitEmpty);
    }

    return params;
  },

  blockParamIndex: function blockParamIndex(name) {
    for (var depth = 0, len = this.options.blockParams.length; depth < len; depth++) {
      var blockParams = this.options.blockParams[depth],
          param = blockParams && _utils.indexOf(blockParams, name);
      if (blockParams && param >= 0) {
        return [depth, param];
      }
    }
  }
};

function precompile(input, options, env) {
  if (input == null || typeof input !== 'string' && input.type !== 'Program') {
    throw new _exception2['default']('You must pass a string or Handlebars AST to Handlebars.precompile. You passed ' + input);
  }

  options = options || {};
  if (!('data' in options)) {
    options.data = true;
  }
  if (options.compat) {
    options.useDepths = true;
  }

  var ast = env.parse(input, options),
      environment = new env.Compiler().compile(ast, options);
  return new env.JavaScriptCompiler().compile(environment, options);
}

function compile(input, options, env) {
  if (options === undefined) options = {};

  if (input == null || typeof input !== 'string' && input.type !== 'Program') {
    throw new _exception2['default']('You must pass a string or Handlebars AST to Handlebars.compile. You passed ' + input);
  }

  options = _utils.extend({}, options);
  if (!('data' in options)) {
    options.data = true;
  }
  if (options.compat) {
    options.useDepths = true;
  }

  var compiled = undefined;

  function compileInput() {
    var ast = env.parse(input, options),
        environment = new env.Compiler().compile(ast, options),
        templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
    return env.template(templateSpec);
  }

  // Template is only compiled on first use and cached after that point.
  function ret(context, execOptions) {
    if (!compiled) {
      compiled = compileInput();
    }
    return compiled.call(this, context, execOptions);
  }
  ret._setup = function (setupOptions) {
    if (!compiled) {
      compiled = compileInput();
    }
    return compiled._setup(setupOptions);
  };
  ret._child = function (i, data, blockParams, depths) {
    if (!compiled) {
      compiled = compileInput();
    }
    return compiled._child(i, data, blockParams, depths);
  };
  return ret;
}

function argEquals(a, b) {
  if (a === b) {
    return true;
  }

  if (_utils.isArray(a) && _utils.isArray(b) && a.length === b.length) {
    for (var i = 0; i < a.length; i++) {
      if (!argEquals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
}

function transformLiteralToPath(sexpr) {
  if (!sexpr.path.parts) {
    var literal = sexpr.path;
    // Casting to string here to make false and 0 literal values play nicely with the rest
    // of the system.
    sexpr.path = {
      type: 'PathExpression',
      data: false,
      depth: 0,
      parts: [literal.original + ''],
      original: literal.original + '',
      loc: literal.loc
    };
  }
}


},{"../exception":39,"../utils":52,"./ast":27}],31:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.SourceLocation = SourceLocation;
exports.id = id;
exports.stripFlags = stripFlags;
exports.stripComment = stripComment;
exports.preparePath = preparePath;
exports.prepareMustache = prepareMustache;
exports.prepareRawBlock = prepareRawBlock;
exports.prepareBlock = prepareBlock;
exports.prepareProgram = prepareProgram;
exports.preparePartialBlock = preparePartialBlock;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

function validateClose(open, close) {
  close = close.path ? close.path.original : close;

  if (open.path.original !== close) {
    var errorNode = { loc: open.path.loc };

    throw new _exception2['default'](open.path.original + " doesn't match " + close, errorNode);
  }
}

function SourceLocation(source, locInfo) {
  this.source = source;
  this.start = {
    line: locInfo.first_line,
    column: locInfo.first_column
  };
  this.end = {
    line: locInfo.last_line,
    column: locInfo.last_column
  };
}

function id(token) {
  if (/^\[.*\]$/.test(token)) {
    return token.substr(1, token.length - 2);
  } else {
    return token;
  }
}

function stripFlags(open, close) {
  return {
    open: open.charAt(2) === '~',
    close: close.charAt(close.length - 3) === '~'
  };
}

function stripComment(comment) {
  return comment.replace(/^\{\{~?\!-?-?/, '').replace(/-?-?~?\}\}$/, '');
}

function preparePath(data, parts, loc) {
  loc = this.locInfo(loc);

  var original = data ? '@' : '',
      dig = [],
      depth = 0,
      depthString = '';

  for (var i = 0, l = parts.length; i < l; i++) {
    var part = parts[i].part,

    // If we have [] syntax then we do not treat path references as operators,
    // i.e. foo.[this] resolves to approximately context.foo['this']
    isLiteral = parts[i].original !== part;
    original += (parts[i].separator || '') + part;

    if (!isLiteral && (part === '..' || part === '.' || part === 'this')) {
      if (dig.length > 0) {
        throw new _exception2['default']('Invalid path: ' + original, { loc: loc });
      } else if (part === '..') {
        depth++;
        depthString += '../';
      }
    } else {
      dig.push(part);
    }
  }

  return {
    type: 'PathExpression',
    data: data,
    depth: depth,
    parts: dig,
    original: original,
    loc: loc
  };
}

function prepareMustache(path, params, hash, open, strip, locInfo) {
  // Must use charAt to support IE pre-10
  var escapeFlag = open.charAt(3) || open.charAt(2),
      escaped = escapeFlag !== '{' && escapeFlag !== '&';

  var decorator = /\*/.test(open);
  return {
    type: decorator ? 'Decorator' : 'MustacheStatement',
    path: path,
    params: params,
    hash: hash,
    escaped: escaped,
    strip: strip,
    loc: this.locInfo(locInfo)
  };
}

function prepareRawBlock(openRawBlock, contents, close, locInfo) {
  validateClose(openRawBlock, close);

  locInfo = this.locInfo(locInfo);
  var program = {
    type: 'Program',
    body: contents,
    strip: {},
    loc: locInfo
  };

  return {
    type: 'BlockStatement',
    path: openRawBlock.path,
    params: openRawBlock.params,
    hash: openRawBlock.hash,
    program: program,
    openStrip: {},
    inverseStrip: {},
    closeStrip: {},
    loc: locInfo
  };
}

function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
  if (close && close.path) {
    validateClose(openBlock, close);
  }

  var decorator = /\*/.test(openBlock.open);

  program.blockParams = openBlock.blockParams;

  var inverse = undefined,
      inverseStrip = undefined;

  if (inverseAndProgram) {
    if (decorator) {
      throw new _exception2['default']('Unexpected inverse block on decorator', inverseAndProgram);
    }

    if (inverseAndProgram.chain) {
      inverseAndProgram.program.body[0].closeStrip = close.strip;
    }

    inverseStrip = inverseAndProgram.strip;
    inverse = inverseAndProgram.program;
  }

  if (inverted) {
    inverted = inverse;
    inverse = program;
    program = inverted;
  }

  return {
    type: decorator ? 'DecoratorBlock' : 'BlockStatement',
    path: openBlock.path,
    params: openBlock.params,
    hash: openBlock.hash,
    program: program,
    inverse: inverse,
    openStrip: openBlock.strip,
    inverseStrip: inverseStrip,
    closeStrip: close && close.strip,
    loc: this.locInfo(locInfo)
  };
}

function prepareProgram(statements, loc) {
  if (!loc && statements.length) {
    var firstLoc = statements[0].loc,
        lastLoc = statements[statements.length - 1].loc;

    /* istanbul ignore else */
    if (firstLoc && lastLoc) {
      loc = {
        source: firstLoc.source,
        start: {
          line: firstLoc.start.line,
          column: firstLoc.start.column
        },
        end: {
          line: lastLoc.end.line,
          column: lastLoc.end.column
        }
      };
    }
  }

  return {
    type: 'Program',
    body: statements,
    strip: {},
    loc: loc
  };
}

function preparePartialBlock(open, program, close, locInfo) {
  validateClose(open, close);

  return {
    type: 'PartialBlockStatement',
    name: open.path,
    params: open.params,
    hash: open.hash,
    program: program,
    openStrip: open.strip,
    closeStrip: close && close.strip,
    loc: this.locInfo(locInfo)
  };
}


},{"../exception":39}],32:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _base = require('../base');

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

var _utils = require('../utils');

var _codeGen = require('./code-gen');

var _codeGen2 = _interopRequireDefault(_codeGen);

function Literal(value) {
  this.value = value;
}

function JavaScriptCompiler() {}

JavaScriptCompiler.prototype = {
  // PUBLIC API: You can override these methods in a subclass to provide
  // alternative compiled forms for name lookup and buffering semantics
  nameLookup: function nameLookup(parent, name /* , type*/) {
    if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
      return [parent, '.', name];
    } else {
      return [parent, '[', JSON.stringify(name), ']'];
    }
  },
  depthedLookup: function depthedLookup(name) {
    return [this.aliasable('container.lookup'), '(depths, "', name, '")'];
  },

  compilerInfo: function compilerInfo() {
    var revision = _base.COMPILER_REVISION,
        versions = _base.REVISION_CHANGES[revision];
    return [revision, versions];
  },

  appendToBuffer: function appendToBuffer(source, location, explicit) {
    // Force a source as this simplifies the merge logic.
    if (!_utils.isArray(source)) {
      source = [source];
    }
    source = this.source.wrap(source, location);

    if (this.environment.isSimple) {
      return ['return ', source, ';'];
    } else if (explicit) {
      // This is a case where the buffer operation occurs as a child of another
      // construct, generally braces. We have to explicitly output these buffer
      // operations to ensure that the emitted code goes in the correct location.
      return ['buffer += ', source, ';'];
    } else {
      source.appendToBuffer = true;
      return source;
    }
  },

  initializeBuffer: function initializeBuffer() {
    return this.quotedString('');
  },
  // END PUBLIC API

  compile: function compile(environment, options, context, asObject) {
    this.environment = environment;
    this.options = options;
    this.stringParams = this.options.stringParams;
    this.trackIds = this.options.trackIds;
    this.precompile = !asObject;

    this.name = this.environment.name;
    this.isChild = !!context;
    this.context = context || {
      decorators: [],
      programs: [],
      environments: []
    };

    this.preamble();

    this.stackSlot = 0;
    this.stackVars = [];
    this.aliases = {};
    this.registers = { list: [] };
    this.hashes = [];
    this.compileStack = [];
    this.inlineStack = [];
    this.blockParams = [];

    this.compileChildren(environment, options);

    this.useDepths = this.useDepths || environment.useDepths || environment.useDecorators || this.options.compat;
    this.useBlockParams = this.useBlockParams || environment.useBlockParams;

    var opcodes = environment.opcodes,
        opcode = undefined,
        firstLoc = undefined,
        i = undefined,
        l = undefined;

    for (i = 0, l = opcodes.length; i < l; i++) {
      opcode = opcodes[i];

      this.source.currentLocation = opcode.loc;
      firstLoc = firstLoc || opcode.loc;
      this[opcode.opcode].apply(this, opcode.args);
    }

    // Flush any trailing content that might be pending.
    this.source.currentLocation = firstLoc;
    this.pushSource('');

    /* istanbul ignore next */
    if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
      throw new _exception2['default']('Compile completed with content left on stack');
    }

    if (!this.decorators.isEmpty()) {
      this.useDecorators = true;

      this.decorators.prepend('var decorators = container.decorators;\n');
      this.decorators.push('return fn;');

      if (asObject) {
        this.decorators = Function.apply(this, ['fn', 'props', 'container', 'depth0', 'data', 'blockParams', 'depths', this.decorators.merge()]);
      } else {
        this.decorators.prepend('function(fn, props, container, depth0, data, blockParams, depths) {\n');
        this.decorators.push('}\n');
        this.decorators = this.decorators.merge();
      }
    } else {
      this.decorators = undefined;
    }

    var fn = this.createFunctionContext(asObject);
    if (!this.isChild) {
      var ret = {
        compiler: this.compilerInfo(),
        main: fn
      };

      if (this.decorators) {
        ret.main_d = this.decorators; // eslint-disable-line camelcase
        ret.useDecorators = true;
      }

      var _context = this.context;
      var programs = _context.programs;
      var decorators = _context.decorators;

      for (i = 0, l = programs.length; i < l; i++) {
        if (programs[i]) {
          ret[i] = programs[i];
          if (decorators[i]) {
            ret[i + '_d'] = decorators[i];
            ret.useDecorators = true;
          }
        }
      }

      if (this.environment.usePartial) {
        ret.usePartial = true;
      }
      if (this.options.data) {
        ret.useData = true;
      }
      if (this.useDepths) {
        ret.useDepths = true;
      }
      if (this.useBlockParams) {
        ret.useBlockParams = true;
      }
      if (this.options.compat) {
        ret.compat = true;
      }

      if (!asObject) {
        ret.compiler = JSON.stringify(ret.compiler);

        this.source.currentLocation = { start: { line: 1, column: 0 } };
        ret = this.objectLiteral(ret);

        if (options.srcName) {
          ret = ret.toStringWithSourceMap({ file: options.destName });
          ret.map = ret.map && ret.map.toString();
        } else {
          ret = ret.toString();
        }
      } else {
        ret.compilerOptions = this.options;
      }

      return ret;
    } else {
      return fn;
    }
  },

  preamble: function preamble() {
    // track the last context pushed into place to allow skipping the
    // getContext opcode when it would be a noop
    this.lastContext = 0;
    this.source = new _codeGen2['default'](this.options.srcName);
    this.decorators = new _codeGen2['default'](this.options.srcName);
  },

  createFunctionContext: function createFunctionContext(asObject) {
    var varDeclarations = '';

    var locals = this.stackVars.concat(this.registers.list);
    if (locals.length > 0) {
      varDeclarations += ', ' + locals.join(', ');
    }

    // Generate minimizer alias mappings
    //
    // When using true SourceNodes, this will update all references to the given alias
    // as the source nodes are reused in situ. For the non-source node compilation mode,
    // aliases will not be used, but this case is already being run on the client and
    // we aren't concern about minimizing the template size.
    var aliasCount = 0;
    for (var alias in this.aliases) {
      // eslint-disable-line guard-for-in
      var node = this.aliases[alias];

      if (this.aliases.hasOwnProperty(alias) && node.children && node.referenceCount > 1) {
        varDeclarations += ', alias' + ++aliasCount + '=' + alias;
        node.children[0] = 'alias' + aliasCount;
      }
    }

    var params = ['container', 'depth0', 'helpers', 'partials', 'data'];

    if (this.useBlockParams || this.useDepths) {
      params.push('blockParams');
    }
    if (this.useDepths) {
      params.push('depths');
    }

    // Perform a second pass over the output to merge content when possible
    var source = this.mergeSource(varDeclarations);

    if (asObject) {
      params.push(source);

      return Function.apply(this, params);
    } else {
      return this.source.wrap(['function(', params.join(','), ') {\n  ', source, '}']);
    }
  },
  mergeSource: function mergeSource(varDeclarations) {
    var isSimple = this.environment.isSimple,
        appendOnly = !this.forceBuffer,
        appendFirst = undefined,
        sourceSeen = undefined,
        bufferStart = undefined,
        bufferEnd = undefined;
    this.source.each(function (line) {
      if (line.appendToBuffer) {
        if (bufferStart) {
          line.prepend('  + ');
        } else {
          bufferStart = line;
        }
        bufferEnd = line;
      } else {
        if (bufferStart) {
          if (!sourceSeen) {
            appendFirst = true;
          } else {
            bufferStart.prepend('buffer += ');
          }
          bufferEnd.add(';');
          bufferStart = bufferEnd = undefined;
        }

        sourceSeen = true;
        if (!isSimple) {
          appendOnly = false;
        }
      }
    });

    if (appendOnly) {
      if (bufferStart) {
        bufferStart.prepend('return ');
        bufferEnd.add(';');
      } else if (!sourceSeen) {
        this.source.push('return "";');
      }
    } else {
      varDeclarations += ', buffer = ' + (appendFirst ? '' : this.initializeBuffer());

      if (bufferStart) {
        bufferStart.prepend('return buffer + ');
        bufferEnd.add(';');
      } else {
        this.source.push('return buffer;');
      }
    }

    if (varDeclarations) {
      this.source.prepend('var ' + varDeclarations.substring(2) + (appendFirst ? '' : ';\n'));
    }

    return this.source.merge();
  },

  // [blockValue]
  //
  // On stack, before: hash, inverse, program, value
  // On stack, after: return value of blockHelperMissing
  //
  // The purpose of this opcode is to take a block of the form
  // `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and
  // replace it on the stack with the result of properly
  // invoking blockHelperMissing.
  blockValue: function blockValue(name) {
    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
        params = [this.contextName(0)];
    this.setupHelperArgs(name, 0, params);

    var blockName = this.popStack();
    params.splice(1, 0, blockName);

    this.push(this.source.functionCall(blockHelperMissing, 'call', params));
  },

  // [ambiguousBlockValue]
  //
  // On stack, before: hash, inverse, program, value
  // Compiler value, before: lastHelper=value of last found helper, if any
  // On stack, after, if no lastHelper: same as [blockValue]
  // On stack, after, if lastHelper: value
  ambiguousBlockValue: function ambiguousBlockValue() {
    // We're being a bit cheeky and reusing the options value from the prior exec
    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
        params = [this.contextName(0)];
    this.setupHelperArgs('', 0, params, true);

    this.flushInline();

    var current = this.topStack();
    params.splice(1, 0, current);

    this.pushSource(['if (!', this.lastHelper, ') { ', current, ' = ', this.source.functionCall(blockHelperMissing, 'call', params), '}']);
  },

  // [appendContent]
  //
  // On stack, before: ...
  // On stack, after: ...
  //
  // Appends the string value of `content` to the current buffer
  appendContent: function appendContent(content) {
    if (this.pendingContent) {
      content = this.pendingContent + content;
    } else {
      this.pendingLocation = this.source.currentLocation;
    }

    this.pendingContent = content;
  },

  // [append]
  //
  // On stack, before: value, ...
  // On stack, after: ...
  //
  // Coerces `value` to a String and appends it to the current buffer.
  //
  // If `value` is truthy, or 0, it is coerced into a string and appended
  // Otherwise, the empty string is appended
  append: function append() {
    if (this.isInline()) {
      this.replaceStack(function (current) {
        return [' != null ? ', current, ' : ""'];
      });

      this.pushSource(this.appendToBuffer(this.popStack()));
    } else {
      var local = this.popStack();
      this.pushSource(['if (', local, ' != null) { ', this.appendToBuffer(local, undefined, true), ' }']);
      if (this.environment.isSimple) {
        this.pushSource(['else { ', this.appendToBuffer("''", undefined, true), ' }']);
      }
    }
  },

  // [appendEscaped]
  //
  // On stack, before: value, ...
  // On stack, after: ...
  //
  // Escape `value` and append it to the buffer
  appendEscaped: function appendEscaped() {
    this.pushSource(this.appendToBuffer([this.aliasable('container.escapeExpression'), '(', this.popStack(), ')']));
  },

  // [getContext]
  //
  // On stack, before: ...
  // On stack, after: ...
  // Compiler value, after: lastContext=depth
  //
  // Set the value of the `lastContext` compiler value to the depth
  getContext: function getContext(depth) {
    this.lastContext = depth;
  },

  // [pushContext]
  //
  // On stack, before: ...
  // On stack, after: currentContext, ...
  //
  // Pushes the value of the current context onto the stack.
  pushContext: function pushContext() {
    this.pushStackLiteral(this.contextName(this.lastContext));
  },

  // [lookupOnContext]
  //
  // On stack, before: ...
  // On stack, after: currentContext[name], ...
  //
  // Looks up the value of `name` on the current context and pushes
  // it onto the stack.
  lookupOnContext: function lookupOnContext(parts, falsy, strict, scoped) {
    var i = 0;

    if (!scoped && this.options.compat && !this.lastContext) {
      // The depthed query is expected to handle the undefined logic for the root level that
      // is implemented below, so we evaluate that directly in compat mode
      this.push(this.depthedLookup(parts[i++]));
    } else {
      this.pushContext();
    }

    this.resolvePath('context', parts, i, falsy, strict);
  },

  // [lookupBlockParam]
  //
  // On stack, before: ...
  // On stack, after: blockParam[name], ...
  //
  // Looks up the value of `parts` on the given block param and pushes
  // it onto the stack.
  lookupBlockParam: function lookupBlockParam(blockParamId, parts) {
    this.useBlockParams = true;

    this.push(['blockParams[', blockParamId[0], '][', blockParamId[1], ']']);
    this.resolvePath('context', parts, 1);
  },

  // [lookupData]
  //
  // On stack, before: ...
  // On stack, after: data, ...
  //
  // Push the data lookup operator
  lookupData: function lookupData(depth, parts, strict) {
    if (!depth) {
      this.pushStackLiteral('data');
    } else {
      this.pushStackLiteral('container.data(data, ' + depth + ')');
    }

    this.resolvePath('data', parts, 0, true, strict);
  },

  resolvePath: function resolvePath(type, parts, i, falsy, strict) {
    // istanbul ignore next

    var _this = this;

    if (this.options.strict || this.options.assumeObjects) {
      this.push(strictLookup(this.options.strict && strict, this, parts, type));
      return;
    }

    var len = parts.length;
    for (; i < len; i++) {
      /* eslint-disable no-loop-func */
      this.replaceStack(function (current) {
        var lookup = _this.nameLookup(current, parts[i], type);
        // We want to ensure that zero and false are handled properly if the context (falsy flag)
        // needs to have the special handling for these values.
        if (!falsy) {
          return [' != null ? ', lookup, ' : ', current];
        } else {
          // Otherwise we can use generic falsy handling
          return [' && ', lookup];
        }
      });
      /* eslint-enable no-loop-func */
    }
  },

  // [resolvePossibleLambda]
  //
  // On stack, before: value, ...
  // On stack, after: resolved value, ...
  //
  // If the `value` is a lambda, replace it on the stack by
  // the return value of the lambda
  resolvePossibleLambda: function resolvePossibleLambda() {
    this.push([this.aliasable('container.lambda'), '(', this.popStack(), ', ', this.contextName(0), ')']);
  },

  // [pushStringParam]
  //
  // On stack, before: ...
  // On stack, after: string, currentContext, ...
  //
  // This opcode is designed for use in string mode, which
  // provides the string value of a parameter along with its
  // depth rather than resolving it immediately.
  pushStringParam: function pushStringParam(string, type) {
    this.pushContext();
    this.pushString(type);

    // If it's a subexpression, the string result
    // will be pushed after this opcode.
    if (type !== 'SubExpression') {
      if (typeof string === 'string') {
        this.pushString(string);
      } else {
        this.pushStackLiteral(string);
      }
    }
  },

  emptyHash: function emptyHash(omitEmpty) {
    if (this.trackIds) {
      this.push('{}'); // hashIds
    }
    if (this.stringParams) {
      this.push('{}'); // hashContexts
      this.push('{}'); // hashTypes
    }
    this.pushStackLiteral(omitEmpty ? 'undefined' : '{}');
  },
  pushHash: function pushHash() {
    if (this.hash) {
      this.hashes.push(this.hash);
    }
    this.hash = { values: [], types: [], contexts: [], ids: [] };
  },
  popHash: function popHash() {
    var hash = this.hash;
    this.hash = this.hashes.pop();

    if (this.trackIds) {
      this.push(this.objectLiteral(hash.ids));
    }
    if (this.stringParams) {
      this.push(this.objectLiteral(hash.contexts));
      this.push(this.objectLiteral(hash.types));
    }

    this.push(this.objectLiteral(hash.values));
  },

  // [pushString]
  //
  // On stack, before: ...
  // On stack, after: quotedString(string), ...
  //
  // Push a quoted version of `string` onto the stack
  pushString: function pushString(string) {
    this.pushStackLiteral(this.quotedString(string));
  },

  // [pushLiteral]
  //
  // On stack, before: ...
  // On stack, after: value, ...
  //
  // Pushes a value onto the stack. This operation prevents
  // the compiler from creating a temporary variable to hold
  // it.
  pushLiteral: function pushLiteral(value) {
    this.pushStackLiteral(value);
  },

  // [pushProgram]
  //
  // On stack, before: ...
  // On stack, after: program(guid), ...
  //
  // Push a program expression onto the stack. This takes
  // a compile-time guid and converts it into a runtime-accessible
  // expression.
  pushProgram: function pushProgram(guid) {
    if (guid != null) {
      this.pushStackLiteral(this.programExpression(guid));
    } else {
      this.pushStackLiteral(null);
    }
  },

  // [registerDecorator]
  //
  // On stack, before: hash, program, params..., ...
  // On stack, after: ...
  //
  // Pops off the decorator's parameters, invokes the decorator,
  // and inserts the decorator into the decorators list.
  registerDecorator: function registerDecorator(paramSize, name) {
    var foundDecorator = this.nameLookup('decorators', name, 'decorator'),
        options = this.setupHelperArgs(name, paramSize);

    this.decorators.push(['fn = ', this.decorators.functionCall(foundDecorator, '', ['fn', 'props', 'container', options]), ' || fn;']);
  },

  // [invokeHelper]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of helper invocation
  //
  // Pops off the helper's parameters, invokes the helper,
  // and pushes the helper's return value onto the stack.
  //
  // If the helper is not found, `helperMissing` is called.
  invokeHelper: function invokeHelper(paramSize, name, isSimple) {
    var nonHelper = this.popStack(),
        helper = this.setupHelper(paramSize, name),
        simple = isSimple ? [helper.name, ' || '] : '';

    var lookup = ['('].concat(simple, nonHelper);
    if (!this.options.strict) {
      lookup.push(' || ', this.aliasable('helpers.helperMissing'));
    }
    lookup.push(')');

    this.push(this.source.functionCall(lookup, 'call', helper.callParams));
  },

  // [invokeKnownHelper]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of helper invocation
  //
  // This operation is used when the helper is known to exist,
  // so a `helperMissing` fallback is not required.
  invokeKnownHelper: function invokeKnownHelper(paramSize, name) {
    var helper = this.setupHelper(paramSize, name);
    this.push(this.source.functionCall(helper.name, 'call', helper.callParams));
  },

  // [invokeAmbiguous]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of disambiguation
  //
  // This operation is used when an expression like `{{foo}}`
  // is provided, but we don't know at compile-time whether it
  // is a helper or a path.
  //
  // This operation emits more code than the other options,
  // and can be avoided by passing the `knownHelpers` and
  // `knownHelpersOnly` flags at compile-time.
  invokeAmbiguous: function invokeAmbiguous(name, helperCall) {
    this.useRegister('helper');

    var nonHelper = this.popStack();

    this.emptyHash();
    var helper = this.setupHelper(0, name, helperCall);

    var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

    var lookup = ['(', '(helper = ', helperName, ' || ', nonHelper, ')'];
    if (!this.options.strict) {
      lookup[0] = '(helper = ';
      lookup.push(' != null ? helper : ', this.aliasable('helpers.helperMissing'));
    }

    this.push(['(', lookup, helper.paramsInit ? ['),(', helper.paramsInit] : [], '),', '(typeof helper === ', this.aliasable('"function"'), ' ? ', this.source.functionCall('helper', 'call', helper.callParams), ' : helper))']);
  },

  // [invokePartial]
  //
  // On stack, before: context, ...
  // On stack after: result of partial invocation
  //
  // This operation pops off a context, invokes a partial with that context,
  // and pushes the result of the invocation back.
  invokePartial: function invokePartial(isDynamic, name, indent) {
    var params = [],
        options = this.setupParams(name, 1, params);

    if (isDynamic) {
      name = this.popStack();
      delete options.name;
    }

    if (indent) {
      options.indent = JSON.stringify(indent);
    }
    options.helpers = 'helpers';
    options.partials = 'partials';
    options.decorators = 'container.decorators';

    if (!isDynamic) {
      params.unshift(this.nameLookup('partials', name, 'partial'));
    } else {
      params.unshift(name);
    }

    if (this.options.compat) {
      options.depths = 'depths';
    }
    options = this.objectLiteral(options);
    params.push(options);

    this.push(this.source.functionCall('container.invokePartial', '', params));
  },

  // [assignToHash]
  //
  // On stack, before: value, ..., hash, ...
  // On stack, after: ..., hash, ...
  //
  // Pops a value off the stack and assigns it to the current hash
  assignToHash: function assignToHash(key) {
    var value = this.popStack(),
        context = undefined,
        type = undefined,
        id = undefined;

    if (this.trackIds) {
      id = this.popStack();
    }
    if (this.stringParams) {
      type = this.popStack();
      context = this.popStack();
    }

    var hash = this.hash;
    if (context) {
      hash.contexts[key] = context;
    }
    if (type) {
      hash.types[key] = type;
    }
    if (id) {
      hash.ids[key] = id;
    }
    hash.values[key] = value;
  },

  pushId: function pushId(type, name, child) {
    if (type === 'BlockParam') {
      this.pushStackLiteral('blockParams[' + name[0] + '].path[' + name[1] + ']' + (child ? ' + ' + JSON.stringify('.' + child) : ''));
    } else if (type === 'PathExpression') {
      this.pushString(name);
    } else if (type === 'SubExpression') {
      this.pushStackLiteral('true');
    } else {
      this.pushStackLiteral('null');
    }
  },

  // HELPERS

  compiler: JavaScriptCompiler,

  compileChildren: function compileChildren(environment, options) {
    var children = environment.children,
        child = undefined,
        compiler = undefined;

    for (var i = 0, l = children.length; i < l; i++) {
      child = children[i];
      compiler = new this.compiler(); // eslint-disable-line new-cap

      var existing = this.matchExistingProgram(child);

      if (existing == null) {
        this.context.programs.push(''); // Placeholder to prevent name conflicts for nested children
        var index = this.context.programs.length;
        child.index = index;
        child.name = 'program' + index;
        this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
        this.context.decorators[index] = compiler.decorators;
        this.context.environments[index] = child;

        this.useDepths = this.useDepths || compiler.useDepths;
        this.useBlockParams = this.useBlockParams || compiler.useBlockParams;
        child.useDepths = this.useDepths;
        child.useBlockParams = this.useBlockParams;
      } else {
        child.index = existing.index;
        child.name = 'program' + existing.index;

        this.useDepths = this.useDepths || existing.useDepths;
        this.useBlockParams = this.useBlockParams || existing.useBlockParams;
      }
    }
  },
  matchExistingProgram: function matchExistingProgram(child) {
    for (var i = 0, len = this.context.environments.length; i < len; i++) {
      var environment = this.context.environments[i];
      if (environment && environment.equals(child)) {
        return environment;
      }
    }
  },

  programExpression: function programExpression(guid) {
    var child = this.environment.children[guid],
        programParams = [child.index, 'data', child.blockParams];

    if (this.useBlockParams || this.useDepths) {
      programParams.push('blockParams');
    }
    if (this.useDepths) {
      programParams.push('depths');
    }

    return 'container.program(' + programParams.join(', ') + ')';
  },

  useRegister: function useRegister(name) {
    if (!this.registers[name]) {
      this.registers[name] = true;
      this.registers.list.push(name);
    }
  },

  push: function push(expr) {
    if (!(expr instanceof Literal)) {
      expr = this.source.wrap(expr);
    }

    this.inlineStack.push(expr);
    return expr;
  },

  pushStackLiteral: function pushStackLiteral(item) {
    this.push(new Literal(item));
  },

  pushSource: function pushSource(source) {
    if (this.pendingContent) {
      this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent), this.pendingLocation));
      this.pendingContent = undefined;
    }

    if (source) {
      this.source.push(source);
    }
  },

  replaceStack: function replaceStack(callback) {
    var prefix = ['('],
        stack = undefined,
        createdStack = undefined,
        usedLiteral = undefined;

    /* istanbul ignore next */
    if (!this.isInline()) {
      throw new _exception2['default']('replaceStack on non-inline');
    }

    // We want to merge the inline statement into the replacement statement via ','
    var top = this.popStack(true);

    if (top instanceof Literal) {
      // Literals do not need to be inlined
      stack = [top.value];
      prefix = ['(', stack];
      usedLiteral = true;
    } else {
      // Get or create the current stack name for use by the inline
      createdStack = true;
      var _name = this.incrStack();

      prefix = ['((', this.push(_name), ' = ', top, ')'];
      stack = this.topStack();
    }

    var item = callback.call(this, stack);

    if (!usedLiteral) {
      this.popStack();
    }
    if (createdStack) {
      this.stackSlot--;
    }
    this.push(prefix.concat(item, ')'));
  },

  incrStack: function incrStack() {
    this.stackSlot++;
    if (this.stackSlot > this.stackVars.length) {
      this.stackVars.push('stack' + this.stackSlot);
    }
    return this.topStackName();
  },
  topStackName: function topStackName() {
    return 'stack' + this.stackSlot;
  },
  flushInline: function flushInline() {
    var inlineStack = this.inlineStack;
    this.inlineStack = [];
    for (var i = 0, len = inlineStack.length; i < len; i++) {
      var entry = inlineStack[i];
      /* istanbul ignore if */
      if (entry instanceof Literal) {
        this.compileStack.push(entry);
      } else {
        var stack = this.incrStack();
        this.pushSource([stack, ' = ', entry, ';']);
        this.compileStack.push(stack);
      }
    }
  },
  isInline: function isInline() {
    return this.inlineStack.length;
  },

  popStack: function popStack(wrapped) {
    var inline = this.isInline(),
        item = (inline ? this.inlineStack : this.compileStack).pop();

    if (!wrapped && item instanceof Literal) {
      return item.value;
    } else {
      if (!inline) {
        /* istanbul ignore next */
        if (!this.stackSlot) {
          throw new _exception2['default']('Invalid stack pop');
        }
        this.stackSlot--;
      }
      return item;
    }
  },

  topStack: function topStack() {
    var stack = this.isInline() ? this.inlineStack : this.compileStack,
        item = stack[stack.length - 1];

    /* istanbul ignore if */
    if (item instanceof Literal) {
      return item.value;
    } else {
      return item;
    }
  },

  contextName: function contextName(context) {
    if (this.useDepths && context) {
      return 'depths[' + context + ']';
    } else {
      return 'depth' + context;
    }
  },

  quotedString: function quotedString(str) {
    return this.source.quotedString(str);
  },

  objectLiteral: function objectLiteral(obj) {
    return this.source.objectLiteral(obj);
  },

  aliasable: function aliasable(name) {
    var ret = this.aliases[name];
    if (ret) {
      ret.referenceCount++;
      return ret;
    }

    ret = this.aliases[name] = this.source.wrap(name);
    ret.aliasable = true;
    ret.referenceCount = 1;

    return ret;
  },

  setupHelper: function setupHelper(paramSize, name, blockHelper) {
    var params = [],
        paramsInit = this.setupHelperArgs(name, paramSize, params, blockHelper);
    var foundHelper = this.nameLookup('helpers', name, 'helper'),
        callContext = this.aliasable(this.contextName(0) + ' != null ? ' + this.contextName(0) + ' : (container.nullContext || {})');

    return {
      params: params,
      paramsInit: paramsInit,
      name: foundHelper,
      callParams: [callContext].concat(params)
    };
  },

  setupParams: function setupParams(helper, paramSize, params) {
    var options = {},
        contexts = [],
        types = [],
        ids = [],
        objectArgs = !params,
        param = undefined;

    if (objectArgs) {
      params = [];
    }

    options.name = this.quotedString(helper);
    options.hash = this.popStack();

    if (this.trackIds) {
      options.hashIds = this.popStack();
    }
    if (this.stringParams) {
      options.hashTypes = this.popStack();
      options.hashContexts = this.popStack();
    }

    var inverse = this.popStack(),
        program = this.popStack();

    // Avoid setting fn and inverse if neither are set. This allows
    // helpers to do a check for `if (options.fn)`
    if (program || inverse) {
      options.fn = program || 'container.noop';
      options.inverse = inverse || 'container.noop';
    }

    // The parameters go on to the stack in order (making sure that they are evaluated in order)
    // so we need to pop them off the stack in reverse order
    var i = paramSize;
    while (i--) {
      param = this.popStack();
      params[i] = param;

      if (this.trackIds) {
        ids[i] = this.popStack();
      }
      if (this.stringParams) {
        types[i] = this.popStack();
        contexts[i] = this.popStack();
      }
    }

    if (objectArgs) {
      options.args = this.source.generateArray(params);
    }

    if (this.trackIds) {
      options.ids = this.source.generateArray(ids);
    }
    if (this.stringParams) {
      options.types = this.source.generateArray(types);
      options.contexts = this.source.generateArray(contexts);
    }

    if (this.options.data) {
      options.data = 'data';
    }
    if (this.useBlockParams) {
      options.blockParams = 'blockParams';
    }
    return options;
  },

  setupHelperArgs: function setupHelperArgs(helper, paramSize, params, useRegister) {
    var options = this.setupParams(helper, paramSize, params);
    options = this.objectLiteral(options);
    if (useRegister) {
      this.useRegister('options');
      params.push('options');
      return ['options=', options];
    } else if (params) {
      params.push(options);
      return '';
    } else {
      return options;
    }
  }
};

(function () {
  var reservedWords = ('break else new var' + ' case finally return void' + ' catch for switch while' + ' continue function this with' + ' default if throw' + ' delete in try' + ' do instanceof typeof' + ' abstract enum int short' + ' boolean export interface static' + ' byte extends long super' + ' char final native synchronized' + ' class float package throws' + ' const goto private transient' + ' debugger implements protected volatile' + ' double import public let yield await' + ' null true false').split(' ');

  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

  for (var i = 0, l = reservedWords.length; i < l; i++) {
    compilerWords[reservedWords[i]] = true;
  }
})();

JavaScriptCompiler.isValidJavaScriptVariableName = function (name) {
  return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
};

function strictLookup(requireTerminal, compiler, parts, type) {
  var stack = compiler.popStack(),
      i = 0,
      len = parts.length;
  if (requireTerminal) {
    len--;
  }

  for (; i < len; i++) {
    stack = compiler.nameLookup(stack, parts[i], type);
  }

  if (requireTerminal) {
    return [compiler.aliasable('container.strict'), '(', stack, ', ', compiler.quotedString(parts[i]), ')'];
  } else {
    return stack;
  }
}

exports['default'] = JavaScriptCompiler;
module.exports = exports['default'];


},{"../base":26,"../exception":39,"../utils":52,"./code-gen":29}],33:[function(require,module,exports){
// File ignored in coverage tests via setting in .istanbul.yml
/* Jison generated parser */
"use strict";

exports.__esModule = true;
var handlebars = (function () {
    var parser = { trace: function trace() {},
        yy: {},
        symbols_: { "error": 2, "root": 3, "program": 4, "EOF": 5, "program_repetition0": 6, "statement": 7, "mustache": 8, "block": 9, "rawBlock": 10, "partial": 11, "partialBlock": 12, "content": 13, "COMMENT": 14, "CONTENT": 15, "openRawBlock": 16, "rawBlock_repetition_plus0": 17, "END_RAW_BLOCK": 18, "OPEN_RAW_BLOCK": 19, "helperName": 20, "openRawBlock_repetition0": 21, "openRawBlock_option0": 22, "CLOSE_RAW_BLOCK": 23, "openBlock": 24, "block_option0": 25, "closeBlock": 26, "openInverse": 27, "block_option1": 28, "OPEN_BLOCK": 29, "openBlock_repetition0": 30, "openBlock_option0": 31, "openBlock_option1": 32, "CLOSE": 33, "OPEN_INVERSE": 34, "openInverse_repetition0": 35, "openInverse_option0": 36, "openInverse_option1": 37, "openInverseChain": 38, "OPEN_INVERSE_CHAIN": 39, "openInverseChain_repetition0": 40, "openInverseChain_option0": 41, "openInverseChain_option1": 42, "inverseAndProgram": 43, "INVERSE": 44, "inverseChain": 45, "inverseChain_option0": 46, "OPEN_ENDBLOCK": 47, "OPEN": 48, "mustache_repetition0": 49, "mustache_option0": 50, "OPEN_UNESCAPED": 51, "mustache_repetition1": 52, "mustache_option1": 53, "CLOSE_UNESCAPED": 54, "OPEN_PARTIAL": 55, "partialName": 56, "partial_repetition0": 57, "partial_option0": 58, "openPartialBlock": 59, "OPEN_PARTIAL_BLOCK": 60, "openPartialBlock_repetition0": 61, "openPartialBlock_option0": 62, "param": 63, "sexpr": 64, "OPEN_SEXPR": 65, "sexpr_repetition0": 66, "sexpr_option0": 67, "CLOSE_SEXPR": 68, "hash": 69, "hash_repetition_plus0": 70, "hashSegment": 71, "ID": 72, "EQUALS": 73, "blockParams": 74, "OPEN_BLOCK_PARAMS": 75, "blockParams_repetition_plus0": 76, "CLOSE_BLOCK_PARAMS": 77, "path": 78, "dataName": 79, "STRING": 80, "NUMBER": 81, "BOOLEAN": 82, "UNDEFINED": 83, "NULL": 84, "DATA": 85, "pathSegments": 86, "SEP": 87, "$accept": 0, "$end": 1 },
        terminals_: { 2: "error", 5: "EOF", 14: "COMMENT", 15: "CONTENT", 18: "END_RAW_BLOCK", 19: "OPEN_RAW_BLOCK", 23: "CLOSE_RAW_BLOCK", 29: "OPEN_BLOCK", 33: "CLOSE", 34: "OPEN_INVERSE", 39: "OPEN_INVERSE_CHAIN", 44: "INVERSE", 47: "OPEN_ENDBLOCK", 48: "OPEN", 51: "OPEN_UNESCAPED", 54: "CLOSE_UNESCAPED", 55: "OPEN_PARTIAL", 60: "OPEN_PARTIAL_BLOCK", 65: "OPEN_SEXPR", 68: "CLOSE_SEXPR", 72: "ID", 73: "EQUALS", 75: "OPEN_BLOCK_PARAMS", 77: "CLOSE_BLOCK_PARAMS", 80: "STRING", 81: "NUMBER", 82: "BOOLEAN", 83: "UNDEFINED", 84: "NULL", 85: "DATA", 87: "SEP" },
        productions_: [0, [3, 2], [4, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [13, 1], [10, 3], [16, 5], [9, 4], [9, 4], [24, 6], [27, 6], [38, 6], [43, 2], [45, 3], [45, 1], [26, 3], [8, 5], [8, 5], [11, 5], [12, 3], [59, 5], [63, 1], [63, 1], [64, 5], [69, 1], [71, 3], [74, 3], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [56, 1], [56, 1], [79, 2], [78, 1], [86, 3], [86, 1], [6, 0], [6, 2], [17, 1], [17, 2], [21, 0], [21, 2], [22, 0], [22, 1], [25, 0], [25, 1], [28, 0], [28, 1], [30, 0], [30, 2], [31, 0], [31, 1], [32, 0], [32, 1], [35, 0], [35, 2], [36, 0], [36, 1], [37, 0], [37, 1], [40, 0], [40, 2], [41, 0], [41, 1], [42, 0], [42, 1], [46, 0], [46, 1], [49, 0], [49, 2], [50, 0], [50, 1], [52, 0], [52, 2], [53, 0], [53, 1], [57, 0], [57, 2], [58, 0], [58, 1], [61, 0], [61, 2], [62, 0], [62, 1], [66, 0], [66, 2], [67, 0], [67, 1], [70, 1], [70, 2], [76, 1], [76, 2]],
        performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$
        /**/) {

            var $0 = $$.length - 1;
            switch (yystate) {
                case 1:
                    return $$[$0 - 1];
                    break;
                case 2:
                    this.$ = yy.prepareProgram($$[$0]);
                    break;
                case 3:
                    this.$ = $$[$0];
                    break;
                case 4:
                    this.$ = $$[$0];
                    break;
                case 5:
                    this.$ = $$[$0];
                    break;
                case 6:
                    this.$ = $$[$0];
                    break;
                case 7:
                    this.$ = $$[$0];
                    break;
                case 8:
                    this.$ = $$[$0];
                    break;
                case 9:
                    this.$ = {
                        type: 'CommentStatement',
                        value: yy.stripComment($$[$0]),
                        strip: yy.stripFlags($$[$0], $$[$0]),
                        loc: yy.locInfo(this._$)
                    };

                    break;
                case 10:
                    this.$ = {
                        type: 'ContentStatement',
                        original: $$[$0],
                        value: $$[$0],
                        loc: yy.locInfo(this._$)
                    };

                    break;
                case 11:
                    this.$ = yy.prepareRawBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
                    break;
                case 12:
                    this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1] };
                    break;
                case 13:
                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], false, this._$);
                    break;
                case 14:
                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], true, this._$);
                    break;
                case 15:
                    this.$ = { open: $$[$0 - 5], path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
                    break;
                case 16:
                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
                    break;
                case 17:
                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
                    break;
                case 18:
                    this.$ = { strip: yy.stripFlags($$[$0 - 1], $$[$0 - 1]), program: $$[$0] };
                    break;
                case 19:
                    var inverse = yy.prepareBlock($$[$0 - 2], $$[$0 - 1], $$[$0], $$[$0], false, this._$),
                        program = yy.prepareProgram([inverse], $$[$0 - 1].loc);
                    program.chained = true;

                    this.$ = { strip: $$[$0 - 2].strip, program: program, chain: true };

                    break;
                case 20:
                    this.$ = $$[$0];
                    break;
                case 21:
                    this.$ = { path: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 2], $$[$0]) };
                    break;
                case 22:
                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
                    break;
                case 23:
                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
                    break;
                case 24:
                    this.$ = {
                        type: 'PartialStatement',
                        name: $$[$0 - 3],
                        params: $$[$0 - 2],
                        hash: $$[$0 - 1],
                        indent: '',
                        strip: yy.stripFlags($$[$0 - 4], $$[$0]),
                        loc: yy.locInfo(this._$)
                    };

                    break;
                case 25:
                    this.$ = yy.preparePartialBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
                    break;
                case 26:
                    this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 4], $$[$0]) };
                    break;
                case 27:
                    this.$ = $$[$0];
                    break;
                case 28:
                    this.$ = $$[$0];
                    break;
                case 29:
                    this.$ = {
                        type: 'SubExpression',
                        path: $$[$0 - 3],
                        params: $$[$0 - 2],
                        hash: $$[$0 - 1],
                        loc: yy.locInfo(this._$)
                    };

                    break;
                case 30:
                    this.$ = { type: 'Hash', pairs: $$[$0], loc: yy.locInfo(this._$) };
                    break;
                case 31:
                    this.$ = { type: 'HashPair', key: yy.id($$[$0 - 2]), value: $$[$0], loc: yy.locInfo(this._$) };
                    break;
                case 32:
                    this.$ = yy.id($$[$0 - 1]);
                    break;
                case 33:
                    this.$ = $$[$0];
                    break;
                case 34:
                    this.$ = $$[$0];
                    break;
                case 35:
                    this.$ = { type: 'StringLiteral', value: $$[$0], original: $$[$0], loc: yy.locInfo(this._$) };
                    break;
                case 36:
                    this.$ = { type: 'NumberLiteral', value: Number($$[$0]), original: Number($$[$0]), loc: yy.locInfo(this._$) };
                    break;
                case 37:
                    this.$ = { type: 'BooleanLiteral', value: $$[$0] === 'true', original: $$[$0] === 'true', loc: yy.locInfo(this._$) };
                    break;
                case 38:
                    this.$ = { type: 'UndefinedLiteral', original: undefined, value: undefined, loc: yy.locInfo(this._$) };
                    break;
                case 39:
                    this.$ = { type: 'NullLiteral', original: null, value: null, loc: yy.locInfo(this._$) };
                    break;
                case 40:
                    this.$ = $$[$0];
                    break;
                case 41:
                    this.$ = $$[$0];
                    break;
                case 42:
                    this.$ = yy.preparePath(true, $$[$0], this._$);
                    break;
                case 43:
                    this.$ = yy.preparePath(false, $$[$0], this._$);
                    break;
                case 44:
                    $$[$0 - 2].push({ part: yy.id($$[$0]), original: $$[$0], separator: $$[$0 - 1] });this.$ = $$[$0 - 2];
                    break;
                case 45:
                    this.$ = [{ part: yy.id($$[$0]), original: $$[$0] }];
                    break;
                case 46:
                    this.$ = [];
                    break;
                case 47:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 48:
                    this.$ = [$$[$0]];
                    break;
                case 49:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 50:
                    this.$ = [];
                    break;
                case 51:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 58:
                    this.$ = [];
                    break;
                case 59:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 64:
                    this.$ = [];
                    break;
                case 65:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 70:
                    this.$ = [];
                    break;
                case 71:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 78:
                    this.$ = [];
                    break;
                case 79:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 82:
                    this.$ = [];
                    break;
                case 83:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 86:
                    this.$ = [];
                    break;
                case 87:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 90:
                    this.$ = [];
                    break;
                case 91:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 94:
                    this.$ = [];
                    break;
                case 95:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 98:
                    this.$ = [$$[$0]];
                    break;
                case 99:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 100:
                    this.$ = [$$[$0]];
                    break;
                case 101:
                    $$[$0 - 1].push($$[$0]);
                    break;
            }
        },
        table: [{ 3: 1, 4: 2, 5: [2, 46], 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 1: [3] }, { 5: [1, 4] }, { 5: [2, 2], 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: 11, 14: [1, 12], 15: [1, 20], 16: 17, 19: [1, 23], 24: 15, 27: 16, 29: [1, 21], 34: [1, 22], 39: [2, 2], 44: [2, 2], 47: [2, 2], 48: [1, 13], 51: [1, 14], 55: [1, 18], 59: 19, 60: [1, 24] }, { 1: [2, 1] }, { 5: [2, 47], 14: [2, 47], 15: [2, 47], 19: [2, 47], 29: [2, 47], 34: [2, 47], 39: [2, 47], 44: [2, 47], 47: [2, 47], 48: [2, 47], 51: [2, 47], 55: [2, 47], 60: [2, 47] }, { 5: [2, 3], 14: [2, 3], 15: [2, 3], 19: [2, 3], 29: [2, 3], 34: [2, 3], 39: [2, 3], 44: [2, 3], 47: [2, 3], 48: [2, 3], 51: [2, 3], 55: [2, 3], 60: [2, 3] }, { 5: [2, 4], 14: [2, 4], 15: [2, 4], 19: [2, 4], 29: [2, 4], 34: [2, 4], 39: [2, 4], 44: [2, 4], 47: [2, 4], 48: [2, 4], 51: [2, 4], 55: [2, 4], 60: [2, 4] }, { 5: [2, 5], 14: [2, 5], 15: [2, 5], 19: [2, 5], 29: [2, 5], 34: [2, 5], 39: [2, 5], 44: [2, 5], 47: [2, 5], 48: [2, 5], 51: [2, 5], 55: [2, 5], 60: [2, 5] }, { 5: [2, 6], 14: [2, 6], 15: [2, 6], 19: [2, 6], 29: [2, 6], 34: [2, 6], 39: [2, 6], 44: [2, 6], 47: [2, 6], 48: [2, 6], 51: [2, 6], 55: [2, 6], 60: [2, 6] }, { 5: [2, 7], 14: [2, 7], 15: [2, 7], 19: [2, 7], 29: [2, 7], 34: [2, 7], 39: [2, 7], 44: [2, 7], 47: [2, 7], 48: [2, 7], 51: [2, 7], 55: [2, 7], 60: [2, 7] }, { 5: [2, 8], 14: [2, 8], 15: [2, 8], 19: [2, 8], 29: [2, 8], 34: [2, 8], 39: [2, 8], 44: [2, 8], 47: [2, 8], 48: [2, 8], 51: [2, 8], 55: [2, 8], 60: [2, 8] }, { 5: [2, 9], 14: [2, 9], 15: [2, 9], 19: [2, 9], 29: [2, 9], 34: [2, 9], 39: [2, 9], 44: [2, 9], 47: [2, 9], 48: [2, 9], 51: [2, 9], 55: [2, 9], 60: [2, 9] }, { 20: 25, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 36, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 37, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 39: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 4: 38, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 13: 40, 15: [1, 20], 17: 39 }, { 20: 42, 56: 41, 64: 43, 65: [1, 44], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 45, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 5: [2, 10], 14: [2, 10], 15: [2, 10], 18: [2, 10], 19: [2, 10], 29: [2, 10], 34: [2, 10], 39: [2, 10], 44: [2, 10], 47: [2, 10], 48: [2, 10], 51: [2, 10], 55: [2, 10], 60: [2, 10] }, { 20: 46, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 47, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 48, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 42, 56: 49, 64: 43, 65: [1, 44], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [2, 78], 49: 50, 65: [2, 78], 72: [2, 78], 80: [2, 78], 81: [2, 78], 82: [2, 78], 83: [2, 78], 84: [2, 78], 85: [2, 78] }, { 23: [2, 33], 33: [2, 33], 54: [2, 33], 65: [2, 33], 68: [2, 33], 72: [2, 33], 75: [2, 33], 80: [2, 33], 81: [2, 33], 82: [2, 33], 83: [2, 33], 84: [2, 33], 85: [2, 33] }, { 23: [2, 34], 33: [2, 34], 54: [2, 34], 65: [2, 34], 68: [2, 34], 72: [2, 34], 75: [2, 34], 80: [2, 34], 81: [2, 34], 82: [2, 34], 83: [2, 34], 84: [2, 34], 85: [2, 34] }, { 23: [2, 35], 33: [2, 35], 54: [2, 35], 65: [2, 35], 68: [2, 35], 72: [2, 35], 75: [2, 35], 80: [2, 35], 81: [2, 35], 82: [2, 35], 83: [2, 35], 84: [2, 35], 85: [2, 35] }, { 23: [2, 36], 33: [2, 36], 54: [2, 36], 65: [2, 36], 68: [2, 36], 72: [2, 36], 75: [2, 36], 80: [2, 36], 81: [2, 36], 82: [2, 36], 83: [2, 36], 84: [2, 36], 85: [2, 36] }, { 23: [2, 37], 33: [2, 37], 54: [2, 37], 65: [2, 37], 68: [2, 37], 72: [2, 37], 75: [2, 37], 80: [2, 37], 81: [2, 37], 82: [2, 37], 83: [2, 37], 84: [2, 37], 85: [2, 37] }, { 23: [2, 38], 33: [2, 38], 54: [2, 38], 65: [2, 38], 68: [2, 38], 72: [2, 38], 75: [2, 38], 80: [2, 38], 81: [2, 38], 82: [2, 38], 83: [2, 38], 84: [2, 38], 85: [2, 38] }, { 23: [2, 39], 33: [2, 39], 54: [2, 39], 65: [2, 39], 68: [2, 39], 72: [2, 39], 75: [2, 39], 80: [2, 39], 81: [2, 39], 82: [2, 39], 83: [2, 39], 84: [2, 39], 85: [2, 39] }, { 23: [2, 43], 33: [2, 43], 54: [2, 43], 65: [2, 43], 68: [2, 43], 72: [2, 43], 75: [2, 43], 80: [2, 43], 81: [2, 43], 82: [2, 43], 83: [2, 43], 84: [2, 43], 85: [2, 43], 87: [1, 51] }, { 72: [1, 35], 86: 52 }, { 23: [2, 45], 33: [2, 45], 54: [2, 45], 65: [2, 45], 68: [2, 45], 72: [2, 45], 75: [2, 45], 80: [2, 45], 81: [2, 45], 82: [2, 45], 83: [2, 45], 84: [2, 45], 85: [2, 45], 87: [2, 45] }, { 52: 53, 54: [2, 82], 65: [2, 82], 72: [2, 82], 80: [2, 82], 81: [2, 82], 82: [2, 82], 83: [2, 82], 84: [2, 82], 85: [2, 82] }, { 25: 54, 38: 56, 39: [1, 58], 43: 57, 44: [1, 59], 45: 55, 47: [2, 54] }, { 28: 60, 43: 61, 44: [1, 59], 47: [2, 56] }, { 13: 63, 15: [1, 20], 18: [1, 62] }, { 15: [2, 48], 18: [2, 48] }, { 33: [2, 86], 57: 64, 65: [2, 86], 72: [2, 86], 80: [2, 86], 81: [2, 86], 82: [2, 86], 83: [2, 86], 84: [2, 86], 85: [2, 86] }, { 33: [2, 40], 65: [2, 40], 72: [2, 40], 80: [2, 40], 81: [2, 40], 82: [2, 40], 83: [2, 40], 84: [2, 40], 85: [2, 40] }, { 33: [2, 41], 65: [2, 41], 72: [2, 41], 80: [2, 41], 81: [2, 41], 82: [2, 41], 83: [2, 41], 84: [2, 41], 85: [2, 41] }, { 20: 65, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 26: 66, 47: [1, 67] }, { 30: 68, 33: [2, 58], 65: [2, 58], 72: [2, 58], 75: [2, 58], 80: [2, 58], 81: [2, 58], 82: [2, 58], 83: [2, 58], 84: [2, 58], 85: [2, 58] }, { 33: [2, 64], 35: 69, 65: [2, 64], 72: [2, 64], 75: [2, 64], 80: [2, 64], 81: [2, 64], 82: [2, 64], 83: [2, 64], 84: [2, 64], 85: [2, 64] }, { 21: 70, 23: [2, 50], 65: [2, 50], 72: [2, 50], 80: [2, 50], 81: [2, 50], 82: [2, 50], 83: [2, 50], 84: [2, 50], 85: [2, 50] }, { 33: [2, 90], 61: 71, 65: [2, 90], 72: [2, 90], 80: [2, 90], 81: [2, 90], 82: [2, 90], 83: [2, 90], 84: [2, 90], 85: [2, 90] }, { 20: 75, 33: [2, 80], 50: 72, 63: 73, 64: 76, 65: [1, 44], 69: 74, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 72: [1, 80] }, { 23: [2, 42], 33: [2, 42], 54: [2, 42], 65: [2, 42], 68: [2, 42], 72: [2, 42], 75: [2, 42], 80: [2, 42], 81: [2, 42], 82: [2, 42], 83: [2, 42], 84: [2, 42], 85: [2, 42], 87: [1, 51] }, { 20: 75, 53: 81, 54: [2, 84], 63: 82, 64: 76, 65: [1, 44], 69: 83, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 26: 84, 47: [1, 67] }, { 47: [2, 55] }, { 4: 85, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 39: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 47: [2, 20] }, { 20: 86, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 87, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 26: 88, 47: [1, 67] }, { 47: [2, 57] }, { 5: [2, 11], 14: [2, 11], 15: [2, 11], 19: [2, 11], 29: [2, 11], 34: [2, 11], 39: [2, 11], 44: [2, 11], 47: [2, 11], 48: [2, 11], 51: [2, 11], 55: [2, 11], 60: [2, 11] }, { 15: [2, 49], 18: [2, 49] }, { 20: 75, 33: [2, 88], 58: 89, 63: 90, 64: 76, 65: [1, 44], 69: 91, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 65: [2, 94], 66: 92, 68: [2, 94], 72: [2, 94], 80: [2, 94], 81: [2, 94], 82: [2, 94], 83: [2, 94], 84: [2, 94], 85: [2, 94] }, { 5: [2, 25], 14: [2, 25], 15: [2, 25], 19: [2, 25], 29: [2, 25], 34: [2, 25], 39: [2, 25], 44: [2, 25], 47: [2, 25], 48: [2, 25], 51: [2, 25], 55: [2, 25], 60: [2, 25] }, { 20: 93, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 75, 31: 94, 33: [2, 60], 63: 95, 64: 76, 65: [1, 44], 69: 96, 70: 77, 71: 78, 72: [1, 79], 75: [2, 60], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 75, 33: [2, 66], 36: 97, 63: 98, 64: 76, 65: [1, 44], 69: 99, 70: 77, 71: 78, 72: [1, 79], 75: [2, 66], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 75, 22: 100, 23: [2, 52], 63: 101, 64: 76, 65: [1, 44], 69: 102, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 75, 33: [2, 92], 62: 103, 63: 104, 64: 76, 65: [1, 44], 69: 105, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [1, 106] }, { 33: [2, 79], 65: [2, 79], 72: [2, 79], 80: [2, 79], 81: [2, 79], 82: [2, 79], 83: [2, 79], 84: [2, 79], 85: [2, 79] }, { 33: [2, 81] }, { 23: [2, 27], 33: [2, 27], 54: [2, 27], 65: [2, 27], 68: [2, 27], 72: [2, 27], 75: [2, 27], 80: [2, 27], 81: [2, 27], 82: [2, 27], 83: [2, 27], 84: [2, 27], 85: [2, 27] }, { 23: [2, 28], 33: [2, 28], 54: [2, 28], 65: [2, 28], 68: [2, 28], 72: [2, 28], 75: [2, 28], 80: [2, 28], 81: [2, 28], 82: [2, 28], 83: [2, 28], 84: [2, 28], 85: [2, 28] }, { 23: [2, 30], 33: [2, 30], 54: [2, 30], 68: [2, 30], 71: 107, 72: [1, 108], 75: [2, 30] }, { 23: [2, 98], 33: [2, 98], 54: [2, 98], 68: [2, 98], 72: [2, 98], 75: [2, 98] }, { 23: [2, 45], 33: [2, 45], 54: [2, 45], 65: [2, 45], 68: [2, 45], 72: [2, 45], 73: [1, 109], 75: [2, 45], 80: [2, 45], 81: [2, 45], 82: [2, 45], 83: [2, 45], 84: [2, 45], 85: [2, 45], 87: [2, 45] }, { 23: [2, 44], 33: [2, 44], 54: [2, 44], 65: [2, 44], 68: [2, 44], 72: [2, 44], 75: [2, 44], 80: [2, 44], 81: [2, 44], 82: [2, 44], 83: [2, 44], 84: [2, 44], 85: [2, 44], 87: [2, 44] }, { 54: [1, 110] }, { 54: [2, 83], 65: [2, 83], 72: [2, 83], 80: [2, 83], 81: [2, 83], 82: [2, 83], 83: [2, 83], 84: [2, 83], 85: [2, 83] }, { 54: [2, 85] }, { 5: [2, 13], 14: [2, 13], 15: [2, 13], 19: [2, 13], 29: [2, 13], 34: [2, 13], 39: [2, 13], 44: [2, 13], 47: [2, 13], 48: [2, 13], 51: [2, 13], 55: [2, 13], 60: [2, 13] }, { 38: 56, 39: [1, 58], 43: 57, 44: [1, 59], 45: 112, 46: 111, 47: [2, 76] }, { 33: [2, 70], 40: 113, 65: [2, 70], 72: [2, 70], 75: [2, 70], 80: [2, 70], 81: [2, 70], 82: [2, 70], 83: [2, 70], 84: [2, 70], 85: [2, 70] }, { 47: [2, 18] }, { 5: [2, 14], 14: [2, 14], 15: [2, 14], 19: [2, 14], 29: [2, 14], 34: [2, 14], 39: [2, 14], 44: [2, 14], 47: [2, 14], 48: [2, 14], 51: [2, 14], 55: [2, 14], 60: [2, 14] }, { 33: [1, 114] }, { 33: [2, 87], 65: [2, 87], 72: [2, 87], 80: [2, 87], 81: [2, 87], 82: [2, 87], 83: [2, 87], 84: [2, 87], 85: [2, 87] }, { 33: [2, 89] }, { 20: 75, 63: 116, 64: 76, 65: [1, 44], 67: 115, 68: [2, 96], 69: 117, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [1, 118] }, { 32: 119, 33: [2, 62], 74: 120, 75: [1, 121] }, { 33: [2, 59], 65: [2, 59], 72: [2, 59], 75: [2, 59], 80: [2, 59], 81: [2, 59], 82: [2, 59], 83: [2, 59], 84: [2, 59], 85: [2, 59] }, { 33: [2, 61], 75: [2, 61] }, { 33: [2, 68], 37: 122, 74: 123, 75: [1, 121] }, { 33: [2, 65], 65: [2, 65], 72: [2, 65], 75: [2, 65], 80: [2, 65], 81: [2, 65], 82: [2, 65], 83: [2, 65], 84: [2, 65], 85: [2, 65] }, { 33: [2, 67], 75: [2, 67] }, { 23: [1, 124] }, { 23: [2, 51], 65: [2, 51], 72: [2, 51], 80: [2, 51], 81: [2, 51], 82: [2, 51], 83: [2, 51], 84: [2, 51], 85: [2, 51] }, { 23: [2, 53] }, { 33: [1, 125] }, { 33: [2, 91], 65: [2, 91], 72: [2, 91], 80: [2, 91], 81: [2, 91], 82: [2, 91], 83: [2, 91], 84: [2, 91], 85: [2, 91] }, { 33: [2, 93] }, { 5: [2, 22], 14: [2, 22], 15: [2, 22], 19: [2, 22], 29: [2, 22], 34: [2, 22], 39: [2, 22], 44: [2, 22], 47: [2, 22], 48: [2, 22], 51: [2, 22], 55: [2, 22], 60: [2, 22] }, { 23: [2, 99], 33: [2, 99], 54: [2, 99], 68: [2, 99], 72: [2, 99], 75: [2, 99] }, { 73: [1, 109] }, { 20: 75, 63: 126, 64: 76, 65: [1, 44], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 5: [2, 23], 14: [2, 23], 15: [2, 23], 19: [2, 23], 29: [2, 23], 34: [2, 23], 39: [2, 23], 44: [2, 23], 47: [2, 23], 48: [2, 23], 51: [2, 23], 55: [2, 23], 60: [2, 23] }, { 47: [2, 19] }, { 47: [2, 77] }, { 20: 75, 33: [2, 72], 41: 127, 63: 128, 64: 76, 65: [1, 44], 69: 129, 70: 77, 71: 78, 72: [1, 79], 75: [2, 72], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 5: [2, 24], 14: [2, 24], 15: [2, 24], 19: [2, 24], 29: [2, 24], 34: [2, 24], 39: [2, 24], 44: [2, 24], 47: [2, 24], 48: [2, 24], 51: [2, 24], 55: [2, 24], 60: [2, 24] }, { 68: [1, 130] }, { 65: [2, 95], 68: [2, 95], 72: [2, 95], 80: [2, 95], 81: [2, 95], 82: [2, 95], 83: [2, 95], 84: [2, 95], 85: [2, 95] }, { 68: [2, 97] }, { 5: [2, 21], 14: [2, 21], 15: [2, 21], 19: [2, 21], 29: [2, 21], 34: [2, 21], 39: [2, 21], 44: [2, 21], 47: [2, 21], 48: [2, 21], 51: [2, 21], 55: [2, 21], 60: [2, 21] }, { 33: [1, 131] }, { 33: [2, 63] }, { 72: [1, 133], 76: 132 }, { 33: [1, 134] }, { 33: [2, 69] }, { 15: [2, 12] }, { 14: [2, 26], 15: [2, 26], 19: [2, 26], 29: [2, 26], 34: [2, 26], 47: [2, 26], 48: [2, 26], 51: [2, 26], 55: [2, 26], 60: [2, 26] }, { 23: [2, 31], 33: [2, 31], 54: [2, 31], 68: [2, 31], 72: [2, 31], 75: [2, 31] }, { 33: [2, 74], 42: 135, 74: 136, 75: [1, 121] }, { 33: [2, 71], 65: [2, 71], 72: [2, 71], 75: [2, 71], 80: [2, 71], 81: [2, 71], 82: [2, 71], 83: [2, 71], 84: [2, 71], 85: [2, 71] }, { 33: [2, 73], 75: [2, 73] }, { 23: [2, 29], 33: [2, 29], 54: [2, 29], 65: [2, 29], 68: [2, 29], 72: [2, 29], 75: [2, 29], 80: [2, 29], 81: [2, 29], 82: [2, 29], 83: [2, 29], 84: [2, 29], 85: [2, 29] }, { 14: [2, 15], 15: [2, 15], 19: [2, 15], 29: [2, 15], 34: [2, 15], 39: [2, 15], 44: [2, 15], 47: [2, 15], 48: [2, 15], 51: [2, 15], 55: [2, 15], 60: [2, 15] }, { 72: [1, 138], 77: [1, 137] }, { 72: [2, 100], 77: [2, 100] }, { 14: [2, 16], 15: [2, 16], 19: [2, 16], 29: [2, 16], 34: [2, 16], 44: [2, 16], 47: [2, 16], 48: [2, 16], 51: [2, 16], 55: [2, 16], 60: [2, 16] }, { 33: [1, 139] }, { 33: [2, 75] }, { 33: [2, 32] }, { 72: [2, 101], 77: [2, 101] }, { 14: [2, 17], 15: [2, 17], 19: [2, 17], 29: [2, 17], 34: [2, 17], 39: [2, 17], 44: [2, 17], 47: [2, 17], 48: [2, 17], 51: [2, 17], 55: [2, 17], 60: [2, 17] }],
        defaultActions: { 4: [2, 1], 55: [2, 55], 57: [2, 20], 61: [2, 57], 74: [2, 81], 83: [2, 85], 87: [2, 18], 91: [2, 89], 102: [2, 53], 105: [2, 93], 111: [2, 19], 112: [2, 77], 117: [2, 97], 120: [2, 63], 123: [2, 69], 124: [2, 12], 136: [2, 75], 137: [2, 32] },
        parseError: function parseError(str, hash) {
            throw new Error(str);
        },
        parse: function parse(input) {
            var self = this,
                stack = [0],
                vstack = [null],
                lstack = [],
                table = this.table,
                yytext = "",
                yylineno = 0,
                yyleng = 0,
                recovering = 0,
                TERROR = 2,
                EOF = 1;
            this.lexer.setInput(input);
            this.lexer.yy = this.yy;
            this.yy.lexer = this.lexer;
            this.yy.parser = this;
            if (typeof this.lexer.yylloc == "undefined") this.lexer.yylloc = {};
            var yyloc = this.lexer.yylloc;
            lstack.push(yyloc);
            var ranges = this.lexer.options && this.lexer.options.ranges;
            if (typeof this.yy.parseError === "function") this.parseError = this.yy.parseError;
            function popStack(n) {
                stack.length = stack.length - 2 * n;
                vstack.length = vstack.length - n;
                lstack.length = lstack.length - n;
            }
            function lex() {
                var token;
                token = self.lexer.lex() || 1;
                if (typeof token !== "number") {
                    token = self.symbols_[token] || token;
                }
                return token;
            }
            var symbol,
                preErrorSymbol,
                state,
                action,
                a,
                r,
                yyval = {},
                p,
                len,
                newState,
                expected;
            while (true) {
                state = stack[stack.length - 1];
                if (this.defaultActions[state]) {
                    action = this.defaultActions[state];
                } else {
                    if (symbol === null || typeof symbol == "undefined") {
                        symbol = lex();
                    }
                    action = table[state] && table[state][symbol];
                }
                if (typeof action === "undefined" || !action.length || !action[0]) {
                    var errStr = "";
                    if (!recovering) {
                        expected = [];
                        for (p in table[state]) if (this.terminals_[p] && p > 2) {
                            expected.push("'" + this.terminals_[p] + "'");
                        }
                        if (this.lexer.showPosition) {
                            errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                        } else {
                            errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1 ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
                        }
                        this.parseError(errStr, { text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected });
                    }
                }
                if (action[0] instanceof Array && action.length > 1) {
                    throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
                }
                switch (action[0]) {
                    case 1:
                        stack.push(symbol);
                        vstack.push(this.lexer.yytext);
                        lstack.push(this.lexer.yylloc);
                        stack.push(action[1]);
                        symbol = null;
                        if (!preErrorSymbol) {
                            yyleng = this.lexer.yyleng;
                            yytext = this.lexer.yytext;
                            yylineno = this.lexer.yylineno;
                            yyloc = this.lexer.yylloc;
                            if (recovering > 0) recovering--;
                        } else {
                            symbol = preErrorSymbol;
                            preErrorSymbol = null;
                        }
                        break;
                    case 2:
                        len = this.productions_[action[1]][1];
                        yyval.$ = vstack[vstack.length - len];
                        yyval._$ = { first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column };
                        if (ranges) {
                            yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
                        }
                        r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
                        if (typeof r !== "undefined") {
                            return r;
                        }
                        if (len) {
                            stack = stack.slice(0, -1 * len * 2);
                            vstack = vstack.slice(0, -1 * len);
                            lstack = lstack.slice(0, -1 * len);
                        }
                        stack.push(this.productions_[action[1]][0]);
                        vstack.push(yyval.$);
                        lstack.push(yyval._$);
                        newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                        stack.push(newState);
                        break;
                    case 3:
                        return true;
                }
            }
            return true;
        }
    };
    /* Jison generated lexer */
    var lexer = (function () {
        var lexer = { EOF: 1,
            parseError: function parseError(str, hash) {
                if (this.yy.parser) {
                    this.yy.parser.parseError(str, hash);
                } else {
                    throw new Error(str);
                }
            },
            setInput: function setInput(input) {
                this._input = input;
                this._more = this._less = this.done = false;
                this.yylineno = this.yyleng = 0;
                this.yytext = this.matched = this.match = '';
                this.conditionStack = ['INITIAL'];
                this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 };
                if (this.options.ranges) this.yylloc.range = [0, 0];
                this.offset = 0;
                return this;
            },
            input: function input() {
                var ch = this._input[0];
                this.yytext += ch;
                this.yyleng++;
                this.offset++;
                this.match += ch;
                this.matched += ch;
                var lines = ch.match(/(?:\r\n?|\n).*/g);
                if (lines) {
                    this.yylineno++;
                    this.yylloc.last_line++;
                } else {
                    this.yylloc.last_column++;
                }
                if (this.options.ranges) this.yylloc.range[1]++;

                this._input = this._input.slice(1);
                return ch;
            },
            unput: function unput(ch) {
                var len = ch.length;
                var lines = ch.split(/(?:\r\n?|\n)/g);

                this._input = ch + this._input;
                this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
                //this.yyleng -= len;
                this.offset -= len;
                var oldLines = this.match.split(/(?:\r\n?|\n)/g);
                this.match = this.match.substr(0, this.match.length - 1);
                this.matched = this.matched.substr(0, this.matched.length - 1);

                if (lines.length - 1) this.yylineno -= lines.length - 1;
                var r = this.yylloc.range;

                this.yylloc = { first_line: this.yylloc.first_line,
                    last_line: this.yylineno + 1,
                    first_column: this.yylloc.first_column,
                    last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
                };

                if (this.options.ranges) {
                    this.yylloc.range = [r[0], r[0] + this.yyleng - len];
                }
                return this;
            },
            more: function more() {
                this._more = true;
                return this;
            },
            less: function less(n) {
                this.unput(this.match.slice(n));
            },
            pastInput: function pastInput() {
                var past = this.matched.substr(0, this.matched.length - this.match.length);
                return (past.length > 20 ? '...' : '') + past.substr(-20).replace(/\n/g, "");
            },
            upcomingInput: function upcomingInput() {
                var next = this.match;
                if (next.length < 20) {
                    next += this._input.substr(0, 20 - next.length);
                }
                return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
            },
            showPosition: function showPosition() {
                var pre = this.pastInput();
                var c = new Array(pre.length + 1).join("-");
                return pre + this.upcomingInput() + "\n" + c + "^";
            },
            next: function next() {
                if (this.done) {
                    return this.EOF;
                }
                if (!this._input) this.done = true;

                var token, match, tempMatch, index, col, lines;
                if (!this._more) {
                    this.yytext = '';
                    this.match = '';
                }
                var rules = this._currentRules();
                for (var i = 0; i < rules.length; i++) {
                    tempMatch = this._input.match(this.rules[rules[i]]);
                    if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                        match = tempMatch;
                        index = i;
                        if (!this.options.flex) break;
                    }
                }
                if (match) {
                    lines = match[0].match(/(?:\r\n?|\n).*/g);
                    if (lines) this.yylineno += lines.length;
                    this.yylloc = { first_line: this.yylloc.last_line,
                        last_line: this.yylineno + 1,
                        first_column: this.yylloc.last_column,
                        last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length };
                    this.yytext += match[0];
                    this.match += match[0];
                    this.matches = match;
                    this.yyleng = this.yytext.length;
                    if (this.options.ranges) {
                        this.yylloc.range = [this.offset, this.offset += this.yyleng];
                    }
                    this._more = false;
                    this._input = this._input.slice(match[0].length);
                    this.matched += match[0];
                    token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);
                    if (this.done && this._input) this.done = false;
                    if (token) return token;else return;
                }
                if (this._input === "") {
                    return this.EOF;
                } else {
                    return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), { text: "", token: null, line: this.yylineno });
                }
            },
            lex: function lex() {
                var r = this.next();
                if (typeof r !== 'undefined') {
                    return r;
                } else {
                    return this.lex();
                }
            },
            begin: function begin(condition) {
                this.conditionStack.push(condition);
            },
            popState: function popState() {
                return this.conditionStack.pop();
            },
            _currentRules: function _currentRules() {
                return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
            },
            topState: function topState() {
                return this.conditionStack[this.conditionStack.length - 2];
            },
            pushState: function begin(condition) {
                this.begin(condition);
            } };
        lexer.options = {};
        lexer.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START
        /**/) {

            function strip(start, end) {
                return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng - end);
            }

            var YYSTATE = YY_START;
            switch ($avoiding_name_collisions) {
                case 0:
                    if (yy_.yytext.slice(-2) === "\\\\") {
                        strip(0, 1);
                        this.begin("mu");
                    } else if (yy_.yytext.slice(-1) === "\\") {
                        strip(0, 1);
                        this.begin("emu");
                    } else {
                        this.begin("mu");
                    }
                    if (yy_.yytext) return 15;

                    break;
                case 1:
                    return 15;
                    break;
                case 2:
                    this.popState();
                    return 15;

                    break;
                case 3:
                    this.begin('raw');return 15;
                    break;
                case 4:
                    this.popState();
                    // Should be using `this.topState()` below, but it currently
                    // returns the second top instead of the first top. Opened an
                    // issue about it at https://github.com/zaach/jison/issues/291
                    if (this.conditionStack[this.conditionStack.length - 1] === 'raw') {
                        return 15;
                    } else {
                        yy_.yytext = yy_.yytext.substr(5, yy_.yyleng - 9);
                        return 'END_RAW_BLOCK';
                    }

                    break;
                case 5:
                    return 15;
                    break;
                case 6:
                    this.popState();
                    return 14;

                    break;
                case 7:
                    return 65;
                    break;
                case 8:
                    return 68;
                    break;
                case 9:
                    return 19;
                    break;
                case 10:
                    this.popState();
                    this.begin('raw');
                    return 23;

                    break;
                case 11:
                    return 55;
                    break;
                case 12:
                    return 60;
                    break;
                case 13:
                    return 29;
                    break;
                case 14:
                    return 47;
                    break;
                case 15:
                    this.popState();return 44;
                    break;
                case 16:
                    this.popState();return 44;
                    break;
                case 17:
                    return 34;
                    break;
                case 18:
                    return 39;
                    break;
                case 19:
                    return 51;
                    break;
                case 20:
                    return 48;
                    break;
                case 21:
                    this.unput(yy_.yytext);
                    this.popState();
                    this.begin('com');

                    break;
                case 22:
                    this.popState();
                    return 14;

                    break;
                case 23:
                    return 48;
                    break;
                case 24:
                    return 73;
                    break;
                case 25:
                    return 72;
                    break;
                case 26:
                    return 72;
                    break;
                case 27:
                    return 87;
                    break;
                case 28:
                    // ignore whitespace
                    break;
                case 29:
                    this.popState();return 54;
                    break;
                case 30:
                    this.popState();return 33;
                    break;
                case 31:
                    yy_.yytext = strip(1, 2).replace(/\\"/g, '"');return 80;
                    break;
                case 32:
                    yy_.yytext = strip(1, 2).replace(/\\'/g, "'");return 80;
                    break;
                case 33:
                    return 85;
                    break;
                case 34:
                    return 82;
                    break;
                case 35:
                    return 82;
                    break;
                case 36:
                    return 83;
                    break;
                case 37:
                    return 84;
                    break;
                case 38:
                    return 81;
                    break;
                case 39:
                    return 75;
                    break;
                case 40:
                    return 77;
                    break;
                case 41:
                    return 72;
                    break;
                case 42:
                    yy_.yytext = yy_.yytext.replace(/\\([\\\]])/g, '$1');return 72;
                    break;
                case 43:
                    return 'INVALID';
                    break;
                case 44:
                    return 5;
                    break;
            }
        };
        lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:\{\{\{\{(?=[^\/]))/, /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/, /^(?:[^\x00]*?(?=(\{\{\{\{)))/, /^(?:[\s\S]*?--(~)?\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{\{\{)/, /^(?:\}\}\}\})/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#>)/, /^(?:\{\{(~)?#\*?)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^\s*(~)?\}\})/, /^(?:\{\{(~)?\s*else\s*(~)?\}\})/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{(~)?!--)/, /^(?:\{\{(~)?![\s\S]*?\}\})/, /^(?:\{\{(~)?\*?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)|])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:undefined(?=([~}\s)])))/, /^(?:null(?=([~}\s)])))/, /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/, /^(?:as\s+\|)/, /^(?:\|)/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/, /^(?:\[(\\\]|[^\]])*\])/, /^(?:.)/, /^(?:$)/];
        lexer.conditions = { "mu": { "rules": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44], "inclusive": false }, "emu": { "rules": [2], "inclusive": false }, "com": { "rules": [6], "inclusive": false }, "raw": { "rules": [3, 4, 5], "inclusive": false }, "INITIAL": { "rules": [0, 1, 44], "inclusive": true } };
        return lexer;
    })();
    parser.lexer = lexer;
    function Parser() {
        this.yy = {};
    }Parser.prototype = parser;parser.Parser = Parser;
    return new Parser();
})();exports["default"] = handlebars;
module.exports = exports["default"];


},{}],34:[function(require,module,exports){
/* eslint-disable new-cap */
'use strict';

exports.__esModule = true;
exports.print = print;
exports.PrintVisitor = PrintVisitor;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _visitor = require('./visitor');

var _visitor2 = _interopRequireDefault(_visitor);

function print(ast) {
  return new PrintVisitor().accept(ast);
}

function PrintVisitor() {
  this.padding = 0;
}

PrintVisitor.prototype = new _visitor2['default']();

PrintVisitor.prototype.pad = function (string) {
  var out = '';

  for (var i = 0, l = this.padding; i < l; i++) {
    out += '  ';
  }

  out += string + '\n';
  return out;
};

PrintVisitor.prototype.Program = function (program) {
  var out = '',
      body = program.body,
      i = undefined,
      l = undefined;

  if (program.blockParams) {
    var blockParams = 'BLOCK PARAMS: [';
    for (i = 0, l = program.blockParams.length; i < l; i++) {
      blockParams += ' ' + program.blockParams[i];
    }
    blockParams += ' ]';
    out += this.pad(blockParams);
  }

  for (i = 0, l = body.length; i < l; i++) {
    out += this.accept(body[i]);
  }

  this.padding--;

  return out;
};

PrintVisitor.prototype.MustacheStatement = function (mustache) {
  return this.pad('{{ ' + this.SubExpression(mustache) + ' }}');
};
PrintVisitor.prototype.Decorator = function (mustache) {
  return this.pad('{{ DIRECTIVE ' + this.SubExpression(mustache) + ' }}');
};

PrintVisitor.prototype.BlockStatement = PrintVisitor.prototype.DecoratorBlock = function (block) {
  var out = '';

  out += this.pad((block.type === 'DecoratorBlock' ? 'DIRECTIVE ' : '') + 'BLOCK:');
  this.padding++;
  out += this.pad(this.SubExpression(block));
  if (block.program) {
    out += this.pad('PROGRAM:');
    this.padding++;
    out += this.accept(block.program);
    this.padding--;
  }
  if (block.inverse) {
    if (block.program) {
      this.padding++;
    }
    out += this.pad('{{^}}');
    this.padding++;
    out += this.accept(block.inverse);
    this.padding--;
    if (block.program) {
      this.padding--;
    }
  }
  this.padding--;

  return out;
};

PrintVisitor.prototype.PartialStatement = function (partial) {
  var content = 'PARTIAL:' + partial.name.original;
  if (partial.params[0]) {
    content += ' ' + this.accept(partial.params[0]);
  }
  if (partial.hash) {
    content += ' ' + this.accept(partial.hash);
  }
  return this.pad('{{> ' + content + ' }}');
};
PrintVisitor.prototype.PartialBlockStatement = function (partial) {
  var content = 'PARTIAL BLOCK:' + partial.name.original;
  if (partial.params[0]) {
    content += ' ' + this.accept(partial.params[0]);
  }
  if (partial.hash) {
    content += ' ' + this.accept(partial.hash);
  }

  content += ' ' + this.pad('PROGRAM:');
  this.padding++;
  content += this.accept(partial.program);
  this.padding--;

  return this.pad('{{> ' + content + ' }}');
};

PrintVisitor.prototype.ContentStatement = function (content) {
  return this.pad("CONTENT[ '" + content.value + "' ]");
};

PrintVisitor.prototype.CommentStatement = function (comment) {
  return this.pad("{{! '" + comment.value + "' }}");
};

PrintVisitor.prototype.SubExpression = function (sexpr) {
  var params = sexpr.params,
      paramStrings = [],
      hash = undefined;

  for (var i = 0, l = params.length; i < l; i++) {
    paramStrings.push(this.accept(params[i]));
  }

  params = '[' + paramStrings.join(', ') + ']';

  hash = sexpr.hash ? ' ' + this.accept(sexpr.hash) : '';

  return this.accept(sexpr.path) + ' ' + params + hash;
};

PrintVisitor.prototype.PathExpression = function (id) {
  var path = id.parts.join('/');
  return (id.data ? '@' : '') + 'PATH:' + path;
};

PrintVisitor.prototype.StringLiteral = function (string) {
  return '"' + string.value + '"';
};

PrintVisitor.prototype.NumberLiteral = function (number) {
  return 'NUMBER{' + number.value + '}';
};

PrintVisitor.prototype.BooleanLiteral = function (bool) {
  return 'BOOLEAN{' + bool.value + '}';
};

PrintVisitor.prototype.UndefinedLiteral = function () {
  return 'UNDEFINED';
};

PrintVisitor.prototype.NullLiteral = function () {
  return 'NULL';
};

PrintVisitor.prototype.Hash = function (hash) {
  var pairs = hash.pairs,
      joinedPairs = [];

  for (var i = 0, l = pairs.length; i < l; i++) {
    joinedPairs.push(this.accept(pairs[i]));
  }

  return 'HASH{' + joinedPairs.join(', ') + '}';
};
PrintVisitor.prototype.HashPair = function (pair) {
  return pair.key + '=' + this.accept(pair.value);
};
/* eslint-enable new-cap */


},{"./visitor":35}],35:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

function Visitor() {
  this.parents = [];
}

Visitor.prototype = {
  constructor: Visitor,
  mutating: false,

  // Visits a given value. If mutating, will replace the value if necessary.
  acceptKey: function acceptKey(node, name) {
    var value = this.accept(node[name]);
    if (this.mutating) {
      // Hacky sanity check: This may have a few false positives for type for the helper
      // methods but will generally do the right thing without a lot of overhead.
      if (value && !Visitor.prototype[value.type]) {
        throw new _exception2['default']('Unexpected node type "' + value.type + '" found when accepting ' + name + ' on ' + node.type);
      }
      node[name] = value;
    }
  },

  // Performs an accept operation with added sanity check to ensure
  // required keys are not removed.
  acceptRequired: function acceptRequired(node, name) {
    this.acceptKey(node, name);

    if (!node[name]) {
      throw new _exception2['default'](node.type + ' requires ' + name);
    }
  },

  // Traverses a given array. If mutating, empty respnses will be removed
  // for child elements.
  acceptArray: function acceptArray(array) {
    for (var i = 0, l = array.length; i < l; i++) {
      this.acceptKey(array, i);

      if (!array[i]) {
        array.splice(i, 1);
        i--;
        l--;
      }
    }
  },

  accept: function accept(object) {
    if (!object) {
      return;
    }

    /* istanbul ignore next: Sanity code */
    if (!this[object.type]) {
      throw new _exception2['default']('Unknown type: ' + object.type, object);
    }

    if (this.current) {
      this.parents.unshift(this.current);
    }
    this.current = object;

    var ret = this[object.type](object);

    this.current = this.parents.shift();

    if (!this.mutating || ret) {
      return ret;
    } else if (ret !== false) {
      return object;
    }
  },

  Program: function Program(program) {
    this.acceptArray(program.body);
  },

  MustacheStatement: visitSubExpression,
  Decorator: visitSubExpression,

  BlockStatement: visitBlock,
  DecoratorBlock: visitBlock,

  PartialStatement: visitPartial,
  PartialBlockStatement: function PartialBlockStatement(partial) {
    visitPartial.call(this, partial);

    this.acceptKey(partial, 'program');
  },

  ContentStatement: function ContentStatement() /* content */{},
  CommentStatement: function CommentStatement() /* comment */{},

  SubExpression: visitSubExpression,

  PathExpression: function PathExpression() /* path */{},

  StringLiteral: function StringLiteral() /* string */{},
  NumberLiteral: function NumberLiteral() /* number */{},
  BooleanLiteral: function BooleanLiteral() /* bool */{},
  UndefinedLiteral: function UndefinedLiteral() /* literal */{},
  NullLiteral: function NullLiteral() /* literal */{},

  Hash: function Hash(hash) {
    this.acceptArray(hash.pairs);
  },
  HashPair: function HashPair(pair) {
    this.acceptRequired(pair, 'value');
  }
};

function visitSubExpression(mustache) {
  this.acceptRequired(mustache, 'path');
  this.acceptArray(mustache.params);
  this.acceptKey(mustache, 'hash');
}
function visitBlock(block) {
  visitSubExpression.call(this, block);

  this.acceptKey(block, 'program');
  this.acceptKey(block, 'inverse');
}
function visitPartial(partial) {
  this.acceptRequired(partial, 'name');
  this.acceptArray(partial.params);
  this.acceptKey(partial, 'hash');
}

exports['default'] = Visitor;
module.exports = exports['default'];


},{"../exception":39}],36:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _visitor = require('./visitor');

var _visitor2 = _interopRequireDefault(_visitor);

function WhitespaceControl() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  this.options = options;
}
WhitespaceControl.prototype = new _visitor2['default']();

WhitespaceControl.prototype.Program = function (program) {
  var doStandalone = !this.options.ignoreStandalone;

  var isRoot = !this.isRootSeen;
  this.isRootSeen = true;

  var body = program.body;
  for (var i = 0, l = body.length; i < l; i++) {
    var current = body[i],
        strip = this.accept(current);

    if (!strip) {
      continue;
    }

    var _isPrevWhitespace = isPrevWhitespace(body, i, isRoot),
        _isNextWhitespace = isNextWhitespace(body, i, isRoot),
        openStandalone = strip.openStandalone && _isPrevWhitespace,
        closeStandalone = strip.closeStandalone && _isNextWhitespace,
        inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;

    if (strip.close) {
      omitRight(body, i, true);
    }
    if (strip.open) {
      omitLeft(body, i, true);
    }

    if (doStandalone && inlineStandalone) {
      omitRight(body, i);

      if (omitLeft(body, i)) {
        // If we are on a standalone node, save the indent info for partials
        if (current.type === 'PartialStatement') {
          // Pull out the whitespace from the final line
          current.indent = /([ \t]+$)/.exec(body[i - 1].original)[1];
        }
      }
    }
    if (doStandalone && openStandalone) {
      omitRight((current.program || current.inverse).body);

      // Strip out the previous content node if it's whitespace only
      omitLeft(body, i);
    }
    if (doStandalone && closeStandalone) {
      // Always strip the next node
      omitRight(body, i);

      omitLeft((current.inverse || current.program).body);
    }
  }

  return program;
};

WhitespaceControl.prototype.BlockStatement = WhitespaceControl.prototype.DecoratorBlock = WhitespaceControl.prototype.PartialBlockStatement = function (block) {
  this.accept(block.program);
  this.accept(block.inverse);

  // Find the inverse program that is involed with whitespace stripping.
  var program = block.program || block.inverse,
      inverse = block.program && block.inverse,
      firstInverse = inverse,
      lastInverse = inverse;

  if (inverse && inverse.chained) {
    firstInverse = inverse.body[0].program;

    // Walk the inverse chain to find the last inverse that is actually in the chain.
    while (lastInverse.chained) {
      lastInverse = lastInverse.body[lastInverse.body.length - 1].program;
    }
  }

  var strip = {
    open: block.openStrip.open,
    close: block.closeStrip.close,

    // Determine the standalone candiacy. Basically flag our content as being possibly standalone
    // so our parent can determine if we actually are standalone
    openStandalone: isNextWhitespace(program.body),
    closeStandalone: isPrevWhitespace((firstInverse || program).body)
  };

  if (block.openStrip.close) {
    omitRight(program.body, null, true);
  }

  if (inverse) {
    var inverseStrip = block.inverseStrip;

    if (inverseStrip.open) {
      omitLeft(program.body, null, true);
    }

    if (inverseStrip.close) {
      omitRight(firstInverse.body, null, true);
    }
    if (block.closeStrip.open) {
      omitLeft(lastInverse.body, null, true);
    }

    // Find standalone else statments
    if (!this.options.ignoreStandalone && isPrevWhitespace(program.body) && isNextWhitespace(firstInverse.body)) {
      omitLeft(program.body);
      omitRight(firstInverse.body);
    }
  } else if (block.closeStrip.open) {
    omitLeft(program.body, null, true);
  }

  return strip;
};

WhitespaceControl.prototype.Decorator = WhitespaceControl.prototype.MustacheStatement = function (mustache) {
  return mustache.strip;
};

WhitespaceControl.prototype.PartialStatement = WhitespaceControl.prototype.CommentStatement = function (node) {
  /* istanbul ignore next */
  var strip = node.strip || {};
  return {
    inlineStandalone: true,
    open: strip.open,
    close: strip.close
  };
};

function isPrevWhitespace(body, i, isRoot) {
  if (i === undefined) {
    i = body.length;
  }

  // Nodes that end with newlines are considered whitespace (but are special
  // cased for strip operations)
  var prev = body[i - 1],
      sibling = body[i - 2];
  if (!prev) {
    return isRoot;
  }

  if (prev.type === 'ContentStatement') {
    return (sibling || !isRoot ? /\r?\n\s*?$/ : /(^|\r?\n)\s*?$/).test(prev.original);
  }
}
function isNextWhitespace(body, i, isRoot) {
  if (i === undefined) {
    i = -1;
  }

  var next = body[i + 1],
      sibling = body[i + 2];
  if (!next) {
    return isRoot;
  }

  if (next.type === 'ContentStatement') {
    return (sibling || !isRoot ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(next.original);
  }
}

// Marks the node to the right of the position as omitted.
// I.e. {{foo}}' ' will mark the ' ' node as omitted.
//
// If i is undefined, then the first child will be marked as such.
//
// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
// content is met.
function omitRight(body, i, multiple) {
  var current = body[i == null ? 0 : i + 1];
  if (!current || current.type !== 'ContentStatement' || !multiple && current.rightStripped) {
    return;
  }

  var original = current.value;
  current.value = current.value.replace(multiple ? /^\s+/ : /^[ \t]*\r?\n?/, '');
  current.rightStripped = current.value !== original;
}

// Marks the node to the left of the position as omitted.
// I.e. ' '{{foo}} will mark the ' ' node as omitted.
//
// If i is undefined then the last child will be marked as such.
//
// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
// content is met.
function omitLeft(body, i, multiple) {
  var current = body[i == null ? body.length - 1 : i - 1];
  if (!current || current.type !== 'ContentStatement' || !multiple && current.leftStripped) {
    return;
  }

  // We omit the last node if it's whitespace only and not preceeded by a non-content node.
  var original = current.value;
  current.value = current.value.replace(multiple ? /\s+$/ : /[ \t]+$/, '');
  current.leftStripped = current.value !== original;
  return current.leftStripped;
}

exports['default'] = WhitespaceControl;
module.exports = exports['default'];


},{"./visitor":35}],37:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.registerDefaultDecorators = registerDefaultDecorators;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _decoratorsInline = require('./decorators/inline');

var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);

function registerDefaultDecorators(instance) {
  _decoratorsInline2['default'](instance);
}


},{"./decorators/inline":38}],38:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerDecorator('inline', function (fn, props, container, options) {
    var ret = fn;
    if (!props.partials) {
      props.partials = {};
      ret = function (context, options) {
        // Create a new partials stack frame prior to exec.
        var original = container.partials;
        container.partials = _utils.extend({}, original, props.partials);
        var ret = fn(context, options);
        container.partials = original;
        return ret;
      };
    }

    props.partials[options.args[0]] = options.fn;

    return ret;
  });
};

module.exports = exports['default'];


},{"../utils":52}],39:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      column = undefined;
  if (loc) {
    line = loc.start.line;
    column = loc.start.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  /* istanbul ignore else */
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  try {
    if (loc) {
      this.lineNumber = line;

      // Work around issue under safari where we can't directly set the column value
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(this, 'column', {
          value: column,
          enumerable: true
        });
      } else {
        this.column = column;
      }
    }
  } catch (nop) {
    /* Ignore if the browser is very particular */
  }
}

Exception.prototype = new Error();

exports['default'] = Exception;
module.exports = exports['default'];


},{}],40:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.registerDefaultHelpers = registerDefaultHelpers;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersBlockHelperMissing = require('./helpers/block-helper-missing');

var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);

var _helpersEach = require('./helpers/each');

var _helpersEach2 = _interopRequireDefault(_helpersEach);

var _helpersHelperMissing = require('./helpers/helper-missing');

var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);

var _helpersIf = require('./helpers/if');

var _helpersIf2 = _interopRequireDefault(_helpersIf);

var _helpersLog = require('./helpers/log');

var _helpersLog2 = _interopRequireDefault(_helpersLog);

var _helpersLookup = require('./helpers/lookup');

var _helpersLookup2 = _interopRequireDefault(_helpersLookup);

var _helpersWith = require('./helpers/with');

var _helpersWith2 = _interopRequireDefault(_helpersWith);

function registerDefaultHelpers(instance) {
  _helpersBlockHelperMissing2['default'](instance);
  _helpersEach2['default'](instance);
  _helpersHelperMissing2['default'](instance);
  _helpersIf2['default'](instance);
  _helpersLog2['default'](instance);
  _helpersLookup2['default'](instance);
  _helpersWith2['default'](instance);
}


},{"./helpers/block-helper-missing":41,"./helpers/each":42,"./helpers/helper-missing":43,"./helpers/if":44,"./helpers/log":45,"./helpers/lookup":46,"./helpers/with":47}],41:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (_utils.isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });
};

module.exports = exports['default'];


},{"../utils":52}],42:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('../utils');

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = _utils.createFrame(options.data);
    }

    function execIteration(field, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (_utils.isArray(context)) {
        for (var j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, i, i === context.length - 1);
          }
        }
      } else {
        var priorKey = undefined;

        for (var key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey !== undefined) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          }
        }
        if (priorKey !== undefined) {
          execIteration(priorKey, i - 1, true);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });
};

module.exports = exports['default'];


},{"../exception":39,"../utils":52}],43:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('helperMissing', function () /* [args, ]options */{
    if (arguments.length === 1) {
      // A missing field in a {{foo}} construct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });
};

module.exports = exports['default'];


},{"../exception":39}],44:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('if', function (conditional, options) {
    if (_utils.isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
  });
};

module.exports = exports['default'];


},{"../utils":52}],45:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('log', function () /* message, options */{
    var args = [undefined],
        options = arguments[arguments.length - 1];
    for (var i = 0; i < arguments.length - 1; i++) {
      args.push(arguments[i]);
    }

    var level = 1;
    if (options.hash.level != null) {
      level = options.hash.level;
    } else if (options.data && options.data.level != null) {
      level = options.data.level;
    }
    args[0] = level;

    instance.log.apply(instance, args);
  });
};

module.exports = exports['default'];


},{}],46:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('lookup', function (obj, field) {
    return obj && obj[field];
  });
};

module.exports = exports['default'];


},{}],47:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('with', function (context, options) {
    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!_utils.isEmpty(context)) {
      var data = options.data;
      if (options.data && options.ids) {
        data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
      }

      return fn(context, {
        data: data,
        blockParams: _utils.blockParams([context], [data && data.contextPath])
      });
    } else {
      return options.inverse(this);
    }
  });
};

module.exports = exports['default'];


},{"../utils":52}],48:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('./utils');

var logger = {
  methodMap: ['debug', 'info', 'warn', 'error'],
  level: 'info',

  // Maps a given level value to the `methodMap` indexes above.
  lookupLevel: function lookupLevel(level) {
    if (typeof level === 'string') {
      var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
      if (levelMap >= 0) {
        level = levelMap;
      } else {
        level = parseInt(level, 10);
      }
    }

    return level;
  },

  // Can be overridden in the host environment
  log: function log(level) {
    level = logger.lookupLevel(level);

    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
      var method = logger.methodMap[level];
      if (!console[method]) {
        // eslint-disable-line no-console
        method = 'log';
      }

      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        message[_key - 1] = arguments[_key];
      }

      console[method].apply(console, message); // eslint-disable-line no-console
    }
  }
};

exports['default'] = logger;
module.exports = exports['default'];


},{"./utils":52}],49:[function(require,module,exports){
(function (global){
/* global window */
'use strict';

exports.__esModule = true;

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof global !== 'undefined' ? global : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
    return Handlebars;
  };
};

module.exports = exports['default'];


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],50:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.checkRevision = checkRevision;
exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _utils = require('./utils');

var Utils = _interopRequireWildcard(_utils);

var _exception = require('./exception');

var _exception2 = _interopRequireDefault(_exception);

var _base = require('./base');

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _base.COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
          compilerVersions = _base.REVISION_CHANGES[compilerRevision];
      throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
    }
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  templateSpec.main.decorator = templateSpec.main_d;

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
      if (options.ids) {
        options.ids[0] = true;
      }
    }

    partial = env.VM.resolvePartial.call(this, partial, context, options);
    var result = env.VM.invokePartial.call(this, partial, context, options);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, options);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name) {
      if (!(name in obj)) {
        throw new _exception2['default']('"' + name + '" not defined in ' + obj);
      }
      return obj[name];
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        if (depths[i] && depths[i][name] != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      var ret = templateSpec[i];
      ret.decorator = templateSpec[i + '_d'];
      return ret;
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    merge: function merge(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },
    // An empty object to use as replacement for null-contexts
    nullContext: Object.seal({}),

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      if (options.depths) {
        depths = context != options.depths[0] ? [context].concat(options.depths) : options.depths;
      } else {
        depths = [context];
      }
    }

    function main(context /*, options*/) {
      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
    }
    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
    return main(context, options);
  }
  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
      if (templateSpec.usePartial || templateSpec.useDecorators) {
        container.decorators = container.merge(options.decorators, env.decorators);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
      container.decorators = options.decorators;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var currentDepths = depths;
    if (depths && context != depths[0] && !(context === container.nullContext && depths[0] === null)) {
      currentDepths = [context].concat(depths);
    }

    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
  }

  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

function resolvePartial(partial, context, options) {
  if (!partial) {
    if (options.name === '@partial-block') {
      partial = options.data['partial-block'];
    } else {
      partial = options.partials[options.name];
    }
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  // Use the current closure context to save the partial-block if this partial
  var currentPartialBlock = options.data && options.data['partial-block'];
  options.partial = true;
  if (options.ids) {
    options.data.contextPath = options.ids[0] || options.data.contextPath;
  }

  var partialBlock = undefined;
  if (options.fn && options.fn !== noop) {
    (function () {
      options.data = _base.createFrame(options.data);
      // Wrapper function to get access to currentPartialBlock from the closure
      var fn = options.fn;
      partialBlock = options.data['partial-block'] = function partialBlockWrapper(context) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        // Restore the partial-block from the closure for the execution of the block
        // i.e. the part inside the block of the partial call.
        options.data = _base.createFrame(options.data);
        options.data['partial-block'] = currentPartialBlock;
        return fn(context, options);
      };
      if (fn.partials) {
        options.partials = Utils.extend({}, options.partials, fn.partials);
      }
    })();
  }

  if (partial === undefined && partialBlock) {
    partial = partialBlock;
  }

  if (partial === undefined) {
    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _base.createFrame(data) : {};
    data.root = context;
  }
  return data;
}

function executeDecorators(fn, prog, container, depths, data, blockParams) {
  if (fn.decorator) {
    var props = {};
    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
    Utils.extend(prog, props);
  }
  return prog;
}


},{"./base":26,"./exception":39,"./utils":52}],51:[function(require,module,exports){
// Build out our basic SafeString type
'use strict';

exports.__esModule = true;
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];


},{}],52:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.extend = extend;
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.createFrame = createFrame;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

var badChars = /[&<>"'`=]/g,
    possible = /[&<>"'`=]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/* eslint-disable func-style */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  exports.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
exports.isFunction = isFunction;

/* eslint-enable func-style */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};

exports.isArray = isArray;
// Older IE versions do not directly support indexOf so we must implement our own, sadly.

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function createFrame(object) {
  var frame = extend({}, object);
  frame._parent = object;
  return frame;
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}


},{}],53:[function(require,module,exports){
// USAGE:
// var handlebars = require('handlebars');
/* eslint-disable no-var */

// var local = handlebars.create();

var handlebars = require('../dist/cjs/handlebars')['default'];

var printer = require('../dist/cjs/handlebars/compiler/printer');
handlebars.PrintVisitor = printer.PrintVisitor;
handlebars.print = printer.print;

module.exports = handlebars;

// Publish a Node.js require() handler for .handlebars and .hbs files
function extension(module, filename) {
  var fs = require('fs');
  var templateString = fs.readFileSync(filename, 'utf8');
  module.exports = handlebars.compile(templateString);
}
/* istanbul ignore else */
if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.handlebars'] = extension;
  require.extensions['.hbs'] = extension;
}

},{"../dist/cjs/handlebars":24,"../dist/cjs/handlebars/compiler/printer":34,"fs":2}],54:[function(require,module,exports){
module.exports = require('cssify');

},{"cssify":18}],55:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Bulgarian
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'bg',
        cultureCode: 'bg',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'И',
            million: 'А',
            billion: 'M',
            trillion: 'T'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'лв.'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        this.numbro.culture('bg', language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],56:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Czech
 * locale: Czech Republic
 * author : Jan Pesa : https://github.com/smajl (based on work from Anatoli Papirovski : https://github.com/apapirovski)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'cs-CZ',
        cultureCode: 'cs-CZ',
        delimiters: {
            thousands: '\u00a0',
            decimal: ','
        },
        abbreviations: {
            thousand: 'tis.',
            million: 'mil.',
            billion: 'mld.',
            trillion: 'bil.'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'Kč',
            position: 'postfix',
            spaceSeparated: true
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],57:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Danish
 * locale: Denmark
 * author : Michael Storgaard : https://github.com/mstorgaard
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'da-DK',
        cultureCode: 'da-DK',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'mio',
            billion: 'mia',
            trillion: 'b'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'kr',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],58:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : German
 * locale: Austria
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'de-AT',
        cultureCode: 'de-AT',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '€'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],59:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : German
 * locale: Switzerland
 * author : Michael Piefel : https://github.com/piefel (based on work from Marco Krage : https://github.com/sinky)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'de-CH',
        cultureCode: 'de-CH',
        delimiters: {
            thousands: '\'',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'CHF',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],60:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : German
 * locale: Germany
 * author : Marco Krage : https://github.com/sinky
 *
 * Generally useful in Germany, Austria, Luxembourg, Belgium
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'de-DE',
        cultureCode: 'de-DE',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '€',
            position: 'postfix',
            spaceSeparated: true
        },
        defaults: {
            currencyFormat: ',4'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],61:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : German
 * locale: Liechtenstein
 * author : Michael Piefel : https://github.com/piefel (based on work from Marco Krage : https://github.com/sinky)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'de-LI',
        cultureCode: 'de-LI',
        delimiters: {
            thousands: '\'',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'CHF',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],62:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Greek (el)
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'el',
        cultureCode: 'el',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'χ',
            million: 'ε',
            billion: 'δ',
            trillion: 'τ'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '€'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('el', language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],63:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : English
 * locale: Australia
 * author : Benedikt Huss : https://github.com/ben305
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'en-AU',
        cultureCode: 'en-AU',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        },
        currency: {
            symbol: '$',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: '$ ,0.00',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: '$ ,0'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],64:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : English
 * locale: United Kingdom of Great Britain and Northern Ireland
 * author : Dan Ristic : https://github.com/dristic
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'en-GB',
        cultureCode: 'en-GB',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        },
        currency: {
            symbol: '£',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: '$ ,0.00',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: '$ ,0'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],65:[function(require,module,exports){
/*!
+ * numbro.js language configuration
 * language : English
 * locale: Ireland
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'en-IE',
        cultureCode: 'en-IE',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                    (b === 2) ? 'nd' :
                        (b === 3) ? 'rd' : 'th';
        },
        currency: {
            symbol: '€'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('en-gb', language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],66:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : English
 * locale: New Zealand
 * author : Benedikt Huss : https://github.com/ben305
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'en-NZ',
        cultureCode: 'en-NZ',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        },
        currency: {
            symbol: '$',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: '$ ,0.00',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: '$ ,0'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],67:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : English
 * locale: South Africa
 * author : Stewart Scott https://github.com/stewart42
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'en-ZA',
        cultureCode: 'en-ZA',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        },
        currency: {
            symbol: 'R',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: '$ ,0.00',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: '$ ,0'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],68:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Argentina
 * author : Hernan Garcia : https://github.com/hgarcia
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'es-AR',
        cultureCode: 'es-AR',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'mm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (b === 1 || b === 3) ? 'er' :
                (b === 2) ? 'do' :
                (b === 7 || b === 0) ? 'mo' :
        (b === 8) ? 'vo' :
        (b === 9) ? 'no' : 'to';
        },
        currency: {
            symbol: '$',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],69:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Chile
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'es-CL',
        cultureCode: 'es-CL',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'mm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (b === 1 || b === 3) ? 'er' :
                (b === 2) ? 'do' :
                    (b === 7 || b === 0) ? 'mo' :
                        (b === 8) ? 'vo' :
                            (b === 9) ? 'no' : 'to';
        },
        currency: {
            symbol: '$',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: '$0,0'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],70:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Colombia
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'es-CO',
        cultureCode: 'es-CO',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'mm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (b === 1 || b === 3) ? 'er' :
                (b === 2) ? 'do' :
                    (b === 7 || b === 0) ? 'mo' :
                        (b === 8) ? 'vo' :
                            (b === 9) ? 'no' : 'to';
        },
        currency: {
            symbol: '€',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],71:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Costa Rica
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'es-CR',
        cultureCode: 'es-CR',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'mm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (b === 1 || b === 3) ? 'er' :
                (b === 2) ? 'do' :
                    (b === 7 || b === 0) ? 'mo' :
                        (b === 8) ? 'vo' :
                            (b === 9) ? 'no' : 'to';
        },
        currency: {
            symbol: '₡',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],72:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Spain
 * author : Hernan Garcia : https://github.com/hgarcia
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'es-ES',
        cultureCode: 'es-ES',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'mm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (b === 1 || b === 3) ? 'er' :
                (b === 2) ? 'do' :
                    (b === 7 || b === 0) ? 'mo' :
                        (b === 8) ? 'vo' :
                            (b === 9) ? 'no' : 'to';
        },
        currency: {
            symbol: '€',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],73:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Nicaragua
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'es-NI',
        cultureCode: 'es-NI',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'mm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (b === 1 || b === 3) ? 'er' :
                (b === 2) ? 'do' :
                    (b === 7 || b === 0) ? 'mo' :
                        (b === 8) ? 'vo' :
                            (b === 9) ? 'no' : 'to';
        },
        currency: {
            symbol: 'C$',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],74:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Peru
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'es-PE',
        cultureCode: 'es-PE',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'mm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (b === 1 || b === 3) ? 'er' :
                (b === 2) ? 'do' :
                    (b === 7 || b === 0) ? 'mo' :
                        (b === 8) ? 'vo' :
                            (b === 9) ? 'no' : 'to';
        },
        currency: {
            symbol: 'S/.',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],75:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Puerto Rico
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'es-PR',
        cultureCode: 'es-PR',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'mm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (b === 1 || b === 3) ? 'er' :
                (b === 2) ? 'do' :
                    (b === 7 || b === 0) ? 'mo' :
                        (b === 8) ? 'vo' :
                            (b === 9) ? 'no' : 'to';
        },
        currency: {
            symbol: '$',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],76:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Spanish
 * locale: El Salvador
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'es-SV',
        cultureCode: 'es-SV',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'mm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (b === 1 || b === 3) ? 'er' :
                (b === 2) ? 'do' :
                    (b === 7 || b === 0) ? 'mo' :
                        (b === 8) ? 'vo' :
                            (b === 9) ? 'no' : 'to';
        },
        currency: {
            symbol: '$',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],77:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Estonian
 * locale: Estonia
 * author : Illimar Tambek : https://github.com/ragulka
 *
 * Note: in Estonian, abbreviations are always separated
 * from numbers with a space
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'et-EE',
        cultureCode: 'et-EE',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: ' tuh',
            million: ' mln',
            billion: ' mld',
            trillion: ' trl'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '€',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],78:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Farsi
 * locale: Iran
 * author : neo13 : https://github.com/neo13
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'fa-IR',
        cultureCode: 'fa-IR',
        delimiters: {
            thousands: '،',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'هزار',
            million: 'میلیون',
            billion: 'میلیارد',
            trillion: 'تریلیون'
        },
        ordinal: function () {
            return 'ام';
        },
        currency: {
            symbol: '﷼'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],79:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Finnish
 * locale: Finland
 * author : Sami Saada : https://github.com/samitheberber
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'fi-FI',
        cultureCode: 'fi-FI',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'M',
            billion: 'G',
            trillion: 'T'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '€',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],80:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Filipino (Pilipino)
 * locale: Philippines
 * author : Michael Abadilla : https://github.com/mjmaix
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'fil-PH',
        cultureCode: 'fil-PH',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        },
        currency: {
            symbol: '₱'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],81:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : French
 * locale: Canada
 * author : Léo Renaud-Allaire : https://github.com/renaudleo
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'fr-CA',
        cultureCode: 'fr-CA',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'M',
            billion: 'G',
            trillion: 'T'
        },
        ordinal : function (number) {
            return number === 1 ? 'er' : 'ème';
        },
        currency: {
            symbol: '$',
            position: 'postfix',
            spaceSeparated : true
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: '$ ,0.00',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: '$ ,0'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],82:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : French
 * locale: Switzerland
 * author : Adam Draper : https://github.com/adamwdraper
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'fr-CH',
        cultureCode: 'fr-CH',
        delimiters: {
            thousands: ' ',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal : function (number) {
            return number === 1 ? 'er' : 'ème';
        },
        currency: {
            symbol: 'CHF',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],83:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : French
 * locale: France
 * author : Adam Draper : https://github.com/adamwdraper
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'fr-FR',
        cultureCode: 'fr-FR',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal : function (number) {
            return number === 1 ? 'er' : 'ème';
        },
        currency: {
            symbol: '€',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],84:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Hebrew
 * locale : IL
 * author : Eli Zehavi : https://github.com/eli-zehavi
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'he-IL',
        cultureCode: 'he-IL',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'אלף',
            million: 'מליון',
            billion: 'בליון',
            trillion: 'טריליון'
        },
        currency: {
            symbol: '₪',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: '₪ ,0.00',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: '₪ ,0'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));


},{}],85:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Hungarian
 * locale: Hungary
 * author : Peter Bakondy : https://github.com/pbakondy
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'hu-HU',
        cultureCode: 'hu-HU',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'E',  // ezer
            million: 'M',   // millió
            billion: 'Mrd', // milliárd
            trillion: 'T'   // trillió
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: ' Ft',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],86:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Indonesian
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'id',
        cultureCode: 'id',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'r',
            million: 'j',
            billion: 'm',
            trillion: 't'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'Rp'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('id', language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],87:[function(require,module,exports){
/* jshint sub: true */
exports['bg'] = require('./bg.js');
exports['cs-CZ'] = require('./cs-CZ.js');
exports['da-DK'] = require('./da-DK.js');
exports['de-AT'] = require('./de-AT.js');
exports['de-CH'] = require('./de-CH.js');
exports['de-DE'] = require('./de-DE.js');
exports['de-LI'] = require('./de-LI.js');
exports['el'] = require('./el.js');
exports['en-AU'] = require('./en-AU.js');
exports['en-GB'] = require('./en-GB.js');
exports['en-IE'] = require('./en-IE.js');
exports['en-NZ'] = require('./en-NZ.js');
exports['en-ZA'] = require('./en-ZA.js');
exports['es-AR'] = require('./es-AR.js');
exports['es-CL'] = require('./es-CL.js');
exports['es-CO'] = require('./es-CO.js');
exports['es-CR'] = require('./es-CR.js');
exports['es-ES'] = require('./es-ES.js');
exports['es-NI'] = require('./es-NI.js');
exports['es-PE'] = require('./es-PE.js');
exports['es-PR'] = require('./es-PR.js');
exports['es-SV'] = require('./es-SV.js');
exports['et-EE'] = require('./et-EE.js');
exports['fa-IR'] = require('./fa-IR.js');
exports['fi-FI'] = require('./fi-FI.js');
exports['fil-PH'] = require('./fil-PH.js');
exports['fr-CA'] = require('./fr-CA.js');
exports['fr-CH'] = require('./fr-CH.js');
exports['fr-FR'] = require('./fr-FR.js');
exports['he-IL'] = require('./he-IL.js');
exports['hu-HU'] = require('./hu-HU.js');
exports['id'] = require('./id.js');
exports['it-CH'] = require('./it-CH.js');
exports['it-IT'] = require('./it-IT.js');
exports['ja-JP'] = require('./ja-JP.js');
exports['ko-KR'] = require('./ko-KR.js');
exports['lv-LV'] = require('./lv-LV.js');
exports['nb-NO'] = require('./nb-NO.js');
exports['nb'] = require('./nb.js');
exports['nl-BE'] = require('./nl-BE.js');
exports['nl-NL'] = require('./nl-NL.js');
exports['nn'] = require('./nn.js');
exports['pl-PL'] = require('./pl-PL.js');
exports['pt-BR'] = require('./pt-BR.js');
exports['pt-PT'] = require('./pt-PT.js');
exports['ro-RO'] = require('./ro-RO.js');
exports['ro'] = require('./ro.js');
exports['ru-RU'] = require('./ru-RU.js');
exports['ru-UA'] = require('./ru-UA.js');
exports['sk-SK'] = require('./sk-SK.js');
exports['sl'] = require('./sl.js');
exports['sr-Cyrl-RS'] = require('./sr-Cyrl-RS.js');
exports['sv-SE'] = require('./sv-SE.js');
exports['th-TH'] = require('./th-TH.js');
exports['tr-TR'] = require('./tr-TR.js');
exports['uk-UA'] = require('./uk-UA.js');
exports['zh-CN'] = require('./zh-CN.js');
exports['zh-MO'] = require('./zh-MO.js');
exports['zh-SG'] = require('./zh-SG.js');
exports['zh-TW'] = require('./zh-TW.js');
},{"./bg.js":55,"./cs-CZ.js":56,"./da-DK.js":57,"./de-AT.js":58,"./de-CH.js":59,"./de-DE.js":60,"./de-LI.js":61,"./el.js":62,"./en-AU.js":63,"./en-GB.js":64,"./en-IE.js":65,"./en-NZ.js":66,"./en-ZA.js":67,"./es-AR.js":68,"./es-CL.js":69,"./es-CO.js":70,"./es-CR.js":71,"./es-ES.js":72,"./es-NI.js":73,"./es-PE.js":74,"./es-PR.js":75,"./es-SV.js":76,"./et-EE.js":77,"./fa-IR.js":78,"./fi-FI.js":79,"./fil-PH.js":80,"./fr-CA.js":81,"./fr-CH.js":82,"./fr-FR.js":83,"./he-IL.js":84,"./hu-HU.js":85,"./id.js":86,"./it-CH.js":88,"./it-IT.js":89,"./ja-JP.js":90,"./ko-KR.js":91,"./lv-LV.js":92,"./nb-NO.js":93,"./nb.js":94,"./nl-BE.js":95,"./nl-NL.js":96,"./nn.js":97,"./pl-PL.js":98,"./pt-BR.js":99,"./pt-PT.js":100,"./ro-RO.js":101,"./ro.js":102,"./ru-RU.js":103,"./ru-UA.js":104,"./sk-SK.js":105,"./sl.js":106,"./sr-Cyrl-RS.js":107,"./sv-SE.js":108,"./th-TH.js":109,"./tr-TR.js":110,"./uk-UA.js":111,"./zh-CN.js":112,"./zh-MO.js":113,"./zh-SG.js":114,"./zh-TW.js":115}],88:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Italian
 * locale: Switzerland
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'it-CH',
        cultureCode: 'it-CH',
        delimiters: {
            thousands: '\'',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'mila',
            million: 'mil',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function () {
            return '°';
        },
        currency: {
            symbol: 'CHF'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('it-CH', language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],89:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Italian
 * locale: Italy
 * author : Giacomo Trombi : http://cinquepunti.it
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'it-IT',
        cultureCode: 'it-IT',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'mila',
            million: 'mil',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function () {
            return 'º';
        },
        currency: {
            symbol: '€',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],90:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Japanese
 * locale: Japan
 * author : teppeis : https://github.com/teppeis
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'ja-JP',
        cultureCode: 'ja-JP',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: '千',
            million: '百万',
            billion: '十億',
            trillion: '兆'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '¥',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: '$ ,0.00',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: '$ ,0'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],91:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Korean
 * author (numbro.js Version): Randy Wilander : https://github.com/rocketedaway
 * author (numeral.js Version) : Rich Daley : https://github.com/pedantic-git
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'ko-KR',
        cultureCode: 'ko-KR',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: '천',
            million: '백만',
            billion: '십억',
            trillion: '일조'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '₩'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],92:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Latvian
 * locale: Latvia
 * author : Lauris Bukšis-Haberkorns : https://github.com/Lafriks
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'lv-LV',
        cultureCode: 'lv-LV',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: ' tūkst.',
            million: ' milj.',
            billion: ' mljrd.',
            trillion: ' trilj.'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '€',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };
    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],93:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language: Norwegian Bokmål
 * locale: Norway
 * author : Benjamin Van Ryseghem
 */
(function() {
    'use strict';

    var language = {
        langLocaleCode: 'nb-NO',
        cultureCode: 'nb-NO',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 't',
            million: 'M',
            billion: 'md',
            trillion: 't'
        },
        currency: {
            symbol: 'kr',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],94:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Norwegian Bokmål (nb)
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'nb',
        cultureCode: 'nb',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 't',
            million: 'mil',
            billion: 'mia',
            trillion: 'b'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'kr'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('nb', language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],95:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Dutch
 * locale: Belgium
 * author : Dieter Luypaert : https://github.com/moeriki
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'nl-BE',
        cultureCode: 'nl-BE',
        delimiters: {
            thousands: ' ',
            decimal  : ','
        },
        abbreviations: {
            thousand : 'k',
            million  : 'mln',
            billion  : 'mld',
            trillion : 'bln'
        },
        ordinal : function (number) {
            var remainder = number % 100;
            return (number !== 0 && remainder <= 1 || remainder === 8 || remainder >= 20) ? 'ste' : 'de';
        },
        currency: {
            symbol: '€',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],96:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Dutch
 * locale: Netherlands
 * author : Dave Clayton : https://github.com/davedx
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'nl-NL',
        cultureCode: 'nl-NL',
        delimiters: {
            thousands: '.',
            decimal  : ','
        },
        abbreviations: {
            thousand : 'k',
            million  : 'mln',
            billion  : 'mrd',
            trillion : 'bln'
        },
        ordinal : function (number) {
            var remainder = number % 100;
            return (number !== 0 && remainder <= 1 || remainder === 8 || remainder >= 20) ? 'ste' : 'de';
        },
        currency: {
            symbol: '€',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],97:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Norwegian Nynorsk (nn)
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'nn',
        cultureCode: 'nn',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 't',
            million: 'mil',
            billion: 'mia',
            trillion: 'b'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'kr'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.language) {
        window.numbro.language('nn', language);
    }
}());

},{}],98:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Polish
 * locale : Poland
 * author : Dominik Bulaj : https://github.com/dominikbulaj
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'pl-PL',
        cultureCode: 'pl-PL',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'tys.',
            million: 'mln',
            billion: 'mld',
            trillion: 'bln'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: ' zł',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],99:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Portuguese
 * locale : Brazil
 * author : Ramiro Varandas Jr : https://github.com/ramirovjr
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'pt-BR',
        cultureCode: 'pt-BR',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'mil',
            million: 'milhões',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function () {
            return 'º';
        },
        currency: {
            symbol: 'R$',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],100:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Portuguese
 * locale : Portugal
 * author : Diogo Resende : https://github.com/dresende
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'pt-PT',
        cultureCode: 'pt-PT',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal : function () {
            return 'º';
        },
        currency: {
            symbol: '€',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],101:[function(require,module,exports){
/*!
 * numeral.js language configuration
 * language : Romanian
 * author : Andrei Alecu https://github.com/andreialecu
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'ro-RO',
        cultureCode: 'ro-RO',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'mii',
            million: 'mil',
            billion: 'mld',
            trillion: 'bln'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: ' lei',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],102:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Romanian (ro)
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'ro',
        cultureCode: 'ro',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'mie',
            million: 'mln',
            billion: 'mld',
            trillion: 't'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'RON'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('ro', language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],103:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Russian
 * locale : Russsia
 * author : Anatoli Papirovski : https://github.com/apapirovski
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'ru-RU',
        cultureCode: 'ru-RU',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'тыс.',
            million: 'млн',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function () {
            // not ideal, but since in Russian it can taken on
            // different forms (masculine, feminine, neuter)
            // this is all we can do
            return '.';
        },
        currency: {
            symbol: 'руб.',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],104:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Russian
 * locale : Ukraine
 * author : Anatoli Papirovski : https://github.com/apapirovski
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'ru-UA',
        cultureCode: 'ru-UA',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'тыс.',
            million: 'млн',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function () {
            // not ideal, but since in Russian it can taken on
            // different forms (masculine, feminine, neuter)
            // this is all we can do
            return '.';
        },
        currency: {
            symbol: '\u20B4',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],105:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Slovak
 * locale : Slovakia
 * author : Jan Pesa : https://github.com/smajl (based on work from Ahmed Al Hafoudh : http://www.freevision.sk)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'sk-SK',
        cultureCode: 'sk-SK',
        delimiters: {
            thousands: '\u00a0',
            decimal: ','
        },
        abbreviations: {
            thousand: 'tis.',
            million: 'mil.',
            billion: 'mld.',
            trillion: 'bil.'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '€',
            position: 'postfix',
            spaceSeparated: true
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],106:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Slovene
 * locale: Slovenia
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'sl',
        cultureCode: 'sl',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'tis.',
            million: 'mil.',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '€'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('sl', language);
    }
}());

},{}],107:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Serbian (sr)
 * country : Serbia (Cyrillic)
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'sr-Cyrl-RS',
        cultureCode: 'sr-Cyrl-RS',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'тыс.',
            million: 'млн',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'RSD'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('sr-Cyrl-RS', language);
    }
}());

},{}],108:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Swedish
 * locale : Sweden
 * author : Benjamin Van Ryseghem (benjamin.vanryseghem.com)
 */
(function() {
    'use strict';

    var language = {
        langLocaleCode: 'sv-SE',
        cultureCode: 'sv-SE',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 't',
            million: 'M',
            billion: 'md',
            trillion: 'tmd'
        },
        currency: {
            symbol: 'kr',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],109:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Thai
 * locale : Thailand
 * author : Sathit Jittanupat : https://github.com/jojosati
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'th-TH',
        cultureCode: 'th-TH',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'พัน',
            million: 'ล้าน',
            billion: 'พันล้าน',
            trillion: 'ล้านล้าน'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '฿',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],110:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Turkish
 * locale : Turkey
 * author : Ecmel Ercan : https://github.com/ecmel,
 *          Erhan Gundogan : https://github.com/erhangundogan,
 *          Burak Yiğit Kaya: https://github.com/BYK
 */
(function() {
    'use strict';

    var suffixes = {
            1: '\'inci',
            5: '\'inci',
            8: '\'inci',
            70: '\'inci',
            80: '\'inci',

            2: '\'nci',
            7: '\'nci',
            20: '\'nci',
            50: '\'nci',

            3: '\'üncü',
            4: '\'üncü',
            100: '\'üncü',

            6: '\'ncı',

            9: '\'uncu',
            10: '\'uncu',
            30: '\'uncu',

            60: '\'ıncı',
            90: '\'ıncı'
        },
        language = {
            langLocaleCode: 'tr-TR',
            cultureCode: 'tr-TR',
            delimiters: {
                thousands: '.',
                decimal: ','
            },
            abbreviations: {
                thousand: 'bin',
                million: 'milyon',
                billion: 'milyar',
                trillion: 'trilyon'
            },
            ordinal: function(number) {
                if (number === 0) {  // special case for zero
                    return '\'ıncı';
                }

                var a = number % 10,
                    b = number % 100 - a,
                    c = number >= 100 ? 100 : null;

                return suffixes[a] || suffixes[b] || suffixes[c];
            },
            currency: {
                symbol: '\u20BA',
                position: 'postfix'
            },
            defaults: {
                currencyFormat: ',4 a'
            },
            formats: {
                fourDigits: '4 a',
                fullWithTwoDecimals: ',0.00 $',
                fullWithTwoDecimalsNoCurrency: ',0.00',
                fullWithNoDecimals: ',0 $'
            }
        };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],111:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Ukrainian
 * locale : Ukraine
 * author : Michael Piefel : https://github.com/piefel (with help from Tetyana Kuzmenko)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'uk-UA',
        cultureCode: 'uk-UA',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'тис.',
            million: 'млн',
            billion: 'млрд',
            trillion: 'блн'
        },
        ordinal: function () {
            // not ideal, but since in Ukrainian it can taken on
            // different forms (masculine, feminine, neuter)
            // this is all we can do
            return '';
        },
        currency: {
            symbol: '\u20B4',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],112:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : simplified chinese
 * locale : China
 * author : badplum : https://github.com/badplum
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'zh-CN',
        cultureCode: 'zh-CN',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: '千',
            million: '百万',
            billion: '十亿',
            trillion: '兆'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '¥',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: '$ ,0.00',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: '$ ,0'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],113:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Chinese traditional
 * locale: Macau
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'zh-MO',
        cultureCode: 'zh-MO',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: '千',
            million: '百萬',
            billion: '十億',
            trillion: '兆'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'MOP'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('zh-MO', language);
    }
}());

},{}],114:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Chinese simplified
 * locale: Singapore
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'zh-SG',
        cultureCode: 'zh-SG',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: '千',
            million: '百万',
            billion: '十亿',
            trillion: '兆'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '$'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('zh-SG', language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],115:[function(require,module,exports){
/*!
 * numbro.js language configuration
 * language : Chinese (Taiwan)
 * author (numbro.js Version): Randy Wilander : https://github.com/rocketedaway
 * author (numeral.js Version) : Rich Daley : https://github.com/pedantic-git
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'zh-TW',
        cultureCode: 'zh-TW',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: '千',
            million: '百萬',
            billion: '十億',
            trillion: '兆'
        },
        ordinal: function () {
            return '第';
        },
        currency: {
            symbol: 'NT$'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

},{}],116:[function(require,module,exports){
(function (process){
/*!
 * numbro.js
 * version : 1.11.0
 * author : Företagsplatsen AB
 * license : MIT
 * http://www.foretagsplatsen.se
 */

(function () {
    'use strict';

    /************************************
        Constants
    ************************************/

    var numbro,
        VERSION = '1.11.0',
        binarySuffixes = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'],
        decimalSuffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        bytes = {
            general: { scale: 1024, suffixes: decimalSuffixes, marker: 'bd' },
            binary:  { scale: 1024, suffixes: binarySuffixes, marker: 'b' },
            decimal: { scale: 1000, suffixes: decimalSuffixes, marker: 'd' }
        },
        // general must be before the others because it reuses their characters!
        byteFormatOrder = [ bytes.general, bytes.binary, bytes.decimal ],
    // internal storage for culture config files
        cultures = {},
    // Todo: Remove in 2.0.0
        languages = cultures,
        currentCulture = 'en-US',
        zeroFormat = null,
        defaultFormat = '0,0',
        defaultCurrencyFormat = '0$',
        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),
    // default culture
        enUS = {
            delimiters: {
                thousands: ',',
                decimal: '.'
            },
            abbreviations: {
                thousand: 'k',
                million: 'm',
                billion: 'b',
                trillion: 't'
            },
            ordinal: function(number) {
                var b = number % 10;
                return (~~(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                        (b === 2) ? 'nd' :
                            (b === 3) ? 'rd' : 'th';
            },
            currency: {
                symbol: '$',
                position: 'prefix'
            },
            defaults: {
                currencyFormat: ',0000 a'
            },
            formats: {
                fourDigits: '0000 a',
                fullWithTwoDecimals: '$ ,0.00',
                fullWithTwoDecimalsNoCurrency: ',0.00'
            }
        };

    /************************************
        Constructors
    ************************************/


    // Numbro prototype object
    function Numbro(number) {
        this._value = number;
    }

    function numberLength(number) {
        if (number === 0) { return 1; }
        return Math.floor(Math.log(Math.abs(number)) / Math.LN10) + 1;
    }

    function zeroes(count) {
        var i, ret = '';

        for (i = 0; i < count; i++) {
            ret += '0';
        }

        return ret;
    }
    /**
     * Implementation of toFixed() for numbers with exponents
     * This function may return negative representations for zero values e.g. "-0.0"
     */
    function toFixedLargeSmall(value, precision) {
        var mantissa,
            beforeDec,
            afterDec,
            exponent,
            prefix,
            endStr,
            zerosStr,
            str;

        str = value.toString();

        mantissa = str.split('e')[0];
        exponent = str.split('e')[1];

        beforeDec = mantissa.split('.')[0];
        afterDec = mantissa.split('.')[1] || '';

        if (+exponent > 0) {
            // exponent is positive - add zeros after the numbers
            str = beforeDec + afterDec + zeroes(exponent - afterDec.length);
        } else {
            // exponent is negative

            if (+beforeDec < 0) {
                prefix = '-0';
            } else {
                prefix = '0';
            }

            // tack on the decimal point if needed
            if (precision > 0) {
                prefix += '.';
            }

            zerosStr = zeroes((-1 * exponent) - 1);
            // substring off the end to satisfy the precision
            endStr = (zerosStr + Math.abs(beforeDec) + afterDec).substr(0, precision);
            str = prefix + endStr;
        }

        // only add percision 0's if the exponent is positive
        if (+exponent > 0 && precision > 0) {
            str += '.' + zeroes(precision);
        }

        return str;
    }

    /**
     * Implementation of toFixed() that treats floats more like decimals
     *
     * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
     * problems for accounting- and finance-related software.
     *
     * Also removes negative signs for zero-formatted numbers. e.g. -0.01 w/ precision 1 -> 0.0
     */
    function toFixed(value, precision, roundingFunction, optionals) {
        var power = Math.pow(10, precision),
            optionalsRegExp,
            output;

        if (value.toString().indexOf('e') > -1) {
            // toFixed returns scientific notation for numbers above 1e21 and below 1e-7
            output = toFixedLargeSmall(value, precision);
            // remove the leading negative sign if it exists and should not be present (e.g. -0.00)
            if (output.charAt(0) === '-' && +output >= 0) {
                output = output.substr(1); // chop off the '-'
            }
        }
        else {
            // Multiply up by precision, round accurately, then divide and use native toFixed():
            output = (roundingFunction(value + 'e+' + precision) / power).toFixed(precision);
        }

        if (optionals) {
            optionalsRegExp = new RegExp('0{1,' + optionals + '}$');
            output = output.replace(optionalsRegExp, '');
        }

        return output;
    }

    /************************************
        Formatting
    ************************************/

    // determine what type of formatting we need to do
    function formatNumbro(n, format, roundingFunction) {
        var output,
            escapedFormat = format.replace(/\{[^\{\}]*\}/g, '');

        // figure out what kind of format we are dealing with
        if (escapedFormat.indexOf('$') > -1) { // currency!!!!!
            output = formatCurrency(n, cultures[currentCulture].currency.symbol, format, roundingFunction);
        } else if (escapedFormat.indexOf('%') > -1) { // percentage
            output = formatPercentage(n, format, roundingFunction);
        } else if (escapedFormat.indexOf(':') > -1) { // time
            output = formatTime(n, format);
        } else { // plain ol' numbers or bytes
            output = formatNumber(n._value, format, roundingFunction);
        }

        // return string
        return output;
    }

    // revert to number
    function unformatNumbro(n, string) {
        var stringOriginal = string,
            thousandRegExp,
            millionRegExp,
            billionRegExp,
            trillionRegExp,
            bytesMultiplier = false,
            power;

        if (string.indexOf(':') > -1) {
            n._value = unformatTime(string);
        } else {
            if (string === zeroFormat) {
                n._value = 0;
            } else {
                if (cultures[currentCulture].delimiters.decimal !== '.') {
                    string = string.replace(/\./g, '').replace(cultures[currentCulture].delimiters.decimal, '.');
                }

                // see if abbreviations are there so that we can multiply to the correct number
                thousandRegExp = new RegExp('[^a-zA-Z]' + cultures[currentCulture].abbreviations.thousand +
                    '(?:\\)|(\\' + cultures[currentCulture].currency.symbol + ')?(?:\\))?)?$');
                millionRegExp = new RegExp('[^a-zA-Z]' + cultures[currentCulture].abbreviations.million +
                    '(?:\\)|(\\' + cultures[currentCulture].currency.symbol + ')?(?:\\))?)?$');
                billionRegExp = new RegExp('[^a-zA-Z]' + cultures[currentCulture].abbreviations.billion +
                    '(?:\\)|(\\' + cultures[currentCulture].currency.symbol + ')?(?:\\))?)?$');
                trillionRegExp = new RegExp('[^a-zA-Z]' + cultures[currentCulture].abbreviations.trillion +
                    '(?:\\)|(\\' + cultures[currentCulture].currency.symbol + ')?(?:\\))?)?$');

                // see if bytes are there so that we can multiply to the correct number
                for (power = 1; power < binarySuffixes.length && !bytesMultiplier; ++power) {
                    if (string.indexOf(binarySuffixes[power]) > -1) {
                        bytesMultiplier = Math.pow(1024, power);
                    } else if (string.indexOf(decimalSuffixes[power]) > -1) {
                        bytesMultiplier = Math.pow(1000, power);
                    }
                }

                var str = string.replace(/[^0-9\.]+/g, '');
                if (str === '') {
                    // An empty string is not a number.
                    n._value = NaN;

                } else {
                    // do some math to create our number
                    n._value = ((bytesMultiplier) ? bytesMultiplier : 1) *
                        ((stringOriginal.match(thousandRegExp)) ? Math.pow(10, 3) : 1) *
                        ((stringOriginal.match(millionRegExp)) ? Math.pow(10, 6) : 1) *
                        ((stringOriginal.match(billionRegExp)) ? Math.pow(10, 9) : 1) *
                        ((stringOriginal.match(trillionRegExp)) ? Math.pow(10, 12) : 1) *
                        ((string.indexOf('%') > -1) ? 0.01 : 1) *
                        (((string.split('-').length +
                            Math.min(string.split('(').length - 1, string.split(')').length - 1)) % 2) ? 1 : -1) *
                        Number(str);

                    // round if we are talking about bytes
                    n._value = (bytesMultiplier) ? Math.ceil(n._value) : n._value;
                }
            }
        }
        return n._value;
    }

    function formatCurrency(n, currencySymbol, originalFormat, roundingFunction) {
        var format = originalFormat,
            symbolIndex = format.indexOf('$'),
            openParenIndex = format.indexOf('('),
            plusSignIndex = format.indexOf('+'),
            minusSignIndex = format.indexOf('-'),
            space = '',
            decimalSeparator = '',
            spliceIndex,
            output;

        if(format.indexOf('$') === -1){
            // Use defaults instead of the format provided
            if (cultures[currentCulture].currency.position === 'infix') {
                decimalSeparator = currencySymbol;
                if (cultures[currentCulture].currency.spaceSeparated) {
                    decimalSeparator = ' ' + decimalSeparator + ' ';
                }
            } else if (cultures[currentCulture].currency.spaceSeparated) {
                space = ' ';
            }
        } else {
            // check for space before or after currency
            if (format.indexOf(' $') > -1) {
                space = ' ';
                format = format.replace(' $', '');
            } else if (format.indexOf('$ ') > -1) {
                space = ' ';
                format = format.replace('$ ', '');
            } else {
                format = format.replace('$', '');
            }
        }

        // Format The Number
        output = formatNumber(n._value, format, roundingFunction, decimalSeparator);

        if (originalFormat.indexOf('$') === -1) {
            // Use defaults instead of the format provided
            switch (cultures[currentCulture].currency.position) {
                case 'postfix':
                    if (output.indexOf(')') > -1) {
                        output = output.split('');
                        output.splice(-1, 0, space + currencySymbol);
                        output = output.join('');
                    } else {
                        output = output + space + currencySymbol;
                    }
                    break;
                case 'infix':
                    break;
                case 'prefix':
                    if (output.indexOf('(') > -1 || output.indexOf('-') > -1) {
                        output = output.split('');
                        spliceIndex = Math.max(openParenIndex, minusSignIndex) + 1;

                        output.splice(spliceIndex, 0, currencySymbol + space);
                        output = output.join('');
                    } else {
                        output = currencySymbol + space + output;
                    }
                    break;
                default:
                    throw Error('Currency position should be among ["prefix", "infix", "postfix"]');
            }
        } else {
            // position the symbol
            if (symbolIndex <= 1) {
                if (output.indexOf('(') > -1 || output.indexOf('+') > -1 || output.indexOf('-') > -1) {
                    output = output.split('');
                    spliceIndex = 1;
                    if (symbolIndex < openParenIndex || symbolIndex < plusSignIndex || symbolIndex < minusSignIndex) {
                        // the symbol appears before the "(", "+" or "-"
                        spliceIndex = 0;
                    }
                    output.splice(spliceIndex, 0, currencySymbol + space);
                    output = output.join('');
                } else {
                    output = currencySymbol + space + output;
                }
            } else {
                if (output.indexOf(')') > -1) {
                    output = output.split('');
                    output.splice(-1, 0, space + currencySymbol);
                    output = output.join('');
                } else {
                    output = output + space + currencySymbol;
                }
            }
        }

        return output;
    }

    function formatForeignCurrency(n, foreignCurrencySymbol, originalFormat, roundingFunction) {
        return formatCurrency(n, foreignCurrencySymbol, originalFormat, roundingFunction);
    }

    function formatPercentage(n, format, roundingFunction) {
        var space = '',
            output,
            value = n._value * 100;

        // check for space before %
        if (format.indexOf(' %') > -1) {
            space = ' ';
            format = format.replace(' %', '');
        } else {
            format = format.replace('%', '');
        }

        output = formatNumber(value, format, roundingFunction);

        if (output.indexOf(')') > -1) {
            output = output.split('');
            output.splice(-1, 0, space + '%');
            output = output.join('');
        } else {
            output = output + space + '%';
        }

        return output;
    }

    function formatTime(n) {
        var hours = Math.floor(n._value / 60 / 60),
            minutes = Math.floor((n._value - (hours * 60 * 60)) / 60),
            seconds = Math.round(n._value - (hours * 60 * 60) - (minutes * 60));
        return hours + ':' +
            ((minutes < 10) ? '0' + minutes : minutes) + ':' +
            ((seconds < 10) ? '0' + seconds : seconds);
    }

    function unformatTime(string) {
        var timeArray = string.split(':'),
            seconds = 0;
        // turn hours and minutes into seconds and add them all up
        if (timeArray.length === 3) {
            // hours
            seconds = seconds + (Number(timeArray[0]) * 60 * 60);
            // minutes
            seconds = seconds + (Number(timeArray[1]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[2]);
        } else if (timeArray.length === 2) {
            // minutes
            seconds = seconds + (Number(timeArray[0]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[1]);
        }
        return Number(seconds);
    }

    function formatByteUnits (value, suffixes, scale) {
        var suffix = suffixes[0],
            power,
            min,
            max,
            abs = Math.abs(value);

        if (abs >= scale) {
            for (power = 1; power < suffixes.length; ++power) {
                min = Math.pow(scale, power);
                max = Math.pow(scale, power + 1);

                if (abs >= min && abs < max) {
                    suffix = suffixes[power];
                    value = value / min;
                    break;
                }
            }

            // values greater than or equal to [scale] YB never set the suffix
            if (suffix === suffixes[0]) {
                value = value / Math.pow(scale, suffixes.length - 1);
                suffix = suffixes[suffixes.length - 1];
            }
        }

        return { value: value, suffix: suffix };
    }

    function formatNumber (value, format, roundingFunction, sep) {
        var negP = false,
            signed = false,
            optDec = false,
            abbr = '',
            abbrK = false, // force abbreviation to thousands
            abbrM = false, // force abbreviation to millions
            abbrB = false, // force abbreviation to billions
            abbrT = false, // force abbreviation to trillions
            abbrForce = false, // force abbreviation
            bytes = '',
            byteFormat,
            units,
            ord = '',
            abs = Math.abs(value),
            totalLength,
            length,
            minimumPrecision,
            pow,
            w,
            intPrecision,
            precision,
            prefix,
            postfix,
            thousands,
            d = '',
            forcedNeg = false,
            neg = false,
            indexOpenP,
            indexMinus,
            paren = '',
            minlen,
            i;

        // check if number is zero and a custom zero format has been set
        if (value === 0 && zeroFormat !== null) {
            return zeroFormat;
        }

        if (!isFinite(value)) {
            return '' + value;
        }

        if (format.indexOf('{') === 0) {
            var end = format.indexOf('}');
            if (end === -1) {
                throw Error('Format should also contain a "}"');
            }
            prefix = format.slice(1, end);
            format = format.slice(end + 1);
        } else {
            prefix = '';
        }

        if (format.indexOf('}') === format.length - 1 && format.length) {
            var start = format.indexOf('{');
            if (start === -1) {
                throw Error('Format should also contain a "{"');
            }
            postfix = format.slice(start + 1, -1);
            format = format.slice(0, start + 1);
        } else {
            postfix = '';
        }

        // check for min length
        var info;
        if (format.indexOf('.') === -1) {
            info = format.match(/([0-9]+).*/);
        } else {
            info = format.match(/([0-9]+)\..*/);
        }
        minlen = info === null ? -1 : info[1].length;

        // see if we should use parentheses for negative number or if we should prefix with a sign
        // if both are present we default to parentheses
        if (format.indexOf('-') !== -1) {
            forcedNeg = true;
        }
        if (format.indexOf('(') > -1) {
            negP = true;
            format = format.slice(1, -1);
        } else if (format.indexOf('+') > -1) {
            signed = true;
            format = format.replace(/\+/g, '');
        }

        // see if abbreviation is wanted
        if (format.indexOf('a') > -1) {
            intPrecision = format.split('.')[0].match(/[0-9]+/g) || ['0'];
            intPrecision = parseInt(intPrecision[0], 10);

            // check if abbreviation is specified
            abbrK = format.indexOf('aK') >= 0;
            abbrM = format.indexOf('aM') >= 0;
            abbrB = format.indexOf('aB') >= 0;
            abbrT = format.indexOf('aT') >= 0;
            abbrForce = abbrK || abbrM || abbrB || abbrT;

            // check for space before abbreviation
            if (format.indexOf(' a') > -1) {
                abbr = ' ';
                format = format.replace(' a', '');
            } else {
                format = format.replace('a', '');
            }

            totalLength = numberLength(value);
            minimumPrecision = totalLength % 3;
            minimumPrecision = minimumPrecision === 0 ? 3 : minimumPrecision;

            if (intPrecision && abs !== 0) {
                pow = 3 * ~~((Math.min(intPrecision, totalLength) - minimumPrecision) / 3);
                abs = abs / Math.pow(10, pow);
            }

            if (totalLength !== intPrecision) {
                if (abs >= Math.pow(10, 12) && !abbrForce || abbrT) {
                    // trillion
                    abbr = abbr + cultures[currentCulture].abbreviations.trillion;
                    value = value / Math.pow(10, 12);
                } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9) && !abbrForce || abbrB) {
                    // billion
                    abbr = abbr + cultures[currentCulture].abbreviations.billion;
                    value = value / Math.pow(10, 9);
                } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6) && !abbrForce || abbrM) {
                    // million
                    abbr = abbr + cultures[currentCulture].abbreviations.million;
                    value = value / Math.pow(10, 6);
                } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3) && !abbrForce || abbrK) {
                    // thousand
                    abbr = abbr + cultures[currentCulture].abbreviations.thousand;
                    value = value / Math.pow(10, 3);
                }
            }

            length = numberLength(value);
            if (intPrecision && length < intPrecision && format.indexOf('.') === -1) {
                format += '[.]';
                format += zeroes(intPrecision - length);
            }
        }

        // see if we are formatting
        //   binary-decimal bytes (1024 MB), binary bytes (1024 MiB), or decimal bytes (1000 MB)
        for (i = 0; i < byteFormatOrder.length; ++i) {
            byteFormat = byteFormatOrder[i];

            if (format.indexOf(byteFormat.marker) > -1) {
                // check for space before
                if (format.indexOf(' ' + byteFormat.marker) >-1) {
                    bytes = ' ';
                }

                // remove the marker (with the space if it had one)
                format = format.replace(bytes + byteFormat.marker, '');

                units = formatByteUnits(value, byteFormat.suffixes, byteFormat.scale);

                value = units.value;
                bytes = bytes + units.suffix;

                break;
            }
        }

        // see if ordinal is wanted
        if (format.indexOf('o') > -1) {
            // check for space before
            if (format.indexOf(' o') > -1) {
                ord = ' ';
                format = format.replace(' o', '');
            } else {
                format = format.replace('o', '');
            }

            if (cultures[currentCulture].ordinal) {
                ord = ord + cultures[currentCulture].ordinal(value);
            }
        }

        if (format.indexOf('[.]') > -1) {
            optDec = true;
            format = format.replace('[.]', '.');
        }

        precision = format.split('.')[1];
        thousands = format.indexOf(',');

        if (precision) {
            var dSplit = [];

            if (precision.indexOf('*') !== -1) {
                d = value.toString();
                dSplit = d.split('.');
                if (dSplit.length > 1) {
                    d = toFixed(value, dSplit[1].length, roundingFunction);
                }
            } else {
                if (precision.indexOf('[') > -1) {
                    precision = precision.replace(']', '');
                    precision = precision.split('[');
                    d = toFixed(value, (precision[0].length + precision[1].length), roundingFunction,
                        precision[1].length);
                } else {
                    d = toFixed(value, precision.length, roundingFunction);
                }
            }

            dSplit = d.split('.');
            w = dSplit[0];

            if (dSplit.length > 1 && dSplit[1].length) {
                var p = sep ? abbr + sep : cultures[currentCulture].delimiters.decimal;
                d = p + dSplit[1];
            } else {
                d = '';
            }

            if (optDec && Number(d.slice(1)) === 0) {
                d = '';
            }
        } else {
            w = toFixed(value, 0, roundingFunction);
        }

        // format number
        if (w.indexOf('-') > -1) {
            w = w.slice(1);
            neg = true;
        }

        if (w.length < minlen) {
            w = zeroes(minlen - w.length) + w;
        }

        if (thousands > -1) {
            w = w.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' +
                cultures[currentCulture].delimiters.thousands);
        }

        if (format.indexOf('.') === 0) {
            w = '';
        }

        indexOpenP = format.indexOf('(');
        indexMinus = format.indexOf('-');

        if (indexOpenP < indexMinus) {
            paren = ((negP && neg) ? '(' : '') + (((forcedNeg && neg) || (!negP && neg)) ? '-' : '');
        } else {
            paren = (((forcedNeg && neg) || (!negP && neg)) ? '-' : '') + ((negP && neg) ? '(' : '');
        }

        return prefix +
            paren + ((!neg && signed && value !== 0) ? '+' : '') +
            w + d +
            ((ord) ? ord : '') +
            ((abbr && !sep) ? abbr : '') +
            ((bytes) ? bytes : '') +
            ((negP && neg) ? ')' : '') +
            postfix;
    }

    /************************************
        Top Level Functions
    ************************************/

    numbro = function(input) {
        if (numbro.isNumbro(input)) {
            input = input.value();
        } else if (typeof input === 'string' || typeof input === 'number') {
            input = numbro.fn.unformat(input);
        } else {
            input = NaN;
        }

        return new Numbro(Number(input));
    };

    // version number
    numbro.version = VERSION;

    // compare numbro object
    numbro.isNumbro = function(obj) {
        return obj instanceof Numbro;
    };

    /**
     * This function allow the user to set a new language with a fallback if
     * the language does not exist. If no fallback language is provided,
     * it fallbacks to english.
     *
     * @deprecated Since in version 1.6.0. It will be deleted in version 2.0
     * `setCulture` should be used instead.
     */
    numbro.setLanguage = function(newLanguage, fallbackLanguage) {
        console.warn('`setLanguage` is deprecated since version 1.6.0. Use `setCulture` instead');
        var key = newLanguage,
            prefix = newLanguage.split('-')[0],
            matchingLanguage = null;
        if (!languages[key]) {
            Object.keys(languages).forEach(function(language) {
                if (!matchingLanguage && language.split('-')[0] === prefix) {
                    matchingLanguage = language;
                }
            });
            key = matchingLanguage || fallbackLanguage || 'en-US';
        }
        chooseCulture(key);
    };

    /**
     * This function allow the user to set a new culture with a fallback if
     * the culture does not exist. If no fallback culture is provided,
     * it falls back to "en-US".
     */
    numbro.setCulture = function(newCulture, fallbackCulture) {
        var key = newCulture,
            suffix = newCulture.split('-')[1],
            matchingCulture = null;
        if (!cultures[key]) {
            if (suffix) {
                Object.keys(cultures).forEach(function(language) {
                    if (!matchingCulture && language.split('-')[1] === suffix) {
                        matchingCulture = language;
                    }
                });
            }

            key = matchingCulture || fallbackCulture || 'en-US';
        }
        chooseCulture(key);
    };

    /**
     * This function will load languages and then set the global language.  If
     * no arguments are passed in, it will simply return the current global
     * language key.
     *
     * @deprecated Since in version 1.6.0. It will be deleted in version 2.0
     * `culture` should be used instead.
     */
    numbro.language = function(key, values) {
        console.warn('`language` is deprecated since version 1.6.0. Use `culture` instead');

        if (!key) {
            return currentCulture;
        }

        if (key && !values) {
            if (!languages[key]) {
                throw new Error('Unknown language : ' + key);
            }
            chooseCulture(key);
        }

        if (values || !languages[key]) {
            setCulture(key, values);
        }

        return numbro;
    };

    /**
     * This function will load cultures and then set the global culture.  If
     * no arguments are passed in, it will simply return the current global
     * culture code.
     */
    numbro.culture = function(code, values) {
        if (!code) {
            return currentCulture;
        }

        if (code && !values) {
            if (!cultures[code]) {
                throw new Error('Unknown culture : ' + code);
            }
            chooseCulture(code);
        }

        if (values || !cultures[code]) {
            setCulture(code, values);
        }

        return numbro;
    };

    /**
     * This function provides access to the loaded language data.  If
     * no arguments are passed in, it will simply return the current
     * global language object.
     *
     * @deprecated Since in version 1.6.0. It will be deleted in version 2.0
     * `culture` should be used instead.
     */
    numbro.languageData = function(key) {
        console.warn('`languageData` is deprecated since version 1.6.0. Use `cultureData` instead');

        if (!key) {
            return languages[currentCulture];
        }

        if (!languages[key]) {
            throw new Error('Unknown language : ' + key);
        }

        return languages[key];
    };

    /**
     * This function provides access to the loaded culture data.  If
     * no arguments are passed in, it will simply return the current
     * global culture object.
     */
    numbro.cultureData = function(code) {
        if (!code) {
            return cultures[currentCulture];
        }

        if (!cultures[code]) {
            throw new Error('Unknown culture : ' + code);
        }

        return cultures[code];
    };

    numbro.culture('en-US', enUS);

    /**
     * @deprecated Since in version 1.6.0. It will be deleted in version 2.0
     * `cultures` should be used instead.
     */
    numbro.languages = function() {
        console.warn('`languages` is deprecated since version 1.6.0. Use `cultures` instead');

        return languages;
    };

    numbro.cultures = function() {
        return cultures;
    };

    numbro.zeroFormat = function(format) {
        zeroFormat = typeof(format) === 'string' ? format : null;
    };

    numbro.defaultFormat = function(format) {
        defaultFormat = typeof(format) === 'string' ? format : '0.0';
    };

    numbro.defaultCurrencyFormat = function (format) {
        defaultCurrencyFormat = typeof(format) === 'string' ? format : '0$';
    };

    numbro.validate = function(val, culture) {

        var _decimalSep,
            _thousandSep,
            _currSymbol,
            _valArray,
            _abbrObj,
            _thousandRegEx,
            cultureData,
            temp;

        //coerce val to string
        if (typeof val !== 'string') {
            val += '';
            if (console.warn) {
                console.warn('Numbro.js: Value is not string. It has been co-erced to: ', val);
            }
        }

        //trim whitespaces from either sides
        val = val.trim();

        //replace the initial '+' or '-' sign if present
        val = val.replace(/^[+-]?/, '');

        //if val is just digits return true
        if ( !! val.match(/^\d+$/)) {
            return true;
        }

        //if val is empty return false
        if (val === '') {
            return false;
        }

        //get the decimal and thousands separator from numbro.cultureData
        try {
            //check if the culture is understood by numbro. if not, default it to current culture
            cultureData = numbro.cultureData(culture);
        } catch (e) {
            cultureData = numbro.cultureData(numbro.culture());
        }

        //setup the delimiters and currency symbol based on culture
        _currSymbol = cultureData.currency.symbol;
        _abbrObj = cultureData.abbreviations;
        _decimalSep = cultureData.delimiters.decimal;
        if (cultureData.delimiters.thousands === '.') {
            _thousandSep = '\\.';
        } else {
            _thousandSep = cultureData.delimiters.thousands;
        }

        // validating currency symbol
        temp = val.match(/^[^\d\.\,]+/);
        if (temp !== null) {
            val = val.substr(1);
            if (temp[0] !== _currSymbol) {
                return false;
            }
        }

        //validating abbreviation symbol
        temp = val.match(/[^\d]+$/);
        if (temp !== null) {
            val = val.slice(0, -1);
            if (temp[0] !== _abbrObj.thousand && temp[0] !== _abbrObj.million &&
                    temp[0] !== _abbrObj.billion && temp[0] !== _abbrObj.trillion) {
                return false;
            }
        }

        _thousandRegEx = new RegExp(_thousandSep + '{2}');

        if (!val.match(/[^\d.,]/g)) {
            _valArray = val.split(_decimalSep);
            if (_valArray.length > 2) {
                return false;
            } else {
                if (_valArray.length < 2) {
                    return ( !! _valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx));
                } else {
                    if (_valArray[0] === '') {
                        // for values without leading zero eg. .984
                        return (!_valArray[0].match(_thousandRegEx) &&
                            !!_valArray[1].match(/^\d+$/));

                    } else if (_valArray[0].length === 1) {
                        return ( !! _valArray[0].match(/^\d+$/) &&
                            !_valArray[0].match(_thousandRegEx) &&
                            !! _valArray[1].match(/^\d+$/));
                    } else {
                        return ( !! _valArray[0].match(/^\d+.*\d$/) &&
                            !_valArray[0].match(_thousandRegEx) &&
                            !! _valArray[1].match(/^\d+$/));
                    }
                }
            }
        }

        return false;
    };

    /**
     * * @deprecated Since in version 1.6.0. It will be deleted in version 2.0
     * `loadCulturesInNode` should be used instead.
     */
    numbro.loadLanguagesInNode = function() {
        console.warn('`loadLanguagesInNode` is deprecated since version 1.6.0. Use `loadCulturesInNode` instead');

        numbro.loadCulturesInNode();
    };

    numbro.loadCulturesInNode = function() {
        // TODO: Rename the folder in 2.0.0
        var cultures = require('./languages');

        for(var langLocaleCode in cultures) {
            if(langLocaleCode) {
                numbro.culture(langLocaleCode, cultures[langLocaleCode]);
            }
        }
    };

    /************************************
        Helpers
    ************************************/

    function setCulture(code, values) {
        cultures[code] = values;
    }

    function chooseCulture(code) {
        currentCulture = code;
        var defaults = cultures[code].defaults;
        if (defaults && defaults.format) {
            numbro.defaultFormat(defaults.format);
        }
        if (defaults && defaults.currencyFormat) {
            numbro.defaultCurrencyFormat(defaults.currencyFormat);
        }
    }

    function inNodejsRuntime() {
        return (typeof process !== 'undefined') &&
            (process.browser === undefined) &&
            process.title &&
            (
                process.title.indexOf('node') !== -1 ||
                process.title.indexOf('meteor-tool') > 0 ||
                process.title === 'grunt' ||
                process.title === 'gulp'
            ) &&
            (typeof require !== 'undefined');
    }

    /************************************
        Floating-point helpers
    ************************************/

    // The floating-point helper functions and implementation
    // borrows heavily from sinful.js: http://guipn.github.io/sinful.js/

    /**
     * Array.prototype.reduce for browsers that don't support it
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Compatibility
     */
    if ('function' !== typeof Array.prototype.reduce) {
        Array.prototype.reduce = function(callback, optInitialValue) {

            if (null === this || 'undefined' === typeof this) {
                // At the moment all modern browsers, that support strict mode, have
                // native implementation of Array.prototype.reduce. For instance, IE8
                // does not support strict mode, so this check is actually useless.
                throw new TypeError('Array.prototype.reduce called on null or undefined');
            }

            if ('function' !== typeof callback) {
                throw new TypeError(callback + ' is not a function');
            }

            var index,
                value,
                length = this.length >>> 0,
                isValueSet = false;

            if (1 < arguments.length) {
                value = optInitialValue;
                isValueSet = true;
            }

            for (index = 0; length > index; ++index) {
                if (this.hasOwnProperty(index)) {
                    if (isValueSet) {
                        value = callback(value, this[index], index, this);
                    } else {
                        value = this[index];
                        isValueSet = true;
                    }
                }
            }

            if (!isValueSet) {
                throw new TypeError('Reduce of empty array with no initial value');
            }

            return value;
        };
    }


    /**
     * Computes the multiplier necessary to make x >= 1,
     * effectively eliminating miscalculations caused by
     * finite precision.
     */
    function multiplier(x) {
        var parts = x.toString().split('.');
        if (parts.length < 2) {
            return 1;
        }
        return Math.pow(10, parts[1].length);
    }

    /**
     * Given a variable number of arguments, returns the maximum
     * multiplier that must be used to normalize an operation involving
     * all of them.
     */
    function correctionFactor() {
        var args = Array.prototype.slice.call(arguments);
        return args.reduce(function(prev, next) {
            var mp = multiplier(prev),
                mn = multiplier(next);
            return mp > mn ? mp : mn;
        }, -Infinity);
    }

    /************************************
        Numbro Prototype
    ************************************/


    numbro.fn = Numbro.prototype = {

        clone: function() {
            return numbro(this);
        },

        format: function(inputString, roundingFunction) {
            return formatNumbro(this,
                inputString ? inputString : defaultFormat,
                (roundingFunction !== undefined) ? roundingFunction : Math.round
            );
        },

        formatCurrency: function(inputString, roundingFunction) {
            return formatCurrency(this,
                cultures[currentCulture].currency.symbol,
                inputString ? inputString : defaultCurrencyFormat,
                (roundingFunction !== undefined) ? roundingFunction : Math.round
            );
        },

        formatForeignCurrency: function(currencySymbol, inputString, roundingFunction) {
            return formatForeignCurrency(this,
                currencySymbol,
                inputString ? inputString : defaultCurrencyFormat,
                (roundingFunction !== undefined) ? roundingFunction : Math.round
            );
        },

        unformat: function(inputString) {
            if (typeof inputString === 'number') {
                return inputString;
            } else if (typeof inputString === 'string') {
                var result = unformatNumbro(this, inputString);

                // Any unparseable string (represented as NaN in the result) is
                // converted into undefined.
                return isNaN(result) ? undefined : result;
            } else {
                return undefined;
            }
        },

        binaryByteUnits: function() {
            return formatByteUnits(this._value, bytes.binary.suffixes, bytes.binary.scale).suffix;
        },

        byteUnits: function() {
            return formatByteUnits(this._value, bytes.general.suffixes, bytes.general.scale).suffix;
        },

        decimalByteUnits: function() {
            return formatByteUnits(this._value, bytes.decimal.suffixes, bytes.decimal.scale).suffix;
        },

        value: function() {
            return this._value;
        },

        valueOf: function() {
            return this._value;
        },

        set: function(value) {
            this._value = Number(value);
            return this;
        },

        add: function(value) {
            var corrFactor = correctionFactor.call(null, this._value, value);

            function cback(accum, curr) {
                return accum + corrFactor * curr;
            }
            this._value = [this._value, value].reduce(cback, 0) / corrFactor;
            return this;
        },

        subtract: function(value) {
            var corrFactor = correctionFactor.call(null, this._value, value);

            function cback(accum, curr) {
                return accum - corrFactor * curr;
            }
            this._value = [value].reduce(cback, this._value * corrFactor) / corrFactor;
            return this;
        },

        multiply: function(value) {
            function cback(accum, curr) {
                var corrFactor = correctionFactor(accum, curr),
                    result = accum * corrFactor;
                result *= curr * corrFactor;
                result /= corrFactor * corrFactor;
                return result;
            }
            this._value = [this._value, value].reduce(cback, 1);
            return this;
        },

        divide: function(value) {
            function cback(accum, curr) {
                var corrFactor = correctionFactor(accum, curr);
                return (accum * corrFactor) / (curr * corrFactor);
            }
            this._value = [this._value, value].reduce(cback);
            return this;
        },

        difference: function(value) {
            return Math.abs(numbro(this._value).subtract(value).value());
        }

    };

    /************************************
        Exposing Numbro
    ************************************/

    if (inNodejsRuntime()) {
        //Todo: Rename the folder in 2.0.0
        numbro.loadCulturesInNode();
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = numbro;
    } else {
        /*global ender:false */
        if (typeof ender === 'undefined') {
            // here, `this` means `window` in the browser, or `global` on the server
            // add `numbro` as a global object via a string identifier,
            // for Closure Compiler 'advanced' mode
            this.numbro = numbro;
        }

        /*global define:false */
        if (typeof define === 'function' && define.amd) {
            define([], function() {
                return numbro;
            });
        }
    }

}.call(typeof window === 'undefined' ? this : window));

}).call(this,require('_process'))
},{"./languages":87,"_process":5}],117:[function(require,module,exports){
(function (global){
/*
	Ractive.js v0.9.3
	Build: 43c3285402258be6a70c9b54f6224af6975f7c64
	Date: Mon Jul 24 2017 19:37:18 GMT+0000 (UTC)
	Website: http://ractivejs.org
	License: MIT
*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(function() {
		var current = global.Ractive;
		var exports = factory();
		global.Ractive = exports;
		exports.noConflict = function() { global.Ractive = current; return exports; };
	})();
}(this, (function () { 'use strict';

if (!Array.prototype.find) {
	Object.defineProperty( Array.prototype, 'find', {
		value: function value (callback, thisArg) {
			if (this === null || this === undefined)
				{ throw new TypeError('Array.prototype.find called on null or undefined'); }

			if (typeof callback !== 'function')
				{ throw new TypeError((callback + " is not a function")); }

			var array = Object(this);
			var arrayLength = array.length >>> 0;

			for (var index = 0; index < arrayLength; index++) {
				if (!Object.hasOwnProperty.call(array, index)) { continue; }
				if (!callback.call(thisArg, array[index], index, array)) { continue; }
				return array[index];
			}

			return undefined;
		},
		configurable: true,
		writable: true
	});
}

// NOTE: Node doesn't exist in IE8. Nothing can be done.
if (typeof window !== 'undefined' && window.Node && window.Node.prototype && !window.Node.prototype.contains) {
	Node.prototype.contains = function (node) {
		var this$1 = this;

		if (!node)
			{ throw new TypeError('node required'); }

		do {
			if (this$1 === node) { return true; }
		} while (node = node && node.parentNode);

		return false;
	};
}

if (!Object.assign) {
	Object.assign = function (target) {
		var sources = [], len = arguments.length - 1;
		while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

		if (target == null)
			{ throw new TypeError('Cannot convert undefined or null to object'); }

		var to = Object(target);
		var sourcesLength = sources.length;

		for (var index = 0; index < sourcesLength; index++) {
			var nextSource = sources[index];
			for (var nextKey in nextSource) {
				if (!Object.prototype.hasOwnProperty.call(nextSource, nextKey)) { continue; }
				to[nextKey] = nextSource[nextKey];
			}
		}

		return to;
	};
}

if (typeof window !== 'undefined' && window.performance && !window.performance.now) {
	window.performance = window.performance || {};

	var nowOffset = Date.now();

	window.performance.now = function () {
		return Date.now() - nowOffset;
	};
}

if (typeof window !== 'undefined' && !window.Promise) {
	var PENDING = {};
	var FULFILLED = {};
	var REJECTED = {};

	var Promise$1 = window.Promise = function (callback) {
		var fulfilledHandlers = [];
		var rejectedHandlers = [];
		var state = PENDING;
		var result;
		var dispatchHandlers;

		var makeResolver = function (newState) {
			return function (value) {
				if (state !== PENDING) { return; }
				result = value;
				state = newState;
				dispatchHandlers = makeDispatcher((state === FULFILLED ? fulfilledHandlers : rejectedHandlers), result);
				wait(dispatchHandlers);
			};
		};

		var fulfill = makeResolver(FULFILLED);
		var reject = makeResolver(REJECTED);

		try {
			callback(fulfill, reject);
		} catch (err) {
			reject(err);
		}

		return {
			// `then()` returns a Promise - 2.2.7
			then: function then(onFulfilled, onRejected) {
				var promise2 = new Promise$1(function (fulfill, reject) {

					var processResolutionHandler = function (handler, handlers, forward) {
						if (typeof handler === 'function') {
							handlers.push(function (p1result) {
								try {
									resolve(promise2, handler(p1result), fulfill, reject);
								} catch (err) {
									reject(err);
								}
							});
						} else {
							handlers.push(forward);
						}
					};

					processResolutionHandler(onFulfilled, fulfilledHandlers, fulfill);
					processResolutionHandler(onRejected, rejectedHandlers, reject);

					if (state !== PENDING) {
						wait(dispatchHandlers);
					}

				});
				return promise2;
			},
			'catch': function catch$1(onRejected) {
				return this.then(null, onRejected);
			}
		};
	};

	Promise$1.all = function (promises) {
		return new Promise$1(function (fulfil, reject) {
			var result = [];
			var pending;
			var i;

			if (!promises.length) {
				fulfil(result);
				return;
			}

			var processPromise = function (promise, i) {
				if (promise && typeof promise.then === 'function') {
					promise.then(function (value) {
						result[i] = value;
						--pending || fulfil(result);
					}, reject);
				} else {
					result[i] = promise;
					--pending || fulfil(result);
				}
			};

			pending = i = promises.length;

			while (i--) {
				processPromise(promises[i], i);
			}
		});
	};

	Promise$1.resolve = function (value) {
		return new Promise$1(function (fulfill) {
			fulfill(value);
		});
	};

	Promise$1.reject = function (reason) {
		return new Promise$1(function (fulfill, reject) {
			reject(reason);
		});
	};

	// TODO use MutationObservers or something to simulate setImmediate
	var wait = function (callback) {
		setTimeout(callback, 0);
	};

	var makeDispatcher = function (handlers, result) {
		return function () {
			for (var handler = (void 0); handler = handlers.shift();) {
				handler(result);
			}
		};
	};

	var resolve = function (promise, x, fulfil, reject) {
		var then;
		if (x === promise) {
			throw new TypeError("A promise's fulfillment handler cannot return the same promise");
		}
		if (x instanceof Promise$1) {
			x.then(fulfil, reject);
		} else if (x && (typeof x === 'object' || typeof x === 'function')) {
			try {
				then = x.then;
			} catch (e) {
				reject(e);
				return;
			}
			if (typeof then === 'function') {
				var called;

				var resolvePromise = function (y) {
					if (called) { return; }
					called = true;
					resolve(promise, y, fulfil, reject);
				};
				var rejectPromise = function (r) {
					if (called) { return; }
					called = true;
					reject(r);
				};

				try {
					then.call(x, resolvePromise, rejectPromise);
				} catch (e) {
					if (!called) {
						reject(e);
						called = true;
						return;
					}
				}
			} else {
				fulfil(x);
			}
		} else {
			fulfil(x);
		}
	};

}

if (typeof window !== 'undefined' && !(window.requestAnimationFrame && window.cancelAnimationFrame)) {
	var lastTime = 0;
	window.requestAnimationFrame = function (callback) {
		var currentTime = Date.now();
		var timeToNextCall = Math.max(0, 16 - (currentTime - lastTime));
		var id = window.setTimeout(function () { callback(currentTime + timeToNextCall); }, timeToNextCall);
		lastTime = currentTime + timeToNextCall;
		return id;
	};
	window.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
}

var defaults = {
	// render placement:
	el:                     void 0,
	append:                 false,
	delegate:               true,

	// template:
	template:               null,

	// parse:
	delimiters:             [ '{{', '}}' ],
	tripleDelimiters:       [ '{{{', '}}}' ],
	staticDelimiters:       [ '[[', ']]' ],
	staticTripleDelimiters: [ '[[[', ']]]' ],
	csp:                    true,
	interpolate:            false,
	preserveWhitespace:     false,
	sanitize:               false,
	stripComments:          true,
	contextLines:           0,
	parserTransforms:       [],

	// data & binding:
	data:                   {},
	computed:               {},
	syncComputedChildren:   false,
	resolveInstanceMembers: true,
	warnAboutAmbiguity:     false,
	adapt:                  [],
	isolated:               true,
	twoway:                 true,
	lazy:                   false,

	// transitions:
	noIntro:                false,
	noOutro:                false,
	transitionsEnabled:     true,
	complete:               void 0,
	nestedTransitions:      true,

	// css:
	css:                    null,
	noCssTransform:         false
};

// These are a subset of the easing equations found at
// https://raw.github.com/danro/easing-js - license info
// follows:

// --------------------------------------------------
// easing.js v0.5.4
// Generic set of easing functions with AMD support
// https://github.com/danro/easing-js
// This code may be freely distributed under the MIT license
// http://danro.mit-license.org/
// --------------------------------------------------
// All functions adapted from Thomas Fuchs & Jeremy Kahn
// Easing Equations (c) 2003 Robert Penner, BSD license
// https://raw.github.com/danro/easing-js/master/LICENSE
// --------------------------------------------------

// In that library, the functions named easeIn, easeOut, and
// easeInOut below are named easeInCubic, easeOutCubic, and
// (you guessed it) easeInOutCubic.
//
// You can add additional easing functions to this list, and they
// will be globally available.


var easing = {
	linear: function linear ( pos ) { return pos; },
	easeIn: function easeIn ( pos ) { return Math.pow( pos, 3 ); },
	easeOut: function easeOut ( pos ) { return ( Math.pow( ( pos - 1 ), 3 ) + 1 ); },
	easeInOut: function easeInOut ( pos ) {
		if ( ( pos /= 0.5 ) < 1 ) { return ( 0.5 * Math.pow( pos, 3 ) ); }
		return ( 0.5 * ( Math.pow( ( pos - 2 ), 3 ) + 2 ) );
	}
};

var toString = Object.prototype.toString;


function isEqual ( a, b ) {
	if ( a === null && b === null ) {
		return true;
	}

	if ( typeof a === 'object' || typeof b === 'object' ) {
		return false;
	}

	return a === b;
}

// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
function isNumeric ( thing ) {
	return !isNaN( parseFloat( thing ) ) && isFinite( thing );
}

function isObject ( thing ) {
	return ( thing && toString.call( thing ) === '[object Object]' );
}

function isObjectLike ( thing ) {
	if ( !thing ) { return false; }
	var type = typeof thing;
	if ( type === 'object' || type === 'function' ) { return true; }
}

/* eslint no-console:"off" */
var win = typeof window !== 'undefined' ? window : null;
var doc = win ? document : null;
var isClient = !!doc;
var hasConsole = ( typeof console !== 'undefined' && typeof console.warn === 'function' && typeof console.warn.apply === 'function' );

var svg = doc ?
	doc.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' ) :
	false;

var vendors = [ 'o', 'ms', 'moz', 'webkit' ];

var noop = function () {};

/* global console */
/* eslint no-console:"off" */

var alreadyWarned = {};
var log;
var printWarning;
var welcome;

if ( hasConsole ) {
	var welcomeIntro = [
		"%cRactive.js %c0.9.3 %cin debug mode, %cmore...",
		'color: rgb(114, 157, 52); font-weight: normal;',
		'color: rgb(85, 85, 85); font-weight: normal;',
		'color: rgb(85, 85, 85); font-weight: normal;',
		'color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;'
	];
	var welcomeMessage = "You're running Ractive 0.9.3 in debug mode - messages will be printed to the console to help you fix problems and optimise your application.\n\nTo disable debug mode, add this line at the start of your app:\n  Ractive.DEBUG = false;\n\nTo disable debug mode when your app is minified, add this snippet:\n  Ractive.DEBUG = /unminified/.test(function(){/*unminified*/});\n\nGet help and support:\n  http://docs.ractivejs.org\n  http://stackoverflow.com/questions/tagged/ractivejs\n  http://groups.google.com/forum/#!forum/ractive-js\n  http://twitter.com/ractivejs\n\nFound a bug? Raise an issue:\n  https://github.com/ractivejs/ractive/issues\n\n";

	welcome = function () {
		if ( Ractive.WELCOME_MESSAGE === false ) {
			welcome = noop;
			return;
		}
		var message = 'WELCOME_MESSAGE' in Ractive ? Ractive.WELCOME_MESSAGE : welcomeMessage;
		var hasGroup = !!console.groupCollapsed;
		if ( hasGroup ) { console.groupCollapsed.apply( console, welcomeIntro ); }
		console.log( message );
		if ( hasGroup ) {
			console.groupEnd( welcomeIntro );
		}

		welcome = noop;
	};

	printWarning = function ( message, args ) {
		welcome();

		// extract information about the instance this message pertains to, if applicable
		if ( typeof args[ args.length - 1 ] === 'object' ) {
			var options = args.pop();
			var ractive = options ? options.ractive : null;

			if ( ractive ) {
				// if this is an instance of a component that we know the name of, add
				// it to the message
				var name;
				if ( ractive.component && ( name = ractive.component.name ) ) {
					message = "<" + name + "> " + message;
				}

				var node;
				if ( node = ( options.node || ( ractive.fragment && ractive.fragment.rendered && ractive.find( '*' ) ) ) ) {
					args.push( node );
				}
			}
		}

		console.warn.apply( console, [ '%cRactive.js: %c' + message, 'color: rgb(114, 157, 52);', 'color: rgb(85, 85, 85);' ].concat( args ) );
	};

	log = function () {
		console.log.apply( console, arguments );
	};
} else {
	printWarning = log = welcome = noop;
}

function format ( message, args ) {
	return message.replace( /%s/g, function () { return args.shift(); } );
}

function fatal ( message ) {
	var args = [], len = arguments.length - 1;
	while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

	message = format( message, args );
	throw new Error( message );
}

function logIfDebug () {
	if ( Ractive.DEBUG ) {
		log.apply( null, arguments );
	}
}

function warn ( message ) {
	var args = [], len = arguments.length - 1;
	while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

	message = format( message, args );
	printWarning( message, args );
}

function warnOnce ( message ) {
	var args = [], len = arguments.length - 1;
	while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

	message = format( message, args );

	if ( alreadyWarned[ message ] ) {
		return;
	}

	alreadyWarned[ message ] = true;
	printWarning( message, args );
}

function warnIfDebug () {
	if ( Ractive.DEBUG ) {
		warn.apply( null, arguments );
	}
}

function warnOnceIfDebug () {
	if ( Ractive.DEBUG ) {
		warnOnce.apply( null, arguments );
	}
}

// Error messages that are used (or could be) in multiple places
var badArguments = 'Bad arguments';
var noRegistryFunctionReturn = 'A function was specified for "%s" %s, but no %s was returned';
var missingPlugin = function ( name, type ) { return ("Missing \"" + name + "\" " + type + " plugin. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#" + type + "s"); };

function findInViewHierarchy ( registryName, ractive, name ) {
	var instance = findInstance( registryName, ractive, name );
	return instance ? instance[ registryName ][ name ] : null;
}

function findInstance ( registryName, ractive, name ) {
	while ( ractive ) {
		if ( name in ractive[ registryName ] ) {
			return ractive;
		}

		if ( ractive.isolated ) {
			return null;
		}

		ractive = ractive.parent;
	}
}

function interpolate ( from, to, ractive, type ) {
	if ( from === to ) { return null; }

	if ( type ) {
		var interpol = findInViewHierarchy( 'interpolators', ractive, type );
		if ( interpol ) { return interpol( from, to ) || null; }

		fatal( missingPlugin( type, 'interpolator' ) );
	}

	return interpolators.number( from, to ) ||
	       interpolators.array( from, to ) ||
	       interpolators.object( from, to ) ||
	       null;
}

function snap ( to ) {
	return function () { return to; };
}

var interpolators = {
	number: function number ( from, to ) {
		if ( !isNumeric( from ) || !isNumeric( to ) ) {
			return null;
		}

		from = +from;
		to = +to;

		var delta = to - from;

		if ( !delta ) {
			return function () { return from; };
		}

		return function ( t ) {
			return from + ( t * delta );
		};
	},

	array: function array ( from, to ) {
		var len, i;

		if ( !Array.isArray( from ) || !Array.isArray( to ) ) {
			return null;
		}

		var intermediate = [];
		var interpolators = [];

		i = len = Math.min( from.length, to.length );
		while ( i-- ) {
			interpolators[i] = interpolate( from[i], to[i] );
		}

		// surplus values - don't interpolate, but don't exclude them either
		for ( i=len; i<from.length; i+=1 ) {
			intermediate[i] = from[i];
		}

		for ( i=len; i<to.length; i+=1 ) {
			intermediate[i] = to[i];
		}

		return function ( t ) {
			var i = len;

			while ( i-- ) {
				intermediate[i] = interpolators[i]( t );
			}

			return intermediate;
		};
	},

	object: function object ( from, to ) {
		if ( !isObject( from ) || !isObject( to ) ) {
			return null;
		}

		var properties = [];
		var intermediate = {};
		var interpolators = {};

		for ( var prop in from ) {
			if ( from.hasOwnProperty( prop ) ) {
				if ( to.hasOwnProperty( prop ) ) {
					properties.push( prop );
					interpolators[ prop ] = interpolate( from[ prop ], to[ prop ] ) || snap( to[ prop ] );
				}

				else {
					intermediate[ prop ] = from[ prop ];
				}
			}
		}

		for ( var prop$1 in to ) {
			if ( to.hasOwnProperty( prop$1 ) && !from.hasOwnProperty( prop$1 ) ) {
				intermediate[ prop$1 ] = to[ prop$1 ];
			}
		}

		var len = properties.length;

		return function ( t ) {
			var i = len;

			while ( i-- ) {
				var prop = properties[i];

				intermediate[ prop ] = interpolators[ prop ]( t );
			}

			return intermediate;
		};
	}
};

function addToArray ( array, value ) {
	var index = array.indexOf( value );

	if ( index === -1 ) {
		array.push( value );
	}
}

function arrayContains ( array, value ) {
	for ( var i = 0, c = array.length; i < c; i++ ) {
		if ( array[i] == value ) {
			return true;
		}
	}

	return false;
}

function arrayContentsMatch ( a, b ) {
	var i;

	if ( !Array.isArray( a ) || !Array.isArray( b ) ) {
		return false;
	}

	if ( a.length !== b.length ) {
		return false;
	}

	i = a.length;
	while ( i-- ) {
		if ( a[i] !== b[i] ) {
			return false;
		}
	}

	return true;
}

function ensureArray ( x ) {
	if ( typeof x === 'string' ) {
		return [ x ];
	}

	if ( x === undefined ) {
		return [];
	}

	return x;
}

function lastItem ( array ) {
	return array[ array.length - 1 ];
}

function removeFromArray ( array, member ) {
	if ( !array ) {
		return;
	}

	var index = array.indexOf( member );

	if ( index !== -1 ) {
		array.splice( index, 1 );
	}
}

function combine () {
	var arrays = [], len = arguments.length;
	while ( len-- ) arrays[ len ] = arguments[ len ];

	var res = arrays.concat.apply( [], arrays );
	var i = res.length;
	while ( i-- ) {
		var idx = res.indexOf( res[i] );
		if ( ~idx && idx < i ) { res.splice( i, 1 ); }
	}

	return res;
}

function toArray ( arrayLike ) {
	var array = [];
	var i = arrayLike.length;
	while ( i-- ) {
		array[i] = arrayLike[i];
	}

	return array;
}

function findMap ( array, fn ) {
	var len = array.length;
	for ( var i = 0; i < len; i++ ) {
		var result = fn( array[i] );
		if ( result ) { return result; }
	}
}

var TransitionManager = function TransitionManager ( callback, parent ) {
	this.callback = callback;
	this.parent = parent;

	this.intros = [];
	this.outros = [];

	this.children = [];
	this.totalChildren = this.outroChildren = 0;

	this.detachQueue = [];
	this.outrosComplete = false;

	if ( parent ) {
		parent.addChild( this );
	}
};

TransitionManager.prototype.add = function add ( transition ) {
	var list = transition.isIntro ? this.intros : this.outros;
	transition.starting = true;
	list.push( transition );
};

TransitionManager.prototype.addChild = function addChild ( child ) {
	this.children.push( child );

	this.totalChildren += 1;
	this.outroChildren += 1;
};

TransitionManager.prototype.decrementOutros = function decrementOutros () {
	this.outroChildren -= 1;
	check( this );
};

TransitionManager.prototype.decrementTotal = function decrementTotal () {
	this.totalChildren -= 1;
	check( this );
};

TransitionManager.prototype.detachNodes = function detachNodes () {
	this.detachQueue.forEach( detach );
	this.children.forEach( _detachNodes );
	this.detachQueue = [];
};

TransitionManager.prototype.ready = function ready () {
	if ( this.detachQueue.length ) { detachImmediate( this ); }
};

TransitionManager.prototype.remove = function remove ( transition ) {
	var list = transition.isIntro ? this.intros : this.outros;
	removeFromArray( list, transition );
	check( this );
};

TransitionManager.prototype.start = function start () {
	this.children.forEach( function (c) { return c.start(); } );
	this.intros.concat( this.outros ).forEach( function (t) { return t.start(); } );
	this.ready = true;
	check( this );
};

function detach ( element ) {
	element.detach();
}

function _detachNodes ( tm ) { // _ to avoid transpiler quirk
	tm.detachNodes();
}

function check ( tm ) {
	if ( !tm.ready || tm.outros.length || tm.outroChildren ) { return; }

	// If all outros are complete, and we haven't already done this,
	// we notify the parent if there is one, otherwise
	// start detaching nodes
	if ( !tm.outrosComplete ) {
		tm.outrosComplete = true;

		if ( tm.parent && !tm.parent.outrosComplete ) {
			tm.parent.decrementOutros( tm );
		} else {
			tm.detachNodes();
		}
	}

	// Once everything is done, we can notify parent transition
	// manager and call the callback
	if ( !tm.intros.length && !tm.totalChildren ) {
		if ( typeof tm.callback === 'function' ) {
			tm.callback();
		}

		if ( tm.parent && !tm.notifiedTotal ) {
			tm.notifiedTotal = true;
			tm.parent.decrementTotal();
		}
	}
}

// check through the detach queue to see if a node is up or downstream from a
// transition and if not, go ahead and detach it
function detachImmediate ( manager ) {
	var queue = manager.detachQueue;
	var outros = collectAllOutros( manager );

	var i = queue.length;
	var j = 0;
	var node, trans;
	start: while ( i-- ) {
		node = queue[i].node;
		j = outros.length;
		while ( j-- ) {
			trans = outros[j].element.node;
			// check to see if the node is, contains, or is contained by the transitioning node
			if ( trans === node || trans.contains( node ) || node.contains( trans ) ) { continue start; }
		}

		// no match, we can drop it
		queue[i].detach();
		queue.splice( i, 1 );
	}
}

function collectAllOutros ( manager, _list ) {
	var list = _list;

	// if there's no list, we're starting at the root to build one
	if ( !list ) {
		list = [];
		var parent = manager;
		while ( parent.parent ) { parent = parent.parent; }
		return collectAllOutros( parent, list );
	} else {
		// grab all outros from child managers
		var i = manager.children.length;
		while ( i-- ) {
			list = collectAllOutros( manager.children[i], list );
		}

		// grab any from this manager if there are any
		if ( manager.outros.length ) { list = list.concat( manager.outros ); }

		return list;
	}
}

var batch;

var runloop = {
	start: function start ( instance ) {
		var fulfilPromise;
		var promise = new Promise( function (f) { return ( fulfilPromise = f ); } );

		batch = {
			previousBatch: batch,
			transitionManager: new TransitionManager( fulfilPromise, batch && batch.transitionManager ),
			fragments: [],
			tasks: [],
			immediateObservers: [],
			deferredObservers: [],
			instance: instance,
			promise: promise
		};

		return promise;
	},

	end: function end () {
		flushChanges();

		if ( !batch.previousBatch ) { batch.transitionManager.start(); }

		batch = batch.previousBatch;
	},

	addFragment: function addFragment ( fragment ) {
		addToArray( batch.fragments, fragment );
	},

	// TODO: come up with a better way to handle fragments that trigger their own update
	addFragmentToRoot: function addFragmentToRoot ( fragment ) {
		if ( !batch ) { return; }

		var b = batch;
		while ( b.previousBatch ) {
			b = b.previousBatch;
		}

		addToArray( b.fragments, fragment );
	},

	addObserver: function addObserver ( observer, defer ) {
		if ( !batch ) {
			observer.dispatch();
		} else {
			addToArray( defer ? batch.deferredObservers : batch.immediateObservers, observer );
		}
	},

	registerTransition: function registerTransition ( transition ) {
		transition._manager = batch.transitionManager;
		batch.transitionManager.add( transition );
	},

	// synchronise node detachments with transition ends
	detachWhenReady: function detachWhenReady ( thing ) {
		batch.transitionManager.detachQueue.push( thing );
	},

	scheduleTask: function scheduleTask ( task, postRender ) {
		var _batch;

		if ( !batch ) {
			task();
		} else {
			_batch = batch;
			while ( postRender && _batch.previousBatch ) {
				// this can't happen until the DOM has been fully updated
				// otherwise in some situations (with components inside elements)
				// transitions and decorators will initialise prematurely
				_batch = _batch.previousBatch;
			}

			_batch.tasks.push( task );
		}
	},

	promise: function promise () {
		if ( !batch ) { return Promise.resolve(); }

		var target = batch;
		while ( target.previousBatch ) {
			target = target.previousBatch;
		}

		return target.promise || Promise.resolve();
	}
};

function dispatch ( observer ) {
	observer.dispatch();
}

function flushChanges () {
	var which = batch.immediateObservers;
	batch.immediateObservers = [];
	which.forEach( dispatch );

	// Now that changes have been fully propagated, we can update the DOM
	// and complete other tasks
	var i = batch.fragments.length;
	var fragment;

	which = batch.fragments;
	batch.fragments = [];

	while ( i-- ) {
		fragment = which[i];
		fragment.update();
	}

	batch.transitionManager.ready();

	which = batch.deferredObservers;
	batch.deferredObservers = [];
	which.forEach( dispatch );

	var tasks = batch.tasks;
	batch.tasks = [];

	for ( i = 0; i < tasks.length; i += 1 ) {
		tasks[i]();
	}

	// If updating the view caused some model blowback - e.g. a triple
	// containing <option> elements caused the binding on the <select>
	// to update - then we start over
	if ( batch.fragments.length || batch.immediateObservers.length || batch.deferredObservers.length || batch.tasks.length ) { return flushChanges(); }
}

var refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
var splitPattern = /([^\\](?:\\\\)*)\./;
var escapeKeyPattern = /\\|\./g;
var unescapeKeyPattern = /((?:\\)+)\1|\\(\.)/g;

function escapeKey ( key ) {
	if ( typeof key === 'string' ) {
		return key.replace( escapeKeyPattern, '\\$&' );
	}

	return key;
}

function normalise ( ref ) {
	return ref ? ref.replace( refPattern, '.$1' ) : '';
}

function splitKeypath ( keypath ) {
	var result = [];
	var match;

	keypath = normalise( keypath );

	while ( match = splitPattern.exec( keypath ) ) {
		var index = match.index + match[1].length;
		result.push( keypath.substr( 0, index ) );
		keypath = keypath.substr( index + 1 );
	}

	result.push( keypath );

	return result;
}

function unescapeKey ( key ) {
	if ( typeof key === 'string' ) {
		return key.replace( unescapeKeyPattern, '$1$2' );
	}

	return key;
}

var stack = [];
var captureGroup;

function startCapturing () {
	stack.push( captureGroup = [] );
}

function stopCapturing () {
	var dependencies = stack.pop();
	captureGroup = stack[ stack.length - 1 ];
	return dependencies;
}

function capture ( model ) {
	if ( captureGroup ) {
		captureGroup.push( model );
	}
}

var KeyModel = function KeyModel ( key, parent ) {
	this.value = key;
	this.isReadonly = this.isKey = true;
	this.deps = [];
	this.links = [];
	this.parent = parent;
};

KeyModel.prototype.get = function get ( shouldCapture ) {
	if ( shouldCapture ) { capture( this ); }
	return unescapeKey( this.value );
};

KeyModel.prototype.getKeypath = function getKeypath () {
	return unescapeKey( this.value );
};

KeyModel.prototype.rebind = function rebind ( next, previous ) {
		var this$1 = this;

	var i = this.deps.length;
	while ( i-- ) { this$1.deps[i].rebind( next, previous, false ); }

	i = this.links.length;
	while ( i-- ) { this$1.links[i].relinking( next, false ); }
};

KeyModel.prototype.register = function register ( dependant ) {
	this.deps.push( dependant );
};

KeyModel.prototype.registerLink = function registerLink ( link ) {
	addToArray( this.links, link );
};

KeyModel.prototype.unregister = function unregister ( dependant ) {
	removeFromArray( this.deps, dependant );
};

KeyModel.prototype.unregisterLink = function unregisterLink ( link ) {
	removeFromArray( this.links, link );
};

KeyModel.prototype.reference = noop;
KeyModel.prototype.unreference = noop;

function bind               ( x ) { x.bind(); }
function cancel             ( x ) { x.cancel(); }
function destroyed          ( x ) { x.destroyed(); }
function handleChange       ( x ) { x.handleChange(); }
function mark               ( x ) { x.mark(); }
function markForce          ( x ) { x.mark( true ); }
function marked             ( x ) { x.marked(); }
function markedAll          ( x ) { x.markedAll(); }
function render             ( x ) { x.render(); }
function shuffled           ( x ) { x.shuffled(); }
function teardown           ( x ) { x.teardown(); }
function unbind             ( x ) { x.unbind(); }
function unrender           ( x ) { x.unrender(); }
function unrenderAndDestroy ( x ) { x.unrender( true ); }
function update             ( x ) { x.update(); }
function toString$1           ( x ) { return x.toString(); }
function toEscapedString    ( x ) { return x.toString( true ); }

var KeypathModel = function KeypathModel ( parent, ractive ) {
	this.parent = parent;
	this.ractive = ractive;
	this.value = ractive ? parent.getKeypath( ractive ) : parent.getKeypath();
	this.deps = [];
	this.children = {};
	this.isReadonly = this.isKeypath = true;
};

KeypathModel.prototype.get = function get ( shouldCapture ) {
	if ( shouldCapture ) { capture( this ); }
	return this.value;
};

KeypathModel.prototype.getChild = function getChild ( ractive ) {
	if ( !( ractive._guid in this.children ) ) {
		var model = new KeypathModel( this.parent, ractive );
		this.children[ ractive._guid ] = model;
		model.owner = this;
	}
	return this.children[ ractive._guid ];
};

KeypathModel.prototype.getKeypath = function getKeypath () {
	return this.value;
};

KeypathModel.prototype.handleChange = function handleChange$1 () {
		var this$1 = this;

	var keys = Object.keys( this.children );
	var i = keys.length;
	while ( i-- ) {
		this$1.children[ keys[i] ].handleChange();
	}

	this.deps.forEach( handleChange );
};

KeypathModel.prototype.rebindChildren = function rebindChildren ( next ) {
		var this$1 = this;

	var keys = Object.keys( this.children );
	var i = keys.length;
	while ( i-- ) {
		var child = this$1.children[keys[i]];
		child.value = next.getKeypath( child.ractive );
		child.handleChange();
	}
};

KeypathModel.prototype.rebind = function rebind ( next, previous ) {
		var this$1 = this;

	var model = next ? next.getKeypathModel( this.ractive ) : undefined;

	var keys = Object.keys( this.children );
	var i = keys.length;
	while ( i-- ) {
		this$1.children[ keys[i] ].rebind( next, previous, false );
	}

	i = this.deps.length;
	while ( i-- ) {
		this$1.deps[i].rebind( model, this$1, false );
	}
};

KeypathModel.prototype.register = function register ( dep ) {
	this.deps.push( dep );
};

KeypathModel.prototype.removeChild = function removeChild ( model ) {
	if ( model.ractive ) { delete this.children[ model.ractive._guid ]; }
};

KeypathModel.prototype.teardown = function teardown$$1 () {
		var this$1 = this;

	if ( this.owner ) { this.owner.removeChild( this ); }

	var keys = Object.keys( this.children );
	var i = keys.length;
	while ( i-- ) {
		this$1.children[ keys[i] ].teardown();
	}
};

KeypathModel.prototype.unregister = function unregister ( dep ) {
	removeFromArray( this.deps, dep );
	if ( !this.deps.length ) { this.teardown(); }
};

KeypathModel.prototype.reference = noop;
KeypathModel.prototype.unreference = noop;

var fnBind = Function.prototype.bind;

function bind$1 ( fn, context ) {
	if ( !/this/.test( fn.toString() ) ) { return fn; }

	var bound = fnBind.call( fn, context );
	for ( var prop in fn ) { bound[ prop ] = fn[ prop ]; }

	return bound;
}

var hasProp = Object.prototype.hasOwnProperty;

var shuffleTasks = { early: [], mark: [] };
var registerQueue = { early: [], mark: [] };

var ModelBase = function ModelBase ( parent ) {
	this.deps = [];

	this.children = [];
	this.childByKey = {};
	this.links = [];

	this.keyModels = {};

	this.bindings = [];
	this.patternObservers = [];

	if ( parent ) {
		this.parent = parent;
		this.root = parent.root;
	}
};

ModelBase.prototype.addShuffleTask = function addShuffleTask ( task, stage ) {
	if ( stage === void 0 ) stage = 'early';
 shuffleTasks[stage].push( task ); };
ModelBase.prototype.addShuffleRegister = function addShuffleRegister ( item, stage ) {
	if ( stage === void 0 ) stage = 'early';
 registerQueue[stage].push({ model: this, item: item }); };

ModelBase.prototype.findMatches = function findMatches ( keys ) {
	var len = keys.length;

	var existingMatches = [ this ];
	var matches;
	var i;

	var loop = function (  ) {
		var key = keys[i];

		if ( key === '*' ) {
			matches = [];
			existingMatches.forEach( function (model) {
				matches.push.apply( matches, model.getValueChildren( model.get() ) );
			});
		} else {
			matches = existingMatches.map( function (model) { return model.joinKey( key ); } );
		}

		existingMatches = matches;
	};

		for ( i = 0; i < len; i += 1 ) loop(  );

	return matches;
};

ModelBase.prototype.getKeyModel = function getKeyModel ( key, skip ) {
	if ( key !== undefined && !skip ) { return this.parent.getKeyModel( key, true ); }

	if ( !( key in this.keyModels ) ) { this.keyModels[ key ] = new KeyModel( escapeKey( key ), this ); }

	return this.keyModels[ key ];
};

ModelBase.prototype.getKeypath = function getKeypath ( ractive ) {
	if ( ractive !== this.ractive && this._link ) { return this._link.target.getKeypath( ractive ); }

	if ( !this.keypath ) {
		var parent = this.parent && this.parent.getKeypath( ractive );
		this.keypath = parent ? ((this.parent.getKeypath( ractive )) + "." + (escapeKey( this.key ))) : escapeKey( this.key );
	}

	return this.keypath;
};

ModelBase.prototype.getValueChildren = function getValueChildren ( value ) {
		var this$1 = this;

	var children;
	if ( Array.isArray( value ) ) {
		children = [];
		if ( 'length' in this && this.length !== value.length ) {
			children.push( this.joinKey( 'length' ) );
		}
		value.forEach( function ( m, i ) {
			children.push( this$1.joinKey( i ) );
		});
	}

	else if ( isObject( value ) || typeof value === 'function' ) {
		children = Object.keys( value ).map( function (key) { return this$1.joinKey( key ); } );
	}

	else if ( value != null ) {
		return [];
	}

	return children;
};

ModelBase.prototype.getVirtual = function getVirtual ( shouldCapture ) {
		var this$1 = this;

	var value = this.get( shouldCapture, { virtual: false } );
	if ( isObject( value ) ) {
		var result = Array.isArray( value ) ? [] : {};

		var keys = Object.keys( value );
		var i = keys.length;
		while ( i-- ) {
			var child = this$1.childByKey[ keys[i] ];
			if ( !child ) { result[ keys[i] ] = value[ keys[i] ]; }
			else if ( child._link ) { result[ keys[i] ] = child._link.getVirtual(); }
			else { result[ keys[i] ] = child.getVirtual(); }
		}

		i = this.children.length;
		while ( i-- ) {
			var child$1 = this$1.children[i];
			if ( !( child$1.key in result ) && child$1._link ) {
				result[ child$1.key ] = child$1._link.getVirtual();
			}
		}

		return result;
	} else { return value; }
};

ModelBase.prototype.has = function has ( key ) {
	if ( this._link ) { return this._link.has( key ); }

	var value = this.get();
	if ( !value ) { return false; }

	key = unescapeKey( key );
	if ( hasProp.call( value, key ) ) { return true; }

	// We climb up the constructor chain to find if one of them contains the key
	var constructor = value.constructor;
	while ( constructor !== Function && constructor !== Array && constructor !== Object ) {
		if ( hasProp.call( constructor.prototype, key ) ) { return true; }
		constructor = constructor.constructor;
	}

	return false;
};

ModelBase.prototype.joinAll = function joinAll ( keys, opts ) {
	var model = this;
	for ( var i = 0; i < keys.length; i += 1 ) {
		if ( opts && opts.lastLink === false && i + 1 === keys.length && model.childByKey[keys[i]] && model.childByKey[keys[i]]._link ) { return model.childByKey[keys[i]]; }
		model = model.joinKey( keys[i], opts );
	}

	return model;
};

ModelBase.prototype.notifyUpstream = function notifyUpstream ( startPath ) {
		var this$1 = this;

	var parent = this.parent;
	var path = startPath || [ this.key ];
	while ( parent ) {
		if ( parent.patternObservers.length ) { parent.patternObservers.forEach( function (o) { return o.notify( path.slice() ); } ); }
		path.unshift( parent.key );
		parent.links.forEach( function (l) { return l.notifiedUpstream( path, this$1.root ); } );
		parent.deps.forEach( handleChange );
		parent = parent.parent;
	}
};

ModelBase.prototype.rebind = function rebind ( next, previous, safe ) {
		var this$1 = this;

	// tell the deps to move to the new target
	var i = this.deps.length;
	while ( i-- ) {
		if ( this$1.deps[i].rebind ) { this$1.deps[i].rebind( next, previous, safe ); }
	}

	i = this.links.length;
	while ( i-- ) {
		var link = this$1.links[i];
		// only relink the root of the link tree
		if ( link.owner._link ) { link.relinking( next, safe ); }
	}

	i = this.children.length;
	while ( i-- ) {
		var child = this$1.children[i];
		child.rebind( next ? next.joinKey( child.key ) : undefined, child, safe );
	}

	if ( this.keypathModel ) { this.keypathModel.rebind( next, previous, false ); }

	i = this.bindings.length;
	while ( i-- ) {
		this$1.bindings[i].rebind( next, previous, safe );
	}
};

ModelBase.prototype.reference = function reference () {
	'refs' in this ? this.refs++ : this.refs = 1;
};

ModelBase.prototype.register = function register ( dep ) {
	this.deps.push( dep );
};

ModelBase.prototype.registerLink = function registerLink ( link ) {
	addToArray( this.links, link );
};

ModelBase.prototype.registerPatternObserver = function registerPatternObserver ( observer ) {
	this.patternObservers.push( observer );
	this.register( observer );
};

ModelBase.prototype.registerTwowayBinding = function registerTwowayBinding ( binding ) {
	this.bindings.push( binding );
};

ModelBase.prototype.unreference = function unreference () {
	if ( 'refs' in this ) { this.refs--; }
};

ModelBase.prototype.unregister = function unregister ( dep ) {
	removeFromArray( this.deps, dep );
};

ModelBase.prototype.unregisterLink = function unregisterLink ( link ) {
	removeFromArray( this.links, link );
};

ModelBase.prototype.unregisterPatternObserver = function unregisterPatternObserver ( observer ) {
	removeFromArray( this.patternObservers, observer );
	this.unregister( observer );
};

ModelBase.prototype.unregisterTwowayBinding = function unregisterTwowayBinding ( binding ) {
	removeFromArray( this.bindings, binding );
};

ModelBase.prototype.updateFromBindings = function updateFromBindings$1 ( cascade ) {
		var this$1 = this;

	var i = this.bindings.length;
	while ( i-- ) {
		var value = this$1.bindings[i].getValue();
		if ( value !== this$1.value ) { this$1.set( value ); }
	}

	// check for one-way bindings if there are no two-ways
	if ( !this.bindings.length ) {
		var oneway = findBoundValue( this.deps );
		if ( oneway && oneway.value !== this.value ) { this.set( oneway.value ); }
	}

	if ( cascade ) {
		this.children.forEach( updateFromBindings );
		this.links.forEach( updateFromBindings );
		if ( this._link ) { this._link.updateFromBindings( cascade ); }
	}
};

// TODO: this may be better handled by overreiding `get` on models with a parent that isRoot
function maybeBind ( model, value, shouldBind ) {
	if ( shouldBind && typeof value === 'function' && model.parent && model.parent.isRoot ) {
		if ( !model.boundValue ) {
			model.boundValue = bind$1( value._r_unbound || value, model.parent.ractive );
		}

		return model.boundValue;
	}

	return value;
}

function updateFromBindings ( model ) {
	model.updateFromBindings( true );
}

function findBoundValue( list ) {
	var i = list.length;
	while ( i-- ) {
		if ( list[i].bound ) {
			var owner = list[i].owner;
			if ( owner ) {
				var value = owner.name === 'checked' ?
					owner.node.checked :
					owner.node.value;
				return { value: value };
			}
		}
	}
}

function fireShuffleTasks ( stage ) {
	if ( !stage ) {
		fireShuffleTasks( 'early' );
		fireShuffleTasks( 'mark' );
	} else {
		var tasks = shuffleTasks[stage];
		shuffleTasks[stage] = [];
		var i = tasks.length;
		while ( i-- ) { tasks[i](); }

		var register = registerQueue[stage];
		registerQueue[stage] = [];
		i = register.length;
		while ( i-- ) { register[i].model.register( register[i].item ); }
	}
}

function shuffle ( model, newIndices, link, unsafe ) {
	model.shuffling = true;

	var i = newIndices.length;
	while ( i-- ) {
		var idx = newIndices[ i ];
		// nothing is actually changing, so move in the index and roll on
		if ( i === idx ) {
			continue;
		}

		// rebind the children on i to idx
		if ( i in model.childByKey ) { model.childByKey[ i ].rebind( !~idx ? undefined : model.joinKey( idx ), model.childByKey[ i ], !unsafe ); }

		if ( !~idx && model.keyModels[ i ] ) {
			model.keyModels[i].rebind( undefined, model.keyModels[i], false );
		} else if ( ~idx && model.keyModels[ i ] ) {
			if ( !model.keyModels[ idx ] ) { model.childByKey[ idx ].getKeyModel( idx ); }
			model.keyModels[i].rebind( model.keyModels[ idx ], model.keyModels[i], false );
		}
	}

	var upstream = model.source().length !== model.source().value.length;

	model.links.forEach( function (l) { return l.shuffle( newIndices ); } );
	if ( !link ) { fireShuffleTasks( 'early' ); }

	i = model.deps.length;
	while ( i-- ) {
		if ( model.deps[i].shuffle ) { model.deps[i].shuffle( newIndices ); }
	}

	model[ link ? 'marked' : 'mark' ]();
	if ( !link ) { fireShuffleTasks( 'mark' ); }

	if ( upstream ) { model.notifyUpstream(); }

	model.shuffling = false;
}

KeyModel.prototype.addShuffleTask = ModelBase.prototype.addShuffleTask;
KeyModel.prototype.addShuffleRegister = ModelBase.prototype.addShuffleRegister;
KeypathModel.prototype.addShuffleTask = ModelBase.prototype.addShuffleTask;
KeypathModel.prototype.addShuffleRegister = ModelBase.prototype.addShuffleRegister;

// this is the dry method of checking to see if a rebind applies to
// a particular keypath because in some cases, a dep may be bound
// directly to a particular keypath e.g. foo.bars.0.baz and need
// to avoid getting kicked to foo.bars.1.baz if foo.bars is unshifted
function rebindMatch ( template, next, previous, fragment ) {
	var keypath = template.r || template;

	// no valid keypath, go with next
	if ( !keypath || typeof keypath !== 'string' ) { return next; }

	// completely contextual ref, go with next
	if ( keypath === '.' || keypath[0] === '@' || ( next || previous ).isKey || ( next || previous ).isKeypath ) { return next; }

	var parts = keypath.split( '/' );
	var keys = splitKeypath( parts[ parts.length - 1 ] );
	var last = keys[ keys.length - 1 ];

	// check the keypath against the model keypath to see if it matches
	var model = next || previous;

	// check to see if this was an alias
	if ( model && keys.length === 1 && last !== model.key && fragment ) {
		keys = findAlias( last, fragment ) || keys;
	}

	var i = keys.length;
	var match = true;
	var shuffling = false;

	while ( model && i-- ) {
		if ( model.shuffling ) { shuffling = true; }
		// non-strict comparison to account for indices in keypaths
		if ( keys[i] != model.key ) { match = false; }
		model = model.parent;
	}

	// next is undefined, but keypath is shuffling and previous matches
	if ( !next && match && shuffling ) { return previous; }
	// next is defined, but doesn't match the keypath
	else if ( next && !match && shuffling ) { return previous; }
	else { return next; }
}

function findAlias ( name, fragment ) {
	while ( fragment ) {
		var z = fragment.aliases;
		if ( z && z[ name ] ) {
			var aliases = ( fragment.owner.iterations ? fragment.owner : fragment ).owner.template.z;
			for ( var i = 0; i < aliases.length; i++ ) {
				if ( aliases[i].n === name ) {
					var alias = aliases[i].x;
					if ( !alias.r ) { return false; }
					var parts = alias.r.split( '/' );
					return splitKeypath( parts[ parts.length - 1 ] );
				}
			}
			return;
		}

		fragment = fragment.componentParent || fragment.parent;
	}
}

// temporary placeholder target for detached implicit links
var Missing = {
	key: '@missing',
	animate: noop,
	applyValue: noop,
	get: noop,
	getKeypath: function getKeypath () { return this.key; },
	joinAll: function joinAll () { return this; },
	joinKey: function joinKey () { return this; },
	mark: noop,
	registerLink: noop,
	shufle: noop,
	set: noop,
	unregisterLink: noop
};
Missing.parent = Missing;

var LinkModel = (function (ModelBase$$1) {
	function LinkModel ( parent, owner, target, key ) {
		ModelBase$$1.call( this, parent );

		this.owner = owner;
		this.target = target;
		this.key = key === undefined ? owner.key : key;
		if ( owner.isLink ) { this.sourcePath = (owner.sourcePath) + "." + (this.key); }

		target.registerLink( this );

		if ( parent ) { this.isReadonly = parent.isReadonly; }

		this.isLink = true;
	}

	if ( ModelBase$$1 ) LinkModel.__proto__ = ModelBase$$1;
	LinkModel.prototype = Object.create( ModelBase$$1 && ModelBase$$1.prototype );
	LinkModel.prototype.constructor = LinkModel;

	LinkModel.prototype.animate = function animate ( from, to, options, interpolator ) {
		return this.target.animate( from, to, options, interpolator );
	};

	LinkModel.prototype.applyValue = function applyValue ( value ) {
		if ( this.boundValue ) { this.boundValue = null; }
		this.target.applyValue( value );
	};

	LinkModel.prototype.attach = function attach ( fragment ) {
		var model = resolveReference( fragment, this.key );
		if ( model ) {
			this.relinking( model, false );
		} else { // if there is no link available, move everything here to real models
			this.owner.unlink();
		}
	};

	LinkModel.prototype.detach = function detach () {
		this.relinking( Missing, false );
	};

	LinkModel.prototype.get = function get ( shouldCapture, opts ) {
		if ( opts === void 0 ) opts = {};

		if ( shouldCapture ) {
			capture( this );

			// may need to tell the target to unwrap
			opts.unwrap = true;
		}

		var bind$$1 = 'shouldBind' in opts ? opts.shouldBind : true;
		opts.shouldBind = this.mapping && this.target.parent.isRoot;

		return maybeBind( this, this.target.get( false, opts ), bind$$1 );
	};

	LinkModel.prototype.getKeypath = function getKeypath ( ractive ) {
		if ( ractive && ractive !== this.root.ractive ) { return this.target.getKeypath( ractive ); }

		return ModelBase$$1.prototype.getKeypath.call( this, ractive );
	};

	LinkModel.prototype.getKeypathModel = function getKeypathModel ( ractive ) {
		if ( !this.keypathModel ) { this.keypathModel = new KeypathModel( this ); }
		if ( ractive && ractive !== this.root.ractive ) { return this.keypathModel.getChild( ractive ); }
		return this.keypathModel;
	};

	LinkModel.prototype.handleChange = function handleChange$1 () {
		this.deps.forEach( handleChange );
		this.links.forEach( handleChange );
		this.notifyUpstream();
	};

	LinkModel.prototype.isDetached = function isDetached () { return this.virtual && this.target === Missing; };

	LinkModel.prototype.joinKey = function joinKey ( key ) {
		// TODO: handle nested links
		if ( key === undefined || key === '' ) { return this; }

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			var child = new LinkModel( this, this, this.target.joinKey( key ), key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	};

	LinkModel.prototype.mark = function mark$$1 ( force ) {
		this.target.mark( force );
	};

	LinkModel.prototype.marked = function marked$1 () {
		if ( this.boundValue ) { this.boundValue = null; }

		this.links.forEach( marked );

		this.deps.forEach( handleChange );
	};

	LinkModel.prototype.markedAll = function markedAll$1 () {
		this.children.forEach( markedAll );
		this.marked();
	};

	LinkModel.prototype.notifiedUpstream = function notifiedUpstream ( startPath, root ) {
		var this$1 = this;

		this.links.forEach( function (l) { return l.notifiedUpstream( startPath, this$1.root ); } );
		this.deps.forEach( handleChange );
		if ( startPath && this.rootLink && this.root !== root ) {
			var path = startPath.slice( 1 );
			path.unshift( this.key );
			this.notifyUpstream( path );
		}
	};

	LinkModel.prototype.relinked = function relinked () {
		this.target.registerLink( this );
		this.children.forEach( function (c) { return c.relinked(); } );
	};

	LinkModel.prototype.relinking = function relinking ( target, safe ) {
		var this$1 = this;

		if ( this.rootLink && this.sourcePath ) { target = rebindMatch( this.sourcePath, target, this.target ); }
		if ( !target || this.target === target ) { return; }

		this.target.unregisterLink( this );
		if ( this.keypathModel ) { this.keypathModel.rebindChildren( target ); }

		this.target = target;
		this.children.forEach( function (c) {
			c.relinking( target.joinKey( c.key ), safe );
		});

		if ( this.rootLink ) { this.addShuffleTask( function () {
			this$1.relinked();
			if ( !safe ) {
				this$1.markedAll();
				this$1.notifyUpstream();
			}
		}); }
	};

	LinkModel.prototype.set = function set ( value ) {
		if ( this.boundValue ) { this.boundValue = null; }
		this.target.set( value );
	};

	LinkModel.prototype.shuffle = function shuffle$1 ( newIndices ) {
		// watch for extra shuffles caused by a shuffle in a downstream link
		if ( this.shuffling ) { return; }

		// let the real model handle firing off shuffles
		if ( !this.target.shuffling ) {
			this.target.shuffle( newIndices );
		} else {
			shuffle( this, newIndices, true );
		}

	};

	LinkModel.prototype.source = function source () {
		if ( this.target.source ) { return this.target.source(); }
		else { return this.target; }
	};

	LinkModel.prototype.teardown = function teardown$1 () {
		if ( this._link ) { this._link.teardown(); }
		this.target.unregisterLink( this );
		this.children.forEach( teardown );
	};

	return LinkModel;
}(ModelBase));

ModelBase.prototype.link = function link ( model, keypath, options ) {
	var lnk = this._link || new LinkModel( this.parent, this, model, this.key );
	lnk.implicit = options && options.implicit;
	lnk.mapping = options && options.mapping;
	lnk.sourcePath = keypath;
	lnk.rootLink = true;
	if ( this._link ) { this._link.relinking( model, false ); }
	this.rebind( lnk, this, false );
	fireShuffleTasks();

	this._link = lnk;
	lnk.markedAll();

	this.notifyUpstream();
	return lnk;
};

ModelBase.prototype.unlink = function unlink () {
	if ( this._link ) {
		var ln = this._link;
		this._link = undefined;
		ln.rebind( this, ln, false );
		fireShuffleTasks();
		ln.teardown();
		this.notifyUpstream();
	}
};

// TODO what happens if a transition is aborted?

var tickers = [];
var running = false;

function tick () {
	runloop.start();

	var now = performance.now();

	var i;
	var ticker;

	for ( i = 0; i < tickers.length; i += 1 ) {
		ticker = tickers[i];

		if ( !ticker.tick( now ) ) {
			// ticker is complete, remove it from the stack, and decrement i so we don't miss one
			tickers.splice( i--, 1 );
		}
	}

	runloop.end();

	if ( tickers.length ) {
		requestAnimationFrame( tick );
	} else {
		running = false;
	}
}

var Ticker = function Ticker ( options ) {
	this.duration = options.duration;
	this.step = options.step;
	this.complete = options.complete;
	this.easing = options.easing;

	this.start = performance.now();
	this.end = this.start + this.duration;

	this.running = true;

	tickers.push( this );
	if ( !running ) { requestAnimationFrame( tick ); }
};

Ticker.prototype.tick = function tick ( now ) {
	if ( !this.running ) { return false; }

	if ( now > this.end ) {
		if ( this.step ) { this.step( 1 ); }
		if ( this.complete ) { this.complete( 1 ); }

		return false;
	}

	var elapsed = now - this.start;
	var eased = this.easing( elapsed / this.duration );

	if ( this.step ) { this.step( eased ); }

	return true;
};

Ticker.prototype.stop = function stop () {
	if ( this.abort ) { this.abort(); }
	this.running = false;
};

var prefixers = {};

// TODO this is legacy. sooner we can replace the old adaptor API the better
function prefixKeypath ( obj, prefix ) {
	var prefixed = {};

	if ( !prefix ) {
		return obj;
	}

	prefix += '.';

	for ( var key in obj ) {
		if ( obj.hasOwnProperty( key ) ) {
			prefixed[ prefix + key ] = obj[ key ];
		}
	}

	return prefixed;
}

function getPrefixer ( rootKeypath ) {
	var rootDot;

	if ( !prefixers[ rootKeypath ] ) {
		rootDot = rootKeypath ? rootKeypath + '.' : '';

		prefixers[ rootKeypath ] = function ( relativeKeypath, value ) {
			var obj;

			if ( typeof relativeKeypath === 'string' ) {
				obj = {};
				obj[ rootDot + relativeKeypath ] = value;
				return obj;
			}

			if ( typeof relativeKeypath === 'object' ) {
				// 'relativeKeypath' is in fact a hash, not a keypath
				return rootDot ? prefixKeypath( relativeKeypath, rootKeypath ) : relativeKeypath;
			}
		};
	}

	return prefixers[ rootKeypath ];
}

var Model = (function (ModelBase$$1) {
	function Model ( parent, key ) {
		ModelBase$$1.call( this, parent );

		this.ticker = null;

		if ( parent ) {
			this.key = unescapeKey( key );
			this.isReadonly = parent.isReadonly;

			if ( parent.value ) {
				this.value = parent.value[ this.key ];
				if ( Array.isArray( this.value ) ) { this.length = this.value.length; }
				this.adapt();
			}
		}
	}

	if ( ModelBase$$1 ) Model.__proto__ = ModelBase$$1;
	Model.prototype = Object.create( ModelBase$$1 && ModelBase$$1.prototype );
	Model.prototype.constructor = Model;

	Model.prototype.adapt = function adapt () {
		var this$1 = this;

		var adaptors = this.root.adaptors;
		var len = adaptors.length;

		this.rewrap = false;

		// Exit early if no adaptors
		if ( len === 0 ) { return; }

		var value = this.wrapper ? ( 'newWrapperValue' in this ? this.newWrapperValue : this.wrapperValue ) : this.value;

		// TODO remove this legacy nonsense
		var ractive = this.root.ractive;
		var keypath = this.getKeypath();

		// tear previous adaptor down if present
		if ( this.wrapper ) {
			var shouldTeardown = this.wrapperValue === value ? false : !this.wrapper.reset || this.wrapper.reset( value ) === false;

			if ( shouldTeardown ) {
				this.wrapper.teardown();
				this.wrapper = null;

				// don't branch for undefined values
				if ( this.value !== undefined ) {
					var parentValue = this.parent.value || this.parent.createBranch( this.key );
					if ( parentValue[ this.key ] !== value ) { parentValue[ this.key ] = value; }
				}
			} else {
				delete this.newWrapperValue;
				this.wrapperValue = value;
				this.value = this.wrapper.get();
				return;
			}
		}

		var i;

		for ( i = 0; i < len; i += 1 ) {
			var adaptor = adaptors[i];
			if ( adaptor.filter( value, keypath, ractive ) ) {
				this$1.wrapper = adaptor.wrap( ractive, value, keypath, getPrefixer( keypath ) );
				this$1.wrapperValue = value;
				this$1.wrapper.__model = this$1; // massive temporary hack to enable array adaptor

				this$1.value = this$1.wrapper.get();

				break;
			}
		}
	};

	Model.prototype.animate = function animate ( from, to, options, interpolator ) {
		var this$1 = this;

		if ( this.ticker ) { this.ticker.stop(); }

		var fulfilPromise;
		var promise = new Promise( function (fulfil) { return fulfilPromise = fulfil; } );

		this.ticker = new Ticker({
			duration: options.duration,
			easing: options.easing,
			step: function (t) {
				var value = interpolator( t );
				this$1.applyValue( value );
				if ( options.step ) { options.step( t, value ); }
			},
			complete: function () {
				this$1.applyValue( to );
				if ( options.complete ) { options.complete( to ); }

				this$1.ticker = null;
				fulfilPromise( to );
			}
		});

		promise.stop = this.ticker.stop;
		return promise;
	};

	Model.prototype.applyValue = function applyValue ( value, notify ) {
		if ( notify === void 0 ) notify = true;

		if ( isEqual( value, this.value ) ) { return; }
		if ( this.boundValue ) { this.boundValue = null; }

		if ( this.parent.wrapper && this.parent.wrapper.set ) {
			this.parent.wrapper.set( this.key, value );
			this.parent.value = this.parent.wrapper.get();

			this.value = this.parent.value[ this.key ];
			if ( this.wrapper ) { this.newWrapperValue = this.value; }
			this.adapt();
		} else if ( this.wrapper ) {
			this.newWrapperValue = value;
			this.adapt();
		} else {
			var parentValue = this.parent.value || this.parent.createBranch( this.key );
			if ( isObjectLike( parentValue ) ) {
				parentValue[ this.key ] = value;
			} else {
				warnIfDebug( ("Attempted to set a property of a non-object '" + (this.getKeypath()) + "'") );
				return;
			}

			this.value = value;
			this.adapt();
		}

		// keep track of array stuff
		if ( Array.isArray( value ) ) {
			this.length = value.length;
			this.isArray = true;
		} else {
			this.isArray = false;
		}

		// notify dependants
		this.links.forEach( handleChange );
		this.children.forEach( mark );
		this.deps.forEach( handleChange );

		if ( notify ) { this.notifyUpstream(); }

		if ( this.parent.isArray ) {
			if ( this.key === 'length' ) { this.parent.length = value; }
			else { this.parent.joinKey( 'length' ).mark(); }
		}
	};

	Model.prototype.createBranch = function createBranch ( key ) {
		var branch = isNumeric( key ) ? [] : {};
		this.applyValue( branch, false );

		return branch;
	};

	Model.prototype.get = function get ( shouldCapture, opts ) {
		if ( this._link ) { return this._link.get( shouldCapture, opts ); }
		if ( shouldCapture ) { capture( this ); }
		// if capturing, this value needs to be unwrapped because it's for external use
		if ( opts && opts.virtual ) { return this.getVirtual( false ); }
		return maybeBind( this, ( ( opts && 'unwrap' in opts ) ? opts.unwrap !== false : shouldCapture ) && this.wrapper ? this.wrapperValue : this.value, !opts || opts.shouldBind !== false );
	};

	Model.prototype.getKeypathModel = function getKeypathModel () {
		if ( !this.keypathModel ) { this.keypathModel = new KeypathModel( this ); }
		return this.keypathModel;
	};

	Model.prototype.joinKey = function joinKey ( key, opts ) {
		if ( this._link ) {
			if ( opts && opts.lastLink !== false && ( key === undefined || key === '' ) ) { return this; }
			return this._link.joinKey( key );
		}

		if ( key === undefined || key === '' ) { return this; }


		if ( !this.childByKey.hasOwnProperty( key ) ) {
			var child = new Model( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		if ( this.childByKey[ key ]._link && ( !opts || opts.lastLink !== false ) ) { return this.childByKey[ key ]._link; }
		return this.childByKey[ key ];
	};

	Model.prototype.mark = function mark$1 ( force ) {
		if ( this._link ) { return this._link.mark( force ); }

		var old = this.value;
		var value = this.retrieve();

		if ( force || !isEqual( value, old ) ) {
			this.value = value;
			if ( this.boundValue ) { this.boundValue = null; }

			// make sure the wrapper stays in sync
			if ( old !== value || this.rewrap ) {
				if ( this.wrapper ) { this.newWrapperValue = value; }
				this.adapt();
			}

			// keep track of array stuff
			if ( Array.isArray( value ) ) {
				this.length = value.length;
				this.isArray = true;
			} else {
				this.isArray = false;
			}

			this.children.forEach( force ? markForce : mark );
			this.links.forEach( marked );

			this.deps.forEach( handleChange );
		}
	};

	Model.prototype.merge = function merge ( array, comparator ) {
		var oldArray = this.value;
		var newArray = array;
		if ( oldArray === newArray ) { oldArray = recreateArray( this ); }
		if ( comparator ) {
			oldArray = oldArray.map( comparator );
			newArray = newArray.map( comparator );
		}

		var oldLength = oldArray.length;

		var usedIndices = {};
		var firstUnusedIndex = 0;

		var newIndices = oldArray.map( function (item) {
			var index;
			var start = firstUnusedIndex;

			do {
				index = newArray.indexOf( item, start );

				if ( index === -1 ) {
					return -1;
				}

				start = index + 1;
			} while ( ( usedIndices[ index ] === true ) && start < oldLength );

			// keep track of the first unused index, so we don't search
			// the whole of newArray for each item in oldArray unnecessarily
			if ( index === firstUnusedIndex ) {
				firstUnusedIndex += 1;
			}
			// allow next instance of next "equal" to be found item
			usedIndices[ index ] = true;
			return index;
		});

		this.parent.value[ this.key ] = array;
		this.shuffle( newIndices, true );
	};

	Model.prototype.retrieve = function retrieve () {
		return this.parent.value ? this.parent.value[ this.key ] : undefined;
	};

	Model.prototype.set = function set ( value ) {
		if ( this.ticker ) { this.ticker.stop(); }
		this.applyValue( value );
	};

	Model.prototype.shuffle = function shuffle$1 ( newIndices, unsafe ) {
		shuffle( this, newIndices, false, unsafe );
	};

	Model.prototype.source = function source () { return this; };

	Model.prototype.teardown = function teardown$1 () {
		if ( this._link ) { this._link.teardown(); }
		this.children.forEach( teardown );
		if ( this.wrapper ) { this.wrapper.teardown(); }
		if ( this.keypathModel ) { this.keypathModel.teardown(); }
	};

	return Model;
}(ModelBase));

function recreateArray( model ) {
	var array = [];

	for ( var i = 0; i < model.length; i++ ) {
		array[ i ] = (model.childByKey[i] || {}).value;
	}

	return array;
}

/* global global */
var data = {};

var SharedModel = (function (Model$$1) {
	function SharedModel ( value, name ) {
		Model$$1.call( this, null, ("@" + name) );
		this.key = "@" + name;
		this.value = value;
		this.isRoot = true;
		this.root = this;
		this.adaptors = [];
	}

	if ( Model$$1 ) SharedModel.__proto__ = Model$$1;
	SharedModel.prototype = Object.create( Model$$1 && Model$$1.prototype );
	SharedModel.prototype.constructor = SharedModel;

	SharedModel.prototype.getKeypath = function getKeypath () {
		return this.key;
	};

	return SharedModel;
}(Model));

var SharedModel$1 = new SharedModel( data, 'shared' );

var GlobalModel = new SharedModel( typeof global !== 'undefined' ? global : window, 'global' );

function resolveReference ( fragment, ref ) {
	var initialFragment = fragment;
	// current context ref
	if ( ref === '.' ) { return fragment.findContext(); }

	// ancestor references
	if ( ref[0] === '~' ) { return fragment.ractive.viewmodel.joinAll( splitKeypath( ref.slice( 2 ) ) ); }

	// scoped references
	if ( ref[0] === '.' || ref[0] === '^' ) {
		var frag = fragment;
		var parts = ref.split( '/' );
		var explicitContext = parts[0] === '^^';
		var context$1 = explicitContext ? null : fragment.findContext();

		// account for the first context hop
		if ( explicitContext ) { parts.unshift( '^^' ); }

		// walk up the context chain
		while ( parts[0] === '^^' ) {
			parts.shift();
			context$1 = null;
			while ( frag && !context$1 ) {
				context$1 = frag.context;
				frag = frag.parent.component ? frag.parent.component.parentFragment : frag.parent;
			}
		}

		if ( !context$1 && explicitContext ) {
			throw new Error( ("Invalid context parent reference ('" + ref + "'). There is not context at that level.") );
		}

		// walk up the context path
		while ( parts[0] === '.' || parts[0] === '..' ) {
			var part = parts.shift();

			if ( part === '..' ) {
				context$1 = context$1.parent;
			}
		}

		ref = parts.join( '/' );

		// special case - `{{.foo}}` means the same as `{{./foo}}`
		if ( ref[0] === '.' ) { ref = ref.slice( 1 ); }
		return context$1.joinAll( splitKeypath( ref ) );
	}

	var keys = splitKeypath( ref );
	if ( !keys.length ) { return; }
	var base = keys.shift();

	// special refs
	if ( base[0] === '@' ) {
		// shorthand from outside the template
		// @this referring to local ractive instance
		if ( base === '@this' || base === '@' ) {
			return fragment.ractive.viewmodel.getRactiveModel().joinAll( keys );
		}

		// @index or @key referring to the nearest repeating index or key
		else if ( base === '@index' || base === '@key' ) {
			if ( keys.length ) { badReference( base ); }
			var repeater = fragment.findRepeatingFragment();
			// make sure the found fragment is actually an iteration
			if ( !repeater.isIteration ) { return; }
			return repeater.context && repeater.context.getKeyModel( repeater[ ref[1] === 'i' ? 'index' : 'key' ] );
		}

		// @global referring to window or global
		else if ( base === '@global' ) {
			return GlobalModel.joinAll( keys );
		}

		// @global referring to window or global
		else if ( base === '@shared' ) {
			return SharedModel$1.joinAll( keys );
		}

		// @keypath or @rootpath, the current keypath string
		else if ( base === '@keypath' || base === '@rootpath' ) {
			var root = ref[1] === 'r' ? fragment.ractive.root : null;
			var context$2 = fragment.findContext();

			// skip over component roots, which provide no context
			while ( root && context$2.isRoot && context$2.ractive.component ) {
				context$2 = context$2.ractive.component.parentFragment.findContext();
			}

			return context$2.getKeypathModel( root );
		}

		else if ( base === '@context' ) {
			return new ContextModel( fragment.getContext() );
		}

		// @context-local data
		else if ( base === '@local' ) {
			return fragment.getContext()._data.joinAll( keys );
		}

		// nope
		else {
			throw new Error( ("Invalid special reference '" + base + "'") );
		}
	}

	var context = fragment.findContext();

	// check immediate context for a match
	if ( context.has( base ) ) {
		return context.joinKey( base ).joinAll( keys );
	}

	// walk up the fragment hierarchy looking for a matching ref, alias, or key in a context
	var createMapping = false;
	var shouldWarn = fragment.ractive.warnAboutAmbiguity;

	while ( fragment ) {
		// repeated fragments
		if ( fragment.isIteration ) {
			if ( base === fragment.parent.keyRef ) {
				if ( keys.length ) { badReference( base ); }
				return fragment.context.getKeyModel( fragment.key );
			}

			if ( base === fragment.parent.indexRef ) {
				if ( keys.length ) { badReference( base ); }
				return fragment.context.getKeyModel( fragment.index );
			}
		}

		// alias node or iteration
		if ( fragment.aliases  && fragment.aliases.hasOwnProperty( base ) ) {
			var model = fragment.aliases[ base ];

			if ( keys.length === 0 ) { return model; }
			else if ( typeof model.joinAll === 'function' ) {
				return model.joinAll( keys );
			}
		}

		// check fragment context to see if it has the key we need
		if ( fragment.context && fragment.context.has( base ) ) {
			// this is an implicit mapping
			if ( createMapping ) {
				if ( shouldWarn ) { warnIfDebug( ("'" + ref + "' resolved but is ambiguous and will create a mapping to a parent component.") ); }
				return context.root.createLink( base, fragment.context.joinKey( base ), base, { implicit: true }).joinAll( keys );
			}

			if ( shouldWarn ) { warnIfDebug( ("'" + ref + "' resolved but is ambiguous.") ); }
			return fragment.context.joinKey( base ).joinAll( keys );
		}

		if ( ( fragment.componentParent || ( !fragment.parent && fragment.ractive.component ) ) && !fragment.ractive.isolated ) {
			// ascend through component boundary
			fragment = fragment.componentParent || fragment.ractive.component.parentFragment;
			createMapping = true;
		} else {
			fragment = fragment.parent;
		}
	}

	// if enabled, check the instance for a match
	var instance = initialFragment.ractive;
	if ( instance.resolveInstanceMembers && base !== 'data' && base in instance ) {
		return instance.viewmodel.getRactiveModel().joinKey( base ).joinAll( keys );
	}

	if ( shouldWarn ) {
		warnIfDebug( ("'" + ref + "' is ambiguous and did not resolve.") );
	}

	// didn't find anything, so go ahead and create the key on the local model
	return context.joinKey( base ).joinAll( keys );
}

function badReference ( key ) {
	throw new Error( ("An index or key reference (" + key + ") cannot have child properties") );
}

var ContextModel = function ContextModel ( context ) {
	this.context = context;
};

ContextModel.prototype.get = function get () { return this.context; };

var extern = {};

function getRactiveContext ( ractive ) {
	var assigns = [], len = arguments.length - 1;
	while ( len-- > 0 ) assigns[ len ] = arguments[ len + 1 ];

	var fragment = ractive.fragment || ractive._fakeFragment || ( ractive._fakeFragment = new FakeFragment( ractive ) );
	return fragment.getContext.apply( fragment, assigns );
}

function getContext () {
	var assigns = [], len = arguments.length;
	while ( len-- ) assigns[ len ] = arguments[ len ];

	if ( !this.ctx ) { this.ctx = new extern.Context( this ); }
	assigns.unshift( Object.create( this.ctx ) );
	return Object.assign.apply( null, assigns );
}

var FakeFragment = function FakeFragment ( ractive ) {
	this.ractive = ractive;
};

FakeFragment.prototype.findContext = function findContext () { return this.ractive.viewmodel; };
var proto$1 = FakeFragment.prototype;
proto$1.getContext = getContext;
proto$1.find = proto$1.findComponent = proto$1.findAll = proto$1.findAllComponents = noop;

var keep = false;

function set ( ractive, pairs, options ) {
	var k = keep;

	var deep = options && options.deep;
	var shuffle = options && options.shuffle;
	var promise = runloop.start( ractive, true );
	if ( options && 'keep' in options ) { keep = options.keep; }

	var i = pairs.length;
	while ( i-- ) {
		var model = pairs[i][0];
		var value = pairs[i][1];
		var keypath = pairs[i][2];

		if ( !model ) {
			runloop.end();
			throw new Error( ("Failed to set invalid keypath '" + keypath + "'") );
		}

		if ( deep ) { deepSet( model, value ); }
		else if ( shuffle ) {
			var array = value;
			var target = model.get();
			// shuffle target array with itself
			if ( !array ) { array = target; }

			// if there's not an array there yet, go ahead and set
			if ( target === undefined ) {
				model.set( array );
			} else {
				if ( !Array.isArray( target ) || !Array.isArray( array ) ) {
					runloop.end();
					throw new Error( 'You cannot merge an array with a non-array' );
				}

				var comparator = getComparator( shuffle );
				model.merge( array, comparator );
			}
		} else { model.set( value ); }
	}

	runloop.end();

	keep = k;

	return promise;
}

var star = /\*/;
function gather ( ractive, keypath, base, isolated ) {
	if ( !base && ( keypath[0] === '.' || keypath[1] === '^' ) ) {
		warnIfDebug( "Attempted to set a relative keypath from a non-relative context. You can use a context object to set relative keypaths." );
		return [];
	}

	var keys = splitKeypath( keypath );
	var model = base || ractive.viewmodel;

	if ( star.test( keypath ) ) {
		return model.findMatches( keys );
	} else {
		if ( model === ractive.viewmodel ) {
			// allow implicit mappings
			if ( ractive.component && !ractive.isolated && !model.has( keys[0] ) && keypath[0] !== '@' && keypath[0] && !isolated ) {
				return [ resolveReference( ractive.fragment || new FakeFragment( ractive ), keypath ) ];
			} else {
				return [ model.joinAll( keys ) ];
			}
		} else {
			return [ model.joinAll( keys ) ];
		}
	}
}

function build ( ractive, keypath, value, isolated ) {
	var sets = [];

	// set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		var loop = function ( k ) {
			if ( keypath.hasOwnProperty( k ) ) {
				sets.push.apply( sets, gather( ractive, k, null, isolated ).map( function (m) { return [ m, keypath[k], k ]; } ) );
			}
		};

		for ( var k in keypath ) loop( k );

	}
	// set a single keypath
	else {
		sets.push.apply( sets, gather( ractive, keypath, null, isolated ).map( function (m) { return [ m, value, keypath ]; } ) );
	}

	return sets;
}

var deepOpts = { virtual: false };
function deepSet( model, value ) {
	var dest = model.get( false, deepOpts );

	// if dest doesn't exist, just set it
	if ( dest == null || typeof value !== 'object' ) { return model.set( value ); }
	if ( typeof dest !== 'object' ) { return model.set( value ); }

	for ( var k in value ) {
		if ( value.hasOwnProperty( k ) ) {
			deepSet( model.joinKey( k ), value[k] );
		}
	}
}

var comparators = {};
function getComparator ( option ) {
	if ( option === true ) { return null; } // use existing arrays
	if ( typeof option === 'function' ) { return option; }

	if ( typeof option === 'string' ) {
		return comparators[ option ] || ( comparators[ option ] = function (thing) { return thing[ option ]; } );
	}

	throw new Error( 'If supplied, options.compare must be a string, function, or true' ); // TODO link to docs
}

var errorMessage = 'Cannot add to a non-numeric value';

function add ( ractive, keypath, d, options ) {
	if ( typeof keypath !== 'string' || !isNumeric( d ) ) {
		throw new Error( 'Bad arguments' );
	}

	var sets = build( ractive, keypath, d, options && options.isolated );

	return set( ractive, sets.map( function (pair) {
		var model = pair[0];
		var add = pair[1];
		var value = model.get();
		if ( !isNumeric( add ) || !isNumeric( value ) ) { throw new Error( errorMessage ); }
		return [ model, value + add ];
	}));
}

function Ractive$add ( keypath, d, options ) {
	var num = typeof d === 'number' ? d : 1;
	var opts = typeof d === 'object' ? d : options;
	return add( this, keypath, num, opts );
}

function immediate ( value ) {
	var promise = Promise.resolve( value );
	Object.defineProperty( promise, 'stop', { value: noop });
	return promise;
}

var linear = easing.linear;

function getOptions ( options, instance ) {
	options = options || {};

	var easing$$1;
	if ( options.easing ) {
		easing$$1 = typeof options.easing === 'function' ?
			options.easing :
			instance.easing[ options.easing ];
	}

	return {
		easing: easing$$1 || linear,
		duration: 'duration' in options ? options.duration : 400,
		complete: options.complete || noop,
		step: options.step || noop,
		interpolator: options.interpolator
	};
}

function animate ( ractive, model, to, options ) {
	options = getOptions( options, ractive );
	var from = model.get();

	// don't bother animating values that stay the same
	if ( isEqual( from, to ) ) {
		options.complete( options.to );
		return immediate( to );
	}

	var interpolator = interpolate( from, to, ractive, options.interpolator );

	// if we can't interpolate the value, set it immediately
	if ( !interpolator ) {
		runloop.start();
		model.set( to );
		runloop.end();

		return immediate( to );
	}

	return model.animate( from, to, options, interpolator );
}

function Ractive$animate ( keypath, to, options ) {
	if ( typeof keypath === 'object' ) {
		var keys = Object.keys( keypath );

		throw new Error( ("ractive.animate(...) no longer supports objects. Instead of ractive.animate({\n  " + (keys.map( function (key) { return ("'" + key + "': " + (keypath[ key ])); } ).join( '\n  ' )) + "\n}, {...}), do\n\n" + (keys.map( function (key) { return ("ractive.animate('" + key + "', " + (keypath[ key ]) + ", {...});"); } ).join( '\n' )) + "\n") );
	}

	return animate( this, this.viewmodel.joinAll( splitKeypath( keypath ) ), to, options );
}

function enqueue ( ractive, event ) {
	if ( ractive.event ) {
		ractive._eventQueue.push( ractive.event );
	}

	ractive.event = event;
}

function dequeue ( ractive ) {
	if ( ractive._eventQueue.length ) {
		ractive.event = ractive._eventQueue.pop();
	} else {
		ractive.event = null;
	}
}

var initStars = {};
var bubbleStars = {};

// cartesian product of name parts and stars
// adjusted appropriately for special cases
function variants ( name, initial ) {
	var map = initial ? initStars : bubbleStars;
	if ( map[ name ] ) { return map[ name ]; }

	var parts = name.split( '.' );
	var result = [];
	var base = false;

	// initial events the implicit namespace of 'this'
	if ( initial ) {
		parts.unshift( 'this' );
		base = true;
	}

	// use max - 1 bits as a bitmap to pick a part or a *
	// need to skip the full star case if the namespace is synthetic
	var max = Math.pow( 2, parts.length ) - ( initial ? 1 : 0 );
	for ( var i = 0; i < max; i++ ) {
		var join = [];
		for ( var j = 0; j < parts.length; j++ ) {
			join.push( 1 & ( i >> j ) ? '*' : parts[j] );
		}
		result.unshift( join.join( '.' ) );
	}

	if ( base ) {
		// include non-this-namespaced versions
		if ( parts.length > 2 ) {
			result.push.apply( result, variants( name, false ) );
		} else {
			result.push( '*' );
			result.push( name );
		}
	}

	map[ name ] = result;
	return result;
}

function fireEvent ( ractive, eventName, context, args ) {
	if ( args === void 0 ) args = [];

	if ( !eventName ) { return; }

	context.name = eventName;
	args.unshift( context );

	var eventNames = ractive._nsSubs ? variants( eventName, true ) : [ '*', eventName ];

	return fireEventAs( ractive, eventNames, context, args, true );
}

function fireEventAs  ( ractive, eventNames, context, args, initialFire ) {
	if ( initialFire === void 0 ) initialFire = false;

	var bubble = true;

	if ( initialFire || ractive._nsSubs ) {
		enqueue( ractive, context );

		var i = eventNames.length;
		while ( i-- ) {
			if ( eventNames[ i ] in ractive._subs ) {
				bubble = notifySubscribers( ractive, ractive._subs[ eventNames[ i ] ], context, args ) && bubble;
			}
		}

		dequeue( ractive );
	}

	if ( ractive.parent && bubble ) {
		if ( initialFire && ractive.component ) {
			var fullName = ractive.component.name + '.' + eventNames[ eventNames.length - 1 ];
			eventNames = variants( fullName, false );

			if ( context && !context.component ) {
				context.component = ractive;
			}
		}

		bubble = fireEventAs( ractive.parent, eventNames, context, args );
	}

	return bubble;
}

function notifySubscribers ( ractive, subscribers, context, args ) {
	var originalEvent = null;
	var stopEvent = false;

	// subscribers can be modified inflight, e.g. "once" functionality
	// so we need to copy to make sure everyone gets called
	subscribers = subscribers.slice();

	for ( var i = 0, len = subscribers.length; i < len; i += 1 ) {
		if ( !subscribers[ i ].off && subscribers[ i ].handler.apply( ractive, args ) === false ) {
			stopEvent = true;
		}
	}

	if ( context && stopEvent && ( originalEvent = context.event ) ) {
		originalEvent.preventDefault && originalEvent.preventDefault();
		originalEvent.stopPropagation && originalEvent.stopPropagation();
	}

	return !stopEvent;
}

var Hook = function Hook ( event ) {
	this.event = event;
	this.method = 'on' + event;
};

Hook.prototype.fire = function fire ( ractive, arg ) {
	var context = getRactiveContext( ractive );

	if ( ractive[ this.method ] ) {
		arg ? ractive[ this.method ]( context, arg ) : ractive[ this.method ]( context );
	}

	fireEvent( ractive, this.event, context, arg ? [ arg, ractive ] : [ ractive ] );
};

function findAnchors ( fragment, name ) {
	if ( name === void 0 ) name = null;

	var res = [];

	findAnchorsIn( fragment, name, res );

	return res;
}

function findAnchorsIn ( item, name, result ) {
	if ( item.isAnchor ) {
		if ( !name || item.name === name ) {
			result.push( item );
		}
	} else if ( item.items ) {
		item.items.forEach( function (i) { return findAnchorsIn( i, name, result ); } );
	} else if ( item.iterations ) {
		item.iterations.forEach( function (i) { return findAnchorsIn( i, name, result ); } );
	} else if ( item.fragment && !item.component ) {
		findAnchorsIn( item.fragment, name, result );
	}
}

function updateAnchors ( instance, name ) {
	if ( name === void 0 ) name = null;

	var anchors = findAnchors( instance.fragment, name );
	var idxs = {};
	var children = instance._children.byName;

	anchors.forEach( function (a) {
		var name = a.name;
		if ( !( name in idxs ) ) { idxs[name] = 0; }
		var idx = idxs[name];
		var child = ( children[name] || [] )[idx];

		if ( child && child.lastBound !== a ) {
			if ( child.lastBound ) { child.lastBound.removeChild( child ); }
			a.addChild( child );
		}

		idxs[name]++;
	});
}

function unrenderChild ( meta ) {
	if ( meta.instance.fragment.rendered ) {
		meta.shouldDestroy = true;
		meta.instance.unrender();
	}
	meta.instance.el = null;
}

var attachHook = new Hook( 'attachchild' );

function attachChild ( child, options ) {
	if ( options === void 0 ) options = {};

	var children = this._children;

	if ( child.parent && child.parent !== this ) { throw new Error( ("Instance " + (child._guid) + " is already attached to a different instance " + (child.parent._guid) + ". Please detach it from the other instance using detachChild first.") ); }
	else if ( child.parent ) { throw new Error( ("Instance " + (child._guid) + " is already attached to this instance.") ); }

	var meta = {
		instance: child,
		ractive: this,
		name: options.name || child.constructor.name || 'Ractive',
		target: options.target || false,
		bubble: bubble,
		findNextNode: findNextNode
	};
	meta.nameOption = options.name;

	// child is managing itself
	if ( !meta.target ) {
		meta.parentFragment = this.fragment;
		meta.external = true;
	} else {
		var list;
		if ( !( list = children.byName[ meta.target ] ) ) {
			list = [];
			this.set( ("@this.children.byName." + (meta.target)), list );
		}
		var idx = options.prepend ? 0 : options.insertAt !== undefined ? options.insertAt : list.length;
		list.splice( idx, 0, meta );
	}

	child.set({
		'@this.parent': this,
		'@this.root': this.root
	});
	child.component = meta;
	children.push( meta );

	attachHook.fire( child );

	var promise = runloop.start( child, true );

	if ( meta.target ) {
		unrenderChild( meta );
		this.set( ("@this.children.byName." + (meta.target)), null, { shuffle: true } );
		updateAnchors( this, meta.target );
	} else {
		if ( !child.isolated ) { child.viewmodel.attached( this.fragment ); }
	}

	runloop.end();

	promise.ractive = child;
	return promise.then( function () { return child; } );
}

function bubble () { runloop.addFragment( this.instance.fragment ); }

function findNextNode () {
	if ( this.anchor ) { return this.anchor.findNextNode(); }
}

var detachHook = new Hook( 'detach' );

function Ractive$detach () {
	if ( this.isDetached ) {
		return this.el;
	}

	if ( this.el ) {
		removeFromArray( this.el.__ractive_instances__, this );
	}

	this.el = this.fragment.detach();
	this.isDetached = true;

	detachHook.fire( this );
	return this.el;
}

var detachHook$1 = new Hook( 'detachchild' );

function detachChild ( child ) {
	var children = this._children;
	var meta, index;

	var i = children.length;
	while ( i-- ) {
		if ( children[i].instance === child ) {
			index = i;
			meta = children[i];
			break;
		}
	}

	if ( !meta || child.parent !== this ) { throw new Error( ("Instance " + (child._guid) + " is not attached to this instance.") ); }

	var promise = runloop.start( child, true );

	if ( meta.anchor ) { meta.anchor.removeChild( meta ); }
	if ( !child.isolated ) { child.viewmodel.detached(); }

	runloop.end();

	children.splice( index, 1 );
	if ( meta.target ) {
		var list = children.byName[ meta.target ];
		list.splice( list.indexOf( meta ), 1 );
		this.set( ("@this.children.byName." + (meta.target)), null, { shuffle: true } );
		updateAnchors( this, meta.target );
	}
	child.set({
		'@this.parent': undefined,
		'@this.root': child
	});
	child.component = null;

	detachHook$1.fire( child );

	promise.ractive = child;
	return promise.then( function () { return child; } );
}

function Ractive$find ( selector, options ) {
	var this$1 = this;
	if ( options === void 0 ) options = {};

	if ( !this.el ) { throw new Error( ("Cannot call ractive.find('" + selector + "') unless instance is rendered to the DOM") ); }

	var node = this.fragment.find( selector, options );
	if ( node ) { return node; }

	if ( options.remote ) {
		for ( var i = 0; i < this._children.length; i++ ) {
			if ( !this$1._children[i].instance.fragment.rendered ) { continue; }
			node = this$1._children[i].instance.find( selector, options );
			if ( node ) { return node; }
		}
	}
}

function Ractive$findAll ( selector, options ) {
	if ( options === void 0 ) options = {};

	if ( !this.el ) { throw new Error( ("Cannot call ractive.findAll('" + selector + "', ...) unless instance is rendered to the DOM") ); }

	if ( !Array.isArray( options.result ) ) { options.result = []; }

	this.fragment.findAll( selector, options );

	if ( options.remote ) {
		// seach non-fragment children
		this._children.forEach( function (c) {
			if ( !c.target && c.instance.fragment && c.instance.fragment.rendered ) {
				c.instance.findAll( selector, options );
			}
		});
	}

	return options.result;
}

function Ractive$findAllComponents ( selector, options ) {
	if ( !options && typeof selector === 'object' ) {
		options = selector;
		selector = '';
	}

	options = options || {};

	if ( !Array.isArray( options.result ) ) { options.result = []; }

	this.fragment.findAllComponents( selector, options );

	if ( options.remote ) {
		// search non-fragment children
		this._children.forEach( function (c) {
			if ( !c.target && c.instance.fragment && c.instance.fragment.rendered ) {
				if ( !selector || c.name === selector ) {
					options.result.push( c.instance );
				}

				c.instance.findAllComponents( selector, options );
			}
		});
	}

	return options.result;
}

function Ractive$findComponent ( selector, options ) {
	var this$1 = this;
	if ( options === void 0 ) options = {};

	if ( typeof selector === 'object' ) {
		options = selector;
		selector = '';
	}

	var child = this.fragment.findComponent( selector, options );
	if ( child ) { return child; }

	if ( options.remote ) {
		if ( !selector && this._children.length ) { return this._children[0].instance; }
		for ( var i = 0; i < this._children.length; i++ ) {
			// skip children that are or should be in an anchor
			if ( this$1._children[i].target ) { continue; }
			if ( this$1._children[i].name === selector ) { return this$1._children[i].instance; }
			child = this$1._children[i].instance.findComponent( selector, options );
			if ( child ) { return child; }
		}
	}
}

function Ractive$findContainer ( selector ) {
	if ( this.container ) {
		if ( this.container.component && this.container.component.name === selector ) {
			return this.container;
		} else {
			return this.container.findContainer( selector );
		}
	}

	return null;
}

function Ractive$findParent ( selector ) {

	if ( this.parent ) {
		if ( this.parent.component && this.parent.component.name === selector ) {
			return this.parent;
		} else {
			return this.parent.findParent ( selector );
		}
	}

	return null;
}

// This function takes an array, the name of a mutator method, and the
// arguments to call that mutator method with, and returns an array that
// maps the old indices to their new indices.

// So if you had something like this...
//
//     array = [ 'a', 'b', 'c', 'd' ];
//     array.push( 'e' );
//
// ...you'd get `[ 0, 1, 2, 3 ]` - in other words, none of the old indices
// have changed. If you then did this...
//
//     array.unshift( 'z' );
//
// ...the indices would be `[ 1, 2, 3, 4, 5 ]` - every item has been moved
// one higher to make room for the 'z'. If you removed an item, the new index
// would be -1...
//
//     array.splice( 2, 2 );
//
// ...this would result in [ 0, 1, -1, -1, 2, 3 ].
//
// This information is used to enable fast, non-destructive shuffling of list
// sections when you do e.g. `ractive.splice( 'items', 2, 2 );

function getNewIndices ( length, methodName, args ) {
	var newIndices = [];

	var spliceArguments = getSpliceEquivalent( length, methodName, args );

	if ( !spliceArguments ) {
		return null; // TODO support reverse and sort?
	}

	var balance = ( spliceArguments.length - 2 ) - spliceArguments[1];

	var removeStart = Math.min( length, spliceArguments[0] );
	var removeEnd = removeStart + spliceArguments[1];
	newIndices.startIndex = removeStart;

	var i;
	for ( i = 0; i < removeStart; i += 1 ) {
		newIndices.push( i );
	}

	for ( ; i < removeEnd; i += 1 ) {
		newIndices.push( -1 );
	}

	for ( ; i < length; i += 1 ) {
		newIndices.push( i + balance );
	}

	// there is a net shift for the rest of the array starting with index + balance
	if ( balance !== 0 ) {
		newIndices.touchedFrom = spliceArguments[0];
	} else {
		newIndices.touchedFrom = length;
	}

	return newIndices;
}


// The pop, push, shift an unshift methods can all be represented
// as an equivalent splice
function getSpliceEquivalent ( length, methodName, args ) {
	switch ( methodName ) {
		case 'splice':
			if ( args[0] !== undefined && args[0] < 0 ) {
				args[0] = length + Math.max( args[0], -length );
			}

			if ( args[0] === undefined ) { args[0] = 0; }

			while ( args.length < 2 ) {
				args.push( length - args[0] );
			}

			if ( typeof args[1] !== 'number' ) {
				args[1] = length - args[0];
			}

			// ensure we only remove elements that exist
			args[1] = Math.min( args[1], length - args[0] );

			return args;

		case 'sort':
		case 'reverse':
			return null;

		case 'pop':
			if ( length ) {
				return [ length - 1, 1 ];
			}
			return [ 0, 0 ];

		case 'push':
			return [ length, 0 ].concat( args );

		case 'shift':
			return [ 0, length ? 1 : 0 ];

		case 'unshift':
			return [ 0, 0 ].concat( args );
	}
}

var arrayProto = Array.prototype;

var makeArrayMethod = function ( methodName ) {
	function path ( keypath ) {
		var args = [], len = arguments.length - 1;
		while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

		return model( this.viewmodel.joinAll( splitKeypath( keypath ) ), args );
	}

	function model ( mdl, args ) {
		var array = mdl.get();

		if ( !Array.isArray( array ) ) {
			if ( array === undefined ) {
				array = [];
				var result$1 = arrayProto[ methodName ].apply( array, args );
				var promise$1 = runloop.start( this, true ).then( function () { return result$1; } );
				mdl.set( array );
				runloop.end();
				return promise$1;
			} else {
				throw new Error( ("shuffle array method " + methodName + " called on non-array at " + (mdl.getKeypath())) );
			}
		}

		var newIndices = getNewIndices( array.length, methodName, args );
		var result = arrayProto[ methodName ].apply( array, args );

		var promise = runloop.start( this, true ).then( function () { return result; } );
		promise.result = result;

		if ( newIndices ) {
			mdl.shuffle( newIndices );
		} else {
			mdl.set( result );
		}

		runloop.end();

		return promise;
	}

	return { path: path, model: model };
};

var updateHook = new Hook( 'update' );

function update$1 ( ractive, model, options ) {
	// if the parent is wrapped, the adaptor will need to be updated before
	// updating on this keypath
	if ( model.parent && model.parent.wrapper ) {
		model.parent.adapt();
	}

	var promise = runloop.start( ractive, true );

	model.mark( options && options.force );

	// notify upstream of changes
	model.notifyUpstream();

	runloop.end();

	updateHook.fire( ractive, model );

	return promise;
}

function Ractive$update ( keypath, options ) {
	var opts, path;

	if ( typeof keypath === 'string' ) {
		path = splitKeypath( keypath );
		opts = options;
	} else {
		opts = keypath;
	}

	return update$1( this, path ? this.viewmodel.joinAll( path ) : this.viewmodel, opts );
}

var TEXT              = 1;
var INTERPOLATOR      = 2;
var TRIPLE            = 3;
var SECTION           = 4;
var INVERTED          = 5;
var CLOSING           = 6;
var ELEMENT           = 7;
var PARTIAL           = 8;
var COMMENT           = 9;
var DELIMCHANGE       = 10;
var ANCHOR            = 11;
var ATTRIBUTE         = 13;
var CLOSING_TAG       = 14;
var COMPONENT         = 15;
var YIELDER           = 16;
var INLINE_PARTIAL    = 17;
var DOCTYPE           = 18;
var ALIAS             = 19;

var NUMBER_LITERAL    = 20;
var STRING_LITERAL    = 21;
var ARRAY_LITERAL     = 22;
var OBJECT_LITERAL    = 23;
var BOOLEAN_LITERAL   = 24;
var REGEXP_LITERAL    = 25;

var GLOBAL            = 26;
var KEY_VALUE_PAIR    = 27;


var REFERENCE         = 30;
var REFINEMENT        = 31;
var MEMBER            = 32;
var PREFIX_OPERATOR   = 33;
var BRACKETED         = 34;
var CONDITIONAL       = 35;
var INFIX_OPERATOR    = 36;

var INVOCATION        = 40;

var SECTION_IF        = 50;
var SECTION_UNLESS    = 51;
var SECTION_EACH      = 52;
var SECTION_WITH      = 53;
var SECTION_IF_WITH   = 54;

var ELSE              = 60;
var ELSEIF            = 61;

var EVENT             = 70;
var DECORATOR         = 71;
var TRANSITION        = 72;
var BINDING_FLAG      = 73;
var DELEGATE_FLAG     = 74;

function findElement( start, orComponent, name ) {
	if ( orComponent === void 0 ) orComponent = true;

	while ( start && ( start.type !== ELEMENT || ( name && start.name !== name ) ) && ( !orComponent || ( start.type !== COMPONENT && start.type !== ANCHOR ) ) ) {
		// start is a fragment - look at the owner
		if ( start.owner ) { start = start.owner; }
		// start is a component or yielder - look at the container
		else if ( start.component ) { start = start.containerFragment || start.component.parentFragment; }
		// start is an item - look at the parent
		else if ( start.parent ) { start = start.parent; }
		// start is an item without a parent - look at the parent fragment
		else if ( start.parentFragment ) { start = start.parentFragment; }

		else { start = undefined; }
	}

	return start;
}

var modelPush = makeArrayMethod( 'push' ).model;
var modelPop = makeArrayMethod( 'pop' ).model;
var modelShift = makeArrayMethod( 'shift' ).model;
var modelUnshift = makeArrayMethod( 'unshift' ).model;
var modelSort = makeArrayMethod( 'sort' ).model;
var modelSplice = makeArrayMethod( 'splice' ).model;
var modelReverse = makeArrayMethod( 'reverse' ).model;

var ContextData = (function (Model$$1) {
	function ContextData ( options ) {
		Model$$1.call( this, null, null );

		this.isRoot = true;
		this.root = this;
		this.value = {};
		this.ractive = options.ractive;
		this.adaptors = [];
		this.context = options.context;
	}

	if ( Model$$1 ) ContextData.__proto__ = Model$$1;
	ContextData.prototype = Object.create( Model$$1 && Model$$1.prototype );
	ContextData.prototype.constructor = ContextData;

	ContextData.prototype.getKeypath = function getKeypath () {
		return '@context.data';
	};

	return ContextData;
}(Model));

var Context = function Context ( fragment, element ) {
	this.fragment = fragment;
	this.element = element || findElement( fragment );
	this.node = this.element && this.element.node;
	this.ractive = fragment.ractive;
	this.root = this;
};

var prototypeAccessors = { decorators: {},_data: {} };

prototypeAccessors.decorators.get = function () {
	var items = {};
	if ( !this.element ) { return items; }
	this.element.decorators.forEach( function (d) { return items[ d.name ] = d.intermediary; } );
	return items;
};

prototypeAccessors._data.get = function () {
	return this.model || ( this.root.model = new ContextData({ ractive: this.ractive, context: this.root }) );
};

// the usual mutation suspects
Context.prototype.add = function add ( keypath, d, options ) {
	var num = typeof d === 'number' ? +d : 1;
	var opts = typeof d === 'object' ? d : options;
	return set( this.ractive, build$1( this, keypath, num ).map( function (pair) {
		var model = pair[0];
			var val = pair[1];
		var value = model.get();
		if ( !isNumeric( val ) || !isNumeric( value ) ) { throw new Error( 'Cannot add non-numeric value' ); }
		return [ model, value + val ];
	}), opts );
};

Context.prototype.animate = function animate$$1 ( keypath, value, options ) {
	var model = findModel( this, keypath ).model;
	return animate( this.ractive, model, value, options );
};

// get relative keypaths and values
Context.prototype.get = function get ( keypath ) {
	if ( !keypath ) { return this.fragment.findContext().get( true ); }

	var ref = findModel( this, keypath );
		var model = ref.model;

	return model ? model.get( true ) : undefined;
};

Context.prototype.link = function link ( source, dest ) {
	var there = findModel( this, source ).model;
	var here = findModel( this, dest ).model;
	var promise = runloop.start( this.ractive, true );
	here.link( there, source );
	runloop.end();
	return promise;
};

Context.prototype.listen = function listen ( event, handler ) {
	var el = this.element;
	el.on( event, handler );
	return {
		cancel: function cancel () { el.off( event, handler ); }
	};
};

Context.prototype.observe = function observe ( keypath, callback, options ) {
		if ( options === void 0 ) options = {};

	if ( isObject( keypath ) ) { options = callback || {}; }
	options.fragment = this.fragment;
	return this.ractive.observe( keypath, callback, options );
};

Context.prototype.observeOnce = function observeOnce ( keypath, callback, options ) {
		if ( options === void 0 ) options = {};

	if ( isObject( keypath ) ) { options = callback || {}; }
	options.fragment = this.fragment;
	return this.ractive.observeOnce( keypath, callback, options );
};

Context.prototype.pop = function pop ( keypath ) {
	return modelPop( findModel( this, keypath ).model, [] );
};

Context.prototype.push = function push ( keypath ) {
		var values = [], len = arguments.length - 1;
		while ( len-- > 0 ) values[ len ] = arguments[ len + 1 ];

	return modelPush( findModel( this, keypath ).model, values );
};

Context.prototype.raise = function raise ( name, event ) {
		var args = [], len$1 = arguments.length - 2;
		while ( len$1-- > 0 ) args[ len$1 ] = arguments[ len$1 + 2 ];

	var element = this.element;
	var events, len, i;

	while ( element ) {
		events = element.events;
		len = events && events.length;
		for ( i = 0; i < len; i++ ) {
			var ev = events[i];
			if ( ~ev.template.n.indexOf( name ) ) {
				var ctx = !event || !( 'original' in event ) ?
					ev.element.getContext( event || {}, { original: {} } ) :
					ev.element.getContext( event || {} );
				return ev.fire( ctx, args );
			}
		}

		element = element.parent;
	}
};

Context.prototype.readLink = function readLink ( keypath, options ) {
	return this.ractive.readLink( this.resolve( keypath ), options );
};

Context.prototype.resolve = function resolve ( path, ractive ) {
	var ref = findModel( this, path );
		var model = ref.model;
		var instance = ref.instance;
	return model ? model.getKeypath( ractive || instance ) : path;
};

Context.prototype.reverse = function reverse ( keypath ) {
	return modelReverse( findModel( this, keypath ).model, [] );
};

Context.prototype.set = function set$$1 ( keypath, value, options ) {
	return set( this.ractive, build$1( this, keypath, value ), options );
};

Context.prototype.shift = function shift ( keypath ) {
	return modelShift( findModel( this, keypath ).model, [] );
};

Context.prototype.splice = function splice ( keypath, index, drop ) {
		var add = [], len = arguments.length - 3;
		while ( len-- > 0 ) add[ len ] = arguments[ len + 3 ];

	add.unshift( index, drop );
	return modelSplice( findModel( this, keypath ).model, add );
};

Context.prototype.sort = function sort ( keypath ) {
	return modelSort( findModel( this, keypath ).model, [] );
};

Context.prototype.subtract = function subtract ( keypath, d, options ) {
	var num = typeof d === 'number' ? d : 1;
	var opts = typeof d === 'object' ? d : options;
	return set( this.ractive, build$1( this, keypath, num ).map( function (pair) {
		var model = pair[0];
			var val = pair[1];
		var value = model.get();
		if ( !isNumeric( val ) || !isNumeric( value ) ) { throw new Error( 'Cannot add non-numeric value' ); }
		return [ model, value - val ];
	}), opts );
};

Context.prototype.toggle = function toggle ( keypath, options ) {
	var ref = findModel( this, keypath );
		var model = ref.model;
	return set( this.ractive, [ [ model, !model.get() ] ], options );
};

Context.prototype.unlink = function unlink ( dest ) {
	var here = findModel( this, dest ).model;
	var promise = runloop.start( this.ractive, true );
	if ( here.owner && here.owner._link ) { here.owner.unlink(); }
	runloop.end();
	return promise;
};

Context.prototype.unlisten = function unlisten ( event, handler ) {
	this.element.off( event, handler );
};

Context.prototype.unshift = function unshift ( keypath ) {
		var add = [], len = arguments.length - 1;
		while ( len-- > 0 ) add[ len ] = arguments[ len + 1 ];

	return modelUnshift( findModel( this, keypath ).model, add );
};

Context.prototype.update = function update$$1 ( keypath, options ) {
	return update$1( this.ractive, findModel( this, keypath ).model, options );
};

Context.prototype.updateModel = function updateModel ( keypath, cascade ) {
	var ref = findModel( this, keypath );
		var model = ref.model;
	var promise = runloop.start( this.ractive, true );
	model.updateFromBindings( cascade );
	runloop.end();
	return promise;
};

// two-way binding related helpers
Context.prototype.isBound = function isBound () {
	var ref = this.getBindingModel( this );
		var model = ref.model;
	return !!model;
};

Context.prototype.getBindingPath = function getBindingPath ( ractive ) {
	var ref = this.getBindingModel( this );
		var model = ref.model;
		var instance = ref.instance;
	if ( model ) { return model.getKeypath( ractive || instance ); }
};

Context.prototype.getBinding = function getBinding () {
	var ref = this.getBindingModel( this );
		var model = ref.model;
	if ( model ) { return model.get( true ); }
};

Context.prototype.getBindingModel = function getBindingModel ( ctx ) {
	var el = ctx.element;
	return { model: el.binding && el.binding.model, instance: el.parentFragment.ractive };
};

Context.prototype.setBinding = function setBinding ( value ) {
	var ref = this.getBindingModel( this );
		var model = ref.model;
	return set( this.ractive, [ [ model, value ] ] );
};

Object.defineProperties( Context.prototype, prototypeAccessors );

Context.forRactive = getRactiveContext;
// circular deps are fun
extern.Context = Context;

// TODO: at some point perhaps this could support relative * keypaths?
function build$1 ( ctx, keypath, value ) {
	var sets = [];

	// set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		for ( var k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				sets.push( [ findModel( ctx, k ).model, keypath[k] ] );
			}
		}

	}
	// set a single keypath
	else {
		sets.push( [ findModel( ctx, keypath ).model, value ] );
	}

	return sets;
}

function findModel ( ctx, path ) {
	var frag = ctx.fragment;

	if ( typeof path !== 'string' ) {
		return { model: frag.findContext(), instance: path };
	}

	return { model: resolveReference( frag, path ), instance: frag.ractive };
}

function Ractive$fire ( eventName ) {
	var args = [], len = arguments.length - 1;
	while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

	var ctx;

	// watch for reproxy
	if ( args[0] instanceof Context  ) {
		var proto = args.shift();
		ctx = Object.create( proto );
		Object.assign( ctx, proto );
	} else if ( typeof args[0] === 'object' && args[0].constructor === Object ) {
		ctx = Context.forRactive( this, args.shift() );
	} else {
		ctx = Context.forRactive( this );
	}


	return fireEvent( this, eventName, ctx, args );
}

function Ractive$get ( keypath, opts ) {
	if ( typeof keypath !== 'string' ) { return this.viewmodel.get( true, keypath ); }

	var keys = splitKeypath( keypath );
	var key = keys[0];

	var model;

	if ( !this.viewmodel.has( key ) ) {
		// if this is an inline component, we may need to create
		// an implicit mapping
		if ( this.component && !this.isolated ) {
			model = resolveReference( this.fragment || new FakeFragment( this ), key );
		}
	}

	model = this.viewmodel.joinAll( keys );
	return model.get( true, opts );
}

var query = doc && doc.querySelector;

function getContext$2 ( node ) {
	if ( typeof node === 'string' && query ) {
		node = query.call( document, node );
	}

	var instances;
	if ( node ) {
		if ( node._ractive ) {
			return node._ractive.proxy.getContext();
		} else if ( ( instances = node.__ractive_instances__ ) && instances.length === 1 ) {
			return getRactiveContext( instances[0] );
		}
	}
}

function getNodeInfo$1 ( node ) {
	warnOnceIfDebug( "getNodeInfo has been renamed to getContext, and the getNodeInfo alias will be removed in a future release." );
	return getContext$2 ( node );
}

function getContext$1 ( node, options ) {
	if ( typeof node === 'string' ) {
		node = this.find( node, options );
	}

	return getContext$2( node );
}

function getNodeInfo$$1 ( node, options ) {
	if ( typeof node === 'string' ) {
		node = this.find( node, options );
	}

	return getNodeInfo$1( node );
}

var html   = 'http://www.w3.org/1999/xhtml';
var mathml = 'http://www.w3.org/1998/Math/MathML';
var svg$1    = 'http://www.w3.org/2000/svg';
var xlink  = 'http://www.w3.org/1999/xlink';
var xml    = 'http://www.w3.org/XML/1998/namespace';
var xmlns  = 'http://www.w3.org/2000/xmlns';

var namespaces = { html: html, mathml: mathml, svg: svg$1, xlink: xlink, xml: xml, xmlns: xmlns };

var createElement;
var matches;
var div;
var methodNames;
var unprefixed;
var prefixed;
var i;
var j;
var makeFunction;

// Test for SVG support
if ( !svg ) {
	createElement = function ( type, ns, extend ) {
		if ( ns && ns !== html ) {
			throw 'This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you\'re trying to render SVG in an older browser. See http://docs.ractivejs.org/latest/svg-and-older-browsers for more information';
		}

		return extend ?
			doc.createElement( type, extend ) :
			doc.createElement( type );
	};
} else {
	createElement = function ( type, ns, extend ) {
		if ( !ns || ns === html ) {
			return extend ?
				doc.createElement( type, extend ) :
				doc.createElement( type );
		}

		return extend ?
			doc.createElementNS( ns, type, extend ) :
			doc.createElementNS( ns, type );
	};
}

function createDocumentFragment () {
	return doc.createDocumentFragment();
}

function getElement ( input ) {
	var output;

	if ( !input || typeof input === 'boolean' ) { return; }

	if ( !win || !doc || !input ) {
		return null;
	}

	// We already have a DOM node - no work to do. (Duck typing alert!)
	if ( input.nodeType ) {
		return input;
	}

	// Get node from string
	if ( typeof input === 'string' ) {
		// try ID first
		output = doc.getElementById( input );

		// then as selector, if possible
		if ( !output && doc.querySelector ) {
			try {
				output = doc.querySelector( input );
			} catch (e) { /* this space intentionally left blank */ }
		}

		// did it work?
		if ( output && output.nodeType ) {
			return output;
		}
	}

	// If we've been given a collection (jQuery, Zepto etc), extract the first item
	if ( input[0] && input[0].nodeType ) {
		return input[0];
	}

	return null;
}

if ( !isClient ) {
	matches = null;
} else {
	div = createElement( 'div' );
	methodNames = [ 'matches', 'matchesSelector' ];

	makeFunction = function ( methodName ) {
		return function ( node, selector ) {
			return node[ methodName ]( selector );
		};
	};

	i = methodNames.length;

	while ( i-- && !matches ) {
		unprefixed = methodNames[i];

		if ( div[ unprefixed ] ) {
			matches = makeFunction( unprefixed );
		} else {
			j = vendors.length;
			while ( j-- ) {
				prefixed = vendors[i] + unprefixed.substr( 0, 1 ).toUpperCase() + unprefixed.substring( 1 );

				if ( div[ prefixed ] ) {
					matches = makeFunction( prefixed );
					break;
				}
			}
		}
	}

	// IE8...
	if ( !matches ) {
		matches = function ( node, selector ) {
			var parentNode, i;

			parentNode = node.parentNode;

			if ( !parentNode ) {
				// empty dummy <div>
				div.innerHTML = '';

				parentNode = div;
				node = node.cloneNode();

				div.appendChild( node );
			}

			var nodes = parentNode.querySelectorAll( selector );

			i = nodes.length;
			while ( i-- ) {
				if ( nodes[i] === node ) {
					return true;
				}
			}

			return false;
		};
	}
}

function detachNode ( node ) {
	// stupid ie
	if ( node && typeof node.parentNode !== 'unknown' && node.parentNode ) { // eslint-disable-line valid-typeof
		node.parentNode.removeChild( node );
	}

	return node;
}

function safeToStringValue ( value ) {
	return ( value == null || !value.toString ) ? '' : '' + value;
}

function safeAttributeString ( string ) {
	return safeToStringValue( string )
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}

var insertHook = new Hook( 'insert' );

function Ractive$insert ( target, anchor ) {
	if ( !this.fragment.rendered ) {
		// TODO create, and link to, documentation explaining this
		throw new Error( 'The API has changed - you must call `ractive.render(target[, anchor])` to render your Ractive instance. Once rendered you can use `ractive.insert()`.' );
	}

	target = getElement( target );
	anchor = getElement( anchor ) || null;

	if ( !target ) {
		throw new Error( 'You must specify a valid target to insert into' );
	}

	target.insertBefore( this.detach(), anchor );
	this.el = target;

	( target.__ractive_instances__ || ( target.__ractive_instances__ = [] ) ).push( this );
	this.isDetached = false;

	fireInsertHook( this );
}

function fireInsertHook( ractive ) {
	insertHook.fire( ractive );

	ractive.findAllComponents('*').forEach( function (child) {
		fireInsertHook( child.instance );
	});
}

function link ( there, here, options ) {
	var model;
	var target = ( options && ( options.ractive || options.instance ) ) || this;

	// may need to allow a mapping to resolve implicitly
	var sourcePath = splitKeypath( there );
	if ( !target.viewmodel.has( sourcePath[0] ) && target.component ) {
		model = resolveReference( target.component.parentFragment, sourcePath[0] );
		model = model.joinAll( sourcePath.slice( 1 ) );
	}

	var src = model || target.viewmodel.joinAll( sourcePath );
	var dest = this.viewmodel.joinAll( splitKeypath( here ), { lastLink: false });

	if ( isUpstream( src, dest ) || isUpstream( dest, src ) ) {
		throw new Error( 'A keypath cannot be linked to itself.' );
	}

	var promise = runloop.start();

	dest.link( src, there );

	runloop.end();

	return promise;
}

function isUpstream ( check, start ) {
	var model = start;
	while ( model ) {
		if ( model === check ) { return true; }
		model = model.target || model.parent;
	}
}

var Observer = function Observer ( ractive, model, callback, options ) {
	this.context = options.context || ractive;
	this.callback = callback;
	this.ractive = ractive;
	this.keypath = options.keypath;
	this.options = options;

	if ( model ) { this.resolved( model ); }

	if ( typeof options.old === 'function' ) {
		this.oldContext = Object.create( ractive );
		this.old = options.old;
	} else {
		this.old = old;
	}

	if ( options.init !== false ) {
		this.dirty = true;
		this.dispatch();
	} else {
		this.oldValue = this.old.call( this.oldContext, undefined, this.newValue );
	}

	this.dirty = false;
};

Observer.prototype.cancel = function cancel () {
	this.cancelled = true;
	if ( this.model ) {
		this.model.unregister( this );
	} else {
		this.resolver.unbind();
	}
	removeFromArray( this.ractive._observers, this );
};

Observer.prototype.dispatch = function dispatch () {
	if ( !this.cancelled ) {
		this.callback.call( this.context, this.newValue, this.oldValue, this.keypath );
		this.oldValue = this.old.call( this.oldContext, this.oldValue, this.model ? this.model.get() : this.newValue );
		this.dirty = false;
	}
};

Observer.prototype.handleChange = function handleChange () {
		var this$1 = this;

	if ( !this.dirty ) {
		var newValue = this.model.get();
		if ( isEqual( newValue, this.oldValue ) ) { return; }

		this.newValue = newValue;

		if ( this.options.strict && this.newValue === this.oldValue ) { return; }

		runloop.addObserver( this, this.options.defer );
		this.dirty = true;

		if ( this.options.once ) { runloop.scheduleTask( function () { return this$1.cancel(); } ); }
	}
};

Observer.prototype.rebind = function rebind ( next, previous ) {
		var this$1 = this;

	next = rebindMatch( this.keypath, next, previous );
	// TODO: set up a resolver if next is undefined?
	if ( next === this.model ) { return false; }

	if ( this.model ) { this.model.unregister( this ); }
	if ( next ) { next.addShuffleTask( function () { return this$1.resolved( next ); } ); }
};

Observer.prototype.resolved = function resolved ( model ) {
	this.model = model;

	this.oldValue = undefined;
	this.newValue = model.get();

	model.register( this );
};

function old ( previous, next ) {
	return next;
}

var star$1 = /\*+/g;

var PatternObserver = function PatternObserver ( ractive, baseModel, keys, callback, options ) {
	var this$1 = this;

	this.context = options.context || ractive;
	this.ractive = ractive;
	this.baseModel = baseModel;
	this.keys = keys;
	this.callback = callback;

	var pattern = keys.join( '\\.' ).replace( star$1, '(.+)' );
	var baseKeypath = this.baseKeypath = baseModel.getKeypath( ractive );
	this.pattern = new RegExp( ("^" + (baseKeypath ? baseKeypath + '\\.' : '') + pattern + "$") );
	this.recursive = keys.length === 1 && keys[0] === '**';
	if ( this.recursive ) { this.keys = [ '*' ]; }

	this.oldValues = {};
	this.newValues = {};

	this.defer = options.defer;
	this.once = options.once;
	this.strict = options.strict;

	this.dirty = false;
	this.changed = [];
	this.partial = false;
	this.links = options.links;

	var models = baseModel.findMatches( this.keys );

	models.forEach( function (model) {
		this$1.newValues[ model.getKeypath( this$1.ractive ) ] = model.get();
	});

	if ( options.init !== false ) {
		this.dispatch();
	} else {
		this.oldValues = this.newValues;
	}

	baseModel.registerPatternObserver( this );
};

PatternObserver.prototype.cancel = function cancel () {
	this.baseModel.unregisterPatternObserver( this );
	removeFromArray( this.ractive._observers, this );
};

PatternObserver.prototype.dispatch = function dispatch () {
		var this$1 = this;

	var newValues = this.newValues;
	this.newValues = {};
	Object.keys( newValues ).forEach( function (keypath) {
		var newValue = newValues[ keypath ];
		var oldValue = this$1.oldValues[ keypath ];

		if ( this$1.strict && newValue === oldValue ) { return; }
		if ( isEqual( newValue, oldValue ) ) { return; }

		var args = [ newValue, oldValue, keypath ];
		if ( keypath ) {
			var wildcards = this$1.pattern.exec( keypath );
			if ( wildcards ) {
				args = args.concat( wildcards.slice( 1 ) );
			}
		}

		this$1.callback.apply( this$1.context, args );
	});

	if ( this.partial ) {
		for ( var k in newValues ) {
			this$1.oldValues[k] = newValues[k];
		}
	} else {
		this.oldValues = newValues;
	}

	this.dirty = false;
};

PatternObserver.prototype.notify = function notify ( key ) {
	this.changed.push( key );
};

PatternObserver.prototype.shuffle = function shuffle ( newIndices ) {
		var this$1 = this;

	if ( !Array.isArray( this.baseModel.value ) ) { return; }

	var max = this.baseModel.value.length;

	for ( var i = 0; i < newIndices.length; i++ ) {
		if ( newIndices[ i ] === -1 || newIndices[ i ] === i ) { continue; }
		this$1.changed.push([ i ]);
	}

	for ( var i$1 = newIndices.touchedFrom; i$1 < max; i$1++ ) {
		this$1.changed.push([ i$1 ]);
	}
};

PatternObserver.prototype.handleChange = function handleChange () {
		var this$1 = this;

	if ( !this.dirty || this.changed.length ) {
		if ( !this.dirty ) { this.newValues = {}; }

		if ( !this.changed.length ) {
			this.baseModel.findMatches( this.keys ).forEach( function (model) {
				var keypath = model.getKeypath( this$1.ractive );
				this$1.newValues[ keypath ] = model.get();
			});
			this.partial = false;
		} else {
			var count = 0;

			if ( this.recursive ) {
				this.changed.forEach( function (keys) {
					var model = this$1.baseModel.joinAll( keys );
					if ( model.isLink && !this$1.links ) { return; }
					count++;
					this$1.newValues[ model.getKeypath( this$1.ractive ) ] = model.get();
				});
			} else {
				var ok = this.baseModel.isRoot ?
					this.changed.map( function (keys) { return keys.map( escapeKey ).join( '.' ); } ) :
					this.changed.map( function (keys) { return this$1.baseKeypath + '.' + keys.map( escapeKey ).join( '.' ); } );

				this.baseModel.findMatches( this.keys ).forEach( function (model) {
					var keypath = model.getKeypath( this$1.ractive );
					var check = function (k) {
						return ( k.indexOf( keypath ) === 0 && ( k.length === keypath.length || k[ keypath.length ] === '.' ) ) ||
							( keypath.indexOf( k ) === 0 && ( k.length === keypath.length || keypath[ k.length ] === '.' ) );
					};

					// is this model on a changed keypath?
					if ( ok.filter( check ).length ) {
						count++;
						this$1.newValues[ keypath ] = model.get();
					}
				});
			}

			// no valid change triggered, so bail to avoid breakage
			if ( !count ) { return; }

			this.partial = true;
		}

		runloop.addObserver( this, this.defer );
		this.dirty = true;
		this.changed.length = 0;

		if ( this.once ) { this.cancel(); }
	}
};

function negativeOne () {
	return -1;
}

var ArrayObserver = function ArrayObserver ( ractive, model, callback, options ) {
	this.ractive = ractive;
	this.model = model;
	this.keypath = model.getKeypath();
	this.callback = callback;
	this.options = options;

	this.pending = null;

	model.register( this );

	if ( options.init !== false ) {
		this.sliced = [];
		this.shuffle([]);
		this.dispatch();
	} else {
		this.sliced = this.slice();
	}
};

ArrayObserver.prototype.cancel = function cancel () {
	this.model.unregister( this );
	removeFromArray( this.ractive._observers, this );
};

ArrayObserver.prototype.dispatch = function dispatch () {
	this.callback( this.pending );
	this.pending = null;
	if ( this.options.once ) { this.cancel(); }
};

ArrayObserver.prototype.handleChange = function handleChange () {
	if ( this.pending ) {
		// post-shuffle
		runloop.addObserver( this, this.options.defer );
	} else {
		// entire array changed
		this.shuffle( this.sliced.map( negativeOne ) );
		this.handleChange();
	}
};

ArrayObserver.prototype.shuffle = function shuffle ( newIndices ) {
		var this$1 = this;

	var newValue = this.slice();

	var inserted = [];
	var deleted = [];
	var start;

	var hadIndex = {};

	newIndices.forEach( function ( newIndex, oldIndex ) {
		hadIndex[ newIndex ] = true;

		if ( newIndex !== oldIndex && start === undefined ) {
			start = oldIndex;
		}

		if ( newIndex === -1 ) {
			deleted.push( this$1.sliced[ oldIndex ] );
		}
	});

	if ( start === undefined ) { start = newIndices.length; }

	var len = newValue.length;
	for ( var i = 0; i < len; i += 1 ) {
		if ( !hadIndex[i] ) { inserted.push( newValue[i] ); }
	}

	this.pending = { inserted: inserted, deleted: deleted, start: start };
	this.sliced = newValue;
};

ArrayObserver.prototype.slice = function slice () {
	var value = this.model.get();
	return Array.isArray( value ) ? value.slice() : [];
};

function observe ( keypath, callback, options ) {
	var this$1 = this;

	var observers = [];
	var map;
	var opts;

	if ( isObject( keypath ) ) {
		map = keypath;
		opts = callback || {};
	} else {
		if ( typeof keypath === 'function' ) {
			map = { '': keypath };
			opts = callback || {};
		} else {
			map = {};
			map[ keypath ] = callback;
			opts = options || {};
		}
	}

	var silent = false;
	Object.keys( map ).forEach( function (keypath) {
		var callback = map[ keypath ];
		var caller = function () {
			var args = [], len = arguments.length;
			while ( len-- ) args[ len ] = arguments[ len ];

			if ( silent ) { return; }
			return callback.apply( this, args );
		};

		var keypaths = keypath.split( ' ' );
		if ( keypaths.length > 1 ) { keypaths = keypaths.filter( function (k) { return k; } ); }

		keypaths.forEach( function (keypath) {
			opts.keypath = keypath;
			var observer = createObserver( this$1, keypath, caller, opts );
			if ( observer ) { observers.push( observer ); }
		});
	});

	// add observers to the Ractive instance, so they can be
	// cancelled on ractive.teardown()
	this._observers.push.apply( this._observers, observers );

	return {
		cancel: function () { return observers.forEach( function (o) { return o.cancel(); } ); },
		isSilenced: function () { return silent; },
		silence: function () { return silent = true; },
		resume: function () { return silent = false; }
	};
}

function createObserver ( ractive, keypath, callback, options ) {
	var keys = splitKeypath( keypath );
	var wildcardIndex = keys.indexOf( '*' );
	if ( !~wildcardIndex ) { wildcardIndex = keys.indexOf( '**' ); }

	options.fragment = options.fragment || ractive.fragment;

	var model;
	if ( !options.fragment ) {
		model = ractive.viewmodel.joinKey( keys[0] );
	} else {
		// .*.whatever relative wildcard is a special case because splitkeypath doesn't handle the leading .
		if ( ~keys[0].indexOf( '.*' ) ) {
			model = options.fragment.findContext();
			wildcardIndex = 0;
			keys[0] = keys[0].slice( 1 );
		} else {
			model = wildcardIndex === 0 ? options.fragment.findContext() : resolveReference( options.fragment, keys[0] );
		}
	}

	// the model may not exist key
	if ( !model ) { model = ractive.viewmodel.joinKey( keys[0] ); }

	if ( !~wildcardIndex ) {
		model = model.joinAll( keys.slice( 1 ) );
		if ( options.array ) {
			return new ArrayObserver( ractive, model, callback, options );
		} else {
			return new Observer( ractive, model, callback, options );
		}
	} else {
		var double = keys.indexOf( '**' );
		if ( ~double ) {
			if ( double + 1 !== keys.length || ~keys.indexOf( '*' ) ) {
				warnOnceIfDebug( "Recursive observers may only specify a single '**' at the end of the path." );
				return;
			}
		}

		model = model.joinAll( keys.slice( 1, wildcardIndex ) );

		return new PatternObserver( ractive, model, keys.slice( wildcardIndex ), callback, options );
	}
}

var onceOptions = { init: false, once: true };

function observeOnce ( keypath, callback, options ) {
	if ( isObject( keypath ) || typeof keypath === 'function' ) {
		options = Object.assign( callback || {}, onceOptions );
		return this.observe( keypath, options );
	}

	options = Object.assign( options || {}, onceOptions );
	return this.observe( keypath, callback, options );
}

var trim = function (str) { return str.trim(); };

var notEmptyString = function (str) { return str !== ''; };

function Ractive$off ( eventName, callback ) {
	var this$1 = this;

	// if no event is specified, remove _all_ event listeners
	if ( !eventName ) {
		this._subs = {};
	} else {
		// Handle multiple space-separated event names
		var eventNames = eventName.split( ' ' ).map( trim ).filter( notEmptyString );

		eventNames.forEach( function (event) {
			var subs = this$1._subs[ event ];
			// if given a specific callback to remove, remove only it
			if ( subs && callback ) {
				var entry = subs.find( function (s) { return s.callback === callback; } );
				if ( entry ) {
					removeFromArray( subs, entry );
					entry.off = true;

					if ( event.indexOf( '.' ) ) { this$1._nsSubs--; }
				}
			}

			// otherwise, remove all listeners for this event
			else if ( subs ) {
				if ( event.indexOf( '.' ) ) { this$1._nsSubs -= subs.length; }
				subs.length = 0;
			}
		});
	}

	return this;
}

function Ractive$on ( eventName, callback ) {
	var this$1 = this;

	// eventName may already be a map
	var map = typeof eventName === 'object' ? eventName : {};
	// or it may be a string along with a callback
	if ( typeof eventName === 'string' ) { map[ eventName ] = callback; }

	var silent = false;
	var events = [];

	var loop = function ( k ) {
		var callback$1 = map[k];
		var caller = function () {
			var args = [], len = arguments.length;
			while ( len-- ) args[ len ] = arguments[ len ];

			if ( !silent ) { return callback$1.apply( this, args ); }
		};
		var entry = {
			callback: callback$1,
			handler: caller
		};

		if ( map.hasOwnProperty( k ) ) {
			var names = k.split( ' ' ).map( trim ).filter( notEmptyString );
			names.forEach( function (n) {
				( this$1._subs[ n ] || ( this$1._subs[ n ] = [] ) ).push( entry );
				if ( n.indexOf( '.' ) ) { this$1._nsSubs++; }
				events.push( [ n, entry ] );
			});
		}
	};

	for ( var k in map ) loop( k );

	return {
		cancel: function () { return events.forEach( function (e) { return this$1.off( e[0], e[1].callback ); } ); },
		isSilenced: function () { return silent; },
		silence: function () { return silent = true; },
		resume: function () { return silent = false; }
	};
}

function Ractive$once ( eventName, handler ) {
	var listener = this.on( eventName, function () {
		handler.apply( this, arguments );
		listener.cancel();
	});

	// so we can still do listener.cancel() manually
	return listener;
}

var pop = makeArrayMethod( 'pop' ).path;

var push = makeArrayMethod( 'push' ).path;

function readLink ( keypath, options ) {
	if ( options === void 0 ) options = {};

	var path = splitKeypath( keypath );

	if ( this.viewmodel.has( path[0] ) ) {
		var model = this.viewmodel.joinAll( path );

		if ( !model.isLink ) { return; }

		while ( ( model = model.target ) && options.canonical !== false ) {
			if ( !model.isLink ) { break; }
		}

		if ( model ) { return { ractive: model.root.ractive, keypath: model.getKeypath() }; }
	}
}

var PREFIX = '/* Ractive.js component styles */';

// Holds current definitions of styles.
var styleDefinitions = [];

// Flag to tell if we need to update the CSS
var isDirty = false;

// These only make sense on the browser. See additional setup below.
var styleElement = null;
var useCssText = null;

function addCSS( styleDefinition ) {
	styleDefinitions.push( styleDefinition );
	isDirty = true;
}

function applyCSS() {

	// Apply only seems to make sense when we're in the DOM. Server-side renders
	// can call toCSS to get the updated CSS.
	if ( !doc || !isDirty ) { return; }

	if ( useCssText ) {
		styleElement.styleSheet.cssText = getCSS( null );
	} else {
		styleElement.innerHTML = getCSS( null );
	}

	isDirty = false;
}

function getCSS( cssIds ) {

	var filteredStyleDefinitions = cssIds ? styleDefinitions.filter( function (style) { return ~cssIds.indexOf( style.id ); } ) : styleDefinitions;

	return filteredStyleDefinitions.reduce( function ( styles, style ) { return (styles + "\n\n/* {" + (style.id) + "} */\n" + (style.styles)); }, PREFIX );

}

// If we're on the browser, additional setup needed.
if ( doc && ( !styleElement || !styleElement.parentNode ) ) {

	styleElement = doc.createElement( 'style' );
	styleElement.type = 'text/css';

	doc.getElementsByTagName( 'head' )[ 0 ].appendChild( styleElement );

	useCssText = !!styleElement.styleSheet;
}

function fillGaps ( target ) {
	var sources = [], len = arguments.length - 1;
	while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];


	for (var i = 0; i < sources.length; i++){
		var source = sources[i];
		for ( var key in source ) {
			// Source can be a prototype-less object.
			if ( key in target || !Object.prototype.hasOwnProperty.call( source, key ) ) { continue; }
			target[ key ] = source[ key ];
		}
	}

	return target;
}

function toPairs ( obj ) {
	if ( obj === void 0 ) obj = {};

	var pairs = [];
	for ( var key in obj ) {
		// Source can be a prototype-less object.
		if ( !Object.prototype.hasOwnProperty.call( obj, key ) ) { continue; }
		pairs.push( [ key, obj[ key ] ] );
	}
	return pairs;
}

var adaptConfigurator = {
	extend: function ( Parent, proto, options ) {
		proto.adapt = combine( proto.adapt, ensureArray( options.adapt ) );
	},

	init: function init () {}
};

var remove = /\/\*(?:[\s\S]*?)\*\//g;
var escape = /url\(\s*(['"])(?:\\[\s\S]|(?!\1).)*\1\s*\)|url\((?:\\[\s\S]|[^)])*\)|(['"])(?:\\[\s\S]|(?!\2).)*\2/gi;
var value = /\0(\d+)/g;

// Removes comments and strings from the given CSS to make it easier to parse.
// Callback receives the cleaned CSS and a function which can be used to put
// the removed strings back in place after parsing is done.
var cleanCss = function ( css, callback, additionalReplaceRules ) {
	if ( additionalReplaceRules === void 0 ) additionalReplaceRules = [];

	var values = [];
	var reconstruct = function (css) { return css.replace( value, function ( match, n ) { return values[ n ]; } ); };
	css = css.replace( escape, function (match) { return ("\u0000" + (values.push( match ) - 1)); }).replace( remove, '' );

	additionalReplaceRules.forEach( function ( pattern ) {
		css = css.replace( pattern, function (match) { return ("\u0000" + (values.push( match ) - 1)); } );
	});

	return callback( css, reconstruct );
};

var selectorsPattern = /(?:^|\}|\{)\s*([^\{\}\0]+)\s*(?=\{)/g;
var keyframesDeclarationPattern = /@keyframes\s+[^\{\}]+\s*\{(?:[^{}]+|\{[^{}]+})*}/gi;
var selectorUnitPattern = /((?:(?:\[[^\]]+\])|(?:[^\s\+\>~:]))+)((?:::?[^\s\+\>\~\(:]+(?:\([^\)]+\))?)*\s*[\s\+\>\~]?)\s*/g;
var excludePattern = /^(?:@|\d+%)/;
var dataRvcGuidPattern = /\[data-ractive-css~="\{[a-z0-9-]+\}"]/g;

function trim$1 ( str ) {
	return str.trim();
}

function extractString ( unit ) {
	return unit.str;
}

function transformSelector ( selector, parent ) {
	var selectorUnits = [];
	var match;

	while ( match = selectorUnitPattern.exec( selector ) ) {
		selectorUnits.push({
			str: match[0],
			base: match[1],
			modifiers: match[2]
		});
	}

	// For each simple selector within the selector, we need to create a version
	// that a) combines with the id, and b) is inside the id
	var base = selectorUnits.map( extractString );

	var transformed = [];
	var i = selectorUnits.length;

	while ( i-- ) {
		var appended = base.slice();

		// Pseudo-selectors should go after the attribute selector
		var unit = selectorUnits[i];
		appended[i] = unit.base + parent + unit.modifiers || '';

		var prepended = base.slice();
		prepended[i] = parent + ' ' + prepended[i];

		transformed.push( appended.join( ' ' ), prepended.join( ' ' ) );
	}

	return transformed.join( ', ' );
}

function transformCss ( css, id ) {
	var dataAttr = "[data-ractive-css~=\"{" + id + "}\"]";

	var transformed;

	if ( dataRvcGuidPattern.test( css ) ) {
		transformed = css.replace( dataRvcGuidPattern, dataAttr );
	} else {
		transformed = cleanCss( css, function ( css, reconstruct ) {
			css = css.replace( selectorsPattern, function ( match, $1 ) {
				// don't transform at-rules and keyframe declarations
				if ( excludePattern.test( $1 ) ) { return match; }

				var selectors = $1.split( ',' ).map( trim$1 );
				var transformed = selectors
					.map( function (selector) { return transformSelector( selector, dataAttr ); } )
					.join( ', ' ) + ' ';

				return match.replace( $1, transformed );
			});

			return reconstruct( css );
		}, [ keyframesDeclarationPattern ]);
	}

	return transformed;
}

function s4() {
	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function uuid() {
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

var hasCurly = /\{/;
var cssConfigurator = {
	name: 'css',

	// Called when creating a new component definition
	extend: function ( Parent, proto, options ) {
		if ( !options.css ) { return; }
		var css = typeof options.css === 'string' && !hasCurly.test( options.css ) ?
			( getElement( options.css ) || options.css ) :
			options.css;

		var id = options.cssId || uuid();

		if ( typeof css === 'object' ) {
			css = 'textContent' in css ? css.textContent : css.innerHTML;
		}

		if ( !css ) { return; }

		var styles = options.noCssTransform ? css : transformCss( css, id );

		proto.cssId = id;

		addCSS( { id: id, styles: styles } );
	},

	// Called when creating a new component instance
	init: function ( Parent, target, options ) {
		if ( !options.css ) { return; }

		warnIfDebug( "\nThe css option is currently not supported on a per-instance basis and will be discarded. Instead, we recommend instantiating from a component definition with a css option.\n\nconst Component = Ractive.extend({\n\t...\n\tcss: '/* your css */',\n\t...\n});\n\nconst componentInstance = new Component({ ... })\n\t\t" );
	}

};

function validate ( data ) {
	// Warn if userOptions.data is a non-POJO
	if ( data && data.constructor !== Object ) {
		if ( typeof data === 'function' ) {
			// TODO do we need to support this in the new Ractive() case?
		} else if ( typeof data !== 'object' ) {
			fatal( ("data option must be an object or a function, `" + data + "` is not valid") );
		} else {
			warnIfDebug( 'If supplied, options.data should be a plain JavaScript object - using a non-POJO as the root object may work, but is discouraged' );
		}
	}
}

var dataConfigurator = {
	name: 'data',

	extend: function ( Parent, proto, options ) {
		var key;
		var value;

		// check for non-primitives, which could cause mutation-related bugs
		if ( options.data && isObject( options.data ) ) {
			for ( key in options.data ) {
				value = options.data[ key ];

				if ( value && typeof value === 'object' ) {
					if ( isObject( value ) || Array.isArray( value ) ) {
						warnIfDebug( "Passing a `data` option with object and array properties to Ractive.extend() is discouraged, as mutating them is likely to cause bugs. Consider using a data function instead:\n\n  // this...\n  data: function () {\n    return {\n      myObject: {}\n    };\n  })\n\n  // instead of this:\n  data: {\n    myObject: {}\n  }" );
					}
				}
			}
		}

		proto.data = combine$1( proto.data, options.data );
	},

	init: function ( Parent, ractive, options ) {
		var result = combine$1( Parent.prototype.data, options.data );

		if ( typeof result === 'function' ) { result = result.call( ractive ); }

		// bind functions to the ractive instance at the top level,
		// unless it's a non-POJO (in which case alarm bells should ring)
		if ( result && result.constructor === Object ) {
			for ( var prop in result ) {
				if ( typeof result[ prop ] === 'function' ) {
					var value = result[ prop ];
					result[ prop ] = bind$1( value, ractive );
					result[ prop ]._r_unbound = value;
				}
			}
		}

		return result || {};
	},

	reset: function reset ( ractive ) {
		var result = this.init( ractive.constructor, ractive, ractive.viewmodel );
		ractive.viewmodel.root.set( result );
		return true;
	}
};

function combine$1 ( parentValue, childValue ) {
	validate( childValue );

	var parentIsFn = typeof parentValue === 'function';
	var childIsFn = typeof childValue === 'function';

	// Very important, otherwise child instance can become
	// the default data object on Ractive or a component.
	// then ractive.set() ends up setting on the prototype!
	if ( !childValue && !parentIsFn ) {
		childValue = {};
	}

	// Fast path, where we just need to copy properties from
	// parent to child
	if ( !parentIsFn && !childIsFn ) {
		return fromProperties( childValue, parentValue );
	}

	return function () {
		var child = childIsFn ? callDataFunction( childValue, this ) : childValue;
		var parent = parentIsFn ? callDataFunction( parentValue, this ) : parentValue;

		return fromProperties( child, parent );
	};
}

function callDataFunction ( fn, context ) {
	var data = fn.call( context );

	if ( !data ) { return; }

	if ( typeof data !== 'object' ) {
		fatal( 'Data function must return an object' );
	}

	if ( data.constructor !== Object ) {
		warnOnceIfDebug( 'Data function returned something other than a plain JavaScript object. This might work, but is strongly discouraged' );
	}

	return data;
}

function fromProperties ( primary, secondary ) {
	if ( primary && secondary ) {
		for ( var key in secondary ) {
			if ( !( key in primary ) ) {
				primary[ key ] = secondary[ key ];
			}
		}

		return primary;
	}

	return primary || secondary;
}

var TEMPLATE_VERSION = 4;

var pattern = /\$\{([^\}]+)\}/g;

function fromExpression ( body, length ) {
	if ( length === void 0 ) length = 0;

	var args = new Array( length );

	while ( length-- ) {
		args[length] = "_" + length;
	}

	// Functions created directly with new Function() look like this:
	//     function anonymous (_0 /**/) { return _0*2 }
	//
	// With this workaround, we get a little more compact:
	//     function (_0){return _0*2}
	return new Function( [], ("return function (" + (args.join(',')) + "){return(" + body + ");};") )();
}

function fromComputationString ( str, bindTo ) {
	var hasThis;

	var functionBody = 'return (' + str.replace( pattern, function ( match, keypath ) {
		hasThis = true;
		return ("__ractive.get(\"" + keypath + "\")");
	}) + ');';

	if ( hasThis ) { functionBody = "var __ractive = this; " + functionBody; }
	var fn = new Function( functionBody );
	return hasThis ? fn.bind( bindTo ) : fn;
}

var functions = Object.create( null );

function getFunction ( str, i ) {
	if ( functions[ str ] ) { return functions[ str ]; }
	return functions[ str ] = createFunction( str, i );
}

function addFunctions( template ) {
	if ( !template ) { return; }

	var exp = template.e;

	if ( !exp ) { return; }

	Object.keys( exp ).forEach( function ( str ) {
		if ( functions[ str ] ) { return; }
		functions[ str ] = exp[ str ];
	});
}

var leadingWhitespace = /^\s+/;

var ParseError = function ( message ) {
	this.name = 'ParseError';
	this.message = message;
	try {
		throw new Error(message);
	} catch (e) {
		this.stack = e.stack;
	}
};

ParseError.prototype = Error.prototype;

var Parser = function ( str, options ) {
	var item;
	var lineStart = 0;

	this.str = str;
	this.options = options || {};
	this.pos = 0;

	this.lines = this.str.split( '\n' );
	this.lineEnds = this.lines.map( function (line) {
		var lineEnd = lineStart + line.length + 1; // +1 for the newline

		lineStart = lineEnd;
		return lineEnd;
	}, 0 );

	// Custom init logic
	if ( this.init ) { this.init( str, options ); }

	var items = [];

	while ( ( this.pos < this.str.length ) && ( item = this.read() ) ) {
		items.push( item );
	}

	this.leftover = this.remaining();
	this.result = this.postProcess ? this.postProcess( items, options ) : items;
};

Parser.prototype = {
	read: function read ( converters ) {
		var this$1 = this;

		var i, item;

		if ( !converters ) { converters = this.converters; }

		var pos = this.pos;

		var len = converters.length;
		for ( i = 0; i < len; i += 1 ) {
			this$1.pos = pos; // reset for each attempt

			if ( item = converters[i]( this$1 ) ) {
				return item;
			}
		}

		return null;
	},

	getContextMessage: function getContextMessage ( pos, message ) {
		var ref = this.getLinePos( pos );
		var lineNum = ref[0];
		var columnNum = ref[1];
		if ( this.options.contextLines === -1 ) {
			return [ lineNum, columnNum, (message + " at line " + lineNum + " character " + columnNum) ];
		}

		var line = this.lines[ lineNum - 1 ];

		var contextUp = '';
		var contextDown = '';
		if ( this.options.contextLines ) {
			var start = lineNum - 1 - this.options.contextLines < 0 ? 0 : lineNum - 1 - this.options.contextLines;
			contextUp = this.lines.slice( start, lineNum - 1 - start ).join( '\n' ).replace( /\t/g, '  ' );
			contextDown = this.lines.slice( lineNum, lineNum + this.options.contextLines ).join( '\n' ).replace( /\t/g, '  ' );
			if ( contextUp ) {
				contextUp += '\n';
			}
			if ( contextDown ) {
				contextDown = '\n' + contextDown;
			}
		}

		var numTabs = 0;
		var annotation = contextUp + line.replace( /\t/g, function ( match, char ) {
			if ( char < columnNum ) {
				numTabs += 1;
			}

			return '  ';
		}) + '\n' + new Array( columnNum + numTabs ).join( ' ' ) + '^----' + contextDown;

		return [ lineNum, columnNum, (message + " at line " + lineNum + " character " + columnNum + ":\n" + annotation) ];
	},

	getLinePos: function getLinePos ( char ) {
		var this$1 = this;

		var lineNum = 0;
		var lineStart = 0;

		while ( char >= this.lineEnds[ lineNum ] ) {
			lineStart = this$1.lineEnds[ lineNum ];
			lineNum += 1;
		}

		var columnNum = char - lineStart;
		return [ lineNum + 1, columnNum + 1, char ]; // line/col should be one-based, not zero-based!
	},

	error: function error ( message ) {
		var ref = this.getContextMessage( this.pos, message );
		var lineNum = ref[0];
		var columnNum = ref[1];
		var msg = ref[2];

		var error = new ParseError( msg );

		error.line = lineNum;
		error.character = columnNum;
		error.shortMessage = message;

		throw error;
	},

	matchString: function matchString ( string ) {
		if ( this.str.substr( this.pos, string.length ) === string ) {
			this.pos += string.length;
			return string;
		}
	},

	matchPattern: function matchPattern ( pattern ) {
		var match;

		if ( match = pattern.exec( this.remaining() ) ) {
			this.pos += match[0].length;
			return match[1] || match[0];
		}
	},

	allowWhitespace: function allowWhitespace () {
		this.matchPattern( leadingWhitespace );
	},

	remaining: function remaining () {
		return this.str.substring( this.pos );
	},

	nextChar: function nextChar () {
		return this.str.charAt( this.pos );
	},

	warn: function warn$$1 ( message ) {
		var msg = this.getContextMessage( this.pos, message )[2];

		warnIfDebug( msg );
	}
};

Parser.extend = function ( proto ) {
	var Parent = this;
	var Child = function ( str, options ) {
		Parser.call( this, str, options );
	};

	Child.prototype = Object.create( Parent.prototype );

	for ( var key in proto ) {
		if ( proto.hasOwnProperty( key ) ) {
			Child.prototype[ key ] = proto[ key ];
		}
	}

	Child.extend = Parser.extend;
	return Child;
};

var delimiterChangePattern = /^[^\s=]+/;
var whitespacePattern = /^\s+/;

function readDelimiterChange ( parser ) {
	if ( !parser.matchString( '=' ) ) {
		return null;
	}

	var start = parser.pos;

	// allow whitespace before new opening delimiter
	parser.allowWhitespace();

	var opening = parser.matchPattern( delimiterChangePattern );
	if ( !opening ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace (in fact, it's necessary...)
	if ( !parser.matchPattern( whitespacePattern ) ) {
		return null;
	}

	var closing = parser.matchPattern( delimiterChangePattern );
	if ( !closing ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace before closing '='
	parser.allowWhitespace();

	if ( !parser.matchString( '=' ) ) {
		parser.pos = start;
		return null;
	}

	return [ opening, closing ];
}

var regexpPattern = /^(\/(?:[^\n\r\u2028\u2029/\\[]|\\.|\[(?:[^\n\r\u2028\u2029\]\\]|\\.)*])+\/(?:([gimuy])(?![a-z]*\2))*(?![a-zA-Z_$0-9]))/;

function readNumberLiteral ( parser ) {
	var result;

	if ( result = parser.matchPattern( regexpPattern ) ) {
		return {
			t: REGEXP_LITERAL,
			v: result
		};
	}

	return null;
}

var pattern$1 = /[-/\\^$*+?.()|[\]{}]/g;

function escapeRegExp ( str ) {
	return str.replace( pattern$1, '\\$&' );
}

var regExpCache = {};

var getLowestIndex = function ( haystack, needles ) {
	return haystack.search( regExpCache[needles.join()] || ( regExpCache[needles.join()] = new RegExp( needles.map( escapeRegExp ).join( '|' ) ) ) );
};

// https://github.com/kangax/html-minifier/issues/63#issuecomment-37763316
var booleanAttributes = /^(allowFullscreen|async|autofocus|autoplay|checked|compact|controls|declare|default|defaultChecked|defaultMuted|defaultSelected|defer|disabled|enabled|formNoValidate|hidden|indeterminate|inert|isMap|itemScope|loop|multiple|muted|noHref|noResize|noShade|noValidate|noWrap|open|pauseOnExit|readOnly|required|reversed|scoped|seamless|selected|sortable|translate|trueSpeed|typeMustMatch|visible)$/i;
var voidElementNames = /^(?:area|base|br|col|command|doctype|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;

var htmlEntities = { quot: 34, amp: 38, apos: 39, lt: 60, gt: 62, nbsp: 160, iexcl: 161, cent: 162, pound: 163, curren: 164, yen: 165, brvbar: 166, sect: 167, uml: 168, copy: 169, ordf: 170, laquo: 171, not: 172, shy: 173, reg: 174, macr: 175, deg: 176, plusmn: 177, sup2: 178, sup3: 179, acute: 180, micro: 181, para: 182, middot: 183, cedil: 184, sup1: 185, ordm: 186, raquo: 187, frac14: 188, frac12: 189, frac34: 190, iquest: 191, Agrave: 192, Aacute: 193, Acirc: 194, Atilde: 195, Auml: 196, Aring: 197, AElig: 198, Ccedil: 199, Egrave: 200, Eacute: 201, Ecirc: 202, Euml: 203, Igrave: 204, Iacute: 205, Icirc: 206, Iuml: 207, ETH: 208, Ntilde: 209, Ograve: 210, Oacute: 211, Ocirc: 212, Otilde: 213, Ouml: 214, times: 215, Oslash: 216, Ugrave: 217, Uacute: 218, Ucirc: 219, Uuml: 220, Yacute: 221, THORN: 222, szlig: 223, agrave: 224, aacute: 225, acirc: 226, atilde: 227, auml: 228, aring: 229, aelig: 230, ccedil: 231, egrave: 232, eacute: 233, ecirc: 234, euml: 235, igrave: 236, iacute: 237, icirc: 238, iuml: 239, eth: 240, ntilde: 241, ograve: 242, oacute: 243, ocirc: 244, otilde: 245, ouml: 246, divide: 247, oslash: 248, ugrave: 249, uacute: 250, ucirc: 251, uuml: 252, yacute: 253, thorn: 254, yuml: 255, OElig: 338, oelig: 339, Scaron: 352, scaron: 353, Yuml: 376, fnof: 402, circ: 710, tilde: 732, Alpha: 913, Beta: 914, Gamma: 915, Delta: 916, Epsilon: 917, Zeta: 918, Eta: 919, Theta: 920, Iota: 921, Kappa: 922, Lambda: 923, Mu: 924, Nu: 925, Xi: 926, Omicron: 927, Pi: 928, Rho: 929, Sigma: 931, Tau: 932, Upsilon: 933, Phi: 934, Chi: 935, Psi: 936, Omega: 937, alpha: 945, beta: 946, gamma: 947, delta: 948, epsilon: 949, zeta: 950, eta: 951, theta: 952, iota: 953, kappa: 954, lambda: 955, mu: 956, nu: 957, xi: 958, omicron: 959, pi: 960, rho: 961, sigmaf: 962, sigma: 963, tau: 964, upsilon: 965, phi: 966, chi: 967, psi: 968, omega: 969, thetasym: 977, upsih: 978, piv: 982, ensp: 8194, emsp: 8195, thinsp: 8201, zwnj: 8204, zwj: 8205, lrm: 8206, rlm: 8207, ndash: 8211, mdash: 8212, lsquo: 8216, rsquo: 8217, sbquo: 8218, ldquo: 8220, rdquo: 8221, bdquo: 8222, dagger: 8224, Dagger: 8225, bull: 8226, hellip: 8230, permil: 8240, prime: 8242, Prime: 8243, lsaquo: 8249, rsaquo: 8250, oline: 8254, frasl: 8260, euro: 8364, image: 8465, weierp: 8472, real: 8476, trade: 8482, alefsym: 8501, larr: 8592, uarr: 8593, rarr: 8594, darr: 8595, harr: 8596, crarr: 8629, lArr: 8656, uArr: 8657, rArr: 8658, dArr: 8659, hArr: 8660, forall: 8704, part: 8706, exist: 8707, empty: 8709, nabla: 8711, isin: 8712, notin: 8713, ni: 8715, prod: 8719, sum: 8721, minus: 8722, lowast: 8727, radic: 8730, prop: 8733, infin: 8734, ang: 8736, and: 8743, or: 8744, cap: 8745, cup: 8746, int: 8747, there4: 8756, sim: 8764, cong: 8773, asymp: 8776, ne: 8800, equiv: 8801, le: 8804, ge: 8805, sub: 8834, sup: 8835, nsub: 8836, sube: 8838, supe: 8839, oplus: 8853, otimes: 8855, perp: 8869, sdot: 8901, lceil: 8968, rceil: 8969, lfloor: 8970, rfloor: 8971, lang: 9001, rang: 9002, loz: 9674, spades: 9824, clubs: 9827, hearts: 9829, diams: 9830	};
var controlCharacters = [ 8364, 129, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352, 8249, 338, 141, 381, 143, 144, 8216, 8217, 8220, 8221, 8226, 8211, 8212, 732, 8482, 353, 8250, 339, 157, 382, 376 ];
var entityPattern = new RegExp( '&(#?(?:x[\\w\\d]+|\\d+|' + Object.keys( htmlEntities ).join( '|' ) + '));?', 'g' );
var codePointSupport = typeof String.fromCodePoint === 'function';
var codeToChar = codePointSupport ? String.fromCodePoint : String.fromCharCode;

function decodeCharacterReferences ( html ) {
	return html.replace( entityPattern, function ( match, entity ) {
		var code;

		// Handle named entities
		if ( entity[0] !== '#' ) {
			code = htmlEntities[ entity ];
		} else if ( entity[1] === 'x' ) {
			code = parseInt( entity.substring( 2 ), 16 );
		} else {
			code = parseInt( entity.substring( 1 ), 10 );
		}

		if ( !code ) {
			return match;
		}

		return codeToChar( validateCode( code ) );
	});
}

var lessThan = /</g;
var greaterThan = />/g;
var amp = /&/g;
var invalid = 65533;

function escapeHtml ( str ) {
	return str
		.replace( amp, '&amp;' )
		.replace( lessThan, '&lt;' )
		.replace( greaterThan, '&gt;' );
}

// some code points are verboten. If we were inserting HTML, the browser would replace the illegal
// code points with alternatives in some cases - since we're bypassing that mechanism, we need
// to replace them ourselves
//
// Source: http://en.wikipedia.org/wiki/Character_encodings_in_HTML#Illegal_characters
function validateCode ( code ) {
	if ( !code ) {
		return invalid;
	}

	// line feed becomes generic whitespace
	if ( code === 10 ) {
		return 32;
	}

	// ASCII range. (Why someone would use HTML entities for ASCII characters I don't know, but...)
	if ( code < 128 ) {
		return code;
	}

	// code points 128-159 are dealt with leniently by browsers, but they're incorrect. We need
	// to correct the mistake or we'll end up with missing € signs and so on
	if ( code <= 159 ) {
		return controlCharacters[ code - 128 ];
	}

	// basic multilingual plane
	if ( code < 55296 ) {
		return code;
	}

	// UTF-16 surrogate halves
	if ( code <= 57343 ) {
		return invalid;
	}

	// rest of the basic multilingual plane
	if ( code <= 65535 ) {
		return code;
	} else if ( !codePointSupport ) {
		return invalid;
	}

	// supplementary multilingual plane 0x10000 - 0x1ffff
	if ( code >= 65536 && code <= 131071 ) {
		return code;
	}

	// supplementary ideographic plane 0x20000 - 0x2ffff
	if ( code >= 131072 && code <= 196607 ) {
		return code;
	}

	return invalid;
}

var expectedExpression = 'Expected a JavaScript expression';
var expectedParen = 'Expected closing paren';

// bulletproof number regex from https://gist.github.com/Rich-Harris/7544330
var numberPattern = /^(?:[+-]?)0*(?:(?:(?:[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;

function readNumberLiteral$1 ( parser ) {
	var result;

	if ( result = parser.matchPattern( numberPattern ) ) {
		return {
			t: NUMBER_LITERAL,
			v: result
		};
	}

	return null;
}

function readBooleanLiteral ( parser ) {
	var remaining = parser.remaining();

	if ( remaining.substr( 0, 4 ) === 'true' ) {
		parser.pos += 4;
		return {
			t: BOOLEAN_LITERAL,
			v: 'true'
		};
	}

	if ( remaining.substr( 0, 5 ) === 'false' ) {
		parser.pos += 5;
		return {
			t: BOOLEAN_LITERAL,
			v: 'false'
		};
	}

	return null;
}

// Match one or more characters until: ", ', \, or EOL/EOF.
// EOL/EOF is written as (?!.) (meaning there's no non-newline char next).
var stringMiddlePattern = /^(?=.)[^"'\\]+?(?:(?!.)|(?=["'\\]))/;

// Match one escape sequence, including the backslash.
var escapeSequencePattern = /^\\(?:[`'"\\bfnrt]|0(?![0-9])|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|(?=.)[^ux0-9])/;

// Match one ES5 line continuation (backslash + line terminator).
var lineContinuationPattern = /^\\(?:\r\n|[\u000A\u000D\u2028\u2029])/;

// Helper for defining getDoubleQuotedString and getSingleQuotedString.
var makeQuotedStringMatcher = function ( okQuote ) {
	return function ( parser ) {
		var literal = '"';
		var done = false;
		var next;

		while ( !done ) {
			next = ( parser.matchPattern( stringMiddlePattern ) || parser.matchPattern( escapeSequencePattern ) ||
				parser.matchString( okQuote ) );
			if ( next ) {
				if ( next === "\"" ) {
					literal += "\\\"";
				} else if ( next === "\\'" ) {
					literal += "'";
				} else {
					literal += next;
				}
			} else {
				next = parser.matchPattern( lineContinuationPattern );
				if ( next ) {
					// convert \(newline-like) into a \u escape, which is allowed in JSON
					literal += '\\u' + ( '000' + next.charCodeAt(1).toString(16) ).slice( -4 );
				} else {
					done = true;
				}
			}
		}

		literal += '"';

		// use JSON.parse to interpret escapes
		return JSON.parse( literal );
	};
};

var singleMatcher = makeQuotedStringMatcher( "\"" );
var doubleMatcher = makeQuotedStringMatcher( "'" );

var readStringLiteral = function ( parser ) {
	var start = parser.pos;
	var quote = parser.matchString( "'" ) || parser.matchString( "\"" );

	if ( quote ) {
		var string = ( quote === "'" ? singleMatcher : doubleMatcher )( parser );

		if ( !parser.matchString( quote ) ) {
			parser.pos = start;
			return null;
		}

		return {
			t: STRING_LITERAL,
			v: string
		};
	}

	return null;
};

// Match one or more characters until: ", ', or \
var stringMiddlePattern$1 = /^[^`"\\\$]+?(?:(?=[`"\\\$]))/;

var escapes = /[\r\n\t\b\f]/g;
function getString ( literal ) {
	return JSON.parse( ("\"" + (literal.replace( escapes, escapeChar )) + "\"") );
}

function escapeChar ( c ) {
	switch ( c ) {
		case '\n': return '\\n';
		case '\r': return '\\r';
		case '\t': return '\\t';
		case '\b': return '\\b';
		case '\f': return '\\f';
	}
}

function readTemplateStringLiteral ( parser ) {
	if ( !parser.matchString( '`' ) ) { return null; }

	var literal = '';
	var done = false;
	var next;
	var parts = [];

	while ( !done ) {
		next = parser.matchPattern( stringMiddlePattern$1 ) || parser.matchPattern( escapeSequencePattern ) ||
			parser.matchString( '$' ) || parser.matchString( '"' );
		if ( next ) {
			if ( next === "\"" ) {
				literal += "\\\"";
			} else if ( next === '\\`' ) {
				literal += '`';
			} else if ( next === '$' ) {
				if ( parser.matchString( '{' ) ) {
					parts.push({ t: STRING_LITERAL, v: getString( literal ) });
					literal = '';

					parser.allowWhitespace();
					var expr = readExpression( parser );

					if ( !expr ) { parser.error( 'Expected valid expression' ); }

					parts.push({ t: BRACKETED, x: expr });

					parser.allowWhitespace();
					if ( !parser.matchString( '}' ) ) { parser.error( "Expected closing '}' after interpolated expression" ); }
				} else {
					literal += '$';
				}
			} else {
				literal += next;
			}
		} else {
			next = parser.matchPattern( lineContinuationPattern );
			if ( next ) {
				// convert \(newline-like) into a \u escape, which is allowed in JSON
				literal += '\\u' + ( '000' + next.charCodeAt(1).toString(16) ).slice( -4 );
			} else {
				done = true;
			}
		}
	}

	if ( literal.length ) { parts.push({ t: STRING_LITERAL, v: getString( literal ) }); }

	if ( !parser.matchString( '`' ) ) { parser.error( "Expected closing '`'" ); }

	if ( parts.length === 1 ) {
		return parts[0];
	} else {
		var result = parts.pop();
		var part;

		while ( part = parts.pop() ) {
			result = {
				t: INFIX_OPERATOR,
				s: '+',
				o: [ part, result ]
			};
		}

		return {
			t: BRACKETED,
			x: result
		};
	}
}

var name = /^[a-zA-Z_$][a-zA-Z_$0-9]*/;
var spreadPattern = /^\s*\.{3}/;
var legalReference = /^(?:[a-zA-Z$_0-9]|\\\.)+(?:(?:\.(?:[a-zA-Z$_0-9]|\\\.)+)|(?:\[[0-9]+\]))*/;
var relaxedName = /^[a-zA-Z_$][-\/a-zA-Z_$0-9]*(?:\.(?:[a-zA-Z_$][-\/a-zA-Z_$0-9]*))*/;

var identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

// http://mathiasbynens.be/notes/javascript-properties
// can be any name, string literal, or number literal
function readKey ( parser ) {
	var token;

	if ( token = readStringLiteral( parser ) ) {
		return identifier.test( token.v ) ? token.v : '"' + token.v.replace( /"/g, '\\"' ) + '"';
	}

	if ( token = readNumberLiteral$1( parser ) ) {
		return token.v;
	}

	if ( token = parser.matchPattern( name ) ) {
		return token;
	}

	return null;
}

function readKeyValuePair ( parser ) {
	var spread;
	var start = parser.pos;

	// allow whitespace between '{' and key
	parser.allowWhitespace();

	var refKey = parser.nextChar() !== '\'' && parser.nextChar() !== '"';
	if ( refKey ) { spread = parser.matchPattern( spreadPattern ); }

	var key = spread ? readExpression( parser ) : readKey( parser );
	if ( key === null ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace between key and ':'
	parser.allowWhitespace();

	// es2015 shorthand property
	if ( refKey && ( parser.nextChar() === ',' || parser.nextChar() === '}' ) ) {
		if ( !spread && !name.test( key ) ) {
			parser.error( ("Expected a valid reference, but found '" + key + "' instead.") );
		}

		var pair = {
			t: KEY_VALUE_PAIR,
			k: key,
			v: {
				t: REFERENCE,
				n: key
			}
		};

		if ( spread ) {
			pair.p = true;
		}

		return pair;
	}


	// next character must be ':'
	if ( !parser.matchString( ':' ) ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace between ':' and value
	parser.allowWhitespace();

	// next expression must be a, well... expression
	var value = readExpression( parser );
	if ( value === null ) {
		parser.pos = start;
		return null;
	}

	return {
		t: KEY_VALUE_PAIR,
		k: key,
		v: value
	};
}

function readKeyValuePairs ( parser ) {
	var start = parser.pos;

	var pair = readKeyValuePair( parser );
	if ( pair === null ) {
		return null;
	}

	var pairs = [ pair ];

	if ( parser.matchString( ',' ) ) {
		var keyValuePairs = readKeyValuePairs( parser );

		if ( !keyValuePairs ) {
			parser.pos = start;
			return null;
		}

		return pairs.concat( keyValuePairs );
	}

	return pairs;
}

var readObjectLiteral = function ( parser ) {
	var start = parser.pos;

	// allow whitespace
	parser.allowWhitespace();

	if ( !parser.matchString( '{' ) ) {
		parser.pos = start;
		return null;
	}

	var keyValuePairs = readKeyValuePairs( parser );

	// allow whitespace between final value and '}'
	parser.allowWhitespace();

	if ( !parser.matchString( '}' ) ) {
		parser.pos = start;
		return null;
	}

	return {
		t: OBJECT_LITERAL,
		m: keyValuePairs
	};
};

var readArrayLiteral = function ( parser ) {
	var start = parser.pos;

	// allow whitespace before '['
	parser.allowWhitespace();

	if ( !parser.matchString( '[' ) ) {
		parser.pos = start;
		return null;
	}

	var expressionList = readExpressionList( parser, true );

	if ( !parser.matchString( ']' ) ) {
		parser.pos = start;
		return null;
	}

	return {
		t: ARRAY_LITERAL,
		m: expressionList
	};
};

function readLiteral ( parser ) {
	return readNumberLiteral$1( parser )         ||
	       readBooleanLiteral( parser )        ||
	       readStringLiteral( parser )         ||
	       readTemplateStringLiteral( parser ) ||
	       readObjectLiteral( parser )         ||
	       readArrayLiteral( parser )          ||
	       readNumberLiteral( parser );
}

// if a reference is a browser global, we don't deference it later, so it needs special treatment
var globals = /^(?:Array|console|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null|Object|Number|String|Boolean)\b/;

// keywords are not valid references, with the exception of `this`
var keywords = /^(?:break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|throw|try|typeof|var|void|while|with)$/;

var prefixPattern = /^(?:\@\.|\@|~\/|(?:\^\^\/(?:\^\^\/)*(?:\.\.\/)*)|(?:\.\.\/)+|\.\/(?:\.\.\/)*|\.)/;
var specials = /^(key|index|keypath|rootpath|this|global|shared|context|event|node|local)/;

function readReference ( parser ) {
	var prefix, name$$1, global, reference, lastDotIndex;

	var startPos = parser.pos;

	prefix = parser.matchPattern( prefixPattern ) || '';
	name$$1 = ( !prefix && parser.relaxedNames && parser.matchPattern( relaxedName ) ) ||
			parser.matchPattern( legalReference );
	var actual = prefix.length + ( ( name$$1 && name$$1.length ) || 0 );

	if ( prefix === '@.' ) {
		prefix = '@';
		if ( name$$1 ) { name$$1 = 'this.' + name$$1; }
		else { name$$1 = 'this'; }
	}

	if ( !name$$1 && prefix ) {
		name$$1 = prefix;
		prefix = '';
	}

	if ( !name$$1 ) {
		return null;
	}

	if ( prefix === '@' ) {
		if ( !specials.test( name$$1 ) ) {
			parser.error( ("Unrecognized special reference @" + name$$1) );
		} else if ( ( ~name$$1.indexOf( 'event' ) || ~name$$1.indexOf( 'node' ) ) && !parser.inEvent ) {
			parser.error( "@event and @node are only valid references within an event directive" );
		} else if ( ~name$$1.indexOf( 'context' ) ) {
			parser.pos = parser.pos - ( name$$1.length - 7 );
			return {
				t: BRACKETED,
				x: {
					t: REFERENCE,
					n: '@context'
				}
			};
		}
	}

	// bug out if it's a keyword (exception for ancestor/restricted refs - see https://github.com/ractivejs/ractive/issues/1497)
	if ( !prefix && !parser.relaxedNames && keywords.test( name$$1 ) ) {
		parser.pos = startPos;
		return null;
	}

	// if this is a browser global, stop here
	if ( !prefix && globals.test( name$$1 ) ) {
		global = globals.exec( name$$1 )[0];
		parser.pos = startPos + global.length;

		return {
			t: GLOBAL,
			v: global
		};
	}

	reference = ( prefix || '' ) + normalise( name$$1 );

	if ( parser.matchString( '(' ) ) {
		// if this is a method invocation (as opposed to a function) we need
		// to strip the method name from the reference combo, else the context
		// will be wrong
		// but only if the reference was actually a member and not a refinement
		lastDotIndex = reference.lastIndexOf( '.' );
		if ( lastDotIndex !== -1 && name$$1[ name$$1.length - 1 ] !== ']' ) {
			var refLength = reference.length;
			reference = reference.substr( 0, lastDotIndex );
			parser.pos = startPos + ( actual - ( refLength - lastDotIndex ) );
		} else {
			parser.pos -= 1;
		}
	}

	return {
		t: REFERENCE,
		n: reference.replace( /^this\./, './' ).replace( /^this$/, '.' )
	};
}

function readBracketedExpression ( parser ) {
	if ( !parser.matchString( '(' ) ) { return null; }

	parser.allowWhitespace();

	var expr = readExpression( parser );

	if ( !expr ) { parser.error( expectedExpression ); }

	parser.allowWhitespace();

	if ( !parser.matchString( ')' ) ) { parser.error( expectedParen ); }

	return {
		t: BRACKETED,
		x: expr
	};
}

var readPrimary = function ( parser ) {
	return readLiteral( parser )
		|| readReference( parser )
		|| readBracketedExpression( parser );
};

function readRefinement ( parser ) {
	// some things call for strict refinement (partial names), meaning no space between reference and refinement
	if ( !parser.strictRefinement ) {
		parser.allowWhitespace();
	}

	// "." name
	if ( parser.matchString( '.' ) ) {
		parser.allowWhitespace();

		var name$$1 = parser.matchPattern( name );
		if ( name$$1 ) {
			return {
				t: REFINEMENT,
				n: name$$1
			};
		}

		parser.error( 'Expected a property name' );
	}

	// "[" expression "]"
	if ( parser.matchString( '[' ) ) {
		parser.allowWhitespace();

		var expr = readExpression( parser );
		if ( !expr ) { parser.error( expectedExpression ); }

		parser.allowWhitespace();

		if ( !parser.matchString( ']' ) ) { parser.error( "Expected ']'" ); }

		return {
			t: REFINEMENT,
			x: expr
		};
	}

	return null;
}

var readMemberOrInvocation = function ( parser ) {
	var expression = readPrimary( parser );

	if ( !expression ) { return null; }

	while ( expression ) {
		var refinement = readRefinement( parser );
		if ( refinement ) {
			expression = {
				t: MEMBER,
				x: expression,
				r: refinement
			};
		}

		else if ( parser.matchString( '(' ) ) {
			parser.allowWhitespace();
			var expressionList = readExpressionList( parser, true );

			parser.allowWhitespace();

			if ( !parser.matchString( ')' ) ) {
				parser.error( expectedParen );
			}

			expression = {
				t: INVOCATION,
				x: expression
			};

			if ( expressionList ) { expression.o = expressionList; }
		}

		else {
			break;
		}
	}

	return expression;
};

var readTypeOf;

var makePrefixSequenceMatcher = function ( symbol, fallthrough ) {
	return function ( parser ) {
		var expression;

		if ( expression = fallthrough( parser ) ) {
			return expression;
		}

		if ( !parser.matchString( symbol ) ) {
			return null;
		}

		parser.allowWhitespace();

		expression = readExpression( parser );
		if ( !expression ) {
			parser.error( expectedExpression );
		}

		return {
			s: symbol,
			o: expression,
			t: PREFIX_OPERATOR
		};
	};
};

// create all prefix sequence matchers, return readTypeOf
(function() {
	var i, len, matcher, fallthrough;

	var prefixOperators = '! ~ + - typeof'.split( ' ' );

	fallthrough = readMemberOrInvocation;
	for ( i = 0, len = prefixOperators.length; i < len; i += 1 ) {
		matcher = makePrefixSequenceMatcher( prefixOperators[i], fallthrough );
		fallthrough = matcher;
	}

	// typeof operator is higher precedence than multiplication, so provides the
	// fallthrough for the multiplication sequence matcher we're about to create
	// (we're skipping void and delete)
	readTypeOf = fallthrough;
}());

var readTypeof = readTypeOf;

var readLogicalOr;

var makeInfixSequenceMatcher = function ( symbol, fallthrough ) {
	return function ( parser ) {
		// > and / have to be quoted
		if ( parser.inUnquotedAttribute && ( symbol === '>' || symbol === '/' ) ) { return fallthrough( parser ); }

		var start, left, right;

		left = fallthrough( parser );
		if ( !left ) {
			return null;
		}

		// Loop to handle left-recursion in a case like `a * b * c` and produce
		// left association, i.e. `(a * b) * c`.  The matcher can't call itself
		// to parse `left` because that would be infinite regress.
		while ( true ) {
			start = parser.pos;

			parser.allowWhitespace();

			if ( !parser.matchString( symbol ) ) {
				parser.pos = start;
				return left;
			}

			// special case - in operator must not be followed by [a-zA-Z_$0-9]
			if ( symbol === 'in' && /[a-zA-Z_$0-9]/.test( parser.remaining().charAt( 0 ) ) ) {
				parser.pos = start;
				return left;
			}

			parser.allowWhitespace();

			// right operand must also consist of only higher-precedence operators
			right = fallthrough( parser );
			if ( !right ) {
				parser.pos = start;
				return left;
			}

			left = {
				t: INFIX_OPERATOR,
				s: symbol,
				o: [ left, right ]
			};

			// Loop back around.  If we don't see another occurrence of the symbol,
			// we'll return left.
		}
	};
};

// create all infix sequence matchers, and return readLogicalOr
(function() {
	var i, len, matcher, fallthrough;

	// All the infix operators on order of precedence (source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Operator_Precedence)
	// Each sequence matcher will initially fall through to its higher precedence
	// neighbour, and only attempt to match if one of the higher precedence operators
	// (or, ultimately, a literal, reference, or bracketed expression) already matched
	var infixOperators = '* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||'.split( ' ' );

	// A typeof operator is higher precedence than multiplication
	fallthrough = readTypeof;
	for ( i = 0, len = infixOperators.length; i < len; i += 1 ) {
		matcher = makeInfixSequenceMatcher( infixOperators[i], fallthrough );
		fallthrough = matcher;
	}

	// Logical OR is the fallthrough for the conditional matcher
	readLogicalOr = fallthrough;
}());

var readLogicalOr$1 = readLogicalOr;

// The conditional operator is the lowest precedence operator, so we start here
function getConditional ( parser ) {
	var expression = readLogicalOr$1( parser );
	if ( !expression ) {
		return null;
	}

	var start = parser.pos;

	parser.allowWhitespace();

	if ( !parser.matchString( '?' ) ) {
		parser.pos = start;
		return expression;
	}

	parser.allowWhitespace();

	var ifTrue = readExpression( parser );
	if ( !ifTrue ) {
		parser.error( expectedExpression );
	}

	parser.allowWhitespace();

	if ( !parser.matchString( ':' ) ) {
		parser.error( 'Expected ":"' );
	}

	parser.allowWhitespace();

	var ifFalse = readExpression( parser );
	if ( !ifFalse ) {
		parser.error( expectedExpression );
	}

	return {
		t: CONDITIONAL,
		o: [ expression, ifTrue, ifFalse ]
	};
}

function readExpression ( parser ) {
	// The conditional operator is the lowest precedence operator (except yield,
	// assignment operators, and commas, none of which are supported), so we
	// start there. If it doesn't match, it 'falls through' to progressively
	// higher precedence operators, until it eventually matches (or fails to
	// match) a 'primary' - a literal or a reference. This way, the abstract syntax
	// tree has everything in its proper place, i.e. 2 + 3 * 4 === 14, not 20.
	return getConditional( parser );
}

function readExpressionList ( parser, spread ) {
	var isSpread;
	var expressions = [];

	var pos = parser.pos;

	do {
		parser.allowWhitespace();

		if ( spread ) {
			isSpread = parser.matchPattern( spreadPattern );
		}

		var expr = readExpression( parser );

		if ( expr === null && expressions.length ) {
			parser.error( expectedExpression );
		} else if ( expr === null ) {
			parser.pos = pos;
			return null;
		}

		if ( isSpread ) {
			expr.p = true;
		}

		expressions.push( expr );

		parser.allowWhitespace();
	} while ( parser.matchString( ',' ) );

	return expressions;
}

function readExpressionOrReference ( parser, expectedFollowers ) {
	var start = parser.pos;
	var expression = readExpression( parser );

	if ( !expression ) {
		// valid reference but invalid expression e.g. `{{new}}`?
		var ref = parser.matchPattern( /^(\w+)/ );
		if ( ref ) {
			return {
				t: REFERENCE,
				n: ref
			};
		}

		return null;
	}

	for ( var i = 0; i < expectedFollowers.length; i += 1 ) {
		if ( parser.remaining().substr( 0, expectedFollowers[i].length ) === expectedFollowers[i] ) {
			return expression;
		}
	}

	parser.pos = start;
	return readReference( parser );
}

function flattenExpression ( expression ) {
	var refs;
	var count = 0;

	extractRefs( expression, refs = [] );
	var stringified = stringify( expression );

	return {
		r: refs,
		s: getVars(stringified)
	};

	function getVars(expr) {
		var vars = [];
		for ( var i = count - 1; i >= 0; i-- ) {
			vars.push( ("x$" + i) );
		}
		return vars.length ? ("(function(){var " + (vars.join(',')) + ";return(" + expr + ");})()") : expr;
	}

	function stringify ( node ) {
		if ( typeof node === 'string' ) {
			return node;
		}

		switch ( node.t ) {
			case BOOLEAN_LITERAL:
			case GLOBAL:
			case NUMBER_LITERAL:
			case REGEXP_LITERAL:
				return node.v;

			case STRING_LITERAL:
				return JSON.stringify( String( node.v ) );

			case ARRAY_LITERAL:
				if ( node.m && hasSpread( node.m )) {
					return ("[].concat(" + (makeSpread( node.m, '[', ']', stringify )) + ")");
				} else {
					return '[' + ( node.m ? node.m.map( stringify ).join( ',' ) : '' ) + ']';
				}

			case OBJECT_LITERAL:
				if ( node.m && hasSpread( node.m ) ) {
					return ("Object.assign({}," + (makeSpread( node.m, '{', '}', stringifyPair)) + ")");
				} else {
					return '{' + ( node.m ? node.m.map( function (n) { return ((n.k) + ":" + (stringify( n.v ))); } ).join( ',' ) : '' ) + '}';
				}

			case PREFIX_OPERATOR:
				return ( node.s === 'typeof' ? 'typeof ' : node.s ) + stringify( node.o );

			case INFIX_OPERATOR:
				return stringify( node.o[0] ) + ( node.s.substr( 0, 2 ) === 'in' ? ' ' + node.s + ' ' : node.s ) + stringify( node.o[1] );

			case INVOCATION:
				if ( node.o && hasSpread( node.o ) ) {
					var id = count++;
					return ("(x$" + id + "=" + (stringify(node.x)) + ").apply(x$" + id + "," + (stringify({ t: ARRAY_LITERAL, m: node.o })) + ")");
				} else {
					return stringify( node.x ) + '(' + ( node.o ? node.o.map( stringify ).join( ',' ) : '' ) + ')';
				}

			case BRACKETED:
				return '(' + stringify( node.x ) + ')';

			case MEMBER:
				return stringify( node.x ) + stringify( node.r );

			case REFINEMENT:
				return ( node.n ? '.' + node.n : '[' + stringify( node.x ) + ']' );

			case CONDITIONAL:
				return stringify( node.o[0] ) + '?' + stringify( node.o[1] ) + ':' + stringify( node.o[2] );

			case REFERENCE:
				return '_' + refs.indexOf( node.n );

			default:
				throw new Error( 'Expected legal JavaScript' );
		}
	}

	function stringifyPair ( node ) { return node.p ? stringify( node.k ) : ((node.k) + ":" + (stringify( node.v ))); }

	function makeSpread ( list, open, close, fn ) {
		var out = list.reduce( function ( a, c ) {
			if ( c.p ) {
				a.str += "" + (a.open ? close + ',' : a.str.length ? ',' : '') + (fn( c ));
			} else {
				a.str += "" + (!a.str.length ? open : !a.open ? ',' + open : ',') + (fn( c ));
			}
			a.open = !c.p;
			return a;
		}, { open: false, str: '' } );
		if ( out.open ) { out.str += close; }
		return out.str;
	}
}

function hasSpread ( list ) {
	for ( var i = 0; i < list.length; i++ ) {
		if ( list[i].p ) { return true; }
	}

	return false;
}

// TODO maybe refactor this?
function extractRefs ( node, refs ) {
	if ( node.t === REFERENCE && typeof node.n === 'string' ) {
		if ( !~refs.indexOf( node.n ) ) {
			refs.unshift( node.n );
		}
	}

	var list = node.o || node.m;
	if ( list ) {
		if ( isObject( list ) ) {
			extractRefs( list, refs );
		} else {
			var i = list.length;
			while ( i-- ) {
				extractRefs( list[i], refs );
			}
		}
	}

	if ( node.k && node.t === KEY_VALUE_PAIR && typeof node.k !== 'string' ) {
		extractRefs( node.k, refs );
	}

	if ( node.x ) {
		extractRefs( node.x, refs );
	}

	if ( node.r ) {
		extractRefs( node.r, refs );
	}

	if ( node.v ) {
		extractRefs( node.v, refs );
	}
}

function refineExpression ( expression, mustache ) {
	var referenceExpression;

	if ( expression ) {
		while ( expression.t === BRACKETED && expression.x ) {
			expression = expression.x;
		}

		if ( expression.t === REFERENCE ) {
			var n = expression.n;
			if ( !~n.indexOf( '@context' ) ) {
				mustache.r = expression.n;
			} else {
				mustache.x = flattenExpression( expression );
			}
		} else {
			if ( referenceExpression = getReferenceExpression( expression ) ) {
				mustache.rx = referenceExpression;
			} else {
				mustache.x = flattenExpression( expression );
			}
		}

		return mustache;
	}
}

// TODO refactor this! it's bewildering
function getReferenceExpression ( expression ) {
	var members = [];
	var refinement;

	while ( expression.t === MEMBER && expression.r.t === REFINEMENT ) {
		refinement = expression.r;

		if ( refinement.x ) {
			if ( refinement.x.t === REFERENCE ) {
				members.unshift( refinement.x );
			} else {
				members.unshift( flattenExpression( refinement.x ) );
			}
		} else {
			members.unshift( refinement.n );
		}

		expression = expression.x;
	}

	if ( expression.t !== REFERENCE ) {
		return null;
	}

	return {
		r: expression.n,
		m: members
	};
}

var attributeNamePattern = /^[^\s"'>\/=]+/;
var onPattern = /^on/;
var eventPattern = /^on-([a-zA-Z\*\.$_]((?:[a-zA-Z\*\.$_0-9\-]|\\-)+))$/;
var reservedEventNames = /^(?:change|reset|teardown|update|construct|config|init|render|complete|unrender|detach|insert|destruct|attachchild|detachchild)$/;
var decoratorPattern = /^as-([a-z-A-Z][-a-zA-Z_0-9]*)$/;
var transitionPattern = /^([a-zA-Z](?:(?!-in-out)[-a-zA-Z_0-9])*)-(in|out|in-out)$/;
var boundPattern = /^((bind|class)-(([-a-zA-Z0-9_])+))$/;
var directives = {
	lazy: { t: BINDING_FLAG, v: 'l' },
	twoway: { t: BINDING_FLAG, v: 't' },
	'no-delegation': { t: DELEGATE_FLAG }
};
var unquotedAttributeValueTextPattern = /^[^\s"'=<>\/`]+/;
var proxyEvent = /^[^\s"'=<>@\[\]()]*/;
var whitespace = /^\s+/;

var slashes = /\\/g;
function splitEvent ( str ) {
	var result = [];
	var s = 0;

	for ( var i = 0; i < str.length; i++ ) {
		if ( str[i] === '-' && str[ i - 1 ] !== '\\' ) {
			result.push( str.substring( s, i ).replace( slashes, '' ) );
			s = i + 1;
		}
	}

	result.push( str.substring( s ).replace( slashes, '' ) );

	return result;
}

function readAttribute ( parser ) {
	var name, i, nearest, idx;

	parser.allowWhitespace();

	name = parser.matchPattern( attributeNamePattern );
	if ( !name ) {
		return null;
	}

	// check for accidental delimiter consumption e.g. <tag bool{{>attrs}} />
	nearest = name.length;
	for ( i = 0; i < parser.tags.length; i++ ) {
		if ( ~( idx = name.indexOf( parser.tags[ i ].open ) ) ) {
			if ( idx < nearest ) { nearest = idx; }
		}
	}
	if ( nearest < name.length ) {
		parser.pos -= name.length - nearest;
		name = name.substr( 0, nearest );
		if ( !name ) { return null; }
	}

	return { n: name };
}

function readAttributeValue ( parser ) {
	var start = parser.pos;

	// next character must be `=`, `/`, `>` or whitespace
	if ( !/[=\/>\s]/.test( parser.nextChar() ) ) {
		parser.error( 'Expected `=`, `/`, `>` or whitespace' );
	}

	parser.allowWhitespace();

	if ( !parser.matchString( '=' ) ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	var valueStart = parser.pos;
	var startDepth = parser.sectionDepth;

	var value = readQuotedAttributeValue( parser, "'" ) ||
			readQuotedAttributeValue( parser, "\"" ) ||
			readUnquotedAttributeValue( parser );

	if ( value === null ) {
		parser.error( 'Expected valid attribute value' );
	}

	if ( parser.sectionDepth !== startDepth ) {
		parser.pos = valueStart;
		parser.error( 'An attribute value must contain as many opening section tags as closing section tags' );
	}

	if ( !value.length ) {
		return '';
	}

	if ( value.length === 1 && typeof value[0] === 'string' ) {
		return decodeCharacterReferences( value[0] );
	}

	return value;
}

function readUnquotedAttributeValueToken ( parser ) {
	var text, index;

	var start = parser.pos;

	text = parser.matchPattern( unquotedAttributeValueTextPattern );

	if ( !text ) {
		return null;
	}

	var haystack = text;
	var needles = parser.tags.map( function (t) { return t.open; } ); // TODO refactor... we do this in readText.js as well

	if ( ( index = getLowestIndex( haystack, needles ) ) !== -1 ) {
		text = text.substr( 0, index );
		parser.pos = start + text.length;
	}

	return text;
}

function readUnquotedAttributeValue ( parser ) {
	parser.inAttribute = true;

	var tokens = [];

	var token = readMustache( parser ) || readUnquotedAttributeValueToken( parser );
	while ( token ) {
		tokens.push( token );
		token = readMustache( parser ) || readUnquotedAttributeValueToken( parser );
	}

	if ( !tokens.length ) {
		return null;
	}

	parser.inAttribute = false;
	return tokens;
}

function readQuotedAttributeValue ( parser, quoteMark ) {
	var start = parser.pos;

	if ( !parser.matchString( quoteMark ) ) {
		return null;
	}

	parser.inAttribute = quoteMark;

	var tokens = [];

	var token = readMustache( parser ) || readQuotedStringToken( parser, quoteMark );
	while ( token !== null ) {
		tokens.push( token );
		token = readMustache( parser ) || readQuotedStringToken( parser, quoteMark );
	}

	if ( !parser.matchString( quoteMark ) ) {
		parser.pos = start;
		return null;
	}

	parser.inAttribute = false;

	return tokens;
}

function readQuotedStringToken ( parser, quoteMark ) {
	var haystack = parser.remaining();

	var needles = parser.tags.map( function (t) { return t.open; } ); // TODO refactor... we do this in readText.js as well
	needles.push( quoteMark );

	var index = getLowestIndex( haystack, needles );

	if ( index === -1 ) {
		parser.error( 'Quoted attribute value must have a closing quote' );
	}

	if ( !index ) {
		return null;
	}

	parser.pos += index;
	return haystack.substr( 0, index );
}

function readAttributeOrDirective ( parser ) {
	var match, directive;

	var attribute = readAttribute( parser, false );

	if ( !attribute ) { return null; }

		// lazy, twoway
	if ( directive = directives[ attribute.n ] ) {
		attribute.t = directive.t;
		if ( directive.v ) { attribute.v = directive.v; }
		delete attribute.n; // no name necessary
		parser.allowWhitespace();
		if ( parser.nextChar() === '=' ) { attribute.f = readAttributeValue( parser ); }
	}

		// decorators
	else if ( match = decoratorPattern.exec( attribute.n ) ) {
		attribute.n = match[1];
		attribute.t = DECORATOR;
		readArguments( parser, attribute );
	}

		// transitions
	else if ( match = transitionPattern.exec( attribute.n ) ) {
		attribute.n = match[1];
		attribute.t = TRANSITION;
		readArguments( parser, attribute );
		attribute.v = match[2] === 'in-out' ? 't0' : match[2] === 'in' ? 't1' : 't2';
	}

		// on-click etc
	else if ( match = eventPattern.exec( attribute.n ) ) {
		attribute.n = splitEvent( match[1] );
		attribute.t = EVENT;

		parser.inEvent = true;

			// check for a proxy event
		if ( !readProxyEvent( parser, attribute ) ) {
				// otherwise, it's an expression
			readArguments( parser, attribute, true );
		} else if ( reservedEventNames.test( attribute.f ) ) {
			parser.pos -= attribute.f.length;
			parser.error( 'Cannot use reserved event names (change, reset, teardown, update, construct, config, init, render, unrender, complete, detach, insert, destruct, attachchild, detachchild)' );
		}

		parser.inEvent = false;
	}

		// bound directives
	else if ( match = boundPattern.exec( attribute.n ) ){
		var bind = match[2] === 'bind';
		attribute.n = bind ? match[3] : match[1];
		attribute.t = ATTRIBUTE;
		readArguments( parser, attribute, false, true );

		if ( !attribute.f && bind ) {
			attribute.f = [{ t: INTERPOLATOR, r: match[3] }];
		}
	}

	else {
		parser.allowWhitespace();
		var value = parser.nextChar() === '=' ? readAttributeValue( parser ) : null;
		attribute.f = value != null ? value : attribute.f;

		if ( parser.sanitizeEventAttributes && onPattern.test( attribute.n ) ) {
			return { exclude: true };
		} else {
			attribute.f = attribute.f || ( attribute.f === '' ? '' : 0 );
			attribute.t = ATTRIBUTE;
		}
	}

	return attribute;
}

function readProxyEvent ( parser, attribute ) {
	var start = parser.pos;
	if ( !parser.matchString( '=' ) ) { parser.error( "Missing required directive arguments" ); }

	var quote = parser.matchString( "'" ) || parser.matchString( "\"" );
	parser.allowWhitespace();
	var proxy = parser.matchPattern( proxyEvent );

	if ( proxy !== undefined ) {
		if ( quote ) {
			parser.allowWhitespace();
			if ( !parser.matchString( quote ) ) { parser.pos = start; }
			else { return ( attribute.f = proxy ) || true; }
		} else if ( !parser.matchPattern( whitespace ) ) {
			parser.pos = start;
		} else {
			return ( attribute.f = proxy ) || true;
		}
	} else {
		parser.pos = start;
	}
}

function readArguments ( parser, attribute, required, single ) {
	if ( required === void 0 ) required = false;
	if ( single === void 0 ) single = false;

	parser.allowWhitespace();
	if ( !parser.matchString( '=' ) ) {
		if ( required ) { parser.error( "Missing required directive arguments" ); }
		return;
	}
	parser.allowWhitespace();

	var quote = parser.matchString( '"' ) || parser.matchString( "'" );
	var spread = parser.spreadArgs;
	parser.spreadArgs = true;
	parser.inUnquotedAttribute = !quote;
	var expr = single ? readExpressionOrReference( parser, [ quote || ' ', '/', '>' ] ) : { m: readExpressionList( parser ), t: ARRAY_LITERAL };
	parser.inUnquotedAttribute = false;
	parser.spreadArgs = spread;

	if ( quote ) {
		parser.allowWhitespace();
		if ( parser.matchString( quote ) !== quote ) { parser.error( ("Expected matching quote '" + quote + "'") ); }
	}

	if ( single ) {
		var interpolator = { t: INTERPOLATOR };
		refineExpression( expr, interpolator );
		attribute.f = [interpolator];
	} else {
		attribute.f = flattenExpression( expr );
	}
}

var delimiterChangeToken = { t: DELIMCHANGE, exclude: true };

function readMustache ( parser ) {
	var mustache, i;

	// If we're inside a <script> or <style> tag, and we're not
	// interpolating, bug out
	if ( parser.interpolate[ parser.inside ] === false ) {
		return null;
	}

	for ( i = 0; i < parser.tags.length; i += 1 ) {
		if ( mustache = readMustacheOfType( parser, parser.tags[i] ) ) {
			return mustache;
		}
	}

	if ( parser.inTag && !parser.inAttribute ) {
		mustache = readAttributeOrDirective( parser );
		if ( mustache ) {
			parser.allowWhitespace();
			return mustache;
		}
	}
}

function readMustacheOfType ( parser, tag ) {
	var mustache, reader, i;

	var start = parser.pos;

	if ( parser.matchString( '\\' + tag.open ) ) {
		if ( start === 0 || parser.str[ start - 1 ] !== '\\' ) {
			return tag.open;
		}
	} else if ( !parser.matchString( tag.open ) ) {
		return null;
	}

	// delimiter change?
	if ( mustache = readDelimiterChange( parser ) ) {
		// find closing delimiter or abort...
		if ( !parser.matchString( tag.close ) ) {
			return null;
		}

		// ...then make the switch
		tag.open = mustache[0];
		tag.close = mustache[1];
		parser.sortMustacheTags();

		return delimiterChangeToken;
	}

	parser.allowWhitespace();

	// illegal section closer
	if ( parser.matchString( '/' ) ) {
		parser.pos -= 1;
		var rewind = parser.pos;
		if ( !readNumberLiteral( parser ) ) {
			parser.pos = rewind - ( tag.close.length );
			if ( parser.inAttribute ) {
				parser.pos = start;
				return null;
			} else {
				parser.error( 'Attempted to close a section that wasn\'t open' );
			}
		} else {
			parser.pos = rewind;
		}
	}

	for ( i = 0; i < tag.readers.length; i += 1 ) {
		reader = tag.readers[i];

		if ( mustache = reader( parser, tag ) ) {
			if ( tag.isStatic ) {
				mustache.s = 1;
			}

			if ( parser.includeLinePositions ) {
				mustache.p = parser.getLinePos( start );
			}

			return mustache;
		}
	}

	parser.pos = start;
	return null;
}

function readTriple ( parser, tag ) {
	var expression = readExpression( parser );

	if ( !expression ) {
		return null;
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
	}

	var triple = { t: TRIPLE };
	refineExpression( expression, triple ); // TODO handle this differently - it's mysterious

	return triple;
}

function readUnescaped ( parser, tag ) {
	if ( !parser.matchString( '&' ) ) {
		return null;
	}

	parser.allowWhitespace();

	var expression = readExpression( parser );

	if ( !expression ) {
		return null;
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
	}

	var triple = { t: TRIPLE };
	refineExpression( expression, triple ); // TODO handle this differently - it's mysterious

	return triple;
}

var legalAlias = /^(?:[a-zA-Z$_0-9]|\\\.)+(?:(?:(?:[a-zA-Z$_0-9]|\\\.)+)|(?:\[[0-9]+\]))*/;
var asRE = /^as/i;

function readAliases( parser ) {
	var aliases = [];
	var alias;
	var start = parser.pos;

	parser.allowWhitespace();

	alias = readAlias( parser );

	if ( alias ) {
		alias.x = refineExpression( alias.x, {} );
		aliases.push( alias );

		parser.allowWhitespace();

		while ( parser.matchString(',') ) {
			alias = readAlias( parser );

			if ( !alias ) {
				parser.error( 'Expected another alias.' );
			}

			alias.x = refineExpression( alias.x, {} );
			aliases.push( alias );

			parser.allowWhitespace();
		}

		return aliases;
	}

	parser.pos = start;
	return null;
}

function readAlias( parser ) {
	var start = parser.pos;

	parser.allowWhitespace();

	var expr = readExpression( parser, [] );

	if ( !expr ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	if ( !parser.matchPattern( asRE ) ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	var alias = parser.matchPattern( legalAlias );

	if ( !alias ) {
		parser.error( 'Expected a legal alias name.' );
	}

	return { n: alias, x: expr };
}

function readPartial ( parser, tag ) {
	var type = parser.matchString( '>' ) || parser.matchString( 'yield' );
	var partial = { t: type === '>' ? PARTIAL : YIELDER };
	var aliases;

	if ( !type ) { return null; }

	parser.allowWhitespace();

	if ( type === '>' || !( aliases = parser.matchString( 'with' ) ) ) {
		// Partial names can include hyphens, so we can't use readExpression
		// blindly. Instead, we use the `relaxedNames` flag to indicate that
		// `foo-bar` should be read as a single name, rather than 'subtract
		// bar from foo'
		parser.relaxedNames = parser.strictRefinement = true;
		var expression = readExpression( parser );
		parser.relaxedNames = parser.strictRefinement = false;

		if ( !expression && type === '>' ) { return null; }

		if ( expression ) {
			refineExpression( expression, partial ); // TODO...
			parser.allowWhitespace();
			if ( type !== '>' ) { aliases = parser.matchString( 'with' ); }
		}
	}

	parser.allowWhitespace();

	// check for alias context e.g. `{{>foo bar as bat, bip as bop}}`
	if ( aliases || type === '>' ) {
		aliases = readAliases( parser );
		if ( aliases && aliases.length ) {
			partial.z = aliases;
		}

		// otherwise check for literal context e.g. `{{>foo bar}}` then
		// turn it into `{{#with bar}}{{>foo}}{{/with}}`
		else if ( type === '>' ) {
			var context = readExpression( parser );
			if ( context) {
				partial.c = {};
				refineExpression( context, partial.c );
			}
		}

		else {
			// {{yield with}} requires some aliases
			parser.error( "Expected one or more aliases" );
		}
	}

	parser.allowWhitespace();

	if ( !parser.matchString( tag.close ) ) {
		parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
	}

	return partial;
}

function readComment ( parser, tag ) {
	if ( !parser.matchString( '!' ) ) {
		return null;
	}

	var index = parser.remaining().indexOf( tag.close );

	if ( index !== -1 ) {
		parser.pos += index + tag.close.length;
		return { t: COMMENT };
	}
}

function readInterpolator ( parser, tag ) {
	var expression, err;

	var start = parser.pos;

	// TODO would be good for perf if we could do away with the try-catch
	try {
		expression = readExpressionOrReference( parser, [ tag.close ] );
	} catch ( e ) {
		err = e;
	}

	if ( !expression ) {
		if ( parser.str.charAt( start ) === '!' ) {
			// special case - comment
			parser.pos = start;
			return null;
		}

		if ( err ) {
			throw err;
		}
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( ("Expected closing delimiter '" + (tag.close) + "' after reference") );

		if ( !expression ) {
			// special case - comment
			if ( parser.nextChar() === '!' ) {
				return null;
			}

			parser.error( "Expected expression or legal reference" );
		}
	}

	var interpolator = { t: INTERPOLATOR };
	refineExpression( expression, interpolator ); // TODO handle this differently - it's mysterious

	return interpolator;
}

function readClosing ( parser, tag ) {
	var start = parser.pos;

	if ( !parser.matchString( tag.open ) ) {
		return null;
	}

	parser.allowWhitespace();

	if ( !parser.matchString( '/' ) ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	var remaining = parser.remaining();
	var index = remaining.indexOf( tag.close );

	if ( index !== -1 ) {
		var closing = {
			t: CLOSING,
			r: remaining.substr( 0, index ).split( ' ' )[0]
		};

		parser.pos += index;

		if ( !parser.matchString( tag.close ) ) {
			parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
		}

		return closing;
	}

	parser.pos = start;
	return null;
}

var elsePattern = /^\s*else\s*/;

function readElse ( parser, tag ) {
	var start = parser.pos;

	if ( !parser.matchString( tag.open ) ) {
		return null;
	}

	if ( !parser.matchPattern( elsePattern ) ) {
		parser.pos = start;
		return null;
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
	}

	return {
		t: ELSE
	};
}

var elsePattern$1 = /^\s*elseif\s+/;

function readElseIf ( parser, tag ) {
	var start = parser.pos;

	if ( !parser.matchString( tag.open ) ) {
		return null;
	}

	if ( !parser.matchPattern( elsePattern$1 ) ) {
		parser.pos = start;
		return null;
	}

	var expression = readExpression( parser );

	if ( !parser.matchString( tag.close ) ) {
		parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
	}

	return {
		t: ELSEIF,
		x: expression
	};
}

var handlebarsBlockCodes = {
	each:    SECTION_EACH,
	if:      SECTION_IF,
	with:    SECTION_IF_WITH,
	unless:  SECTION_UNLESS
};

var indexRefPattern = /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/;
var keyIndexRefPattern = /^\s*,\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/;
var handlebarsBlockPattern = new RegExp( '^(' + Object.keys( handlebarsBlockCodes ).join( '|' ) + ')\\b' );

function readSection ( parser, tag ) {
	var expression, section, child, children, hasElse, block, unlessBlock, closed, i, expectedClose;
	var aliasOnly = false;

	var start = parser.pos;

	if ( parser.matchString( '^' ) ) {
		// watch out for parent context refs - {{^^/^^/foo}}
		if ( parser.matchString( '^/' ) ){
			parser.pos = start;
			return null;
		}
		section = { t: SECTION, f: [], n: SECTION_UNLESS };
	} else if ( parser.matchString( '#' ) ) {
		section = { t: SECTION, f: [] };

		if ( parser.matchString( 'partial' ) ) {
			parser.pos = start - parser.standardDelimiters[0].length;
			parser.error( 'Partial definitions can only be at the top level of the template, or immediately inside components' );
		}

		if ( block = parser.matchPattern( handlebarsBlockPattern ) ) {
			expectedClose = block;
			section.n = handlebarsBlockCodes[ block ];
		}
	} else {
		return null;
	}

	parser.allowWhitespace();

	if ( block === 'with' ) {
		var aliases = readAliases( parser );
		if ( aliases ) {
			aliasOnly = true;
			section.z = aliases;
			section.t = ALIAS;
		}
	} else if ( block === 'each' ) {
		var alias = readAlias( parser );
		if ( alias ) {
			section.z = [ { n: alias.n, x: { r: '.' } } ];
			expression = alias.x;
		}
	}

	if ( !aliasOnly ) {
		if ( !expression ) { expression = readExpression( parser ); }

		if ( !expression ) {
			parser.error( 'Expected expression' );
		}

		// optional index and key references
		if ( i = parser.matchPattern( indexRefPattern ) ) {
			var extra;

			if ( extra = parser.matchPattern( keyIndexRefPattern ) ) {
				section.i = i + ',' + extra;
			} else {
				section.i = i;
			}
		}

		if ( !block && expression.n ) {
			expectedClose = expression.n;
		}
	}

	parser.allowWhitespace();

	if ( !parser.matchString( tag.close ) ) {
		parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
	}

	parser.sectionDepth += 1;
	children = section.f;

	var pos;
	do {
		pos = parser.pos;
		if ( child = readClosing( parser, tag ) ) {
			if ( expectedClose && child.r !== expectedClose ) {
				if ( !block ) {
					if ( child.r ) { parser.warn( ("Expected " + (tag.open) + "/" + expectedClose + (tag.close) + " but found " + (tag.open) + "/" + (child.r) + (tag.close)) ); }
				} else {
					parser.pos = pos;
					parser.error( ("Expected " + (tag.open) + "/" + expectedClose + (tag.close)) );
				}
			}

			parser.sectionDepth -= 1;
			closed = true;
		}

		else if ( !aliasOnly && ( child = readElseIf( parser, tag ) ) ) {
			if ( section.n === SECTION_UNLESS ) {
				parser.error( '{{else}} not allowed in {{#unless}}' );
			}

			if ( hasElse ) {
				parser.error( 'illegal {{elseif...}} after {{else}}' );
			}

			if ( !unlessBlock ) {
				unlessBlock = [];
			}

			var mustache = {
				t: SECTION,
				n: SECTION_IF,
				f: children = []
			};
			refineExpression( child.x, mustache );

			unlessBlock.push( mustache );
		}

		else if ( !aliasOnly && ( child = readElse( parser, tag ) ) ) {
			if ( section.n === SECTION_UNLESS ) {
				parser.error( '{{else}} not allowed in {{#unless}}' );
			}

			if ( hasElse ) {
				parser.error( 'there can only be one {{else}} block, at the end of a section' );
			}

			hasElse = true;

			// use an unless block if there's no elseif
			if ( !unlessBlock ) {
				unlessBlock = [];
			}

			unlessBlock.push({
				t: SECTION,
				n: SECTION_UNLESS,
				f: children = []
			});
		}

		else {
			child = parser.read( READERS );

			if ( !child ) {
				break;
			}

			children.push( child );
		}
	} while ( !closed );

	if ( unlessBlock ) {
		section.l = unlessBlock;
	}

	if ( !aliasOnly ) {
		refineExpression( expression, section );
	}

	// TODO if a section is empty it should be discarded. Don't do
	// that here though - we need to clean everything up first, as
	// it may contain removeable whitespace. As a temporary measure,
	// to pass the existing tests, remove empty `f` arrays
	if ( !section.f.length ) {
		delete section.f;
	}

	return section;
}

var OPEN_COMMENT = '<!--';
var CLOSE_COMMENT = '-->';

function readHtmlComment ( parser ) {
	var start = parser.pos;

	if ( parser.textOnlyMode || !parser.matchString( OPEN_COMMENT ) ) {
		return null;
	}

	var remaining = parser.remaining();
	var endIndex = remaining.indexOf( CLOSE_COMMENT );

	if ( endIndex === -1 ) {
		parser.error( 'Illegal HTML - expected closing comment sequence (\'-->\')' );
	}

	var content = remaining.substr( 0, endIndex );
	parser.pos += endIndex + 3;

	var comment = {
		t: COMMENT,
		c: content
	};

	if ( parser.includeLinePositions ) {
		comment.p = parser.getLinePos( start );
	}

	return comment;
}

var leadingLinebreak = /^[ \t\f\r\n]*\r?\n/;
var trailingLinebreak = /\r?\n[ \t\f\r\n]*$/;

var stripStandalones = function ( items ) {
	var i, current, backOne, backTwo, lastSectionItem;

	for ( i=1; i<items.length; i+=1 ) {
		current = items[i];
		backOne = items[i-1];
		backTwo = items[i-2];

		// if we're at the end of a [text][comment][text] sequence...
		if ( isString( current ) && isComment( backOne ) && isString( backTwo ) ) {

			// ... and the comment is a standalone (i.e. line breaks either side)...
			if ( trailingLinebreak.test( backTwo ) && leadingLinebreak.test( current ) ) {

				// ... then we want to remove the whitespace after the first line break
				items[i-2] = backTwo.replace( trailingLinebreak, '\n' );

				// and the leading line break of the second text token
				items[i] = current.replace( leadingLinebreak, '' );
			}
		}

		// if the current item is a section, and it is preceded by a linebreak, and
		// its first item is a linebreak...
		if ( isSection( current ) && isString( backOne ) ) {
			if ( trailingLinebreak.test( backOne ) && isString( current.f[0] ) && leadingLinebreak.test( current.f[0] ) ) {
				items[i-1] = backOne.replace( trailingLinebreak, '\n' );
				current.f[0] = current.f[0].replace( leadingLinebreak, '' );
			}
		}

		// if the last item was a section, and it is followed by a linebreak, and
		// its last item is a linebreak...
		if ( isString( current ) && isSection( backOne ) ) {
			lastSectionItem = lastItem( backOne.f );

			if ( isString( lastSectionItem ) && trailingLinebreak.test( lastSectionItem ) && leadingLinebreak.test( current ) ) {
				backOne.f[ backOne.f.length - 1 ] = lastSectionItem.replace( trailingLinebreak, '\n' );
				items[i] = current.replace( leadingLinebreak, '' );
			}
		}
	}

	return items;
};

function isString ( item ) {
	return typeof item === 'string';
}

function isComment ( item ) {
	return item.t === COMMENT || item.t === DELIMCHANGE;
}

function isSection ( item ) {
	return ( item.t === SECTION || item.t === INVERTED ) && item.f;
}

var trimWhitespace = function ( items, leadingPattern, trailingPattern ) {
	var item;

	if ( leadingPattern ) {
		item = items[0];
		if ( typeof item === 'string' ) {
			item = item.replace( leadingPattern, '' );

			if ( !item ) {
				items.shift();
			} else {
				items[0] = item;
			}
		}
	}

	if ( trailingPattern ) {
		item = lastItem( items );
		if ( typeof item === 'string' ) {
			item = item.replace( trailingPattern, '' );

			if ( !item ) {
				items.pop();
			} else {
				items[ items.length - 1 ] = item;
			}
		}
	}
};

var contiguousWhitespace = /[ \t\f\r\n]+/g;
var preserveWhitespaceElements = /^(?:pre|script|style|textarea)$/i;
var leadingWhitespace$1 = /^[ \t\f\r\n]+/;
var trailingWhitespace = /[ \t\f\r\n]+$/;
var leadingNewLine = /^(?:\r\n|\r|\n)/;
var trailingNewLine = /(?:\r\n|\r|\n)$/;

function cleanup ( items, stripComments, preserveWhitespace, removeLeadingWhitespace, removeTrailingWhitespace ) {
	if ( typeof items === 'string' ) { return; }

	var i,
		item,
		previousItem,
		nextItem,
		preserveWhitespaceInsideFragment,
		removeLeadingWhitespaceInsideFragment,
		removeTrailingWhitespaceInsideFragment;

	// First pass - remove standalones and comments etc
	stripStandalones( items );

	i = items.length;
	while ( i-- ) {
		item = items[i];

		// Remove delimiter changes, unsafe elements etc
		if ( item.exclude ) {
			items.splice( i, 1 );
		}

		// Remove comments, unless we want to keep them
		else if ( stripComments && item.t === COMMENT ) {
			items.splice( i, 1 );
		}
	}

	// If necessary, remove leading and trailing whitespace
	trimWhitespace( items, removeLeadingWhitespace ? leadingWhitespace$1 : null, removeTrailingWhitespace ? trailingWhitespace : null );

	i = items.length;
	while ( i-- ) {
		item = items[i];

		// Recurse
		if ( item.f ) {
			var isPreserveWhitespaceElement = item.t === ELEMENT && preserveWhitespaceElements.test( item.e );
			preserveWhitespaceInsideFragment = preserveWhitespace || isPreserveWhitespaceElement;

			if ( !preserveWhitespace && isPreserveWhitespaceElement ) {
				trimWhitespace( item.f, leadingNewLine, trailingNewLine );
			}

			if ( !preserveWhitespaceInsideFragment ) {
				previousItem = items[ i - 1 ];
				nextItem = items[ i + 1 ];

				// if the previous item was a text item with trailing whitespace,
				// remove leading whitespace inside the fragment
				if ( !previousItem || ( typeof previousItem === 'string' && trailingWhitespace.test( previousItem ) ) ) {
					removeLeadingWhitespaceInsideFragment = true;
				}

				// and vice versa
				if ( !nextItem || ( typeof nextItem === 'string' && leadingWhitespace$1.test( nextItem ) ) ) {
					removeTrailingWhitespaceInsideFragment = true;
				}
			}

			cleanup( item.f, stripComments, preserveWhitespaceInsideFragment, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
		}

		// Split if-else blocks into two (an if, and an unless)
		if ( item.l ) {
			cleanup( item.l, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );

			item.l.forEach( function (s) { return s.l = 1; } );
			item.l.unshift( i + 1, 0 );
			items.splice.apply( items, item.l );
			delete item.l; // TODO would be nice if there was a way around this
		}

		// Clean up conditional attributes
		if ( item.m ) {
			cleanup( item.m, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
			if ( item.m.length < 1 ) { delete item.m; }
		}
	}

	// final pass - fuse text nodes together
	i = items.length;
	while ( i-- ) {
		if ( typeof items[i] === 'string' ) {
			if ( typeof items[i+1] === 'string' ) {
				items[i] = items[i] + items[i+1];
				items.splice( i + 1, 1 );
			}

			if ( !preserveWhitespace ) {
				items[i] = items[i].replace( contiguousWhitespace, ' ' );
			}

			if ( items[i] === '' ) {
				items.splice( i, 1 );
			}
		}
	}
}

var closingTagPattern = /^([a-zA-Z]{1,}:?[a-zA-Z0-9\-]*)\s*\>/;

function readClosingTag ( parser ) {
	var tag;

	var start = parser.pos;

	// are we looking at a closing tag?
	if ( !parser.matchString( '</' ) ) {
		return null;
	}

	if ( tag = parser.matchPattern( closingTagPattern ) ) {
		if ( parser.inside && tag !== parser.inside ) {
			parser.pos = start;
			return null;
		}

		return {
			t: CLOSING_TAG,
			e: tag
		};
	}

	// We have an illegal closing tag, report it
	parser.pos -= 2;
	parser.error( 'Illegal closing tag' );
}

var tagNamePattern = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;
var anchorPattern = /^[a-zA-Z_$][-a-zA-Z0-9_$]*/;
var validTagNameFollower = /^[\s\n\/>]/;
var exclude = { exclude: true };

// based on http://developers.whatwg.org/syntax.html#syntax-tag-omission
var disallowedContents = {
	li: [ 'li' ],
	dt: [ 'dt', 'dd' ],
	dd: [ 'dt', 'dd' ],
	p: 'address article aside blockquote div dl fieldset footer form h1 h2 h3 h4 h5 h6 header hgroup hr main menu nav ol p pre section table ul'.split( ' ' ),
	rt: [ 'rt', 'rp' ],
	rp: [ 'rt', 'rp' ],
	optgroup: [ 'optgroup' ],
	option: [ 'option', 'optgroup' ],
	thead: [ 'tbody', 'tfoot' ],
	tbody: [ 'tbody', 'tfoot' ],
	tfoot: [ 'tbody' ],
	tr: [ 'tr', 'tbody' ],
	td: [ 'td', 'th', 'tr' ],
	th: [ 'td', 'th', 'tr' ]
};

function readElement$1 ( parser ) {
	var attribute, selfClosing, children, partials, hasPartials, child, closed, pos, remaining, closingTag, anchor;

	var start = parser.pos;

	if ( parser.inside || parser.inAttribute || parser.textOnlyMode ) {
		return null;
	}

	if ( !parser.matchString( '<' ) ) {
		return null;
	}

	// if this is a closing tag, abort straight away
	if ( parser.nextChar() === '/' ) {
		return null;
	}

	var element = {};
	if ( parser.includeLinePositions ) {
		element.p = parser.getLinePos( start );
	}

	// check for doctype decl
	if ( parser.matchString( '!' ) ) {
		element.t = DOCTYPE;
		if ( !parser.matchPattern( /^doctype/i ) ) {
			parser.error( 'Expected DOCTYPE declaration' );
		}

		element.a = parser.matchPattern( /^(.+?)>/ );
		return element;
	}
	// check for anchor
	else if ( anchor = parser.matchString( '#' ) ) {
		parser.allowWhitespace();
		element.t = ANCHOR;
		element.n = parser.matchPattern( anchorPattern );
	}
	// otherwise, it's an element/component
	else {
		element.t = ELEMENT;

		// element name
		element.e = parser.matchPattern( tagNamePattern );
		if ( !element.e ) {
			return null;
		}
	}

	// next character must be whitespace, closing solidus or '>'
	if ( !validTagNameFollower.test( parser.nextChar() ) ) {
		parser.error( 'Illegal tag name' );
	}

	parser.allowWhitespace();

	parser.inTag = true;

	// directives and attributes
	while ( attribute = readMustache( parser ) ) {
		if ( attribute !== false ) {
			if ( !element.m ) { element.m = []; }
			element.m.push( attribute );
		}

		parser.allowWhitespace();
	}

	parser.inTag = false;

	// allow whitespace before closing solidus
	parser.allowWhitespace();

	// self-closing solidus?
	if ( parser.matchString( '/' ) ) {
		selfClosing = true;
	}

	// closing angle bracket
	if ( !parser.matchString( '>' ) ) {
		return null;
	}

	var lowerCaseName = ( element.e || element.n ).toLowerCase();
	var preserveWhitespace = parser.preserveWhitespace;

	if ( !selfClosing && ( anchor || !voidElementNames.test( element.e ) ) ) {
		if ( !anchor ) {
			parser.elementStack.push( lowerCaseName );

			// Special case - if we open a script element, further tags should
			// be ignored unless they're a closing script element
			if ( lowerCaseName in parser.interpolate ) {
				parser.inside = lowerCaseName;
			}
		}

		children = [];
		partials = Object.create( null );

		do {
			pos = parser.pos;
			remaining = parser.remaining();

			if ( !remaining ) {
				parser.error( ("Missing end " + (parser.elementStack.length > 1 ? 'tags' : 'tag') + " (" + (parser.elementStack.reverse().map( function (x) { return ("</" + x + ">"); } ).join( '' )) + ")") );
			}

			// if for example we're in an <li> element, and we see another
			// <li> tag, close the first so they become siblings
			if ( !anchor && !canContain( lowerCaseName, remaining ) ) {
				closed = true;
			}

			// closing tag
			else if ( !anchor && ( closingTag = readClosingTag( parser ) ) ) {
				closed = true;

				var closingTagName = closingTag.e.toLowerCase();

				// if this *isn't* the closing tag for the current element...
				if ( closingTagName !== lowerCaseName ) {
					// rewind parser
					parser.pos = pos;

					// if it doesn't close a parent tag, error
					if ( !~parser.elementStack.indexOf( closingTagName ) ) {
						var errorMessage = 'Unexpected closing tag';

						// add additional help for void elements, since component names
						// might clash with them
						if ( voidElementNames.test( closingTagName ) ) {
							errorMessage += " (<" + closingTagName + "> is a void element - it cannot contain children)";
						}

						parser.error( errorMessage );
					}
				}
			}

			else if ( anchor && readAnchorClose( parser, element.n ) ) {
				closed = true;
			}

			// implicit close by closing section tag. TODO clean this up
			else if ( child = readClosing( parser, { open: parser.standardDelimiters[0], close: parser.standardDelimiters[1] } ) ) {
				closed = true;
				parser.pos = pos;
			}

			else {
				if ( child = parser.read( PARTIAL_READERS ) ) {
					if ( partials[ child.n ] ) {
						parser.pos = pos;
						parser.error( 'Duplicate partial definition' );
					}

					cleanup( child.f, parser.stripComments, preserveWhitespace, !preserveWhitespace, !preserveWhitespace );

					partials[ child.n ] = child.f;
					hasPartials = true;
				}

				else {
					if ( child = parser.read( READERS ) ) {
						children.push( child );
					} else {
						closed = true;
					}
				}
			}
		} while ( !closed );

		if ( children.length ) {
			element.f = children;
		}

		if ( hasPartials ) {
			element.p = partials;
		}

		parser.elementStack.pop();
	}

	parser.inside = null;

	if ( parser.sanitizeElements && parser.sanitizeElements.indexOf( lowerCaseName ) !== -1 ) {
		return exclude;
	}

	return element;
}

function canContain ( name, remaining ) {
	var match = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec( remaining );
	var disallowed = disallowedContents[ name ];

	if ( !match || !disallowed ) {
		return true;
	}

	return !~disallowed.indexOf( match[1].toLowerCase() );
}

function readAnchorClose ( parser, name ) {
	var pos = parser.pos;
	if ( !parser.matchString( '</' ) ) {
		return null;
	}

	parser.matchString( '#' );
	parser.allowWhitespace();

	if ( !parser.matchString( name ) ) {
		parser.pos = pos;
		return null;
	}

	parser.allowWhitespace();

	if ( !parser.matchString( '>' ) ) {
		parser.pos = pos;
		return null;
	}

	return true;
}

function readText ( parser ) {
	var index, disallowed, barrier;

	var remaining = parser.remaining();

	if ( parser.textOnlyMode ) {
		disallowed = parser.tags.map( function (t) { return t.open; } );
		disallowed = disallowed.concat( parser.tags.map( function (t) { return '\\' + t.open; } ) );

		index = getLowestIndex( remaining, disallowed );
	} else {
		barrier = parser.inside ? '</' + parser.inside : '<';

		if ( parser.inside && !parser.interpolate[ parser.inside ] ) {
			index = remaining.indexOf( barrier );
		} else {
			disallowed = parser.tags.map( function (t) { return t.open; } );
			disallowed = disallowed.concat( parser.tags.map( function (t) { return '\\' + t.open; } ) );

			// http://developers.whatwg.org/syntax.html#syntax-attributes
			if ( parser.inAttribute === true ) {
				// we're inside an unquoted attribute value
				disallowed.push( "\"", "'", "=", "<", ">", '`' );
			} else if ( parser.inAttribute ) {
				// quoted attribute value
				disallowed.push( parser.inAttribute );
			} else {
				disallowed.push( barrier );
			}

			index = getLowestIndex( remaining, disallowed );
		}
	}

	if ( !index ) {
		return null;
	}

	if ( index === -1 ) {
		index = remaining.length;
	}

	parser.pos += index;

	if ( ( parser.inside && parser.inside !== 'textarea' ) || parser.textOnlyMode ) {
		return remaining.substr( 0, index );
	} else {
		return decodeCharacterReferences( remaining.substr( 0, index ) );
	}
}

var partialDefinitionSectionPattern = /^\s*#\s*partial\s+/;

function readPartialDefinitionSection ( parser ) {
	var child, closed;

	var start = parser.pos;

	var delimiters = parser.standardDelimiters;

	if ( !parser.matchString( delimiters[0] ) ) {
		return null;
	}

	if ( !parser.matchPattern( partialDefinitionSectionPattern ) ) {
		parser.pos = start;
		return null;
	}

	var name = parser.matchPattern( /^[a-zA-Z_$][a-zA-Z_$0-9\-\/]*/ );

	if ( !name ) {
		parser.error( 'expected legal partial name' );
	}

	parser.allowWhitespace();
	if ( !parser.matchString( delimiters[1] ) ) {
		parser.error( ("Expected closing delimiter '" + (delimiters[1]) + "'") );
	}

	var content = [];

	var open = delimiters[0];
	var close = delimiters[1];

	do {
		if ( child = readClosing( parser, { open: open, close: close }) ) {
			if ( child.r !== 'partial' ) {
				parser.error( ("Expected " + open + "/partial" + close) );
			}

			closed = true;
		}

		else {
			child = parser.read( READERS );

			if ( !child ) {
				parser.error( ("Expected " + open + "/partial" + close) );
			}

			content.push( child );
		}
	} while ( !closed );

	return {
		t: INLINE_PARTIAL,
		n: name,
		f: content
	};
}

function readTemplate ( parser ) {
	var fragment = [];
	var partials = Object.create( null );
	var hasPartials = false;

	var preserveWhitespace = parser.preserveWhitespace;

	while ( parser.pos < parser.str.length ) {
		var pos = parser.pos;
		var item = (void 0), partial = (void 0);

		if ( partial = parser.read( PARTIAL_READERS ) ) {
			if ( partials[ partial.n ] ) {
				parser.pos = pos;
				parser.error( 'Duplicated partial definition' );
			}

			cleanup( partial.f, parser.stripComments, preserveWhitespace, !preserveWhitespace, !preserveWhitespace );

			partials[ partial.n ] = partial.f;
			hasPartials = true;
		} else if ( item = parser.read( READERS ) ) {
			fragment.push( item );
		} else  {
			parser.error( 'Unexpected template content' );
		}
	}

	var result = {
		v: TEMPLATE_VERSION,
		t: fragment
	};

	if ( hasPartials ) {
		result.p = partials;
	}

	return result;
}

function insertExpressions ( obj, expr ) {

	Object.keys( obj ).forEach( function (key) {
		if  ( isExpression( key, obj ) ) { return addTo( obj, expr ); }

		var ref = obj[ key ];
		if ( hasChildren( ref ) ) { insertExpressions( ref, expr ); }
	});
}

function isExpression( key, obj ) {
	return key === 's' && Array.isArray( obj.r );
}

function addTo( obj, expr ) {
	var s = obj.s;
	var r = obj.r;
	if ( !expr[ s ] ) { expr[ s ] = fromExpression( s, r.length ); }
}

function hasChildren( ref ) {
	return Array.isArray( ref ) || isObject( ref );
}

var shared = {};

// See https://github.com/ractivejs/template-spec for information
// about the Ractive template specification

var STANDARD_READERS = [ readPartial, readUnescaped, readSection, readInterpolator, readComment ];
var TRIPLE_READERS = [ readTriple ];
var STATIC_READERS = [ readUnescaped, readSection, readInterpolator ]; // TODO does it make sense to have a static section?

var READERS = [ readMustache, readHtmlComment, readElement$1, readText ];
var PARTIAL_READERS = [ readPartialDefinitionSection ];

var defaultInterpolate = [ 'script', 'style', 'template' ];

var StandardParser = Parser.extend({
	init: function init ( str, options ) {
		var this$1 = this;

		var tripleDelimiters = options.tripleDelimiters || shared.defaults.tripleDelimiters;
		var staticDelimiters = options.staticDelimiters || shared.defaults.staticDelimiters;
		var staticTripleDelimiters = options.staticTripleDelimiters || shared.defaults.staticTripleDelimiters;

		this.standardDelimiters = options.delimiters || shared.defaults.delimiters;

		this.tags = [
			{ isStatic: false, isTriple: false, open: this.standardDelimiters[0], close: this.standardDelimiters[1], readers: STANDARD_READERS },
			{ isStatic: false, isTriple: true,  open: tripleDelimiters[0],        close: tripleDelimiters[1],        readers: TRIPLE_READERS },
			{ isStatic: true,  isTriple: false, open: staticDelimiters[0],        close: staticDelimiters[1],        readers: STATIC_READERS },
			{ isStatic: true,  isTriple: true,  open: staticTripleDelimiters[0],  close: staticTripleDelimiters[1],  readers: TRIPLE_READERS }
		];

		this.contextLines = options.contextLines || shared.defaults.contextLines;

		this.sortMustacheTags();

		this.sectionDepth = 0;
		this.elementStack = [];

		this.interpolate = Object.create( options.interpolate || shared.defaults.interpolate || {} );
		this.interpolate.textarea = true;
		defaultInterpolate.forEach( function (t) { return this$1.interpolate[ t ] = !options.interpolate || options.interpolate[ t ] !== false; } );

		if ( options.sanitize === true ) {
			options.sanitize = {
				// blacklist from https://code.google.com/p/google-caja/source/browse/trunk/src/com/google/caja/lang/html/html4-elements-whitelist.json
				elements: 'applet base basefont body frame frameset head html isindex link meta noframes noscript object param script style title'.split( ' ' ),
				eventAttributes: true
			};
		}

		this.stripComments = options.stripComments !== false;
		this.preserveWhitespace = options.preserveWhitespace;
		this.sanitizeElements = options.sanitize && options.sanitize.elements;
		this.sanitizeEventAttributes = options.sanitize && options.sanitize.eventAttributes;
		this.includeLinePositions = options.includeLinePositions;
		this.textOnlyMode = options.textOnlyMode;
		this.csp = options.csp;

		this.transforms = options.transforms || options.parserTransforms;
		if ( this.transforms ) {
			this.transforms = this.transforms.concat( shared.defaults.parserTransforms );
		} else {
			this.transforms = shared.defaults.parserTransforms;
		}
	},

	postProcess: function postProcess ( result ) {
		// special case - empty string
		if ( !result.length ) {
			return { t: [], v: TEMPLATE_VERSION };
		}

		if ( this.sectionDepth > 0 ) {
			this.error( 'A section was left open' );
		}

		cleanup( result[0].t, this.stripComments, this.preserveWhitespace, !this.preserveWhitespace, !this.preserveWhitespace );

		var transforms = this.transforms;
		if ( transforms.length ) {
			var tlen = transforms.length;
			var walk = function ( fragment ) {
				var len = fragment.length;

				for ( var i = 0; i < len; i++ ) {
					var node = fragment[i];

					if ( node.t === ELEMENT ) {
						for ( var j = 0; j < tlen; j++ ) {
							var res = transforms[j].call( shared.Ractive, node );
							if ( !res ) {
								continue;
							} else if ( res.remove ) {
								fragment.splice( i--, 1 );
								len--;
								break;
							} else if ( res.replace ) {
								if ( Array.isArray( res.replace ) ) {
									fragment.splice.apply( fragment, [ i--, 1 ].concat( res.replace ) );
									len += res.replace.length - 1;
								} else {
									fragment[i--] = node = res.replace;
								}

								break;
							}
						}

						// watch for partials
						if ( node.p ) {
							for ( var k in node.p ) { walk( node.p[k] ); }
						}
					}

					if ( node.f ) { walk( node.f ); }
				}
			};

			// process the root fragment
			walk( result[0].t );

			// watch for root partials
			if ( result[0].p ) {
				for ( var k in result[0].p ) { walk( result[0].p[k] ); }
			}
		}

		if ( this.csp !== false ) {
			var expr = {};
			insertExpressions( result[0].t, expr );
			if ( Object.keys( expr ).length ) { result[0].e = expr; }
		}

		return result[0];
	},

	converters: [
		readTemplate
	],

	sortMustacheTags: function sortMustacheTags () {
		// Sort in order of descending opening delimiter length (longer first),
		// to protect against opening delimiters being substrings of each other
		this.tags.sort( function ( a, b ) {
			return b.open.length - a.open.length;
		});
	}
});

function parse ( template, options ) {
	return new StandardParser( template, options || {} ).result;
}

var parseOptions = [
	'delimiters',
	'tripleDelimiters',
	'staticDelimiters',
	'staticTripleDelimiters',
	'csp',
	'interpolate',
	'preserveWhitespace',
	'sanitize',
	'stripComments',
	'contextLines'
];

var TEMPLATE_INSTRUCTIONS = "Either preparse or use a ractive runtime source that includes the parser. ";

var COMPUTATION_INSTRUCTIONS = "Either include a version of Ractive that can parse or convert your computation strings to functions.";


function throwNoParse ( method, error, instructions ) {
	if ( !method ) {
		fatal( ("Missing Ractive.parse - cannot parse " + error + ". " + instructions) );
	}
}

function createFunction ( body, length ) {
	throwNoParse( fromExpression, 'new expression function', TEMPLATE_INSTRUCTIONS );
	return fromExpression( body, length );
}

function createFunctionFromString ( str, bindTo ) {
	throwNoParse( fromComputationString, 'compution string "${str}"', COMPUTATION_INSTRUCTIONS );
	return fromComputationString( str, bindTo );
}

var parser = {

	fromId: function fromId ( id, options ) {
		if ( !doc ) {
			if ( options && options.noThrow ) { return; }
			throw new Error( ("Cannot retrieve template #" + id + " as Ractive is not running in a browser.") );
		}

		if ( id ) { id = id.replace( /^#/, '' ); }

		var template;

		if ( !( template = doc.getElementById( id ) )) {
			if ( options && options.noThrow ) { return; }
			throw new Error( ("Could not find template element with id #" + id) );
		}

		if ( template.tagName.toUpperCase() !== 'SCRIPT' ) {
			if ( options && options.noThrow ) { return; }
			throw new Error( ("Template element with id #" + id + ", must be a <script> element") );
		}

		return ( 'textContent' in template ? template.textContent : template.innerHTML );

	},

	isParsed: function isParsed ( template) {
		return !( typeof template === 'string' );
	},

	getParseOptions: function getParseOptions ( ractive ) {
		// Could be Ractive or a Component
		if ( ractive.defaults ) { ractive = ractive.defaults; }

		return parseOptions.reduce( function ( val, key ) {
			val[ key ] = ractive[ key ];
			return val;
		}, {});
	},

	parse: function parse$1 ( template, options ) {
		throwNoParse( parse, 'template', TEMPLATE_INSTRUCTIONS );
		var parsed = parse( template, options );
		addFunctions( parsed );
		return parsed;
	},

	parseFor: function parseFor( template, ractive ) {
		return this.parse( template, this.getParseOptions( ractive ) );
	}
};

var templateConfigurator = {
	name: 'template',

	extend: function extend ( Parent, proto, options ) {
		// only assign if exists
		if ( 'template' in options ) {
			var template = options.template;

			if ( typeof template === 'function' ) {
				proto.template = template;
			} else {
				proto.template = parseTemplate( template, proto );
			}
		}
	},

	init: function init ( Parent, ractive, options ) {
		// TODO because of prototypal inheritance, we might just be able to use
		// ractive.template, and not bother passing through the Parent object.
		// At present that breaks the test mocks' expectations
		var template = 'template' in options ? options.template : Parent.prototype.template;
		template = template || { v: TEMPLATE_VERSION, t: [] };

		if ( typeof template === 'function' ) {
			var fn = template;
			template = getDynamicTemplate( ractive, fn );

			ractive._config.template = {
				fn: fn,
				result: template
			};
		}

		template = parseTemplate( template, ractive );

		// TODO the naming of this is confusing - ractive.template refers to [...],
		// but Component.prototype.template refers to {v:1,t:[],p:[]}...
		// it's unnecessary, because the developer never needs to access
		// ractive.template
		ractive.template = template.t;

		if ( template.p ) {
			extendPartials( ractive.partials, template.p );
		}
	},

	reset: function reset ( ractive ) {
		var result = resetValue( ractive );

		if ( result ) {
			var parsed = parseTemplate( result, ractive );

			ractive.template = parsed.t;
			extendPartials( ractive.partials, parsed.p, true );

			return true;
		}
	}
};

function resetValue ( ractive ) {
	var initial = ractive._config.template;

	// If this isn't a dynamic template, there's nothing to do
	if ( !initial || !initial.fn ) {
		return;
	}

	var result = getDynamicTemplate( ractive, initial.fn );

	// TODO deep equality check to prevent unnecessary re-rendering
	// in the case of already-parsed templates
	if ( result !== initial.result ) {
		initial.result = result;
		return result;
	}
}

function getDynamicTemplate ( ractive, fn ) {
	return fn.call( ractive, {
		fromId: parser.fromId,
		isParsed: parser.isParsed,
		parse: function parse ( template, options ) {
			if ( options === void 0 ) options = parser.getParseOptions( ractive );

			return parser.parse( template, options );
		}
	});
}

function parseTemplate ( template, ractive ) {
	if ( typeof template === 'string' ) {
		// parse will validate and add expression functions
		template = parseAsString( template, ractive );
	}
	else {
		// need to validate and add exp for already parsed template
		validate$1( template );
		addFunctions( template );
	}

	return template;
}

function parseAsString ( template, ractive ) {
	// ID of an element containing the template?
	if ( template[0] === '#' ) {
		template = parser.fromId( template );
	}

	return parser.parseFor( template, ractive );
}

function validate$1( template ) {

	// Check that the template even exists
	if ( template == undefined ) {
		throw new Error( ("The template cannot be " + template + ".") );
	}

	// Check the parsed template has a version at all
	else if ( typeof template.v !== 'number' ) {
		throw new Error( 'The template parser was passed a non-string template, but the template doesn\'t have a version.  Make sure you\'re passing in the template you think you are.' );
	}

	// Check we're using the correct version
	else if ( template.v !== TEMPLATE_VERSION ) {
		throw new Error( ("Mismatched template version (expected " + TEMPLATE_VERSION + ", got " + (template.v) + ") Please ensure you are using the latest version of Ractive.js in your build process as well as in your app") );
	}
}

function extendPartials ( existingPartials, newPartials, overwrite ) {
	if ( !newPartials ) { return; }

	// TODO there's an ambiguity here - we need to overwrite in the `reset()`
	// case, but not initially...

	for ( var key in newPartials ) {
		if ( overwrite || !existingPartials.hasOwnProperty( key ) ) {
			existingPartials[ key ] = newPartials[ key ];
		}
	}
}

var registryNames = [
	'adaptors',
	'components',
	'computed',
	'decorators',
	'easing',
	'events',
	'interpolators',
	'partials',
	'transitions'
];

var registriesOnDefaults = [
	'computed'
];

var Registry = function Registry ( name, useDefaults ) {
	this.name = name;
	this.useDefaults = useDefaults;
};

Registry.prototype.extend = function extend ( Parent, proto, options ) {
	var parent = this.useDefaults ? Parent.defaults : Parent;
	var target = this.useDefaults ? proto : proto.constructor;
	this.configure( parent, target, options );
};

Registry.prototype.init = function init () {
	// noop
};

Registry.prototype.configure = function configure ( Parent, target, options ) {
	var name = this.name;
	var option = options[ name ];

	var registry = Object.create( Parent[name] );

	for ( var key in option ) {
		registry[ key ] = option[ key ];
	}

	target[ name ] = registry;
};

Registry.prototype.reset = function reset ( ractive ) {
	var registry = ractive[ this.name ];
	var changed = false;

	Object.keys( registry ).forEach( function (key) {
		var item = registry[ key ];

		if ( item._fn ) {
			if ( item._fn.isOwner ) {
				registry[key] = item._fn;
			} else {
				delete registry[key];
			}
			changed = true;
		}
	});

	return changed;
};

var registries = registryNames.map( function (name) {
	var putInDefaults = registriesOnDefaults.indexOf(name) > -1;
	return new Registry( name, putInDefaults );
});

function wrap ( parent, name, method ) {
	if ( !/_super/.test( method ) ) { return method; }

	function wrapper () {
		var superMethod = getSuperMethod( wrapper._parent, name );
		var hasSuper = '_super' in this;
		var oldSuper = this._super;

		this._super = superMethod;

		var result = method.apply( this, arguments );

		if ( hasSuper ) {
			this._super = oldSuper;
		} else {
			delete this._super;
		}

		return result;
	}

	wrapper._parent = parent;
	wrapper._method = method;

	return wrapper;
}

function getSuperMethod ( parent, name ) {
	if ( name in parent ) {
		var value = parent[ name ];

		return typeof value === 'function' ?
			value :
			function () { return value; };
	}

	return noop;
}

function getMessage( deprecated, correct, isError ) {
	return "options." + deprecated + " has been deprecated in favour of options." + correct + "."
		+ ( isError ? (" You cannot specify both options, please use options." + correct + ".") : '' );
}

function deprecateOption ( options, deprecatedOption, correct ) {
	if ( deprecatedOption in options ) {
		if( !( correct in options ) ) {
			warnIfDebug( getMessage( deprecatedOption, correct ) );
			options[ correct ] = options[ deprecatedOption ];
		} else {
			throw new Error( getMessage( deprecatedOption, correct, true ) );
		}
	}
}

function deprecate ( options ) {
	deprecateOption( options, 'beforeInit', 'onconstruct' );
	deprecateOption( options, 'init', 'onrender' );
	deprecateOption( options, 'complete', 'oncomplete' );
	deprecateOption( options, 'eventDefinitions', 'events' );

	// Using extend with Component instead of options,
	// like Human.extend( Spider ) means adaptors as a registry
	// gets copied to options. So we have to check if actually an array
	if ( Array.isArray( options.adaptors ) ) {
		deprecateOption( options, 'adaptors', 'adapt' );
	}
}

var custom = {
	adapt: adaptConfigurator,
	css: cssConfigurator,
	data: dataConfigurator,
	template: templateConfigurator
};

var defaultKeys = Object.keys( defaults );

var isStandardKey = makeObj( defaultKeys.filter( function (key) { return !custom[ key ]; } ) );

// blacklisted keys that we don't double extend
var isBlacklisted = makeObj( defaultKeys.concat( registries.map( function (r) { return r.name; } ), [ 'on', 'observe', 'attributes' ] ) );

var order = [].concat(
	defaultKeys.filter( function (key) { return !registries[ key ] && !custom[ key ]; } ),
	registries,
	//custom.data,
	custom.template,
	custom.css
);

var config = {
	extend: function ( Parent, proto$$1, options ) { return configure( 'extend', Parent, proto$$1, options ); },
	init: function ( Parent, ractive, options ) { return configure( 'init', Parent, ractive, options ); },
	reset: function (ractive) { return order.filter( function (c) { return c.reset && c.reset( ractive ); } ).map( function (c) { return c.name; } ); }
};

function configure ( method, Parent, target, options ) {
	deprecate( options );

	for ( var key in options ) {
		if ( isStandardKey.hasOwnProperty( key ) ) {
			var value = options[ key ];

			// warn the developer if they passed a function and ignore its value

			// NOTE: we allow some functions on "el" because we duck type element lists
			// and some libraries or ef'ed-up virtual browsers (phantomJS) return a
			// function object as the result of querySelector methods
			if ( key !== 'el' && typeof value === 'function' ) {
				warnIfDebug( (key + " is a Ractive option that does not expect a function and will be ignored"),
					method === 'init' ? target : null );
			}
			else {
				target[ key ] = value;
			}
		}
	}

	// disallow combination of `append` and `enhance`
	if ( options.append && options.enhance ) {
		throw new Error( 'Cannot use append and enhance at the same time' );
	}

	registries.forEach( function (registry) {
		registry[ method ]( Parent, target, options );
	});

	adaptConfigurator[ method ]( Parent, target, options );
	templateConfigurator[ method ]( Parent, target, options );
	cssConfigurator[ method ]( Parent, target, options );

	extendOtherMethods( Parent.prototype, target, options );
}

var _super = /\b_super\b/;
function extendOtherMethods ( parent, target, options ) {
	for ( var key in options ) {
		if ( !isBlacklisted[ key ] && options.hasOwnProperty( key ) ) {
			var member = options[ key ];

			// if this is a method that overwrites a method, wrap it:
			if ( typeof member === 'function' ) {
				if ( key in proto && !_super.test( member.toString() ) ) {
					warnIfDebug( ("Overriding Ractive prototype function '" + key + "' without calling the '" + _super + "' method can be very dangerous.") );
				}
				member = wrap( parent, key, member );
			}

			target[ key ] = member;
		}
	}
}

function makeObj ( array ) {
	var obj = {};
	array.forEach( function (x) { return obj[x] = true; } );
	return obj;
}

var Item = function Item ( options ) {
	this.parentFragment = options.parentFragment;
	this.ractive = options.parentFragment.ractive;

	this.template = options.template;
	this.index = options.index;
	this.type = options.template.t;

	this.dirty = false;
};

Item.prototype.bubble = function bubble () {
	if ( !this.dirty ) {
		this.dirty = true;
		this.parentFragment.bubble();
	}
};

Item.prototype.destroyed = function destroyed () {
	if ( this.fragment ) { this.fragment.destroyed(); }
};

Item.prototype.find = function find () {
	return null;
};

Item.prototype.findComponent = function findComponent () {
	return null;
};

Item.prototype.findNextNode = function findNextNode () {
	return this.parentFragment.findNextNode( this );
};

Item.prototype.shuffled = function shuffled () {
	if ( this.fragment ) { this.fragment.shuffled(); }
};

Item.prototype.valueOf = function valueOf () {
	return this.toString();
};

Item.prototype.findAll = noop;
Item.prototype.findAllComponents = noop;

var ContainerItem = (function (Item) {
	function ContainerItem ( options ) {
		Item.call( this, options );
	}

	if ( Item ) ContainerItem.__proto__ = Item;
	ContainerItem.prototype = Object.create( Item && Item.prototype );
	ContainerItem.prototype.constructor = ContainerItem;

	ContainerItem.prototype.detach = function detach () {
		return this.fragment ? this.fragment.detach() : createDocumentFragment();
	};

	ContainerItem.prototype.find = function find ( selector ) {
		if ( this.fragment ) {
			return this.fragment.find( selector );
		}
	};

	ContainerItem.prototype.findAll = function findAll ( selector, options ) {
		if ( this.fragment ) {
			this.fragment.findAll( selector, options );
		}
	};

	ContainerItem.prototype.findComponent = function findComponent ( name ) {
		if ( this.fragment ) {
			return this.fragment.findComponent( name );
		}
	};

	ContainerItem.prototype.findAllComponents = function findAllComponents ( name, options ) {
		if ( this.fragment ) {
			this.fragment.findAllComponents( name, options );
		}
	};

	ContainerItem.prototype.firstNode = function firstNode ( skipParent ) {
		return this.fragment && this.fragment.firstNode( skipParent );
	};

	ContainerItem.prototype.toString = function toString ( escape ) {
		return this.fragment ? this.fragment.toString( escape ) : '';
	};

	return ContainerItem;
}(Item));

var ComputationChild = (function (Model$$1) {
	function ComputationChild ( parent, key ) {
		Model$$1.call( this, parent, key );

		this.isReadonly = !this.root.ractive.syncComputedChildren;
		this.dirty = true;
	}

	if ( Model$$1 ) ComputationChild.__proto__ = Model$$1;
	ComputationChild.prototype = Object.create( Model$$1 && Model$$1.prototype );
	ComputationChild.prototype.constructor = ComputationChild;

	var prototypeAccessors = { setRoot: {} };

	prototypeAccessors.setRoot.get = function () { return this.parent.setRoot; };

	ComputationChild.prototype.applyValue = function applyValue ( value ) {
		Model$$1.prototype.applyValue.call( this, value );

		if ( !this.isReadonly ) {
			var source = this.parent;
			// computed models don't have a shuffle method
			while ( source && source.shuffle ) {
				source = source.parent;
			}

			if ( source ) {
				source.dependencies.forEach( mark );
			}
		}

		if ( this.setRoot ) {
			this.setRoot.set( this.setRoot.value );
		}
	};

	ComputationChild.prototype.get = function get ( shouldCapture ) {
		if ( shouldCapture ) { capture( this ); }

		if ( this.dirty ) {
			this.dirty = false;
			var parentValue = this.parent.get();
			this.value = parentValue ? parentValue[ this.key ] : undefined;
		}

		return this.value;
	};

	ComputationChild.prototype.handleChange = function handleChange$1 () {
		this.dirty = true;

		if ( this.boundValue ) { this.boundValue = null; }

		this.links.forEach( marked );
		this.deps.forEach( handleChange );
		this.children.forEach( handleChange );
	};

	ComputationChild.prototype.joinKey = function joinKey ( key ) {
		if ( key === undefined || key === '' ) { return this; }

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			var child = new ComputationChild( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	};

	Object.defineProperties( ComputationChild.prototype, prototypeAccessors );

	return ComputationChild;
}(Model));

/* global console */
/* eslint no-console:"off" */

var Computation = (function (Model$$1) {
	function Computation ( viewmodel, signature, key ) {
		Model$$1.call( this, null, null );

		this.root = this.parent = viewmodel;
		this.signature = signature;

		this.key = key; // not actually used, but helps with debugging
		this.isExpression = key && key[0] === '@';

		this.isReadonly = !this.signature.setter;

		this.context = viewmodel.computationContext;

		this.dependencies = [];

		this.children = [];
		this.childByKey = {};

		this.deps = [];

		this.dirty = true;

		// TODO: is there a less hackish way to do this?
		this.shuffle = undefined;
	}

	if ( Model$$1 ) Computation.__proto__ = Model$$1;
	Computation.prototype = Object.create( Model$$1 && Model$$1.prototype );
	Computation.prototype.constructor = Computation;

	var prototypeAccessors = { setRoot: {} };

	prototypeAccessors.setRoot.get = function () {
		if ( this.signature.setter ) { return this; }
	};

	Computation.prototype.get = function get ( shouldCapture ) {
		if ( shouldCapture ) { capture( this ); }

		if ( this.dirty ) {
			this.dirty = false;
			var old = this.value;
			this.value = this.getValue();
			if ( !isEqual( old, this.value ) ) { this.notifyUpstream(); }
			if ( this.wrapper ) { this.newWrapperValue = this.value; }
			this.adapt();
		}

		// if capturing, this value needs to be unwrapped because it's for external use
		return maybeBind( this, shouldCapture && this.wrapper ? this.wrapperValue : this.value );
	};

	Computation.prototype.getValue = function getValue () {
		startCapturing();
		var result;

		try {
			result = this.signature.getter.call( this.context );
		} catch ( err ) {
			warnIfDebug( ("Failed to compute " + (this.getKeypath()) + ": " + (err.message || err)) );

			// TODO this is all well and good in Chrome, but...
			// ...also, should encapsulate this stuff better, and only
			// show it if Ractive.DEBUG
			if ( hasConsole ) {
				if ( console.groupCollapsed ) { console.groupCollapsed( '%cshow details', 'color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;' ); }
				var sig = this.signature;
				console.error( ((err.name) + ": " + (err.message) + "\n\n" + (sig.getterString) + (sig.getterUseStack ? '\n\n' + err.stack : '')) );
				if ( console.groupCollapsed ) { console.groupEnd(); }
			}
		}

		var dependencies = stopCapturing();
		this.setDependencies( dependencies );

		return result;
	};

	Computation.prototype.mark = function mark () {
		this.handleChange();
	};

	Computation.prototype.rebind = function rebind ( next, previous ) {
		// computations will grab all of their deps again automagically
		if ( next !== previous ) { this.handleChange(); }
	};

	Computation.prototype.set = function set ( value ) {
		if ( this.isReadonly ) {
			throw new Error( ("Cannot set read-only computed value '" + (this.key) + "'") );
		}

		this.signature.setter( value );
		this.mark();
	};

	Computation.prototype.setDependencies = function setDependencies ( dependencies ) {
		var this$1 = this;

		// unregister any soft dependencies we no longer have
		var i = this.dependencies.length;
		while ( i-- ) {
			var model = this$1.dependencies[i];
			if ( !~dependencies.indexOf( model ) ) { model.unregister( this$1 ); }
		}

		// and add any new ones
		i = dependencies.length;
		while ( i-- ) {
			var model$1 = dependencies[i];
			if ( !~this$1.dependencies.indexOf( model$1 ) ) { model$1.register( this$1 ); }
		}

		this.dependencies = dependencies;
	};

	Computation.prototype.teardown = function teardown () {
		var this$1 = this;

		var i = this.dependencies.length;
		while ( i-- ) {
			if ( this$1.dependencies[i] ) { this$1.dependencies[i].unregister( this$1 ); }
		}
		if ( this.root.computations[this.key] === this ) { delete this.root.computations[this.key]; }
		Model$$1.prototype.teardown.call(this);
	};

	Object.defineProperties( Computation.prototype, prototypeAccessors );

	return Computation;
}(Model));

var prototype$1 = Computation.prototype;
var child = ComputationChild.prototype;
prototype$1.handleChange = child.handleChange;
prototype$1.joinKey = child.joinKey;

var ExpressionProxy = (function (Model$$1) {
	function ExpressionProxy ( fragment, template ) {
		var this$1 = this;

		Model$$1.call( this, fragment.ractive.viewmodel, null );

		this.fragment = fragment;
		this.template = template;

		this.isReadonly = true;
		this.dirty = true;

		this.fn = getFunction( template.s, template.r.length );

		this.models = this.template.r.map( function (ref) {
			return resolveReference( this$1.fragment, ref );
		});
		this.dependencies = [];

		this.shuffle = undefined;

		this.bubble();
	}

	if ( Model$$1 ) ExpressionProxy.__proto__ = Model$$1;
	ExpressionProxy.prototype = Object.create( Model$$1 && Model$$1.prototype );
	ExpressionProxy.prototype.constructor = ExpressionProxy;

	ExpressionProxy.prototype.bubble = function bubble ( actuallyChanged ) {
		if ( actuallyChanged === void 0 ) actuallyChanged = true;

		// refresh the keypath
		this.keypath = undefined;

		if ( actuallyChanged ) {
			this.handleChange();
		}
	};

	ExpressionProxy.prototype.getKeypath = function getKeypath () {
		var this$1 = this;

		if ( !this.template ) { return '@undefined'; }
		if ( !this.keypath ) {
			this.keypath = '@' + this.template.s.replace( /_(\d+)/g, function ( match, i ) {
				if ( i >= this$1.models.length ) { return match; }

				var model = this$1.models[i];
				return model ? model.getKeypath() : '@undefined';
			});
		}

		return this.keypath;
	};

	ExpressionProxy.prototype.getValue = function getValue () {
		var this$1 = this;

		startCapturing();
		var result;

		try {
			var params = this.models.map( function (m) { return m ? m.get( true ) : undefined; } );
			result = this.fn.apply( this.fragment.ractive, params );
		} catch ( err ) {
			warnIfDebug( ("Failed to compute " + (this.getKeypath()) + ": " + (err.message || err)) );
		}

		var dependencies = stopCapturing();
		// remove missing deps
		this.dependencies.filter( function (d) { return !~dependencies.indexOf( d ); } ).forEach( function (d) {
			d.unregister( this$1 );
			removeFromArray( this$1.dependencies, d );
		});
		// register new deps
		dependencies.filter( function (d) { return !~this$1.dependencies.indexOf( d ); } ).forEach( function (d) {
			d.register( this$1 );
			this$1.dependencies.push( d );
		});

		return result;
	};

	ExpressionProxy.prototype.rebind = function rebind ( next, previous, safe ) {
		var idx = this.models.indexOf( previous );

		if ( ~idx ) {
			next = rebindMatch( this.template.r[idx], next, previous );
			if ( next !== previous ) {
				previous.unregister( this );
				this.models.splice( idx, 1, next );
				if ( next ) { next.addShuffleRegister( this, 'mark' ); }
			}
		}
		this.bubble( !safe );
	};

	ExpressionProxy.prototype.retrieve = function retrieve () {
		return this.get();
	};

	ExpressionProxy.prototype.teardown = function teardown () {
		var this$1 = this;

		this.unbind();
		this.fragment = undefined;
		if ( this.dependencies ) { this.dependencies.forEach( function (d) { return d.unregister( this$1 ); } ); }
		Model$$1.prototype.teardown.call(this);
	};

	ExpressionProxy.prototype.unreference = function unreference () {
		Model$$1.prototype.unreference.call(this);
		if ( !this.deps.length && !this.refs ) { this.teardown(); }
	};

	ExpressionProxy.prototype.unregister = function unregister ( dep ) {
		Model$$1.prototype.unregister.call( this, dep );
		if ( !this.deps.length && !this.refs ) { this.teardown(); }
	};

	return ExpressionProxy;
}(Model));

var prototype = ExpressionProxy.prototype;
var computation = Computation.prototype;
prototype.get = computation.get;
prototype.handleChange = computation.handleChange;
prototype.joinKey = computation.joinKey;
prototype.mark = computation.mark;
prototype.unbind = noop;

var ReferenceExpressionChild = (function (Model$$1) {
	function ReferenceExpressionChild ( parent, key ) {
		Model$$1.call ( this, parent, key );
		this.dirty = true;
	}

	if ( Model$$1 ) ReferenceExpressionChild.__proto__ = Model$$1;
	ReferenceExpressionChild.prototype = Object.create( Model$$1 && Model$$1.prototype );
	ReferenceExpressionChild.prototype.constructor = ReferenceExpressionChild;

	ReferenceExpressionChild.prototype.applyValue = function applyValue ( value ) {
		if ( isEqual( value, this.value ) ) { return; }

		var parent = this.parent;
		var keys = [ this.key ];
		while ( parent ) {
			if ( parent.base ) {
				var target = parent.model.joinAll( keys );
				target.applyValue( value );
				break;
			}

			keys.unshift( parent.key );

			parent = parent.parent;
		}
	};

	ReferenceExpressionChild.prototype.get = function get ( shouldCapture, opts ) {
		this.retrieve();
		return Model$$1.prototype.get.call( this, shouldCapture, opts );
	};

	ReferenceExpressionChild.prototype.joinKey = function joinKey ( key ) {
		if ( key === undefined || key === '' ) { return this; }

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			var child = new ReferenceExpressionChild( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	};

	ReferenceExpressionChild.prototype.mark = function mark$$1 () {
		this.dirty = true;
		Model$$1.prototype.mark.call(this);
	};

	ReferenceExpressionChild.prototype.retrieve = function retrieve () {
		if ( this.dirty ) {
			this.dirty = false;
			var parent = this.parent.get();
			this.value = parent && parent[ this.key ];
		}

		return this.value;
	};

	return ReferenceExpressionChild;
}(Model));

var ReferenceExpressionProxy = (function (Model$$1) {
	function ReferenceExpressionProxy ( fragment, template ) {
		var this$1 = this;

		Model$$1.call( this, null, null );
		this.dirty = true;
		this.root = fragment.ractive.viewmodel;
		this.template = template;

		this.base = resolve$1( fragment, template );

		var intermediary = this.intermediary = {
			handleChange: function () { return this$1.handleChange(); },
			rebind: function ( next, previous ) {
				if ( previous === this$1.base ) {
					next = rebindMatch( template, next, previous );
					if ( next !== this$1.base ) {
						this$1.base.unregister( intermediary );
						this$1.base = next;
					}
				} else {
					var idx = this$1.members.indexOf( previous );
					if ( ~idx ) {
						// only direct references will rebind... expressions handle themselves
						next = rebindMatch( template.m[idx].n, next, previous );
						if ( next !== this$1.members[idx] ) {
							this$1.members.splice( idx, 1, next );
						}
					}
				}

				if ( next !== previous ) { previous.unregister( intermediary ); }
				if ( next ) { next.addShuffleTask( function () { return next.register( intermediary ); } ); }

				this$1.bubble();
			}
		};

		this.members = template.m.map( function ( template ) {
			if ( typeof template === 'string' ) {
				return { get: function () { return template; } };
			}

			var model;

			if ( template.t === REFERENCE ) {
				model = resolveReference( fragment, template.n );
				model.register( intermediary );

				return model;
			}

			model = new ExpressionProxy( fragment, template );
			model.register( intermediary );
			return model;
		});

		this.bubble();
	}

	if ( Model$$1 ) ReferenceExpressionProxy.__proto__ = Model$$1;
	ReferenceExpressionProxy.prototype = Object.create( Model$$1 && Model$$1.prototype );
	ReferenceExpressionProxy.prototype.constructor = ReferenceExpressionProxy;

	ReferenceExpressionProxy.prototype.bubble = function bubble () {
		if ( !this.base ) { return; }
		if ( !this.dirty ) { this.handleChange(); }
	};

	ReferenceExpressionProxy.prototype.get = function get ( shouldCapture ) {
		if ( this.dirty ) {
			this.bubble();

			var keys = this.members.map( function (m) { return escapeKey( String( m.get() ) ); } );
			var model = this.base.joinAll( keys );

			if ( model !== this.model ) {
				if ( this.model ) {
					this.model.unregister( this );
					this.model.unregisterTwowayBinding( this );
				}

				this.model = model;
				this.parent = model.parent;
				this.model.register( this );
				this.model.registerTwowayBinding( this );

				if ( this.keypathModel ) { this.keypathModel.handleChange(); }
			}

			this.value = this.model.get( shouldCapture );
			this.dirty = false;
			this.mark();
			return this.value;
		} else {
			return this.model ? this.model.get( shouldCapture ) : undefined;
		}
	};

	// indirect two-way bindings
	ReferenceExpressionProxy.prototype.getValue = function getValue () {
		var this$1 = this;

		this.value = this.model ? this.model.get() : undefined;

		var i = this.bindings.length;
		while ( i-- ) {
			var value = this$1.bindings[i].getValue();
			if ( value !== this$1.value ) { return value; }
		}

		// check one-way bindings
		var oneway = findBoundValue( this.deps );
		if ( oneway ) { return oneway.value; }

		return this.value;
	};

	ReferenceExpressionProxy.prototype.getKeypath = function getKeypath () {
		return this.model ? this.model.getKeypath() : '@undefined';
	};

	ReferenceExpressionProxy.prototype.handleChange = function handleChange$$1 () {
		this.dirty = true;
		this.mark();
	};

	ReferenceExpressionProxy.prototype.joinKey = function joinKey ( key ) {
		if ( key === undefined || key === '' ) { return this; }

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			var child = new ReferenceExpressionChild( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	};

	ReferenceExpressionProxy.prototype.mark = function mark$1 () {
		if ( this.dirty ) {
			this.deps.forEach( handleChange );
		}

		this.links.forEach( marked );
		this.children.forEach( mark );
	};

	ReferenceExpressionProxy.prototype.rebind = function rebind () { this.handleChange(); };

	ReferenceExpressionProxy.prototype.retrieve = function retrieve () {
		return this.value;
	};

	ReferenceExpressionProxy.prototype.set = function set ( value ) {
		this.model.set( value );
	};

	ReferenceExpressionProxy.prototype.teardown = function teardown$$1 () {
		var this$1 = this;

		if ( this.model ) {
			this.model.unregister( this );
			this.model.unregisterTwowayBinding( this );
		}
		if ( this.members ) {
			this.members.forEach( function (m) { return m && m.unregister && m.unregister( this$1 ); } );
		}
	};

	ReferenceExpressionProxy.prototype.unreference = function unreference () {
		Model$$1.prototype.unreference.call(this);
		if ( !this.deps.length && !this.refs ) { this.teardown(); }
	};

	ReferenceExpressionProxy.prototype.unregister = function unregister ( dep ) {
		Model$$1.prototype.unregister.call( this, dep );
		if ( !this.deps.length && !this.refs ) { this.teardown(); }
	};

	return ReferenceExpressionProxy;
}(Model));

function resolve$1 ( fragment, template ) {
	if ( template.r ) {
		return resolveReference( fragment, template.r );
	}

	else if ( template.x ) {
		return new ExpressionProxy( fragment, template.x );
	}

	else if ( template.rx ) {
		return new ReferenceExpressionProxy( fragment, template.rx );
	}
}

function resolveAliases( aliases, fragment ) {
	var resolved = {};

	for ( var i = 0; i < aliases.length; i++ ) {
		resolved[ aliases[i].n ] = resolve$1( fragment, aliases[i].x );
	}

	for ( var k in resolved ) {
		resolved[k].reference();
	}

	return resolved;
}

var Alias = (function (ContainerItem$$1) {
	function Alias ( options ) {
		ContainerItem$$1.call( this, options );

		this.fragment = null;
	}

	if ( ContainerItem$$1 ) Alias.__proto__ = ContainerItem$$1;
	Alias.prototype = Object.create( ContainerItem$$1 && ContainerItem$$1.prototype );
	Alias.prototype.constructor = Alias;

	Alias.prototype.bind = function bind () {
		this.fragment = new Fragment({
			owner: this,
			template: this.template.f
		});

		this.fragment.aliases = resolveAliases( this.template.z, this.parentFragment );
		this.fragment.bind();
	};

	Alias.prototype.render = function render ( target ) {
		this.rendered = true;
		if ( this.fragment ) { this.fragment.render( target ); }
	};

	Alias.prototype.unbind = function unbind () {
		var this$1 = this;

		for ( var k in this$1.fragment.aliases ) {
			this$1.fragment.aliases[k].unreference();
		}

		this.fragment.aliases = {};
		if ( this.fragment ) { this.fragment.unbind(); }
	};

	Alias.prototype.unrender = function unrender ( shouldDestroy ) {
		if ( this.rendered && this.fragment ) { this.fragment.unrender( shouldDestroy ); }
		this.rendered = false;
	};

	Alias.prototype.update = function update () {
		if ( this.dirty ) {
			this.dirty = false;
			this.fragment.update();
		}
	};

	return Alias;
}(ContainerItem));

var space = /\s+/;

function readStyle ( css ) {
	if ( typeof css !== 'string' ) { return {}; }

	return cleanCss( css, function ( css, reconstruct ) {
		return css.split( ';' )
			.filter( function (rule) { return !!rule.trim(); } )
			.map( reconstruct )
			.reduce(function ( rules, rule ) {
				var i = rule.indexOf(':');
				var name = rule.substr( 0, i ).trim();
				rules[ name ] = rule.substr( i + 1 ).trim();
				return rules;
			}, {});
	});
}

function readClass ( str ) {
	var list = str.split( space );

  // remove any empty entries
	var i = list.length;
	while ( i-- ) {
		if ( !list[i] ) { list.splice( i, 1 ); }
	}

	return list;
}

var hyphenateCamel = function ( camelCaseStr ) {
	return camelCaseStr.replace( /([A-Z])/g, function ( match, $1 ) {
		return '-' + $1.toLowerCase();
	});
};

var textTypes = [ undefined, 'text', 'search', 'url', 'email', 'hidden', 'password', 'search', 'reset', 'submit' ];

function getUpdateDelegate ( attribute ) {
	var element = attribute.element;
	var name = attribute.name;

	if ( name === 'value' ) {
		if ( attribute.interpolator ) { attribute.interpolator.bound = true; }

		// special case - selects
		if ( element.name === 'select' && name === 'value' ) {
			return element.getAttribute( 'multiple' ) ? updateMultipleSelectValue : updateSelectValue;
		}

		if ( element.name === 'textarea' ) { return updateStringValue; }

		// special case - contenteditable
		if ( element.getAttribute( 'contenteditable' ) != null ) { return updateContentEditableValue; }

		// special case - <input>
		if ( element.name === 'input' ) {
			var type = element.getAttribute( 'type' );

			// type='file' value='{{fileList}}'>
			if ( type === 'file' ) { return noop; } // read-only

			// type='radio' name='{{twoway}}'
			if ( type === 'radio' && element.binding && element.binding.attribute.name === 'name' ) { return updateRadioValue; }

			if ( ~textTypes.indexOf( type ) ) { return updateStringValue; }
		}

		return updateValue;
	}

	var node = element.node;

	// special case - <input type='radio' name='{{twoway}}' value='foo'>
	if ( attribute.isTwoway && name === 'name' ) {
		if ( node.type === 'radio' ) { return updateRadioName; }
		if ( node.type === 'checkbox' ) { return updateCheckboxName; }
	}

	if ( name === 'style' ) { return updateStyleAttribute; }

	if ( name.indexOf( 'style-' ) === 0 ) { return updateInlineStyle; }

	// special case - class names. IE fucks things up, again
	if ( name === 'class' && ( !node.namespaceURI || node.namespaceURI === html ) ) { return updateClassName; }

	if ( name.indexOf( 'class-' ) === 0 ) { return updateInlineClass; }

	if ( attribute.isBoolean ) {
		var type$1 = element.getAttribute( 'type' );
		if ( attribute.interpolator && name === 'checked' && ( type$1 === 'checkbox' || type$1 === 'radio' ) ) { attribute.interpolator.bound = true; }
		return updateBoolean;
	}

	if ( attribute.namespace && attribute.namespace !== attribute.node.namespaceURI ) { return updateNamespacedAttribute; }

	return updateAttribute;
}

function updateMultipleSelectValue ( reset ) {
	var value = this.getValue();

	if ( !Array.isArray( value ) ) { value = [ value ]; }

	var options = this.node.options;
	var i = options.length;

	if ( reset ) {
		while ( i-- ) { options[i].selected = false; }
	} else {
		while ( i-- ) {
			var option = options[i];
			var optionValue = option._ractive ?
				option._ractive.value :
				option.value; // options inserted via a triple don't have _ractive

			option.selected = arrayContains( value, optionValue );
		}
	}
}

function updateSelectValue ( reset ) {
	var value = this.getValue();

	if ( !this.locked ) { // TODO is locked still a thing?
		this.node._ractive.value = value;

		var options = this.node.options;
		var i = options.length;
		var wasSelected = false;

		if ( reset ) {
			while ( i-- ) { options[i].selected = false; }
		} else {
			while ( i-- ) {
				var option = options[i];
				var optionValue = option._ractive ?
					option._ractive.value :
					option.value; // options inserted via a triple don't have _ractive
				if ( option.disabled && option.selected ) { wasSelected = true; }

				if ( optionValue == value ) { // double equals as we may be comparing numbers with strings
					option.selected = true;
					return;
				}
			}
		}

		if ( !wasSelected ) { this.node.selectedIndex = -1; }
	}
}


function updateContentEditableValue ( reset ) {
	var value = this.getValue();

	if ( !this.locked ) {
		if ( reset ) { this.node.innerHTML = ''; }
		else { this.node.innerHTML = value === undefined ? '' : value; }
	}
}

function updateRadioValue ( reset ) {
	var node = this.node;
	var wasChecked = node.checked;

	var value = this.getValue();

	if ( reset ) { return node.checked = false; }

	//node.value = this.element.getAttribute( 'value' );
	node.value = this.node._ractive.value = value;
	node.checked = this.element.compare( value, this.element.getAttribute( 'name' ) );

	// This is a special case - if the input was checked, and the value
	// changed so that it's no longer checked, the twoway binding is
	// most likely out of date. To fix it we have to jump through some
	// hoops... this is a little kludgy but it works
	if ( wasChecked && !node.checked && this.element.binding && this.element.binding.rendered ) {
		this.element.binding.group.model.set( this.element.binding.group.getValue() );
	}
}

function updateValue ( reset ) {
	if ( !this.locked ) {
		if ( reset ) {
			this.node.removeAttribute( 'value' );
			this.node.value = this.node._ractive.value = null;
		} else {
			var value = this.getValue();

			this.node.value = this.node._ractive.value = value;
			this.node.setAttribute( 'value', safeToStringValue( value ) );
		}
	}
}

function updateStringValue ( reset ) {
	if ( !this.locked ) {
		if ( reset ) {
			this.node._ractive.value = '';
			this.node.removeAttribute( 'value' );
		} else {
			var value = this.getValue();

			this.node._ractive.value = value;

			this.node.value = safeToStringValue( value );
			this.node.setAttribute( 'value', safeToStringValue( value ) );
		}
	}
}

function updateRadioName ( reset ) {
	if ( reset ) { this.node.checked = false; }
	else { this.node.checked = this.element.compare( this.getValue(), this.element.binding.getValue() ); }
}

function updateCheckboxName ( reset ) {
	var ref = this;
	var element = ref.element;
	var node = ref.node;
	var binding = element.binding;

	var value = this.getValue();
	var valueAttribute = element.getAttribute( 'value' );

	if ( reset ) {
		// TODO: WAT?
	}

	if ( !Array.isArray( value ) ) {
		binding.isChecked = node.checked = element.compare( value, valueAttribute );
	} else {
		var i = value.length;
		while ( i-- ) {
			if ( element.compare ( valueAttribute, value[i] ) ) {
				binding.isChecked = node.checked = true;
				return;
			}
		}
		binding.isChecked = node.checked = false;
	}
}

function updateStyleAttribute ( reset ) {
	var props = reset ? {} : readStyle( this.getValue() || '' );
	var style = this.node.style;
	var keys = Object.keys( props );
	var prev = this.previous || [];

	var i = 0;
	while ( i < keys.length ) {
		if ( keys[i] in style ) {
			var safe = props[ keys[i] ].replace( '!important', '' );
			style.setProperty( keys[i], safe, safe.length !== props[ keys[i] ].length ? 'important' : '' );
		}
		i++;
	}

	// remove now-missing attrs
	i = prev.length;
	while ( i-- ) {
		if ( !~keys.indexOf( prev[i] ) && prev[i] in style ) { style.setProperty( prev[i], '', '' ); }
	}

	this.previous = keys;
}

function updateInlineStyle ( reset ) {
	if ( !this.style ) {
		this.style = hyphenateCamel( this.name.substr( 6 ) );
	}

	var value = reset ? '' : safeToStringValue( this.getValue() );
	var safe = value.replace( '!important', '' );
	this.node.style.setProperty( this.style, safe, safe.length !== value.length ? 'important' : '' );
}

function updateClassName ( reset ) {
	var value = reset ? [] : readClass( safeToStringValue( this.getValue() ) );

	// watch out for werdo svg elements
	var cls = this.node.className;
	cls = cls.baseVal !== undefined ? cls.baseVal : cls;

	var attr = readClass( cls );
	var prev = this.previous || attr.slice( 0 );

	var className = value.concat( attr.filter( function (c) { return !~prev.indexOf( c ); } ) ).join( ' ' );

	if ( className !== cls ) {
		if ( typeof this.node.className !== 'string' ) {
			this.node.className.baseVal = className;
		} else {
			this.node.className = className;
		}
	}

	this.previous = value;
}

function updateInlineClass ( reset ) {
	var name = this.name.substr( 6 );

	// watch out for werdo svg elements
	var cls = this.node.className;
	cls = cls.baseVal !== undefined ? cls.baseVal : cls;

	var attr = readClass( cls );
	var value = reset ? false : this.getValue();

	if ( !this.inlineClass ) { this.inlineClass = name; }

	if ( value && !~attr.indexOf( name ) ) { attr.push( name ); }
	else if ( !value && ~attr.indexOf( name ) ) { attr.splice( attr.indexOf( name ), 1 ); }

	if ( typeof this.node.className !== 'string' ) {
		this.node.className.baseVal = attr.join( ' ' );
	} else {
		this.node.className = attr.join( ' ' );
	}
}

function updateBoolean ( reset ) {
	// with two-way binding, only update if the change wasn't initiated by the user
	// otherwise the cursor will often be sent to the wrong place
	if ( !this.locked ) {
		if ( reset ) {
			if ( this.useProperty ) { this.node[ this.propertyName ] = false; }
			this.node.removeAttribute( this.propertyName );
		} else {
			if ( this.useProperty ) {
				this.node[ this.propertyName ] = this.getValue();
			} else {
				var val = this.getValue();
				if ( val ) {
					this.node.setAttribute( this.propertyName, typeof val === 'string' ? val : '' );
				} else {
					this.node.removeAttribute( this.propertyName );
				}
			}
		}
	}
}

function updateAttribute ( reset ) {
	if ( reset ) { this.node.removeAttribute( this.name ); }
	else { this.node.setAttribute( this.name, safeToStringValue( this.getString() ) ); }
}

function updateNamespacedAttribute ( reset ) {
	if ( reset ) { this.node.removeAttributeNS( this.namespace, this.name.slice( this.name.indexOf( ':' ) + 1 ) ); }
	else { this.node.setAttributeNS( this.namespace, this.name.slice( this.name.indexOf( ':' ) + 1 ), safeToStringValue( this.getString() ) ); }
}

var propertyNames = {
	'accept-charset': 'acceptCharset',
	accesskey: 'accessKey',
	bgcolor: 'bgColor',
	class: 'className',
	codebase: 'codeBase',
	colspan: 'colSpan',
	contenteditable: 'contentEditable',
	datetime: 'dateTime',
	dirname: 'dirName',
	for: 'htmlFor',
	'http-equiv': 'httpEquiv',
	ismap: 'isMap',
	maxlength: 'maxLength',
	novalidate: 'noValidate',
	pubdate: 'pubDate',
	readonly: 'readOnly',
	rowspan: 'rowSpan',
	tabindex: 'tabIndex',
	usemap: 'useMap'
};

var div$1 = doc ? createElement( 'div' ) : null;

var attributes = false;
function inAttributes() { return attributes; }
function doInAttributes( fn ) {
	attributes = true;
	fn();
	attributes = false;
}

var ConditionalAttribute = (function (Item$$1) {
	function ConditionalAttribute ( options ) {
		Item$$1.call( this, options );

		this.attributes = [];

		this.owner = options.owner;

		this.fragment = new Fragment({
			ractive: this.ractive,
			owner: this,
			template: this.template
		});
		// this fragment can't participate in node-y things
		this.fragment.findNextNode = noop;

		this.dirty = false;
	}

	if ( Item$$1 ) ConditionalAttribute.__proto__ = Item$$1;
	ConditionalAttribute.prototype = Object.create( Item$$1 && Item$$1.prototype );
	ConditionalAttribute.prototype.constructor = ConditionalAttribute;

	ConditionalAttribute.prototype.bind = function bind () {
		this.fragment.bind();
	};

	ConditionalAttribute.prototype.bubble = function bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.owner.bubble();
		}
	};

	ConditionalAttribute.prototype.render = function render () {
		this.node = this.owner.node;
		if ( this.node ) {
			this.isSvg = this.node.namespaceURI === svg$1;
		}

		attributes = true;
		if ( !this.rendered ) { this.fragment.render(); }

		this.rendered = true;
		this.dirty = true; // TODO this seems hacky, but necessary for tests to pass in browser AND node.js
		this.update();
		attributes = false;
	};

	ConditionalAttribute.prototype.toString = function toString () {
		return this.fragment.toString();
	};

	ConditionalAttribute.prototype.unbind = function unbind () {
		this.fragment.unbind();
	};

	ConditionalAttribute.prototype.unrender = function unrender () {
		this.rendered = false;
		this.fragment.unrender();
	};

	ConditionalAttribute.prototype.update = function update () {
		var this$1 = this;

		var str;
		var attrs;

		if ( this.dirty ) {
			this.dirty = false;

			var current = attributes;
			attributes = true;
			this.fragment.update();

			if ( this.rendered && this.node ) {
				str = this.fragment.toString();

				attrs = parseAttributes( str, this.isSvg );

				// any attributes that previously existed but no longer do
				// must be removed
				this.attributes.filter( function (a) { return notIn( attrs, a ); } ).forEach( function (a) {
					this$1.node.removeAttribute( a.name );
				});

				attrs.forEach( function (a) {
					this$1.node.setAttribute( a.name, a.value );
				});

				this.attributes = attrs;
			}

			attributes = current || false;
		}
	};

	return ConditionalAttribute;
}(Item));

var onlyWhitespace = /^\s*$/;
function parseAttributes ( str, isSvg ) {
	if ( onlyWhitespace.test( str ) ) { return []; }
	var tagName = isSvg ? 'svg' : 'div';
	return str
		? (div$1.innerHTML = "<" + tagName + " " + str + "></" + tagName + ">") &&
			toArray(div$1.childNodes[0].attributes)
		: [];
}

function notIn ( haystack, needle ) {
	var i = haystack.length;

	while ( i-- ) {
		if ( haystack[i].name === needle.name ) {
			return false;
		}
	}

	return true;
}

function lookupNamespace ( node, prefix ) {
	var qualified = "xmlns:" + prefix;

	while ( node ) {
		if ( node.hasAttribute && node.hasAttribute( qualified ) ) { return node.getAttribute( qualified ); }
		node = node.parentNode;
	}

	return namespaces[ prefix ];
}

var attribute = false;
function inAttribute () { return attribute; }

var Attribute = (function (Item$$1) {
	function Attribute ( options ) {
		Item$$1.call( this, options );

		this.name = options.template.n;
		this.namespace = null;

		this.owner = options.owner || options.parentFragment.owner || options.element || findElement( options.parentFragment );
		this.element = options.element || (this.owner.attributeByName ? this.owner : findElement( options.parentFragment ) );
		this.parentFragment = options.parentFragment; // shared
		this.ractive = this.parentFragment.ractive;

		this.rendered = false;
		this.updateDelegate = null;
		this.fragment = null;

		this.element.attributeByName[ this.name ] = this;

		if ( !Array.isArray( options.template.f ) ) {
			this.value = options.template.f;
			if ( this.value === 0 ) {
				this.value = '';
			} else if ( this.value === undefined ) {
				this.value = true;
			}
		} else {
			this.fragment = new Fragment({
				owner: this,
				template: options.template.f
			});
		}

		this.interpolator = this.fragment &&
			this.fragment.items.length === 1 &&
			this.fragment.items[0].type === INTERPOLATOR &&
			this.fragment.items[0];

		if ( this.interpolator ) { this.interpolator.owner = this; }
	}

	if ( Item$$1 ) Attribute.__proto__ = Item$$1;
	Attribute.prototype = Object.create( Item$$1 && Item$$1.prototype );
	Attribute.prototype.constructor = Attribute;

	Attribute.prototype.bind = function bind () {
		if ( this.fragment ) {
			this.fragment.bind();
		}
	};

	Attribute.prototype.bubble = function bubble () {
		if ( !this.dirty ) {
			this.parentFragment.bubble();
			this.element.bubble();
			this.dirty = true;
		}
	};

	Attribute.prototype.getString = function getString () {
		attribute = true;
		var value = this.fragment ?
			this.fragment.toString() :
			this.value != null ? '' + this.value : '';
		attribute = false;
		return value;
	};

	// TODO could getValue ever be called for a static attribute,
	// or can we assume that this.fragment exists?
	Attribute.prototype.getValue = function getValue () {
		attribute = true;
		var value = this.fragment ? this.fragment.valueOf() : booleanAttributes.test( this.name ) ? true : this.value;
		attribute = false;
		return value;
	};

	Attribute.prototype.render = function render () {
		var node = this.element.node;
		this.node = node;

		// should we use direct property access, or setAttribute?
		if ( !node.namespaceURI || node.namespaceURI === namespaces.html ) {
			this.propertyName = propertyNames[ this.name ] || this.name;

			if ( node[ this.propertyName ] !== undefined ) {
				this.useProperty = true;
			}

			// is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
			// node.selected = true rather than node.setAttribute( 'selected', '' )
			if ( booleanAttributes.test( this.name ) || this.isTwoway ) {
				this.isBoolean = true;
			}

			if ( this.propertyName === 'value' ) {
				node._ractive.value = this.value;
			}
		}

		if ( node.namespaceURI ) {
			var index = this.name.indexOf( ':' );
			if ( index !== -1 ) {
				this.namespace = lookupNamespace( node, this.name.slice( 0, index ) );
			} else {
				this.namespace = node.namespaceURI;
			}
		}

		this.rendered = true;
		this.updateDelegate = getUpdateDelegate( this );
		this.updateDelegate();
	};

	Attribute.prototype.toString = function toString () {
		if ( inAttributes() ) { return ''; }
		attribute = true;

		var value = this.getValue();

		// Special case - select and textarea values (should not be stringified)
		if ( this.name === 'value' && ( this.element.getAttribute( 'contenteditable' ) !== undefined || ( this.element.name === 'select' || this.element.name === 'textarea' ) ) ) {
			return;
		}

		// Special case – bound radio `name` attributes
		if ( this.name === 'name' && this.element.name === 'input' && this.interpolator && this.element.getAttribute( 'type' ) === 'radio' ) {
			return ("name=\"{{" + (this.interpolator.model.getKeypath()) + "}}\"");
		}

		// Special case - style and class attributes and directives
		if ( this.owner === this.element && ( this.name === 'style' || this.name === 'class' || this.style || this.inlineClass ) ) {
			return;
		}

		if ( !this.rendered && this.owner === this.element && ( !this.name.indexOf( 'style-' ) || !this.name.indexOf( 'class-' ) ) ) {
			if ( !this.name.indexOf( 'style-' ) ) {
				this.style = hyphenateCamel( this.name.substr( 6 ) );
			} else {
				this.inlineClass = this.name.substr( 6 );
			}

			return;
		}

		if ( booleanAttributes.test( this.name ) ) { return value ? ( typeof value === 'string' ? ((this.name) + "=\"" + (safeAttributeString(value)) + "\"") : this.name ) : ''; }
		if ( value == null ) { return ''; }

		var str = safeAttributeString( this.getString() );
		attribute = false;

		return str ?
			((this.name) + "=\"" + str + "\"") :
			this.name;
	};

	Attribute.prototype.unbind = function unbind () {
		if ( this.fragment ) { this.fragment.unbind(); }
	};

	Attribute.prototype.unrender = function unrender () {
		this.updateDelegate( true );

		this.rendered = false;
	};

	Attribute.prototype.update = function update () {
		if ( this.dirty ) {
			this.dirty = false;
			if ( this.fragment ) { this.fragment.update(); }
			if ( this.rendered ) { this.updateDelegate(); }
			if ( this.isTwoway && !this.locked ) {
				this.interpolator.twowayBinding.lastVal( true, this.interpolator.model.get() );
			}
		}
	};

	return Attribute;
}(Item));

var BindingFlag = (function (Item$$1) {
	function BindingFlag ( options ) {
		Item$$1.call( this, options );

		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment );
		this.flag = options.template.v === 'l' ? 'lazy' : 'twoway';

		if ( this.element.type === ELEMENT ) {
			if ( Array.isArray( options.template.f ) ) {
				this.fragment = new Fragment({
					owner: this,
					template: options.template.f
				});
			}

			this.interpolator = this.fragment &&
								this.fragment.items.length === 1 &&
								this.fragment.items[0].type === INTERPOLATOR &&
								this.fragment.items[0];
		}
	}

	if ( Item$$1 ) BindingFlag.__proto__ = Item$$1;
	BindingFlag.prototype = Object.create( Item$$1 && Item$$1.prototype );
	BindingFlag.prototype.constructor = BindingFlag;

	BindingFlag.prototype.bind = function bind () {
		if ( this.fragment ) { this.fragment.bind(); }
		set$1( this, this.getValue(), true );
	};

	BindingFlag.prototype.bubble = function bubble () {
		if ( !this.dirty ) {
			this.element.bubble();
			this.dirty = true;
		}
	};

	BindingFlag.prototype.getValue = function getValue () {
		if ( this.fragment ) { return this.fragment.valueOf(); }
		else if ( 'value' in this ) { return this.value; }
		else if ( 'f' in this.template ) { return this.template.f; }
		else { return true; }
	};

	BindingFlag.prototype.render = function render () {
		set$1( this, this.getValue(), true );
	};

	BindingFlag.prototype.toString = function toString () { return ''; };

	BindingFlag.prototype.unbind = function unbind () {
		if ( this.fragment ) { this.fragment.unbind(); }

		delete this.element[ this.flag ];
	};

	BindingFlag.prototype.unrender = function unrender () {
		if ( this.element.rendered ) { this.element.recreateTwowayBinding(); }
	};

	BindingFlag.prototype.update = function update () {
		if ( this.dirty ) {
			if ( this.fragment ) { this.fragment.update(); }
			set$1( this, this.getValue(), true );
		}
	};

	return BindingFlag;
}(Item));

function set$1 ( flag, value, update ) {
	if ( value === 0 ) {
		flag.value = true;
	} else if ( value === 'true' ) {
		flag.value = true;
	} else if ( value === 'false' || value === '0' ) {
		flag.value = false;
	} else {
		flag.value = value;
	}

	var current = flag.element[ flag.flag ];
	flag.element[ flag.flag ] = flag.value;
	if ( update && !flag.element.attributes.binding && current !== flag.value ) {
		flag.element.recreateTwowayBinding();
	}

	return flag.value;
}

var RactiveModel = (function (Model$$1) {
	function RactiveModel ( ractive ) {
		Model$$1.call( this, null, '' );
		this.value = ractive;
		this.isRoot = true;
		this.root = this;
		this.adaptors = [];
		this.ractive = ractive;
	}

	if ( Model$$1 ) RactiveModel.__proto__ = Model$$1;
	RactiveModel.prototype = Object.create( Model$$1 && Model$$1.prototype );
	RactiveModel.prototype.constructor = RactiveModel;

	RactiveModel.prototype.joinKey = function joinKey ( key ) {
		var model = Model$$1.prototype.joinKey.call( this, key );

		if ( ( key === 'root' || key === 'parent' ) && !model.isLink ) { return initLink( model, key ); }
		else if ( key === 'data' ) { return this.ractive.viewmodel; }

		return model;
	};

	RactiveModel.prototype.getKeypath = function getKeypath () {
		return '@this';
	};

	RactiveModel.prototype.retrieve = function retrieve () {
		return this.ractive;
	};

	return RactiveModel;
}(Model));

function initLink ( model, key ) {
	model.applyValue = function ( value ) {
		this.parent.value[ key ] = value;
		if ( value && value.viewmodel ) {
			this.link( value.viewmodel.getRactiveModel(), key );
			this._link.markedAll();
		} else {
			this.link( Object.create( Missing ), key );
			this._link.markedAll();
		}
	};

	model.applyValue( model.parent.ractive[ key ], key );
	model._link.set = function (v) { return model.applyValue( v ); };
	model._link.applyValue = function (v) { return model.applyValue( v ); };
	return model._link;
}

var hasProp$1 = Object.prototype.hasOwnProperty;

var RootModel = (function (Model$$1) {
	function RootModel ( options ) {
		Model$$1.call( this, null, null );

		this.isRoot = true;
		this.root = this;
		this.ractive = options.ractive; // TODO sever this link

		this.value = options.data;
		this.adaptors = options.adapt;
		this.adapt();

		this.computationContext = options.ractive;
		this.computations = {};
	}

	if ( Model$$1 ) RootModel.__proto__ = Model$$1;
	RootModel.prototype = Object.create( Model$$1 && Model$$1.prototype );
	RootModel.prototype.constructor = RootModel;

	RootModel.prototype.attached = function attached ( fragment ) {
		attachImplicits( this, fragment );
	};

	RootModel.prototype.compute = function compute ( key, signature ) {
		var computation = new Computation( this, signature, key );
		this.computations[ escapeKey( key ) ] = computation;

		return computation;
	};

	RootModel.prototype.createLink = function createLink ( keypath, target, targetPath, options ) {
		var keys = splitKeypath( keypath );

		var model = this;
		while ( keys.length ) {
			var key = keys.shift();
			model = model.childByKey[ key ] || model.joinKey( key );
		}

		return model.link( target, targetPath, options );
	};

	RootModel.prototype.detached = function detached () {
		detachImplicits( this );
	};

	RootModel.prototype.get = function get ( shouldCapture, options ) {
		var this$1 = this;

		if ( shouldCapture ) { capture( this ); }

		if ( !options || options.virtual !== false ) {
			var result = this.getVirtual();
			var keys = Object.keys( this.computations );
			var i = keys.length;
			while ( i-- ) {
				result[ keys[i] ] = this$1.computations[ keys[i] ].get();
			}

			return result;
		} else {
			return this.value;
		}
	};

	RootModel.prototype.getKeypath = function getKeypath () {
		return '';
	};

	RootModel.prototype.getRactiveModel = function getRactiveModel () {
		return this.ractiveModel || ( this.ractiveModel = new RactiveModel( this.ractive ) );
	};

	RootModel.prototype.getValueChildren = function getValueChildren () {
		var this$1 = this;

		var children = Model$$1.prototype.getValueChildren.call( this, this.value );

		this.children.forEach( function (child) {
			if ( child._link ) {
				var idx = children.indexOf( child );
				if ( ~idx ) { children.splice( idx, 1, child._link ); }
				else { children.push( child._link ); }
			}
		});

		for ( var k in this$1.computations ) {
			children.push( this$1.computations[k] );
		}

		return children;
	};

	RootModel.prototype.has = function has ( key ) {
		var value = this.value;
		var unescapedKey = unescapeKey( key );

		if ( unescapedKey === '@this' || unescapedKey === '@global' || unescapedKey === '@shared' ) { return true; }
		if ( unescapedKey[0] === '~' && unescapedKey[1] === '/' ) { unescapedKey = unescapedKey.slice( 2 ); }
		if ( key === '' || hasProp$1.call( value, unescapedKey ) ) { return true; }

		// mappings/links and computations
		if ( key in this.computations || this.childByKey[unescapedKey] && this.childByKey[unescapedKey]._link ) { return true; }

		// We climb up the constructor chain to find if one of them contains the unescapedKey
		var constructor = value.constructor;
		while ( constructor !== Function && constructor !== Array && constructor !== Object ) {
			if ( hasProp$1.call( constructor.prototype, unescapedKey ) ) { return true; }
			constructor = constructor.constructor;
		}

		return false;
	};

	RootModel.prototype.joinKey = function joinKey ( key, opts ) {
		if ( key[0] === '@' ) {
			if ( key === '@this' || key === '@' ) { return this.getRactiveModel(); }
			if ( key === '@global' ) { return GlobalModel; }
			if ( key === '@shared' ) { return SharedModel$1; }
			return;
		}

		if ( key[0] === '~' && key[1] === '/' ) { key = key.slice( 2 ); }

		return this.computations.hasOwnProperty( key ) ? this.computations[ key ] :
		       Model$$1.prototype.joinKey.call( this, key, opts );
	};

	RootModel.prototype.set = function set ( value ) {
		// TODO wrapping root node is a baaaad idea. We should prevent this
		var wrapper = this.wrapper;
		if ( wrapper ) {
			var shouldTeardown = !wrapper.reset || wrapper.reset( value ) === false;

			if ( shouldTeardown ) {
				wrapper.teardown();
				this.wrapper = null;
				this.value = value;
				this.adapt();
			}
		} else {
			this.value = value;
			this.adapt();
		}

		this.deps.forEach( handleChange );
		this.children.forEach( mark );
	};

	RootModel.prototype.retrieve = function retrieve () {
		return this.wrapper ? this.wrapper.get() : this.value;
	};

	RootModel.prototype.teardown = function teardown$$1 () {
		var this$1 = this;

		Model$$1.prototype.teardown.call(this);
		for ( var k in this$1.computations ) {
			this$1.computations[ k ].teardown();
		}
	};

	return RootModel;
}(Model));

RootModel.prototype.update = noop;

function attachImplicits ( model, fragment ) {
	if ( model._link && model._link.implicit && model._link.isDetached() ) {
		model.attach( fragment );
	}

	// look for virtual children to relink and cascade
	for ( var k in model.childByKey ) {
		if ( k in model.value ) {
			attachImplicits( model.childByKey[k], fragment );
		} else if ( !model.childByKey[k]._link || model.childByKey[k]._link.isDetached() ) {
			var mdl = resolveReference( fragment, k );
			if ( mdl ) {
				model.childByKey[k].link( mdl, k, { implicit: true } );
			}
		}
	}
}

function detachImplicits ( model ) {
	if ( model._link && model._link.implicit ) {
		model.unlink();
	}

	for ( var k in model.childByKey ) {
		detachImplicits( model.childByKey[k] );
	}
}

function getComputationSignature ( ractive, key, signature ) {
	var getter;
	var setter;

	// useful for debugging
	var getterString;
	var getterUseStack;
	var setterString;

	if ( typeof signature === 'function' ) {
		getter = bind$1( signature, ractive );
		getterString = signature.toString();
		getterUseStack = true;
	}

	if ( typeof signature === 'string' ) {
		getter = createFunctionFromString( signature, ractive );
		getterString = signature;
	}

	if ( typeof signature === 'object' ) {
		if ( typeof signature.get === 'string' ) {
			getter = createFunctionFromString( signature.get, ractive );
			getterString = signature.get;
		} else if ( typeof signature.get === 'function' ) {
			getter = bind$1( signature.get, ractive );
			getterString = signature.get.toString();
			getterUseStack = true;
		} else {
			fatal( '`%s` computation must have a `get()` method', key );
		}

		if ( typeof signature.set === 'function' ) {
			setter = bind$1( signature.set, ractive );
			setterString = signature.set.toString();
		}
	}

	return {
		getter: getter,
		setter: setter,
		getterString: getterString,
		setterString: setterString,
		getterUseStack: getterUseStack
	};
}

var constructHook = new Hook( 'construct' );

var registryNames$1 = [
	'adaptors',
	'components',
	'decorators',
	'easing',
	'events',
	'interpolators',
	'partials',
	'transitions'
];

var uid = 0;

function construct ( ractive, options ) {
	if ( Ractive.DEBUG ) { welcome(); }

	initialiseProperties( ractive );
	handleAttributes( ractive );

	// if there's not a delegation setting, inherit from parent if it's not default
	if ( !options.hasOwnProperty( 'delegate' ) && ractive.parent && ractive.parent.delegate !== ractive.delegate ) {
		ractive.delegate = false;
	}

	// TODO don't allow `onconstruct` with `new Ractive()`, there's no need for it
	constructHook.fire( ractive, options );

	// Add registries
	var i = registryNames$1.length;
	while ( i-- ) {
		var name = registryNames$1[ i ];
		ractive[ name ] = Object.assign( Object.create( ractive.constructor[ name ] || null ), options[ name ] );
	}

	if ( ractive._attributePartial ) {
		ractive.partials['extra-attributes'] = ractive._attributePartial;
		delete ractive._attributePartial;
	}

	// Create a viewmodel
	var viewmodel = new RootModel({
		adapt: getAdaptors( ractive, ractive.adapt, options ),
		data: dataConfigurator.init( ractive.constructor, ractive, options ),
		ractive: ractive
	});

	ractive.viewmodel = viewmodel;

	// Add computed properties
	var computed = Object.assign( Object.create( ractive.constructor.prototype.computed ), options.computed );

	for ( var key in computed ) {
		if ( key === '__proto__' ) { continue; }
		var signature = getComputationSignature( ractive, key, computed[ key ] );
		viewmodel.compute( key, signature );
	}
}

function getAdaptors ( ractive, protoAdapt, options ) {
	protoAdapt = protoAdapt.map( lookup );
	var adapt = ensureArray( options.adapt ).map( lookup );

	var srcs = [ protoAdapt, adapt ];
	if ( ractive.parent && !ractive.isolated ) {
		srcs.push( ractive.parent.viewmodel.adaptors );
	}

	return combine.apply( null, srcs );

	function lookup ( adaptor ) {
		if ( typeof adaptor === 'string' ) {
			adaptor = findInViewHierarchy( 'adaptors', ractive, adaptor );

			if ( !adaptor ) {
				fatal( missingPlugin( adaptor, 'adaptor' ) );
			}
		}

		return adaptor;
	}
}

function initialiseProperties ( ractive ) {
	// Generate a unique identifier, for places where you'd use a weak map if it
	// existed
	ractive._guid = 'r-' + uid++;

	// events
	ractive._subs = Object.create( null );
	ractive._nsSubs = 0;

	// storage for item configuration from instantiation to reset,
	// like dynamic functions or original values
	ractive._config = {};

	// events
	ractive.event = null;
	ractive._eventQueue = [];

	// observers
	ractive._observers = [];

	// external children
	ractive._children = [];
	ractive._children.byName = {};
	ractive.children = ractive._children;

	if ( !ractive.component ) {
		ractive.root = ractive;
		ractive.parent = ractive.container = null; // TODO container still applicable?
	}
}

function handleAttributes ( ractive ) {
	var component = ractive.component;
	var attributes = ractive.constructor.attributes;

	if ( attributes && component ) {
		var tpl = component.template;
		var attrs = tpl.m ? tpl.m.slice() : [];

		// grab all of the passed attribute names
		var props = attrs.filter( function (a) { return a.t === ATTRIBUTE; } ).map( function (a) { return a.n; } );

		// warn about missing requireds
		attributes.required.forEach( function (p) {
			if ( !~props.indexOf( p ) ) {
				warnIfDebug( ("Component '" + (component.name) + "' requires attribute '" + p + "' to be provided") );
			}
		});

		// set up a partial containing non-property attributes
		var all = attributes.optional.concat( attributes.required );
		var partial = [];
		var i = attrs.length;
		while ( i-- ) {
			var a = attrs[i];
			if ( a.t === ATTRIBUTE && !~all.indexOf( a.n ) ) {
				if ( attributes.mapAll ) {
					// map the attribute if requested and make the extra attribute in the partial refer to the mapping
					partial.unshift({ t: ATTRIBUTE, n: a.n, f: [{ t: INTERPOLATOR, r: ("~/" + (a.n)) }] });
				} else {
					// transfer the attribute to the extra attributes partal
					partial.unshift( attrs.splice( i, 1 )[0] );
				}
			}
		}

		if ( partial.length ) { component.template = { t: tpl.t, e: tpl.e, f: tpl.f, m: attrs, p: tpl.p }; }
		ractive._attributePartial = partial;
	}
}

var teardownHook = new Hook( 'teardown' );
var destructHook = new Hook( 'destruct' );

// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself

function Ractive$teardown () {
	var this$1 = this;

	if ( this.torndown ) {
		warnIfDebug( 'ractive.teardown() was called on a Ractive instance that was already torn down' );
		return Promise.resolve();
	}

	this.shouldDestroy = true;
	return teardown$1( this, function () { return this$1.fragment.rendered ? this$1.unrender() : Promise.resolve(); } );
}

function teardown$1 ( instance, getPromise ) {
	instance.torndown = true;
	instance.viewmodel.teardown();
	instance.fragment.unbind();
	instance._observers.slice().forEach( cancel );

	if ( instance.el && instance.el.__ractive_instances__ ) {
		removeFromArray( instance.el.__ractive_instances__, instance );
	}

	var promise = getPromise();

	teardownHook.fire( instance );
	promise.then( function () { return destructHook.fire( instance ); } );

	return promise;
}

var Component = (function (Item$$1) {
	function Component ( options, ComponentConstructor ) {
		var this$1 = this;

		Item$$1.call( this, options );
		this.isAnchor = this.template.t === ANCHOR;
		this.type = this.isAnchor ? ANCHOR : COMPONENT; // override ELEMENT from super

		var partials = options.template.p || {};
		if ( !( 'content' in partials ) ) { partials.content = options.template.f || []; }
		this._partials = partials; // TEMP

		if ( this.isAnchor ) {
			this.name = options.template.n;

			this.addChild = addChild;
			this.removeChild = removeChild;
		} else {
			var instance = Object.create( ComponentConstructor.prototype );

			this.instance = instance;
			this.name = options.template.e;

			if ( instance.el ) {
				warnIfDebug( ("The <" + (this.name) + "> component has a default 'el' property; it has been disregarded") );
			}

			// find container
			var fragment = options.parentFragment;
			var container;
			while ( fragment ) {
				if ( fragment.owner.type === YIELDER ) {
					container = fragment.owner.container;
					break;
				}

				fragment = fragment.parent;
			}

			// add component-instance-specific properties
			instance.parent = this.parentFragment.ractive;
			instance.container = container || null;
			instance.root = instance.parent.root;
			instance.component = this;

			construct( this.instance, { partials: partials });

			// for hackability, this could be an open option
			// for any ractive instance, but for now, just
			// for components and just for ractive...
			instance._inlinePartials = partials;
		}

		this.attributeByName = {};

		this.attributes = [];
		var leftovers = [];
		( this.template.m || [] ).forEach( function (template) {
			switch ( template.t ) {
				case ATTRIBUTE:
				case EVENT:
					this$1.attributes.push( createItem({
						owner: this$1,
						parentFragment: this$1.parentFragment,
						template: template
					}) );
					break;

				case TRANSITION:
				case BINDING_FLAG:
				case DECORATOR:
					break;

				default:
					leftovers.push( template );
					break;
			}
		});

		if ( leftovers.length ) {
			this.attributes.push( new ConditionalAttribute({
				owner: this,
				parentFragment: this.parentFragment,
				template: leftovers
			}) );
		}

		this.eventHandlers = [];
	}

	if ( Item$$1 ) Component.__proto__ = Item$$1;
	Component.prototype = Object.create( Item$$1 && Item$$1.prototype );
	Component.prototype.constructor = Component;

	Component.prototype.bind = function bind$1 () {
		if ( !this.isAnchor ) {
			this.attributes.forEach( bind );

			initialise( this.instance, {
				partials: this._partials
			}, {
				cssIds: this.parentFragment.cssIds
			});

			this.eventHandlers.forEach( bind );

			this.bound = true;
		}
	};

	Component.prototype.bubble = function bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.parentFragment.bubble();
		}
	};

	Component.prototype.destroyed = function destroyed$$1 () {
		if ( !this.isAnchor && this.instance.fragment ) { this.instance.fragment.destroyed(); }
	};

	Component.prototype.detach = function detach () {
		if ( this.isAnchor ) {
			if ( this.instance ) { return this.instance.fragment.detach(); }
			return createDocumentFragment();
		}

		return this.instance.fragment.detach();
	};

	Component.prototype.find = function find ( selector, options ) {
		if ( this.instance ) { return this.instance.fragment.find( selector, options ); }
	};

	Component.prototype.findAll = function findAll ( selector, options ) {
		if ( this.instance ) { this.instance.fragment.findAll( selector, options ); }
	};

	Component.prototype.findComponent = function findComponent ( name, options ) {
		if ( !name || this.name === name ) { return this.instance; }

		if ( this.instance.fragment ) {
			return this.instance.fragment.findComponent( name, options );
		}
	};

	Component.prototype.findAllComponents = function findAllComponents ( name, options ) {
		var result = options.result;

		if ( this.instance && ( !name || this.name === name ) ) {
			result.push( this.instance );
		}

		if ( this.instance ) { this.instance.findAllComponents( name, options ); }
	};

	Component.prototype.firstNode = function firstNode ( skipParent ) {
		if ( this.instance ) { return this.instance.fragment.firstNode( skipParent ); }
	};

	Component.prototype.getContext = function getContext$$1 () {
		var assigns = [], len = arguments.length;
		while ( len-- ) assigns[ len ] = arguments[ len ];

		assigns.unshift( this.instance );
		return getRactiveContext.apply( null, assigns );
	};

	Component.prototype.render = function render$1$$1 ( target, occupants ) {
		if ( this.isAnchor ) {
			this.rendered = true;
			this.target = target;

			if ( !checking.length ) {
				checking.push( this.ractive );
				if ( occupants ) {
					this.occupants = occupants;
					checkAnchors();
					this.occupants = null;
				} else {
					runloop.scheduleTask( checkAnchors, true );
				}
			}
		} else {
			render$1( this.instance, target, null, occupants );

			this.attributes.forEach( render );
			this.eventHandlers.forEach( render );

			this.rendered = true;
		}
	};

	Component.prototype.toString = function toString$$1 () {
		if ( this.instance ) { return this.instance.toHTML(); }
	};

	Component.prototype.unbind = function unbind$1 () {
		if ( !this.isAnchor ) {
			this.bound = false;

			this.attributes.forEach( unbind );

			teardown$1( this.instance, function () { return runloop.promise(); } );
		}
	};

	Component.prototype.unrender = function unrender$1 ( shouldDestroy ) {
		this.shouldDestroy = shouldDestroy;

		if ( this.isAnchor ) {
			if ( this.item ) { unrenderItem( this, this.item ); }
			this.target = null;
			if ( !checking.length ) {
				checking.push( this.ractive );
				runloop.scheduleTask( checkAnchors, true );
			}
		} else {
			this.instance.unrender();
			this.instance.el = this.instance.target = null;
			this.attributes.forEach( unrender );
			this.eventHandlers.forEach( unrender );
		}

		this.rendered = false;
	};

	Component.prototype.update = function update$1 () {
		this.dirty = false;
		if ( this.instance ) {
			this.instance.fragment.update();
			this.attributes.forEach( update );
			this.eventHandlers.forEach( update );
		}
	};

	return Component;
}(Item));

function addChild ( meta ) {
	if ( this.item ) { this.removeChild( this.item ); }

	var child = meta.instance;
	meta.anchor = this;

	meta.parentFragment = this.parentFragment;
	meta.name = meta.nameOption || this.name;
	this.name = meta.name;


	if ( !child.isolated ) { child.viewmodel.attached( this.parentFragment ); }

	// render as necessary
	if ( this.rendered ) {
		renderItem( this, meta );
	}
}

function removeChild ( meta ) {
	// unrender as necessary
	if ( this.item === meta ) {
		unrenderItem( this, meta );
		this.name = this.template.n;
	}
}

function renderItem ( anchor, meta ) {
	if ( !anchor.rendered ) { return; }

	meta.shouldDestroy = false;
	meta.parentFragment = anchor.parentFragment;

	anchor.item = meta;
	anchor.instance = meta.instance;
	var nextNode = anchor.parentFragment.findNextNode( anchor );

	if ( meta.instance.fragment.rendered ) {
		meta.instance.unrender();
	}

	meta.partials = meta.instance.partials;
	meta.instance.partials = Object.assign( {}, meta.partials, anchor._partials );

	meta.instance.fragment.unbind();
	meta.instance.fragment.bind( meta.instance.viewmodel );

	anchor.attributes.forEach( bind );
	anchor.eventHandlers.forEach( bind );
	anchor.attributes.forEach( render );
	anchor.eventHandlers.forEach( render );

	var target = anchor.parentFragment.findParentNode();
	render$1( meta.instance, target, target.contains( nextNode ) ? nextNode : null, anchor.occupants );

	if ( meta.lastBound !== anchor ) {
		meta.lastBound = anchor;
	}
}

function unrenderItem ( anchor, meta ) {
	if ( !anchor.rendered ) { return; }

	meta.shouldDestroy = true;
	meta.instance.unrender();

	anchor.eventHandlers.forEach( unrender );
	anchor.attributes.forEach( unrender );
	anchor.eventHandlers.forEach( unbind );
	anchor.attributes.forEach( unbind );

	meta.instance.el = meta.instance.anchor = null;
	meta.parentFragment = null;
	meta.anchor = null;
	anchor.item = null;
	anchor.instance = null;
}

var checking = [];
function checkAnchors () {
	var list = checking;
	checking = [];

	list.forEach( updateAnchors );
}

function setupArgsFn ( item, template, fragment, opts ) {
	if ( opts === void 0 ) opts = {};

	if ( template && template.f && template.f.s ) {
		item.fn = getFunction( template.f.s, template.f.r.length );
		if ( opts.register === true ) {
			item.models = resolveArgs( item, template, fragment, opts );
		}
	}
}

function resolveArgs ( item, template, fragment, opts ) {
	if ( opts === void 0 ) opts = {};

	return template.f.r.map( function ( ref, i ) {
		var model;

		if ( opts.specialRef && ( model = opts.specialRef( ref, i ) ) ) { return model; }

		model = resolveReference( fragment, ref );
		if ( opts.register === true ) {
			model.register( item );
		}

		return model;
	});
}

function teardownArgsFn ( item, template ) {
	if ( template && template.f && template.f.s ) {
		if ( item.models ) { item.models.forEach( function (m) {
			if ( m && m.unregister ) { m.unregister( item ); }
		}); }
		item.models = null;
	}
}

var missingDecorator = {
	update: noop,
	teardown: noop
};

var Decorator = function Decorator ( options ) {
	this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
	this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment );
	this.parentFragment = this.owner.parentFragment;
	this.ractive = this.owner.ractive;
	var template = this.template = options.template;

	this.name = template.n;

	this.node = null;
	this.intermediary = null;

	this.element.decorators.push( this );
};

Decorator.prototype.bind = function bind () {
	setupArgsFn( this, this.template, this.parentFragment, { register: true } );
};

Decorator.prototype.bubble = function bubble () {
	if ( !this.dirty ) {
		this.dirty = true;
		this.owner.bubble();
	}
};

Decorator.prototype.destroyed = function destroyed () {
	if ( this.intermediary ) { this.intermediary.teardown(); }
	this.shouldDestroy = true;
};

Decorator.prototype.handleChange = function handleChange () { this.bubble(); };

Decorator.prototype.rebind = function rebind ( next, previous, safe ) {
	var idx = this.models.indexOf( previous );
	if ( !~idx ) { return; }

	next = rebindMatch( this.template.f.r[ idx ], next, previous );
	if ( next === previous ) { return; }

	previous.unregister( this );
	this.models.splice( idx, 1, next );
	if ( next ) { next.addShuffleRegister( this, 'mark' ); }

	if ( !safe ) { this.bubble(); }
};

Decorator.prototype.render = function render () {
		var this$1 = this;

	runloop.scheduleTask( function () {
		var fn = findInViewHierarchy( 'decorators', this$1.ractive, this$1.name );

		if ( !fn ) {
			warnOnce( missingPlugin( this$1.name, 'decorator' ) );
			this$1.intermediary = missingDecorator;
			return;
		}

		this$1.node = this$1.element.node;

		var args;
		if ( this$1.fn ) {
			args = this$1.models.map( function (model) {
				if ( !model ) { return undefined; }

				return model.get();
			});
			args = this$1.fn.apply( this$1.ractive, args );
		}

		this$1.intermediary = fn.apply( this$1.ractive, [ this$1.node ].concat( args ) );

		if ( !this$1.intermediary || !this$1.intermediary.teardown ) {
			throw new Error( ("The '" + (this$1.name) + "' decorator must return an object with a teardown method") );
		}

		// watch out for decorators that cause their host element to be unrendered
		if ( this$1.shouldDestroy ) { this$1.destroyed(); }
	}, true );
	this.rendered = true;
};

Decorator.prototype.toString = function toString () { return ''; };

Decorator.prototype.unbind = function unbind () {
	teardownArgsFn( this, this.template );
};

Decorator.prototype.unrender = function unrender ( shouldDestroy ) {
	if ( ( !shouldDestroy || this.element.rendered ) && this.intermediary ) { this.intermediary.teardown(); }
	this.rendered = false;
};

Decorator.prototype.update = function update () {
	var instance = this.intermediary;

	if ( !this.dirty ) {
		if ( instance && instance.invalidate ) {
			runloop.scheduleTask( function () { return instance.invalidate(); }, true );
		}
		return;
	}

	this.dirty = false;

	if ( instance ) {
		if ( !instance.update ) {
			this.unrender();
			this.render();
		}
		else {
			var args = this.models.map( function (model) { return model && model.get(); } );
			instance.update.apply( this.ractive, this.fn.apply( this.ractive, args ) );
		}
	}
};

var Doctype = (function (Item$$1) {
	function Doctype () {
		Item$$1.apply(this, arguments);
	}

	if ( Item$$1 ) Doctype.__proto__ = Item$$1;
	Doctype.prototype = Object.create( Item$$1 && Item$$1.prototype );
	Doctype.prototype.constructor = Doctype;

	Doctype.prototype.toString = function toString () {
		return '<!DOCTYPE' + this.template.a + '>';
	};

	return Doctype;
}(Item));

var proto$2 = Doctype.prototype;
proto$2.bind = proto$2.render = proto$2.teardown = proto$2.unbind = proto$2.unrender = proto$2.update = noop;

var Binding = function Binding ( element, name ) {
	if ( name === void 0 ) name = 'value';

	this.element = element;
	this.ractive = element.ractive;
	this.attribute = element.attributeByName[ name ];

	var interpolator = this.attribute.interpolator;
	interpolator.twowayBinding = this;

	var model = interpolator.model;

	if ( model.isReadonly && !model.setRoot ) {
		var keypath = model.getKeypath().replace( /^@/, '' );
		warnOnceIfDebug( ("Cannot use two-way binding on <" + (element.name) + "> element: " + keypath + " is read-only. To suppress this warning use <" + (element.name) + " twoway='false'...>"), { ractive: this.ractive });
		return false;
	}

	this.attribute.isTwoway = true;
	this.model = model;

	// initialise value, if it's undefined
	var value = model.get();
	this.wasUndefined = value === undefined;

	if ( value === undefined && this.getInitialValue ) {
		value = this.getInitialValue();
		model.set( value );
	}
	this.lastVal( true, value );

	var parentForm = findElement( this.element, false, 'form' );
	if ( parentForm ) {
		this.resetValue = value;
		parentForm.formBindings.push( this );
	}
};

Binding.prototype.bind = function bind () {
	this.model.registerTwowayBinding( this );
};

Binding.prototype.handleChange = function handleChange () {
		var this$1 = this;

	var value = this.getValue();
	if ( this.lastVal() === value ) { return; }

	runloop.start( this.root );
	this.attribute.locked = true;
	this.model.set( value );
	this.lastVal( true, value );

	// if the value changes before observers fire, unlock to be updatable cause something weird and potentially freezy is up
	if ( this.model.get() !== value ) { this.attribute.locked = false; }
	else { runloop.scheduleTask( function () { return this$1.attribute.locked = false; } ); }

	runloop.end();
};

Binding.prototype.lastVal = function lastVal ( setting, value ) {
	if ( setting ) { this.lastValue = value; }
	else { return this.lastValue; }
};

Binding.prototype.rebind = function rebind ( next, previous ) {
		var this$1 = this;

	if ( this.model && this.model === previous ) { previous.unregisterTwowayBinding( this ); }
	if ( next ) {
		this.model = next;
		runloop.scheduleTask( function () { return next.registerTwowayBinding( this$1 ); } );
	}
};

Binding.prototype.render = function render () {
	this.node = this.element.node;
	this.node._ractive.binding = this;
	this.rendered = true; // TODO is this used anywhere?
};

Binding.prototype.setFromNode = function setFromNode ( node ) {
	this.model.set( node.value );
};

Binding.prototype.unbind = function unbind () {
	this.model.unregisterTwowayBinding( this );
};

Binding.prototype.unrender = noop;

// This is the handler for DOM events that would lead to a change in the model
// (i.e. change, sometimes, input, and occasionally click and keyup)
function handleDomEvent () {
	this._ractive.binding.handleChange();
}

var CheckboxBinding = (function (Binding$$1) {
	function CheckboxBinding ( element ) {
		Binding$$1.call( this, element, 'checked' );
	}

	if ( Binding$$1 ) CheckboxBinding.__proto__ = Binding$$1;
	CheckboxBinding.prototype = Object.create( Binding$$1 && Binding$$1.prototype );
	CheckboxBinding.prototype.constructor = CheckboxBinding;

	CheckboxBinding.prototype.render = function render () {
		Binding$$1.prototype.render.call(this);

		this.element.on( 'change', handleDomEvent );

		if ( this.node.attachEvent ) {
			this.element.on( 'click', handleDomEvent );
		}
	};

	CheckboxBinding.prototype.unrender = function unrender () {
		this.element.off( 'change', handleDomEvent );
		this.element.off( 'click', handleDomEvent );
	};

	CheckboxBinding.prototype.getInitialValue = function getInitialValue () {
		return !!this.element.getAttribute( 'checked' );
	};

	CheckboxBinding.prototype.getValue = function getValue () {
		return this.node.checked;
	};

	CheckboxBinding.prototype.setFromNode = function setFromNode ( node ) {
		this.model.set( node.checked );
	};

	return CheckboxBinding;
}(Binding));

function getBindingGroup ( group, model, getValue ) {
	var hash = group + "-bindingGroup";
	return model[hash] || ( model[ hash ] = new BindingGroup( hash, model, getValue ) );
}

var BindingGroup = function BindingGroup ( hash, model, getValue ) {
	var this$1 = this;

	this.model = model;
	this.hash = hash;
	this.getValue = function () {
		this$1.value = getValue.call(this$1);
		return this$1.value;
	};

	this.bindings = [];
};

BindingGroup.prototype.add = function add ( binding ) {
	this.bindings.push( binding );
};

BindingGroup.prototype.bind = function bind () {
	this.value = this.model.get();
	this.model.registerTwowayBinding( this );
	this.bound = true;
};

BindingGroup.prototype.remove = function remove ( binding ) {
	removeFromArray( this.bindings, binding );
	if ( !this.bindings.length ) {
		this.unbind();
	}
};

BindingGroup.prototype.unbind = function unbind () {
	this.model.unregisterTwowayBinding( this );
	this.bound = false;
	delete this.model[this.hash];
};

BindingGroup.prototype.rebind = Binding.prototype.rebind;

var push$1 = [].push;

function getValue() {
	var this$1 = this;

	var all = this.bindings.filter(function (b) { return b.node && b.node.checked; }).map(function (b) { return b.element.getAttribute( 'value' ); });
	var res = [];
	all.forEach(function (v) { if ( !this$1.bindings[0].arrayContains( res, v ) ) { res.push( v ); } });
	return res;
}

var CheckboxNameBinding = (function (Binding$$1) {
	function CheckboxNameBinding ( element ) {
		Binding$$1.call( this, element, 'name' );

		this.checkboxName = true; // so that ractive.updateModel() knows what to do with this

		// Each input has a reference to an array containing it and its
		// group, as two-way binding depends on being able to ascertain
		// the status of all inputs within the group
		this.group = getBindingGroup( 'checkboxes', this.model, getValue );
		this.group.add( this );

		if ( this.noInitialValue ) {
			this.group.noInitialValue = true;
		}

		// If no initial value was set, and this input is checked, we
		// update the model
		if ( this.group.noInitialValue && this.element.getAttribute( 'checked' ) ) {
			var existingValue = this.model.get();
			var bindingValue = this.element.getAttribute( 'value' );

			if ( !this.arrayContains( existingValue, bindingValue ) ) {
				push$1.call( existingValue, bindingValue ); // to avoid triggering runloop with array adaptor
			}
		}
	}

	if ( Binding$$1 ) CheckboxNameBinding.__proto__ = Binding$$1;
	CheckboxNameBinding.prototype = Object.create( Binding$$1 && Binding$$1.prototype );
	CheckboxNameBinding.prototype.constructor = CheckboxNameBinding;

	CheckboxNameBinding.prototype.bind = function bind () {
		if ( !this.group.bound ) {
			this.group.bind();
		}
	};

	CheckboxNameBinding.prototype.getInitialValue = function getInitialValue () {
		// This only gets called once per group (of inputs that
		// share a name), because it only gets called if there
		// isn't an initial value. By the same token, we can make
		// a note of that fact that there was no initial value,
		// and populate it using any `checked` attributes that
		// exist (which users should avoid, but which we should
		// support anyway to avoid breaking expectations)
		this.noInitialValue = true; // TODO are noInitialValue and wasUndefined the same thing?
		return [];
	};

	CheckboxNameBinding.prototype.getValue = function getValue () {
		return this.group.value;
	};

	CheckboxNameBinding.prototype.handleChange = function handleChange () {
		this.isChecked = this.element.node.checked;
		this.group.value = this.model.get();
		var value = this.element.getAttribute( 'value' );
		if ( this.isChecked && !this.arrayContains( this.group.value, value ) ) {
			this.group.value.push( value );
		} else if ( !this.isChecked && this.arrayContains( this.group.value, value ) ) {
			this.removeFromArray( this.group.value, value );
		}
		// make sure super knows there's a change
		this.lastValue = null;
		Binding$$1.prototype.handleChange.call(this);
	};

	CheckboxNameBinding.prototype.render = function render () {
		Binding$$1.prototype.render.call(this);

		var node = this.node;

		var existingValue = this.model.get();
		var bindingValue = this.element.getAttribute( 'value' );

		if ( Array.isArray( existingValue ) ) {
			this.isChecked = this.arrayContains( existingValue, bindingValue );
		} else {
			this.isChecked = this.element.compare( existingValue, bindingValue );
		}
		node.name = '{{' + this.model.getKeypath() + '}}';
		node.checked = this.isChecked;

		this.element.on( 'change', handleDomEvent );

		// in case of IE emergency, bind to click event as well
		if ( this.node.attachEvent ) {
			this.element.on( 'click', handleDomEvent );
		}
	};

	CheckboxNameBinding.prototype.setFromNode = function setFromNode ( node ) {
		this.group.bindings.forEach( function (binding) { return binding.wasUndefined = true; } );

		if ( node.checked ) {
			var valueSoFar = this.group.getValue();
			valueSoFar.push( this.element.getAttribute( 'value' ) );

			this.group.model.set( valueSoFar );
		}
	};

	CheckboxNameBinding.prototype.unbind = function unbind () {
		this.group.remove( this );
	};

	CheckboxNameBinding.prototype.unrender = function unrender () {
		var el = this.element;

		el.off( 'change', handleDomEvent );
		el.off( 'click', handleDomEvent );
	};

	CheckboxNameBinding.prototype.arrayContains = function arrayContains ( selectValue, optionValue ) {
		var this$1 = this;

		var i = selectValue.length;
		while ( i-- ) {
			if ( this$1.element.compare( optionValue, selectValue[i] ) ) { return true; }
		}
		return false;
	};

	CheckboxNameBinding.prototype.removeFromArray = function removeFromArray ( array, item ) {
		var this$1 = this;

		if (!array) { return; }
		var i = array.length;
		while( i-- ) {
			if ( this$1.element.compare( item, array[i] ) ) {
				array.splice( i, 1 );
			}
		}
	};

	return CheckboxNameBinding;
}(Binding));

var ContentEditableBinding = (function (Binding$$1) {
	function ContentEditableBinding () {
		Binding$$1.apply(this, arguments);
	}

	if ( Binding$$1 ) ContentEditableBinding.__proto__ = Binding$$1;
	ContentEditableBinding.prototype = Object.create( Binding$$1 && Binding$$1.prototype );
	ContentEditableBinding.prototype.constructor = ContentEditableBinding;

	ContentEditableBinding.prototype.getInitialValue = function getInitialValue () {
		return this.element.fragment ? this.element.fragment.toString() : '';
	};

	ContentEditableBinding.prototype.getValue = function getValue () {
		return this.element.node.innerHTML;
	};

	ContentEditableBinding.prototype.render = function render () {
		Binding$$1.prototype.render.call(this);

		var el = this.element;

		el.on( 'change', handleDomEvent );
		el.on( 'blur', handleDomEvent );

		if ( !this.ractive.lazy ) {
			el.on( 'input', handleDomEvent );

			if ( this.node.attachEvent ) {
				el.on( 'keyup', handleDomEvent );
			}
		}
	};

	ContentEditableBinding.prototype.setFromNode = function setFromNode ( node ) {
		this.model.set( node.innerHTML );
	};

	ContentEditableBinding.prototype.unrender = function unrender () {
		var el = this.element;

		el.off( 'blur', handleDomEvent );
		el.off( 'change', handleDomEvent );
		el.off( 'input', handleDomEvent );
		el.off( 'keyup', handleDomEvent );
	};

	return ContentEditableBinding;
}(Binding));

function handleBlur () {
	handleDomEvent.call( this );

	var value = this._ractive.binding.model.get();
	this.value = value == undefined ? '' : value;
}

function handleDelay ( delay ) {
	var timeout;

	return function () {
		var this$1 = this;

		if ( timeout ) { clearTimeout( timeout ); }

		timeout = setTimeout( function () {
			var binding = this$1._ractive.binding;
			if ( binding.rendered ) { handleDomEvent.call( this$1 ); }
			timeout = null;
		}, delay );
	};
}

var GenericBinding = (function (Binding$$1) {
	function GenericBinding () {
		Binding$$1.apply(this, arguments);
	}

	if ( Binding$$1 ) GenericBinding.__proto__ = Binding$$1;
	GenericBinding.prototype = Object.create( Binding$$1 && Binding$$1.prototype );
	GenericBinding.prototype.constructor = GenericBinding;

	GenericBinding.prototype.getInitialValue = function getInitialValue () {
		return '';
	};

	GenericBinding.prototype.getValue = function getValue () {
		return this.node.value;
	};

	GenericBinding.prototype.render = function render () {
		Binding$$1.prototype.render.call(this);

		// any lazy setting for this element overrides the root
		// if the value is a number, it's a timeout
		var lazy = this.ractive.lazy;
		var timeout = false;
		var el = this.element;

		if ( 'lazy' in this.element ) {
			lazy = this.element.lazy;
		}

		if ( isNumeric( lazy ) ) {
			timeout = +lazy;
			lazy = false;
		}

		this.handler = timeout ? handleDelay( timeout ) : handleDomEvent;

		var node = this.node;

		el.on( 'change', handleDomEvent );

		if ( node.type !== 'file' ) {
			if ( !lazy ) {
				el.on( 'input', this.handler );

				// IE is a special snowflake
				if ( node.attachEvent ) {
					el.on( 'keyup', this.handler );
				}
			}

			el.on( 'blur', handleBlur );
		}
	};

	GenericBinding.prototype.unrender = function unrender () {
		var el = this.element;
		this.rendered = false;

		el.off( 'change', handleDomEvent );
		el.off( 'input', this.handler );
		el.off( 'keyup', this.handler );
		el.off( 'blur', handleBlur );
	};

	return GenericBinding;
}(Binding));

var FileBinding = (function (GenericBinding$$1) {
	function FileBinding () {
		GenericBinding$$1.apply(this, arguments);
	}

	if ( GenericBinding$$1 ) FileBinding.__proto__ = GenericBinding$$1;
	FileBinding.prototype = Object.create( GenericBinding$$1 && GenericBinding$$1.prototype );
	FileBinding.prototype.constructor = FileBinding;

	FileBinding.prototype.getInitialValue = function getInitialValue () {
		return undefined;
	};

	FileBinding.prototype.getValue = function getValue () {
		return this.node.files;
	};

	FileBinding.prototype.render = function render () {
		this.element.lazy = false;
		GenericBinding$$1.prototype.render.call(this);
	};

	FileBinding.prototype.setFromNode = function setFromNode ( node ) {
		this.model.set( node.files );
	};

	return FileBinding;
}(GenericBinding));

function getSelectedOptions ( select ) {
	return select.selectedOptions
		? toArray( select.selectedOptions )
		: select.options
			? toArray( select.options ).filter( function (option) { return option.selected; } )
			: [];
}

var MultipleSelectBinding = (function (Binding$$1) {
	function MultipleSelectBinding () {
		Binding$$1.apply(this, arguments);
	}

	if ( Binding$$1 ) MultipleSelectBinding.__proto__ = Binding$$1;
	MultipleSelectBinding.prototype = Object.create( Binding$$1 && Binding$$1.prototype );
	MultipleSelectBinding.prototype.constructor = MultipleSelectBinding;

	MultipleSelectBinding.prototype.getInitialValue = function getInitialValue () {
		return this.element.options
			.filter( function (option) { return option.getAttribute( 'selected' ); } )
			.map( function (option) { return option.getAttribute( 'value' ); } );
	};

	MultipleSelectBinding.prototype.getValue = function getValue () {
		var options = this.element.node.options;
		var len = options.length;

		var selectedValues = [];

		for ( var i = 0; i < len; i += 1 ) {
			var option = options[i];

			if ( option.selected ) {
				var optionValue = option._ractive ? option._ractive.value : option.value;
				selectedValues.push( optionValue );
			}
		}

		return selectedValues;
	};

	MultipleSelectBinding.prototype.handleChange = function handleChange () {
		var attribute = this.attribute;
		var previousValue = attribute.getValue();

		var value = this.getValue();

		if ( previousValue === undefined || !arrayContentsMatch( value, previousValue ) ) {
			Binding$$1.prototype.handleChange.call(this);
		}

		return this;
	};

	MultipleSelectBinding.prototype.render = function render () {
		Binding$$1.prototype.render.call(this);

		this.element.on( 'change', handleDomEvent );

		if ( this.model.get() === undefined ) {
			// get value from DOM, if possible
			this.handleChange();
		}
	};

	MultipleSelectBinding.prototype.setFromNode = function setFromNode ( node ) {
		var selectedOptions = getSelectedOptions( node );
		var i = selectedOptions.length;
		var result = new Array( i );

		while ( i-- ) {
			var option = selectedOptions[i];
			result[i] = option._ractive ? option._ractive.value : option.value;
		}

		this.model.set( result );
	};

	MultipleSelectBinding.prototype.unrender = function unrender () {
		this.element.off( 'change', handleDomEvent );
	};

	return MultipleSelectBinding;
}(Binding));

var NumericBinding = (function (GenericBinding$$1) {
	function NumericBinding () {
		GenericBinding$$1.apply(this, arguments);
	}

	if ( GenericBinding$$1 ) NumericBinding.__proto__ = GenericBinding$$1;
	NumericBinding.prototype = Object.create( GenericBinding$$1 && GenericBinding$$1.prototype );
	NumericBinding.prototype.constructor = NumericBinding;

	NumericBinding.prototype.getInitialValue = function getInitialValue () {
		return undefined;
	};

	NumericBinding.prototype.getValue = function getValue () {
		var value = parseFloat( this.node.value );
		return isNaN( value ) ? undefined : value;
	};

	NumericBinding.prototype.setFromNode = function setFromNode ( node ) {
		var value = parseFloat( node.value );
		if ( !isNaN( value ) ) { this.model.set( value ); }
	};

	return NumericBinding;
}(GenericBinding));

var siblings = {};

function getSiblings ( hash ) {
	return siblings[ hash ] || ( siblings[ hash ] = [] );
}

var RadioBinding = (function (Binding$$1) {
	function RadioBinding ( element ) {
		Binding$$1.call( this, element, 'checked' );

		this.siblings = getSiblings( this.ractive._guid + this.element.getAttribute( 'name' ) );
		this.siblings.push( this );
	}

	if ( Binding$$1 ) RadioBinding.__proto__ = Binding$$1;
	RadioBinding.prototype = Object.create( Binding$$1 && Binding$$1.prototype );
	RadioBinding.prototype.constructor = RadioBinding;

	RadioBinding.prototype.getValue = function getValue () {
		return this.node.checked;
	};

	RadioBinding.prototype.handleChange = function handleChange () {
		runloop.start( this.root );

		this.siblings.forEach( function (binding) {
			binding.model.set( binding.getValue() );
		});

		runloop.end();
	};

	RadioBinding.prototype.render = function render () {
		Binding$$1.prototype.render.call(this);

		this.element.on( 'change', handleDomEvent );

		if ( this.node.attachEvent ) {
			this.element.on( 'click', handleDomEvent );
		}
	};

	RadioBinding.prototype.setFromNode = function setFromNode ( node ) {
		this.model.set( node.checked );
	};

	RadioBinding.prototype.unbind = function unbind () {
		removeFromArray( this.siblings, this );
	};

	RadioBinding.prototype.unrender = function unrender () {
		this.element.off( 'change', handleDomEvent );
		this.element.off( 'click', handleDomEvent );
	};

	return RadioBinding;
}(Binding));

function getValue$1() {
	var checked = this.bindings.filter( function (b) { return b.node.checked; } );
	if ( checked.length > 0 ) {
		return checked[0].element.getAttribute( 'value' );
	}
}

var RadioNameBinding = (function (Binding$$1) {
	function RadioNameBinding ( element ) {
		Binding$$1.call( this, element, 'name' );

		this.group = getBindingGroup( 'radioname', this.model, getValue$1 );
		this.group.add( this );

		if ( element.checked ) {
			this.group.value = this.getValue();
		}
	}

	if ( Binding$$1 ) RadioNameBinding.__proto__ = Binding$$1;
	RadioNameBinding.prototype = Object.create( Binding$$1 && Binding$$1.prototype );
	RadioNameBinding.prototype.constructor = RadioNameBinding;

	RadioNameBinding.prototype.bind = function bind () {
		var this$1 = this;

		if ( !this.group.bound ) {
			this.group.bind();
		}

		// update name keypath when necessary
		this.nameAttributeBinding = {
			handleChange: function () { return this$1.node.name = "{{" + (this$1.model.getKeypath()) + "}}"; },
			rebind: noop
		};

		this.model.getKeypathModel().register( this.nameAttributeBinding );
	};

	RadioNameBinding.prototype.getInitialValue = function getInitialValue () {
		if ( this.element.getAttribute( 'checked' ) ) {
			return this.element.getAttribute( 'value' );
		}
	};

	RadioNameBinding.prototype.getValue = function getValue () {
		return this.element.getAttribute( 'value' );
	};

	RadioNameBinding.prototype.handleChange = function handleChange () {
		// If this <input> is the one that's checked, then the value of its
		// `name` model gets set to its value
		if ( this.node.checked ) {
			this.group.value = this.getValue();
			Binding$$1.prototype.handleChange.call(this);
		}
	};

	RadioNameBinding.prototype.lastVal = function lastVal ( setting, value ) {
		if ( !this.group ) { return; }
		if ( setting ) { this.group.lastValue = value; }
		else { return this.group.lastValue; }
	};

	RadioNameBinding.prototype.render = function render () {
		Binding$$1.prototype.render.call(this);

		var node = this.node;

		node.name = "{{" + (this.model.getKeypath()) + "}}";
		node.checked = this.element.compare ( this.model.get(), this.element.getAttribute( 'value' ) );

		this.element.on( 'change', handleDomEvent );

		if ( node.attachEvent ) {
			this.element.on( 'click', handleDomEvent );
		}
	};

	RadioNameBinding.prototype.setFromNode = function setFromNode ( node ) {
		if ( node.checked ) {
			this.group.model.set( this.element.getAttribute( 'value' ) );
		}
	};

	RadioNameBinding.prototype.unbind = function unbind () {
		this.group.remove( this );

		this.model.getKeypathModel().unregister( this.nameAttributeBinding );
	};

	RadioNameBinding.prototype.unrender = function unrender () {
		var el = this.element;

		el.off( 'change', handleDomEvent );
		el.off( 'click', handleDomEvent );
	};

	return RadioNameBinding;
}(Binding));

var SingleSelectBinding = (function (Binding$$1) {
	function SingleSelectBinding () {
		Binding$$1.apply(this, arguments);
	}

	if ( Binding$$1 ) SingleSelectBinding.__proto__ = Binding$$1;
	SingleSelectBinding.prototype = Object.create( Binding$$1 && Binding$$1.prototype );
	SingleSelectBinding.prototype.constructor = SingleSelectBinding;

	SingleSelectBinding.prototype.forceUpdate = function forceUpdate () {
		var this$1 = this;

		var value = this.getValue();

		if ( value !== undefined ) {
			this.attribute.locked = true;
			runloop.scheduleTask( function () { return this$1.attribute.locked = false; } );
			this.model.set( value );
		}
	};

	SingleSelectBinding.prototype.getInitialValue = function getInitialValue () {
		if ( this.element.getAttribute( 'value' ) !== undefined ) {
			return;
		}

		var options = this.element.options;
		var len = options.length;

		if ( !len ) { return; }

		var value;
		var optionWasSelected;
		var i = len;

		// take the final selected option...
		while ( i-- ) {
			var option = options[i];

			if ( option.getAttribute( 'selected' ) ) {
				if ( !option.getAttribute( 'disabled' ) ) {
					value = option.getAttribute( 'value' );
				}

				optionWasSelected = true;
				break;
			}
		}

		// or the first non-disabled option, if none are selected
		if ( !optionWasSelected ) {
			while ( ++i < len ) {
				if ( !options[i].getAttribute( 'disabled' ) ) {
					value = options[i].getAttribute( 'value' );
					break;
				}
			}
		}

		// This is an optimisation (aka hack) that allows us to forgo some
		// other more expensive work
		// TODO does it still work? seems at odds with new architecture
		if ( value !== undefined ) {
			this.element.attributeByName.value.value = value;
		}

		return value;
	};

	SingleSelectBinding.prototype.getValue = function getValue () {
		var options = this.node.options;
		var len = options.length;

		var i;
		for ( i = 0; i < len; i += 1 ) {
			var option = options[i];

			if ( options[i].selected && !options[i].disabled ) {
				return option._ractive ? option._ractive.value : option.value;
			}
		}
	};

	SingleSelectBinding.prototype.render = function render () {
		Binding$$1.prototype.render.call(this);
		this.element.on( 'change', handleDomEvent );
	};

	SingleSelectBinding.prototype.setFromNode = function setFromNode ( node ) {
		var option = getSelectedOptions( node )[0];
		this.model.set( option._ractive ? option._ractive.value : option.value );
	};

	SingleSelectBinding.prototype.unrender = function unrender () {
		this.element.off( 'change', handleDomEvent );
	};

	return SingleSelectBinding;
}(Binding));

function isBindable ( attribute ) {

	// The fragment must be a single non-string fragment
	if ( !attribute || !attribute.template.f || attribute.template.f.length !== 1 || attribute.template.f[0].s ) { return false; }

	// A binding is an interpolator `{{ }}`, yey.
	if ( attribute.template.f[0].t === INTERPOLATOR ) { return true; }

	// The above is probably the only true case. For the rest, show an appropriate
	// warning before returning false.

	// You can't bind a triple curly. HTML values on an attribute makes no sense.
	if ( attribute.template.f[0].t === TRIPLE ) { warnIfDebug( 'It is not possible create a binding using a triple mustache.' ); }

	return false;
}

function selectBinding ( element ) {
	var name = element.name;
	var attributes = element.attributeByName;
	var isBindableByValue = isBindable( attributes.value );
	var isBindableByContentEditable = isBindable( attributes.contenteditable );
	var isContentEditable =  element.getAttribute( 'contenteditable' );

	// contenteditable
	// Bind if the contenteditable is true or a binding that may become true.
	if ( ( isContentEditable || isBindableByContentEditable ) && isBindableByValue ) { return ContentEditableBinding; }

	// <input>
	if ( name === 'input' ) {
		var type = element.getAttribute( 'type' );

		if ( type === 'radio' ) {
			var isBindableByName = isBindable( attributes.name );
			var isBindableByChecked = isBindable( attributes.checked );

			// For radios we can either bind the name or checked, but not both.
			// Name binding is handed instead.
			if ( isBindableByName && isBindableByChecked ) {
				warnIfDebug( 'A radio input can have two-way binding on its name attribute, or its checked attribute - not both', { ractive: element.root });
				return RadioNameBinding;
			}

			if ( isBindableByName ) { return RadioNameBinding; }

			if ( isBindableByChecked ) { return RadioBinding; }

			// Dead end. Unknown binding on radio input.
			return null;
		}

		if ( type === 'checkbox' ) {
			var isBindableByName$1 = isBindable( attributes.name );
			var isBindableByChecked$1 = isBindable( attributes.checked );

			// A checkbox with bindings for both name and checked. Checked treated as
			// the checkbox value, name is treated as a regular binding.
			//
			// See https://github.com/ractivejs/ractive/issues/1749
			if ( isBindableByName$1 && isBindableByChecked$1 ) { return CheckboxBinding; }

			if ( isBindableByName$1 ) { return CheckboxNameBinding; }

			if ( isBindableByChecked$1 ) { return CheckboxBinding; }

			// Dead end. Unknown binding on checkbox input.
			return null;
		}

		if ( type === 'file' && isBindableByValue ) { return FileBinding; }

		if ( type === 'number' && isBindableByValue ) { return NumericBinding; }

		if ( type === 'range' && isBindableByValue ) { return NumericBinding; }

		// Some input of unknown type (browser usually falls back to text).
		if ( isBindableByValue ) { return GenericBinding; }

		// Dead end. Some unknown input and an unbindable.
		return null;
	}

	// <select>
	if ( name === 'select' && isBindableByValue ){
		return element.getAttribute( 'multiple' ) ? MultipleSelectBinding : SingleSelectBinding;
	}

	// <textarea>
	if ( name === 'textarea' && isBindableByValue ) { return GenericBinding; }

	// Dead end. Some unbindable element.
	return null;
}

var endsWithSemi = /;\s*$/;

var Element = (function (ContainerItem$$1) {
	function Element ( options ) {
		var this$1 = this;

		ContainerItem$$1.call( this, options );

		this.name = options.template.e.toLowerCase();

		// find parent element
		this.parent = findElement( this.parentFragment, false );

		if ( this.parent && this.parent.name === 'option' ) {
			throw new Error( ("An <option> element cannot contain other elements (encountered <" + (this.name) + ">)") );
		}

		this.decorators = [];

		// create attributes
		this.attributeByName = {};

		var attrs;
		var n, attr, val, cls, name, template, leftovers;

		var m = this.template.m;
		var len = ( m && m.length ) || 0;

		for ( var i = 0; i < len; i++ ) {
			template = m[i];
			switch ( template.t ) {
				case ATTRIBUTE:
				case BINDING_FLAG:
				case DECORATOR:
				case EVENT:
				case TRANSITION:
					attr = createItem({
						owner: this$1,
						parentFragment: this$1.parentFragment,
						template: template
					});

					n = template.n;

					attrs = attrs || ( attrs = this$1.attributes = [] );

					if ( n === 'value' ) { val = attr; }
					else if ( n === 'name' ) { name = attr; }
					else if ( n === 'class' ) { cls = attr; }
					else { attrs.push( attr ); }

					break;

				case DELEGATE_FLAG:
				  this$1.delegate = false;
					break;

				default:
					( leftovers || ( leftovers = [] ) ).push( template );
					break;
			}
		}

		if ( name ) { attrs.push( name ); }
		if ( val ) { attrs.push( val ); }
		if ( cls ) { attrs.unshift( cls ); }

		if ( leftovers ) {
			( attrs || ( this.attributes = [] ) ).push( new ConditionalAttribute({
				owner: this,
				parentFragment: this.parentFragment,
				template: leftovers
			}) );

			// empty leftovers array
			leftovers = [];
		}

		// create children
		if ( options.template.f && !options.deferContent ) {
			this.fragment = new Fragment({
				template: options.template.f,
				owner: this,
				cssIds: null
			});
		}

		this.binding = null; // filled in later
	}

	if ( ContainerItem$$1 ) Element.__proto__ = ContainerItem$$1;
	Element.prototype = Object.create( ContainerItem$$1 && ContainerItem$$1.prototype );
	Element.prototype.constructor = Element;

	Element.prototype.bind = function bind$1 () {
		var attrs = this.attributes;
		if ( attrs ) {
			attrs.binding = true;
			attrs.forEach( bind );
			attrs.binding = false;
		}

		if ( this.fragment ) { this.fragment.bind(); }

		// create two-way binding if necessary
		if ( !this.binding ) { this.recreateTwowayBinding(); }
		else { this.binding.bind(); }
	};

	Element.prototype.createTwowayBinding = function createTwowayBinding () {
		if ( 'twoway' in this ? this.twoway : this.ractive.twoway ) {
			var Binding = selectBinding( this );
			if ( Binding ) {
				var binding = new Binding( this );
				if ( binding && binding.model ) { return binding; }
			}
		}
	};

	Element.prototype.destroyed = function destroyed$1 () {
		var this$1 = this;

		if ( this.attributes ) { this.attributes.forEach( destroyed ); }

		if ( !this.parentFragment.delegate && this.listeners ) {
			var ls = this.listeners;
			for ( var k in ls ) {
				if ( ls[k] && ls[k].length ) { this$1.node.removeEventListener( k, handler ); }
			}
		}

		if ( this.fragment ) { this.fragment.destroyed(); }
	};

	Element.prototype.detach = function detach () {
		// if this element is no longer rendered, the transitions are complete and the attributes can be torn down
		if ( !this.rendered ) { this.destroyed(); }

		return detachNode( this.node );
	};

	Element.prototype.find = function find ( selector, options ) {
		if ( this.node && matches( this.node, selector ) ) { return this.node; }
		if ( this.fragment ) {
			return this.fragment.find( selector, options );
		}
	};

	Element.prototype.findAll = function findAll ( selector, options ) {
		var result = options.result;

		if ( matches( this.node, selector ) ) {
			result.push( this.node );
		}

		if ( this.fragment ) {
			this.fragment.findAll( selector, options );
		}
	};

	Element.prototype.findNextNode = function findNextNode () {
		return null;
	};

	Element.prototype.firstNode = function firstNode () {
		return this.node;
	};

	Element.prototype.getAttribute = function getAttribute ( name ) {
		var attribute = this.attributeByName[ name ];
		return attribute ? attribute.getValue() : undefined;
	};

	Element.prototype.getContext = function getContext () {
		var assigns = [], len = arguments.length;
		while ( len-- ) assigns[ len ] = arguments[ len ];

		if ( this.fragment ) { return (ref = this.fragment).getContext.apply( ref, assigns ); }

		if ( !this.ctx ) { this.ctx = new Context( this.parentFragment, this ); }
		assigns.unshift( Object.create( this.ctx ) );
		return Object.assign.apply( null, assigns );
		var ref;
	};

	Element.prototype.off = function off ( event, callback, capture ) {
		if ( capture === void 0 ) capture = false;

		var delegate = this.parentFragment.delegate;
		var ref = this.listeners && this.listeners[event];

		if ( !ref ) { return; }
		removeFromArray( ref, callback );

		if ( delegate ) {
			var listeners = ( delegate.listeners || ( delegate.listeners = [] ) ) && ( delegate.listeners[event] || ( delegate.listeners[event] = [] ) );
			if ( listeners.refs && !--listeners.refs ) { delegate.off( event, delegateHandler, true ); }
		} else if ( this.rendered ) {
			var n = this.node;
			var add = n.addEventListener;
			var rem = n.removeEventListener;

			if ( !ref.length ) {
				rem.call( n, event, handler, capture );
			} else if ( ref.length && !ref.refs && capture ) {
				rem.call( n, event, handler, true );
				add.call( n, event, handler, false );
			}
		}
	};

	Element.prototype.on = function on ( event, callback, capture ) {
		if ( capture === void 0 ) capture = false;

		var delegate = this.parentFragment.delegate;
		var ref = ( this.listeners || ( this.listeners = {} ) )[event] || ( this.listeners[event] = [] );

		if ( delegate ) {
			var listeners = ( delegate.listeners || ( delegate.listeners = [] ) ) && delegate.listeners[event] || ( delegate.listeners[event] = [] );
			if ( !listeners.refs ) {
				listeners.refs = 0;
				delegate.on( event, delegateHandler, true );
				listeners.refs++;
			} else {
				listeners.refs++;
			}
		} else if ( this.rendered ) {
			var n = this.node;
			var add = n.addEventListener;
			var rem = n.removeEventListener;

			if ( !ref.length ) {
				add.call( n, event, handler, capture );
			} else if ( ref.length && !ref.refs && capture ) {
				rem.call( n, event, handler, false );
				add.call( n, event, handler, true );
			}
		}

		addToArray( this.listeners[event], callback );
	};

	Element.prototype.recreateTwowayBinding = function recreateTwowayBinding () {
		if ( this.binding ) {
			this.binding.unbind();
			this.binding.unrender();
		}

		if ( this.binding = this.createTwowayBinding() ) {
			this.binding.bind();
			if ( this.rendered ) { this.binding.render(); }
		}
	};

	Element.prototype.render = function render$1 ( target, occupants ) {
		var this$1 = this;

		// TODO determine correct namespace
		this.namespace = getNamespace( this );

		var node;
		var existing = false;

		if ( occupants ) {
			var n;
			while ( ( n = occupants.shift() ) ) {
				if ( n.nodeName.toUpperCase() === this$1.template.e.toUpperCase() && n.namespaceURI === this$1.namespace ) {
					this$1.node = node = n;
					existing = true;
					break;
				} else {
					detachNode( n );
				}
			}
		}

		if ( !node ) {
			var name = this.template.e;
			node = createElement( this.namespace === html ? name.toLowerCase() : name, this.namespace, this.getAttribute( 'is' ) );
			this.node = node;
		}

		// tie the node to this vdom element
		Object.defineProperty( node, '_ractive', {
			value: {
				proxy: this
			}
		});

		// Is this a top-level node of a component? If so, we may need to add
		// a data-ractive-css attribute, for CSS encapsulation
		if ( this.parentFragment.cssIds ) {
			node.setAttribute( 'data-ractive-css', this.parentFragment.cssIds.map( function (x) { return ("{" + x + "}"); } ).join( ' ' ) );
		}

		if ( existing && this.foundNode ) { this.foundNode( node ); }

		// register intro before rendering content so children can find the intro
		var intro = this.intro;
		if ( intro && intro.shouldFire( 'intro' ) ) {
			intro.isIntro = true;
			intro.isOutro = false;
			runloop.registerTransition( intro );
		}

		if ( this.fragment ) {
			var children = existing ? toArray( node.childNodes ) : undefined;

			this.fragment.render( node, children );

			// clean up leftover children
			if ( children ) {
				children.forEach( detachNode );
			}
		}

		if ( existing ) {
			// store initial values for two-way binding
			if ( this.binding && this.binding.wasUndefined ) { this.binding.setFromNode( node ); }
			// remove unused attributes
			var i = node.attributes.length;
			while ( i-- ) {
				var name$1 = node.attributes[i].name;
				if ( !( name$1 in this$1.attributeByName ) ){ node.removeAttribute( name$1 ); }
			}
		}

		if ( this.attributes ) { this.attributes.forEach( render ); }
		if ( this.binding ) { this.binding.render(); }

		if ( !this.parentFragment.delegate && this.listeners ) {
			var ls = this.listeners;
			for ( var k in ls ) {
				if ( ls[k] && ls[k].length ) { this$1.node.addEventListener( k, handler, !!ls[k].refs ); }
			}
		}

		if ( !existing ) {
			target.appendChild( node );
		}

		this.rendered = true;
	};

	Element.prototype.toString = function toString$$1 () {
		var tagName = this.template.e;

		var attrs = ( this.attributes && this.attributes.map( stringifyAttribute ).join( '' ) ) || '';

		// Special case - selected options
		if ( this.name === 'option' && this.isSelected() ) {
			attrs += ' selected';
		}

		// Special case - two-way radio name bindings
		if ( this.name === 'input' && inputIsCheckedRadio( this ) ) {
			attrs += ' checked';
		}

		// Special case style and class attributes and directives
		var style, cls;
		this.attributes && this.attributes.forEach( function (attr) {
			if ( attr.name === 'class' ) {
				cls = ( cls || '' ) + ( cls ? ' ' : '' ) + safeAttributeString( attr.getString() );
			} else if ( attr.name === 'style' ) {
				style = ( style || '' ) + ( style ? ' ' : '' ) + safeAttributeString( attr.getString() );
				if ( style && !endsWithSemi.test( style ) ) { style += ';'; }
			} else if ( attr.style ) {
				style = ( style || '' ) + ( style ? ' ' : '' ) +  (attr.style) + ": " + (safeAttributeString( attr.getString() )) + ";";
			} else if ( attr.inlineClass && attr.getValue() ) {
				cls = ( cls || '' ) + ( cls ? ' ' : '' ) + attr.inlineClass;
			}
		});
		// put classes first, then inline style
		if ( style !== undefined ) { attrs = ' style' + ( style ? ("=\"" + style + "\"") : '' ) + attrs; }
		if ( cls !== undefined ) { attrs = ' class' + (cls ? ("=\"" + cls + "\"") : '') + attrs; }

		if ( this.parentFragment.cssIds ) {
			attrs += " data-ractive-css=\"" + (this.parentFragment.cssIds.map( function (x) { return ("{" + x + "}"); } ).join( ' ' )) + "\"";
		}

		var str = "<" + tagName + attrs + ">";

		if ( voidElementNames.test( this.name ) ) { return str; }

		// Special case - textarea
		if ( this.name === 'textarea' && this.getAttribute( 'value' ) !== undefined ) {
			str += escapeHtml( this.getAttribute( 'value' ) );
		}

		// Special case - contenteditable
		else if ( this.getAttribute( 'contenteditable' ) !== undefined ) {
			str += ( this.getAttribute( 'value' ) || '' );
		}

		if ( this.fragment ) {
			str += this.fragment.toString( !/^(?:script|style)$/i.test( this.template.e ) ); // escape text unless script/style
		}

		str += "</" + tagName + ">";
		return str;
	};

	Element.prototype.unbind = function unbind$1 () {
		var attrs = this.attributes;
		if ( attrs ) {
			attrs.unbinding = true;
			attrs.forEach( unbind );
			attrs.unbinding = false;
		}

		if ( this.binding ) { this.binding.unbind(); }
		if ( this.fragment ) { this.fragment.unbind(); }
	};

	Element.prototype.unrender = function unrender$$1 ( shouldDestroy ) {
		if ( !this.rendered ) { return; }
		this.rendered = false;

		// unrendering before intro completed? complete it now
		// TODO should be an API for aborting transitions
		var transition = this.intro;
		if ( transition && transition.complete ) { transition.complete(); }

		// Detach as soon as we can
		if ( this.name === 'option' ) {
			// <option> elements detach immediately, so that
			// their parent <select> element syncs correctly, and
			// since option elements can't have transitions anyway
			this.detach();
		} else if ( shouldDestroy ) {
			runloop.detachWhenReady( this );
		}

		// outro transition
		var outro = this.outro;
		if ( outro && outro.shouldFire( 'outro' ) ) {
			outro.isIntro = false;
			outro.isOutro = true;
			runloop.registerTransition( outro );
		}

		if ( this.fragment ) { this.fragment.unrender(); }

		if ( this.binding ) { this.binding.unrender(); }
	};

	Element.prototype.update = function update$1 () {
		if ( this.dirty ) {
			this.dirty = false;

			this.attributes && this.attributes.forEach( update );

			if ( this.fragment ) { this.fragment.update(); }
		}
	};

	return Element;
}(ContainerItem));

function inputIsCheckedRadio ( element ) {
	var nameAttr = element.attributeByName.name;
	return element.getAttribute( 'type' ) === 'radio' &&
		( nameAttr || {} ).interpolator &&
		element.getAttribute( 'value' ) === nameAttr.interpolator.model.get();
}

function stringifyAttribute ( attribute ) {
	var str = attribute.toString();
	return str ? ' ' + str : '';
}

function getNamespace ( element ) {
	// Use specified namespace...
	var xmlns$$1 = element.getAttribute( 'xmlns' );
	if ( xmlns$$1 ) { return xmlns$$1; }

	// ...or SVG namespace, if this is an <svg> element
	if ( element.name === 'svg' ) { return svg$1; }

	var parent = element.parent;

	if ( parent ) {
		// ...or HTML, if the parent is a <foreignObject>
		if ( parent.name === 'foreignobject' ) { return html; }

		// ...or inherit from the parent node
		return parent.node.namespaceURI;
	}

	return element.ractive.el.namespaceURI;
}

function delegateHandler ( ev ) {
	var name = ev.type;
	var end = ev.currentTarget;
	var endEl = end._ractive && end._ractive.proxy;
	var node = ev.target;
	var bubble = true;
	var listeners;

	// starting with the origin node, walk up the DOM looking for ractive nodes with a matching event listener
	while ( bubble && node && node !== end ) {
		var proxy = node._ractive && node._ractive.proxy;
		if ( proxy && proxy.parentFragment.delegate === endEl && shouldFire( ev, node, end ) ) {
			listeners = proxy.listeners && proxy.listeners[name];

			if ( listeners ) {
				listeners.forEach( function (l) {
					bubble = l.call( node, ev ) !== false && bubble;
				});
			}
		}

		node = node.parentNode;
	}

	return bubble;
}

var UIEvent = win !== null ? win.UIEvent : null;
function shouldFire ( event, start, end ) {
	if ( UIEvent && event instanceof UIEvent ) {
		var node = start;
		while ( node && node !== end ) {
			if ( node.disabled ) { return false; }
			node = node.parentNode;
		}
	}

	return true;
}

function handler ( ev ) {
	var this$1 = this;

	var el = this._ractive.proxy;
	if ( !el.listeners || !el.listeners[ ev.type ] ) { return; }
	el.listeners[ ev.type ].forEach( function (l) { return l.call( this$1, ev ); } );
}

var Form = (function (Element$$1) {
	function Form ( options ) {
		Element$$1.call( this, options );
		this.formBindings = [];
	}

	if ( Element$$1 ) Form.__proto__ = Element$$1;
	Form.prototype = Object.create( Element$$1 && Element$$1.prototype );
	Form.prototype.constructor = Form;

	Form.prototype.render = function render ( target, occupants ) {
		Element$$1.prototype.render.call( this, target, occupants );
		this.on( 'reset', handleReset );
	};

	Form.prototype.unrender = function unrender ( shouldDestroy ) {
		this.off( 'reset', handleReset );
		Element$$1.prototype.unrender.call( this, shouldDestroy );
	};

	return Form;
}(Element));

function handleReset () {
	var element = this._ractive.proxy;

	runloop.start();
	element.formBindings.forEach( updateModel );
	runloop.end();
}

function updateModel ( binding ) {
	binding.model.set( binding.resetValue );
}

var DOMEvent = function DOMEvent ( name, owner ) {
	if ( name.indexOf( '*' ) !== -1 ) {
		fatal( ("Only component proxy-events may contain \"*\" wildcards, <" + (owner.name) + " on-" + name + "=\"...\"/> is not valid") );
	}

	this.name = name;
	this.owner = owner;
	this.handler = null;
};

DOMEvent.prototype.listen = function listen ( directive ) {
	var node = this.owner.node;
	var name = this.name;

	// this is probably a custom event fired from a decorator or manually
	if ( !( ("on" + name) in node ) ) { return; }

	this.owner.on( name, this.handler = function ( event ) {
		return directive.fire({
			node: node,
			original: event,
			event: event,
			name: name
		});
	});
};

DOMEvent.prototype.unlisten = function unlisten () {
	if ( this.handler ) { this.owner.off( this.name, this.handler ); }
};

var CustomEvent = function CustomEvent ( eventPlugin, owner, name ) {
	this.eventPlugin = eventPlugin;
	this.owner = owner;
	this.name = name;
	this.handler = null;
};

CustomEvent.prototype.listen = function listen ( directive ) {
		var this$1 = this;

	var node = this.owner.node;

	this.handler = this.eventPlugin( node, function ( event ) {
			if ( event === void 0 ) event = {};

		if ( event.original ) { event.event = event.original; }
		else { event.original = event.event; }

		event.name = this$1.name;
		event.node = event.node || node;
		return directive.fire( event );
	});
};

CustomEvent.prototype.unlisten = function unlisten () {
	this.handler.teardown();
};

var RactiveEvent = function RactiveEvent ( component, name ) {
	this.component = component;
	this.name = name;
	this.handler = null;
};

RactiveEvent.prototype.listen = function listen ( directive ) {
	var ractive = this.component.instance;

	this.handler = ractive.on( this.name, function () {
			var args = [], len = arguments.length;
			while ( len-- ) args[ len ] = arguments[ len ];

		// watch for reproxy
		if ( args[0] instanceof Context ) {
			var ctx = args.shift();
			ctx.component = ractive;
			directive.fire( ctx, args );
		} else {
			directive.fire( {}, args );
		}

		// cancel bubbling
		return false;
	});
};

RactiveEvent.prototype.unlisten = function unlisten () {
	this.handler.cancel();
};

var specialPattern = /^(event|arguments|@node|@event|@context)(\..+)?$/;
var dollarArgsPattern = /^\$(\d+)(\..+)?$/;

var EventDirective = function EventDirective ( options ) {
	var this$1 = this;

	this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
	this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment, true );
	this.template = options.template;
	this.parentFragment = options.parentFragment;
	this.ractive = options.parentFragment.ractive;
	//const delegate = this.delegate = this.ractive.delegate && options.parentFragment.delegate;
	this.events = [];

	if ( this.element.type === COMPONENT || this.element.type === ANCHOR ) {
		this.template.n.forEach( function (n) {
			this$1.events.push( new RactiveEvent( this$1.element, n ) );
		});
	} else {
		// make sure the delegate element has a storag object
		//if ( delegate && !delegate.delegates ) delegate.delegates = {};

		this.template.n.forEach( function (n) {
			var fn = findInViewHierarchy( 'events', this$1.ractive, n );
			if ( fn ) {
				this$1.events.push( new CustomEvent( fn, this$1.element, n ) );
			} else {
				this$1.events.push( new DOMEvent( n, this$1.element ) );
			}
		});
	}

	// method calls
	this.models = null;
};

EventDirective.prototype.bind = function bind () {
	addToArray( ( this.element.events || ( this.element.events = [] ) ), this );

	setupArgsFn( this, this.template );
	if ( !this.fn ) { this.action = this.template.f; }
};

EventDirective.prototype.destroyed = function destroyed () {
	this.events.forEach( function (e) { return e.unlisten(); } );
};

EventDirective.prototype.fire = function fire ( event, args ) {
		var this$1 = this;
		if ( args === void 0 ) args = [];

	var context = this.element.getContext( event );

	if ( this.fn ) {
		var values = [];

		var models = resolveArgs( this, this.template, this.parentFragment, {
			specialRef: function specialRef ( ref ) {
				var specialMatch = specialPattern.exec( ref );
				if ( specialMatch ) {
					// on-click="foo(event.node)"
					return {
						special: specialMatch[1],
						keys: specialMatch[2] ? splitKeypath( specialMatch[2].substr(1) ) : []
					};
				}

				var dollarMatch = dollarArgsPattern.exec( ref );
				if ( dollarMatch ) {
					// on-click="foo($1)"
					return {
						special: 'arguments',
						keys: [ dollarMatch[1] - 1 ].concat( dollarMatch[2] ? splitKeypath( dollarMatch[2].substr( 1 ) ) : [] )
					};
				}
			}
		});

		if ( models ) {
			models.forEach( function (model) {
				if ( !model ) { return values.push( undefined ); }

				if ( model.special ) {
					var which = model.special;
					var obj;

					if ( which === '@node' ) {
						obj = this$1.element.node;
					} else if ( which === '@event' ) {
						obj = event && event.event;
					} else if ( which === 'event' ) {
						warnOnceIfDebug( "The event reference available to event directives is deprecated and should be replaced with @context and @event" );
						obj = context;
					} else if ( which === '@context' ) {
						obj = context;
					} else {
						obj = args;
					}

					var keys = model.keys.slice();

					while ( obj && keys.length ) { obj = obj[ keys.shift() ]; }
					return values.push( obj );
				}

				if ( model.wrapper ) {
					return values.push( model.wrapperValue );
				}

				values.push( model.get() );
			});
		}

		// make event available as `this.event`
		var ractive = this.ractive;
		var oldEvent = ractive.event;

		ractive.event = context;
		var returned = this.fn.apply( ractive, values );
		var result = returned.pop();

		// Auto prevent and stop if return is explicitly false
		if ( result === false ) {
			var original = event ? event.original : undefined;
			if ( original ) {
				original.preventDefault && original.preventDefault();
				original.stopPropagation && original.stopPropagation();
			} else {
				warnOnceIfDebug( ("handler '" + (this.template.n.join( ' ' )) + "' returned false, but there is no event available to cancel") );
			}
		}

		// watch for proxy events
		else if ( !returned.length && Array.isArray( result ) && typeof result[0] === 'string' ) {
			result = fireEvent( this.ractive, result.shift(), context, result );
		}

		ractive.event = oldEvent;

		return result;
	}

	else {
		return fireEvent( this.ractive, this.action, context, args);
	}
};

EventDirective.prototype.handleChange = function handleChange () {};

EventDirective.prototype.render = function render () {
		var this$1 = this;

	// render events after everything else, so they fire after bindings
	runloop.scheduleTask( function () { return this$1.events.forEach( function (e) { return e.listen( this$1 ); }, true ); } );
};

EventDirective.prototype.toString = function toString () { return ''; };

EventDirective.prototype.unbind = function unbind () {
	removeFromArray( this.element.events, this );
};

EventDirective.prototype.unrender = function unrender () {
	this.events.forEach( function (e) { return e.unlisten(); } );
};

EventDirective.prototype.update = noop;

function progressiveText ( item, target, occupants, text ) {
	if ( occupants ) {
		var n = occupants[0];
		if ( n && n.nodeType === 3 ) {
			var idx = n.nodeValue.indexOf( text );
			occupants.shift();

			if ( idx === 0 ) {
				if ( n.nodeValue.length !== text.length ) {
					occupants.unshift( n.splitText( text.length ) );
				}
			} else {
				n.nodeValue = text;
			}
		} else {
			n = item.node = doc.createTextNode( text );
			if ( occupants[0] ) {
				target.insertBefore( n, occupants[0] );
			} else {
				target.appendChild( n );
			}
		}

		item.node = n;
	} else {
		if ( !item.node ) { item.node = doc.createTextNode( text ); }
		target.appendChild( item.node );
	}
}

var Mustache = (function (Item$$1) {
	function Mustache ( options ) {
		Item$$1.call( this, options );

		this.parentFragment = options.parentFragment;
		this.template = options.template;
		this.index = options.index;
		if ( options.owner ) { this.parent = options.owner; }

		this.isStatic = !!options.template.s;

		this.model = null;
		this.dirty = false;
	}

	if ( Item$$1 ) Mustache.__proto__ = Item$$1;
	Mustache.prototype = Object.create( Item$$1 && Item$$1.prototype );
	Mustache.prototype.constructor = Mustache;

	Mustache.prototype.bind = function bind () {
		// yield mustaches should resolve in container context
		var start = this.containerFragment || this.parentFragment;
		// try to find a model for this view
		var model = resolve$1( start, this.template );

		if ( model ) {
			var value = model.get();

			if ( this.isStatic ) {
				this.model = { get: function () { return value; } };
				return;
			}

			model.register( this );
			this.model = model;
		}
	};

	Mustache.prototype.handleChange = function handleChange () {
		this.bubble();
	};

	Mustache.prototype.rebind = function rebind ( next, previous, safe ) {
		next = rebindMatch( this.template, next, previous, this.parentFragment );
		if ( next === this.model ) { return false; }

		if ( this.model ) {
			this.model.unregister( this );
		}
		if ( next ) { next.addShuffleRegister( this, 'mark' ); }
		this.model = next;
		if ( !safe ) { this.handleChange(); }
		return true;
	};

	Mustache.prototype.unbind = function unbind () {
		if ( !this.isStatic ) {
			this.model && this.model.unregister( this );
			this.model = undefined;
		}
	};

	return Mustache;
}(Item));

var MustacheContainer = (function (ContainerItem$$1) {
	function MustacheContainer ( options ) {
		ContainerItem$$1.call( this, options );
	}

	if ( ContainerItem$$1 ) MustacheContainer.__proto__ = ContainerItem$$1;
	MustacheContainer.prototype = Object.create( ContainerItem$$1 && ContainerItem$$1.prototype );
	MustacheContainer.prototype.constructor = MustacheContainer;

	return MustacheContainer;
}(ContainerItem));
var proto$3 = MustacheContainer.prototype;
var mustache = Mustache.prototype;
proto$3.bind = mustache.bind;
proto$3.handleChange = mustache.handleChange;
proto$3.rebind = mustache.rebind;
proto$3.unbind = mustache.unbind;

var Interpolator = (function (Mustache$$1) {
	function Interpolator () {
		Mustache$$1.apply(this, arguments);
	}

	if ( Mustache$$1 ) Interpolator.__proto__ = Mustache$$1;
	Interpolator.prototype = Object.create( Mustache$$1 && Mustache$$1.prototype );
	Interpolator.prototype.constructor = Interpolator;

	Interpolator.prototype.bubble = function bubble () {
		if ( this.owner ) { this.owner.bubble(); }
		Mustache$$1.prototype.bubble.call(this);
	};

	Interpolator.prototype.detach = function detach () {
		return detachNode( this.node );
	};

	Interpolator.prototype.firstNode = function firstNode () {
		return this.node;
	};

	Interpolator.prototype.getString = function getString () {
		return this.model ? safeToStringValue( this.model.get() ) : '';
	};

	Interpolator.prototype.render = function render ( target, occupants ) {
		if ( inAttributes() ) { return; }
		var value = this.getString();

		this.rendered = true;

		progressiveText( this, target, occupants, value );
	};

	Interpolator.prototype.toString = function toString ( escape ) {
		var string = this.getString();
		return escape ? escapeHtml( string ) : string;
	};

	Interpolator.prototype.unrender = function unrender ( shouldDestroy ) {
		if ( shouldDestroy ) { this.detach(); }
		this.rendered = false;
	};

	Interpolator.prototype.update = function update () {
		if ( this.dirty ) {
			this.dirty = false;
			if ( this.rendered ) {
				this.node.data = this.getString();
			}
		}
	};

	Interpolator.prototype.valueOf = function valueOf () {
		return this.model ? this.model.get() : undefined;
	};

	return Interpolator;
}(Mustache));

var Input = (function (Element$$1) {
	function Input () {
		Element$$1.apply(this, arguments);
	}

	if ( Element$$1 ) Input.__proto__ = Element$$1;
	Input.prototype = Object.create( Element$$1 && Element$$1.prototype );
	Input.prototype.constructor = Input;

	Input.prototype.render = function render ( target, occupants ) {
		Element$$1.prototype.render.call( this, target, occupants );
		this.node.defaultValue = this.node.value;
	};
	Input.prototype.compare = function compare ( value, attrValue ) {
		var comparator = this.getAttribute( 'value-comparator' );
		if ( comparator ) {
			if ( typeof comparator === 'function' ) {
				return comparator( value, attrValue );
			}
			if (value && attrValue) {
				return value[comparator] == attrValue[comparator];
			}
		}
		return value == attrValue;
	};

	return Input;
}(Element));

// simple JSON parser, without the restrictions of JSON parse
// (i.e. having to double-quote keys).
//
// If passed a hash of values as the second argument, ${placeholders}
// will be replaced with those values

var specials$1 = {
	true: true,
	false: false,
	null: null,
	undefined: undefined
};

var specialsPattern = new RegExp( '^(?:' + Object.keys( specials$1 ).join( '|' ) + ')' );
var numberPattern$1 = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
var placeholderPattern = /\$\{([^\}]+)\}/g;
var placeholderAtStartPattern = /^\$\{([^\}]+)\}/;
var onlyWhitespace$1 = /^\s*$/;

var JsonParser = Parser.extend({
	init: function init ( str, options ) {
		this.values = options.values;
		this.allowWhitespace();
	},

	postProcess: function postProcess ( result ) {
		if ( result.length !== 1 || !onlyWhitespace$1.test( this.leftover ) ) {
			return null;
		}

		return { value: result[0].v };
	},

	converters: [
		function getPlaceholder ( parser ) {
			if ( !parser.values ) { return null; }

			var placeholder = parser.matchPattern( placeholderAtStartPattern );

			if ( placeholder && ( parser.values.hasOwnProperty( placeholder ) ) ) {
				return { v: parser.values[ placeholder ] };
			}
		},

		function getSpecial ( parser ) {
			var special = parser.matchPattern( specialsPattern );
			if ( special ) { return { v: specials$1[ special ] }; }
		},

		function getNumber ( parser ) {
			var number = parser.matchPattern( numberPattern$1 );
			if ( number ) { return { v: +number }; }
		},

		function getString ( parser ) {
			var stringLiteral = readStringLiteral( parser );
			var values = parser.values;

			if ( stringLiteral && values ) {
				return {
					v: stringLiteral.v.replace( placeholderPattern, function ( match, $1 ) { return ( $1 in values ? values[ $1 ] : $1 ); } )
				};
			}

			return stringLiteral;
		},

		function getObject ( parser ) {
			if ( !parser.matchString( '{' ) ) { return null; }

			var result = {};

			parser.allowWhitespace();

			if ( parser.matchString( '}' ) ) {
				return { v: result };
			}

			var pair;
			while ( pair = getKeyValuePair( parser ) ) {
				result[ pair.key ] = pair.value;

				parser.allowWhitespace();

				if ( parser.matchString( '}' ) ) {
					return { v: result };
				}

				if ( !parser.matchString( ',' ) ) {
					return null;
				}
			}

			return null;
		},

		function getArray ( parser ) {
			if ( !parser.matchString( '[' ) ) { return null; }

			var result = [];

			parser.allowWhitespace();

			if ( parser.matchString( ']' ) ) {
				return { v: result };
			}

			var valueToken;
			while ( valueToken = parser.read() ) {
				result.push( valueToken.v );

				parser.allowWhitespace();

				if ( parser.matchString( ']' ) ) {
					return { v: result };
				}

				if ( !parser.matchString( ',' ) ) {
					return null;
				}

				parser.allowWhitespace();
			}

			return null;
		}
	]
});

function getKeyValuePair ( parser ) {
	parser.allowWhitespace();

	var key = readKey( parser );

	if ( !key ) { return null; }

	var pair = { key: key };

	parser.allowWhitespace();
	if ( !parser.matchString( ':' ) ) {
		return null;
	}
	parser.allowWhitespace();

	var valueToken = parser.read();

	if ( !valueToken ) { return null; }

	pair.value = valueToken.v;
	return pair;
}

var parseJSON = function ( str, values ) {
	var parser = new JsonParser( str, { values: values });
	return parser.result;
};

var Mapping = (function (Item$$1) {
	function Mapping ( options ) {
		Item$$1.call( this, options );

		this.name = options.template.n;

		this.owner = options.owner || options.parentFragment.owner || options.element || findElement( options.parentFragment );
		this.element = options.element || (this.owner.attributeByName ? this.owner : findElement( options.parentFragment ) );
		this.parentFragment = this.element.parentFragment; // shared
		this.ractive = this.parentFragment.ractive;

		this.element.attributeByName[ this.name ] = this;

		this.value = options.template.f;
	}

	if ( Item$$1 ) Mapping.__proto__ = Item$$1;
	Mapping.prototype = Object.create( Item$$1 && Item$$1.prototype );
	Mapping.prototype.constructor = Mapping;

	Mapping.prototype.bind = function bind () {
		var template = this.template.f;
		var viewmodel = this.element.instance.viewmodel;

		if ( template === 0 ) {
			// empty attributes are `true`
			viewmodel.joinKey( this.name ).set( true );
		}

		else if ( typeof template === 'string' ) {
			var parsed = parseJSON( template );
			viewmodel.joinKey( this.name ).set( parsed ? parsed.value : template );
		}

		else if ( Array.isArray( template ) ) {
			createMapping( this, true );
		}
	};

	Mapping.prototype.render = function render () {};

	Mapping.prototype.unbind = function unbind () {
		if ( this.model ) { this.model.unregister( this ); }
		if ( this.boundFragment ) { this.boundFragment.unbind(); }

		if ( this.element.bound ) {
			if ( this.link.target === this.model ) { this.link.owner.unlink(); }
		}
	};

	Mapping.prototype.unrender = function unrender () {};

	Mapping.prototype.update = function update () {
		if ( this.dirty ) {
			this.dirty = false;
			if ( this.boundFragment ) { this.boundFragment.update(); }
		}
	};

	return Mapping;
}(Item));

function createMapping ( item ) {
	var template = item.template.f;
	var viewmodel = item.element.instance.viewmodel;
	var childData = viewmodel.value;

	if ( template.length === 1 && template[0].t === INTERPOLATOR ) {
		var model = resolve$1( item.parentFragment, template[0] );
		var val = model.get( false );

		// if the interpolator is not static
		if ( !template[0].s ) {
			item.model = model;
			item.link = viewmodel.createLink( item.name, model, template[0].r, { mapping: true } );

			// initialize parent side of the mapping from child data
			if ( val === undefined && !model.isReadonly && item.name in childData ) {
				model.set( childData[ item.name ] );
			}
		}

		// copy non-object, non-computed vals through
		else if ( typeof val !== 'object' || template[0].x ) {
			viewmodel.joinKey( splitKeypath( item.name ) ).set( val );
		}

		// warn about trying to copy an object
		else {
			warnIfDebug( ("Cannot copy non-computed object value from static mapping '" + (item.name) + "'") );
		}
	}

	else {
		item.boundFragment = new Fragment({
			owner: item,
			template: template
		}).bind();

		item.model = viewmodel.joinKey( splitKeypath( item.name ) );
		item.model.set( item.boundFragment.valueOf() );

		// item is a *bit* of a hack
		item.boundFragment.bubble = function () {
			Fragment.prototype.bubble.call( item.boundFragment );
			// defer this to avoid mucking around model deps if there happens to be an expression involved
			runloop.scheduleTask(function () {
				item.boundFragment.update();
				item.model.set( item.boundFragment.valueOf() );
			});
		};
	}
}

var Option = (function (Element$$1) {
	function Option ( options ) {
		var template = options.template;
		if ( !template.a ) { template.a = {}; }

		// If the value attribute is missing, use the element's content,
		// as long as it isn't disabled
		if ( template.a.value === undefined && !( 'disabled' in template.a ) ) {
			template.a.value = template.f || '';
		}

		Element$$1.call( this, options );

		this.select = findElement( this.parent || this.parentFragment, false, 'select' );
	}

	if ( Element$$1 ) Option.__proto__ = Element$$1;
	Option.prototype = Object.create( Element$$1 && Element$$1.prototype );
	Option.prototype.constructor = Option;

	Option.prototype.bind = function bind () {
		if ( !this.select ) {
			Element$$1.prototype.bind.call(this);
			return;
		}

		// If the select has a value, it overrides the `selected` attribute on
		// this option - so we delete the attribute
		var selectedAttribute = this.attributeByName.selected;
		if ( selectedAttribute && this.select.getAttribute( 'value' ) !== undefined ) {
			var index = this.attributes.indexOf( selectedAttribute );
			this.attributes.splice( index, 1 );
			delete this.attributeByName.selected;
		}

		Element$$1.prototype.bind.call(this);
		this.select.options.push( this );
	};

	Option.prototype.bubble = function bubble () {
		// if we're using content as value, may need to update here
		var value = this.getAttribute( 'value' );
		if ( this.node && this.node.value !== value ) {
			this.node._ractive.value = value;
		}
		Element$$1.prototype.bubble.call(this);
	};

	Option.prototype.getAttribute = function getAttribute ( name ) {
		var attribute = this.attributeByName[ name ];
		return attribute ? attribute.getValue() : name === 'value' && this.fragment ? this.fragment.valueOf() : undefined;
	};

	Option.prototype.isSelected = function isSelected () {
		var this$1 = this;

		var optionValue = this.getAttribute( 'value' );

		if ( optionValue === undefined || !this.select ) {
			return false;
		}

		var selectValue = this.select.getAttribute( 'value' );

		if ( this.select.compare( selectValue, optionValue ) ) {
			return true;
		}

		if ( this.select.getAttribute( 'multiple' ) && Array.isArray( selectValue ) ) {
			var i = selectValue.length;
			while ( i-- ) {
				if ( this$1.select.compare( selectValue[i], optionValue ) ) {
					return true;
				}
			}
		}
	};

	Option.prototype.render = function render ( target, occupants ) {
		Element$$1.prototype.render.call( this, target, occupants );

		if ( !this.attributeByName.value ) {
			this.node._ractive.value = this.getAttribute( 'value' );
		}
	};

	Option.prototype.unbind = function unbind () {
		Element$$1.prototype.unbind.call(this);

		if ( this.select ) {
			removeFromArray( this.select.options, this );
		}
	};

	return Option;
}(Element));

function getPartialTemplate ( ractive, name, parentFragment ) {
	// If the partial in instance or view heirarchy instances, great
	var partial = getPartialFromRegistry( ractive, name, parentFragment || {} );
	if ( partial ) { return partial; }

	// Does it exist on the page as a script tag?
	partial = parser.fromId( name, { noThrow: true } );
	if ( partial ) {
		// parse and register to this ractive instance
		var parsed = parser.parseFor( partial, ractive );

		// register extra partials on the ractive instance if they don't already exist
		if ( parsed.p ) { fillGaps( ractive.partials, parsed.p ); }

		// register (and return main partial if there are others in the template)
		return ractive.partials[ name ] = parsed.t;
	}
}

function getPartialFromRegistry ( ractive, name, parentFragment ) {
	// if there was an instance up-hierarchy, cool
	var partial = findParentPartial( name, parentFragment.owner );
	if ( partial ) { return partial; }

	// find first instance in the ractive or view hierarchy that has this partial
	var instance = findInstance( 'partials', ractive, name );

	if ( !instance ) { return; }

	partial = instance.partials[ name ];

	// partial is a function?
	var fn;
	if ( typeof partial === 'function' ) {
		fn = partial.bind( instance );
		fn.isOwner = instance.partials.hasOwnProperty(name);
		partial = fn.call( ractive, parser );
	}

	if ( !partial && partial !== '' ) {
		warnIfDebug( noRegistryFunctionReturn, name, 'partial', 'partial', { ractive: ractive });
		return;
	}

	// If this was added manually to the registry,
	// but hasn't been parsed, parse it now
	if ( !parser.isParsed( partial ) ) {
		// use the parseOptions of the ractive instance on which it was found
		var parsed = parser.parseFor( partial, instance );

		// Partials cannot contain nested partials!
		// TODO add a test for this
		if ( parsed.p ) {
			warnIfDebug( 'Partials ({{>%s}}) cannot contain nested inline partials', name, { ractive: ractive });
		}

		// if fn, use instance to store result, otherwise needs to go
		// in the correct point in prototype chain on instance or constructor
		var target = fn ? instance : findOwner( instance, name );

		// may be a template with partials, which need to be registered and main template extracted
		target.partials[ name ] = partial = parsed.t;
	}

	// store for reset
	if ( fn ) { partial._fn = fn; }

	return partial.v ? partial.t : partial;
}

function findOwner ( ractive, key ) {
	return ractive.partials.hasOwnProperty( key )
		? ractive
		: findConstructor( ractive.constructor, key);
}

function findConstructor ( constructor, key ) {
	if ( !constructor ) { return; }
	return constructor.partials.hasOwnProperty( key )
		? constructor
		: findConstructor( constructor.Parent, key );
}

function findParentPartial( name, parent ) {
	if ( parent ) {
		if ( parent.template && parent.template.p && parent.template.p[name] ) {
			return parent.template.p[name];
		} else if ( parent.parentFragment && parent.parentFragment.owner ) {
			return findParentPartial( name, parent.parentFragment.owner );
		}
	}
}

var Partial = (function (MustacheContainer$$1) {
	function Partial ( options ) {
		MustacheContainer$$1.call( this, options );

		this.yielder = options.template.t === YIELDER;

		if ( this.yielder ) {
			this.container = options.parentFragment.ractive;
			this.component = this.container.component;

			this.containerFragment = options.parentFragment;
			this.parentFragment = this.component.parentFragment;

			// {{yield}} is equivalent to {{yield content}}
			if ( !options.template.r && !options.template.rx && !options.template.x ) { options.template.r = 'content'; }
		}
	}

	if ( MustacheContainer$$1 ) Partial.__proto__ = MustacheContainer$$1;
	Partial.prototype = Object.create( MustacheContainer$$1 && MustacheContainer$$1.prototype );
	Partial.prototype.constructor = Partial;

	Partial.prototype.bind = function bind () {
		var this$1 = this;

		// keep track of the reference name for future resets
		this.refName = this.template.r;

		// name matches take priority over expressions
		var template = this.refName ? getPartialTemplate( this.ractive, this.refName, this.parentFragment ) || null : null;
		var templateObj;

		if ( template ) {
			this.named = true;
			this.setTemplate( this.template.r, template );
		}

		if ( !template ) {
			MustacheContainer$$1.prototype.bind.call(this);
			if ( ( templateObj = this.model.get() ) && typeof templateObj === 'object' && ( typeof templateObj.template === 'string' || Array.isArray( templateObj.t ) ) ) {
				if ( templateObj.template ) {
					this.source = templateObj.template;
					templateObj = parsePartial( this.template.r, templateObj.template, this.ractive );
				} else {
					this.source = templateObj.t;
				}
				this.setTemplate( this.template.r, templateObj.t );
			} else if ( typeof this.model.get() !== 'string' && this.refName ) {
				this.setTemplate( this.refName, template );
			} else {
				this.setTemplate( this.model.get() );
			}
		}

		var options = {
			owner: this,
			template: this.partialTemplate
		};

		if ( this.template.c ) {
			options.template = [{ t: SECTION, n: SECTION_WITH, f: options.template }];
			for ( var k in this$1.template.c ) {
				options.template[0][k] = this$1.template.c[k];
			}
		}

		if ( this.yielder ) {
			options.ractive = this.container.parent;
		}

		this.fragment = new Fragment(options);
		if ( this.template.z ) {
			this.fragment.aliases = resolveAliases( this.template.z, this.yielder ? this.containerFragment : this.parentFragment );
		}
		this.fragment.bind();
	};

	Partial.prototype.bubble = function bubble () {
		if ( this.yielder && !this.dirty ) {
			this.containerFragment.bubble();
			this.dirty = true;
		} else {
			MustacheContainer$$1.prototype.bubble.call(this);
		}
	};

	Partial.prototype.findNextNode = function findNextNode () {
		return this.yielder ? this.containerFragment.findNextNode( this ) : MustacheContainer$$1.prototype.findNextNode.call(this);
	};

	Partial.prototype.forceResetTemplate = function forceResetTemplate () {
		var this$1 = this;

		this.partialTemplate = undefined;

		// on reset, check for the reference name first
		if ( this.refName ) {
			this.partialTemplate = getPartialTemplate( this.ractive, this.refName, this.parentFragment );
		}

		// then look for the resolved name
		if ( !this.partialTemplate ) {
			this.partialTemplate = getPartialTemplate( this.ractive, this.name, this.parentFragment );
		}

		if ( !this.partialTemplate ) {
			warnOnceIfDebug( ("Could not find template for partial '" + (this.name) + "'") );
			this.partialTemplate = [];
		}

		if ( this.inAttribute ) {
			doInAttributes( function () { return this$1.fragment.resetTemplate( this$1.partialTemplate ); } );
		} else {
			this.fragment.resetTemplate( this.partialTemplate );
		}

		this.bubble();
	};

	Partial.prototype.render = function render ( target, occupants ) {
		return this.fragment.render( target, occupants );
	};

	Partial.prototype.setTemplate = function setTemplate ( name, template ) {
		this.name = name;

		if ( !template && template !== null ) { template = getPartialTemplate( this.ractive, name, this.parentFragment ); }

		if ( !template ) {
			warnOnceIfDebug( ("Could not find template for partial '" + name + "'") );
		}

		this.partialTemplate = template || [];
	};

	Partial.prototype.unbind = function unbind () {
		MustacheContainer$$1.prototype.unbind.call(this);
		this.fragment.aliases = {};
		this.fragment.unbind();
	};

	Partial.prototype.unrender = function unrender ( shouldDestroy ) {
		this.fragment.unrender( shouldDestroy );
	};

	Partial.prototype.update = function update () {
		var template;

		if ( this.dirty ) {
			this.dirty = false;

			if ( !this.named ) {
				if ( this.model ) {
					template = this.model.get();
				}

				if ( template && typeof template === 'string' && template !== this.name ) {
					this.setTemplate( template );
					this.fragment.resetTemplate( this.partialTemplate );
				} else if ( template && typeof template === 'object' && ( typeof template.template === 'string' || Array.isArray( template.t ) ) ) {
					if ( template.t !== this.source && template.template !== this.source ) {
						if ( template.template ) {
							this.source = template.template;
							template = parsePartial( this.name, template.template, this.ractive );
						} else {
							this.source = template.t;
						}
						this.setTemplate( this.name, template.t );
						this.fragment.resetTemplate( this.partialTemplate );
					}
				}
			}

			this.fragment.update();
		}
	};

	return Partial;
}(MustacheContainer));

function parsePartial( name, partial, ractive ) {
	var parsed;

	try {
		parsed = parser.parse( partial, parser.getParseOptions( ractive ) );
	} catch (e) {
		warnIfDebug( ("Could not parse partial from expression '" + name + "'\n" + (e.message)) );
	}

	return parsed || { t: [] };
}

var RepeatedFragment = function RepeatedFragment ( options ) {
	this.parent = options.owner.parentFragment;

	// bit of a hack, so reference resolution works without another
	// layer of indirection
	this.parentFragment = this;
	this.owner = options.owner;
	this.ractive = this.parent.ractive;
	this.delegate = this.ractive.delegate !== false && ( this.parent.delegate || findDelegate( findElement( options.owner ) ) );
	// delegation disabled by directive
	if ( this.delegate && this.delegate.delegate === false ) { this.delegate = false; }
	// let the element know it's a delegate handler
	if ( this.delegate ) { this.delegate.delegate = this.delegate; }

	// encapsulated styles should be inherited until they get applied by an element
	this.cssIds = 'cssIds' in options ? options.cssIds : ( this.parent ? this.parent.cssIds : null );

	this.context = null;
	this.rendered = false;
	this.iterations = [];

	this.template = options.template;

	this.indexRef = options.indexRef;
	this.keyRef = options.keyRef;

	this.pendingNewIndices = null;
	this.previousIterations = null;

	// track array versus object so updates of type rest
	this.isArray = false;
};

RepeatedFragment.prototype.bind = function bind$$1 ( context ) {
		var this$1 = this;

	this.context = context;
	var value = context.get();

	// {{#each array}}...
	if ( this.isArray = Array.isArray( value ) ) {
		// we can't use map, because of sparse arrays
		this.iterations = [];
		var max = value.length;
		for ( var i = 0; i < max; i += 1 ) {
			this$1.iterations[i] = this$1.createIteration( i, i );
		}
	}

	// {{#each object}}...
	else if ( isObject( value ) ) {
		this.isArray = false;

		// TODO this is a dreadful hack. There must be a neater way
		if ( this.indexRef ) {
			var refs = this.indexRef.split( ',' );
			this.keyRef = refs[0];
			this.indexRef = refs[1];
		}

		this.iterations = Object.keys( value ).map( function ( key, index ) {
			return this$1.createIteration( key, index );
		});
	}

	return this;
};

RepeatedFragment.prototype.bubble = function bubble ( index ) {
	if  ( !this.bubbled ) { this.bubbled = []; }
	this.bubbled.push( index );

	this.owner.bubble();
};

RepeatedFragment.prototype.createIteration = function createIteration ( key, index ) {
	var fragment = new Fragment({
		owner: this,
		template: this.template
	});

	fragment.key = key;
	fragment.index = index;
	fragment.isIteration = true;
	fragment.delegate = this.delegate;

	var model = this.context.joinKey( key );

	// set up an iteration alias if there is one
	if ( this.owner.template.z ) {
		fragment.aliases = {};
		fragment.aliases[ this.owner.template.z[0].n ] = model;
	}

	return fragment.bind( model );
};

RepeatedFragment.prototype.destroyed = function destroyed$1 () {
	this.iterations.forEach( destroyed );
};

RepeatedFragment.prototype.detach = function detach () {
	var docFrag = createDocumentFragment();
	this.iterations.forEach( function (fragment) { return docFrag.appendChild( fragment.detach() ); } );
	return docFrag;
};

RepeatedFragment.prototype.find = function find ( selector, options ) {
	return findMap( this.iterations, function (i) { return i.find( selector, options ); } );
};

RepeatedFragment.prototype.findAll = function findAll ( selector, options ) {
	return this.iterations.forEach( function (i) { return i.findAll( selector, options ); } );
};

RepeatedFragment.prototype.findComponent = function findComponent ( name, options ) {
	return findMap( this.iterations, function (i) { return i.findComponent( name, options ); } );
};

RepeatedFragment.prototype.findAllComponents = function findAllComponents ( name, options ) {
	return this.iterations.forEach( function (i) { return i.findAllComponents( name, options ); } );
};

RepeatedFragment.prototype.findNextNode = function findNextNode ( iteration ) {
		var this$1 = this;

	if ( iteration.index < this.iterations.length - 1 ) {
		for ( var i = iteration.index + 1; i < this.iterations.length; i++ ) {
			var node = this$1.iterations[ i ].firstNode( true );
			if ( node ) { return node; }
		}
	}

	return this.owner.findNextNode();
};

RepeatedFragment.prototype.firstNode = function firstNode ( skipParent ) {
	return this.iterations[0] ? this.iterations[0].firstNode( skipParent ) : null;
};

RepeatedFragment.prototype.rebind = function rebind ( next ) {
		var this$1 = this;

	this.context = next;
	this.iterations.forEach( function (fragment) {
		var model = next ? next.joinKey( fragment.key ) : undefined;
		fragment.context = model;
		if ( this$1.owner.template.z ) {
			fragment.aliases = {};
			fragment.aliases[ this$1.owner.template.z[0].n ] = model;
		}
	});
};

RepeatedFragment.prototype.render = function render$$1 ( target, occupants ) {
	// TODO use docFrag.cloneNode...

	var xs = this.iterations;
	if ( xs ) {
		var len = xs.length;
		for ( var i = 0; i < len; i++ ) {
			xs[i].render( target, occupants );
		}
	}

	this.rendered = true;
};

RepeatedFragment.prototype.shuffle = function shuffle ( newIndices ) {
		var this$1 = this;

	if ( !this.pendingNewIndices ) { this.previousIterations = this.iterations.slice(); }

	if ( !this.pendingNewIndices ) { this.pendingNewIndices = []; }

	this.pendingNewIndices.push( newIndices );

	var iterations = [];

	newIndices.forEach( function ( newIndex, oldIndex ) {
		if ( newIndex === -1 ) { return; }

		var fragment = this$1.iterations[ oldIndex ];
		iterations[ newIndex ] = fragment;

		if ( newIndex !== oldIndex && fragment ) { fragment.dirty = true; }
	});

	this.iterations = iterations;

	this.bubble();
};

RepeatedFragment.prototype.shuffled = function shuffled$1 () {
	this.iterations.forEach( shuffled );
};

RepeatedFragment.prototype.toString = function toString$1$$1 ( escape ) {
	return this.iterations ?
		this.iterations.map( escape ? toEscapedString : toString$1 ).join( '' ) :
		'';
};

RepeatedFragment.prototype.unbind = function unbind$1 () {
	this.iterations.forEach( unbind );
	return this;
};

RepeatedFragment.prototype.unrender = function unrender$1 ( shouldDestroy ) {
	this.iterations.forEach( shouldDestroy ? unrenderAndDestroy : unrender );
	if ( this.pendingNewIndices && this.previousIterations ) {
		this.previousIterations.forEach( function (fragment) {
			if ( fragment.rendered ) { shouldDestroy ? unrenderAndDestroy( fragment ) : unrender( fragment ); }
		});
	}
	this.rendered = false;
};

// TODO smart update
RepeatedFragment.prototype.update = function update$1 () {
		var this$1 = this;

	// skip dirty check, since this is basically just a facade

	if ( this.pendingNewIndices ) {
		this.bubbled.length = 0;
		this.updatePostShuffle();
		return;
	}

	if ( this.updating ) { return; }
	this.updating = true;

	var value = this.context.get();
	var wasArray = this.isArray;

	var toRemove;
	var oldKeys;
	var reset = true;
	var i;

	if ( this.isArray = Array.isArray( value ) ) {
		if ( wasArray ) {
			reset = false;
			if ( this.iterations.length > value.length ) {
				toRemove = this.iterations.splice( value.length );
			}
		}
	} else if ( isObject( value ) && !wasArray ) {
		reset = false;
		toRemove = [];
		oldKeys = {};
		i = this.iterations.length;

		while ( i-- ) {
			var fragment$1 = this$1.iterations[i];
			if ( fragment$1.key in value ) {
				oldKeys[ fragment$1.key ] = true;
			} else {
				this$1.iterations.splice( i, 1 );
				toRemove.push( fragment$1 );
			}
		}
	}

	if ( reset ) {
		toRemove = this.iterations;
		this.iterations = [];
	}

	if ( toRemove ) {
		toRemove.forEach( function (fragment) {
			fragment.unbind();
			fragment.unrender( true );
		});
	}

	// update the remaining ones
	if ( !reset && this.isArray && this.bubbled && this.bubbled.length ) {
		this.bubbled.forEach( function (i) { return this$1.iterations[i] && this$1.iterations[i].update(); } );
	} else {
		this.iterations.forEach( update );
	}

	if ( this.bubbled ) { this.bubbled.length = 0; }

	// add new iterations
	var newLength = Array.isArray( value ) ?
		value.length :
		isObject( value ) ?
			Object.keys( value ).length :
			0;

	var docFrag;
	var fragment;

	if ( newLength > this.iterations.length ) {
		docFrag = this.rendered ? createDocumentFragment() : null;
		i = this.iterations.length;

		if ( Array.isArray( value ) ) {
			while ( i < value.length ) {
				fragment = this$1.createIteration( i, i );

				this$1.iterations.push( fragment );
				if ( this$1.rendered ) { fragment.render( docFrag ); }

				i += 1;
			}
		}

		else if ( isObject( value ) ) {
			// TODO this is a dreadful hack. There must be a neater way
			if ( this.indexRef && !this.keyRef ) {
				var refs = this.indexRef.split( ',' );
				this.keyRef = refs[0];
				this.indexRef = refs[1];
			}

			Object.keys( value ).forEach( function (key) {
				if ( !oldKeys || !( key in oldKeys ) ) {
					fragment = this$1.createIteration( key, i );

					this$1.iterations.push( fragment );
					if ( this$1.rendered ) { fragment.render( docFrag ); }

					i += 1;
				}
			});
		}

		if ( this.rendered ) {
			var parentNode = this.parent.findParentNode();
			var anchor = this.parent.findNextNode( this.owner );

			parentNode.insertBefore( docFrag, anchor );
		}
	}

	this.updating = false;
};

RepeatedFragment.prototype.updatePostShuffle = function updatePostShuffle () {
		var this$1 = this;

	var newIndices = this.pendingNewIndices[ 0 ];

	// map first shuffle through
	this.pendingNewIndices.slice( 1 ).forEach( function (indices) {
		newIndices.forEach( function ( newIndex, oldIndex ) {
			newIndices[ oldIndex ] = indices[ newIndex ];
		});
	});

	// This algorithm (for detaching incorrectly-ordered fragments from the DOM and
	// storing them in a document fragment for later reinsertion) seems a bit hokey,
	// but it seems to work for now
	var len = this.context.get().length;
	var oldLen = this.previousIterations.length;
	var removed = {};
	var i;

	newIndices.forEach( function ( newIndex, oldIndex ) {
		var fragment = this$1.previousIterations[ oldIndex ];
		this$1.previousIterations[ oldIndex ] = null;

		if ( newIndex === -1 ) {
			removed[ oldIndex ] = fragment;
		} else if ( fragment.index !== newIndex ) {
			var model = this$1.context.joinKey( newIndex );
			fragment.index = fragment.key = newIndex;
			fragment.context = model;
			if ( this$1.owner.template.z ) {
				fragment.aliases = {};
				fragment.aliases[ this$1.owner.template.z[0].n ] = model;
			}
		}
	});

	// if the array was spliced outside of ractive, sometimes there are leftover fragments not in the newIndices
	this.previousIterations.forEach( function ( frag, i ) {
		if ( frag ) { removed[ i ] = frag; }
	});

	// create new/move existing iterations
	var docFrag = this.rendered ? createDocumentFragment() : null;
	var parentNode = this.rendered ? this.parent.findParentNode() : null;

	var contiguous = 'startIndex' in newIndices;
	i = contiguous ? newIndices.startIndex : 0;

	for ( i; i < len; i++ ) {
		var frag = this$1.iterations[i];

		if ( frag && contiguous ) {
			// attach any built-up iterations
			if ( this$1.rendered ) {
				if ( removed[i] ) { docFrag.appendChild( removed[i].detach() ); }
				if ( docFrag.childNodes.length  ) { parentNode.insertBefore( docFrag, frag.firstNode() ); }
			}
			continue;
		}

		if ( !frag ) { this$1.iterations[i] = this$1.createIteration( i, i ); }

		if ( this$1.rendered ) {
			if ( removed[i] ) { docFrag.appendChild( removed[i].detach() ); }

			if ( frag ) { docFrag.appendChild( frag.detach() ); }
			else {
				this$1.iterations[i].render( docFrag );
			}
		}
	}

	// append any leftovers
	if ( this.rendered ) {
		for ( i = len; i < oldLen; i++ ) {
			if ( removed[i] ) { docFrag.appendChild( removed[i].detach() ); }
		}

		if ( docFrag.childNodes.length ) {
			parentNode.insertBefore( docFrag, this.owner.findNextNode() );
		}
	}

	// trigger removal on old nodes
	Object.keys( removed ).forEach( function (k) { return removed[k].unbind().unrender( true ); } );

	this.iterations.forEach( update );

	this.pendingNewIndices = null;

	this.shuffled();
};

// find the topmost delegate
function findDelegate ( start ) {
	var el = start;
	var delegate = start;

	while ( el ) {
		if ( el.delegate ) { delegate = el; }
		el = el.parent;
	}

	return delegate;
}

function isEmpty ( value ) {
	return !value ||
	       ( Array.isArray( value ) && value.length === 0 ) ||
		   ( isObject( value ) && Object.keys( value ).length === 0 );
}

function getType ( value, hasIndexRef ) {
	if ( hasIndexRef || Array.isArray( value ) ) { return SECTION_EACH; }
	if ( isObject( value ) || typeof value === 'function' ) { return SECTION_IF_WITH; }
	if ( value === undefined ) { return null; }
	return SECTION_IF;
}

var Section = (function (MustacheContainer$$1) {
	function Section ( options ) {
		MustacheContainer$$1.call( this, options );

		this.sectionType = options.template.n || null;
		this.templateSectionType = this.sectionType;
		this.subordinate = options.template.l === 1;
		this.fragment = null;
	}

	if ( MustacheContainer$$1 ) Section.__proto__ = MustacheContainer$$1;
	Section.prototype = Object.create( MustacheContainer$$1 && MustacheContainer$$1.prototype );
	Section.prototype.constructor = Section;

	Section.prototype.bind = function bind () {
		MustacheContainer$$1.prototype.bind.call(this);

		if ( this.subordinate ) {
			this.sibling = this.parentFragment.items[ this.parentFragment.items.indexOf( this ) - 1 ];
			this.sibling.nextSibling = this;
		}

		// if we managed to bind, we need to create children
		if ( this.model ) {
			this.dirty = true;
			this.update();
		} else if ( this.sectionType && this.sectionType === SECTION_UNLESS && ( !this.sibling || !this.sibling.isTruthy() ) ) {
			this.fragment = new Fragment({
				owner: this,
				template: this.template.f
			}).bind();
		}
	};

	Section.prototype.detach = function detach () {
		var frag = this.fragment || this.detached;
		return frag ? frag.detach() : MustacheContainer$$1.prototype.detach.call(this);
	};

	Section.prototype.isTruthy = function isTruthy () {
		if ( this.subordinate && this.sibling.isTruthy() ) { return true; }
		var value = !this.model ? undefined : this.model.isRoot ? this.model.value : this.model.get();
		return !!value && ( this.templateSectionType === SECTION_IF_WITH || !isEmpty( value ) );
	};

	Section.prototype.rebind = function rebind ( next, previous, safe ) {
		if ( MustacheContainer$$1.prototype.rebind.call( this, next, previous, safe ) ) {
			if ( this.fragment && this.sectionType !== SECTION_IF && this.sectionType !== SECTION_UNLESS ) {
				this.fragment.rebind( next );
			}
		}
	};

	Section.prototype.render = function render ( target, occupants ) {
		this.rendered = true;
		if ( this.fragment ) { this.fragment.render( target, occupants ); }
	};

	Section.prototype.shuffle = function shuffle ( newIndices ) {
		if ( this.fragment && this.sectionType === SECTION_EACH ) {
			this.fragment.shuffle( newIndices );
		}
	};

	Section.prototype.unbind = function unbind () {
		MustacheContainer$$1.prototype.unbind.call(this);
		if ( this.fragment ) { this.fragment.unbind(); }
	};

	Section.prototype.unrender = function unrender ( shouldDestroy ) {
		if ( this.rendered && this.fragment ) { this.fragment.unrender( shouldDestroy ); }
		this.rendered = false;
	};

	Section.prototype.update = function update () {
		var this$1 = this;

		if ( !this.dirty ) { return; }

		if ( this.fragment && this.sectionType !== SECTION_IF && this.sectionType !== SECTION_UNLESS ) {
			this.fragment.context = this.model;
		}

		if ( !this.model && this.sectionType !== SECTION_UNLESS ) { return; }

		this.dirty = false;

		var value = !this.model ? undefined : this.model.isRoot ? this.model.value : this.model.get();
		var siblingFalsey = !this.subordinate || !this.sibling.isTruthy();
		var lastType = this.sectionType;

		// watch for switching section types
		if ( this.sectionType === null || this.templateSectionType === null ) { this.sectionType = getType( value, this.template.i ); }
		if ( lastType && lastType !== this.sectionType && this.fragment ) {
			if ( this.rendered ) {
				this.fragment.unbind().unrender( true );
			}

			this.fragment = null;
		}

		var newFragment;

		var fragmentShouldExist = this.sectionType === SECTION_EACH || // each always gets a fragment, which may have no iterations
		                            this.sectionType === SECTION_WITH || // with (partial context) always gets a fragment
		                            ( siblingFalsey && ( this.sectionType === SECTION_UNLESS ? !this.isTruthy() : this.isTruthy() ) ); // if, unless, and if-with depend on siblings and the condition

		if ( fragmentShouldExist ) {
			if ( !this.fragment ) { this.fragment = this.detached; }

			if ( this.fragment ) {
				// check for detached fragment
				if ( this.detached ) {
					attach( this, this.fragment );
					this.detached = false;
					this.rendered = true;
				}

				this.fragment.update();
			} else {
				if ( this.sectionType === SECTION_EACH ) {
					newFragment = new RepeatedFragment({
						owner: this,
						template: this.template.f,
						indexRef: this.template.i
					}).bind( this.model );
				} else {
					// only with and if-with provide context - if and unless do not
					var context = this.sectionType !== SECTION_IF && this.sectionType !== SECTION_UNLESS ? this.model : null;
					newFragment = new Fragment({
						owner: this,
						template: this.template.f
					}).bind( context );
				}
			}
		} else {
			if ( this.fragment && this.rendered ) {
				if ( keep !== true ) {
					this.fragment.unbind().unrender( true );
				} else {
					this.unrender( false );
					this.detached = this.fragment;
					runloop.scheduleTask( function () { return this$1.detach(); } );
				}
			} else if ( this.fragment ) {
				this.fragment.unbind();
			}

			this.fragment = null;
		}

		if ( newFragment ) {
			if ( this.rendered ) {
				attach( this, newFragment );
			}

			this.fragment = newFragment;
		}

		if ( this.nextSibling ) {
			this.nextSibling.dirty = true;
			this.nextSibling.update();
		}
	};

	return Section;
}(MustacheContainer));

function attach ( section, fragment ) {
	var anchor = section.parentFragment.findNextNode( section );

	if ( anchor ) {
		var docFrag = createDocumentFragment();
		fragment.render( docFrag );

		anchor.parentNode.insertBefore( docFrag, anchor );
	} else {
		fragment.render( section.parentFragment.findParentNode() );
	}
}

var Select = (function (Element$$1) {
	function Select ( options ) {
		Element$$1.call( this, options );
		this.options = [];
	}

	if ( Element$$1 ) Select.__proto__ = Element$$1;
	Select.prototype = Object.create( Element$$1 && Element$$1.prototype );
	Select.prototype.constructor = Select;

	Select.prototype.foundNode = function foundNode ( node ) {
		if ( this.binding ) {
			var selectedOptions = getSelectedOptions( node );

			if ( selectedOptions.length > 0 ) {
				this.selectedOptions = selectedOptions;
			}
		}
	};

	Select.prototype.render = function render ( target, occupants ) {
		Element$$1.prototype.render.call( this, target, occupants );
		this.sync();

		var node = this.node;

		var i = node.options.length;
		while ( i-- ) {
			node.options[i].defaultSelected = node.options[i].selected;
		}

		this.rendered = true;
	};

	Select.prototype.sync = function sync () {
		var this$1 = this;

		var selectNode = this.node;

		if ( !selectNode ) { return; }

		var options = toArray( selectNode.options );

		if ( this.selectedOptions ) {
			options.forEach( function (o) {
				if ( this$1.selectedOptions.indexOf( o ) >= 0 ) { o.selected = true; }
				else { o.selected = false; }
			});
			this.binding.setFromNode( selectNode );
			delete this.selectedOptions;
			return;
		}

		var selectValue = this.getAttribute( 'value' );
		var isMultiple = this.getAttribute( 'multiple' );
		var array = isMultiple && Array.isArray( selectValue );

		// If the <select> has a specified value, that should override
		// these options
		if ( selectValue !== undefined ) {
			var optionWasSelected;

			options.forEach( function (o) {
				var optionValue = o._ractive ? o._ractive.value : o.value;
				var shouldSelect = isMultiple ?
					array && this$1.valueContains( selectValue, optionValue ) :
					this$1.compare( selectValue, optionValue );

				if ( shouldSelect ) {
					optionWasSelected = true;
				}

				o.selected = shouldSelect;
			});

			if ( !optionWasSelected && !isMultiple ) {
				if ( this.binding ) {
					this.binding.forceUpdate();
				}
			}
		}

		// Otherwise the value should be initialised according to which
		// <option> element is selected, if twoway binding is in effect
		else if ( this.binding ) {
			this.binding.forceUpdate();
		}
	};
	Select.prototype.valueContains = function valueContains ( selectValue, optionValue ) {
		var this$1 = this;

		var i = selectValue.length;
		while ( i-- ) {
			if ( this$1.compare( optionValue, selectValue[i] ) ) { return true; }
		}
	};
	Select.prototype.compare = function compare (optionValue, selectValue) {
		var comparator = this.getAttribute( 'value-comparator' );
		if ( comparator ) {
			if (typeof comparator === 'function') {
				return comparator( selectValue, optionValue );
			}
			if ( selectValue && optionValue ) {
				return selectValue[comparator] == optionValue[comparator];
			}
		}
		return selectValue == optionValue;
	};
	Select.prototype.update = function update () {
		var dirty = this.dirty;
		Element$$1.prototype.update.call(this);
		if ( dirty ) {
			this.sync();
		}
	};

	return Select;
}(Element));

var Textarea = (function (Input$$1) {
	function Textarea( options ) {
		var template = options.template;

		options.deferContent = true;

		Input$$1.call( this, options );

		// check for single interpolator binding
		if ( !this.attributeByName.value ) {
			if ( template.f && isBindable( { template: template } ) ) {
				( this.attributes || ( this.attributes = [] ) ).push( createItem( {
					owner: this,
					template: { t: ATTRIBUTE, f: template.f, n: 'value' },
					parentFragment: this.parentFragment
				} ) );
			} else {
				this.fragment = new Fragment({ owner: this, cssIds: null, template: template.f });
			}
		}
	}

	if ( Input$$1 ) Textarea.__proto__ = Input$$1;
	Textarea.prototype = Object.create( Input$$1 && Input$$1.prototype );
	Textarea.prototype.constructor = Textarea;

	Textarea.prototype.bubble = function bubble () {
		var this$1 = this;

		if ( !this.dirty ) {
			this.dirty = true;

			if ( this.rendered && !this.binding && this.fragment ) {
				runloop.scheduleTask( function () {
					this$1.dirty = false;
					this$1.node.value = this$1.fragment.toString();
				});
			}

			this.parentFragment.bubble(); // default behaviour
		}
	};

	return Textarea;
}(Input));

var Text = (function (Item$$1) {
	function Text ( options ) {
		Item$$1.call( this, options );
		this.type = TEXT;
	}

	if ( Item$$1 ) Text.__proto__ = Item$$1;
	Text.prototype = Object.create( Item$$1 && Item$$1.prototype );
	Text.prototype.constructor = Text;

	Text.prototype.detach = function detach () {
		return detachNode( this.node );
	};

	Text.prototype.firstNode = function firstNode () {
		return this.node;
	};

	Text.prototype.render = function render ( target, occupants ) {
		if ( inAttributes() ) { return; }
		this.rendered = true;

		progressiveText( this, target, occupants, this.template );
	};

	Text.prototype.toString = function toString ( escape ) {
		return escape ? escapeHtml( this.template ) : this.template;
	};

	Text.prototype.unrender = function unrender ( shouldDestroy ) {
		if ( this.rendered && shouldDestroy ) { this.detach(); }
		this.rendered = false;
	};

	Text.prototype.valueOf = function valueOf () {
		return this.template;
	};

	return Text;
}(Item));

var proto$4 = Text.prototype;
proto$4.bind = proto$4.unbind = proto$4.update = noop;

var prefix;

if ( !isClient ) {
	prefix = null;
} else {
	var prefixCache = {};
	var testStyle = createElement( 'div' ).style;

	// technically this also normalizes on hyphenated styles as well
	prefix = function ( prop ) {
		if ( !prefixCache[ prop ] ) {
			var name = hyphenateCamel( prop );

			if ( testStyle[ prop ] !== undefined ) {
				prefixCache[ prop ] = name;
			}

			else {
				// test vendors...
				var i = vendors.length;
				while ( i-- ) {
					var vendor = "-" + (vendors[i]) + "-" + name;
					if ( testStyle[ vendor ] !== undefined ) {
						prefixCache[ prop ] = vendor;
						break;
					}
				}
			}
		}

		return prefixCache[ prop ];
	};
}

var prefix$1 = prefix;

var visible;
var hidden = 'hidden';

if ( doc ) {
	var prefix$2;

	if ( hidden in doc ) {
		prefix$2 = '';
	} else {
		var i$1 = vendors.length;
		while ( i$1-- ) {
			var vendor = vendors[i$1];
			hidden = vendor + 'Hidden';

			if ( hidden in doc ) {
				prefix$2 = vendor;
				break;
			}
		}
	}

	if ( prefix$2 !== undefined ) {
		doc.addEventListener( prefix$2 + 'visibilitychange', onChange );
		onChange();
	} else {
		// gah, we're in an old browser
		if ( 'onfocusout' in doc ) {
			doc.addEventListener( 'focusout', onHide );
			doc.addEventListener( 'focusin', onShow );
		}

		else {
			win.addEventListener( 'pagehide', onHide );
			win.addEventListener( 'blur', onHide );

			win.addEventListener( 'pageshow', onShow );
			win.addEventListener( 'focus', onShow );
		}

		visible = true; // until proven otherwise. Not ideal but hey
	}
}

function onChange () {
	visible = !doc[ hidden ];
}

function onHide () {
	visible = false;
}

function onShow () {
	visible = true;
}

var vendorPattern = new RegExp( '^(?:' + vendors.join( '|' ) + ')([A-Z])' );

var hyphenate = function ( str ) {
	if ( !str ) { return ''; } // edge case

	if ( vendorPattern.test( str ) ) { str = '-' + str; }

	return str.replace( /[A-Z]/g, function (match) { return '-' + match.toLowerCase(); } );
};

var createTransitions;

if ( !isClient ) {
	createTransitions = null;
} else {
	var testStyle$1 = createElement( 'div' ).style;
	var linear$1 = function (x) { return x; };

	var canUseCssTransitions = {};
	var cannotUseCssTransitions = {};

	// determine some facts about our environment
	var TRANSITION$1;
	var TRANSITIONEND;
	var CSS_TRANSITIONS_ENABLED;
	var TRANSITION_DURATION;
	var TRANSITION_PROPERTY;
	var TRANSITION_TIMING_FUNCTION;

	if ( testStyle$1.transition !== undefined ) {
		TRANSITION$1 = 'transition';
		TRANSITIONEND = 'transitionend';
		CSS_TRANSITIONS_ENABLED = true;
	} else if ( testStyle$1.webkitTransition !== undefined ) {
		TRANSITION$1 = 'webkitTransition';
		TRANSITIONEND = 'webkitTransitionEnd';
		CSS_TRANSITIONS_ENABLED = true;
	} else {
		CSS_TRANSITIONS_ENABLED = false;
	}

	if ( TRANSITION$1 ) {
		TRANSITION_DURATION = TRANSITION$1 + 'Duration';
		TRANSITION_PROPERTY = TRANSITION$1 + 'Property';
		TRANSITION_TIMING_FUNCTION = TRANSITION$1 + 'TimingFunction';
	}

	createTransitions = function ( t, to, options, changedProperties, resolve ) {

		// Wait a beat (otherwise the target styles will be applied immediately)
		// TODO use a fastdom-style mechanism?
		setTimeout( function () {
			var jsTransitionsComplete;
			var cssTransitionsComplete;
			var cssTimeout; // eslint-disable-line prefer-const

			function transitionDone () { clearTimeout( cssTimeout ); }

			function checkComplete () {
				if ( jsTransitionsComplete && cssTransitionsComplete ) {
					t.unregisterCompleteHandler( transitionDone );
					// will changes to events and fire have an unexpected consequence here?
					t.ractive.fire( t.name + ':end', t.node, t.isIntro );
					resolve();
				}
			}

			// this is used to keep track of which elements can use CSS to animate
			// which properties
			var hashPrefix = ( t.node.namespaceURI || '' ) + t.node.tagName;

			// need to reset transition properties
			var style = t.node.style;
			var previous = {
				property: style[ TRANSITION_PROPERTY ],
				timing: style[ TRANSITION_TIMING_FUNCTION ],
				duration: style[ TRANSITION_DURATION ]
			};

			function transitionEndHandler ( event ) {
				var index = changedProperties.indexOf( event.propertyName );

				if ( index !== -1 ) {
					changedProperties.splice( index, 1 );
				}

				if ( changedProperties.length ) {
					// still transitioning...
					return;
				}

				clearTimeout( cssTimeout );
				cssTransitionsDone();
			}

			function cssTransitionsDone () {
				style[ TRANSITION_PROPERTY ] = previous.property;
				style[ TRANSITION_TIMING_FUNCTION ] = previous.duration;
				style[ TRANSITION_DURATION ] = previous.timing;

				t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );

				cssTransitionsComplete = true;
				checkComplete();
			}

			t.node.addEventListener( TRANSITIONEND, transitionEndHandler, false );

			// safety net in case transitionend never fires
			cssTimeout = setTimeout( function () {
				changedProperties = [];
				cssTransitionsDone();
			}, options.duration + ( options.delay || 0 ) + 50 );
			t.registerCompleteHandler( transitionDone );

			style[ TRANSITION_PROPERTY ] = changedProperties.join( ',' );
			var easingName = hyphenate( options.easing || 'linear' );
			style[ TRANSITION_TIMING_FUNCTION ] = easingName;
			var cssTiming = style[ TRANSITION_TIMING_FUNCTION ] === easingName;
			style[ TRANSITION_DURATION ] = ( options.duration / 1000 ) + 's';

			setTimeout( function () {
				var i = changedProperties.length;
				var hash;
				var originalValue = null;
				var index;
				var propertiesToTransitionInJs = [];
				var prop;
				var suffix;
				var interpolator;

				while ( i-- ) {
					prop = changedProperties[i];
					hash = hashPrefix + prop;

					if ( cssTiming && CSS_TRANSITIONS_ENABLED && !cannotUseCssTransitions[ hash ] ) {
						var initial = style[ prop ];
						style[ prop ] = to[ prop ];

						// If we're not sure if CSS transitions are supported for
						// this tag/property combo, find out now
						if ( !( hash in canUseCssTransitions ) ) {
							originalValue = t.getStyle( prop );

							// if this property is transitionable in this browser,
							// the current style will be different from the target style
							canUseCssTransitions[ hash ] = ( t.getStyle( prop ) != to[ prop ] );
							cannotUseCssTransitions[ hash ] = !canUseCssTransitions[ hash ];

							// Reset, if we're going to use timers after all
							if ( cannotUseCssTransitions[ hash ] ) {
								style[ prop ] = initial;
							}
						}
					}

					if ( !cssTiming || !CSS_TRANSITIONS_ENABLED || cannotUseCssTransitions[ hash ] ) {
						// we need to fall back to timer-based stuff
						if ( originalValue === null ) { originalValue = t.getStyle( prop ); }

						// need to remove this from changedProperties, otherwise transitionEndHandler
						// will get confused
						index = changedProperties.indexOf( prop );
						if ( index === -1 ) {
							warnIfDebug( 'Something very strange happened with transitions. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!', { node: t.node });
						} else {
							changedProperties.splice( index, 1 );
						}

						// TODO Determine whether this property is animatable at all

						suffix = /[^\d]*$/.exec( originalValue )[0];
						interpolator = interpolate( parseFloat( originalValue ), parseFloat( to[ prop ] ) );

						// ...then kick off a timer-based transition
						if ( interpolator ) {
							propertiesToTransitionInJs.push({
								name: prop,
								interpolator: interpolator,
								suffix: suffix
							});
						} else {
							style[ prop ] = to[ prop ];
						}

						originalValue = null;
					}
				}

				// javascript transitions
				if ( propertiesToTransitionInJs.length ) {
					var easing;

					if ( typeof options.easing === 'string' ) {
						easing = t.ractive.easing[ options.easing ];

						if ( !easing ) {
							warnOnceIfDebug( missingPlugin( options.easing, 'easing' ) );
							easing = linear$1;
						}
					} else if ( typeof options.easing === 'function' ) {
						easing = options.easing;
					} else {
						easing = linear$1;
					}

					new Ticker({
						duration: options.duration,
						easing: easing,
						step: function step ( pos ) {
							var i = propertiesToTransitionInJs.length;
							while ( i-- ) {
								var prop = propertiesToTransitionInJs[i];
								style[ prop.name ] = prop.interpolator( pos ) + prop.suffix;
							}
						},
						complete: function complete () {
							jsTransitionsComplete = true;
							checkComplete();
						}
					});
				} else {
					jsTransitionsComplete = true;
				}

				if ( changedProperties.length ) {
					style[ TRANSITION_PROPERTY ] = changedProperties.join( ',' );
				} else {
					style[ TRANSITION_PROPERTY ] = 'none';

					// We need to cancel the transitionEndHandler, and deal with
					// the fact that it will never fire
					t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );
					cssTransitionsComplete = true;
					checkComplete();
				}
			}, 0 );
		}, options.delay || 0 );
	};
}

var createTransitions$1 = createTransitions;

var getComputedStyle = win && win.getComputedStyle;
var resolved = Promise.resolve();

var names = {
	t0: 'intro-outro',
	t1: 'intro',
	t2: 'outro'
};

var Transition = function Transition ( options ) {
	this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
	this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment );
	this.ractive = this.owner.ractive;
	this.template = options.template;
	this.parentFragment = options.parentFragment;
	this.options = options;
	this.onComplete = [];
};

Transition.prototype.animateStyle = function animateStyle ( style, value, options ) {
		var this$1 = this;

	if ( arguments.length === 4 ) {
		throw new Error( 't.animateStyle() returns a promise - use .then() instead of passing a callback' );
	}

	// Special case - page isn't visible. Don't animate anything, because
	// that way you'll never get CSS transitionend events
	if ( !visible ) {
		this.setStyle( style, value );
		return resolved;
	}

	var to;

	if ( typeof style === 'string' ) {
		to = {};
		to[ style ] = value;
	} else {
		to = style;

		// shuffle arguments
		options = value;
	}

	return new Promise( function (fulfil) {
		// Edge case - if duration is zero, set style synchronously and complete
		if ( !options.duration ) {
			this$1.setStyle( to );
			fulfil();
			return;
		}

		// Get a list of the properties we're animating
		var propertyNames = Object.keys( to );
		var changedProperties = [];

		// Store the current styles
		var computedStyle = getComputedStyle( this$1.node );

		var i = propertyNames.length;
		while ( i-- ) {
			var prop = propertyNames[i];
			var name = prefix$1( prop );

			var current = computedStyle[ prefix$1( prop ) ];

			// record the starting points
			var init = this$1.node.style[name];
			if ( !( name in this$1.originals ) ) { this$1.originals[ name ] = this$1.node.style[ name ]; }
			this$1.node.style[ name ] = to[ prop ];
			this$1.targets[ name ] = this$1.node.style[ name ];
			this$1.node.style[ name ] = init;

			// we need to know if we're actually changing anything
			if ( current != to[ prop ] ) { // use != instead of !==, so we can compare strings with numbers
				changedProperties.push( name );

				// if we happened to prefix, make sure there is a properly prefixed value
				to[ name ] = to[ prop ];

				// make the computed style explicit, so we can animate where
				// e.g. height='auto'
				this$1.node.style[ name ] = current;
			}
		}

		// If we're not actually changing anything, the transitionend event
		// will never fire! So we complete early
		if ( !changedProperties.length ) {
			fulfil();
			return;
		}

		createTransitions$1( this$1, to, options, changedProperties, fulfil );
	});
};

Transition.prototype.bind = function bind () {
	var options = this.options;
	var type = options.template && options.template.v;
	if ( type ) {
		if ( type === 't0' || type === 't1' ) { this.element.intro = this; }
		if ( type === 't0' || type === 't2' ) { this.element.outro = this; }
		this.eventName = names[ type ];
	}

	var ractive = this.owner.ractive;

	this.name = options.name || options.template.n;

	if ( options.params ) {
		this.params = options.params;
	}

	if ( typeof this.name === 'function' ) {
		this._fn = this.name;
		this.name = this._fn.name;
	} else {
		this._fn = findInViewHierarchy( 'transitions', ractive, this.name );
	}

	if ( !this._fn ) {
		warnOnceIfDebug( missingPlugin( this.name, 'transition' ), { ractive: ractive });
	}

	setupArgsFn( this, options.template );
};

Transition.prototype.getParams = function getParams () {
	if ( this.params ) { return this.params; }

	// get expression args if supplied
	if ( this.fn ) {
		var values = resolveArgs( this, this.template, this.parentFragment ).map( function (model) {
			if ( !model ) { return undefined; }

			return model.get();
		});
		return this.fn.apply( this.ractive, values );
	}
};

Transition.prototype.getStyle = function getStyle ( props ) {
	var computedStyle = getComputedStyle( this.node );

	if ( typeof props === 'string' ) {
		return computedStyle[ prefix$1( props ) ];
	}

	if ( !Array.isArray( props ) ) {
		throw new Error( 'Transition$getStyle must be passed a string, or an array of strings representing CSS properties' );
	}

	var styles = {};

	var i = props.length;
	while ( i-- ) {
		var prop = props[i];
		var value = computedStyle[ prefix$1( prop ) ];

		if ( value === '0px' ) { value = 0; }
		styles[ prop ] = value;
	}

	return styles;
};

Transition.prototype.processParams = function processParams ( params, defaults ) {
	if ( typeof params === 'number' ) {
		params = { duration: params };
	}

	else if ( typeof params === 'string' ) {
		if ( params === 'slow' ) {
			params = { duration: 600 };
		} else if ( params === 'fast' ) {
			params = { duration: 200 };
		} else {
			params = { duration: 400 };
		}
	} else if ( !params ) {
		params = {};
	}

	return Object.assign( {}, defaults, params );
};

Transition.prototype.registerCompleteHandler = function registerCompleteHandler ( fn ) {
	addToArray( this.onComplete, fn );
};

Transition.prototype.setStyle = function setStyle ( style, value ) {
		var this$1 = this;

	if ( typeof style === 'string' ) {
		var name = prefix$1(  style );
		if ( !this.originals.hasOwnProperty( name ) ) { this.originals[ name ] = this.node.style[ name ]; }
		this.node.style[ name ] = value;
		this.targets[ name ] = this.node.style[ name ];
	}

	else {
		var prop;
		for ( prop in style ) {
			if ( style.hasOwnProperty( prop ) ) {
				this$1.setStyle( prop, style[ prop ] );
			}
		}
	}

	return this;
};

Transition.prototype.shouldFire = function shouldFire ( type ) {
	if ( !this.ractive.transitionsEnabled ) { return false; }

	// check for noIntro and noOutro cases, which only apply when the owner ractive is rendering and unrendering, respectively
	if ( type === 'intro' && this.ractive.rendering && nearestProp( 'noIntro', this.ractive, true ) ) { return false; }
	if ( type === 'outro' && this.ractive.unrendering && nearestProp( 'noOutro', this.ractive, false ) ) { return false; }

	var params = this.getParams(); // this is an array, the params object should be the first member
	// if there's not a parent element, this can't be nested, so roll on
	if ( !this.element.parent ) { return true; }

	// if there is a local param, it takes precedent
	if ( params && params[0] && isObject(params[0]) && 'nested' in params[0] ) {
		if ( params[0].nested !== false ) { return true; }
	} else { // use the nearest instance setting
		// find the nearest instance that actually has a nested setting
		if ( nearestProp( 'nestedTransitions', this.ractive ) !== false ) { return true; }
	}

	// check to see if this is actually a nested transition
	var el = this.element.parent;
	while ( el ) {
		if ( el[type] && el[type].starting ) { return false; }
		el = el.parent;
	}

	return true;
};

Transition.prototype.start = function start () {
		var this$1 = this;

	var node = this.node = this.element.node;
	var originals = this.originals = {};  //= node.getAttribute( 'style' );
	var targets = this.targets = {};

	var completed;
	var args = this.getParams();

	// create t.complete() - we don't want this on the prototype,
	// because we don't want `this` silliness when passing it as
	// an argument
	this.complete = function (noReset) {
		this$1.starting = false;
		if ( completed ) {
			return;
		}

		this$1.onComplete.forEach( function (fn) { return fn(); } );
		if ( !noReset && this$1.isIntro ) {
			for ( var k in targets ) {
				if ( node.style[ k ] === targets[ k ] ) { node.style[ k ] = originals[ k ]; }
			}
		}

		this$1._manager.remove( this$1 );

		completed = true;
	};

	// If the transition function doesn't exist, abort
	if ( !this._fn ) {
		this.complete();
		return;
	}

	var promise = this._fn.apply( this.ractive, [ this ].concat( args ) );
	if ( promise ) { promise.then( this.complete ); }
};

Transition.prototype.toString = function toString () { return ''; };

Transition.prototype.unbind = function unbind () {
	if ( !this.element.attributes.unbinding ) {
		var type = this.options && this.options.template && this.options.template.v;
		if ( type === 't0' || type === 't1' ) { this.element.intro = null; }
		if ( type === 't0' || type === 't2' ) { this.element.outro = null; }
	}
};

Transition.prototype.unregisterCompleteHandler = function unregisterCompleteHandler ( fn ) {
	removeFromArray( this.onComplete, fn );
};

var proto$5 = Transition.prototype;
proto$5.destroyed = proto$5.render = proto$5.unrender = proto$5.update = noop;

function nearestProp ( prop, ractive, rendering ) {
	var instance = ractive;
	while ( instance ) {
		if ( instance.hasOwnProperty( prop ) && ( rendering === undefined || rendering ? instance.rendering : instance.unrendering ) ) { return instance[ prop ]; }
		instance = instance.component && instance.component.ractive;
	}

	return ractive[ prop ];
}

var elementCache = {};

var ieBug;
var ieBlacklist;

try {
	createElement( 'table' ).innerHTML = 'foo';
} catch ( err ) {
	ieBug = true;

	ieBlacklist = {
		TABLE:  [ '<table class="x">', '</table>' ],
		THEAD:  [ '<table><thead class="x">', '</thead></table>' ],
		TBODY:  [ '<table><tbody class="x">', '</tbody></table>' ],
		TR:     [ '<table><tr class="x">', '</tr></table>' ],
		SELECT: [ '<select class="x">', '</select>' ]
	};
}

var insertHtml = function ( html$$1, node ) {
	var nodes = [];

	// render 0 and false
	if ( html$$1 == null || html$$1 === '' ) { return nodes; }

	var container;
	var wrapper;
	var selectedOption;

	if ( ieBug && ( wrapper = ieBlacklist[ node.tagName ] ) ) {
		container = element( 'DIV' );
		container.innerHTML = wrapper[0] + html$$1 + wrapper[1];
		container = container.querySelector( '.x' );

		if ( container.tagName === 'SELECT' ) {
			selectedOption = container.options[ container.selectedIndex ];
		}
	}

	else if ( node.namespaceURI === svg$1 ) {
		container = element( 'DIV' );
		container.innerHTML = '<svg class="x">' + html$$1 + '</svg>';
		container = container.querySelector( '.x' );
	}

	else if ( node.tagName === 'TEXTAREA' ) {
		container = createElement( 'div' );

		if ( typeof container.textContent !== 'undefined' ) {
			container.textContent = html$$1;
		} else {
			container.innerHTML = html$$1;
		}
	}

	else {
		container = element( node.tagName );
		container.innerHTML = html$$1;

		if ( container.tagName === 'SELECT' ) {
			selectedOption = container.options[ container.selectedIndex ];
		}
	}

	var child;
	while ( child = container.firstChild ) {
		nodes.push( child );
		container.removeChild( child );
	}

	// This is really annoying. Extracting <option> nodes from the
	// temporary container <select> causes the remaining ones to
	// become selected. So now we have to deselect them. IE8, you
	// amaze me. You really do
	// ...and now Chrome too
	var i;
	if ( node.tagName === 'SELECT' ) {
		i = nodes.length;
		while ( i-- ) {
			if ( nodes[i] !== selectedOption ) {
				nodes[i].selected = false;
			}
		}
	}

	return nodes;
};

function element ( tagName ) {
	return elementCache[ tagName ] || ( elementCache[ tagName ] = createElement( tagName ) );
}

var Triple = (function (Mustache$$1) {
	function Triple ( options ) {
		Mustache$$1.call( this, options );
	}

	if ( Mustache$$1 ) Triple.__proto__ = Mustache$$1;
	Triple.prototype = Object.create( Mustache$$1 && Mustache$$1.prototype );
	Triple.prototype.constructor = Triple;

	Triple.prototype.detach = function detach () {
		var docFrag = createDocumentFragment();
		if ( this.nodes ) { this.nodes.forEach( function (node) { return docFrag.appendChild( node ); } ); }
		return docFrag;
	};

	Triple.prototype.find = function find ( selector ) {
		var this$1 = this;

		var len = this.nodes.length;
		var i;

		for ( i = 0; i < len; i += 1 ) {
			var node = this$1.nodes[i];

			if ( node.nodeType !== 1 ) { continue; }

			if ( matches( node, selector ) ) { return node; }

			var queryResult = node.querySelector( selector );
			if ( queryResult ) { return queryResult; }
		}

		return null;
	};

	Triple.prototype.findAll = function findAll ( selector, options ) {
		var this$1 = this;

		var result = options.result;
		var len = this.nodes.length;
		var i;

		for ( i = 0; i < len; i += 1 ) {
			var node = this$1.nodes[i];

			if ( node.nodeType !== 1 ) { continue; }

			if ( matches( node, selector ) ) { result.push( node ); }

			var queryAllResult = node.querySelectorAll( selector );
			if ( queryAllResult ) {
				result.push.apply( result, queryAllResult );
			}
		}
	};

	Triple.prototype.findComponent = function findComponent () {
		return null;
	};

	Triple.prototype.firstNode = function firstNode () {
		return this.rendered && this.nodes[0];
	};

	Triple.prototype.render = function render ( target, occupants ) {
		var this$1 = this;

		var parentNode = this.parentFragment.findParentNode();

		if ( !this.nodes ) {
			var html = this.model ? this.model.get() : '';
			this.nodes = insertHtml( html, this.parentFragment.findParentNode(), target );
		}

		var nodes = this.nodes;
		var anchor = this.parentFragment.findNextNode( this );

		// progressive enhancement
		if ( occupants ) {
			var i = -1;
			var next;

			// start with the first node that should be rendered
			while ( occupants.length && ( next = this.nodes[ i + 1 ] ) ) {
				var n = (void 0);
				// look through the occupants until a matching node is found
				while ( n = occupants.shift() ) {
					var t = n.nodeType;

					if ( t === next.nodeType && ( ( t === 1 && n.outerHTML === next.outerHTML ) || ( ( t === 3 || t === 8 ) && n.nodeValue === next.nodeValue ) ) ) {
						this$1.nodes.splice( ++i, 1, n ); // replace the generated node with the existing one
						break;
					} else {
						target.removeChild( n ); // remove the non-matching existing node
					}
				}
			}

			if ( i >= 0 ) {
				// update the list of remaining nodes to attach, excluding any that were replaced by existing nodes
				nodes = this.nodes.slice( i );
			}

			// update the anchor to be the next occupant
			if ( occupants.length ) { anchor = occupants[0]; }
		}

		// attach any remainging nodes to the parent
		if ( nodes.length ) {
			var frag = createDocumentFragment();
			nodes.forEach( function (n) { return frag.appendChild( n ); } );

			if ( anchor ) {
				anchor.parentNode.insertBefore( frag, anchor );
			} else {
				parentNode.appendChild( frag );
			}
		}

		this.rendered = true;
	};

	Triple.prototype.toString = function toString () {
		var value = this.model && this.model.get();
		value = value != null ? '' + value : '';

		return inAttribute() ? decodeCharacterReferences( value ) : value;
	};

	Triple.prototype.unrender = function unrender () {
		if ( this.nodes ) { this.nodes.forEach( function (node) {
			// defer detachment until all relevant outros are done
			runloop.detachWhenReady( { node: node, detach: function detach() { detachNode( node ); } } );
		}); }
		this.rendered = false;
		this.nodes = null;
	};

	Triple.prototype.update = function update () {
		if ( this.rendered && this.dirty ) {
			this.dirty = false;

			this.unrender();
			this.render();
		} else {
			// make sure to reset the dirty flag even if not rendered
			this.dirty = false;
		}
	};

	return Triple;
}(Mustache));

// finds the component constructor in the registry or view hierarchy registries
function getComponentConstructor ( ractive, name ) {
	var instance = findInstance( 'components', ractive, name );
	var Component;

	if ( instance ) {
		Component = instance.components[ name ];

		// best test we have for not Ractive.extend
		if ( Component && !Component.Parent ) {
			// function option, execute and store for reset
			var fn = Component.bind( instance );
			fn.isOwner = instance.components.hasOwnProperty( name );
			Component = fn();

			if ( !Component ) {
				warnIfDebug( noRegistryFunctionReturn, name, 'component', 'component', { ractive: ractive });
				return;
			}

			if ( typeof Component === 'string' ) {
				// allow string lookup
				Component = getComponentConstructor( ractive, Component );
			}

			Component._fn = fn;
			instance.components[ name ] = Component;
		}
	}

	return Component;
}

//import Yielder from './Yielder';
var constructors = {};
constructors[ ALIAS ] = Alias;
constructors[ ANCHOR ] = Component;
constructors[ DOCTYPE ] = Doctype;
constructors[ INTERPOLATOR ] = Interpolator;
constructors[ PARTIAL ] = Partial;
constructors[ SECTION ] = Section;
constructors[ TRIPLE ] = Triple;
constructors[ YIELDER ] = Partial;

constructors[ ATTRIBUTE ] = Attribute;
constructors[ BINDING_FLAG ] = BindingFlag;
constructors[ DECORATOR ] = Decorator;
constructors[ EVENT ] = EventDirective;
constructors[ TRANSITION ] = Transition;

var specialElements = {
	doctype: Doctype,
	form: Form,
	input: Input,
	option: Option,
	select: Select,
	textarea: Textarea
};

function createItem ( options ) {
	if ( typeof options.template === 'string' ) {
		return new Text( options );
	}

	if ( options.template.t === ELEMENT ) {
		// could be component or element
		var ComponentConstructor = getComponentConstructor( options.parentFragment.ractive, options.template.e );
		if ( ComponentConstructor ) {
			return new Component( options, ComponentConstructor );
		}

		var tagName = options.template.e.toLowerCase();

		var ElementConstructor = specialElements[ tagName ] || Element;
		return new ElementConstructor( options );
	}

	var Item;

	// component mappings are a special case of attribute
	if ( options.template.t === ATTRIBUTE ) {
		var el = options.owner;
		if ( !el || ( el.type !== ANCHOR && el.type !== COMPONENT && el.type !== ELEMENT ) ) {
			el = findElement( options.parentFragment );
		}
		options.element = el;

		Item = el.type === COMPONENT || el.type === ANCHOR ? Mapping : Attribute;
	} else {
		Item = constructors[ options.template.t ];
	}

	if ( !Item ) { throw new Error( ("Unrecognised item type " + (options.template.t)) ); }

	return new Item( options );
}

// TODO all this code needs to die
function processItems ( items, values, guid, counter ) {
	if ( counter === void 0 ) counter = 0;

	return items.map( function (item) {
		if ( item.type === TEXT ) {
			return item.template;
		}

		if ( item.fragment ) {
			if ( item.fragment.iterations ) {
				return item.fragment.iterations.map( function (fragment) {
					return processItems( fragment.items, values, guid, counter );
				}).join( '' );
			} else {
				return processItems( item.fragment.items, values, guid, counter );
			}
		}

		var placeholderId = guid + "-" + (counter++);
		var model = item.model || item.newModel;

		values[ placeholderId ] = model ?
			model.wrapper ?
				model.wrapperValue :
				model.get() :
			undefined;

		return '${' + placeholderId + '}';
	}).join( '' );
}

function unrenderAndDestroy$1 ( item ) {
	item.unrender( true );
}

var Fragment = function Fragment ( options ) {
	this.owner = options.owner; // The item that owns this fragment - an element, section, partial, or attribute

	this.isRoot = !options.owner.parentFragment;
	this.parent = this.isRoot ? null : this.owner.parentFragment;
	this.ractive = options.ractive || ( this.isRoot ? options.owner : this.parent.ractive );

	this.componentParent = ( this.isRoot && this.ractive.component ) ? this.ractive.component.parentFragment : null;
	this.delegate = ( this.parent ? this.parent.delegate : ( this.componentParent && this.componentParent.delegate ) ) ||
		( this.owner.containerFragment && this.owner.containerFragment.delegate );

	this.context = null;
	this.rendered = false;

	// encapsulated styles should be inherited until they get applied by an element
	this.cssIds = 'cssIds' in options ? options.cssIds : ( this.parent ? this.parent.cssIds : null );

	this.dirty = false;
	this.dirtyValue = true; // used for attribute values

	this.template = options.template || [];
	this.createItems();
};

Fragment.prototype.bind = function bind$1 ( context ) {
	this.context = context;
	this.items.forEach( bind );
	this.bound = true;

	// in rare cases, a forced resolution (or similar) will cause the
	// fragment to be dirty before it's even finished binding. In those
	// cases we update immediately
	if ( this.dirty ) { this.update(); }

	return this;
};

Fragment.prototype.bubble = function bubble () {
	this.dirtyValue = true;

	if ( !this.dirty ) {
		this.dirty = true;

		if ( this.isRoot ) { // TODO encapsulate 'is component root, but not overall root' check?
			if ( this.ractive.component ) {
				this.ractive.component.bubble();
			} else if ( this.bound ) {
				runloop.addFragment( this );
			}
		} else {
			this.owner.bubble( this.index );
		}
	}
};

Fragment.prototype.createItems = function createItems () {
		var this$1 = this;

	// this is a hot code path
	var max = this.template.length;
	this.items = [];
	for ( var i = 0; i < max; i++ ) {
		this$1.items[i] = createItem({ parentFragment: this$1, template: this$1.template[i], index: i });
	}
};

Fragment.prototype.destroyed = function destroyed$1 () {
	this.items.forEach( destroyed );
};

Fragment.prototype.detach = function detach () {
	var docFrag = createDocumentFragment();
	var xs = this.items;
	var len = xs.length;
	for ( var i = 0; i < len; i++ ) {
		docFrag.appendChild( xs[i].detach() );
	}
	return docFrag;
};

Fragment.prototype.find = function find ( selector, options ) {
	return findMap( this.items, function (i) { return i.find( selector, options ); } );
};

Fragment.prototype.findAll = function findAll ( selector, options ) {
	if ( this.items ) {
		this.items.forEach( function (i) { return i.findAll && i.findAll( selector, options ); } );
	}
};

Fragment.prototype.findComponent = function findComponent ( name, options ) {
	return findMap( this.items, function (i) { return i.findComponent( name, options ); } );
};

Fragment.prototype.findAllComponents = function findAllComponents ( name, options ) {
	if ( this.items ) {
		this.items.forEach( function (i) { return i.findAllComponents && i.findAllComponents( name, options ); } );
	}
};

Fragment.prototype.findContext = function findContext () {
	var fragment = this;
	while ( fragment && !fragment.context ) { fragment = fragment.parent; }
	if ( !fragment ) { return this.ractive.viewmodel; }
	else { return fragment.context; }
};

Fragment.prototype.findNextNode = function findNextNode ( item ) {
		var this$1 = this;

	// search for the next node going forward
	if ( item ) {
		for ( var i = item.index + 1; i < this.items.length; i++ ) {
			if ( !this$1.items[ i ] ) { continue; }

			var node = this$1.items[ i ].firstNode( true );
			if ( node ) { return node; }
		}
	}

	// if this is the root fragment, and there are no more items,
	// it means we're at the end...
	if ( this.isRoot ) {
		if ( this.ractive.component ) {
			return this.ractive.component.parentFragment.findNextNode( this.ractive.component );
		}

		// TODO possible edge case with other content
		// appended to this.ractive.el?
		return null;
	}

	if ( this.parent ) { return this.owner.findNextNode( this ); } // the argument is in case the parent is a RepeatedFragment
};

Fragment.prototype.findParentNode = function findParentNode () {
	var fragment = this;

	do {
		if ( fragment.owner.type === ELEMENT ) {
			return fragment.owner.node;
		}

		if ( fragment.isRoot && !fragment.ractive.component ) { // TODO encapsulate check
			return fragment.ractive.el;
		}

		if ( fragment.owner.type === YIELDER ) {
			fragment = fragment.owner.containerFragment;
		} else {
			fragment = fragment.componentParent || fragment.parent; // TODO ugh
		}
	} while ( fragment );

	throw new Error( 'Could not find parent node' ); // TODO link to issue tracker
};

Fragment.prototype.findRepeatingFragment = function findRepeatingFragment () {
	var fragment = this;
	// TODO better check than fragment.parent.iterations
	while ( ( fragment.parent || fragment.componentParent ) && !fragment.isIteration ) {
		fragment = fragment.parent || fragment.componentParent;
	}

	return fragment;
};

Fragment.prototype.firstNode = function firstNode ( skipParent ) {
	var node = findMap( this.items, function (i) { return i.firstNode( true ); } );
	if ( node ) { return node; }
	if ( skipParent ) { return null; }

	return this.parent.findNextNode( this.owner );
};

Fragment.prototype.rebind = function rebind ( next ) {
	this.context = next;
};

Fragment.prototype.render = function render$$1 ( target, occupants ) {
	if ( this.rendered ) { throw new Error( 'Fragment is already rendered!' ); }
	this.rendered = true;

	var xs = this.items;
	var len = xs.length;
	for ( var i = 0; i < len; i++ ) {
		xs[i].render( target, occupants );
	}
};

Fragment.prototype.resetTemplate = function resetTemplate ( template ) {
	var wasBound = this.bound;
	var wasRendered = this.rendered;

	// TODO ensure transitions are disabled globally during reset

	if ( wasBound ) {
		if ( wasRendered ) { this.unrender( true ); }
		this.unbind();
	}

	this.template = template;
	this.createItems();

	if ( wasBound ) {
		this.bind( this.context );

		if ( wasRendered ) {
			var parentNode = this.findParentNode();
			var anchor = this.findNextNode();

			if ( anchor ) {
				var docFrag = createDocumentFragment();
				this.render( docFrag );
				parentNode.insertBefore( docFrag, anchor );
			} else {
				this.render( parentNode );
			}
		}
	}
};

Fragment.prototype.shuffled = function shuffled$1 () {
	this.items.forEach( shuffled );
};

Fragment.prototype.toString = function toString$1$$1 ( escape ) {
	return this.items.map( escape ? toEscapedString : toString$1 ).join( '' );
};

Fragment.prototype.unbind = function unbind$1 () {
	this.context = null;
	this.items.forEach( unbind );
	this.bound = false;

	return this;
};

Fragment.prototype.unrender = function unrender$1 ( shouldDestroy ) {
	this.items.forEach( shouldDestroy ? unrenderAndDestroy$1 : unrender );
	this.rendered = false;
};

Fragment.prototype.update = function update$1 () {
	if ( this.dirty ) {
		if ( !this.updating ) {
			this.dirty = false;
			this.updating = true;
			this.items.forEach( update );
			this.updating = false;
		} else if ( this.isRoot ) {
			runloop.addFragmentToRoot( this );
		}
	}
};

Fragment.prototype.valueOf = function valueOf () {
	if ( this.items.length === 1 ) {
		return this.items[0].valueOf();
	}

	if ( this.dirtyValue ) {
		var values = {};
		var source = processItems( this.items, values, this.ractive._guid );
		var parsed = parseJSON( source, values );

		this.value = parsed ?
			parsed.value :
			this.toString();

		this.dirtyValue = false;
	}

	return this.value;
};

Fragment.prototype.getContext = getContext;

function getChildQueue ( queue, ractive ) {
	return queue[ ractive._guid ] || ( queue[ ractive._guid ] = [] );
}

function fire ( hookQueue, ractive ) {
	var childQueue = getChildQueue( hookQueue.queue, ractive );

	hookQueue.hook.fire( ractive );

	// queue is "live" because components can end up being
	// added while hooks fire on parents that modify data values.
	while ( childQueue.length ) {
		fire( hookQueue, childQueue.shift() );
	}

	delete hookQueue.queue[ ractive._guid ];
}

var HookQueue = function HookQueue ( event ) {
	this.hook = new Hook( event );
	this.inProcess = {};
	this.queue = {};
};

HookQueue.prototype.begin = function begin ( ractive ) {
	this.inProcess[ ractive._guid ] = true;
};

HookQueue.prototype.end = function end ( ractive ) {
	var parent = ractive.parent;

	// If this is *isn't* a child of a component that's in process,
	// it should call methods or fire at this point
	if ( !parent || !this.inProcess[ parent._guid ] ) {
		fire( this, ractive );
	}
	// elsewise, handoff to parent to fire when ready
	else {
		getChildQueue( this.queue, parent ).push( ractive );
	}

	delete this.inProcess[ ractive._guid ];
};

var configHook = new Hook( 'config' );
var initHook = new HookQueue( 'init' );

function initialise ( ractive, userOptions, options ) {
	Object.keys( ractive.viewmodel.computations ).forEach( function (key) {
		var computation = ractive.viewmodel.computations[ key ];

		if ( ractive.viewmodel.value.hasOwnProperty( key ) ) {
			computation.set( ractive.viewmodel.value[ key ] );
		}
	});

	// set up event subscribers
	subscribe( ractive, userOptions, 'on' );

	// init config from Parent and options
	config.init( ractive.constructor, ractive, userOptions );

	configHook.fire( ractive );

	// general config done, set up observers
	subscribe( ractive, userOptions, 'observe' );

	initHook.begin( ractive );

	var fragment = ractive.fragment = createFragment( ractive, options );
	if ( fragment ) { fragment.bind( ractive.viewmodel ); }

	initHook.end( ractive );

	if ( fragment ) {
		// render automatically ( if `el` is specified )
		var el = getElement( ractive.el || ractive.target );
		if ( el ) {
			var promise = ractive.render( el, ractive.append );

			if ( Ractive.DEBUG_PROMISES ) {
				promise.catch( function (err) {
					warnOnceIfDebug( 'Promise debugging is enabled, to help solve errors that happen asynchronously. Some browsers will log unhandled promise rejections, in which case you can safely disable promise debugging:\n  Ractive.DEBUG_PROMISES = false;' );
					warnIfDebug( 'An error happened during rendering', { ractive: ractive });
					logIfDebug( err );

					throw err;
				});
			}
		}
	}
}

function createFragment ( ractive, options ) {
	if ( options === void 0 ) options = {};

	if ( ractive.template ) {
		var cssIds;

		if ( options.cssIds || ractive.cssId ) {
			cssIds = options.cssIds ? options.cssIds.slice() : [];

			if ( ractive.cssId ) {
				cssIds.push( ractive.cssId );
			}
		}

		return new Fragment({
			owner: ractive,
			template: ractive.template,
			cssIds: cssIds
		});
	}
}

function subscribe ( instance, options, type ) {
	var subs = ( instance.constructor[ ("_" + type) ] || [] ).concat( toPairs( options[ type ] || [] ) );
	var single = type === 'on' ? 'once' : (type + "Once");

	subs.forEach( function (ref) {
		var target = ref[0];
		var config$$1 = ref[1];

		if ( typeof config$$1 === 'function' ) {
			instance[type]( target, config$$1 );
		} else if ( typeof config$$1 === 'object' && typeof config$$1.handler === 'function' ) {
			instance[ config$$1.once ? single : type ]( target, config$$1.handler, config$$1 );
		}
	});
}

var renderHook = new Hook( 'render' );
var completeHook = new Hook( 'complete' );

function render$1 ( ractive, target, anchor, occupants ) {
	// set a flag to let any transitions know that this instance is currently rendering
	ractive.rendering = true;

	var promise = runloop.start( ractive, true );
	runloop.scheduleTask( function () { return renderHook.fire( ractive ); }, true );

	if ( ractive.fragment.rendered ) {
		throw new Error( 'You cannot call ractive.render() on an already rendered instance! Call ractive.unrender() first' );
	}

	if ( ractive.destroyed ) {
		ractive.destroyed = false;
		ractive.fragment = createFragment( ractive ).bind( ractive.viewmodel );
	}

	anchor = getElement( anchor ) || ractive.anchor;

	ractive.el = ractive.target = target;
	ractive.anchor = anchor;

	// ensure encapsulated CSS is up-to-date
	if ( ractive.cssId ) { applyCSS(); }

	if ( target ) {
		( target.__ractive_instances__ || ( target.__ractive_instances__ = [] ) ).push( ractive );

		if ( anchor ) {
			var docFrag = doc.createDocumentFragment();
			ractive.fragment.render( docFrag );
			target.insertBefore( docFrag, anchor );
		} else {
			ractive.fragment.render( target, occupants );
		}
	}

	runloop.end();
	ractive.rendering = false;

	return promise.then( function () {
		if (ractive.torndown) { return; }

		completeHook.fire( ractive );
	});
}

function Ractive$render ( target, anchor ) {
	if ( this.torndown ) {
		warnIfDebug( 'ractive.render() was called on a Ractive instance that was already torn down' );
		return Promise.resolve();
	}

	target = getElement( target ) || this.el;

	if ( !this.append && target ) {
		// Teardown any existing instances *before* trying to set up the new one -
		// avoids certain weird bugs
		var others = target.__ractive_instances__;
		if ( others ) { others.forEach( teardown ); }

		// make sure we are the only occupants
		if ( !this.enhance ) {
			target.innerHTML = ''; // TODO is this quicker than removeChild? Initial research inconclusive
		}
	}

	var occupants = this.enhance ? toArray( target.childNodes ) : null;
	var promise = render$1( this, target, anchor, occupants );

	if ( occupants ) {
		while ( occupants.length ) { target.removeChild( occupants.pop() ); }
	}

	return promise;
}

var shouldRerender = [ 'template', 'partials', 'components', 'decorators', 'events' ];

var completeHook$1 = new Hook( 'complete' );
var resetHook = new Hook( 'reset' );
var renderHook$1 = new Hook( 'render' );
var unrenderHook = new Hook( 'unrender' );

function Ractive$reset ( data ) {
	data = data || {};

	if ( typeof data !== 'object' ) {
		throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
	}

	// TEMP need to tidy this up
	data = dataConfigurator.init( this.constructor, this, { data: data });

	var promise = runloop.start( this, true );

	// If the root object is wrapped, try and use the wrapper's reset value
	var wrapper = this.viewmodel.wrapper;
	if ( wrapper && wrapper.reset ) {
		if ( wrapper.reset( data ) === false ) {
			// reset was rejected, we need to replace the object
			this.viewmodel.set( data );
		}
	} else {
		this.viewmodel.set( data );
	}

	// reset config items and track if need to rerender
	var changes = config.reset( this );
	var rerender;

	var i = changes.length;
	while ( i-- ) {
		if ( shouldRerender.indexOf( changes[i] ) > -1 ) {
			rerender = true;
			break;
		}
	}

	if ( rerender ) {
		unrenderHook.fire( this );
		this.fragment.resetTemplate( this.template );
		renderHook$1.fire( this );
		completeHook$1.fire( this );
	}

	runloop.end();

	resetHook.fire( this, data );

	return promise;
}

function collect( source, name, attr, dest ) {
	source.forEach( function (item) {
		// queue to rerender if the item is a partial and the current name matches
		if ( item.type === PARTIAL && ( item.refName ===  name || item.name === name ) ) {
			item.inAttribute = attr;
			dest.push( item );
			return; // go no further
		}

		// if it has a fragment, process its items
		if ( item.fragment ) {
			collect( item.fragment.iterations || item.fragment.items, name, attr, dest );
		}

		// or if it is itself a fragment, process its items
		else if ( Array.isArray( item.items ) ) {
			collect( item.items, name, attr, dest );
		}

		// or if it is a component, step in and process its items
		else if ( item.type === COMPONENT && item.instance ) {
			// ...unless the partial is shadowed
			if ( item.instance.partials[ name ] ) { return; }
			collect( item.instance.fragment.items, name, attr, dest );
		}

		// if the item is an element, process its attributes too
		if ( item.type === ELEMENT ) {
			if ( Array.isArray( item.attributes ) ) {
				collect( item.attributes, name, true, dest );
			}
		}
	});
}

function forceResetTemplate ( partial ) {
	partial.forceResetTemplate();
}

var resetPartial = function ( name, partial ) {
	var collection = [];
	collect( this.fragment.items, name, false, collection );

	var promise = runloop.start( this, true );

	this.partials[ name ] = partial;
	collection.forEach( forceResetTemplate );

	runloop.end();

	return promise;
};

// TODO should resetTemplate be asynchronous? i.e. should it be a case
// of outro, update template, intro? I reckon probably not, since that
// could be achieved with unrender-resetTemplate-render. Also, it should
// conceptually be similar to resetPartial, which couldn't be async

function Ractive$resetTemplate ( template ) {
	templateConfigurator.init( null, this, { template: template });

	var transitionsEnabled = this.transitionsEnabled;
	this.transitionsEnabled = false;

	// Is this is a component, we need to set the `shouldDestroy`
	// flag, otherwise it will assume by default that a parent node
	// will be detached, and therefore it doesn't need to bother
	// detaching its own nodes
	var component = this.component;
	if ( component ) { component.shouldDestroy = true; }
	this.unrender();
	if ( component ) { component.shouldDestroy = false; }

	var promise = runloop.start();

	// remove existing fragment and create new one
	this.fragment.unbind().unrender( true );

	this.fragment = new Fragment({
		template: this.template,
		root: this,
		owner: this
	});

	var docFrag = createDocumentFragment();
	this.fragment.bind( this.viewmodel ).render( docFrag );

	// if this is a component, its el may not be valid, so find a
	// target based on the component container
	if ( component && !component.external ) {
		this.fragment.findParentNode().insertBefore( docFrag, component.findNextNode() );
	} else {
		this.el.insertBefore( docFrag, this.anchor );
	}

	runloop.end();

	this.transitionsEnabled = transitionsEnabled;

	return promise;
}

var reverse = makeArrayMethod( 'reverse' ).path;

function Ractive$set ( keypath, value, options ) {
	var ractive = this;

	var opts = typeof keypath === 'object' ? value : options;

	return set( ractive, build( ractive, keypath, value, opts && opts.isolated ), opts );
}

var shift = makeArrayMethod( 'shift' ).path;

var sort = makeArrayMethod( 'sort' ).path;

var splice = makeArrayMethod( 'splice' ).path;

function Ractive$subtract ( keypath, d, options ) {
	var num = typeof d === 'number' ? -d : -1;
	var opts = typeof d === 'object' ? d : options;
	return add( this, keypath, num, opts );
}

function Ractive$toggle ( keypath, options ) {
	if ( typeof keypath !== 'string' ) {
		throw new TypeError( badArguments );
	}

	return set( this, gather( this, keypath, null, options && options.isolated ).map( function (m) { return [ m, !m.get() ]; } ), options );
}

function Ractive$toCSS() {
	var cssIds = [ this.cssId ].concat( this.findAllComponents().map( function (c) { return c.cssId; } ) );
	var uniqueCssIds = Object.keys(cssIds.reduce( function ( ids, id ) { return (ids[id] = true, ids); }, {}));
	return getCSS( uniqueCssIds );
}

function Ractive$toHTML () {
	return this.fragment.toString( true );
}

function toText () {
	return this.fragment.toString( false );
}

function Ractive$transition ( name, node, params ) {

	if ( node instanceof HTMLElement ) {
		// good to go
	}
	else if ( isObject( node ) ) {
		// omitted, use event node
		params = node;
	}

	// if we allow query selector, then it won't work
	// simple params like "fast"

	// else if ( typeof node === 'string' ) {
	// 	// query selector
	// 	node = this.find( node )
	// }

	node = node || this.event.node;

	if ( !node || !node._ractive ) {
		fatal( ("No node was supplied for transition " + name) );
	}

	params = params || {};
	var owner = node._ractive.proxy;
	var transition = new Transition({ owner: owner, parentFragment: owner.parentFragment, name: name, params: params });
	transition.bind();

	var promise = runloop.start( this, true );
	runloop.registerTransition( transition );
	runloop.end();

	promise.then( function () { return transition.unbind(); } );
	return promise;
}

function unlink( here ) {
	var promise = runloop.start();
	this.viewmodel.joinAll( splitKeypath( here ), { lastLink: false } ).unlink();
	runloop.end();
	return promise;
}

var unrenderHook$1 = new Hook( 'unrender' );

function Ractive$unrender () {
	if ( !this.fragment.rendered ) {
		warnIfDebug( 'ractive.unrender() was called on a Ractive instance that was not rendered' );
		return Promise.resolve();
	}

	this.unrendering = true;
	var promise = runloop.start( this, true );

	// If this is a component, and the component isn't marked for destruction,
	// don't detach nodes from the DOM unnecessarily
	var shouldDestroy = !this.component || ( this.component.anchor || {} ).shouldDestroy || this.component.shouldDestroy || this.shouldDestroy;
	this.fragment.unrender( shouldDestroy );
	if ( shouldDestroy ) { this.destroyed = true; }

	removeFromArray( this.el.__ractive_instances__, this );

	unrenderHook$1.fire( this );

	runloop.end();
	this.unrendering = false;

	return promise;
}

var unshift = makeArrayMethod( 'unshift' ).path;

function Ractive$updateModel ( keypath, cascade ) {
	var promise = runloop.start( this, true );

	if ( !keypath ) {
		this.viewmodel.updateFromBindings( true );
	} else {
		this.viewmodel.joinAll( splitKeypath( keypath ) ).updateFromBindings( cascade !== false );
	}

	runloop.end();

	return promise;
}

var proto = {
	add: Ractive$add,
	animate: Ractive$animate,
	attachChild: attachChild,
	detach: Ractive$detach,
	detachChild: detachChild,
	find: Ractive$find,
	findAll: Ractive$findAll,
	findAllComponents: Ractive$findAllComponents,
	findComponent: Ractive$findComponent,
	findContainer: Ractive$findContainer,
	findParent: Ractive$findParent,
	fire: Ractive$fire,
	get: Ractive$get,
	getContext: getContext$1,
	getNodeInfo: getNodeInfo$$1,
	insert: Ractive$insert,
	link: link,
	observe: observe,
	observeOnce: observeOnce,
	off: Ractive$off,
	on: Ractive$on,
	once: Ractive$once,
	pop: pop,
	push: push,
	readLink: readLink,
	render: Ractive$render,
	reset: Ractive$reset,
	resetPartial: resetPartial,
	resetTemplate: Ractive$resetTemplate,
	reverse: reverse,
	set: Ractive$set,
	shift: shift,
	sort: sort,
	splice: splice,
	subtract: Ractive$subtract,
	teardown: Ractive$teardown,
	toggle: Ractive$toggle,
	toCSS: Ractive$toCSS,
	toCss: Ractive$toCSS,
	toHTML: Ractive$toHTML,
	toHtml: Ractive$toHTML,
	toText: toText,
	transition: Ractive$transition,
	unlink: unlink,
	unrender: Ractive$unrender,
	unshift: unshift,
	update: Ractive$update,
	updateModel: Ractive$updateModel
};

Object.defineProperty( proto, 'target', {
	get: function get() { return this.el; }
});

function isInstance ( object ) {
	return object && object instanceof this;
}

var callsSuper = /super\s*\(|\.call\s*\(\s*this/;

function extend () {
	var options = [], len = arguments.length;
	while ( len-- ) options[ len ] = arguments[ len ];

	if( !options.length ) {
		return extendOne( this );
	} else {
		return options.reduce( extendOne, this );
	}
}

function extendWith ( Class, options ) {
	if ( options === void 0 ) options = {};

	return extendOne( this, options, Class );
}

function extendOne ( Parent, options, Target ) {
	if ( options === void 0 ) options = {};

	var proto;
	var Child = typeof Target === 'function' && Target;

	if ( options.prototype instanceof Ractive ) {
		throw new Error( "Ractive no longer supports multiple inheritance." );
	}

	if ( Child ) {
		if ( !( Child.prototype instanceof Parent ) ) {
			throw new Error( "Only classes that inherit the appropriate prototype may be used with extend" );
		}
		if ( !callsSuper.test( Child.toString() ) ) {
			throw new Error( "Only classes that call super in their constructor may be used with extend" );
		}

		proto = Child.prototype;
	} else {
		Child = function ( options ) {
			if ( !( this instanceof Child ) ) { return new Child( options ); }

			construct( this, options || {} );
			initialise( this, options || {}, {} );
		};

		proto = Object.create( Parent.prototype );
		proto.constructor = Child;

		Child.prototype = proto;
	}

	// Static properties
	Object.defineProperties( Child, {
		// alias prototype as defaults
		defaults: { value: proto },

		// extendable
		extend: { value: extend, writable: true, configurable: true },
		extendClass: { value: extendWith, writable: true, configurable: true },

		Parent: { value: Parent },
		Ractive: { value: Ractive },

		isInstance: { value: isInstance }
	});

	// extend configuration
	config.extend( Parent, proto, options );

	// store event and observer registries on the constructor when extending
	Child._on = ( Parent._on || [] ).concat( toPairs( options.on ) );
	Child._observe = ( Parent._observe || [] ).concat( toPairs( options.observe ) );

	// attribute defs are not inherited, but they need to be stored
	if ( options.attributes ) {
		var attrs;

		// allow an array of optional props or an object with arrays for optional and required props
		if ( Array.isArray( options.attributes ) ) {
			attrs = { optional: options.attributes, required: [] };
		} else {
			attrs = options.attributes;
		}

		// make sure the requisite keys actually store arrays
		if ( !Array.isArray( attrs.required ) ) { attrs.required = []; }
		if ( !Array.isArray( attrs.optional ) ) { attrs.optional = []; }

		Child.attributes = attrs;
	}

	dataConfigurator.extend( Parent, proto, options );

	if ( options.computed ) {
		proto.computed = Object.assign( Object.create( Parent.prototype.computed ), options.computed );
	}

	return Child;
}

function joinKeys () {
	var keys = [], len = arguments.length;
	while ( len-- ) keys[ len ] = arguments[ len ];

	return keys.map( escapeKey ).join( '.' );
}

function splitKeypath$1 ( keypath ) {
	return splitKeypath( keypath ).map( unescapeKey );
}

function findPlugin(name, type, instance) {
	return findInViewHierarchy(type, instance, name);
}

function Ractive ( options ) {
	if ( !( this instanceof Ractive ) ) { return new Ractive( options ); }

	construct( this, options || {} );
	initialise( this, options || {}, {} );
}

// check to see if we're being asked to force Ractive as a global for some weird environments
if ( win && !win.Ractive ) {
	var opts = '';
	var script = document.currentScript || document.querySelector( 'script[data-ractive-options]' );

	if ( script ) { opts = script.getAttribute( 'data-ractive-options' ) || ''; }

	if ( ~opts.indexOf( 'ForceGlobal' ) ) { win.Ractive = Ractive; }
}

Object.assign( Ractive.prototype, proto, defaults );
Ractive.prototype.constructor = Ractive;

// alias prototype as `defaults`
Ractive.defaults = Ractive.prototype;

// share defaults with the parser
shared.defaults = Ractive.defaults;
shared.Ractive = Ractive;

// static properties
Object.defineProperties( Ractive, {

	// debug flag
	DEBUG:            { writable: true, value: true },
	DEBUG_PROMISES:   { writable: true, value: true },

	// static methods:
	extend:           { value: extend },
	extendWith:       { value: extendWith },
	escapeKey:        { value: escapeKey },
	getContext:       { value: getContext$2 },
	getNodeInfo:      { value: getNodeInfo$1 },
	isInstance:       { value: isInstance },
	joinKeys:         { value: joinKeys },
	parse:            { value: parse },
	splitKeypath:     { value: splitKeypath$1 },
	unescapeKey:      { value: unescapeKey },
	getCSS:           { value: getCSS },
	normaliseKeypath: { value: normalise },
	findPlugin:       { value: findPlugin },
	evalObjectString: { value: parseJSON },

	// support
	enhance:          { writable: true, value: false },
	svg:              { value: svg },

	// version
	VERSION:          { value: '0.9.3' },

	// plugins
	adaptors:         { writable: true, value: {} },
	components:       { writable: true, value: {} },
	decorators:       { writable: true, value: {} },
	easing:           { writable: true, value: easing },
	events:           { writable: true, value: {} },
	interpolators:    { writable: true, value: interpolators },
	partials:         { writable: true, value: {} },
	transitions:      { writable: true, value: {} },

	// for getting the source Ractive lib from a constructor
	Ractive:          { value: Ractive }
});

return Ractive;

})));


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],118:[function(require,module,exports){
// A library of seedable RNGs implemented in Javascript.
//
// Usage:
//
// var seedrandom = require('seedrandom');
// var random = seedrandom(1); // or any seed.
// var x = random();       // 0 <= x < 1.  Every bit is random.
// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
// Period: ~2^116
// Reported to pass all BigCrush tests.
var alea = require('./lib/alea');

// xor128, a pure xor-shift generator by George Marsaglia.
// Period: 2^128-1.
// Reported to fail: MatrixRank and LinearComp.
var xor128 = require('./lib/xor128');

// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
// Period: 2^192-2^32
// Reported to fail: CollisionOver, SimpPoker, and LinearComp.
var xorwow = require('./lib/xorwow');

// xorshift7, by François Panneton and Pierre L'ecuyer, takes
// a different approach: it adds robustness by allowing more shifts
// than Marsaglia's original three.  It is a 7-shift generator
// with 256 bits, that passes BigCrush with no systmatic failures.
// Period 2^256-1.
// No systematic BigCrush failures reported.
var xorshift7 = require('./lib/xorshift7');

// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
// very long period that also adds a Weyl generator. It also passes
// BigCrush with no systematic failures.  Its long period may
// be useful if you have many generators and need to avoid
// collisions.
// Period: 2^4128-2^32.
// No systematic BigCrush failures reported.
var xor4096 = require('./lib/xor4096');

// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
// number generator derived from ChaCha, a modern stream cipher.
// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
// Period: ~2^127
// No systematic BigCrush failures reported.
var tychei = require('./lib/tychei');

// The original ARC4-based prng included in this library.
// Period: ~2^1600
var sr = require('./seedrandom');

sr.alea = alea;
sr.xor128 = xor128;
sr.xorwow = xorwow;
sr.xorshift7 = xorshift7;
sr.xor4096 = xor4096;
sr.tychei = tychei;

module.exports = sr;

},{"./lib/alea":119,"./lib/tychei":120,"./lib/xor128":121,"./lib/xor4096":122,"./lib/xorshift7":123,"./lib/xorwow":124,"./seedrandom":125}],119:[function(require,module,exports){
// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -

// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.



(function(global, module, define) {

function Alea(seed) {
  var me = this, mash = Mash();

  me.next = function() {
    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
    me.s0 = me.s1;
    me.s1 = me.s2;
    return me.s2 = t - (me.c = t | 0);
  };

  // Apply the seeding algorithm from Baagoe.
  me.c = 1;
  me.s0 = mash(' ');
  me.s1 = mash(' ');
  me.s2 = mash(' ');
  me.s0 -= mash(seed);
  if (me.s0 < 0) { me.s0 += 1; }
  me.s1 -= mash(seed);
  if (me.s1 < 0) { me.s1 += 1; }
  me.s2 -= mash(seed);
  if (me.s2 < 0) { me.s2 += 1; }
  mash = null;
}

function copy(f, t) {
  t.c = f.c;
  t.s0 = f.s0;
  t.s1 = f.s1;
  t.s2 = f.s2;
  return t;
}

function impl(seed, opts) {
  var xg = new Alea(seed),
      state = opts && opts.state,
      prng = xg.next;
  prng.int32 = function() { return (xg.next() * 0x100000000) | 0; }
  prng.double = function() {
    return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
  };
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

function Mash() {
  var n = 0xefc8249d;

  var mash = function(data) {
    data = data.toString();
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}


if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.alea = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],120:[function(require,module,exports){
// A Javascript implementaion of the "Tyche-i" prng algorithm by
// Samuel Neves and Filipe Araujo.
// See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var b = me.b, c = me.c, d = me.d, a = me.a;
    b = (b << 25) ^ (b >>> 7) ^ c;
    c = (c - d) | 0;
    d = (d << 24) ^ (d >>> 8) ^ a;
    a = (a - b) | 0;
    me.b = b = (b << 20) ^ (b >>> 12) ^ c;
    me.c = c = (c - d) | 0;
    me.d = (d << 16) ^ (c >>> 16) ^ a;
    return me.a = (a - b) | 0;
  };

  /* The following is non-inverted tyche, which has better internal
   * bit diffusion, but which is about 25% slower than tyche-i in JS.
  me.next = function() {
    var a = me.a, b = me.b, c = me.c, d = me.d;
    a = (me.a + me.b | 0) >>> 0;
    d = me.d ^ a; d = d << 16 ^ d >>> 16;
    c = me.c + d | 0;
    b = me.b ^ c; b = b << 12 ^ d >>> 20;
    me.a = a = a + b | 0;
    d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
    me.c = c = c + d | 0;
    b = b ^ c;
    return me.b = (b << 7 ^ b >>> 25);
  }
  */

  me.a = 0;
  me.b = 0;
  me.c = 2654435769 | 0;
  me.d = 1367130551;

  if (seed === Math.floor(seed)) {
    // Integer seed.
    me.a = (seed / 0x100000000) | 0;
    me.b = seed | 0;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 20; k++) {
    me.b ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.a = f.a;
  t.b = f.b;
  t.c = f.c;
  t.d = f.d;
  return t;
};

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.tychei = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],121:[function(require,module,exports){
// A Javascript implementaion of the "xor128" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;

  // Set up generator function.
  me.next = function() {
    var t = me.x ^ (me.x << 11);
    me.x = me.y;
    me.y = me.z;
    me.z = me.w;
    return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
  };

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor128 = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],122:[function(require,module,exports){
// A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
//
// This fast non-cryptographic random number generator is designed for
// use in Monte-Carlo algorithms. It combines a long-period xorshift
// generator with a Weyl generator, and it passes all common batteries
// of stasticial tests for randomness while consuming only a few nanoseconds
// for each prng generated.  For background on the generator, see Brent's
// paper: "Some long-period random number generators using shifts and xors."
// http://arxiv.org/pdf/1004.3115v1.pdf
//
// Usage:
//
// var xor4096 = require('xor4096');
// random = xor4096(1);                        // Seed with int32 or string.
// assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
// assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
//
// For nonzero numeric keys, this impelementation provides a sequence
// identical to that by Brent's xorgens 3 implementaion in C.  This
// implementation also provides for initalizing the generator with
// string seeds, or for saving and restoring the state of the generator.
//
// On Chrome, this prng benchmarks about 2.1 times slower than
// Javascript's built-in Math.random().

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    var w = me.w,
        X = me.X, i = me.i, t, v;
    // Update Weyl generator.
    me.w = w = (w + 0x61c88647) | 0;
    // Update xor generator.
    v = X[(i + 34) & 127];
    t = X[i = ((i + 1) & 127)];
    v ^= v << 13;
    t ^= t << 17;
    v ^= v >>> 15;
    t ^= t >>> 12;
    // Update Xor generator array state.
    v = X[i] = v ^ t;
    me.i = i;
    // Result is the combination.
    return (v + (w ^ (w >>> 16))) | 0;
  };

  function init(me, seed) {
    var t, v, i, j, w, X = [], limit = 128;
    if (seed === (seed | 0)) {
      // Numeric seeds initialize v, which is used to generates X.
      v = seed;
      seed = null;
    } else {
      // String seeds are mixed into v and X one character at a time.
      seed = seed + '\0';
      v = 0;
      limit = Math.max(limit, seed.length);
    }
    // Initialize circular array and weyl value.
    for (i = 0, j = -32; j < limit; ++j) {
      // Put the unicode characters into the array, and shuffle them.
      if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
      // After 32 shuffles, take v as the starting w value.
      if (j === 0) w = v;
      v ^= v << 10;
      v ^= v >>> 15;
      v ^= v << 4;
      v ^= v >>> 13;
      if (j >= 0) {
        w = (w + 0x61c88647) | 0;     // Weyl.
        t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
        i = (0 == t) ? i + 1 : 0;     // Count zeroes.
      }
    }
    // We have detected all zeroes; make the key nonzero.
    if (i >= 128) {
      X[(seed && seed.length || 0) & 127] = -1;
    }
    // Run the generator 512 times to further mix the state before using it.
    // Factoring this as a function slows the main generator, so it is just
    // unrolled here.  The weyl generator is not advanced while warming up.
    i = 127;
    for (j = 4 * 128; j > 0; --j) {
      v = X[(i + 34) & 127];
      t = X[i = ((i + 1) & 127)];
      v ^= v << 13;
      t ^= t << 17;
      v ^= v >>> 15;
      t ^= t >>> 12;
      X[i] = v ^ t;
    }
    // Storing state as object members is faster than using closure variables.
    me.w = w;
    me.X = X;
    me.i = i;
  }

  init(me, seed);
}

function copy(f, t) {
  t.i = f.i;
  t.w = f.w;
  t.X = f.X.slice();
  return t;
};

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.X) copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor4096 = impl;
}

})(
  this,                                     // window object or global
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);

},{}],123:[function(require,module,exports){
// A Javascript implementaion of the "xorshift7" algorithm by
// François Panneton and Pierre L'ecuyer:
// "On the Xorgshift Random Number Generators"
// http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    // Update xor generator.
    var X = me.x, i = me.i, t, v, w;
    t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
    t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
    t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
    t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
    t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
    X[i] = v;
    me.i = (i + 1) & 7;
    return v;
  };

  function init(me, seed) {
    var j, w, X = [];

    if (seed === (seed | 0)) {
      // Seed state array using a 32-bit integer.
      w = X[0] = seed;
    } else {
      // Seed state using a string.
      seed = '' + seed;
      for (j = 0; j < seed.length; ++j) {
        X[j & 7] = (X[j & 7] << 15) ^
            (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
      }
    }
    // Enforce an array length of 8, not all zeroes.
    while (X.length < 8) X.push(0);
    for (j = 0; j < 8 && X[j] === 0; ++j);
    if (j == 8) w = X[7] = -1; else w = X[j];

    me.x = X;
    me.i = 0;

    // Discard an initial 256 values.
    for (j = 256; j > 0; --j) {
      me.next();
    }
  }

  init(me, seed);
}

function copy(f, t) {
  t.x = f.x.slice();
  t.i = f.i;
  return t;
}

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.x) copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorshift7 = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);


},{}],124:[function(require,module,exports){
// A Javascript implementaion of the "xorwow" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var t = (me.x ^ (me.x >>> 2));
    me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
    return (me.d = (me.d + 362437 | 0)) +
       (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
  };

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;
  me.v = 0;

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    if (k == strseed.length) {
      me.d = me.x << 10 ^ me.x >>> 4;
    }
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  t.v = f.v;
  t.d = f.d;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorwow = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],125:[function(require,module,exports){
/*
Copyright 2014 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function (pool, math) {
//
// The following constants are related to IEEE 754 limits.
//
var global = this,
    width = 256,        // each RC4 output is 0 <= x < 256
    chunks = 6,         // at least six RC4 outputs for each double
    digits = 52,        // there are 52 significant digits in a double
    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
    startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,
    nodecrypto;         // node.js crypto module, initialized at the bottom.

//
// seedrandom()
// This is the seedrandom function described above.
//
function seedrandom(seed, options, callback) {
  var key = [];
  options = (options == true) ? { entropy: true } : (options || {});

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    options.entropy ? [seed, tostring(pool)] :
    (seed == null) ? autoseed() : seed, 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.
  var prng = function() {
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  prng.int32 = function() { return arc4.g(4) | 0; }
  prng.quick = function() { return arc4.g(4) / 0x100000000; }
  prng.double = prng;

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Calling convention: what to return as a function of prng, seed, is_math.
  return (options.pass || callback ||
      function(prng, seed, is_math_call, state) {
        if (state) {
          // Load the arc4 state from the given state if it has an S array.
          if (state.S) { copy(state, arc4); }
          // Only provide the .state method if requested via options.state.
          prng.state = function() { return copy(arc4, {}); }
        }

        // If called as a method of Math (Math.seedrandom()), mutate
        // Math.random because that is how seedrandom.js has worked since v1.0.
        if (is_math_call) { math[rngname] = prng; return seed; }

        // Otherwise, it is a newer calling convention, so return the
        // prng directly.
        else return prng;
      })(
  prng,
  shortseed,
  'global' in options ? options.global : (this == math),
  options.state);
}
math['seed' + rngname] = seedrandom;

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability, the function call below automatically
    // discards an initial batch of values.  This is called RC4-drop[256].
    // See http://google.com/search?q=rsa+fluhrer+response&btnI
  })(width);
}

//
// copy()
// Copies internal state of ARC4 to or from a plain object.
//
function copy(f, t) {
  t.i = f.i;
  t.j = f.j;
  t.S = f.S.slice();
  return t;
};

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj), prop;
  if (depth && typ == 'object') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto and Node crypto
// module if available.
//
function autoseed() {
  try {
    var out;
    if (nodecrypto && (out = nodecrypto.randomBytes)) {
      // The use of 'out' to remember randomBytes makes tight minified code.
      out = out(width);
    } else {
      out = new Uint8Array(width);
      (global.crypto || global.msCrypto).getRandomValues(out);
    }
    return tostring(out);
  } catch (e) {
    var browser = global.navigator,
        plugins = browser && browser.plugins;
    return [+new Date, global, plugins, global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to interfere with deterministic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

//
// Nodejs and AMD support: export the implementation as a module using
// either convention.
//
if ((typeof module) == 'object' && module.exports) {
  module.exports = seedrandom;
  // When in node.js, try using crypto package for autoseeding.
  try {
    nodecrypto = require('crypto');
  } catch (ex) {}
} else if ((typeof define) == 'function' && define.amd) {
  define(function() { return seedrandom; });
}

// End anonymous scope, and pass initial values.
})(
  [],     // pool: entropy pool starts empty
  Math    // math: package containing random, pow, and seedrandom
);

},{"crypto":1}],126:[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require('./source-map/source-map-generator').SourceMapGenerator;
exports.SourceMapConsumer = require('./source-map/source-map-consumer').SourceMapConsumer;
exports.SourceNode = require('./source-map/source-node').SourceNode;

},{"./source-map/source-map-consumer":133,"./source-map/source-map-generator":134,"./source-map/source-node":135}],127:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * A data structure which is a combination of an array and a set. Adding a new
   * member is O(1), testing for membership is O(1), and finding the index of an
   * element is O(1). Removing elements from the set is not supported. Only
   * strings are supported for membership.
   */
  function ArraySet() {
    this._array = [];
    this._set = {};
  }

  /**
   * Static method for creating ArraySet instances from an existing array.
   */
  ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
    var set = new ArraySet();
    for (var i = 0, len = aArray.length; i < len; i++) {
      set.add(aArray[i], aAllowDuplicates);
    }
    return set;
  };

  /**
   * Return how many unique items are in this ArraySet. If duplicates have been
   * added, than those do not count towards the size.
   *
   * @returns Number
   */
  ArraySet.prototype.size = function ArraySet_size() {
    return Object.getOwnPropertyNames(this._set).length;
  };

  /**
   * Add the given string to this set.
   *
   * @param String aStr
   */
  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
    var isDuplicate = this.has(aStr);
    var idx = this._array.length;
    if (!isDuplicate || aAllowDuplicates) {
      this._array.push(aStr);
    }
    if (!isDuplicate) {
      this._set[util.toSetString(aStr)] = idx;
    }
  };

  /**
   * Is the given string a member of this set?
   *
   * @param String aStr
   */
  ArraySet.prototype.has = function ArraySet_has(aStr) {
    return Object.prototype.hasOwnProperty.call(this._set,
                                                util.toSetString(aStr));
  };

  /**
   * What is the index of the given string in the array?
   *
   * @param String aStr
   */
  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
    if (this.has(aStr)) {
      return this._set[util.toSetString(aStr)];
    }
    throw new Error('"' + aStr + '" is not in the set.');
  };

  /**
   * What is the element at the given index?
   *
   * @param Number aIdx
   */
  ArraySet.prototype.at = function ArraySet_at(aIdx) {
    if (aIdx >= 0 && aIdx < this._array.length) {
      return this._array[aIdx];
    }
    throw new Error('No element indexed by ' + aIdx);
  };

  /**
   * Returns the array representation of this set (which has the proper indices
   * indicated by indexOf). Note that this is a copy of the internal array used
   * for storing the members so that no one can mess with internal state.
   */
  ArraySet.prototype.toArray = function ArraySet_toArray() {
    return this._array.slice();
  };

  exports.ArraySet = ArraySet;

});

},{"./util":136,"amdefine":17}],128:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64 = require('./base64');

  // A single base 64 digit can contain 6 bits of data. For the base 64 variable
  // length quantities we use in the source map spec, the first bit is the sign,
  // the next four bits are the actual value, and the 6th bit is the
  // continuation bit. The continuation bit tells us whether there are more
  // digits in this value following this digit.
  //
  //   Continuation
  //   |    Sign
  //   |    |
  //   V    V
  //   101011

  var VLQ_BASE_SHIFT = 5;

  // binary: 100000
  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

  // binary: 011111
  var VLQ_BASE_MASK = VLQ_BASE - 1;

  // binary: 100000
  var VLQ_CONTINUATION_BIT = VLQ_BASE;

  /**
   * Converts from a two-complement value to a value where the sign bit is
   * placed in the least significant bit.  For example, as decimals:
   *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
   *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
   */
  function toVLQSigned(aValue) {
    return aValue < 0
      ? ((-aValue) << 1) + 1
      : (aValue << 1) + 0;
  }

  /**
   * Converts to a two-complement value from a value where the sign bit is
   * placed in the least significant bit.  For example, as decimals:
   *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
   *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
   */
  function fromVLQSigned(aValue) {
    var isNegative = (aValue & 1) === 1;
    var shifted = aValue >> 1;
    return isNegative
      ? -shifted
      : shifted;
  }

  /**
   * Returns the base 64 VLQ encoded value.
   */
  exports.encode = function base64VLQ_encode(aValue) {
    var encoded = "";
    var digit;

    var vlq = toVLQSigned(aValue);

    do {
      digit = vlq & VLQ_BASE_MASK;
      vlq >>>= VLQ_BASE_SHIFT;
      if (vlq > 0) {
        // There are still more digits in this value, so we must make sure the
        // continuation bit is marked.
        digit |= VLQ_CONTINUATION_BIT;
      }
      encoded += base64.encode(digit);
    } while (vlq > 0);

    return encoded;
  };

  /**
   * Decodes the next base 64 VLQ value from the given string and returns the
   * value and the rest of the string via the out parameter.
   */
  exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
    var strLen = aStr.length;
    var result = 0;
    var shift = 0;
    var continuation, digit;

    do {
      if (aIndex >= strLen) {
        throw new Error("Expected more digits in base 64 VLQ value.");
      }

      digit = base64.decode(aStr.charCodeAt(aIndex++));
      if (digit === -1) {
        throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
      }

      continuation = !!(digit & VLQ_CONTINUATION_BIT);
      digit &= VLQ_BASE_MASK;
      result = result + (digit << shift);
      shift += VLQ_BASE_SHIFT;
    } while (continuation);

    aOutParam.value = fromVLQSigned(result);
    aOutParam.rest = aIndex;
  };

});

},{"./base64":129,"amdefine":17}],129:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

  /**
   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
   */
  exports.encode = function (number) {
    if (0 <= number && number < intToCharMap.length) {
      return intToCharMap[number];
    }
    throw new TypeError("Must be between 0 and 63: " + aNumber);
  };

  /**
   * Decode a single base 64 character code digit to an integer. Returns -1 on
   * failure.
   */
  exports.decode = function (charCode) {
    var bigA = 65;     // 'A'
    var bigZ = 90;     // 'Z'

    var littleA = 97;  // 'a'
    var littleZ = 122; // 'z'

    var zero = 48;     // '0'
    var nine = 57;     // '9'

    var plus = 43;     // '+'
    var slash = 47;    // '/'

    var littleOffset = 26;
    var numberOffset = 52;

    // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
    if (bigA <= charCode && charCode <= bigZ) {
      return (charCode - bigA);
    }

    // 26 - 51: abcdefghijklmnopqrstuvwxyz
    if (littleA <= charCode && charCode <= littleZ) {
      return (charCode - littleA + littleOffset);
    }

    // 52 - 61: 0123456789
    if (zero <= charCode && charCode <= nine) {
      return (charCode - zero + numberOffset);
    }

    // 62: +
    if (charCode == plus) {
      return 62;
    }

    // 63: /
    if (charCode == slash) {
      return 63;
    }

    // Invalid base64 digit.
    return -1;
  };

});

},{"amdefine":17}],130:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  exports.GREATEST_LOWER_BOUND = 1;
  exports.LEAST_UPPER_BOUND = 2;

  /**
   * Recursive implementation of binary search.
   *
   * @param aLow Indices here and lower do not contain the needle.
   * @param aHigh Indices here and higher do not contain the needle.
   * @param aNeedle The element being searched for.
   * @param aHaystack The non-empty array being searched.
   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
   * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
   *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
   *     closest element that is smaller than or greater than the one we are
   *     searching for, respectively, if the exact element cannot be found.
   */
  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
    // This function terminates when one of the following is true:
    //
    //   1. We find the exact element we are looking for.
    //
    //   2. We did not find the exact element, but we can return the index of
    //      the next-closest element.
    //
    //   3. We did not find the exact element, and there is no next-closest
    //      element than the one we are searching for, so we return -1.
    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
    var cmp = aCompare(aNeedle, aHaystack[mid], true);
    if (cmp === 0) {
      // Found the element we are looking for.
      return mid;
    }
    else if (cmp > 0) {
      // Our needle is greater than aHaystack[mid].
      if (aHigh - mid > 1) {
        // The element is in the upper half.
        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
      }

      // The exact needle element was not found in this haystack. Determine if
      // we are in termination case (3) or (2) and return the appropriate thing.
      if (aBias == exports.LEAST_UPPER_BOUND) {
        return aHigh < aHaystack.length ? aHigh : -1;
      } else {
        return mid;
      }
    }
    else {
      // Our needle is less than aHaystack[mid].
      if (mid - aLow > 1) {
        // The element is in the lower half.
        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
      }

      // we are in termination case (3) or (2) and return the appropriate thing.
      if (aBias == exports.LEAST_UPPER_BOUND) {
        return mid;
      } else {
        return aLow < 0 ? -1 : aLow;
      }
    }
  }

  /**
   * This is an implementation of binary search which will always try and return
   * the index of the closest element if there is no exact hit. This is because
   * mappings between original and generated line/col pairs are single points,
   * and there is an implicit region between each of them, so a miss just means
   * that you aren't on the very start of a region.
   *
   * @param aNeedle The element you are looking for.
   * @param aHaystack The array that is being searched.
   * @param aCompare A function which takes the needle and an element in the
   *     array and returns -1, 0, or 1 depending on whether the needle is less
   *     than, equal to, or greater than the element, respectively.
   * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
   *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
   *     closest element that is smaller than or greater than the one we are
   *     searching for, respectively, if the exact element cannot be found.
   *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
   */
  exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
    if (aHaystack.length === 0) {
      return -1;
    }

    var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                                aCompare, aBias || exports.GREATEST_LOWER_BOUND);
    if (index < 0) {
      return -1;
    }

    // We have found either the exact element, or the next-closest element than
    // the one we are searching for. However, there may be more than one such
    // element. Make sure we always return the smallest of these.
    while (index - 1 >= 0) {
      if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
        break;
      }
      --index;
    }

    return index;
  };

});

},{"amdefine":17}],131:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * Determine whether mappingB is after mappingA with respect to generated
   * position.
   */
  function generatedPositionAfter(mappingA, mappingB) {
    // Optimized for most common case
    var lineA = mappingA.generatedLine;
    var lineB = mappingB.generatedLine;
    var columnA = mappingA.generatedColumn;
    var columnB = mappingB.generatedColumn;
    return lineB > lineA || lineB == lineA && columnB >= columnA ||
           util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
  }

  /**
   * A data structure to provide a sorted view of accumulated mappings in a
   * performance conscious manner. It trades a neglibable overhead in general
   * case for a large speedup in case of mappings being added in order.
   */
  function MappingList() {
    this._array = [];
    this._sorted = true;
    // Serves as infimum
    this._last = {generatedLine: -1, generatedColumn: 0};
  }

  /**
   * Iterate through internal items. This method takes the same arguments that
   * `Array.prototype.forEach` takes.
   *
   * NOTE: The order of the mappings is NOT guaranteed.
   */
  MappingList.prototype.unsortedForEach =
    function MappingList_forEach(aCallback, aThisArg) {
      this._array.forEach(aCallback, aThisArg);
    };

  /**
   * Add the given source mapping.
   *
   * @param Object aMapping
   */
  MappingList.prototype.add = function MappingList_add(aMapping) {
    var mapping;
    if (generatedPositionAfter(this._last, aMapping)) {
      this._last = aMapping;
      this._array.push(aMapping);
    } else {
      this._sorted = false;
      this._array.push(aMapping);
    }
  };

  /**
   * Returns the flat, sorted array of mappings. The mappings are sorted by
   * generated position.
   *
   * WARNING: This method returns internal data without copying, for
   * performance. The return value must NOT be mutated, and should be treated as
   * an immutable borrow. If you want to take ownership, you must make your own
   * copy.
   */
  MappingList.prototype.toArray = function MappingList_toArray() {
    if (!this._sorted) {
      this._array.sort(util.compareByGeneratedPositionsInflated);
      this._sorted = true;
    }
    return this._array;
  };

  exports.MappingList = MappingList;

});

},{"./util":136,"amdefine":17}],132:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  // It turns out that some (most?) JavaScript engines don't self-host
  // `Array.prototype.sort`. This makes sense because C++ will likely remain
  // faster than JS when doing raw CPU-intensive sorting. However, when using a
  // custom comparator function, calling back and forth between the VM's C++ and
  // JIT'd JS is rather slow *and* loses JIT type information, resulting in
  // worse generated code for the comparator function than would be optimal. In
  // fact, when sorting with a comparator, these costs outweigh the benefits of
  // sorting in C++. By using our own JS-implemented Quick Sort (below), we get
  // a ~3500ms mean speed-up in `bench/bench.html`.

  /**
   * Swap the elements indexed by `x` and `y` in the array `ary`.
   *
   * @param {Array} ary
   *        The array.
   * @param {Number} x
   *        The index of the first item.
   * @param {Number} y
   *        The index of the second item.
   */
  function swap(ary, x, y) {
    var temp = ary[x];
    ary[x] = ary[y];
    ary[y] = temp;
  }

  /**
   * Returns a random integer within the range `low .. high` inclusive.
   *
   * @param {Number} low
   *        The lower bound on the range.
   * @param {Number} high
   *        The upper bound on the range.
   */
  function randomIntInRange(low, high) {
    return Math.round(low + (Math.random() * (high - low)));
  }

  /**
   * The Quick Sort algorithm.
   *
   * @param {Array} ary
   *        An array to sort.
   * @param {function} comparator
   *        Function to use to compare two items.
   * @param {Number} p
   *        Start index of the array
   * @param {Number} r
   *        End index of the array
   */
  function doQuickSort(ary, comparator, p, r) {
    // If our lower bound is less than our upper bound, we (1) partition the
    // array into two pieces and (2) recurse on each half. If it is not, this is
    // the empty array and our base case.

    if (p < r) {
      // (1) Partitioning.
      //
      // The partitioning chooses a pivot between `p` and `r` and moves all
      // elements that are less than or equal to the pivot to the before it, and
      // all the elements that are greater than it after it. The effect is that
      // once partition is done, the pivot is in the exact place it will be when
      // the array is put in sorted order, and it will not need to be moved
      // again. This runs in O(n) time.

      // Always choose a random pivot so that an input array which is reverse
      // sorted does not cause O(n^2) running time.
      var pivotIndex = randomIntInRange(p, r);
      var i = p - 1;

      swap(ary, pivotIndex, r);
      var pivot = ary[r];

      // Immediately after `j` is incremented in this loop, the following hold
      // true:
      //
      //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
      //
      //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
      for (var j = p; j < r; j++) {
        if (comparator(ary[j], pivot) <= 0) {
          i += 1;
          swap(ary, i, j);
        }
      }

      swap(ary, i + 1, j);
      var q = i + 1;

      // (2) Recurse on each half.

      doQuickSort(ary, comparator, p, q - 1);
      doQuickSort(ary, comparator, q + 1, r);
    }
  }

  /**
   * Sort the given array in-place with the given comparator function.
   *
   * @param {Array} ary
   *        An array to sort.
   * @param {function} comparator
   *        Function to use to compare two items.
   */
  exports.quickSort = function (ary, comparator) {
    doQuickSort(ary, comparator, 0, ary.length - 1);
  };

});

},{"amdefine":17}],133:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');
  var binarySearch = require('./binary-search');
  var ArraySet = require('./array-set').ArraySet;
  var base64VLQ = require('./base64-vlq');
  var quickSort = require('./quick-sort').quickSort;

  function SourceMapConsumer(aSourceMap) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === 'string') {
      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
    }

    return sourceMap.sections != null
      ? new IndexedSourceMapConsumer(sourceMap)
      : new BasicSourceMapConsumer(sourceMap);
  }

  SourceMapConsumer.fromSourceMap = function(aSourceMap) {
    return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
  }

  /**
   * The version of the source mapping spec that we are consuming.
   */
  SourceMapConsumer.prototype._version = 3;

  // `__generatedMappings` and `__originalMappings` are arrays that hold the
  // parsed mapping coordinates from the source map's "mappings" attribute. They
  // are lazily instantiated, accessed via the `_generatedMappings` and
  // `_originalMappings` getters respectively, and we only parse the mappings
  // and create these arrays once queried for a source location. We jump through
  // these hoops because there can be many thousands of mappings, and parsing
  // them is expensive, so we only want to do it if we must.
  //
  // Each object in the arrays is of the form:
  //
  //     {
  //       generatedLine: The line number in the generated code,
  //       generatedColumn: The column number in the generated code,
  //       source: The path to the original source file that generated this
  //               chunk of code,
  //       originalLine: The line number in the original source that
  //                     corresponds to this chunk of generated code,
  //       originalColumn: The column number in the original source that
  //                       corresponds to this chunk of generated code,
  //       name: The name of the original symbol which generated this chunk of
  //             code.
  //     }
  //
  // All properties except for `generatedLine` and `generatedColumn` can be
  // `null`.
  //
  // `_generatedMappings` is ordered by the generated positions.
  //
  // `_originalMappings` is ordered by the original positions.

  SourceMapConsumer.prototype.__generatedMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
    get: function () {
      if (!this.__generatedMappings) {
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__generatedMappings;
    }
  });

  SourceMapConsumer.prototype.__originalMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
    get: function () {
      if (!this.__originalMappings) {
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__originalMappings;
    }
  });

  SourceMapConsumer.prototype._charIsMappingSeparator =
    function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
      var c = aStr.charAt(index);
      return c === ";" || c === ",";
    };

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  SourceMapConsumer.prototype._parseMappings =
    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      throw new Error("Subclasses must implement _parseMappings");
    };

  SourceMapConsumer.GENERATED_ORDER = 1;
  SourceMapConsumer.ORIGINAL_ORDER = 2;

  SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
  SourceMapConsumer.LEAST_UPPER_BOUND = 2;

  /**
   * Iterate over each mapping between an original source/line/column and a
   * generated line/column in this source map.
   *
   * @param Function aCallback
   *        The function that is called with each mapping.
   * @param Object aContext
   *        Optional. If specified, this object will be the value of `this` every
   *        time that `aCallback` is called.
   * @param aOrder
   *        Either `SourceMapConsumer.GENERATED_ORDER` or
   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
   *        iterate over the mappings sorted by the generated file's line/column
   *        order or the original's source/line/column order, respectively. Defaults to
   *        `SourceMapConsumer.GENERATED_ORDER`.
   */
  SourceMapConsumer.prototype.eachMapping =
    function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
      var context = aContext || null;
      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

      var mappings;
      switch (order) {
      case SourceMapConsumer.GENERATED_ORDER:
        mappings = this._generatedMappings;
        break;
      case SourceMapConsumer.ORIGINAL_ORDER:
        mappings = this._originalMappings;
        break;
      default:
        throw new Error("Unknown order of iteration.");
      }

      var sourceRoot = this.sourceRoot;
      mappings.map(function (mapping) {
        var source = mapping.source === null ? null : this._sources.at(mapping.source);
        if (source != null && sourceRoot != null) {
          source = util.join(sourceRoot, source);
        }
        return {
          source: source,
          generatedLine: mapping.generatedLine,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: mapping.name === null ? null : this._names.at(mapping.name)
        };
      }, this).forEach(aCallback, context);
    };

  /**
   * Returns all generated line and column information for the original source,
   * line, and column provided. If no column is provided, returns all mappings
   * corresponding to a either the line we are searching for or the next
   * closest line that has any mappings. Otherwise, returns all mappings
   * corresponding to the given line and either the column we are searching for
   * or the next closest column that has any offsets.
   *
   * The only argument is an object with the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: Optional. the column number in the original source.
   *
   * and an array of objects is returned, each with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.allGeneratedPositionsFor =
    function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
      var line = util.getArg(aArgs, 'line');

      // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
      // returns the index of the closest mapping less than the needle. By
      // setting needle.originalColumn to 0, we thus find the last mapping for
      // the given line, provided such a mapping exists.
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: line,
        originalColumn: util.getArg(aArgs, 'column', 0)
      };

      if (this.sourceRoot != null) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }
      if (!this._sources.has(needle.source)) {
        return [];
      }
      needle.source = this._sources.indexOf(needle.source);

      var mappings = [];

      var index = this._findMapping(needle,
                                    this._originalMappings,
                                    "originalLine",
                                    "originalColumn",
                                    util.compareByOriginalPositions,
                                    binarySearch.LEAST_UPPER_BOUND);
      if (index >= 0) {
        var mapping = this._originalMappings[index];

        if (aArgs.column === undefined) {
          var originalLine = mapping.originalLine;

          // Iterate until either we run out of mappings, or we run into
          // a mapping for a different line than the one we found. Since
          // mappings are sorted, this is guaranteed to find all mappings for
          // the line we found.
          while (mapping && mapping.originalLine === originalLine) {
            mappings.push({
              line: util.getArg(mapping, 'generatedLine', null),
              column: util.getArg(mapping, 'generatedColumn', null),
              lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
            });

            mapping = this._originalMappings[++index];
          }
        } else {
          var originalColumn = mapping.originalColumn;

          // Iterate until either we run out of mappings, or we run into
          // a mapping for a different line than the one we were searching for.
          // Since mappings are sorted, this is guaranteed to find all mappings for
          // the line we are searching for.
          while (mapping &&
                 mapping.originalLine === line &&
                 mapping.originalColumn == originalColumn) {
            mappings.push({
              line: util.getArg(mapping, 'generatedLine', null),
              column: util.getArg(mapping, 'generatedColumn', null),
              lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
            });

            mapping = this._originalMappings[++index];
          }
        }
      }

      return mappings;
    };

  exports.SourceMapConsumer = SourceMapConsumer;

  /**
   * A BasicSourceMapConsumer instance represents a parsed source map which we can
   * query for information about the original file positions by giving it a file
   * position in the generated source.
   *
   * The only parameter is the raw source map (either as a JSON string, or
   * already parsed to an object). According to the spec, source maps have the
   * following attributes:
   *
   *   - version: Which version of the source map spec this map is following.
   *   - sources: An array of URLs to the original source files.
   *   - names: An array of identifiers which can be referrenced by individual mappings.
   *   - sourceRoot: Optional. The URL root from which all sources are relative.
   *   - sourcesContent: Optional. An array of contents of the original source files.
   *   - mappings: A string of base64 VLQs which contain the actual mappings.
   *   - file: Optional. The generated file this source map is associated with.
   *
   * Here is an example source map, taken from the source map spec[0]:
   *
   *     {
   *       version : 3,
   *       file: "out.js",
   *       sourceRoot : "",
   *       sources: ["foo.js", "bar.js"],
   *       names: ["src", "maps", "are", "fun"],
   *       mappings: "AA,AB;;ABCDE;"
   *     }
   *
   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
   */
  function BasicSourceMapConsumer(aSourceMap) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === 'string') {
      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
    }

    var version = util.getArg(sourceMap, 'version');
    var sources = util.getArg(sourceMap, 'sources');
    // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
    // requires the array) to play nice here.
    var names = util.getArg(sourceMap, 'names', []);
    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
    var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
    var mappings = util.getArg(sourceMap, 'mappings');
    var file = util.getArg(sourceMap, 'file', null);

    // Once again, Sass deviates from the spec and supplies the version as a
    // string rather than a number, so we use loose equality checking here.
    if (version != this._version) {
      throw new Error('Unsupported version: ' + version);
    }

    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    sources = sources.map(util.normalize);

    // Pass `true` below to allow duplicate names and sources. While source maps
    // are intended to be compressed and deduplicated, the TypeScript compiler
    // sometimes generates source maps with duplicates in them. See Github issue
    // #72 and bugzil.la/889492.
    this._names = ArraySet.fromArray(names, true);
    this._sources = ArraySet.fromArray(sources, true);

    this.sourceRoot = sourceRoot;
    this.sourcesContent = sourcesContent;
    this._mappings = mappings;
    this.file = file;
  }

  BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
  BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

  /**
   * Create a BasicSourceMapConsumer from a SourceMapGenerator.
   *
   * @param SourceMapGenerator aSourceMap
   *        The source map that will be consumed.
   * @returns BasicSourceMapConsumer
   */
  BasicSourceMapConsumer.fromSourceMap =
    function SourceMapConsumer_fromSourceMap(aSourceMap) {
      var smc = Object.create(BasicSourceMapConsumer.prototype);

      var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
      var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
      smc.sourceRoot = aSourceMap._sourceRoot;
      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                              smc.sourceRoot);
      smc.file = aSourceMap._file;

      // Because we are modifying the entries (by converting string sources and
      // names to indices into the sources and names ArraySets), we have to make
      // a copy of the entry or else bad things happen. Shared mutable state
      // strikes again! See github issue #191.

      var generatedMappings = aSourceMap._mappings.toArray().slice();
      var destGeneratedMappings = smc.__generatedMappings = [];
      var destOriginalMappings = smc.__originalMappings = [];

      for (var i = 0, length = generatedMappings.length; i < length; i++) {
        var srcMapping = generatedMappings[i];
        var destMapping = new Mapping;
        destMapping.generatedLine = srcMapping.generatedLine;
        destMapping.generatedColumn = srcMapping.generatedColumn;

        if (srcMapping.source) {
          destMapping.source = sources.indexOf(srcMapping.source);
          destMapping.originalLine = srcMapping.originalLine;
          destMapping.originalColumn = srcMapping.originalColumn;

          if (srcMapping.name) {
            destMapping.name = names.indexOf(srcMapping.name);
          }

          destOriginalMappings.push(destMapping);
        }

        destGeneratedMappings.push(destMapping);
      }

      quickSort(smc.__originalMappings, util.compareByOriginalPositions);

      return smc;
    };

  /**
   * The version of the source mapping spec that we are consuming.
   */
  BasicSourceMapConsumer.prototype._version = 3;

  /**
   * The list of original sources.
   */
  Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
    get: function () {
      return this._sources.toArray().map(function (s) {
        return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
      }, this);
    }
  });

  /**
   * Provide the JIT with a nice shape / hidden class.
   */
  function Mapping() {
    this.generatedLine = 0;
    this.generatedColumn = 0;
    this.source = null;
    this.originalLine = null;
    this.originalColumn = null;
    this.name = null;
  }

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  BasicSourceMapConsumer.prototype._parseMappings =
    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var length = aStr.length;
      var index = 0;
      var cachedSegments = {};
      var temp = {};
      var originalMappings = [];
      var generatedMappings = [];
      var mapping, str, segment, end, value;

      while (index < length) {
        if (aStr.charAt(index) === ';') {
          generatedLine++;
          index++;
          previousGeneratedColumn = 0;
        }
        else if (aStr.charAt(index) === ',') {
          index++;
        }
        else {
          mapping = new Mapping();
          mapping.generatedLine = generatedLine;

          // Because each offset is encoded relative to the previous one,
          // many segments often have the same encoding. We can exploit this
          // fact by caching the parsed variable length fields of each segment,
          // allowing us to avoid a second parse if we encounter the same
          // segment again.
          for (end = index; end < length; end++) {
            if (this._charIsMappingSeparator(aStr, end)) {
              break;
            }
          }
          str = aStr.slice(index, end);

          segment = cachedSegments[str];
          if (segment) {
            index += str.length;
          } else {
            segment = [];
            while (index < end) {
              base64VLQ.decode(aStr, index, temp);
              value = temp.value;
              index = temp.rest;
              segment.push(value);
            }

            if (segment.length === 2) {
              throw new Error('Found a source, but no line and column');
            }

            if (segment.length === 3) {
              throw new Error('Found a source and line, but no column');
            }

            cachedSegments[str] = segment;
          }

          // Generated column.
          mapping.generatedColumn = previousGeneratedColumn + segment[0];
          previousGeneratedColumn = mapping.generatedColumn;

          if (segment.length > 1) {
            // Original source.
            mapping.source = previousSource + segment[1];
            previousSource += segment[1];

            // Original line.
            mapping.originalLine = previousOriginalLine + segment[2];
            previousOriginalLine = mapping.originalLine;
            // Lines are stored 0-based
            mapping.originalLine += 1;

            // Original column.
            mapping.originalColumn = previousOriginalColumn + segment[3];
            previousOriginalColumn = mapping.originalColumn;

            if (segment.length > 4) {
              // Original name.
              mapping.name = previousName + segment[4];
              previousName += segment[4];
            }
          }

          generatedMappings.push(mapping);
          if (typeof mapping.originalLine === 'number') {
            originalMappings.push(mapping);
          }
        }
      }

      quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
      this.__generatedMappings = generatedMappings;

      quickSort(originalMappings, util.compareByOriginalPositions);
      this.__originalMappings = originalMappings;
    };

  /**
   * Find the mapping that best matches the hypothetical "needle" mapping that
   * we are searching for in the given "haystack" of mappings.
   */
  BasicSourceMapConsumer.prototype._findMapping =
    function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                           aColumnName, aComparator, aBias) {
      // To return the position we are searching for, we must first find the
      // mapping for the given position and then return the opposite position it
      // points to. Because the mappings are sorted, we can use binary search to
      // find the best mapping.

      if (aNeedle[aLineName] <= 0) {
        throw new TypeError('Line must be greater than or equal to 1, got '
                            + aNeedle[aLineName]);
      }
      if (aNeedle[aColumnName] < 0) {
        throw new TypeError('Column must be greater than or equal to 0, got '
                            + aNeedle[aColumnName]);
      }

      return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
    };

  /**
   * Compute the last column for each generated mapping. The last column is
   * inclusive.
   */
  BasicSourceMapConsumer.prototype.computeColumnSpans =
    function SourceMapConsumer_computeColumnSpans() {
      for (var index = 0; index < this._generatedMappings.length; ++index) {
        var mapping = this._generatedMappings[index];

        // Mappings do not contain a field for the last generated columnt. We
        // can come up with an optimistic estimate, however, by assuming that
        // mappings are contiguous (i.e. given two consecutive mappings, the
        // first mapping ends where the second one starts).
        if (index + 1 < this._generatedMappings.length) {
          var nextMapping = this._generatedMappings[index + 1];

          if (mapping.generatedLine === nextMapping.generatedLine) {
            mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
            continue;
          }
        }

        // The last mapping for each line spans the entire line.
        mapping.lastGeneratedColumn = Infinity;
      }
    };

  /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
   *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
   *     closest element that is smaller than or greater than the one we are
   *     searching for, respectively, if the exact element cannot be found.
   *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */
  BasicSourceMapConsumer.prototype.originalPositionFor =
    function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };

      var index = this._findMapping(
        needle,
        this._generatedMappings,
        "generatedLine",
        "generatedColumn",
        util.compareByGeneratedPositionsDeflated,
        util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
      );

      if (index >= 0) {
        var mapping = this._generatedMappings[index];

        if (mapping.generatedLine === needle.generatedLine) {
          var source = util.getArg(mapping, 'source', null);
          if (source !== null) {
            source = this._sources.at(source);
            if (this.sourceRoot != null) {
              source = util.join(this.sourceRoot, source);
            }
          }
          var name = util.getArg(mapping, 'name', null);
          if (name !== null) {
            name = this._names.at(name);
          }
          return {
            source: source,
            line: util.getArg(mapping, 'originalLine', null),
            column: util.getArg(mapping, 'originalColumn', null),
            name: name
          };
        }
      }

      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    };

  /**
   * Return true if we have the source content for every source in the source
   * map, false otherwise.
   */
  BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
    function BasicSourceMapConsumer_hasContentsOfAllSources() {
      if (!this.sourcesContent) {
        return false;
      }
      return this.sourcesContent.length >= this._sources.size() &&
        !this.sourcesContent.some(function (sc) { return sc == null; });
    };

  /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * availible.
   */
  BasicSourceMapConsumer.prototype.sourceContentFor =
    function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
      if (!this.sourcesContent) {
        return null;
      }

      if (this.sourceRoot != null) {
        aSource = util.relative(this.sourceRoot, aSource);
      }

      if (this._sources.has(aSource)) {
        return this.sourcesContent[this._sources.indexOf(aSource)];
      }

      var url;
      if (this.sourceRoot != null
          && (url = util.urlParse(this.sourceRoot))) {
        // XXX: file:// URIs and absolute paths lead to unexpected behavior for
        // many users. We can help them out when they expect file:// URIs to
        // behave like it would if they were running a local HTTP server. See
        // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
        if (url.scheme == "file"
            && this._sources.has(fileUriAbsPath)) {
          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
        }

        if ((!url.path || url.path == "/")
            && this._sources.has("/" + aSource)) {
          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
        }
      }

      // This function is used recursively from
      // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
      // don't want to throw if we can't find the source - we just want to
      // return null, so we provide a flag to exit gracefully.
      if (nullOnMissing) {
        return null;
      }
      else {
        throw new Error('"' + aSource + '" is not in the SourceMap.');
      }
    };

  /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: The column number in the original source.
   *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
   *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
   *     closest element that is smaller than or greater than the one we are
   *     searching for, respectively, if the exact element cannot be found.
   *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  BasicSourceMapConsumer.prototype.generatedPositionFor =
    function SourceMapConsumer_generatedPositionFor(aArgs) {
      var source = util.getArg(aArgs, 'source');
      if (this.sourceRoot != null) {
        source = util.relative(this.sourceRoot, source);
      }
      if (!this._sources.has(source)) {
        return {
          line: null,
          column: null,
          lastColumn: null
        };
      }
      source = this._sources.indexOf(source);

      var needle = {
        source: source,
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: util.getArg(aArgs, 'column')
      };

      var index = this._findMapping(
        needle,
        this._originalMappings,
        "originalLine",
        "originalColumn",
        util.compareByOriginalPositions,
        util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
      );

      if (index >= 0) {
        var mapping = this._originalMappings[index];

        if (mapping.source === needle.source) {
          return {
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          };
        }
      }

      return {
        line: null,
        column: null,
        lastColumn: null
      };
    };

  exports.BasicSourceMapConsumer = BasicSourceMapConsumer;

  /**
   * An IndexedSourceMapConsumer instance represents a parsed source map which
   * we can query for information. It differs from BasicSourceMapConsumer in
   * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
   * input.
   *
   * The only parameter is a raw source map (either as a JSON string, or already
   * parsed to an object). According to the spec for indexed source maps, they
   * have the following attributes:
   *
   *   - version: Which version of the source map spec this map is following.
   *   - file: Optional. The generated file this source map is associated with.
   *   - sections: A list of section definitions.
   *
   * Each value under the "sections" field has two fields:
   *   - offset: The offset into the original specified at which this section
   *       begins to apply, defined as an object with a "line" and "column"
   *       field.
   *   - map: A source map definition. This source map could also be indexed,
   *       but doesn't have to be.
   *
   * Instead of the "map" field, it's also possible to have a "url" field
   * specifying a URL to retrieve a source map from, but that's currently
   * unsupported.
   *
   * Here's an example source map, taken from the source map spec[0], but
   * modified to omit a section which uses the "url" field.
   *
   *  {
   *    version : 3,
   *    file: "app.js",
   *    sections: [{
   *      offset: {line:100, column:10},
   *      map: {
   *        version : 3,
   *        file: "section.js",
   *        sources: ["foo.js", "bar.js"],
   *        names: ["src", "maps", "are", "fun"],
   *        mappings: "AAAA,E;;ABCDE;"
   *      }
   *    }],
   *  }
   *
   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
   */
  function IndexedSourceMapConsumer(aSourceMap) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === 'string') {
      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
    }

    var version = util.getArg(sourceMap, 'version');
    var sections = util.getArg(sourceMap, 'sections');

    if (version != this._version) {
      throw new Error('Unsupported version: ' + version);
    }

    this._sources = new ArraySet();
    this._names = new ArraySet();

    var lastOffset = {
      line: -1,
      column: 0
    };
    this._sections = sections.map(function (s) {
      if (s.url) {
        // The url field will require support for asynchronicity.
        // See https://github.com/mozilla/source-map/issues/16
        throw new Error('Support for url field in sections not implemented.');
      }
      var offset = util.getArg(s, 'offset');
      var offsetLine = util.getArg(offset, 'line');
      var offsetColumn = util.getArg(offset, 'column');

      if (offsetLine < lastOffset.line ||
          (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
        throw new Error('Section offsets must be ordered and non-overlapping.');
      }
      lastOffset = offset;

      return {
        generatedOffset: {
          // The offset fields are 0-based, but we use 1-based indices when
          // encoding/decoding from VLQ.
          generatedLine: offsetLine + 1,
          generatedColumn: offsetColumn + 1
        },
        consumer: new SourceMapConsumer(util.getArg(s, 'map'))
      }
    });
  }

  IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
  IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

  /**
   * The version of the source mapping spec that we are consuming.
   */
  IndexedSourceMapConsumer.prototype._version = 3;

  /**
   * The list of original sources.
   */
  Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
    get: function () {
      var sources = [];
      for (var i = 0; i < this._sections.length; i++) {
        for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
          sources.push(this._sections[i].consumer.sources[j]);
        }
      };
      return sources;
    }
  });

  /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */
  IndexedSourceMapConsumer.prototype.originalPositionFor =
    function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };

      // Find the section containing the generated position we're trying to map
      // to an original position.
      var sectionIndex = binarySearch.search(needle, this._sections,
        function(needle, section) {
          var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
          if (cmp) {
            return cmp;
          }

          return (needle.generatedColumn -
                  section.generatedOffset.generatedColumn);
        });
      var section = this._sections[sectionIndex];

      if (!section) {
        return {
          source: null,
          line: null,
          column: null,
          name: null
        };
      }

      return section.consumer.originalPositionFor({
        line: needle.generatedLine -
          (section.generatedOffset.generatedLine - 1),
        column: needle.generatedColumn -
          (section.generatedOffset.generatedLine === needle.generatedLine
           ? section.generatedOffset.generatedColumn - 1
           : 0),
        bias: aArgs.bias
      });
    };

  /**
   * Return true if we have the source content for every source in the source
   * map, false otherwise.
   */
  IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
    function IndexedSourceMapConsumer_hasContentsOfAllSources() {
      return this._sections.every(function (s) {
        return s.consumer.hasContentsOfAllSources();
      });
    };

  /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * available.
   */
  IndexedSourceMapConsumer.prototype.sourceContentFor =
    function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
      for (var i = 0; i < this._sections.length; i++) {
        var section = this._sections[i];

        var content = section.consumer.sourceContentFor(aSource, true);
        if (content) {
          return content;
        }
      }
      if (nullOnMissing) {
        return null;
      }
      else {
        throw new Error('"' + aSource + '" is not in the SourceMap.');
      }
    };

  /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: The column number in the original source.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  IndexedSourceMapConsumer.prototype.generatedPositionFor =
    function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
      for (var i = 0; i < this._sections.length; i++) {
        var section = this._sections[i];

        // Only consider this section if the requested source is in the list of
        // sources of the consumer.
        if (section.consumer.sources.indexOf(util.getArg(aArgs, 'source')) === -1) {
          continue;
        }
        var generatedPosition = section.consumer.generatedPositionFor(aArgs);
        if (generatedPosition) {
          var ret = {
            line: generatedPosition.line +
              (section.generatedOffset.generatedLine - 1),
            column: generatedPosition.column +
              (section.generatedOffset.generatedLine === generatedPosition.line
               ? section.generatedOffset.generatedColumn - 1
               : 0)
          };
          return ret;
        }
      }

      return {
        line: null,
        column: null
      };
    };

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  IndexedSourceMapConsumer.prototype._parseMappings =
    function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      this.__generatedMappings = [];
      this.__originalMappings = [];
      for (var i = 0; i < this._sections.length; i++) {
        var section = this._sections[i];
        var sectionMappings = section.consumer._generatedMappings;
        for (var j = 0; j < sectionMappings.length; j++) {
          var mapping = sectionMappings[i];

          var source = section.consumer._sources.at(mapping.source);
          if (section.consumer.sourceRoot !== null) {
            source = util.join(section.consumer.sourceRoot, source);
          }
          this._sources.add(source);
          source = this._sources.indexOf(source);

          var name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);

          // The mappings coming from the consumer for the section have
          // generated positions relative to the start of the section, so we
          // need to offset them to be relative to the start of the concatenated
          // generated file.
          var adjustedMapping = {
            source: source,
            generatedLine: mapping.generatedLine +
              (section.generatedOffset.generatedLine - 1),
            generatedColumn: mapping.column +
              (section.generatedOffset.generatedLine === mapping.generatedLine)
              ? section.generatedOffset.generatedColumn - 1
              : 0,
            originalLine: mapping.originalLine,
            originalColumn: mapping.originalColumn,
            name: name
          };

          this.__generatedMappings.push(adjustedMapping);
          if (typeof adjustedMapping.originalLine === 'number') {
            this.__originalMappings.push(adjustedMapping);
          }
        };
      };

      quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
      quickSort(this.__originalMappings, util.compareByOriginalPositions);
    };

  exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;

});

},{"./array-set":127,"./base64-vlq":128,"./binary-search":130,"./quick-sort":132,"./util":136,"amdefine":17}],134:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64VLQ = require('./base64-vlq');
  var util = require('./util');
  var ArraySet = require('./array-set').ArraySet;
  var MappingList = require('./mapping-list').MappingList;

  /**
   * An instance of the SourceMapGenerator represents a source map which is
   * being built incrementally. You may pass an object with the following
   * properties:
   *
   *   - file: The filename of the generated source.
   *   - sourceRoot: A root for all relative URLs in this source map.
   */
  function SourceMapGenerator(aArgs) {
    if (!aArgs) {
      aArgs = {};
    }
    this._file = util.getArg(aArgs, 'file', null);
    this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
    this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
    this._sources = new ArraySet();
    this._names = new ArraySet();
    this._mappings = new MappingList();
    this._sourcesContents = null;
  }

  SourceMapGenerator.prototype._version = 3;

  /**
   * Creates a new SourceMapGenerator based on a SourceMapConsumer
   *
   * @param aSourceMapConsumer The SourceMap.
   */
  SourceMapGenerator.fromSourceMap =
    function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
      var sourceRoot = aSourceMapConsumer.sourceRoot;
      var generator = new SourceMapGenerator({
        file: aSourceMapConsumer.file,
        sourceRoot: sourceRoot
      });
      aSourceMapConsumer.eachMapping(function (mapping) {
        var newMapping = {
          generated: {
            line: mapping.generatedLine,
            column: mapping.generatedColumn
          }
        };

        if (mapping.source != null) {
          newMapping.source = mapping.source;
          if (sourceRoot != null) {
            newMapping.source = util.relative(sourceRoot, newMapping.source);
          }

          newMapping.original = {
            line: mapping.originalLine,
            column: mapping.originalColumn
          };

          if (mapping.name != null) {
            newMapping.name = mapping.name;
          }
        }

        generator.addMapping(newMapping);
      });
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          generator.setSourceContent(sourceFile, content);
        }
      });
      return generator;
    };

  /**
   * Add a single mapping from original source line and column to the generated
   * source's line and column for this source map being created. The mapping
   * object should have the following properties:
   *
   *   - generated: An object with the generated line and column positions.
   *   - original: An object with the original line and column positions.
   *   - source: The original source file (relative to the sourceRoot).
   *   - name: An optional original token name for this mapping.
   */
  SourceMapGenerator.prototype.addMapping =
    function SourceMapGenerator_addMapping(aArgs) {
      var generated = util.getArg(aArgs, 'generated');
      var original = util.getArg(aArgs, 'original', null);
      var source = util.getArg(aArgs, 'source', null);
      var name = util.getArg(aArgs, 'name', null);

      if (!this._skipValidation) {
        this._validateMapping(generated, original, source, name);
      }

      if (source != null && !this._sources.has(source)) {
        this._sources.add(source);
      }

      if (name != null && !this._names.has(name)) {
        this._names.add(name);
      }

      this._mappings.add({
        generatedLine: generated.line,
        generatedColumn: generated.column,
        originalLine: original != null && original.line,
        originalColumn: original != null && original.column,
        source: source,
        name: name
      });
    };

  /**
   * Set the source content for a source file.
   */
  SourceMapGenerator.prototype.setSourceContent =
    function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
      var source = aSourceFile;
      if (this._sourceRoot != null) {
        source = util.relative(this._sourceRoot, source);
      }

      if (aSourceContent != null) {
        // Add the source content to the _sourcesContents map.
        // Create a new _sourcesContents map if the property is null.
        if (!this._sourcesContents) {
          this._sourcesContents = {};
        }
        this._sourcesContents[util.toSetString(source)] = aSourceContent;
      } else if (this._sourcesContents) {
        // Remove the source file from the _sourcesContents map.
        // If the _sourcesContents map is empty, set the property to null.
        delete this._sourcesContents[util.toSetString(source)];
        if (Object.keys(this._sourcesContents).length === 0) {
          this._sourcesContents = null;
        }
      }
    };

  /**
   * Applies the mappings of a sub-source-map for a specific source file to the
   * source map being generated. Each mapping to the supplied source file is
   * rewritten using the supplied source map. Note: The resolution for the
   * resulting mappings is the minimium of this map and the supplied map.
   *
   * @param aSourceMapConsumer The source map to be applied.
   * @param aSourceFile Optional. The filename of the source file.
   *        If omitted, SourceMapConsumer's file property will be used.
   * @param aSourceMapPath Optional. The dirname of the path to the source map
   *        to be applied. If relative, it is relative to the SourceMapConsumer.
   *        This parameter is needed when the two source maps aren't in the same
   *        directory, and the source map to be applied contains relative source
   *        paths. If so, those relative source paths need to be rewritten
   *        relative to the SourceMapGenerator.
   */
  SourceMapGenerator.prototype.applySourceMap =
    function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
      var sourceFile = aSourceFile;
      // If aSourceFile is omitted, we will use the file property of the SourceMap
      if (aSourceFile == null) {
        if (aSourceMapConsumer.file == null) {
          throw new Error(
            'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
            'or the source map\'s "file" property. Both were omitted.'
          );
        }
        sourceFile = aSourceMapConsumer.file;
      }
      var sourceRoot = this._sourceRoot;
      // Make "sourceFile" relative if an absolute Url is passed.
      if (sourceRoot != null) {
        sourceFile = util.relative(sourceRoot, sourceFile);
      }
      // Applying the SourceMap can add and remove items from the sources and
      // the names array.
      var newSources = new ArraySet();
      var newNames = new ArraySet();

      // Find mappings for the "sourceFile"
      this._mappings.unsortedForEach(function (mapping) {
        if (mapping.source === sourceFile && mapping.originalLine != null) {
          // Check if it can be mapped by the source map, then update the mapping.
          var original = aSourceMapConsumer.originalPositionFor({
            line: mapping.originalLine,
            column: mapping.originalColumn
          });
          if (original.source != null) {
            // Copy mapping
            mapping.source = original.source;
            if (aSourceMapPath != null) {
              mapping.source = util.join(aSourceMapPath, mapping.source)
            }
            if (sourceRoot != null) {
              mapping.source = util.relative(sourceRoot, mapping.source);
            }
            mapping.originalLine = original.line;
            mapping.originalColumn = original.column;
            if (original.name != null) {
              mapping.name = original.name;
            }
          }
        }

        var source = mapping.source;
        if (source != null && !newSources.has(source)) {
          newSources.add(source);
        }

        var name = mapping.name;
        if (name != null && !newNames.has(name)) {
          newNames.add(name);
        }

      }, this);
      this._sources = newSources;
      this._names = newNames;

      // Copy sourcesContents of applied map.
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          if (aSourceMapPath != null) {
            sourceFile = util.join(aSourceMapPath, sourceFile);
          }
          if (sourceRoot != null) {
            sourceFile = util.relative(sourceRoot, sourceFile);
          }
          this.setSourceContent(sourceFile, content);
        }
      }, this);
    };

  /**
   * A mapping can have one of the three levels of data:
   *
   *   1. Just the generated position.
   *   2. The Generated position, original position, and original source.
   *   3. Generated and original position, original source, as well as a name
   *      token.
   *
   * To maintain consistency, we validate that any new mapping being added falls
   * in to one of these categories.
   */
  SourceMapGenerator.prototype._validateMapping =
    function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                                aName) {
      if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
          && aGenerated.line > 0 && aGenerated.column >= 0
          && !aOriginal && !aSource && !aName) {
        // Case 1.
        return;
      }
      else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
               && aOriginal && 'line' in aOriginal && 'column' in aOriginal
               && aGenerated.line > 0 && aGenerated.column >= 0
               && aOriginal.line > 0 && aOriginal.column >= 0
               && aSource) {
        // Cases 2 and 3.
        return;
      }
      else {
        throw new Error('Invalid mapping: ' + JSON.stringify({
          generated: aGenerated,
          source: aSource,
          original: aOriginal,
          name: aName
        }));
      }
    };

  /**
   * Serialize the accumulated mappings in to the stream of base 64 VLQs
   * specified by the source map format.
   */
  SourceMapGenerator.prototype._serializeMappings =
    function SourceMapGenerator_serializeMappings() {
      var previousGeneratedColumn = 0;
      var previousGeneratedLine = 1;
      var previousOriginalColumn = 0;
      var previousOriginalLine = 0;
      var previousName = 0;
      var previousSource = 0;
      var result = '';
      var mapping;

      var mappings = this._mappings.toArray();
      for (var i = 0, len = mappings.length; i < len; i++) {
        mapping = mappings[i];

        if (mapping.generatedLine !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generatedLine !== previousGeneratedLine) {
            result += ';';
            previousGeneratedLine++;
          }
        }
        else {
          if (i > 0) {
            if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
              continue;
            }
            result += ',';
          }
        }

        result += base64VLQ.encode(mapping.generatedColumn
                                   - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generatedColumn;

        if (mapping.source != null) {
          result += base64VLQ.encode(this._sources.indexOf(mapping.source)
                                     - previousSource);
          previousSource = this._sources.indexOf(mapping.source);

          // lines are stored 0-based in SourceMap spec version 3
          result += base64VLQ.encode(mapping.originalLine - 1
                                     - previousOriginalLine);
          previousOriginalLine = mapping.originalLine - 1;

          result += base64VLQ.encode(mapping.originalColumn
                                     - previousOriginalColumn);
          previousOriginalColumn = mapping.originalColumn;

          if (mapping.name != null) {
            result += base64VLQ.encode(this._names.indexOf(mapping.name)
                                       - previousName);
            previousName = this._names.indexOf(mapping.name);
          }
        }
      }

      return result;
    };

  SourceMapGenerator.prototype._generateSourcesContent =
    function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
      return aSources.map(function (source) {
        if (!this._sourcesContents) {
          return null;
        }
        if (aSourceRoot != null) {
          source = util.relative(aSourceRoot, source);
        }
        var key = util.toSetString(source);
        return Object.prototype.hasOwnProperty.call(this._sourcesContents,
                                                    key)
          ? this._sourcesContents[key]
          : null;
      }, this);
    };

  /**
   * Externalize the source map.
   */
  SourceMapGenerator.prototype.toJSON =
    function SourceMapGenerator_toJSON() {
      var map = {
        version: this._version,
        sources: this._sources.toArray(),
        names: this._names.toArray(),
        mappings: this._serializeMappings()
      };
      if (this._file != null) {
        map.file = this._file;
      }
      if (this._sourceRoot != null) {
        map.sourceRoot = this._sourceRoot;
      }
      if (this._sourcesContents) {
        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
      }

      return map;
    };

  /**
   * Render the source map being generated to a string.
   */
  SourceMapGenerator.prototype.toString =
    function SourceMapGenerator_toString() {
      return JSON.stringify(this.toJSON());
    };

  exports.SourceMapGenerator = SourceMapGenerator;

});

},{"./array-set":127,"./base64-vlq":128,"./mapping-list":131,"./util":136,"amdefine":17}],135:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
  var util = require('./util');

  // Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
  // operating systems these days (capturing the result).
  var REGEX_NEWLINE = /(\r?\n)/;

  // Newline character code for charCodeAt() comparisons
  var NEWLINE_CODE = 10;

  // Private symbol for identifying `SourceNode`s when multiple versions of
  // the source-map library are loaded. This MUST NOT CHANGE across
  // versions!
  var isSourceNode = "$$$isSourceNode$$$";

  /**
   * SourceNodes provide a way to abstract over interpolating/concatenating
   * snippets of generated JavaScript source code while maintaining the line and
   * column information associated with the original source code.
   *
   * @param aLine The original line number.
   * @param aColumn The original column number.
   * @param aSource The original source's filename.
   * @param aChunks Optional. An array of strings which are snippets of
   *        generated JS, or other SourceNodes.
   * @param aName The original identifier.
   */
  function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
    this.children = [];
    this.sourceContents = {};
    this.line = aLine == null ? null : aLine;
    this.column = aColumn == null ? null : aColumn;
    this.source = aSource == null ? null : aSource;
    this.name = aName == null ? null : aName;
    this[isSourceNode] = true;
    if (aChunks != null) this.add(aChunks);
  }

  /**
   * Creates a SourceNode from generated code and a SourceMapConsumer.
   *
   * @param aGeneratedCode The generated code
   * @param aSourceMapConsumer The SourceMap for the generated code
   * @param aRelativePath Optional. The path that relative sources in the
   *        SourceMapConsumer should be relative to.
   */
  SourceNode.fromStringWithSourceMap =
    function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
      // The SourceNode we want to fill with the generated code
      // and the SourceMap
      var node = new SourceNode();

      // All even indices of this array are one line of the generated code,
      // while all odd indices are the newlines between two adjacent lines
      // (since `REGEX_NEWLINE` captures its match).
      // Processed fragments are removed from this array, by calling `shiftNextLine`.
      var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
      var shiftNextLine = function() {
        var lineContents = remainingLines.shift();
        // The last line of a file might not have a newline.
        var newLine = remainingLines.shift() || "";
        return lineContents + newLine;
      };

      // We need to remember the position of "remainingLines"
      var lastGeneratedLine = 1, lastGeneratedColumn = 0;

      // The generate SourceNodes we need a code range.
      // To extract it current and last mapping is used.
      // Here we store the last mapping.
      var lastMapping = null;

      aSourceMapConsumer.eachMapping(function (mapping) {
        if (lastMapping !== null) {
          // We add the code from "lastMapping" to "mapping":
          // First check if there is a new line in between.
          if (lastGeneratedLine < mapping.generatedLine) {
            var code = "";
            // Associate first line with "lastMapping"
            addMappingWithCode(lastMapping, shiftNextLine());
            lastGeneratedLine++;
            lastGeneratedColumn = 0;
            // The remaining code is added without mapping
          } else {
            // There is no new line in between.
            // Associate the code between "lastGeneratedColumn" and
            // "mapping.generatedColumn" with "lastMapping"
            var nextLine = remainingLines[0];
            var code = nextLine.substr(0, mapping.generatedColumn -
                                          lastGeneratedColumn);
            remainingLines[0] = nextLine.substr(mapping.generatedColumn -
                                                lastGeneratedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
            addMappingWithCode(lastMapping, code);
            // No more remaining code, continue
            lastMapping = mapping;
            return;
          }
        }
        // We add the generated code until the first mapping
        // to the SourceNode without any mapping.
        // Each line is added as separate string.
        while (lastGeneratedLine < mapping.generatedLine) {
          node.add(shiftNextLine());
          lastGeneratedLine++;
        }
        if (lastGeneratedColumn < mapping.generatedColumn) {
          var nextLine = remainingLines[0];
          node.add(nextLine.substr(0, mapping.generatedColumn));
          remainingLines[0] = nextLine.substr(mapping.generatedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
        }
        lastMapping = mapping;
      }, this);
      // We have processed all mappings.
      if (remainingLines.length > 0) {
        if (lastMapping) {
          // Associate the remaining code in the current line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
        }
        // and add the remaining lines without any mapping
        node.add(remainingLines.join(""));
      }

      // Copy sourcesContent into SourceNode
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          if (aRelativePath != null) {
            sourceFile = util.join(aRelativePath, sourceFile);
          }
          node.setSourceContent(sourceFile, content);
        }
      });

      return node;

      function addMappingWithCode(mapping, code) {
        if (mapping === null || mapping.source === undefined) {
          node.add(code);
        } else {
          var source = aRelativePath
            ? util.join(aRelativePath, mapping.source)
            : mapping.source;
          node.add(new SourceNode(mapping.originalLine,
                                  mapping.originalColumn,
                                  source,
                                  code,
                                  mapping.name));
        }
      }
    };

  /**
   * Add a chunk of generated JS to this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.add = function SourceNode_add(aChunk) {
    if (Array.isArray(aChunk)) {
      aChunk.forEach(function (chunk) {
        this.add(chunk);
      }, this);
    }
    else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      if (aChunk) {
        this.children.push(aChunk);
      }
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Add a chunk of generated JS to the beginning of this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
    if (Array.isArray(aChunk)) {
      for (var i = aChunk.length-1; i >= 0; i--) {
        this.prepend(aChunk[i]);
      }
    }
    else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      this.children.unshift(aChunk);
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Walk over the tree of JS snippets in this node and its children. The
   * walking function is called once for each snippet of JS and is passed that
   * snippet and the its original associated source's line/column location.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
    var chunk;
    for (var i = 0, len = this.children.length; i < len; i++) {
      chunk = this.children[i];
      if (chunk[isSourceNode]) {
        chunk.walk(aFn);
      }
      else {
        if (chunk !== '') {
          aFn(chunk, { source: this.source,
                       line: this.line,
                       column: this.column,
                       name: this.name });
        }
      }
    }
  };

  /**
   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
   * each of `this.children`.
   *
   * @param aSep The separator.
   */
  SourceNode.prototype.join = function SourceNode_join(aSep) {
    var newChildren;
    var i;
    var len = this.children.length;
    if (len > 0) {
      newChildren = [];
      for (i = 0; i < len-1; i++) {
        newChildren.push(this.children[i]);
        newChildren.push(aSep);
      }
      newChildren.push(this.children[i]);
      this.children = newChildren;
    }
    return this;
  };

  /**
   * Call String.prototype.replace on the very right-most source snippet. Useful
   * for trimming whitespace from the end of a source node, etc.
   *
   * @param aPattern The pattern to replace.
   * @param aReplacement The thing to replace the pattern with.
   */
  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
    var lastChild = this.children[this.children.length - 1];
    if (lastChild[isSourceNode]) {
      lastChild.replaceRight(aPattern, aReplacement);
    }
    else if (typeof lastChild === 'string') {
      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
    }
    else {
      this.children.push(''.replace(aPattern, aReplacement));
    }
    return this;
  };

  /**
   * Set the source content for a source file. This will be added to the SourceMapGenerator
   * in the sourcesContent field.
   *
   * @param aSourceFile The filename of the source file
   * @param aSourceContent The content of the source file
   */
  SourceNode.prototype.setSourceContent =
    function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
      this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
    };

  /**
   * Walk over the tree of SourceNodes. The walking function is called for each
   * source file content and is passed the filename and source content.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walkSourceContents =
    function SourceNode_walkSourceContents(aFn) {
      for (var i = 0, len = this.children.length; i < len; i++) {
        if (this.children[i][isSourceNode]) {
          this.children[i].walkSourceContents(aFn);
        }
      }

      var sources = Object.keys(this.sourceContents);
      for (var i = 0, len = sources.length; i < len; i++) {
        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
      }
    };

  /**
   * Return the string representation of this source node. Walks over the tree
   * and concatenates all the various snippets together to one string.
   */
  SourceNode.prototype.toString = function SourceNode_toString() {
    var str = "";
    this.walk(function (chunk) {
      str += chunk;
    });
    return str;
  };

  /**
   * Returns the string representation of this source node along with a source
   * map.
   */
  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
    var generated = {
      code: "",
      line: 1,
      column: 0
    };
    var map = new SourceMapGenerator(aArgs);
    var sourceMappingActive = false;
    var lastOriginalSource = null;
    var lastOriginalLine = null;
    var lastOriginalColumn = null;
    var lastOriginalName = null;
    this.walk(function (chunk, original) {
      generated.code += chunk;
      if (original.source !== null
          && original.line !== null
          && original.column !== null) {
        if(lastOriginalSource !== original.source
           || lastOriginalLine !== original.line
           || lastOriginalColumn !== original.column
           || lastOriginalName !== original.name) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
        lastOriginalSource = original.source;
        lastOriginalLine = original.line;
        lastOriginalColumn = original.column;
        lastOriginalName = original.name;
        sourceMappingActive = true;
      } else if (sourceMappingActive) {
        map.addMapping({
          generated: {
            line: generated.line,
            column: generated.column
          }
        });
        lastOriginalSource = null;
        sourceMappingActive = false;
      }
      for (var idx = 0, length = chunk.length; idx < length; idx++) {
        if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
          generated.line++;
          generated.column = 0;
          // Mappings end at eol
          if (idx + 1 === length) {
            lastOriginalSource = null;
            sourceMappingActive = false;
          } else if (sourceMappingActive) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column
              },
              generated: {
                line: generated.line,
                column: generated.column
              },
              name: original.name
            });
          }
        } else {
          generated.column++;
        }
      }
    });
    this.walkSourceContents(function (sourceFile, sourceContent) {
      map.setSourceContent(sourceFile, sourceContent);
    });

    return { code: generated.code, map: map };
  };

  exports.SourceNode = SourceNode;

});

},{"./source-map-generator":134,"./util":136,"amdefine":17}],136:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * This is a helper function for getting values from parameter/options
   * objects.
   *
   * @param args The object we are extracting values from
   * @param name The name of the property we are getting.
   * @param defaultValue An optional value to return if the property is missing
   * from the object. If this is not specified and the property is missing, an
   * error will be thrown.
   */
  function getArg(aArgs, aName, aDefaultValue) {
    if (aName in aArgs) {
      return aArgs[aName];
    } else if (arguments.length === 3) {
      return aDefaultValue;
    } else {
      throw new Error('"' + aName + '" is a required argument.');
    }
  }
  exports.getArg = getArg;

  var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
  var dataUrlRegexp = /^data:.+\,.+$/;

  function urlParse(aUrl) {
    var match = aUrl.match(urlRegexp);
    if (!match) {
      return null;
    }
    return {
      scheme: match[1],
      auth: match[2],
      host: match[3],
      port: match[4],
      path: match[5]
    };
  }
  exports.urlParse = urlParse;

  function urlGenerate(aParsedUrl) {
    var url = '';
    if (aParsedUrl.scheme) {
      url += aParsedUrl.scheme + ':';
    }
    url += '//';
    if (aParsedUrl.auth) {
      url += aParsedUrl.auth + '@';
    }
    if (aParsedUrl.host) {
      url += aParsedUrl.host;
    }
    if (aParsedUrl.port) {
      url += ":" + aParsedUrl.port
    }
    if (aParsedUrl.path) {
      url += aParsedUrl.path;
    }
    return url;
  }
  exports.urlGenerate = urlGenerate;

  /**
   * Normalizes a path, or the path portion of a URL:
   *
   * - Replaces consequtive slashes with one slash.
   * - Removes unnecessary '.' parts.
   * - Removes unnecessary '<dir>/..' parts.
   *
   * Based on code in the Node.js 'path' core module.
   *
   * @param aPath The path or url to normalize.
   */
  function normalize(aPath) {
    var path = aPath;
    var url = urlParse(aPath);
    if (url) {
      if (!url.path) {
        return aPath;
      }
      path = url.path;
    }
    var isAbsolute = (path.charAt(0) === '/');

    var parts = path.split(/\/+/);
    for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
      part = parts[i];
      if (part === '.') {
        parts.splice(i, 1);
      } else if (part === '..') {
        up++;
      } else if (up > 0) {
        if (part === '') {
          // The first part is blank if the path is absolute. Trying to go
          // above the root is a no-op. Therefore we can remove all '..' parts
          // directly after the root.
          parts.splice(i + 1, up);
          up = 0;
        } else {
          parts.splice(i, 2);
          up--;
        }
      }
    }
    path = parts.join('/');

    if (path === '') {
      path = isAbsolute ? '/' : '.';
    }

    if (url) {
      url.path = path;
      return urlGenerate(url);
    }
    return path;
  }
  exports.normalize = normalize;

  /**
   * Joins two paths/URLs.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be joined with the root.
   *
   * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
   *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
   *   first.
   * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
   *   is updated with the result and aRoot is returned. Otherwise the result
   *   is returned.
   *   - If aPath is absolute, the result is aPath.
   *   - Otherwise the two paths are joined with a slash.
   * - Joining for example 'http://' and 'www.example.com' is also supported.
   */
  function join(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }
    if (aPath === "") {
      aPath = ".";
    }
    var aPathUrl = urlParse(aPath);
    var aRootUrl = urlParse(aRoot);
    if (aRootUrl) {
      aRoot = aRootUrl.path || '/';
    }

    // `join(foo, '//www.example.org')`
    if (aPathUrl && !aPathUrl.scheme) {
      if (aRootUrl) {
        aPathUrl.scheme = aRootUrl.scheme;
      }
      return urlGenerate(aPathUrl);
    }

    if (aPathUrl || aPath.match(dataUrlRegexp)) {
      return aPath;
    }

    // `join('http://', 'www.example.com')`
    if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
      aRootUrl.host = aPath;
      return urlGenerate(aRootUrl);
    }

    var joined = aPath.charAt(0) === '/'
      ? aPath
      : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

    if (aRootUrl) {
      aRootUrl.path = joined;
      return urlGenerate(aRootUrl);
    }
    return joined;
  }
  exports.join = join;

  /**
   * Make a path relative to a URL or another path.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be made relative to aRoot.
   */
  function relative(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }

    aRoot = aRoot.replace(/\/$/, '');

    // It is possible for the path to be above the root. In this case, simply
    // checking whether the root is a prefix of the path won't work. Instead, we
    // need to remove components from the root one by one, until either we find
    // a prefix that fits, or we run out of components to remove.
    var level = 0;
    while (aPath.indexOf(aRoot + '/') !== 0) {
      var index = aRoot.lastIndexOf("/");
      if (index < 0) {
        return aPath;
      }

      // If the only part of the root that is left is the scheme (i.e. http://,
      // file:///, etc.), one or more slashes (/), or simply nothing at all, we
      // have exhausted all components, so the path is not relative to the root.
      aRoot = aRoot.slice(0, index);
      if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
        return aPath;
      }

      ++level;
    }

    // Make sure we add a "../" for each component we removed from the root.
    return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
  }
  exports.relative = relative;

  /**
   * Because behavior goes wacky when you set `__proto__` on objects, we
   * have to prefix all the strings in our set with an arbitrary character.
   *
   * See https://github.com/mozilla/source-map/pull/31 and
   * https://github.com/mozilla/source-map/issues/30
   *
   * @param String aStr
   */
  function toSetString(aStr) {
    return '$' + aStr;
  }
  exports.toSetString = toSetString;

  function fromSetString(aStr) {
    return aStr.substr(1);
  }
  exports.fromSetString = fromSetString;

  /**
   * Comparator between two mappings where the original positions are compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same original source/line/column, but different generated
   * line and column the same. Useful when searching for a mapping with a
   * stubbed out mapping.
   */
  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
    var cmp = mappingA.source - mappingB.source;
    if (cmp !== 0) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp !== 0) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp !== 0 || onlyCompareOriginal) {
      return cmp;
    }

    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp !== 0) {
      return cmp;
    }

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp !== 0) {
      return cmp;
    }

    return mappingA.name - mappingB.name;
  };
  exports.compareByOriginalPositions = compareByOriginalPositions;

  /**
   * Comparator between two mappings with deflated source and name indices where
   * the generated positions are compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same generated line and column, but different
   * source/name/original line and column the same. Useful when searching for a
   * mapping with a stubbed out mapping.
   */
  function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
    var cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp !== 0) {
      return cmp;
    }

    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp !== 0 || onlyCompareGenerated) {
      return cmp;
    }

    cmp = mappingA.source - mappingB.source;
    if (cmp !== 0) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp !== 0) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp !== 0) {
      return cmp;
    }

    return mappingA.name - mappingB.name;
  };
  exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

  function strcmp(aStr1, aStr2) {
    if (aStr1 === aStr2) {
      return 0;
    }

    if (aStr1 > aStr2) {
      return 1;
    }

    return -1;
  }

  /**
   * Comparator between two mappings with inflated source and name strings where
   * the generated positions are compared.
   */
  function compareByGeneratedPositionsInflated(mappingA, mappingB) {
    var cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp !== 0) {
      return cmp;
    }

    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp !== 0) {
      return cmp;
    }

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp !== 0) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp !== 0) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp !== 0) {
      return cmp;
    }

    return strcmp(mappingA.name, mappingB.name);
  };
  exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

});

},{"amdefine":17}],137:[function(require,module,exports){
"use strict";

/**
 *
 * THis service is to handle admin requests
 *
 */

var adminService = function adminService() {

    var bookmarks = [],
        favourites = [];

    return {
        getBookmarks: function getBookmarks() {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve(bookmarks);
                }, 200);
            });
        },
        getFavourites: function getFavourites() {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve(favourites);
                }, 200);
            });
        },
        setBookmark: function setBookmark(id) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    if (bookmarks.indexOf(id) === -1) bookmarks.push(id);
                    resolve(bookmarks);
                }, 200);
            });
        },
        setFavourite: function setFavourite(id) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    if (favourites.indexOf(id) === -1) favourites.push(id);
                    resolve(favourites);
                }, 200);
            });
        },
        removeBookmark: function removeBookmark(id) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    var index = bookmarks.indexOf(id);
                    if (index !== -1) bookmarks.splice(index, 1);
                    resolve(bookmarks);
                }, 200);
            });
        },
        removeFavourite: function removeFavourite(id) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    var index = favourites.indexOf(id);
                    if (index !== -1) favourites.splice(index, 1);
                    resolve(favourites);
                }, 200);
            });
        }
    };
};

module.exports = adminService;

},{}],138:[function(require,module,exports){
"use strict";

/**
 *
 * This service is to format data
 *
 */

var formatListingData = function formatListingData() {
    return {
        mapAvailabilityDays: function mapAvailabilityDays(applications) {
            return applications.map(function (application) {
                application.availableOnDays = Object.keys(application.availability).filter(function (key) {
                    return application.availability[key] !== 0;
                });

                return application;
            });
        },
        mapBookmarkFlags: function mapBookmarkFlags(applications, bookmarks) {
            return applications.map(function (application) {
                if (bookmarks.indexOf(application.id) !== -1) application.isBookmarked = true;else application.isBookmarked = false;
                return application;
            });
        },
        mapFavouriteFlags: function mapFavouriteFlags(applications, favourites) {
            return applications.map(function (application) {
                if (favourites.indexOf(application.id) !== -1) application.isInFavourites = true;else application.isInFavourites = false;
                return application;
            });
        },
        mapAllData: function mapAllData(applications, bookmarks, favourites) {
            return applications.map(function (application) {
                application.availableOnDays = Object.keys(application.availability).filter(function (key) {
                    return application.availability[key] !== 0;
                });

                if (bookmarks.indexOf(application.id) !== -1) application.isBookmarked = true;else application.isBookmarked = false;

                if (favourites.indexOf(application.id) !== -1) application.isInFavourites = true;else application.isInFavourites = false;

                return application;
            });
        }
    };
};

module.exports = formatListingData;

},{}],139:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 *
 * Building Job Application Portal to Review Everything
 *
 */

var getFakeJson = require('../utils/fake-json'),
    appData = JSON.parse(getFakeJson());

var errorService = function errorService() {
    var errorMappings = {
        4000: {
            code: 4000,
            message: 'Cannot map the error'
        },

        4001: {
            code: 4001,
            message: 'Application filter method requires @param filters as a {Array}'
        },

        4003: {
            code: 4003,
            message: 'Application getDetail method requires @param id as a {string}'
        }
    };

    return {
        sendError: function sendError(code) {
            if (errorMappings.hasOwnProperty(code)) return errorMappings[code];
            return errorMappings['4000'];
        }
    };
};

/**
 * jobPortalFactory
 * @return {object} CRUD Methods
 */

var jobPortalFactory = function jobPortalFactory() {
    var sendErrorService = errorService().sendError,
        results = appData;

    var utils = {
        onlyUnique: function onlyUnique(value, index, instance) {
            return instance.indexOf(value) === index;
        },
        sortText: function sortText(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        },
        sortAppliedOn: function sortAppliedOn(a, b) {
            return new Date(a.applied) - new Date(b.applied);
        },
        sortIntegers: function sortIntegers(a, b) {
            return parseInt(a) - parseInt(b);
        }
    };

    return {
        getSearchFacets: function getSearchFacets(searchResults) {
            return {
                positions: searchResults.map(function (result) {
                    return result.position;
                }).filter(utils.onlyUnique).sort(utils.sortText),
                experience: searchResults.map(function (result) {
                    return result.experience;
                }).filter(utils.onlyUnique).sort(utils.sortIntegers)
            };
        },
        getApplications: function getApplications(filters, sortCriteria) {
            var self = this;
            return new Promise(function (resolve, reject) {

                if (!Array.isArray(filters)) return reject({ error: sendErrorService(4001) });

                var filterCriteria = filters.reduce(function (acc, curr) {
                    if (curr.type === 'position') acc.position = curr.value;
                    if (curr.type === 'experience') acc.experience = curr.value;
                    if (curr.type === 'availability') acc.availability = curr.value;
                    return acc;
                }, {});

                function filterOnFacet(facet) {
                    return function (result) {
                        if (facet === 'availability' && filterCriteria.availability) {
                            return result.availability.hasOwnProperty(filterCriteria.availability) && result.availability[filterCriteria.availability] !== 0;
                        } else if (filterCriteria[facet]) {
                            return result[facet] === filterCriteria[facet];
                        } else {
                            return result;
                        }
                    };
                }

                var filteredResults = results.filter(filterOnFacet('position')).filter(filterOnFacet('experience')).filter(filterOnFacet('availability'));

                var sortedResults = filteredResults;

                if ((typeof sortCriteria === 'undefined' ? 'undefined' : _typeof(sortCriteria)) === 'object') {
                    if (sortCriteria.on === 'appliedOn') sortedResults = sortedResults.sort(function (a, b) {
                        return new Date(a.applied) - new Date(b.applied);
                    });
                    if (sortCriteria.on === 'experience') sortedResults = sortedResults.sort(function (a, b) {
                        return parseInt(a.experience) - parseInt(b.experience);
                    });
                    if (sortCriteria.on === 'name') sortedResults = sortedResults.sort(function (a, b) {
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    });
                    if (sortCriteria.on === 'position') sortedResults = sortedResults.sort(function (a, b) {
                        return a.position.toLowerCase().localeCompare(b.position.toLowerCase());
                    });
                    if (sortCriteria.type === 'desc') sortedResults = sortedResults.reverse();
                }

                resolve({
                    results: sortedResults,
                    facets: self.getSearchFacets(filteredResults)
                });
            });
        },
        getApplicationDetail: function getApplicationDetail(id) {
            return new Promise(function (resolve, reject) {
                if (typeof id !== 'string') return reject({ error: sendErrorService(4003) });
                resolve(results.find(function (result) {
                    return result.id === id;
                }));
            });
        }
    };
};

module.exports = jobPortalFactory;

},{"../utils/fake-json":141}],140:[function(require,module,exports){
var css = "* {\n  box-sizing: border-box;\n}\n.grid {\n  display: flex;\n  flex-flow: row wrap;\n  justify-content: inherit;\n  align-items: flex-start;\n  width: 100% !important;\n  padding: 0;\n}\n[class*='desktop-'],\n[class*='tablet-'],\n[class*='phone-'] {\n  margin: 0 0.5% 10px 0.5%;\n}\n.no-gutters [class*='desktop-'],\n.no-gutters [class*='tablet-'],\n.no-gutters [class*='phone-'] {\n  margin: 0 0 10px 0;\n}\n.relaxed-gutters [class*='desktop-'],\n.relaxed-gutters [class*='tablet-'],\n.relaxed-gutters [class*='phone-'] {\n  margin: 0 1% 10px 1%;\n}\n@media (min-width: 991px) {\n  .hidden-desktop {\n    display: none;\n  }\n  .desktop-one {\n    flex-basis: 7.33333333%;\n  }\n  .desktop-two {\n    flex-basis: 15.66666667%;\n  }\n  .desktop-three {\n    flex-basis: 24%;\n  }\n  .desktop-four {\n    flex-basis: 32.33333333%;\n  }\n  .desktop-five {\n    flex-basis: 40.66666667%;\n  }\n  .desktop-six {\n    flex-basis: 49%;\n  }\n  .desktop-seven {\n    flex-basis: 57.33333333%;\n  }\n  .desktop-eight {\n    flex-basis: 65.66666667%;\n  }\n  .desktop-nine {\n    flex-basis: 74%;\n  }\n  .desktop-ten {\n    flex-basis: 82.33333333%;\n  }\n  .desktop-eleven {\n    flex-basis: 90.66666667%;\n  }\n  .desktop-twelve {\n    flex-basis: 99%;\n  }\n  .no-gutters .desktop-one {\n    flex-basis: 8.33333333%;\n  }\n  .no-gutters .desktop-two {\n    flex-basis: 16.66666667%;\n  }\n  .no-gutters .desktop-three {\n    flex-basis: 25%;\n  }\n  .no-gutters .desktop-four {\n    flex-basis: 33.33333333%;\n  }\n  .no-gutters .desktop-five {\n    flex-basis: 41.66666667%;\n  }\n  .no-gutters .desktop-six {\n    flex-basis: 50%;\n  }\n  .no-gutters .desktop-seven {\n    flex-basis: 58.33333333%;\n  }\n  .no-gutters .desktop-eight {\n    flex-basis: 66.66666667%;\n  }\n  .no-gutters .desktop-nine {\n    flex-basis: 75%;\n  }\n  .no-gutters .desktop-ten {\n    flex-basis: 83.33333333%;\n  }\n  .no-gutters .desktop-eleven {\n    flex-basis: 91.66666667%;\n  }\n  .no-gutters .desktop-twelve {\n    flex-basis: 100%;\n  }\n  .relaxed-gutters .desktop-one {\n    flex-basis: 6.33333333%;\n  }\n  .relaxed-gutters .desktop-two {\n    flex-basis: 14.66666667%;\n  }\n  .relaxed-gutters .desktop-three {\n    flex-basis: 23%;\n  }\n  .relaxed-gutters .desktop-four {\n    flex-basis: 31.33333333%;\n  }\n  .relaxed-gutters .desktop-five {\n    flex-basis: 39.66666667%;\n  }\n  .relaxed-gutters .desktop-six {\n    flex-basis: 48%;\n  }\n  .relaxed-gutters .desktop-seven {\n    flex-basis: 56.33333333%;\n  }\n  .relaxed-gutters .desktop-eight {\n    flex-basis: 64.66666667%;\n  }\n  .relaxed-gutters .desktop-nine {\n    flex-basis: 73%;\n  }\n  .relaxed-gutters .desktop-ten {\n    flex-basis: 81.33333333%;\n  }\n  .relaxed-gutters .desktop-eleven {\n    flex-basis: 89.66666667%;\n  }\n  .relaxed-gutters .desktop-twelve {\n    flex-basis: 98%;\n  }\n}\n@media (max-width: 991px) {\n  .hidden-tablet {\n    display: none;\n  }\n  .tablet-one {\n    flex-basis: 7.33333333%;\n  }\n  .tablet-two {\n    flex-basis: 15.66666667%;\n  }\n  .tablet-three {\n    flex-basis: 24%;\n  }\n  .tablet-four {\n    flex-basis: 32.33333333%;\n  }\n  .tablet-five {\n    flex-basis: 40.66666667%;\n  }\n  .tablet-six {\n    flex-basis: 49%;\n  }\n  .tablet-seven {\n    flex-basis: 57.33333333%;\n  }\n  .tablet-eight {\n    flex-basis: 65.66666667%;\n  }\n  .tablet-nine {\n    flex-basis: 74%;\n  }\n  .tablet-ten {\n    flex-basis: 82.33333333%;\n  }\n  .tablet-eleven {\n    flex-basis: 90.66666667%;\n  }\n  .tablet-twelve {\n    flex-basis: 99%;\n  }\n  .no-gutters .tablet-one {\n    flex-basis: 8.33333333%;\n  }\n  .no-gutters .tablet-two {\n    flex-basis: 16.66666667%;\n  }\n  .no-gutters .tablet-three {\n    flex-basis: 25%;\n  }\n  .no-gutters .tablet-four {\n    flex-basis: 33.33333333%;\n  }\n  .no-gutters .tablet-five {\n    flex-basis: 41.66666667%;\n  }\n  .no-gutters .tablet-six {\n    flex-basis: 50%;\n  }\n  .no-gutters .tablet-seven {\n    flex-basis: 58.33333333%;\n  }\n  .no-gutters .tablet-eight {\n    flex-basis: 66.66666667%;\n  }\n  .no-gutters .tablet-nine {\n    flex-basis: 75%;\n  }\n  .no-gutters .tablet-ten {\n    flex-basis: 83.33333333%;\n  }\n  .no-gutters .tablet-eleven {\n    flex-basis: 91.66666667%;\n  }\n  .no-gutters .tablet-twelve {\n    flex-basis: 100%;\n  }\n  .relaxed-gutters .tablet-one {\n    flex-basis: 6.33333333%;\n  }\n  .relaxed-gutters .tablet-two {\n    flex-basis: 14.66666667%;\n  }\n  .relaxed-gutters .tablet-three {\n    flex-basis: 23%;\n  }\n  .relaxed-gutters .tablet-four {\n    flex-basis: 31.33333333%;\n  }\n  .relaxed-gutters .tablet-five {\n    flex-basis: 39.66666667%;\n  }\n  .relaxed-gutters .tablet-six {\n    flex-basis: 48%;\n  }\n  .relaxed-gutters .tablet-seven {\n    flex-basis: 56.33333333%;\n  }\n  .relaxed-gutters .tablet-eight {\n    flex-basis: 64.66666667%;\n  }\n  .relaxed-gutters .tablet-nine {\n    flex-basis: 73%;\n  }\n  .relaxed-gutters .tablet-ten {\n    flex-basis: 81.33333333%;\n  }\n  .relaxed-gutters .tablet-eleven {\n    flex-basis: 89.66666667%;\n  }\n  .relaxed-gutters .tablet-twelve {\n    flex-basis: 98%;\n  }\n}\n@media (max-width: 661px) {\n  .hidden-phone {\n    display: none;\n  }\n  .phone-one {\n    flex-basis: 7.33333333%;\n  }\n  .phone-two {\n    flex-basis: 15.66666667%;\n  }\n  .phone-three {\n    flex-basis: 24%;\n  }\n  .phone-four {\n    flex-basis: 32.33333333%;\n  }\n  .phone-five {\n    flex-basis: 40.66666667%;\n  }\n  .phone-six {\n    flex-basis: 49%;\n  }\n  .phone-seven {\n    flex-basis: 57.33333333%;\n  }\n  .phone-eight {\n    flex-basis: 65.66666667%;\n  }\n  .phone-nine {\n    flex-basis: 74%;\n  }\n  .phone-ten {\n    flex-basis: 82.33333333%;\n  }\n  .phone-eleven {\n    flex-basis: 90.66666667%;\n  }\n  .phone-twelve {\n    flex-basis: 99%;\n  }\n  .no-gutters .phone-one {\n    flex-basis: 8.33333333%;\n  }\n  .no-gutters .phone-two {\n    flex-basis: 16.66666667%;\n  }\n  .no-gutters .phone-three {\n    flex-basis: 25%;\n  }\n  .no-gutters .phone-four {\n    flex-basis: 33.33333333%;\n  }\n  .no-gutters .phone-five {\n    flex-basis: 41.66666667%;\n  }\n  .no-gutters .phone-six {\n    flex-basis: 50%;\n  }\n  .no-gutters .phone-seven {\n    flex-basis: 58.33333333%;\n  }\n  .no-gutters .phone-eight {\n    flex-basis: 66.66666667%;\n  }\n  .no-gutters .phone-nine {\n    flex-basis: 75%;\n  }\n  .no-gutters .phone-ten {\n    flex-basis: 83.33333333%;\n  }\n  .no-gutters .phone-eleven {\n    flex-basis: 91.66666667%;\n  }\n  .no-gutters .phone-twelve {\n    flex-basis: 100%;\n  }\n  .relaxed-gutters .phone-one {\n    flex-basis: 6.33333333%;\n  }\n  .relaxed-gutters .phone-two {\n    flex-basis: 14.66666667%;\n  }\n  .relaxed-gutters .phone-three {\n    flex-basis: 23%;\n  }\n  .relaxed-gutters .phone-four {\n    flex-basis: 31.33333333%;\n  }\n  .relaxed-gutters .phone-five {\n    flex-basis: 39.66666667%;\n  }\n  .relaxed-gutters .phone-six {\n    flex-basis: 48%;\n  }\n  .relaxed-gutters .phone-seven {\n    flex-basis: 56.33333333%;\n  }\n  .relaxed-gutters .phone-eight {\n    flex-basis: 64.66666667%;\n  }\n  .relaxed-gutters .phone-nine {\n    flex-basis: 73%;\n  }\n  .relaxed-gutters .phone-ten {\n    flex-basis: 81.33333333%;\n  }\n  .relaxed-gutters .phone-eleven {\n    flex-basis: 89.66666667%;\n  }\n  .relaxed-gutters .phone-twelve {\n    flex-basis: 98%;\n  }\n}\n.center {\n  justify-content: center !important;\n}\n.skeleton {\n  height: 25px;\n  width: 80%;\n  background-color: rgba(0, 0, 0, 0.15);\n  display: block;\n  margin: 27px auto;\n}\n.sky-blue {\n  background: #92AFD7;\n}\n.dark-blue {\n  background: #5A7684;\n}\n.nav {\n  position: fixed;\n  display: flex;\n  left: 0;\n  top: 0;\n  width: 100%;\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.12);\n  background: #fff;\n  z-index: 1020;\n  padding: 10px 20px 10px 20px;\n}\n.nav .nav-item {\n  padding: 0 10px 0 10px;\n}\n.nav .nav-item .link {\n  line-height: 23px;\n  padding-bottom: 12px;\n  color: #404040;\n  font-size: 14px;\n}\n.nav .nav-item .link:hover {\n  color: #0CAA41;\n  border-bottom: 3px solid #0CAA41;\n}\n.nav .nav-item .active {\n  border-bottom: 3px solid #0CAA41;\n}\n.nav .logo {\n  color: #0CAA41;\n  font-size: 1.2rem;\n  font-weight: bold;\n  padding-right: 20px;\n}\n.listings {\n  margin-top: 80px;\n}\n.listings p,\n.listings h2,\n.listings h3,\n.listings h5 {\n  color: #404040;\n}\n.listings h2 {\n  letter-spacing: 6px;\n  font-weight: 500;\n  color: #0CAA41;\n  font-size: 1.2em;\n}\n.listings .card {\n  min-height: 400px;\n  padding: 10px 20px 10px 20px;\n  margin-bottom: 20px;\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.12);\n  border-radius: 3px;\n  background: #fff;\n}\n.listings .card-header {\n  margin-bottom: 16px;\n  border-bottom: 1px solid #DEDEDE;\n}\n.listings .card-header h3 {\n  font-size: 1rem;\n  line-height: 1;\n}\n.listings .job-application {\n  border-bottom: 1px solid #c2c2c2;\n  padding: 10px;\n}\n.listings .job-application:last-child {\n  border-bottom: none;\n}\n.listings .job-application a {\n  color: #1861bf;\n  font-weight: bold;\n}\n.listings .job-application p {\n  line-height: 0;\n}\n.listings .job-application .applied-at {\n  font-size: 0.9em;\n}\n@media (min-width: 991px) {\n  .listings .job-application .applied-at {\n    float: right;\n    margin-top: -41px;\n  }\n}\n@media (max-width: 991px) {\n  .listings .job-application .applied-at {\n    line-height: 1;\n  }\n}\n.listings .job-application .info {\n  font-size: 0.85em;\n  margin-right: 10px;\n}\n.listings .job-application .availability p,\n.listings .job-application .availability .day-tags {\n  font-size: 0.85em;\n  display: inline-block;\n  float: left;\n}\n.listings .job-application .availability .day-tags {\n  margin: 3px 0 0 5px;\n}\n.listings .job-application .availability .day-tags .tag {\n  font-size: 0.65em;\n  padding: 6px;\n  font-weight: bold;\n  margin: 0 5px 0 5px;\n  color: white;\n  background: #0CAA41;\n}\n.listings .job-application .controls {\n  font-size: 1.5rem;\n}\n@media (min-width: 991px) {\n  .listings .job-application .controls {\n    float: right;\n    margin-top: -31px;\n  }\n}\n.listings .job-application .controls i {\n  margin-right: 15px;\n  cursor: pointer;\n  color: #0CAA41;\n}\n.listings .job-application .controls i:last-child {\n  margin-right: 0px;\n}\n.listings .job-application .controls .remove-btn {\n  font-weight: 400;\n  font-size: 0.7em;\n}\n.listings .sidebar {\n  min-height: 400px;\n  padding: 10px 20px 10px 20px;\n  margin-bottom: 20px;\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.12);\n  border-radius: 3px;\n  background: #fff;\n  min-height: 270px;\n}\n.listings .sidebar .facet {\n  margin: 10px 0 10px 0;\n}\n.listings .sidebar .facet p {\n  font-size: 0.8rem;\n  vertical-align: middle;\n  margin-top: 10px;\n}\n.listings .sidebar .facet .select-box {\n  background-color: #fff;\n  color: #000;\n  padding: 10px;\n  font-size: 1em;\n  align-self: center;\n  width: 100%;\n  font-size: 0.8rem;\n  padding: 8px;\n}\n.listings .sidebar .searh-tag {\n  padding: 10px;\n  margin-bottom: 10px;\n  font-size: 0.8rem;\n  border-radius: 3px;\n  background: #0CAA41;\n  color: white;\n  font-weight: bold;\n  cursor: pointer;\n}\n.listings .sidebar .searh-tag i {\n  float: right;\n  margin-top: -13px;\n}\n.listings .sidebar .sort-control i {\n  cursor: pointer;\n  margin-top: 9px;\n}\n.app-sort {\n  margin: 10px 0 10px 0;\n}\n.app-sort p {\n  font-size: 0.8rem;\n  vertical-align: middle;\n  margin-top: 10px;\n}\n.app-sort .select-box {\n  background-color: #fff;\n  color: #000;\n  padding: 10px;\n  font-size: 1em;\n  align-self: center;\n  width: 100%;\n  font-size: 0.8rem;\n  padding: 8px;\n}\n.application-detail-modal {\n  border-bottom: 1px solid #c2c2c2;\n  padding: 10px;\n  padding-top: 5px;\n}\n.application-detail-modal:last-child {\n  border-bottom: none;\n}\n.application-detail-modal a {\n  color: #1861bf;\n  font-weight: bold;\n}\n.application-detail-modal p {\n  line-height: 0;\n}\n.application-detail-modal .applied-at {\n  font-size: 0.9em;\n}\n@media (min-width: 991px) {\n  .application-detail-modal .applied-at {\n    float: right;\n    margin-top: -41px;\n  }\n}\n@media (max-width: 991px) {\n  .application-detail-modal .applied-at {\n    line-height: 1;\n  }\n}\n.application-detail-modal .info {\n  font-size: 0.85em;\n  margin-right: 10px;\n}\n.application-detail-modal .availability p,\n.application-detail-modal .availability .day-tags {\n  font-size: 0.85em;\n  display: inline-block;\n  float: left;\n}\n.application-detail-modal .availability .day-tags {\n  margin: 3px 0 0 5px;\n}\n.application-detail-modal .availability .day-tags .tag {\n  font-size: 0.65em;\n  padding: 6px;\n  font-weight: bold;\n  margin: 0 5px 0 5px;\n  color: white;\n  background: #0CAA41;\n}\n.application-detail-modal .controls {\n  font-size: 1.5rem;\n}\n@media (min-width: 991px) {\n  .application-detail-modal .controls {\n    float: right;\n    margin-top: -31px;\n  }\n}\n.application-detail-modal .controls i {\n  margin-right: 15px;\n  cursor: pointer;\n  color: #0CAA41;\n}\n.application-detail-modal .controls i:last-child {\n  margin-right: 0px;\n}\n.application-detail-modal .controls .remove-btn {\n  font-weight: 400;\n  font-size: 0.7em;\n}\n.application-detail-modal .question {\n  margin: 15px 0 15px 0;\n  border: 1px solid #9c9c9c;\n  border-radius: 3px;\n  font-size: 0.83rem;\n  padding: 5px;\n  background: #e6e6e6;\n}\n.application-detail-modal .question p {\n  letter-spacing: 0.1em;\n  color: #212121;\n}\nbody {\n  font-family: 'Lato', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-size: 16px;\n  background: #F0F0F0;\n}\nbody a {\n  cursor: pointer;\n  text-decoration: none;\n}\n.container {\n  padding: 10px 20px 10px 20px;\n}\n@media (max-width: 991px) {\n  .container {\n    padding: 10px 0 10px 0;\n  }\n}\n.dropdown {\n  background-color: #fff;\n  color: #000;\n  padding: 10px;\n  font-size: 1em;\n  align-self: center;\n  width: 100%;\n}\n.headings {\n  letter-spacing: 6px;\n  font-weight: 500;\n  color: #0CAA41;\n}\nh1.title {\n  letter-spacing: 6px;\n  font-weight: 500;\n  color: #0CAA41;\n  text-transform: uppercase;\n  font-size: 1.4em;\n}\n.center {\n  justify-content: center;\n}\n.overlay {\n  display: block;\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 2000;\n  background-color: rgba(0, 0, 0, 0.5);\n}\n.modal {\n  display: block;\n  width: 60%;\n  height: 80%;\n  border-radius: 5px;\n  background: #fff;\n  box-shadow: 5px 5px 5px 0px rgba(0, 0, 0, 0.75);\n  overflow: auto;\n  margin: auto;\n  position: fixed;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  z-index: 3000;\n}\n@media (max-width: 700px) {\n  .modal {\n    width: 90%;\n  }\n}\n";(require('lessify'))(css); module.exports = css;
},{"lessify":54}],141:[function(require,module,exports){
'use strict';

/**
 *
 * Returns fake json
 * Intent is to genereate large json data randomly
 *
 */

var fakeJson = require('dummy-json');

function getJson() {
    var helpers = {
        position: function position() {
            return fakeJson.utils.randomArrayItem(['Server', 'Cook', 'Engineer', 'Painter', 'Front-End Engineer', 'Back-End Engineer', 'Api Developer']);
        },
        answer: function answer() {
            return fakeJson.utils.randomArrayItem(['Yes', 'No']);
        }
    };

    var partials = {
        availability: '{\
            "M": {{int 0 2}},\
            "T": {{int 0 2}},\
            "W": {{int 0 2}},\
            "Th": {{int 0 2}},\
            "F": {{int 0 2}},\
            "S": {{int 0 2}},\
            "Su": {{int 0 2}}\
        }'
    };

    var tpl = '[\n        {{#repeat 100}}\n            {\n                "id": "{{@index}}",\n                "name": "{{firstName}} {{lastName}}",\n                "position": "{{position}}",\n                "applied": "{{date \'2015\' \'2017\' \'MM/DD/YYYY\'}}",\n                "experience": "{{int 1 20}}",\n                "availability": {{> availability}},\n                "questions": [\n                    {\n                        "text": "Are you authorized to work in the United States?",\n                        "answer": "{{answer}}"\n                    },\n                    {\n                        "text": "Have you ever been convicted of a felony?",\n                        "answer": "{{answer}}"\n                    }\n                ]\n            }\n        {{/repeat}}\n    ]';

    return fakeJson.parse(tpl, { helpers: helpers, partials: partials });
};

module.exports = getJson;

},{"dummy-json":19}]},{},[16]);
