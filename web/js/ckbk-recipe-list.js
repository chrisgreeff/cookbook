/*global YUI*/
YUI.add('ckbk-recipe-list', function(Y) {

	var RecipeList;

	RecipeList = Y.Base.create('ckbkRecipeList', Y.ModelList, [], {
		model: Y.CKBK.Recipe,

		getRecipeByName: function(name) {
			var result = null;

			this.some(function(recipe) {
				if (recipe.get('name') === name) {
					result = recipe;
					return true;
				}
			});

			return result;
		}
	});

	Y.namespace('CKBK').RecipeList = RecipeList;

}, '1.0.0', { requires: ['base', 'model-list', 'ckbk-recipe'] });
