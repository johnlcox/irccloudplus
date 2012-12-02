require.config({
	baseUrl: icp_ext_path + 'modules/',
	paths: {
		templates: '../assets/templates',
		text: '../assets/js/require/text'
	}
});

//prosses mixins
require(['mixins/init'], function(){});

//start chan_highlights
require(['chan_highlights/init', 'mixins/init']);

//register events
require(['events/init']);

//start favicon
require(['favicon/init']);
