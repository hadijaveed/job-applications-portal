/**
 *
 * Filter SIdebar COmponet
 *
 */

const Ractive = require('ractive');


module.exports = Ractive.extend({
    isolated: true,
    template: require('./sidebar.html'),

    onrender() {

        this.on({
            changeLink(e) {

            }
        });

    }
});
