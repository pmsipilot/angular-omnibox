# [2.0.0](https://github.com/pmsipilot/angular-omnibox/compare/v1.2.2...v2.0.0) (2019-02-04)

### BREAKING CHANGES
* Attribute `datas` is renamed `config` :
  * From : `<pm-angular-omnibox datas="$ctrl.datasOmnibox" />`
  * To : `<pm-angular-omnibox config="$ctrl.configOmnibox" />`
* The config's key `autocomplete` does not accept `Promise` anymore, only `array` :
  * From : `config.pokemons.autocomplete = this.$http.get(uri)`
  * To : `this.$http.get(uri).then((pokemons) => { config.pokemons.autocomplete = pokemons; })`

### Features

* Add search history and ability to load last history entry ([8bd8e04](https://github.com/pmsipilot/angular-omnibox/commit/8bd8e04))
  * The history is stored in the LocalStorage under the key `omnibox-history`
  * You can inject the `OmniboxStorageService` and use the `lockOn` method to prepend a string to this string :
    * `OmniboxStorageService.lockOn(this.user.name)`

## 1.2.2 (2018-12-06)


### Bug Fixes

* github link + gif example ([0e31033](https://github.com/pmsipilot/angular-omnibox/commit/0e31033))
* Multiple tokens and fix js errors ([37157d8](https://github.com/pmsipilot/angular-omnibox/commit/37157d8))


*Fork from a private gitlab repository*
