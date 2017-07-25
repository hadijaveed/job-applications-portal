
// app main component require
require('./app');

let stickyElement = document.querySelector('[data-sticky-element]');
stickyElement.style.position = 'fixed';
stickyElement.style.width = stickyElement.parentNode.offsetWidth + 'px';

window.addEventListener('resize', () => {
    stickyElement.style.position = 'fixed';
    stickyElement.style.width = stickyElement.parentNode.offsetWidth + 'px';
});
