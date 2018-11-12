export class OrderOmniboxController {
    constructor() {
        this._orderVisible = false;
    }

    showOrder(show = true) {
        this._orderVisible = show;
    }

    select(field) {
        this.onChange({
            keyOrderBy: field.key,
            nameOrderBy: field.name,
            direction: this.order.direction
        });
    }

    switchDirection() {
        this.onChange({
            keyOrderBy: this.order.keyOrderBy,
            nameOrderBy: this.order.nameOrderBy,
            direction: (this.order.direction === 'asc' ? 'desc' : 'asc')
        });
    }

    cancelKeydown(event) {
        event.preventDefault();
        return false;
    }
}

const OrderOmniboxComponent = {
    controller: OrderOmniboxController,
    bindings: {
        order: '<',
        onChange: '&'
    },
    template: `
        <div class="order-omnibox">
            <div class="text">
                <input
                    ng-click="$ctrl.showOrder(true)"
                    value="{{ $ctrl.order.nameOrderBy }}"
                    ng-blur="$ctrl.showOrder(false)"
                    ng-keydown="$ctrl.cancelKeydown($event)"
                />
                <ul ng-if="$ctrl._orderVisible">
                    <li
                        ng-repeat="field in $ctrl.order.fields"
                        ng-mousedown="$ctrl.select(field)">
                        {{ field.name }}
                    </li>
                </ul>
            </div>
            <div class="direction"
            ng-click="$ctrl.switchDirection()"
            ng-class="$ctrl.order.direction">
            </div>
        </div>
    `
};

export default OrderOmniboxComponent;
