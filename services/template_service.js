/**
 *
 * Service to Render Templates
 * This service also binds events and helpers
 *
 */

import $ from 'jquery';
import Handlebars from 'handlebars';

const generateTemplate = function({ template, container, helpers, events }) {

    if (typeof template !== 'string') return console.error('Missing Template Selector ');
    if (typeof container !== 'string') return console.error('Missing Container Selector ');

    let containerInstance = $(container),
        helpersObj = helpers || {},
        templateInstance = Handlebars.compile(template);

    // bind events to the root container
    if (typeof events === 'object' ) {
        Object.keys(events)
            .forEach((key) => {
                var chunks = key.split(' '),
                    chunksLength = chunks.length,
                    callback = events[key];

                if (chunksLength > 1) {
                    var selector = chunks.splice(chunksLength - 1, 1)[0],
                        event = chunks.join(' ');

                    containerInstance.on(event, selector, function(e) {
                        callback && callback(e, this, self);
                    });
                }
            });
    }


    return {
        render(data, cb) {
            let renderData = null;
            if (typeof data === 'object') renderData = data;
            let htmlBlob = templateInstance(renderData, { helpers: helpersObj });
            containerInstance.html(htmlBlob);
            cb && cb();
        }
    };

};


export default generateTemplate;
