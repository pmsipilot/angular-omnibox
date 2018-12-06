/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["token"] }] */
class AngularOmniboxController {
    /* @ngInject */
    constructor($rootScope) {
        this.$rootScope = $rootScope;
        this.tokens = this.tokens !== undefined ? this.tokens : [];
        this._dataTokens = [];
        this._initParams = null;
        this.paramsIdentical = true;

        this.$onInit = () => {
            this.createDataTokens();
            this.initTokensOnStart();
        };
    }

    initTokensOnStart() {
        if (this.initTokens) {
            Object.keys(this.initTokens).filter(key =>
                this.initTokens[key] !== null
                && this.initTokens[key] !== undefined
                && Object.prototype.hasOwnProperty.call(this.datas, key)
            ).forEach((key) => {
                const tokenConfig = this.datas[key];
                const initTokenValues = this.initTokens[key];
                const values = typeof initTokenValues === 'string'
                    ? initTokenValues.split(',')
                    : [initTokenValues];
                this.tokens.push(...values.map(value => ({
                    key,
                    name: tokenConfig.name,
                    value: isNaN(value) ? value : parseInt(value, 10),
                    rules: tokenConfig
                })));
            });
        }
        this._initParams = this.getParams();
        this.createDataTokens();
    }

    deleteToken(token) {
        const idx = this.tokens.indexOf(token);
        if (idx >= 0) {
            this.tokens.splice(idx, 1);
            this.createDataTokens();
            this.eventChange();
        }
    }

    deleteLastToken() {
        if (this.tokens.length > 0) {
            this.tokens.splice(-1, 1);
            this.createDataTokens();
            this.eventChange();
        }
    }

    deleteAllTokens() {
        this.tokens = [];
        this.createDataTokens();
        this.eventChange();
    }

    createToken(field) {
        if (typeof field !== 'undefined') {
            const dataToken = this.datas[field.key];
            const createdToken = {
                key: field.key,
                name: field.name,
                value: field.value ? field.value : null,
                rules: Object.assign({}, dataToken)
            };
            if (dataToken.autocomplete && dataToken.unique === false) {
                if (typeof createdToken.rules.autocomplete === 'function') {
                    createdToken.rules.autocomplete = createdToken.rules.autocomplete().then(results =>
                        this.filterTokenAutocompleteResults(createdToken, results)
                    );
                } else {
                    createdToken.rules.autocomplete = this.filterTokenAutocompleteResults(createdToken, createdToken.rules.autocomplete);
                }
            }
            this.tokens.push(createdToken);
            this.createDataTokens();
            if (field.value) {
                this.eventChange();
            }
        }
    }

    filterTokenAutocompleteResults(token, results) {
        return results.filter(result =>
            this.tokens.filter(existingToken => existingToken.key === token.key)
                .map(existingToken => existingToken.value)
                .indexOf(result.key) === -1
        );
    }

    changeToken(token, field) {
        token.value = field.key;
        this.eventChange();
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
        for (let i = 0; i < this.tokens.length; i++) {
            if (Object.prototype.hasOwnProperty.call(params, this.tokens[i].key)) {
                params[this.tokens[i].key] += `,${this.tokens[i].value}`;
            } else {
                params[this.tokens[i].key] = this.tokens[i].value;
            }
        }
        return params;
    }

    alreadyThere(key) {
        return (this.tokens.findIndex(e => e.key === key) >= 0);
    }

    createDataTokens() {
        const dataTokens = [];
        Object.keys(this.datas).forEach((key) => {
            if ((!this.datas[key].unique && this.hasValues(key)) || (this.datas[key].unique && !this.alreadyThere(key))) {
                dataTokens.push({
                    key,
                    name: this.datas[key].name,
                    unique: this.datas[key].unique,
                    background: this.datas[key].background ? this.datas[key].background : null
                });
            }
        });
        this._dataTokens = dataTokens;
    }

    hasValues(key) {
        const dataToken = this.datas[key];
        if (dataToken.exactName && typeof dataToken.autocomplete !== 'function') {
            return this.tokens.filter(token => token.key === key).length !== dataToken.autocomplete.length;
        }

        return true;
    }

    eventValidate() {
        this._initParams = this.getParams();
        this.paramsIdentical = true;
        this.$rootScope.$broadcast('omnibox-close');
        this.onValid({ result: this._initParams });
    }

    eventChange() {
        const currentParams = this.getParams();
        this.paramsIdentical = angular.equals(currentParams, this._initParams);
        this.$rootScope.$broadcast('omnibox-focus');
        if (this.onChange) {
            this.paramsIdentical = true;
            this._initParams = currentParams;
            this.onChange({ result: this._initParams });
        }
    }
}

const AngularOmniboxComponent = {
    controller: AngularOmniboxController,
    bindings: {
        datas: '<',
        order: '<?',
        defaultToken: '<?',
        initTokens: '<?',
        onChange: '&?',
        onValid: '&'
    },
    template: `
        <div class="angular-omnibox">
            <ul class="tokens-container list-unstyled">
                <pm-token-omnibox
                  ng-repeat="token in $ctrl.tokens"
                  data="token"
                  on-delete="$ctrl.deleteToken(token)"
                  on-change="$ctrl.changeToken(token, field)"
                  on-valid="$ctrl.eventValidate()">
                </pm-token-omnibox>
                <li class="input-token">
                    <pm-typeahead-omnibox
                        on-select="$ctrl.createToken(field)"
                        on-backspace="$ctrl.deleteLastToken()"
                        on-valid="$ctrl.eventValidate()"
                        data="$ctrl._dataTokens"
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
            <div class="search" ng-click="$ctrl.eventValidate()" ng-class="{false: 'modified'}[$ctrl.paramsIdentical]">
                <i class="fa fa-search"></i>
            </div>
        </div>
    `
};

export default AngularOmniboxComponent;
