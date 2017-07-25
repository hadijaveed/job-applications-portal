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

            },

            searchApplications(e) {
                let facetType = e.node.getAttribute('data-facet'),
                    facetValue = e.node.value,
                    { searchOnFacet } = this.get();

                if (facetValue !== '') searchOnFacet({ facetValue, facetType });
            }
        });

    }
});
