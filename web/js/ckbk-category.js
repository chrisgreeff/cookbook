/*global YUI*/
YUI.add('ckbk-category', function(Y) {

	var Lang = Y.Lang,
		RecipeList = Y.CKBK.RecipeList,

		Category;

	Category = Y.Base.create('ckbkCategory', Y.Model, [], {
		
	}, {
		ATTRS: {
			name: {
				validator: Lang.isString
			},

			recipes: {
				setter: function (value) {
					var recipes,
						result;

					recipes = this.get('recipes');
					if (value instanceof RecipeList) {
						if (recipes) {
							recipes.destroy();
						}
						return value;
					}
					if (Lang.isObject(value)) {
						result = recipes || new RecipeList();
						result.reset(value);
						return result;
					}
					return Y.Attribute.INVALID_VALUE;
				},
				valueFn: function() {
					return new RecipeList();
				}
			}
		}
	});

	Y.namespace('CKBK').Category = Category;

}, '1.0.0', { requires: ['base', 'model', 'ckbk-recipe-list'] });