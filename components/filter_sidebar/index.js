/**
 *
 * Filter SIdebar COmponet
 *
 */

const Ractive = require('ractive');

module.exports = Ractive.extend({
    isolated: true,
    template: require('./sidebar.html'),
    showAvailaBility() {
        let { filterCriteria } = this.get();
        if (typeof filterCriteria === 'undefined') return true;
        let filtered = filterCriteria.find(criteria => criteria.type === 'availability');
        return (!filtered || typeof filtered === 'undefined');
    },

    onrender() {

        this.on({
            removeSearchTag(e) {
                let searhTagId = e.node.getAttribute('data-tag-index'),
                    { removeSearchTag } = this.get();
                removeSearchTag(searhTagId);
            },

            searchApplications(e) {
                let facetType = e.node.getAttribute('data-facet'),
                    facetValue = e.node.value,
                    { searchOnFacet } = this.get();

                if (facetValue !== '') searchOnFacet({ facetValue, facetType });
            },

            sortApplications(e) {
                let { sortCriteria, sortApplications } = this.get();
                sortApplications(sortCriteria);
            },

            chagneSortType(e) {
                let { sortCriteria, sortApplications } = this.get();
                sortCriteria.type = e.node.getAttribute('data-type');
                sortApplications(sortCriteria);
            }
        });

    }
});
