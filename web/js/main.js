YUI().use('io-base', 'json-parse', 'node-base', 'ckbk-category', 'ckbk-category-list', 'ckbk-category-list-view', function(Y) {
	var CKBK = Y.CKBK;

	Y.io('/home/chris/Documents/Personal/Website/js/mock-data.json', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
		on: {
			success: function(tx, response) {
				console.log(response);
			},
			failure: function(tx, response) {
				var ckbkCategories = Y.JSON.parse(response.responseText),
					categoryList = new CKBK.CategoryList();

				Y.each(ckbkCategories, function(category) {
					categoryList.add(new CKBK.Category(category));
				});

				categoryListView = new CKBK.CategoryListView({ modelList: categoryList });

				categoryListView.render();
			}
		}
	});
});