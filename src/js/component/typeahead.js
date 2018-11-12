import Util from '../util';

export class TypeaheadOmniboxController {
    /* @ngInject */
    constructor(filterFilter, $document, $rootScope) {
        // inject
        this.$filter = filterFilter;
        this.$document = $document;
        this.$rootScope = $rootScope;

        // params
        this.exactName = this.exactName || false;
        this.perdure = this.perdure !== undefined ? this.perdure : true;
        this.autoFocus = this.autoFocus !== undefined ? this.autoFocus : false;
        this.data = this.data !== undefined ? this.data : [];
        this.defaultToken = this.defaultToken !== undefined ? this.defaultToken : false;

        // init vars
        this._input = '';
        this._resultBoxVisible = false;
        this._isAutoComplete = true;
        this._loading = false;
        this._preselectedField = null;
        this._defaultField = null;
        this._preventBlur = false;
        this._lastBackspace = 0;
    }

    $onInit() {
        this.$rootScope.$on('omnibox-close', () => {
            if (!this.isToken) {
                this.setBoxVisibility(false);
            }
        });
        this._loading = true;
        this.buildPreselectedDefault();
        if (typeof this.data === 'function') {
            this.data().then((items) => {
                this.data = items;
                if (this.data.length <= 0) {
                    this._isAutoComplete = false;
                }
                this.initValue();
            });
        } else if (this.data.length <= 0) {
            this._isAutoComplete = false;
            this.initValue();
        } else {
            this.initValue();
        }
    }

    set input(input) {
        this._input = this.perdure ? input : '';
    }

    initValue() {
        if (this.value && this.perdure) {
            this.autoFocus = false;
            const fields = this.getFilteredData(this.value, true);
            if (fields.length > 0) {
                this.input = fields[0].name;
            } else if (!this.exactName) {
                this.input = this.value;
            }
        }
        this._loading = false;
    }

    isResultBoxVisible() {
        if (!this._isAutoComplete || this._loading) {
            return false;
        }
        return this._resultBoxVisible && (this.hasFilteredData() || this.hasDefault());
    }

    getFilteredData(input = null, strict = false) {
        const arg = input === null ? this._input : input;
        const result = this.$filter(this.data, arg, strict);
        if (result.length <= 0 && !isNaN(arg)) {
            return this.$filter(this.data, parseInt(arg, 10), strict);
        }
        return result;
    }

    hasFilteredData(input = null, strict = false) {
        return this.getFilteredData(input, strict).length > 0;
    }

    preselectNext(reverse = false) {
        const availableDatas = this.getFilteredData();
        const idx = availableDatas.indexOf(this._preselectedField);
        const newId = idx + (reverse ? -1 : 1);
        if (newId in availableDatas) {
            this.setPreselectedField(availableDatas[newId]);
            Util.scrollToID(this.$document, newId, reverse);
        } else if (newId < 0 && this.hasDefault()) {
            this.setPreselectedField(null);
        }
    }

    deleteLastToken() {
        if (this._input.length <= 0) {
            const backspace = new Date().getTime();
            if (backspace - this._lastBackspace < 500) {
                this._lastBackspace = 0;
                this.onBackspace({});
            } else {
                this._lastBackspace = backspace;
            }
        }
    }

    setPreselectedField(field = null) {
        this._preselectedField = field;
    }

    buildPreselectedDefault() {
        if (this.hasDefault()) {
            const defaultField = this.getDefault();
            this._defaultField = {
                key: defaultField.key,
                name: defaultField.name,
                value: this._input
            };
        }
    }

    selectField(field) {
        this.setPreselectedField(null);
        this.onSelect({ field });
    }

    setBoxVisibility(visible = true) {
        this._resultBoxVisible = visible;
        if (visible) {
            this._preventBlur = false;
        } else if (!this._preventBlur) {
            this.clean();
        }
    }

    onFieldClick(field) {
        this._preventBlur = true;
        this.input = field.name;
        this.selectField(field);
    }

    clean() {
        this.setPreselectedField(null);
        this.input = '';
        if (this.isToken) {
            this.onBackspace({});
        }
    }

    checkBeforeValidate() {
        if (this._preselectedField) {
            return;
        }
        if (this.isToken && !this.exactName) {
            this.selectField({ key: this._input, name: this._input });
            this.input = this._input;
            this.onValid();
        } else if (!this.isToken && this._input.length <= 0) {
            this.input = this._input;
            this.onValid();
        } else {
            this.clean();
        }
    }

    eventKeydown(event) {
        switch (event.which) {
            case 8: // backspace
                this.deleteLastToken();
                break;
            case 27: // escape
                this.setPreselectedField(null);
                break;
            case 9: // tab
            case 13: // enter
            case 39: // right
                this._preventBlur = true;
                if (this._preselectedField) {
                    this.input = this._preselectedField.name;
                    this.selectField(this._preselectedField);
                } else if (event.which === 13) {
                    this.checkBeforeValidate();
                }
                break;
            case 38: // up arrow
                this.preselectNext(true);
                break;
            case 40: // down arrow
                this.preselectNext();
                break;
            default:
                break;
        }
    }

    eventChange() {
        if (!this.hasDefault()) {
            this.setPreselectedField(this.getFilteredData()[0]);
        } else {
            this.buildPreselectedDefault();
            this.setPreselectedField(this._defaultField);
        }
    }

    hasDefault() {
        return this.defaultToken
            && this.data.filter(token => (token.key === this.defaultToken && this._input.length > 0)).length > 0;
    }

    getDefault() {
        if (this.defaultTokenCache) {
            return this.defaultTokenCache;
        }
        this.defaultTokenCache = this.data.find(token => (token.key === this.defaultToken));
        return this.defaultTokenCache;
    }
}

const TypeaheadOmniboxComponent = {
    controller: TypeaheadOmniboxController,
    bindings: {
        data: '<',
        exactName: '<?',
        value: '<?',
        perdure: '<?',
        autoFocus: '<?',
        refreshFocus: '<?',
        defaultToken: '<?',
        onSelect: '&',
        onBackspace: '&',
        isToken: '<',
        onValid: '&?'
    },
    template: `
       <div class="typeahead">
            <input
                ng-if="$ctrl._loading"
                type="text"
                value="Loading..."
                disabled
            >
            <input
                ng-if="!$ctrl._loading"
                type="text"
                value="$ctrl.selected.name"
                pm-auto-focus="$ctrl.autoFocus"
                refresh-focus="$ctrl.refreshFocus"
                ng-model="$ctrl._input"
                ng-blur="$ctrl.setBoxVisibility(false)"
                ng-focus="$ctrl.setBoxVisibility(true)"
                ng-keydown="$ctrl.eventKeydown($event)"
                ng-change="$ctrl.eventChange($event)"
                sibs
            >
            <span class="sibs">{{ $ctrl._input }}</span>
            <ul ng-if="$ctrl.isResultBoxVisible()" class="typeahead-box">
                <li
                    ng-if="$ctrl.hasDefault()"
                    ng-mousedown="$ctrl.onFieldClick($ctrl._defaultField)"
                    ng-mouseover="$ctrl.setPreselectedField($ctrl._defaultField)"
                    ng-class="$ctrl._preselectedField == $ctrl._defaultField ? 'preselected' : ''"
                >
                    {{ $ctrl.getDefault().name }}: {{ $ctrl._input }}
                </li>
                <li
                    ng-repeat="field in $ctrl.getFilteredData()"
                    ng-mousedown="$ctrl.onFieldClick(field)"
                    ng-mouseover="$ctrl.setPreselectedField(field)"
                    ng-class="$ctrl._preselectedField == field ? 'preselected' : ''"
                >
                    {{ field.name }}
                    <span
                        ng-if="field.hasOwnProperty('unique') && !field.unique"
                        class="multiple"
                    >Multiple</span>
                </li>
            </ul>
       </div>
    `
};

export default TypeaheadOmniboxComponent;
