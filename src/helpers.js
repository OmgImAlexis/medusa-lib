const join = require('join-array');

const validate = {
    typeof: (inputs, opts) => {
        inputs = Array.isArray(inputs) ? inputs : [inputs];
        opts = Array.isArray(opts) ? opts : [opts];

        inputs.forEach(input => {
            if (!opts.includes(typeof input)) {
                throw new Error(`"${input}" must be a ${join({ array: opts, separator: ', ', last: ' or ' })}.`);
            }
        });
    }
};

module.exports = {
    validate
};
