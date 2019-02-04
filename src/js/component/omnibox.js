/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["token"] }] */
class AngularOmniboxController {
    /* @ngInject */
    constructor($rootScope, $q, OmniboxStorageService, OmniboxTokenRepository, OmniboxTokenFactory) {
        this.StorageService = OmniboxStorageService;
        this.TokenRepository = OmniboxTokenRepository;
        this.TokenFactory = OmniboxTokenFactory;
        this.$rootScope = $rootScope;
        this.loadLastHistory = true;
        this.histories = this.StorageService.getElements('omnibox-history');

        this.$onInit = () => {
            this.TokenRepository.deleteAllTokens();
            this.TokenRepository.config = this.config;
            this.initTokensOnStart();
        };
    }

    initTokensOnStart() {
        if (this.initTokens) {
            const tokenKeys = Object.keys(this.initTokens).filter(key =>
                this.initTokens[key] !== null
                && this.initTokens[key] !== undefined
                && this.TokenRepository.hasConfig(key)
            );
            tokenKeys.forEach((key) => {
                const initTokenValues = this.initTokens[key];
                const values = typeof initTokenValues === 'string'
                    ? initTokenValues.split(',')
                    : [initTokenValues];
                values.forEach((value) => {
                    this.TokenRepository.create(key, value);
                });
            });

            if (tokenKeys.length > 0) {
                this.TokenRepository.save();
                this.histories = this.StorageService.getElements('omnibox-history');
            }
        }

        if (this.TokenRepository.tokens.length === 0 && this.loadLastHistory) {
            this.loadTokens(this.histories.length > 0
                ? this.histories[this.histories.length - 1].map(tok => this.TokenFactory.unserialize(tok))
                : []);
        }
    }

    deleteToken(token) {
        if (this.TokenRepository.delete(token)) {
            this.eventChange();
        }
    }

    deleteLastToken() {
        if (this.TokenRepository.deleteLastToken()) {
            this.eventChange();
        }
    }

    deleteAllTokens() {
        this.TokenRepository.deleteAllTokens();
        this.eventChange();
    }

    createToken(field) {
        if (typeof field !== 'undefined') {
            this.TokenRepository.create(field.key, field.value ? field.value : null);
            this.eventChange();
        }
    }

    changeToken(token, field) {
        if (token.value !== field.key) {
            token.value = field.key;
            token.valueLabel = field.name;
            this.eventChange();
        }
    }

    changeOrder(keyOrderBy, nameOrderBy, direction) {
        const needToValidate = this.order.direction !== direction;
        this.order.keyOrderBy = keyOrderBy;
        this.order.nameOrderBy = nameOrderBy;
        this.order.direction = direction;
        this.eventChange();
        if (needToValidate) {
            this.eventValidate();
        }
    }

    getParams() {
        const params = {
            order: this.order.keyOrderBy,
            direction: this.order.direction
        };
        for (let i = 0; i < this.TokenRepository.tokens.length; i++) {
            if (Object.prototype.hasOwnProperty.call(params, this.TokenRepository.tokens[i].key)) {
                params[this.TokenRepository.tokens[i].key] += `,${this.TokenRepository.tokens[i].value}`;
            } else {
                params[this.TokenRepository.tokens[i].key] = this.TokenRepository.tokens[i].value;
            }
        }
        return params;
    }

    loadTokens(fields) {
        this.TokenRepository.deleteAllTokens();
        fields.forEach(field => this.createToken(field));
        this.eventValidate();
    }

    eventValidate() {
        this.TokenRepository.save();
        this.histories = this.StorageService.getElements('omnibox-history');
        this.$rootScope.$broadcast('omnibox-close');
        this.changed = false;
        this.onValid({ result: this.getParams() });
    }

    eventChange() {
        this.$rootScope.$broadcast('omnibox-focus');
        this.changed = true;
    }
}

const AngularOmniboxComponent = {
    controller: AngularOmniboxController,
    bindings: {
        config: '<',
        order: '<?',
        defaultToken: '<?',
        initTokens: '<?',
        loadLastHistory: '<?',
        onValid: '&'
    },
    template: `
        <div class="angular-omnibox">
            <pm-history-omnibox on-click="$ctrl.loadTokens(fields)" histories="$ctrl.histories"></pm-history-omnibox>
            <ul class="tokens-container list-unstyled">
                <pm-token-omnibox
                  ng-repeat="token in $ctrl.TokenRepository.tokens"
                  token="token"
                  on-delete="$ctrl.deleteToken(token)"
                  on-change="$ctrl.changeToken(token, field)"
                  on-valid="$ctrl.eventValidate()">
                </pm-token-omnibox>
                <li class="input-token">
                    <pm-typeahead-omnibox
                        on-select="$ctrl.createToken(field)"
                        on-backspace="$ctrl.deleteLastToken()"
                        on-valid="$ctrl.eventValidate()"
                        data="$ctrl.TokenRepository.configTokens"
                        exact-name="true"
                        refresh-focus="true"
                        is-token="false"
                        default-token="$ctrl.defaultToken"
                        perdure="false">
                    </pm-typeahead-omnibox>
                </li>
                <li class="delete-all" ng-click="$ctrl.deleteAllTokens()">
                    <i class="fa fa-times"></i>
                </li>
            </ul>
            <pm-order-omnibox
                ng-if="$ctrl.order"
                order="$ctrl.order"
                on-change="$ctrl.changeOrder(keyOrderBy, nameOrderBy, direction)">
            </pm-order-omnibox>
            <button class="search" ng-click="$ctrl.eventValidate()" ng-class="{'modified': $ctrl.changed}">
                <i class="fa fa-search"></i>
            </button>
        </div>
    `
};

export default AngularOmniboxComponent;
