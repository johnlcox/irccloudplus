define([], function(){
	return {
		listServers: function(callback) {
			var list = {};
			this.each(function(server){
				list[server.id] = {
					name: server.get('name'),
					channels: _.reduce(_.map(server.buffers.filter(function(chan){
						return chan.get('buffer_type') == 'channel';
					}), function(chan) {
						return {id: chan.id, name: chan.get('name')};
					}), function(ob, chan) {
						ob[chan.id] = chan.name;
						return ob;	
					}, {})
				};
			});

			if (typeof callback == 'function') {
				callback(list);
			} else {
				return list;
			}
		},
		listFlatServer: function (callback) {
			var list = {}, count = 0;
			this.each(function(server){
				list[count++] = {
					name: server.get('name'),
					id: server.id,
					type: 'server',
					parent: ''
				};

				if (server.buffers.length) {
					server.buffers.each(function(chan){
						if (chan.get('buffer_type') == 'channel') {
							list[count++] = {
								name: '&#160&#160&#160' + chan.get('name'),
								id: chan.id,
								type: 'channel',
								parent: server.id
							};
						}
					});
				}
			});

			if (typeof callback == 'function') {
				callback(list);
			} else {
				return list;
			}
		}
	}
});