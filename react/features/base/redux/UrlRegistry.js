// @flow

import { parseURLParams } from '../util/parseURLParams';


const parseBoolean = value => {
    switch (value) {
    case true:
    case 'true':
    case 1:
    case '1':
    case 'on':
    case 'yes':
        return true;
    case false:
    case 'false':
    case 0:
    case '0':
    case 'off':
    case 'no':
        return false;

    default:
        return value;
    }
};

/**
 * Mixed type of the element (subtree) config. If it's a {@code boolean} (and is
 * {@code true}), we persist the entire subtree. If it's an {@code Object}, we
 * perist a filtered subtree based on the properties of the config object.
 */
declare type ElementConfig = boolean | Object;

/**
 * The type of the name-config pairs stored in {@code PersistenceRegistry}.
 */
declare type PersistencyConfigMap = { [name: string]: ElementConfig };

/**
 * A registry to allow features to register their redux store subtree to be
 * persisted and also handles the persistency calls too.
 */
class UrlRegistry {
    _elements: PersistencyConfigMap = {};
    _initialStates: PersistencyConfigMap = {};

    /**
     * Returns the persisted redux state. Takes the {@link #_elements} into
     * account as we may have persisted something in the past that we don't want
     * to retreive anymore. The next {@link #persistState} will remove such
     * values.
     *
     * @returns {Object}
     */
    getPersistedState() {
        const parsedUrl = parseURLParams(window.location, true, 'search');

        return Object.keys(this._elements).reduce((memo, storeName) => {

            memo[storeName] = Object.keys(this._elements[storeName]).reduce((store, key) => {

                if (this._elements[storeName][key]) {
                    const urlKey = this._elements[storeName][key] === true ? key : this._elements[storeName][key];

                    if (parsedUrl.hasOwnProperty(urlKey)) {
                        store[key] = parseBoolean(parsedUrl[urlKey]);
                    }
                }

                return store;
            }, {});

            return memo;
        }, {});
    }

    /**
     * Function to get initial State of registry.
     *
     * @returns {PersistencyConfigMap}
     */
    getInitialState() {
        return this._initialStates;
    }

    /**
     * Registers a new subtree config to be used for the persistency.
     *
     * @param {string} name - The name of the subtree the config belongs to.
     * @param {ElementConfig} config - The config {@code Object}, or
     * {@code boolean} if the entire subtree needs to be persisted.
     * @param {ElementConfig} initialState - The initial state of the registry.
     * @returns {void}
     */
    register(
            name: string,
            config?: ElementConfig = true,
            initialState?: ElementConfig = false) {
        this._elements[name] = config;
        if (initialState) {
            this._initialStates[name] = initialState;
        }

    }
}

export default new UrlRegistry();
