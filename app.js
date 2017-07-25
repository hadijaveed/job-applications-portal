/**
 *
 * Main Dashboard Component
 *
 */

const Ractive = require('ractive'),
    ListingFactory = require('./services/listings')(),
    ListingDataService = require('./services/data-service')(),
    AdminService = require('./services/admin-services')();

// style main file
require('./styles/index.less');


const jobComponent = new Ractive({
    el: '[app-main-mount]',
    template: require('./app.html'),
    data: {
        step: 'Applications',
        sortCriteria: {
            on: 'appliedOn',
            type: 'desc'
        }
    },
    components: {
        navBar: require('./components/nav'),
        sidebar: require('./components/filter_sidebar'),
        listings: require('./components/application_listings'),
        detailModal: require('./components/application-detail')
    },

    setSearchData(filterCriteria) {
        let self = this;

        ListingFactory.getApplications(filterCriteria, self.get('sortCriteria'))
            .then(searchData => {
                self.set({
                    applications: ListingDataService.mapAvailabilityDays(searchData.results),
                    facets: searchData.facets,
                    filterCriteria
                });
            })
            .catch(err => {
                console.error('something went wrong ', err);
            });
    },

    mapBookMarkedApps() {
        let self = this;
        let { bookmarks } = self.get();
        let promises = bookmarks.map(bookmark => ListingFactory.getApplicationDetail(bookmark));
        Promise.all(promises)
            .then((results) => {
                self.set('bookmarkedApps', results);
            });
    },

    mapFavourites() {
        let self = this;
        let { favourites } = self.get();
        let promises = favourites.map(favourite => ListingFactory.getApplicationDetail(favourite));
        Promise.all(promises)
            .then((results) => {
                self.set('favouriteApps', results);
            });
    },

    onrender: RenderCtrl
});

function RenderCtrl() {
    let self = this;

    // get all applications data on render
    let promises = [
        ListingFactory.getApplications([], self.get('sortCriteria')),
        AdminService.getBookmarks(),
        AdminService.getFavourites()
    ];

    Promise.all(promises)
        .then(replies => {
            let searchData, bookmarks, favourites;
            [searchData, bookmarks, favourites] = replies;
            console.log('see search data here ', searchData);
            self.set({
                applications: ListingDataService.mapAvailabilityDays(searchData.results),
                bookmarks,
                favourites,
                filterCriteria: [],
                facets: searchData.facets,
                showDetailModal: false
            });
        })
        .catch(err => {
            console.error('Error while fetching data ', err);
        });

    self.set({

        /**
         * [Centralised actions that are used in the application]
         * @type {Object}
         */

        methods: {

            searchOnFacet({ facetType, facetValue }) {
                let { filterCriteria } = self.get();
                let criteriaWithType = filterCriteria.find(criteria => (criteria.type === facetType && criteria.value === facetValue));
                if (!criteriaWithType || typeof criteriaWithType === 'undefined') {
                    filterCriteria.push({ type: facetType, value: facetValue });
                    self.setSearchData(filterCriteria);
                }
            },

            removeSearchTag(id) {
                let { filterCriteria } = self.get();
                filterCriteria.splice(id, 1);
                self.setSearchData(filterCriteria);
            },

            sortApplications(sortCriteria) {
                self.set('sortCriteria', sortCriteria);
                self.setSearchData(self.get('filterCriteria'));
            },

            bookmarkApplication(id) {
                AdminService.setBookmark(id)
                    .then(bookmarks => {
                        self.set('bookmarks', bookmarks);
                        self.mapBookMarkedApps();
                    })
                    .catch(err => {
                        console.error('Something went wrong ', err);
                    });
            },

            favouriteApplication(id) {
                AdminService.setFavourite(id)
                    .then(favourites => {
                        self.set('favourites', favourites);
                        self.mapFavourites();
                    })
                    .catch(err => {
                        console.error('Something went wrong ', err);
                    });
            },

            removeAppFromBookmarks(id) {
                AdminService.removeBookmark(id)
                    .then(bookmarks => {
                        self.set('bookmarks', bookmarks);
                        self.mapBookMarkedApps();
                    })
                    .catch(err => {
                        console.error('Something went wrong ', err);
                    });
            },

            removeAppFromFavourites(id) {
                AdminService.removeFavourite(id)
                    .then(favourites => {
                        self.set('favourites', favourites);
                        self.mapFavourites();
                    })
                    .catch(err => {
                        console.error('Something went wrong ', err);
                    });
            },

            displayApplicationDetail(id) {
                let { applications } = self.get();

                self.set({
                    showDetailModal: true,
                    appDetail: applications.find(application => application.id === id)
                });
            },

            hideDetailModal() {
                self.set('showDetailModal', false);
            }
        }
    });

}
