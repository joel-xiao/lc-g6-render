export class Caching {
    #caching = {};
    constructor() {
        this.setCaching = this.setCaching.bind(this);
        this.delCaching = this.delCaching.bind(this);
        this.getCaching = this.getCaching.bind(this);
        this.hasCaching = this.hasCaching.bind(this);
    }

    setCaching(key, val) {
        const keys = typeof key === 'string' ? key.split('.') : [key];
        let caching = this.#caching;
        keys.forEach((key, idx) => {
            if (idx === keys.length - 1) {
                caching[key] = val;
                return;
            }
            if (!caching[key]) caching[key] = {};
            caching = caching[key];
        });
    }

    delCaching(key) {
        const keys = typeof key === 'string' ? key.split('.') : [key];
        let caching = this.#caching;
        keys.forEach((key, idx) => {
            if (!caching) return;
            if (idx === keys.length - 1) {
                delete caching[key];
                return;
            }
            caching = caching?.[key];
        });
    }

    getCaching(key) {
        const keys = typeof key === 'string' ? key.split('.') : [key];
        let caching = this.#caching;
        keys.forEach((key) => {
            caching = caching?.[key];
        });
        return caching;
    }

    hasCaching(key) {
        return !!this.getCaching(key);
    }
}
