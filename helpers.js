const validate = {
    typeof: (inputs, opts) => {
        inputs = Array.isArray(inputs) ? inputs : [inputs];
        opts = Array.isArray(opts) ? opts : [opts];

        inputs.forEach(input => {
            if (!opts.includes(typeof input)) {
                throw new Error(`"${input}" must be a string or integer`);
            }
        });
    }
};

module.exports = {
    validate
};
