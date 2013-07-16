/**
 * Very fantastic jQuery Flyout menu.
 *
 * (C) 2012-2013 editors
 *
 * Original source code and demo: http://
 *
 * License: MIT
 */
;(function($) {
	$.widget('ui.test', {
		/**
  	 	* Default options.
  	 	*/
		options: {
			menu : [
                		{ 'label' : 'text', 'img' : 'img/text.png' },
                		{ 'label' : 'color', 'img' : 'img/color.png' },
                		{ 'label' : 'texture', 'img' : 'img/texture.png' },
                		{ 'label' : 'frame', 'img' : 'img/frame.png' },
                		{ 'label' : 'other', 'img' : 'img/other.png' },
                		{ 'label' : 'blackjack', 'img' : 'img/blackjack.png' }
			],
			timeout : 1000 * 10
		},
		_create: function() {
			var self = this,
			    element = self,element;
			console.log( self.options.menu );
			return this.element;
		},
		_init: function() {
			var self = this,
			    element = self,element;
			console.log('_init');
		},
		_setOption: function(key, value) {
			$._super('_setOption', this, arguments);
		},
		destroy: function() {
			$._super('destroy', this, arguments);
		}
	});
})(jQuery);
