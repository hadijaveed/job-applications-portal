/**
 *
 * Filter SIdebar COmponet
 *
 */

const Ractive = require('ractive');


module.exports = Ractive.extend({
    isolated: true,
    template: require('./sidebar.html'),
    // showAvailaBility() {
    //     let { filterCriteria } = this.get();
    //     console.log('see filterCriteria', filterCriteria);
    //     if (typeof filterCriteria === 'undefined') return true;
    //     return (typeof filterCriteria.find({ type: 'availability' } === 'undefined'));
    // },

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
            }
        });

    }
});
