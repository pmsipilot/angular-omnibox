import AngularOmniboxComponent from './component/omnibox';
import TypeaheadOmniboxComponent from './component/typeahead';
import TokenOmniboxComponent from './component/token';
import OrderOmniboxComponent from './component/order';
import AutoFocusDirective from './directive/autofocus';
import Sibs from './directive/sibs';

angular.module('angular-omnibox', [])
    .component('pmAngularOmnibox', AngularOmniboxComponent)
    .component('pmTypeaheadOmnibox', TypeaheadOmniboxComponent)
    .component('pmTokenOmnibox', TokenOmniboxComponent)
    .component('pmOrderOmnibox', OrderOmniboxComponent)
    .directive('pmAutoFocus', AutoFocusDirective)
    .directive('sibs', Sibs);
