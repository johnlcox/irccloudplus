define([], function(){

	require(['mixins/connections'], function(mixin){
		_.extend(SESSION.connections, mixin);
	});
	
	require(['mixins/message'], function(mixin){
		_.extend(Message.prototype, mixin);
	});
});
