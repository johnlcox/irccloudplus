//create icp object and set a variable with the extension path
var s = document.createElement('script');
s.type = 'text/javascript';
s.innerHTML = 'var icp_ext_path="' 
			+ chrome.extension.getURL('/')
			+ '";';
(document.head||document.documentElement).appendChild(s);

//add a helper script that waits until part of the page is in place
//before adding other assets
var s = document.createElement('script');
s.src = chrome.extension.getURL("modules/loader/init.js");
s.onload = function() {
	this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);

//add require.js
var s = document.createElement('script');
s.src = chrome.extension.getURL("assets/js/require.js");
(document.head||document.documentElement).appendChild(s);


//main content scrip code
var cs = {
	connect: function() {
		if (!this.port) {
			this.port = chrome.extension.connect({name: "ircp"});
			var that = this;	
			this.port.onDisconnect.addListener(function(){
				that.port = '';
			});
		}
	},
	port: '',
	send: function (msg) {
		//ensure were connected
		this.connect();
		this.port.postMessage(msg.data);		
	},
	init: function() {
		var that = this;
		this.connect();
		chrome.extension.onConnect.addListener(function(port) {
			//reconnect to port when we get a new listener
			that.connect();
			port.onMessage.addListener(function(msg) {
				//console.log('received msg from background', msg);
				window.postMessage(msg, "*");
			});
		});
	}
};

cs.init();

//proxy messages from window to background script
window.addEventListener("message", function(e) {
	//console.log(e);
	if (e.data.src && e.data.src == 'host') {
		cs.send(e);
	}
});

