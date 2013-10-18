/*global YUI*/
YUI.add('ckbk-recipe-view', function(Y) {

	var Micro = new Y.Template(),

		RecipeView,

		_renderRecipe,

		CLASS_NAMES = {
			heading: 'ckbk-heading',
			recipeContainer: 'ckbk-recipe-container',
			recipeIngredients: 'ckbk-recipe-ingredients',
			recipeIngredientsContainer: 'ckbk-recipe-ingredients-container',
			recipeInstructions: 'ckbk-recipe-instructions'
		};

	_renderRecipe = Micro.compile(
		'<div class="' + CLASS_NAMES.heading + '">' +
			'<%= this.recipe.name %>' +
		'</div>' +
		'<div class="' + CLASS_NAMES.recipeContainer + ' row-fluid">' +
			'<div class="' + CLASS_NAMES.recipeIngredientsContainer + ' span3">' +
				'<div class="' + CLASS_NAMES.heading + '">' +
					'Ingredients' +
				'</div>' +
				'<ul class="' + CLASS_NAMES.recipeIngredients + '">' +
					'<% Y.Array.each(this.recipe.ingredients, function(ingredient) { %>' +
						'<li>' +
							'<%= ingredient %>' +
						'</li>' +
					'<% }); %>' +
				'</ul>' +
			'</div>' +
			'<ol class="' + CLASS_NAMES.recipeInstructions + ' span9">' +
				'<% Y.Array.each(this.recipe.instructions, function(instruction) { %>' +
					'<li>' +
						'<%= instruction %>' +
					'</li>' +
				'<% }); %>' +
			'</ol>' +
		'</div>');

	RecipeView = Y.Base.create('ckbkRecipeView', Y.View, [], {
		initializer: function() {
			this.render();
		},

		render: function() {
			var catalogListNode,
				categoriesJSON,
				recipe = this.get('model'),
				rightContainer = Y.one('.ckbk-right-section');

			rightContainer.setHTML(_renderRecipe({
				recipe: recipe.toJSON()
			}));

			return this;
		}
	});

	Y.namespace('CKBK').RecipeView = RecipeView;

}, '1.0.0', { requires: ['base', 'view', 'template', 'ckbk-recipe'] });
