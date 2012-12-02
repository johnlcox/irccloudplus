define(['./collections', 
		'mixins/connections',
		'text!templates/hCHans.txt', 
		'text!templates/hChans-tr.txt'
		], function(collection, m, hChans, hChans_tr) {
	return Backbone.View.extend({
		el: '#hChans-tr',
		session: window.SESSION,
		sessionview: window.SESSIONVIEW,
		collection: collection,
		trData: {
				id: 'hChans',
				label: 'Highlight channels',
				name: 'hChans'
		},
		initialize: function(model){
			this.renderTr();

			//server/channel list
			this.session.connections.on('add', this.render, this);
			this.session.connections.on('remove', this.render, this);
			this.collection.on('reset', this.renderhChans, this);
			this.collection.on('change', this.renderhChans, this);
			$('#settings a').bind('click', _.bind(this.renderhChans, this));
			$('#hChans').bind('mousedown', _.bind(this.hChansToggel, this));
			$('#hChans').bind('click', _.bind(this.hChansSave, this));
		},
		//allows for multiple items to be de/selected with a regular click 
		//(once per item)
		hChansToggel: function(el) {
			el = el.target;
			$(el).is(':checked') 
				? $(el).removeAttr('selected', false) 
				: $(el).prop('selected', true);
			$(el).trigger('click');
			return false;
		},
		hChansSave: function(element) {
			el = $(element.target);
			//console.log('hChans save called', el.val(), el.is(':selected'));
			el.is(':selected') ? this.collection.add({id: el.val()}) 
								: this.collection.remove({id: el.val()});
		
			if (this.getIsServer(el.val())) {
				var servers = this.session.connections.listServers();
				_.each(servers[el.val()].channels, 
					function(name, id) {
						this.collection.remove({id: id});
				}, this);
			}
		
			this.renderhChans();
		},
		renderhChans: function() {
			//console.log(window.requirejs.s.contexts._.defined);
			var data = {
				channels: _.filter(this.session.connections.listServersFlat(), 
						this.getIsViewable, this)
			};

			$('#hChans').html(_.template(hChans, data));
			$('#hChans').val(this.collection.pluck('id'));
		},
		renderTr: function() {
			$('#settingsForm')
				.find('#settingsHighlights')
				.parent().parent()
				.after(_.template(hChans_tr, this.trData));
		},
		getIsServer: function(id) {
			return typeof this.session.connections.listServers()[id] !== 'undefined';
		},
		getIsViewable: function (b) {
			//return true if is of type server or if parent is not selected
			return b.type == 'server' || !this.collection.get(b.parent);
		}
	});
});
