import { TokenOmniboxController } from '../../../src/js/component/token';

describe('TokenOmniboxController', () => {
    const getCtrl = () => {
        const ctrl = new TokenOmniboxController();
        ctrl.onChange = (obj) => {};
        ctrl.onDelete = (obj) => {};
        return ctrl;
    };

    it("delete method should call onDelete event", () => {
        const ctrl = getCtrl();
        spyOn(ctrl, "onDelete");
        ctrl.delete();
        expect(ctrl.onDelete).toHaveBeenCalled();
    });

    it("change method should call onChange event", () => {
        const ctrl = getCtrl();
        spyOn(ctrl, "onChange");
        ctrl.change({});
        expect(ctrl.onChange).toHaveBeenCalled();
    });
});
