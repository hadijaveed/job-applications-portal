/**
 *
 * This service is to format data
 *
 */

const formatListingData = function() {
    return {
        mapAvailabilityDays(applications) {
            return applications
                    .map(application => {
                        application.availableOnDays =
                            Object.keys(application.availability)
                                .filter(key => application.availability[key] !== 0);

                        return application;
                    });
        },

        mapBookmarkFlags(applications, bookmarks) {
            return applications
                    .map(application => {
                        if (bookmarks.indexOf(application.id) !== -1) application.bookmarked = true;
                        else application.bookmarked = false;
                        return application;
                    });
        },

        mapFavouriteFlags(applications, favourites) {
            return applications
                    .map(application => {
                        if (favourites.indexOf(application.id) !== -1) application.bookmarked = true;
                        else application.bookmarked = false;
                        return application;
                    });
        },

        mapAllData(applications, favourites, bookmarks) {
            return applications
                    .map(application => {
                        application.availableOnDays =
                            Object.keys(application.availability)
                                .filter(key => application.availability[key] !== 0);

                        if (bookmarks.indexOf(application.id) !== -1) application.bookmarked = true;
                        else application.bookmarked = false;

                        if (favourites.indexOf(application.id) !== -1) application.bookmarked = true;
                        else application.bookmarked = false;

                        return application;
                    });
        }
    };
};


module.exports = formatListingData;
