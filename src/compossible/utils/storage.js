export class Storage {
    #store = {};
    #storeName = "CUSTOM-STORAGE-COMPONENTS"
    constructor() {
        this.set = this.set.bind(this);
        this.del = this.del.bind(this);
        this.get = this.get.bind(this);
        this.has = this.has.bind(this);
    }

    #getStore() {
        let store = window.localStorage.getItem(this.#storeName);
        this.#store = store ? JSON.parse(store) : this.#store;
        return this.#store;
    }

    #setStore() {
        window.localStorage.setItem(this.#storeName, JSON.stringify(this.#store));
    }

    set(key, val) {
        const keys = typeof key === 'string' ? key.split('.') : [key];
        let store = this.#getStore();
        keys.forEach((key, idx) => {
            if (idx === keys.length - 1) {
                store[key] = val;
                return;
            }
            if (!store[key]) store[key] = {};
            store = store[key];
        });

        this.#setStore(keys[0]);
    }

    del(key) {
        const keys = typeof key === 'string' ? key.split('.') : [key];
        let store = this.#getStore();
        keys.forEach((key, idx) => {
            if (!store) return;
            if (idx === keys.length - 1) {
                delete store[key];
                return;
            }
            store = store?.[key];
        });

        this.#setStore();
    }

    get(key) {
        const keys = typeof key === 'string' ? key.split('.') : [key];
        let store = this.#getStore();
        keys.forEach((key) => {
            store = store?.[key];
        });
        return store;
    }

    has(key) {
        return !!this.get(key);
    }
}
