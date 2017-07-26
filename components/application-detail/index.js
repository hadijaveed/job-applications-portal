/**
 *
 * Application Detail Component
 *
 */

import Ractive from 'ractive';


const appDetailComponent = Ractive.extend({
    isolated: true,
    template: require('./detail_modal.html'),
    isInBookmarks(id) {
        let { bookmarks } = this.get();
        return (bookmarks.indexOf(id) !== -1);
    },

    isInFavourites(id) {
        let { favourites } = this.get();
        return (favourites.indexOf(id) !== -1);
    },

    onrender() {
        let self = this;
        self.on({
            hideModal(e) {
                let { applicationMethods } = self.get();
                applicationMethods.hideDetailModal();
            },

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
});

export default appDetailComponent;
