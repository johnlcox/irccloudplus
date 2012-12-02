define(['chan_highlights/views'], function (view) {
	//event listeners
	window.addEventListener("message", function(e) {
		//console.log('background', e);
		if (e.data.src && e.data.src == 'background') {
			switch (e.data.key) {
				case 'hChans':
					view.prototype.collection.msgHandler(e.data);
					//view.prototype.collection.reset(e.data.data.hChans);
					break;
			}
			//icp.views.settings.collection.reset(e.data.data);
		}
	}, false);
	view.prototype.collection.trigger('handlerInstalled');
});
