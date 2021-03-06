/**
 *
 * Nav bar Component
 *
 */

import Ractive from 'ractive';


const navComponent = Ractive.extend({
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
                this.set('step', e.node.getAttribute('data-link'));
            }
        });
    }
});


export default navComponent;
