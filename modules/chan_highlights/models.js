define(function () {
	return Backbone.Model.extend({
		intialize: function() {
			//this.bind('all', function(a, b, c){console.log(a, b, c)}, this);
		},
		saved: function(a) {
			//console.log('model saved', this, a);
			//this.collection.fetch();
		},
		url: '/',
		defaults: {
			name: '',
			id: '',
			type: ''
		},
		sync: function (method, model, options) {
			console.log('sync event', method, model);
		}
	});
});	