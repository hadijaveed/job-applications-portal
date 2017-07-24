
import $ from 'jquery';
import Ractive from 'ractive';

import getFakeJson from './utils/fake-json';
import './styles/index.less';


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
    el: ''
});
