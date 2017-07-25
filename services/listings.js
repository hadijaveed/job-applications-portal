/**
 *
 * Building Job Application Portal to Review Everything
 *
 */

const getFakeJson = require('../utils/fake-json'),
    appData = JSON.parse(getFakeJson());


const errorService = function() {
    const errorMappings = {
        4000: {
            code: 4000,
            message: 'Cannot map the error'
        },

        4001: {
            code: 4001,
            message: 'Application filter method requires @param filters as a {Array}'
        },

        4002: {
            code: 4002,
            message: 'Application sort method requires @param criteria as a {string}'
        },

        4003: {
            code: 4002,
            message: 'Application getDetail method requires @param id as a {number}'
        }
    };

    return {
        sendError(code) {
            if (errorMappings.hasOwnProperty(code)) return errorMappings[code];
            return errorMappings['4000'];
        }
    };
};

/**
 * jobPortalFactory
 * @return {object} CRUD Methods
 */

const jobPortalFactory = function() {
    let sendErrorService = errorService().sendError,
        results = appData;

    let utils = {
        onlyUnique(value, index, instance) {
            return instance.indexOf(value) === index;
        },

        sortText(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        },

        sortIntegers(a, b) {
            return parseInt(a) - parseInt(b);
        }
    };

    return {

        getSearchFacets(searchResults) {
            return {
                positions: searchResults.map(result => result.position).filter(utils.onlyUnique).sort(utils.sortText),
                experience: searchResults.map(result => result.experience).filter(utils.onlyUnique).sort(utils.sortIntegers)
            };
        },

        getApplications(filters) {
            let self = this;
            return new Promise((resolve, reject) => {

                if (!Array.isArray(filters)) return reject({ error: sendErrorService(4001) });

                let filterCriteria = filters.reduce((acc, curr) => {
                    if (curr.type === 'position') acc.position = curr.value;
                    if (curr.type === 'experience') acc.experience = curr.value;
                    if (curr.type === 'availability') acc.availability = curr.value;
                    return acc;
                }, {});


                function filterOnFacet(facet) {
                    return function(result) {
                        if (facet === 'availability' && filterCriteria.availability) {
                            return (
                                result.availability.hasOwnProperty(filterCriteria.availability) &&
                                result.availability[filterCriteria.availability] !== 0
                            );
                        } else if (filterCriteria[facet]) {
                            return result[facet] === filterCriteria[facet];
                        } else {
                            return result;
                        }
                    };
                }

                let filteredResults = results
                    .filter(filterOnFacet('position'))
                    .filter(filterOnFacet('experience'))
                    .filter(filterOnFacet('availability'));

                resolve({
                    results: filteredResults,
                    facets: self.getSearchFacets(filteredResults)
                });

            });
        },


        getApplicationDetail(id) {
            return new Promise((resolve, reject) => {
                if (typeof id !== 'string') return reject({ error: sendErrorService(4001) });
            });
        }

    };
};

module.exports = jobPortalFactory;
