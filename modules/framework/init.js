require.config({
	baseUrl: icp_ext_path + 'modules/',
	paths: {
		templates: '../assets/templates',
		text: '../assets/js/require/text'
	}
});

//prosses mixins
require(['mixins/init']);

//start chan_highlights
require(['chan_highlights/init']);

//register events
require(['events/init']);

//start favicon
require(['favicon/init']);
