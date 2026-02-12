'use strict';

import eslintConfig from './.eslintrc.json' with {
    type: 'json',
};

module.exports = {
    ...eslintConfig,
    extends: [
        ...eslintConfig.extends,
        'plugin:putout/ide',
    ],
};
