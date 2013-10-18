/*global YUI*/
YUI.add('ckbk-category-list-view', function(Y) {

	var Micro = new Y.Template(),
		Lang = Y.Lang,
		RecipeView = Y.CKBK.RecipeView,

		CategoryListView,

		_renderCategoryList,

		CLASS_NAMES = {
			category: 'ckbk-category',
			categoryHidden: 'ckbk-category-hidden',
			categoryLabel: 'ckbk-category-label',
			categoryRecipes: 'ckbk-category-recipes',
			categoryRecipe: 'ckbk-category-recipe',
			categoryRecipeLabel: 'ckbk-category-recipe-label',
			container: 'ckbk-catalog-container',
			catalogList: 'ckbk-catalog-list',
			heading: 'ckbk-heading'
		};

	_renderCategoryList = Micro.compile(
		'<div class="' + CLASS_NAMES.container + '">' +
			'<div class="' + CLASS_NAMES.heading + '">Catalog</div>' +
			'<ul class="' + CLASS_NAMES.catalogList + '">' +
				'<% Y.Array.each(this.categories, function(category) { %>' +
					'<li class="' + CLASS_NAMES.category + '">' +
						'<a href="#" class="' + CLASS_NAMES.categoryLabel + '">' +
							'<%= category.name %>' +
						'</a>' +
						'<ul class="' + CLASS_NAMES.categoryRecipes + ' ' + CLASS_NAMES.categoryHidden + '">' +
							'<% Y.Array.each(category.recipes, function(recipe) { %>' +
								'<li class="' + CLASS_NAMES.categoryRecipe + '">' +
									'<a href="#" class="' + CLASS_NAMES.categoryRecipeLabel + '">' +
										'<%= recipe.name %>' +
									'</a>' +
								'</li>' +
							'<% }); %>' +
						'</ul>' +
					'</li>' +
				'<% }); %>' +
			'</ul>' +
		'</div>');

	CategoryListView = Y.Base.create('ckbkCategoryListView', Y.View, [], {
		initializer: function() {
			var list = this.get('modelList');

			list.after(['add', 'remove', 'reset', '*.change'], this.render, this);
		},

		render: function() {
			var catalogListNode,
				categoriesJSON,
				categories = this.get('modelList'),
				leftContainer = Y.one('.ckbk-left-section');

			// Need to recursively json-ify the categories model list items
			categoriesJSON = Y.Array.map(categories.toJSON(), function(category) {
				return {
					name: category.name,
					recipes: category.recipes.toJSON()
				}
			});

			leftContainer.setHTML(_renderCategoryList({
				categories: categoriesJSON
			}));

			catalogListNode = Y.one('.' + CLASS_NAMES.catalogList);

			catalogListNode.delegate('click', this._showCategoryRecipes, '.' + CLASS_NAMES.categoryLabel, this);
			catalogListNode.delegate('click', this._renderRecipe, '.' + CLASS_NAMES.categoryRecipeLabel, this);

			return this;
		},

		// ======= Event Handlers =========================================

		// TODO: Logic should be moved to controller?
		_renderRecipe: function(event) {
			event.preventDefault();
			var category,
				recipe,
				activeRecipeView = this.get('activeRecipeView'),
				categories = this.get('modelList'),
				categoryName = event.currentTarget.ancestor('.' + CLASS_NAMES.category).one('.' + CLASS_NAMES.categoryLabel).getHTML(),
				recipeName = event.currentTarget.getHTML();

			category = categories.getCategoryByName(categoryName);
			recipe = category.get('recipes').getRecipeByName(recipeName);

			if (activeRecipeView) {
				activeRecipeView.destroy();
			}
			this.set('activeRecipeView', new RecipeView({model: recipe}));
		},

		_showCategoryRecipes: function(event) {
			event.preventDefault();
			var categoryNode = event.currentTarget.get('parentNode'),
				catalogList = event.container;

			catalogList.all('.' + CLASS_NAMES.categoryRecipes).addClass(CLASS_NAMES.categoryHidden);
			categoryNode.one('.' + CLASS_NAMES.categoryRecipes).removeClass(CLASS_NAMES.categoryHidden);
		}
	}, {
		ATTRS: {
			// TODO: The view should not know which one is active... Move to RecipeList?
			activeRecipeView: {
				validator: function(value) {
					if (value instanceof RecipeView) {
						return true;
					} else {
						return false;
					}
				}
			}
		}
	});

	Y.namespace('CKBK').CategoryListView = CategoryListView;

}, '1.0.0', { requires: ['base', 'view', 'template', 'ckbk-category-list', 'ckbk-recipe-view'] });
