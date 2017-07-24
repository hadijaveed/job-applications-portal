/**
 *
 * Nav bar Component
 *
 */

const Ractive = require('ractive');


module.exports = Ractive.extend({
    isolated: true,
    template: require('./tpl.html'),
    data() {
        return {
            navLinks: ['Applications', 'Bookmarks', 'Favourites']
        };
    },


    onrender() {

        this.on({
            changeLink(e) {

            }
        });

    }
});
