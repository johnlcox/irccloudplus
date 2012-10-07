define(['chan_highlights/collections'], function(chan){
	return {
		_isNotableOrig: Message.prototype.isNotable,
		isNotable: function (){
			if (this.isSelf() || !this.isImportant() || this.isIgnored()) {
				return false;
			}
			return this.isHighlight() 
					|| (this.buffer.isConversation() && !this.isNotice()) 
					|| this.get("type") == "callerid"
					|| this.isMatchedChannel(this);
		},
		isMatchedChannel: function (msg) {
			return chan.isMatchedChannel(msg.get('cid')) 
					|| chan.isMatchedChannel(msg.get('bid'));
		}
	};
});
