export class HistoryOmniboxController {
    /* @ngInject */
    constructor(OmniboxStorageService, OmniboxTokenFactory) {
        this.StorageService = OmniboxStorageService;
        this.TokenFactory = OmniboxTokenFactory;
        this.showHistory = false;
        this.tokenizedHistories = [];
    }

    $onInit() {
        this.tokenizeHistory();
    }

    $onChanges() {
        this.tokenizeHistory();
        this.showHistory = false;
    }

    tokenizeHistory() {
        this.tokenizedHistories = this.histories.filter(history => history.length !== 0).map(history => history.map(token => this.TokenFactory.unserialize(token))).reverse();
    }

    toggleHistory() {
        this.showHistory = this.tokenizedHistories.length > 0 && !this.showHistory;
    }

    select(history) {
        this.toggleHistory();
        this.onClick({ fields: history });
    }
}

const HistoryOmniboxComponent = {
    controller: HistoryOmniboxController,
    bindings: {
        histories: '<',
        onClick: '&'
    },
    template: `
        <button ng-click="$ctrl.toggleHistory()" ng-class="{'active': $ctrl.tokenizedHistories.length > 0}"><i class="fa fa-history"></i></button>
        <ul ng-if="$ctrl.showHistory && $ctrl.tokenizedHistories.length">
            <li ng-click="$ctrl.select(history)" ng-repeat="history in $ctrl.tokenizedHistories">
                <pm-token-omnibox
                    ng-repeat="token in history"
                    token="token"
                    readonly="true"></pm-token-omnibox>
            </li>
        </ul>
    `
};

export default HistoryOmniboxComponent;
