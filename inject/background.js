var prefs = {};
prefs.beep  = new Audio(chrome.extension.getURL('assets/sounds/alert.mp3'));

chrome.extension.onRequest.addListener(
	function(req, sender, sendResponse) {
		//console.log('inj. received request',req)
		switch (req.action) {
			case 'loadSettings':
				getSettings();
				break;
		}
});

//follow blur/focus events
prefs.windowFocused = true;
window.addEventListener('focus', function() {
  prefs.windowFocused = true;
});

window.addEventListener('blur', function() {
  prefs.windowFocused = false;
});

main();
function main() {
	var protocol = window.location.protocol === "https:" ? "wss" : "ws";
	
	var socket = new WebSocket(protocol + '://' + window.location.host);
	socket.onopen = function(){  
		getSettings();
	}
	socket.onclose = function (error) {
		//console.log('WebSocket Close ', error);
	
	};
	socket.onerror = function (error) {
		//console.log('WebSocket Error ', error);
		setTimeout(main, 5000);//restart in 5 seconds
	};
	socket.onmessage = function(msg) {
		//prevent webkit from barfing at weird strings
		try {
			var msg = JSON.parse(msg.data);
		} catch (e) {
			msg = {};
		}
		
		messageHandler(msg);
	};
}

/**
 * Check incomming messages to see if there are actions we need to take
 */
function messageHandler(msg) {
	//console.log(msg)

	switch (msg.type) {
		case 'buffer_msg':
		case 'buffer_me_msg':
			//exit if the tab isnt hidden. We only alert when its not visable
			//a channel is a msg.chan that has one of these at the begining
			//of the name
			//for pm's, we ensure that the first char of the chans name 
			//doesnt begin with anything in chan_prefix
			var chan_prefix = ['&', '#', '!', '+', '.', '-'];
			var is_pm = (chan_prefix.indexOf(msg.chan.charAt(0)) < 0);
			
			if (channelFocused(msg.chan)) {
				return true;
			}
			//dont show popup - irccloud handels that
			//first case is for regular channel messages, second is for pm's
			if ((msg.highlight || is_pm) && prefs.playalert) {
				prefs.beep.play();
			//handel channel-wide notifications
			} else if (matchedChannel(msg.chan)) {
				if (msg.type == 'buffer_msg') {
					popUp(title = 'From: ' 
								+ msg.from
								+ ' in '
								+ msg.chan, msg.msg, msg.chan);
				} else {
					popUp(title = 'In '
								+ msg.chan + ':',
								msg.from + ' ' + msg.msg,
								msg.chan);
				}
				
				if (prefs.playalert) {
					prefs.beep.play();
				}
			}
			break;
	}
}


/**
 * Check a channel to see if it matches one that user saved
 */
 function matchedChannel(chan) {
 	return ($.inArray(chan, prefs.chan_highlight) > -1)
 		|| ($.inArray(chan.substring(1), prefs.chan_highlight) > -1)
 }

/**
 * get initial setting from background page
 */
function getSettings() {
	chrome.extension.sendRequest({action: "getSettings"}, function(res) {
		console.log('setting from background', res)
		$.extend(prefs, res);
	});	
}

/**
 * Show popup
 */
function popUp(title, msg, chan) {
	var icon = chrome.extension.getURL('assets/images/icon48x48.png');
	var notification = webkitNotifications.createNotification(
		 icon,
		 title,
		 msg
	);
	
	//hide after 15 seconds
	notification.ondisplay = function() {
		setTimeout(function () {
			notification.cancel();
		}, 15000);
	};
	
	notification.onclick = function() {
		notification.cancel();
		window.focus();
		var parser				= document.createElement('a');
		parser.href				= window.location.href;
		hash					= parser.hash.split('/');
		hash[hash.length -1]	= encodeURI(chan);
		window.location.href 	= hash.join('/');
	}

	notification.show();
}

/**
 * Checks if a channel window is currently in focus
 */
function channelFocused(chan) {
	if(document.webkitHidden || !prefs.windowFocused) {
		return false;
	}
	
	var parser = document.createElement('a');
	parser.href = window.location.href;
	var FocusedChan = parser.hash.split('/');
	
	return decodeURIComponent(FocusedChan[FocusedChan.length - 1]) == chan;
}
