define(['./models'], function(model){
	var collection = Backbone.Collection.extend({
		initialize: function() {
			//request an update from the background page, to populate the collection
			this.requestLatest('hChans');
			this.bind('add', this.sync, this);
			this.bind('remove', this.sync, this);
			this.bind('sync', this.sync, this);
		},
		model: model,
		requestLatest: function(key) {
			window.postMessage({
				type: 'getDump', 
				data: key, 
				src: 'host'
			}, "*");
		},
		sync: function (a, v) {
			console.log('sync', this.toJSON());
			window.postMessage({
				type: 'storageDump', 
				key: 'hChans',
				data: this.toJSON(), 
				src: 'host'
			}, "*");
		},
		isMatchedChannel: function (chan) {
			return this.filter(
						function(row){return row.id == chan;}
					).length !== 0;
		}
	});
	return new collection();
});
