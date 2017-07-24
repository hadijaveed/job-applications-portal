import $ from 'jquery';
import getFakeJson from './utils/fake-json';
import tplService from './services/template_service';
import './styles/index.less';

import tt from './templates/test.html';

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
