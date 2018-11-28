import AngularOmniboxComponent from './component/omnibox';
import TypeaheadOmniboxComponent from './component/typeahead';
import TokenOmniboxComponent from './component/token';
import OrderOmniboxComponent from './component/order';
import HistoryOmniboxComponent from './component/history';
import AutoFocusDirective from './directive/autofocus';
import Sibs from './directive/sibs';
import StorageService from './service/storage-service';
import TokenRepository from './service/token-repository';
import TokenFactory from './service/token-factory';

angular.module('angular-omnibox', [])
    .component('pmAngularOmnibox', AngularOmniboxComponent)
    .component('pmTypeaheadOmnibox', TypeaheadOmniboxComponent)
    .component('pmTokenOmnibox', TokenOmniboxComponent)
    .component('pmOrderOmnibox', OrderOmniboxComponent)
    .component('pmHistoryOmnibox', HistoryOmniboxComponent)
    .directive('pmAutoFocus', AutoFocusDirective)
    .directive('sibs', Sibs)
    .service('OmniboxStorageService', StorageService)
    .service('OmniboxTokenRepository', TokenRepository)
    .service('OmniboxTokenFactory', TokenFactory)
;
