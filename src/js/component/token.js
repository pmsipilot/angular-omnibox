export class TokenOmniboxController {
    /* @ngInject */
    constructor(OmniboxTokenRepository) {
        this.TokenRepository = OmniboxTokenRepository;
    }

    $onInit() {
        try {
            this.exactName = this.TokenRepository.findConfigByKey(this.token.key).exactName;
        } catch (e) {
            this.exactName = '';
        }
    }

    delete() {
        this.onDelete({ token: this.token });
    }

    change(field) {
        this.onChange({ field });
    }
}

const TokenOmniboxComponent = {
    controller: TokenOmniboxController,
    bindings: {
        token: '<',
        onDelete: '&',
        onChange: '&',
        onValid: '&',
        readonly: '<'
    },
    template: `
         <li class="js-visual-token filtered-search-token selectable" ng-style="$ctrl.token.color && { 'background-color':$ctrl.token.color }">
              <span class="name">{{ $ctrl.token.name }}</span>
              <pm-typeahead-omnibox
                  data="$ctrl.token.availableValues"
                  exact-name="$ctrl.exactName"
                  value="$ctrl.token.value"
                  perdure="true"
                  is-token="true"
                  on-select="$ctrl.change(field)"
                  on-backspace="$ctrl.delete()"
                  on-valid="$ctrl.onValid()"
                  auto-focus="true"
                  ng-if="!$ctrl.readonly"
                  class="value"
                  ng-class="!$ctrl.readonly ? 'selectable' : ''"
              ></pm-typeahead-omnibox>
              <span ng-if="$ctrl.readonly" class="value">{{ $ctrl.token.valueLabel }}</span>
              <button class="remove-token" role="button" ng-click="$ctrl.delete()" ng-if="!$ctrl.readonly">
                  <i class="fa fa-times"></i>
              </button>
          </li>
      `
};

export default TokenOmniboxComponent;
