export default class Token {
    constructor(key, name, color) {
        this._key = key;
        this._name = name;
        this._value = '';
        this._color = color;
        this._valueLabel = '';
        this._multiple = false;
        this._availableValues = null;
    }

    get key() {
        return this._key;
    }

    get name() {
        return this._name;
    }

    get value() {
        return this._value;
    }

    get color() {
        return this._color;
    }

    get valueLabel() {
        return this._valueLabel;
    }

    get multiple() {
        return this._multiple;
    }

    get availableValues() {
        return this._availableValues;
    }

    set value(val) {
        this._value = val;
    }

    set valueLabel(label) {
        this._valueLabel = label !== null ? label : '';
    }

    set multiple(boolean) {
        this._multiple = boolean;
    }

    set availableValues(values) {
        this._availableValues = values && values.length > 0 ? values : null;
    }

    serialize() {
        return {
            key: this._key,
            name: this._name,
            color: this._color,
            value: this._value,
            valueLabel: this._valueLabel
        };
    }
}
