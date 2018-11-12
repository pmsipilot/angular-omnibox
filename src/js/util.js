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
        const visible = Util.checkElementIsInContainer(document[0].querySelector('.typeahead-box'),
            document[0].querySelector(`.typeahead-box li:nth-child(${id + 1})`));
        if (!visible) {
            const offset = reverse
                ? document[0].querySelector('.typeahead-box li:nth-child(1)').offsetTop
                : document[0].querySelector('.typeahead-box li:nth-child(6)').offsetTop;
            document[0].querySelector('.typeahead-box').scrollTop =
                document[0].querySelector(`.typeahead-box li:nth-child(${id + 1})`).offsetTop - offset;
        }
    }
}
