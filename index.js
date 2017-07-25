
// app main component require
require('./app');

let stickyElement = document.querySelector('[data-sticky-element]');
stickyElement.style.position = 'fixed';
stickyElement.style.width = stickyElement.parentNode.offsetWidth + 'px';

window.addEventListener('resize', () => {
    console.log('resizing window here ');
    stickyElement.style.position = 'fixed';
    stickyElement.style.width = stickyElement.parentNode.offsetWidth + 'px';
});
