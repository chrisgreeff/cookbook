/*global YUI*/
YUI.add('ckbk-recipe', function(Y) {

	var Lang = Y.Lang,

		Recipe;

	Recipe = Y.Base.create('ckbkRecipe', Y.Model, [], {

	}, {
		ATTRS: {
			name: {
				validator: Lang.isString
			},

			// TODO: Enhance validators to check that each item in array is a String
			ingredients: {
				validator: Lang.isArray
			},

			instructions: {
				validator: Lang.isArray
			},

			serves: {
				validator: Lang.isNumber
			}
		}
	});

	Y.namespace('CKBK').Recipe = Recipe;

}, '1.0.0', { requires: ['base', 'model'] });
