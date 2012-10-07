//wait until the required parts are loaded.
var i = setInterval(function() {
	var needed = ['require', '$', 'SESSION', 'SESSIONVIEW'];
	start = false;
	for (var need in needed) {
		if (typeof window[needed[need]] == 'undefined') {
			return false;
		}
		start = true;
	}
	if (start && typeof SESSION.started != 'undefined') {
		clearInterval(i);
		var s = document.createElement('script');
		s.src = icp_ext_path + 'modules/framework/init.js';
		(document.head||document.documentElement).appendChild(s);
	}
}, 250);
