
// app main component require
import './app';


window.addEventListener('scroll', () => {
    let stickyElement = document.querySelector('[data-sticky-element]');
    if (stickyElement) {
        stickyElement.style.position = 'fixed';
        stickyElement.style.width = stickyElement.parentNode.offsetWidth + 'px';
    }
});

window.addEventListener('resize', () => {
    let stickyElement = document.querySelector('[data-sticky-element]');
    if (stickyElement) {
        stickyElement.style.position = 'fixed';
        stickyElement.style.width = stickyElement.parentNode.offsetWidth + 'px';
    }
});
