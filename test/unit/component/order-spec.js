import { OrderOmniboxController } from '../../../src/js/component/order';

describe('OrderOmniboxComponent', () => {
    const getCtrl = () => {
        const ctrl = new OrderOmniboxController();
        ctrl.order = {
            keyOrderBy: 'title',
            nameOrderBy: 'Titre',
            direction: 'asc'
        };
        ctrl.onChange = (obj) => {};
        return ctrl;
    };

    it("constructor should init data", () => {
        const ctrl = getCtrl();
        expect(ctrl._orderVisible).toBeFalsy();
    });

    it("method showOrder should show orderVisible property", () => {
        const ctrl = getCtrl();
        ctrl.showOrder();
        expect(ctrl._orderVisible).toBeTruthy();
    });

    it("method select should call onChange event", () => {
        const ctrl = getCtrl();
        spyOn(ctrl, "onChange");
        ctrl.select({ key: 'banana', name: 'Hamburger' });
        expect(ctrl._orderVisible).toEqual(false);
        expect(ctrl.onChange).toHaveBeenCalledTimes(1);
        expect(ctrl.onChange).toHaveBeenCalledWith({ keyOrderBy: 'banana', nameOrderBy: 'Hamburger', direction: 'asc' });
    });

    it("should switchdirection", () => {
        const ctrl = getCtrl();
        spyOn(ctrl, "onChange");
        ctrl.switchDirection();
        expect(ctrl.onChange).toHaveBeenCalledTimes(1);
        expect(ctrl.onChange).toHaveBeenCalledWith({ keyOrderBy: 'title', nameOrderBy: 'Titre', direction: 'desc' });

        ctrl.order.direction = 'desc';
        ctrl.switchDirection();
        expect(ctrl.onChange).toHaveBeenCalledTimes(2);
        expect(ctrl.onChange).toHaveBeenCalledWith({ keyOrderBy: 'title', nameOrderBy: 'Titre', direction: 'asc' });
    });
});
