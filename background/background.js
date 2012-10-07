/**
 * General request listiner
 */
chrome.extension.onRequest.addListener(	function(req, sender, sendResponse) {
		console.log(req, sender, sendResponse);
		switch (req.action) {
			case 'getSettings':
				loadSettings(sendResponse);
				break;
			default:
				break;
		}
});

/**
 * Browser action click handler
 * will create the tab if it doesnt exists, show it if it dose
 */
chrome.browserAction.onClicked.addListener(function(tab) {
	//onclick, see if we have a tab open
	chrome.tabs.query({url: 'https://*.irccloud.com/'}, function (tabs){
		if (tabs.length === 0) {			
			chrome.tabs.create({'url': 'https://irccloud.com/'});
		} else {
			chrome.tabs.update(tabs[0].id, {active: true});
		}
	});
});

/**
 * load setting from storage and pass them to a callback
 */
function loadSettings(callback) {
	set = {};
	for (var name in localStorage) {
		switch (name) {
			case 'playalert':
				set[name] = (localStorage[name] == 'true');
				break;
			case 'chan_highlight':
				try {
					set[name] = JSON.parse(localStorage[name]);	
				}	catch (e) {
					set[name] = {}
				}
				break;
		}
	}
	callback(set);
}

//set up connection to content script
var bg = {
	pages: {},
	host: 'https://*.irccloud.com/',
	connect: function() {
		var that = this;
		
		//find all tabs, filtered for this.host
		chrome.tabs.query({url: this.host}, function(tabs){  
			$.each(tabs, function(x, tab) {
				
				//if we dont have a port open to them yet
				if (!that.pages[tab.id]) {
					
					//open port & setup listeners
					that.pages[tab.id] =  
							chrome.tabs.connect(tab.id, {name: "ircp"});
					
					that.pages[tab.id].onDisconnect.addListener(function(port) {
						that.onDisconnect(port);
					});
				}
			});
		});
	},
	onDisconnect: function(port) {
		var that = this;
		//find this port in our pages list and delete it
		$.each(this.pages, function(x, page){
			if (page.portId_ == port.portId_) {
				delete that.pages[x];
			}
		});
	},
	msg_handler: function(msg) {
		//console.log('bg.msg_handler()', msg);
		if (typeof msg.type === 'undefined') {
			return false;
		}

		switch (msg.type) {
			case 'storageDump':
				this.save(msg);
				break;
			case 'getDump':
				this.sendDump(msg.data);
				break;
			default:
				break;
		}
	},
	save: function (msg) {
		var ob = {};
		ob[msg.key] = msg.data;
		chrome.storage.sync.set(ob, function(data){});
	},
	send: function(msg) {
		//iterate over all connected tabs and send them the message
		$.each(this.pages, function(x, port){
			port.postMessage(msg);
		});
	},
	sendDump: function (key) {
		var that = this;
		chrome.storage.sync.get(function(d){
			data = key ? d[key] : d;
			that.send({
				type: 'storageDump',
				data: d,
				src: 'background',
				key: key
			});
		});
	},
	//receive messages from content script
	init: function() {
		var that = this;
		//connect on startup
		this.connect();
		
		chrome.extension.onConnect.addListener(function(port) {
			//ensure were connected to all tabs every time we get a listener
			that.connect();
			
			//listen to messages from content script
			port.onMessage.addListener(function(msg) {
				that.msg_handler(msg);
			});
		});

		//add listener for data changes
		chrome.storage.onChanged.addListener(function(changes, name){
			switch (name) {
				case 'sync':
						that.sendDump();
					break;
				default:
					break;
			}
		});
	}
};

//start receiving from content script
bg.init();
