export default class TokenRepository {
    /* @ngInject */
    constructor($filter, $q, OmniboxTokenFactory, OmniboxStorageService) {
        this.$filter = $filter;
        this.$q = $q;
        this.TokenFactory = OmniboxTokenFactory;
        this.StorageService = OmniboxStorageService;
        this._config = {};
        this._tokens = [];
        this._configTokens = [];
    }

    set config(config) {
        this._config = config;
    }

    get tokens() {
        return this._tokens;
    }

    get configTokens() {
        return this._configTokens;
    }

    updateConfigTokens() {
        const configTokens = [];
        Object.keys(this._config).forEach((key) => {
            const config = this.findConfigByKey(key);
            if (config.unique && this._tokens.findIndex(token => token.key === key) < 0) {
                configTokens.push(this.TokenFactory.createToken(key, config.name, config.background));
            } else if (!config.unique && this._tokens.filter(token => token.key === key).length !== config.autocomplete.length) {
                const token = this.TokenFactory.createToken(key, config.name, config.background);
                token.multiple = true;
                configTokens.push(token);
            }
        });

        this._configTokens = configTokens;
    }

    /**
     * @param key
     * @returns {*}
     * @throws Error
     */
    findConfigByKey(key) {
        if (Object.keys(this._config).indexOf(key) === -1) {
            throw new Error(`Config not found for key ${key}`);
        }

        return this._config[key];
    }

    hasConfig(key) {
        try {
            this.findConfigByKey(key);
            return true;
        } catch (e) {
            return false;
        }
    }

    create(key, value) {
        let config;
        try {
            config = this.findConfigByKey(key);
        } catch (e) {
            return;
        }

        const token = this.TokenFactory.createToken(
            key,
            config.name,
            config.background,
            this.getAvailableValues(key));

        if (value) {
            token.value = value;
            const autocompleted = config.autocomplete
                ? config.autocomplete.find(res => res.key === value)
                : undefined;
            token.valueLabel = autocompleted
                ? autocompleted.name
                : value;
        }

        this._tokens.push(token);
        this.updateConfigTokens();
    }

    getAvailableValues(key, input) {
        let config;
        try {
            config = this.findConfigByKey(key);
        } catch (e) {
            return undefined;
        }

        return config.autocomplete
            ? this.$filter('filter')(config.autocomplete.filter(result =>
                this._tokens.filter(existingToken => existingToken.key === key)
                    .map(existingToken => existingToken.value)
                    .indexOf(result.key) === -1), input)
            : undefined;
    }

    delete(token) {
        const idx = this._tokens.indexOf(token);
        if (idx >= 0) {
            this._tokens.splice(idx, 1);
            this.updateConfigTokens();

            return true;
        }

        return false;
    }

    deleteLastToken() {
        if (this._tokens.length > 0) {
            this._tokens.splice(-1, 1);
            this.updateConfigTokens();

            return true;
        }

        return false;
    }

    deleteAllTokens() {
        this._tokens = [];
        this.updateConfigTokens();
    }

    save() {
        this.StorageService.addElement('omnibox-history', this._tokens.map(token => token.serialize()));
    }
}
