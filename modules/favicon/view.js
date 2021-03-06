define([], function (){
	var favicon = Backbone.View.extend({
		sessionview: window.SESSIONVIEW,
		session: window.SESSION,
		canvas: document.createElement('canvas'),
		linkOrig: $('head').find('link[rel=icon]').clone(),
		link: $('head').find('link[rel=icon]'),
		img: document.createElement('img'),
		newInCurrentBuffer: false,
		defaultMsg: 0,
		msg: 0,
		initialize: function () {
			this.ctx = this.canvas.getContext('2d');
			this.sessionview.model.buffers.bind('unseenHighlightChange', 
				this.onUnseenHighlightChange, this);
			this.sessionview.model.buffers.bind('unseenChange', 
				this.onUnseenChange, this);
			this.bind('setFavicon', this.setFavicon, this);
			//img element and initial render
			_.extend(this.img, {
				src: this.link.attr('href'),
				onload: function() {
					this.trigger('setFavicon');
				}
			}, this);
		},
		onUnseenHighlightChange: function (buffer) {
			this.msg = this.getUnseenHighlightCount();
			this.trigger('setFavicon');
		},
		getUnseenHighlightCount: function() {
			return _.reduce(
					_.map(this.session.unseenBuffers.models, 
						function (m){
							return m.unseenHighlightCount();
					}), 
					function(total, count){
						return total + count;
				}, 0);
		},
		onUnseenChange: function (a) {
			if (a.hasUnseen() && this.isFromSelectedBuffer(a)) {
				this.newInCurrentBuffer = true;
			} else {
				this.newInCurrentBuffer = false;
			}
			this.trigger('setFavicon');
		},
		isFromSelectedBuffer: function (a) {
			return a.get('bid') == a.session.get('last_selected_bid');
		},
		getMsg: function () {
			msg = this.msg;
			if (typeof msg != 'string' && typeof msg.toString == 'function') {
				msg = msg.toString();
			} else if(typeof msg != 'string') {
				console.log(msg, ' is not a valid type for getFormatedMsg');
				msg = this.defaultMsg;
			}
			return msg.substring(0, 3);
		},
		getFont: function () {
			return 'Helvetica Neue, Arial, sans-serif';
		},
		getFontSize: function () {
			return (this.getMsg().length == 3 ? 9 : 11) * this.getPixleRation();
		},
		getMsgFormating: function () {
			return (this.newInCurrentBuffer ? 'Bold ' : ' ') + 
					this.getFontSize() + 'px ' + 
					this.getFont();
		},
		getTextCords: function () {
			c = {};
			c.y = 16 * this.getPixleRation();

			switch (this.getMsg().length) {
				case 1:
					c.x = 9;
					break;
				case 2:
					c.x = 4;
					break;
				case 3:
					c.x = 0;
					break;	
				default:
					c.x = 9;
					break;
			}
			c.x = c.x * this.getPixleRation();
			return c;
			
		},
		getPixleRation: function () {
			return window.devicePixelRatio;
		},
		getIcon: function() {
			msg = this.getMsg();
			cords = this.getTextCords();
			c = this.canvas;
			size = 16 * this.getPixleRation();
			c.height = c.width = size;
			ctx = c.getContext('2d');
			ctx.drawImage(this.img, 0, 0, size, size);
			ctx.font = this.getMsgFormating();
			ctx.lineWidth = 3;
			ctx.strokeStyle = "#fff";
			ctx.strokeText(msg, cords.x, cords.y);
			ctx.fillStyle = '#111';
			ctx.fillText(msg, cords.x, cords.y);

			return c.toDataURL('image/png');
		},
		setFavicon: function () {
			this.link.attr('href', this.getIcon());
		}
		
	});
	return new favicon();
});
