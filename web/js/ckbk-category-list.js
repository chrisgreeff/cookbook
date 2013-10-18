/*global YUI*/
YUI.add('ckbk-category-list', function(Y) {

	var CategoryList;

	CategoryList = Y.Base.create('ckbkCategoryList', Y.ModelList, [], {
		model: Y.CKBK.Category,

		getCategoryByName: function(name) {
			var result = null;

			this.some(function(category) {
				if (category.get('name') === name) {
					result = category;
					return true;
				}
			});

			return result;
		}
	});

	Y.namespace('CKBK').CategoryList = CategoryList;

}, '1.0.0', { requires: ['base', 'model-list', 'ckbk-category'] });
