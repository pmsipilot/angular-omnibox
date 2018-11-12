import { TypeaheadOmniboxController } from '../../../src/js/component/typeahead';
const Promise = require('es6-promise').Promise;
// Array.prototype.find not defined
// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/find#Proth%C3%A8se_d'%C3%A9mulation_(polyfill)
Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
        // 1. Let O be ? ToObject(this value).
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;

        // 3. If IsCallable(predicate) is false, throw a TypeError exception.
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }

        // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
        var thisArg = arguments[1];

        // 5. Let k be 0.
        var k = 0;

        // 6. Repeat, while k < len
        while (k < len) {
            // a. Let Pk be ! ToString(k).
            // b. Let kValue be ? Get(O, Pk).
            // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
            // d. If testResult is true, return kValue.
            var kValue = o[k];
            if (predicate.call(thisArg, kValue, k, o)) {
                return kValue;
            }
            // e. Increase k by 1.
            k++;
        }

        // 7. Return undefined.
        return undefined;
    },
    configurable: true,
    writable: true
});

describe('TypeaheadOmniboxController', () => {
    const getCtrl = (data = [], exactName = true, perdure = true, autoFocus = false) => {
        const ctrl = new TypeaheadOmniboxController();
        ctrl.data = data;
        ctrl.exactName = exactName;
        ctrl.perdure = perdure;
        ctrl.autoFocus = autoFocus;
        ctrl.onSelect = () => {};
        ctrl.onValid = () => {};
        ctrl.onBackspace = () => {};
        ctrl.$filter = (a, b, c) => { return [] };
        return ctrl;
    };

    describe('constructor', () => {
        it('should init all vars', () => {
            const ctrl = getCtrl();
            expect(ctrl._input).toEqual('');
            expect(ctrl._resultBoxVisible).toEqual(false);
            expect(ctrl._isAutoComplete).toEqual(true);
            expect(ctrl._loading).toEqual(false);
            expect(ctrl._preselectedField).toEqual(null);
            expect(ctrl._defaultField).toEqual(null);
            expect(ctrl._preventBlur).toEqual(false);
            expect(ctrl._lastBackspace).toBe(0);
            expect(ctrl.data).toEqual(jasmine.any(Array));
            expect(ctrl.data.length).toBe(0);

            const ctrl2 = getCtrl(['foo', 'bar']);
            expect(ctrl2.data).toEqual(jasmine.any(Array));
            expect(ctrl2.data.length).toBe(2);
        });
    });

    describe('$onInit', () => {
        it("should take a promise callback as parameter", done => {
            const mockedPromise = {
                promise: () => {
                    return new Promise((resolve, reject) => {
                        return resolve(['a', 'b']);
                    });
                }
            };
            spyOn(mockedPromise, 'promise').and.callThrough();
            const ctrl = getCtrl(mockedPromise.promise);
            ctrl.$onInit();

            expect(mockedPromise.promise).toHaveBeenCalled();
            expect(mockedPromise.promise).toHaveBeenCalledTimes(1);
            expect(ctrl.data).toEqual(jasmine.any(Function));

            mockedPromise.promise().then(result => {
                expect(ctrl.data).toEqual(['a', 'b']);
            }).finally(done);
        });
    });

    describe('input Setter', () => {
        it('should set the var', () => {
            const ctrl = getCtrl();
            ctrl.input = 'foo';
            expect(ctrl._input).toEqual('foo');
        });

        it('should empty the var if perdure is false', () => {
            const ctrl = getCtrl();
            ctrl.perdure = false;
            ctrl.input = 'foo';
            expect(ctrl._input).toEqual('');
        });
    });

    describe('initValue', () => {
        it('should not prefill "input" on load if there is exactName', () => {
            const ctrl = getCtrl();
            ctrl.value = 'foo';
            ctrl.perdure = true;
            ctrl.getFilteredData = () => { return []; };
            ctrl.initValue();

            expect(ctrl._input).toEqual('');
            expect(ctrl._loading).toEqual(false);
        });

        it('should prefill "input" on load if there is no exactName', () => {
            const ctrl = getCtrl();
            ctrl.value = 'foo';
            ctrl.perdure = true;
            ctrl.exactName = false;
            ctrl.getFilteredData = () => { return []; };
            ctrl.initValue();

            expect(ctrl._input).toEqual('foo');
            expect(ctrl._loading).toEqual(false);
        });

        it('should prefill "input" on load', () => {
            const ctrl = getCtrl();
            ctrl.value = 'foo';
            ctrl.perdure = true;
            ctrl.getFilteredData = () => {
                return [
                    {
                        name: "fooBar"
                    }
                ];
            };
            ctrl.initValue();
            expect(ctrl._input).toEqual('fooBar');
            expect(ctrl._loading).toEqual(false);
        });

        it('should do nothing if there is no value', () => {
            const ctrl = getCtrl();
            ctrl.getFilteredData = () => { return []; };
            ctrl.initValue();
            expect(ctrl._input).toEqual('');
            expect(ctrl._loading).toEqual(false);
        });
    });

    describe('isResultBoxVisible', () => {
        it('should be false', () => {
            const ctrl = getCtrl();
            expect(ctrl.isResultBoxVisible()).toEqual(false);
        });

        it('should be true if typeahead has result && filtered datas || default data', () => {
            const ctrl = getCtrl();
            ctrl._loading = false;
            ctrl._isAutoComplete = true;
            ctrl._resultBoxVisible = true;
            ctrl.hasFilteredData = () => true;
            ctrl.hasDefault = () => false;
            expect(ctrl.isResultBoxVisible()).toEqual(true);
            ctrl.hasFilteredData = () => false;
            ctrl.hasDefault = () => true;
            expect(ctrl.isResultBoxVisible()).toEqual(true);
            ctrl.hasFilteredData = () => true;
            ctrl.hasDefault = () => true;
            expect(ctrl.isResultBoxVisible()).toEqual(true);
            ctrl.hasFilteredData = () => false;
            ctrl.hasDefault = () => false;
            expect(ctrl.isResultBoxVisible()).toEqual(false);
        });

        it('should be false whatever happen when _resultBoxVisible is false', () => {
            const ctrl = getCtrl();
            ctrl._loading = false;
            ctrl._isAutoComplete = true;
            ctrl._resultBoxVisible = false;
            ctrl.hasFilteredData = () => true;
            ctrl.hasDefault = () => false;
            expect(ctrl.isResultBoxVisible()).toEqual(false);
        });
    });

    describe('getFilteredData', () => {
        it('should call $filter with good args', () => {
            const ctrl = getCtrl();
            spyOn(ctrl, "$filter").and.returnValue([]);
            ctrl._input = 'foo';
            ctrl.getFilteredData('bar');
            expect(ctrl.$filter).toHaveBeenCalledWith([], 'bar', false);
            ctrl.$filter.calls.reset();
            ctrl.getFilteredData('420');
            expect(ctrl.$filter.calls.allArgs()).toEqual([[[], '420', false], [[], 420, false]]);
            ctrl.$filter.calls.reset();
            ctrl.getFilteredData();
            expect(ctrl.$filter).toHaveBeenCalledWith([], 'foo', false);
        });
    });

    describe('hasFilteredData', () => {
        it('should return if there is filtered datas', () => {
            const ctrl = getCtrl();
            spyOn(ctrl, "$filter").and.returnValue([]);
            ctrl._input = 'foo';
            ctrl.getFilteredData('bar');
            expect(ctrl.$filter).toHaveBeenCalledWith([], 'bar', false);
            ctrl.$filter.calls.reset();
            ctrl.getFilteredData('420');
            expect(ctrl.$filter.calls.allArgs()).toEqual([[[], '420', false], [[], 420, false]]);
            ctrl.$filter.calls.reset();
            ctrl.getFilteredData();
            expect(ctrl.$filter).toHaveBeenCalledWith([], 'foo', false);
        });
    });

    describe('deleteLastToken', () => {
        it('should do nothing if it\'s first time or input is not empty' , () => {
            const ctrl = getCtrl();
            spyOn(ctrl, "onBackspace");
            ctrl._input = '';
            ctrl.deleteLastToken();
            expect(ctrl.onBackspace).not.toHaveBeenCalled();
            ctrl._input = 'foo';
            ctrl.deleteLastToken();
            expect(ctrl.onBackspace).not.toHaveBeenCalled();
            ctrl._input = '';
            ctrl.deleteLastToken();
            expect(ctrl.onBackspace).toHaveBeenCalled();
        });
    });

    describe('setPreselectedField', () => {
        it('should set _preselectedField', () => {
            const ctrl = getCtrl();
            ctrl.setPreselectedField();
            expect(ctrl._preselectedField).toEqual(null);
            ctrl.setPreselectedField('foo');
            expect(ctrl._preselectedField).toEqual('foo');
        });
    });

    describe('buildPreselectedDefault', () => {
        it('should do nothing if there is no default', () => {
            const ctrl = getCtrl();
            ctrl.hasDefault = () => false;
            ctrl.buildPreselectedDefault();
            expect(ctrl._defaultField).toEqual(null);
        });

        it('should build default', () => {
            const ctrl = getCtrl();
            ctrl.hasDefault = () => true;
            ctrl.getDefault = () => {
                return { key: 'foo', name: 'bar' };
            };
            ctrl._input = 'foobar';
            ctrl.buildPreselectedDefault();
            expect(ctrl._defaultField).toEqual({
                key: 'foo',
                name: 'bar',
                value: 'foobar'
            });
        });
    });

    describe('selectField', () => {
        it('should call setPreselectedField and onSelect', () => {
            const ctrl = getCtrl();
            spyOn(ctrl, "setPreselectedField");
            spyOn(ctrl, "onSelect");
            ctrl.selectField('pizza');
            expect(ctrl.setPreselectedField).toHaveBeenCalledWith(null);
            expect(ctrl.onSelect).toHaveBeenCalledWith({ field: 'pizza' });
        });
    });

    describe('setBoxVisibility', () => {
        it('should set _resultBoxVisible', () => {
            const ctrl = getCtrl();
            ctrl.setBoxVisibility();
            expect(ctrl._resultBoxVisible).toEqual(true);
            ctrl.setBoxVisibility(false);
            expect(ctrl._resultBoxVisible).toEqual(false);
            ctrl.setBoxVisibility(true);
            expect(ctrl._resultBoxVisible).toEqual(true);
        });

        it('should set _preventBlur when called with true', () => {
            const ctrl = getCtrl();
            ctrl._preventBlur = true;
            ctrl.setBoxVisibility(false);
            expect(ctrl._preventBlur).toEqual(true);
            ctrl.setBoxVisibility(true);
        });

        it('should call clean when called with false', () => {
            const ctrl = getCtrl();
            spyOn(ctrl, "clean");
            ctrl._preventBlur = false;
            ctrl.setBoxVisibility(true);
            expect(ctrl.clean).not.toHaveBeenCalled();
            ctrl._preventBlur = true;
            ctrl.setBoxVisibility(false);
            expect(ctrl.clean).not.toHaveBeenCalled();
            ctrl._preventBlur = false;
            ctrl.setBoxVisibility(false);
            expect(ctrl.clean).toHaveBeenCalled();
        });
    });

    describe('onFieldClick', () => {
        it('should select field', () => {
            const ctrl = getCtrl();
            const spy = spyOnProperty(ctrl, "input", 'set');
            spyOn(ctrl, "selectField");
            ctrl._preventBlur = false;
            ctrl.onFieldClick({ name: 'foobar' });
            expect(spy).toHaveBeenCalledWith('foobar');
            expect(ctrl.selectField).toHaveBeenCalledWith({ name: 'foobar' });
            expect(ctrl._preventBlur).toEqual(true);
        });
    });

    describe('clean', () => {
        it('should clean setPreselectedField, selectField and input', () => {
            const ctrl = getCtrl();
            const spy = spyOnProperty(ctrl, "input", 'set');
            spyOn(ctrl, "setPreselectedField");
            spyOn(ctrl, "onBackspace");

            ctrl.isToken = false;
            ctrl.clean();
            expect(spy).toHaveBeenCalledWith('');
            expect(ctrl.setPreselectedField).toHaveBeenCalledWith(null);
            expect(ctrl.onBackspace).not.toHaveBeenCalled();

            ctrl.isToken = true;
            ctrl.clean();
            expect(spy).toHaveBeenCalledWith('');
            expect(ctrl.setPreselectedField).toHaveBeenCalledWith(null);
            expect(ctrl.onBackspace).toHaveBeenCalled();
        });
    });

    describe('checkBeforeValidate', () => {
        it('should do nothing if there is a preselected field', () => {
            const ctrl = getCtrl();
            const spy = spyOnProperty(ctrl, "input", 'set');
            spyOn(ctrl, "selectField");
            spyOn(ctrl, "clean");
            spyOn(ctrl, "onValid");
            ctrl._preselectedField = true;
            ctrl.checkBeforeValidate();
            expect(spy).not.toHaveBeenCalled();
            expect(ctrl.selectField).not.toHaveBeenCalled();
            expect(ctrl.clean).not.toHaveBeenCalled();
            expect(ctrl.onValid).not.toHaveBeenCalled();
        });

        it('should select and valid if it is a token typeahead', () => {
            const ctrl = getCtrl();
            const spy = spyOnProperty(ctrl, "input", 'set');
            spyOn(ctrl, "selectField");
            spyOn(ctrl, "clean");
            spyOn(ctrl, "onValid");
            ctrl._preselectedField = false;
            ctrl.isToken = true;
            ctrl.exactName = false;
            ctrl._input = 'marmotte';
            ctrl.checkBeforeValidate();
            expect(spy).toHaveBeenCalledWith('marmotte');
            expect(ctrl.selectField).toHaveBeenCalledWith({key: 'marmotte', name: 'marmotte'});
            expect(ctrl.onValid).toHaveBeenCalled();
            expect(ctrl.clean).not.toHaveBeenCalled();
        });

        it('should valid if it is not a token typeahead', () => {
            const ctrl = getCtrl();
            const spy = spyOnProperty(ctrl, "input", 'set');
            spyOn(ctrl, "selectField");
            spyOn(ctrl, "clean");
            spyOn(ctrl, "onValid");
            ctrl._preselectedField = false;
            ctrl.isToken = false;
            ctrl._input = '';
            ctrl.checkBeforeValidate();
            expect(spy).toHaveBeenCalledWith('');
            expect(ctrl.selectField).not.toHaveBeenCalled();
            expect(ctrl.onValid).toHaveBeenCalled();
            expect(ctrl.clean).not.toHaveBeenCalled();
        });

        it('should clean', () => {
            const ctrl = getCtrl();
            const spy = spyOnProperty(ctrl, "input", 'set');
            spyOn(ctrl, "selectField");
            spyOn(ctrl, "clean");
            spyOn(ctrl, "onValid");
            ctrl.exactName = true;
            ctrl._preselectedField = false;
            ctrl._input = '';
            ctrl.isToken = true;
            ctrl.checkBeforeValidate();
            expect(spy).not.toHaveBeenCalled();
            expect(ctrl.selectField).not.toHaveBeenCalled();
            expect(ctrl.onValid).not.toHaveBeenCalled();
            expect(ctrl.clean).toHaveBeenCalled();
            ctrl._input = 'aa';
            ctrl.isToken = false;
            ctrl.checkBeforeValidate();
            expect(spy).not.toHaveBeenCalled();
            expect(ctrl.selectField).not.toHaveBeenCalled();
            expect(ctrl.onValid).not.toHaveBeenCalled();
            expect(ctrl.clean).toHaveBeenCalled();
        });
    });

    describe('eventKeydown', () => {
        it('backspace should call deleteLastToken', () => {
            const ctrl = getCtrl();
            spyOn(ctrl, "deleteLastToken");
            ctrl.eventKeydown({which: 8});
            expect(ctrl.deleteLastToken).toHaveBeenCalled();
        });

        it('escape should cancel preselection', () => {
            const ctrl = getCtrl();
            spyOn(ctrl, "setPreselectedField");
            ctrl.eventKeydown({which: 27});
            expect(ctrl.setPreselectedField).toHaveBeenCalledWith(null);
        });

        it('tab, enter & right arrow should select preselection or validate', () => {
            const ctrl = getCtrl();
            const spy = spyOnProperty(ctrl, "input", 'set');
            spyOn(ctrl, "selectField");
            spyOn(ctrl, "checkBeforeValidate");

            [9, 13, 39].forEach((which) => {
                // reset spys
                spy.calls.reset();
                ctrl.selectField.calls.reset();
                ctrl.checkBeforeValidate.calls.reset();
                // set vars
                ctrl._preventBlur = false;
                ctrl._preselectedField = { name: 'banana' };
                // call event
                ctrl.eventKeydown({ which });
                // expects
                expect(ctrl._preventBlur).toEqual(true);
                expect(spy).toHaveBeenCalledWith('banana');
                expect(ctrl.selectField).toHaveBeenCalledWith({ name: 'banana' });
                expect(ctrl.checkBeforeValidate).not.toHaveBeenCalled();

                // reset spys
                spy.calls.reset();
                ctrl.selectField.calls.reset();
                ctrl.checkBeforeValidate.calls.reset();
                // set vars
                ctrl._preventBlur = false;
                ctrl._preselectedField = false;
                // call event
                ctrl.eventKeydown({ which });
                // expects
                expect(ctrl._preventBlur).toEqual(true);
                expect(spy).not.toHaveBeenCalled();
                expect(ctrl.selectField).not.toHaveBeenCalled();
                if (which === 13) {
                    expect(ctrl.checkBeforeValidate).toHaveBeenCalled();
                } else {
                    expect(ctrl.checkBeforeValidate).not.toHaveBeenCalled();
                }
            });
        });

        it('up arrow should preselect previous', () => {
            const ctrl = getCtrl();
            spyOn(ctrl, "preselectNext");
            ctrl.eventKeydown({which: 38});
            expect(ctrl.preselectNext).toHaveBeenCalledWith(true);
        });

        it('down arrow should preselect previous', () => {
            const ctrl = getCtrl();
            spyOn(ctrl, "preselectNext");
            ctrl.eventKeydown({which: 40});
            expect(ctrl.preselectNext).toHaveBeenCalledWith();
        });
    });

    describe('eventChange', () => {
        it('should preselect first result of filter', () => {
            const ctrl = getCtrl();
            spyOn(ctrl, "setPreselectedField");
            spyOn(ctrl, "buildPreselectedDefault");
            spyOn(ctrl, "getFilteredData").and.returnValue(['first', 'second']);
            ctrl.hasDefault = () => false;
            ctrl.eventChange();
            expect(ctrl.getFilteredData).toHaveBeenCalled();
            expect(ctrl.setPreselectedField).toHaveBeenCalledWith('first');
            expect(ctrl.buildPreselectedDefault).not.toHaveBeenCalled();
        });

        it('should preselect first result of filter', () => {
            const ctrl = getCtrl();
            spyOn(ctrl, "setPreselectedField");
            spyOn(ctrl, "buildPreselectedDefault");
            spyOn(ctrl, "getFilteredData").and.returnValue(['first', 'second']);
            ctrl._defaultField = 'default';
            ctrl.hasDefault = () => true;
            ctrl.eventChange();
            expect(ctrl.getFilteredData).not.toHaveBeenCalled();
            expect(ctrl.buildPreselectedDefault).toHaveBeenCalled();
            expect(ctrl.setPreselectedField).toHaveBeenCalledWith('default');
        });
    });

    describe('hasDefault', () => {
        it('should return if there is a default value', () => {
            const ctrl = getCtrl();
            ctrl.defaultToken = 'peperoni';
            ctrl._input = '';
            ctrl.data = [{ key: 'hello'}];
            expect(ctrl.hasDefault()).toEqual(false);
            ctrl._input = 'foo';
            expect(ctrl.hasDefault()).toEqual(false);
            ctrl.data = [{ key: 'peperoni'}];
            expect(ctrl.hasDefault()).toEqual(true);
            ctrl._input = '';
            expect(ctrl.hasDefault()).toEqual(false);
        });
    });

    describe('getDefault', () => {
        it('should return the default value', () => {
            const ctrl = getCtrl();
            ctrl.data = [{ key: 'peperoni'}, { key: 'ananas'}];
            ctrl.defaultToken = 'peperoni';
            expect(ctrl.getDefault()).toEqual({ key: 'peperoni'});
        });
    });
});
