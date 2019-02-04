export default class StorageService {
    /* @ngInject */
    constructor($window) {
        this.$window = $window;
        this.lock = '';
    }

    /**
     * A string to lock the elements stored with this service.
     *
     * For example, you can use the username or the token of your users
     *
     * @param lock
     */
    lockOn(lock) {
        this.lock = lock;
    }

    /**
     * Remove the given keys from the storage
     * @param keys array
     */
    clearKeys(keys) {
        keys.forEach((key) => {
            this.$window.localStorage.removeItem(this.getLockedKey(key));
        });
    }

    getLockedKey(key) {
        return this.lock !== '' ? `${this.lock}-${key}` : key;
    }

    addElement(key, element, limit = 5) {
        let elements = this.getElements(key);
        const equivalentIndex = elements.findIndex(elem => this.areEquivalents(elem, element));
        if (equivalentIndex < 0) {
            elements = elements.filter((val, ind, arr) => val.length === 0 || limit < 0 || (arr.length - ind) < limit);
        } else {
            elements.splice(equivalentIndex, 1);
        }

        elements.push(element);
        this.$window.localStorage.setItem(this.getLockedKey(key), angular.toJson(elements));
    }

    getElements(key) {
        return angular.fromJson(this.$window.localStorage.getItem(this.getLockedKey(key)) || '[]');
    }

    /**
     * Two arrays are equivalents if they have the same items even if they aren't in the same order
     * @param a
     * @param b
     * @returns boolean
     */
    areEquivalents(a, b) {
        if (angular.isArray(a) && angular.isArray(b)) {
            if (a.length !== b.length) {
                return false;
            }

            return a.reduce(
                (equivalent, aItem) => b.findIndex(bItem => this.areEquivalents(aItem, bItem)) > -1 && equivalent,
                true
            );
        }

        return angular.equals(a, b);
    }
}
