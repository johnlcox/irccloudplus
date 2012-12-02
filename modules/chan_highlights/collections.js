define(['./models', 'mixins/connections'], function(model, m){
	var collection = Backbone.Collection.extend({
		initialize: function() {
			this.bind('handlerInstalled', function(){
				this.requestLatest('hChans');
				_.delay(function(){this.sendMsg('migration');}.bind(this), 1000, this);//request migrations
			});
			this.bind('add', this.sync, this);
			this.bind('remove', this.sync, this);
			this.bind('sync', this.sync, this);
		},
		model: model,
		msgHandler: function (data) {
			switch (data.type) {
				case 'storageDump':
					this.reset(data.data.hChans);
					this.trigger('storageDumpComplete');
					break;
				case 'migration':
					this.migration(data.data);	
					break;
			}
		},
		requestLatest: function(key) {
			this.sendMsg('getDump', key);
		},
		sync: function () {
			this.sendMsg('storageDump', this.toJSON());
		},
		sendMsg: function (type, data) {
			window.postMessage({
				type: type, 
				key: 'hChans',
				data: data, 
				src: 'host'
			}, "*");
		},
		isMatchedChannel: function (chan) {
			return this.filter(
						function(row){return row.id == chan;}
					).length !== 0;
		},
		migration: function (data) {
			switch (data.version) {
				case 13:
					servers = window.SESSION.connections.listServersFlat();
					_.each(data.data.chan_highlight, function (chan) {
						_.each(_.filter(servers, function (model){
								cname = chan.slice(chan.lastIndexOf('#') + 1);
								mname = model.name.slice(
									model.name.lastIndexOf('#') + 1);
								//remove prefexing #, if any
								return cname == mname;
						}), function (item){
							//add if we dont already have it
							ob = {id: item.id};
							if (!this.get(ob)) {
								this.add(ob);
							}
						}.bind(this));
					}.bind(this));
					
					//enable 
					if (data.data.playalert 
						&& SESSION.getPref('notifications-disableaudio')
					) {
						SESSION.setPref('notifications-disableaudio', false);		
					}
					this.sendMsg('postMigration', 13);
					break;
			}
		}
	});
	return new collection();
});
