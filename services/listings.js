/**
 *
 * Building Job Application Portal to Review Everything
 *
 */

const getFakeJson = require('../utils/fake-json'),
    appData = JSON.parse(getFakeJson());

console.log('see json ', JSON.stringify(appData, null, 2));

const errorService = function() {
    const errorMappings = {
        4000: {
            code: 4000,
            message: 'Cannot map the error'
        },

        4001: {
            code: 4001,
            message: 'Application filter method requires @param criteria as a {string}'
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
    let sendErrorService = errorService().sendError;
    return {

        getAllApplications() {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(appData);
                }, 200);
            });
        },

        filterApplications(criteria) {
            return new Promise((resolve, reject) => {
                if (typeof criteria !== 'string') return reject({ error: sendErrorService(4001) });
            });
        },

        sortApplications(criteria) {
            return new Promise((resolve, reject) => {
                if (typeof criteria !== 'string') return reject({ error: sendErrorService(4001) });
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
