export default function Sibs() {
    return {
        link: (scope, element, attrs) => {
            const next = element.next();

            scope.$watch(attrs.ngModel, () => {
                element.css('width', `${next.prop('offsetWidth')}px`);
            });
        }
    };
}
