/**
 *
 * THis service is to handle admin requests
 *
 */

const adminService = function() {

    let bookmarks = [],
        favourites = [];

    return {
        getBookmarks() {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(bookmarks);
                }, 200);
            });
        },

        getFavourites() {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(favourites);
                }, 200);
            });
        },

        setBookmark(id) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (bookmarks.indexOf(id) === -1) bookmarks.push(id);
                    resolve(bookmarks);
                }, 200);
            });
        },

        setFavourite(id) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (favourites.indexOf(id) === -1) favourites.push(id);
                    resolve(favourites);
                }, 200);
            });
        },

        removeBookmark(id) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    let index = bookmarks.indexOf(id);
                    if (index !== -1) bookmarks.splice(index, 1);
                    resolve(bookmarks);
                }, 200);
            });
        },

        removeFavourite(id) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    let index = favourites.indexOf(id);
                    if (index !== -1) favourites.splice(index, 1);
                    resolve(favourites);
                }, 200);
            });
        }
    };
};

module.exports = adminService;
