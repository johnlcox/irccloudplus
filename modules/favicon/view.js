define([], function (){
	var favicon = Backbone.View.extend({
		sessionview: window.SESSIONVIEW,
		canvas: document.createElement('canvas'),
		linkOrig: $('head').find('link[rel=icon]').clone(),
		link: $('head').find('link[rel=icon]'),
		img: document.createElement('img'),
		initialize: function () {
			this.ctx = this.canvas.getContext('2d');
			this.sessionview.model.buffers.bind('unseenHighlightChange', 
				this.onUnseenHighlightChange, this);
						
			//img element and initial render
			_.extend(this.img, {
				src: this.link.attr('href'),
				onload: function() {
					this.drawFavicon(0);
				}
			}, this);
		},
		onUnseenHighlightChange: function (buffer) {
			this.drawFavicon(buffer.unseenHighlights.length);
		},
		drawFavicon: function (i) {
			//limit string to 3 characters, default to 0
			if (typeof i != 'string' && typeof i.toString == 'function') {
				i = i.toString();
			} else {
				console.log(i, ' is not a valid type for this opperation');
				i = '';
			}
			i = i.substring(0, 3);
			c = this.canvas;
			c.height = c.width = 16;
			ctx = c.getContext('2d');
			ctx.drawImage(this.img, 0, 0);
			y = '16';
			fontsize = 11;
			x = 9;

			switch (i.length) {
				case 1:
					x = 9;
					break;
				case 2:
					x = 4;
					break;
				case 3:
					x = 0;
					fontsize = 9;
					break;	
			}

			ctx.font = fontsize + 'px Helvetica Neue, Arial, sans-serif';
			ctx.lineWidth = 3;
			ctx.strokeStyle = "#fff";
			ctx.strokeText(i, x, y);
			ctx.fillStyle = '#111';
			ctx.fillText(i, x, y);

			this.link.attr('href', c.toDataURL('image/png'));
		}
		
	});
	return new favicon();
});
