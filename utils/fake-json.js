/**
 *
 * Returns fake json
 * Intent is to genereate large json data randomly
 *
 */

const fakeJson = require('dummy-json');



function getJson() {
    const helpers = {
        position() {
            return fakeJson.utils.randomArrayItem([
                'Server', 'Cook', 'Engineer', 'Painter', 'Front-End Engineer', 'Back-End Engineer', 'Api Developer'
            ]);
        },

        answer() {
            return fakeJson.utils.randomArrayItem([
                'Yes',
                'No'
            ]);
        }
    };

    const partials = {
        availability: '{\
            "M": {{int 0 2}},\
            "T": {{int 0 2}},\
            "W": {{int 0 2}},\
            "Th": {{int 0 2}},\
            "F": {{int 0 2}},\
            "S": {{int 0 2}},\
            "Su": {{int 0 2}}\
        }'
    };

    let tpl = `[
        {{#repeat 100}}
            {
                "id": "{{@index}}",
                "name": "{{firstName}} {{lastName}}",
                "position": "{{position}}",
                "applied": "{{date '2015' '2017' 'MM/DD/YYYY'}}",
                "experience": "{{int 1 20}}",
                "availability": {{> availability}},
                "questions": [
                    {
                        "text": "Are you authorized to work in the United States?",
                        "answer": "{{answer}}"
                    },
                    {
                        "text": "Have you ever been convicted of a felony?",
                        "answer": "{{answer}}"
                    }
                ]
            }
        {{/repeat}}
    ]`;

    return fakeJson.parse(tpl, { helpers, partials });
};

module.exports = getJson;
