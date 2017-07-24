const $ = require('jquery'),
    Ractive = require('ractive'),
    ListingFactory = require('./services/listings')(),
    ListingDataService = require('./services/data-service')(),
    AdminService = require('./services/admin-services')();

require('./styles/index.less');



$(window).on('scroll', () => {

    let viewPortScrolled = $(document).scrollTop(),
        viewPortWidth = $(document).width(),
        sideBarEl = $('.sidebar'),
        sideBarParentWidth = sideBarEl.parent().width();

    if (!viewPortWidth >= 991) return;

    if (viewPortScrolled >= 50) {
        sideBarEl.css({ position: 'fixed', width: sideBarParentWidth });
    } else {
        sideBarParentWidth = sideBarEl.parent().width();
        sideBarEl.css({ position: 'static' });
    }

});


const jobComponent = new Ractive({
    el: '[app-main-mount]',
    template: require('./app.html'),
    components: {
        navBar: require('./components/nav'),
        sidebar: require('./components/filter_sidebar'),
        listings: require('./components/application_listings')
    },

    onrender: RenderCtrl
});

function RenderCtrl() {
    let self = this;

    // get all applications on render
    ListingFactory
        .getAllApplications()
        .then(data => {
            self.set('applications', ListingDataService.mapAvailabilityDays(data));
        })
        .catch(err => {
            console.log('see error on render ', err);
        });

    self.set({
        methods: {

            bookmarkApplication(id) {
                AdminService.setBookmark(id)
                    .then(bookamrks => {
                        console.log('see bookmarks ', bookamrks);
                    })
                    .catch(err => {
                        console.error('Something went wrong ', err);
                    });
            },

            favouriteApplication(id) {
                AdminService.setFavourite(id)
                    .then(favourites => {
                        console.log('see favourites ', favourites);
                    })
                    .catch(err => {
                        console.error('Something went wrong ', err);
                    });
            }
        }
    });

}
