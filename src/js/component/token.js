export class TokenOmniboxController {
    delete() {
        this.onDelete({ data: this.data });
    }

    change(field) {
        this.onChange({ field });
    }
}

const TokenOmniboxComponent = {
    controller: TokenOmniboxController,
    bindings: {
        data: '<',
        onDelete: '&',
        onChange: '&',
        onValid: '&'
    },
    template: `
         <li class="js-visual-token filtered-search-token">
              <div class="selectable" ng-style="$ctrl.data.rules.hasOwnProperty('background') && { 'background-color':$ctrl.data.rules.background }">
                  <div class="name">{{ $ctrl.data.name }}</div>
                  <div class="value-container">
                      <div class="value">
                          <pm-typeahead-omnibox
                              data="$ctrl.data.rules.autocomplete"
                              exact-name="$ctrl.data.rules.exactName"
                              value="$ctrl.data.value"
                              perdure="true"
                              is-token="true"
                              on-select="$ctrl.change(field)"
                              on-backspace="$ctrl.delete()"
                              on-valid="$ctrl.onValid()"
                              auto-focus="true">
                          </pm-typeahead-omnibox>
                      </div>
                      <div class="remove-token" role="button" ng-click="$ctrl.delete()">
                          <i class="fa fa-times"></i>
                      </div>
                  </div>
              </div>
          </li>
      `
};

export default TokenOmniboxComponent;
