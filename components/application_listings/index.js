/**
 *
 * Listings Display Component
 *
 */

const Ractive = require('ractive');


module.exports = Ractive.extend({
    isolated: true,
    template: require('./listings.html'),

    bookmarkApplication(id) {
        console.log('bookmark application called '. id);
    },

    onrender() {
        let self = this;

        self.on({
            applicationEvent(e) {
                e.original.preventDefault();
                let id = e.node.getAttribute('data-id'),
                    action = e.node.getAttribute('data-action'),
                    { applicationMethods } = self.get();

                switch (action) {
                    case 'favouriteApllication':
                        applicationMethods.favouriteApplication(id);
                        break;

                    case 'bookamrkApplication':
                        applicationMethods.bookmarkApplication(id);
                        break;

                    default:
                        console.log('do nothing here ');
                }
            }
        });
    }
});
