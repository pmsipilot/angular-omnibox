import '../src/js/module';
class ExampleOmniboxController {
    constructor($http) {
        this.$http = $http;
        this.omniboxResult = { tag: 'key2', title: 'hello' };
        this.datasOmnibox = {
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
            },
            pokemon: {
                name: 'Pokemon',
                exactName: true,
                unique: true,
                background: '#ffd5d7',
                autocomplete: () => this.getPokemon().then(pokemons =>
                    pokemons.results.map((pokemon) => {
                        const obj = {
                            name: pokemon.name,
                            key: pokemon.name
                        };
                        return obj;
                    })
                )
            }
        };

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
    }

    getPokemon() {
        return this.$http.get("https://pokeapi.co/api/v2/pokemon/?limit=1000").then(result => result.data);
    };

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
                datas="$ctrl.datasOmnibox"
                order="$ctrl.orderOmnibox"
                default-token="'title'"
                init-tokens="$ctrl.omniboxResult"
                on-valid="$ctrl.omniboxCallback(result)">
            </pm-angular-omnibox>
            <textarea>{{ $ctrl.omniboxResult }}</textarea>
        </div>
    `
};


angular.module('myApp', ['angular-omnibox'])
    .component('pmExampleOmnibox', ExampleOmniboxComponent);
