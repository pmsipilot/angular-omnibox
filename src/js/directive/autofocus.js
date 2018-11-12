export default /* @ngInject */ function AutoFocusDirective($timeout, $rootScope) {
    return {
        restrict: 'A',
        scope: {
            focus: '<pmAutoFocus',
            refreshFocus: '<?'
        },
        link: (scope, element) => {
            if (scope.focus) {
                $timeout(() => {
                    element[0].focus();
                }, 0);
            }
            if (scope.refreshFocus) {
                $rootScope.$on('omnibox-focus', () => {
                    $timeout(() => {
                        element[0].focus();
                    }, 0);
                });
                $rootScope.$on('omnibox-close', () => {
                    $timeout(() => {
                        element[0].blur();
                    }, 0);
                });
            }
        }
    };
}
