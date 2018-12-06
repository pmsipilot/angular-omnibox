/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["document"] }] */
export default class Util {
    static checkElementIsInContainer(container, element, partial = false) {
        const cTop = container.scrollTop;
        const cBottom = cTop + container.clientHeight;
        const eTop = element.offsetTop;
        const eBottom = eTop + element.clientHeight;
        const isTotal = (eTop >= cTop && eBottom <= cBottom);
        const isPartial = partial && (
                (eTop < cTop && eBottom > cTop) ||
                (eBottom > cBottom && eTop < cBottom)
            );
        return (isTotal || isPartial);
    }

    static scrollToID(document, id, reverse = false) {
        const container = document[0].querySelector('.typeahead-box');
        const element = document[0].querySelector(`.typeahead-box li:nth-child(${id + 1})`);
        if (container && element && !Util.checkElementIsInContainer(container, element)) {
            const offsetElement = reverse
                ? container.querySelector('li:nth-child(1)')
                : container.querySelector('li:nth-child(6)');
            const offset = offsetElement
                ? offsetElement.offsetTop
                : 0;
            container.scrollTop =
                element.offsetTop - offset;
        }
    }
}
