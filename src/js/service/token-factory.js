import Token from '../model/token';

export default class TokenFactory {
    createToken(key, name, color, availableValues) {
        const token = new Token(key, name, color);

        if (availableValues) {
            token.availableValues = availableValues;
        }
        return token;
    }

    unserialize(serialized) {
        const token = new Token(serialized.key, serialized.name, serialized.color);
        token.value = serialized.value;
        token.valueLabel = serialized.valueLabel;

        return token;
    }
}
