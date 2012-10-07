define(['chan_highlights/views'], function (view) {
	//event listeners
	window.addEventListener("message", function(e) {
		if (e.data.src && e.data.src == 'background') {
			//console.log('background', e);
			switch (e.data.key) {
				case 'hChans':
					view.prototype.collection.reset(e.data.data.hChans)
					break;
			}
			//icp.views.settings.collection.reset(e.data.data);
		}
	}, false);
});