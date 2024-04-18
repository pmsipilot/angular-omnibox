import '../src/js/module';

class ExampleOmniboxController {
    constructor($http) {
        this.$http = $http;
        this.omniboxResult = { tag: 'key2', title: 'hello' };
        this.configOmnibox = null;
        const basicConfigOmnibox = {
            title: {
                name: 'Title',
                exactName: false,
                unique: true
            },
            tag: {
                name: 'Tag',
                exactName: true,
                unique: false,
                background: '#d0f2f7',
                autocomplete: [
                    { key: 'key1', name: 'name1' },
                    { key: 'key2', name: 'name2' },
                    { key: 'key3', name: 'name3' },
                    { key: 'key4', name: 'name4' },
                    { key: 'key5', name: 'name5' }
                ]
            }
        };

        this.getPokemon().then((pokemons) => {
            basicConfigOmnibox.pokemon = {
                name: 'Pokemon',
                exactName: true,
                unique: true,
                background: '#ffd5d7',
                autocomplete: pokemons
            };

            this.configOmnibox = basicConfigOmnibox;
        });

        this.orderOmnibox = {
            keyOrderBy: 'title',
            nameOrderBy: 'Title',
            direction: 'asc',
            fields: [
                {
                    key: 'title',
                    name: 'Title'
                },
                {
                    key: 'createdAt',
                    name: 'Creation date'
                }
            ]
        };

        this.colorOmnibox = {
            historyButton: '#0f655e',
            searchButton: '#0f655e'
        };
    }

    getPokemon() {
        return this.$http.get('https://pokeapi.co/api/v2/pokemon/?limit=1000').then(result => result.data.results.map(
            pokemon => ({ name: pokemon.name, key: pokemon.name })
        ));
    }

    omniboxCallback(result) {
        this.omniboxResult = result;
    }

}

const ExampleOmniboxComponent = {
    controller: ['$http', ExampleOmniboxController],
    template: `
        <div>
            <h1>Angular Omnibox demo</h1>
            <pm-angular-omnibox
                ng-if="$ctrl.configOmnibox !== null"
                config="$ctrl.configOmnibox"
                order="$ctrl.orderOmnibox"
                color="$ctrl.colorOmnibox"
                default-token="'title'"
                init-tokens="$ctrl.omniboxResult"
                on-valid="$ctrl.omniboxCallback(result)">
            </pm-angular-omnibox>
            <h2>Result object</h2>
            <textarea>{{ $ctrl.omniboxResult }}</textarea>
        </div>
    `
};


angular.module('myApp', ['angular-omnibox'])
    .component('pmExampleOmnibox', ExampleOmniboxComponent);
