module.exports = {
    data : {},
    set: function(name, value)
    {
        this.data[name] = value;
    },
    get: function(name, defaultVal)
    {
        if (typeof this.data[name] == 'undefined') {
            return defaultVal;
        } else {
            return this.data[name];
        }
    },
    delete: function(name)
    {
        delete this.data[name];
    },
    addItem: function(name, value)
    {
        if (typeof this.data[name] == 'undefined') {
            this.data[name] = [];
        }
        this.data[name].push(value);
    },
    hasItem: function(name, value)
    {
        if (typeof this.data[name] == 'undefined') {
            this.data[name] = [];
        }
        return this.data[name].includes(value);
    },
}