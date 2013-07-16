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
	var FLYOUTMENU_FOOK_CLASS = 'flyout-fook';
	var FLYOUTMENU_CLASS = 'flyoutmenu';
	var FLYOUTTOOLTIP_CLASS = 'flyout-tool-tip';
	var FLYOUTMENU_ID_BASE = 'flyoutmenu-';
	var FLYOUTTOOLTIP_ID_BASE = 'flyout-tool-tip-';
	var FLYOUTMENU_ID_PREFIX_EACH = [
		'flyout-menu-text-',
		'flyout-menu-color-',
		'flyout-menu-texture-',
		'flyout-menu-frame-',
		'flyout-menu-other-',
		'flyout-menu-blackjack-'
	];
	var nowAnimation = false;
	var showElement = null;
	$.widget('editors.flyoutmenu', {
		/**
  	 	* Default options.
  	 	*/
		options: {
			menu : [
				{ 'idPrefix' : FLYOUTMENU_ID_PREFIX_EACH[0], 'label' : 'text', 'img' : 'img/text.png' },
				{ 'idPrefix' : FLYOUTMENU_ID_PREFIX_EACH[1], 'label' : 'color', 'img' : 'img/color.png' },
				{ 'idPrefix' : FLYOUTMENU_ID_PREFIX_EACH[3], 'label' : 'texture', 'img' : 'img/texture.png' },
				{ 'idPrefix' : FLYOUTMENU_ID_PREFIX_EACH[4], 'label' : 'frame', 'img' : 'img/frame.png' },
				{ 'idPrefix' : FLYOUTMENU_ID_PREFIX_EACH[5], 'label' : 'other', 'img' : 'img/other.png' },
				{ 'idPrefix' : FLYOUTMENU_ID_PREFIX_EACH[6], 'label' : 'blackjack', 'img' : 'img/blackjack.png' }
			],
			timeout : 1000 * 10,
			timeFadeout : 400,
			delayFadeout : 350,
			positionAdjust : {
				'left' : -20, 'top' : -20
			},
			isForce : {
				'Opera' : false,
				'IE' : false
			}
		},
		_create: function() {
			var self = this,
			    element = self.element;
			var data = $(element).data();
			data.id = element.attr('id');
			data.isFlyoutMenuShow = false;
			data.autoHideTimer = null;
			data.flyoutElement = null;
			data.menu = self.options.menu;
			data.timeout = self.options.timeout;
			data.timeFadeout = self.options.timeFadeout;
			data.delayFadeout = self.options.delayFadeout;
			data.positionAdjust = self.options.positionAdjust;
			data.menuLength = self.options.menu.length;
			//var distanceMax = self.options.menu.length * 7 + 3;
			//var distance = self.options.menu.length * 6 + 4;
			var distanceMax = 22 + self.options.menu.length*4 + Math.floor( self.options.menu.length / 7 )*3;
			var distance = 16 + self.options.menu.length*4 + Math.floor( self.options.menu.length / 7 )*3;
			var pointsMax = self._getPoints( self.options.menu.length, distanceMax );
			var points = self._getPoints( self.options.menu.length, distance );
			data.pointsMax = pointsMax;
			data.points = points;
			if ( $('.flyoutmenu'+self.options.menu.length).length == 0 ) {
				self._createStyleSheet();
			}
			data.clicked = self.options.clicked;
			data.start = self.options.start;
			data.end = self.options.end;
			data.isForce = self.options.isForce;
			data._ua = (function(){
				return {
					ltIE6:typeof window.addEventListener == "undefined" && typeof document.documentElement.style.maxHeight == "undefined",
					ltIE7:typeof window.addEventListener == "undefined" && typeof document.querySelectorAll == "undefined",
					ltIE8:typeof window.addEventListener == "undefined" && typeof document.getElementsByClassName == "undefined",
					IE:document.uniqueID && !data.isForce.IE,
					Firefox:window.sidebar,
					Opera:window.opera && !data.isForce.Opera,
					Webkit:!document.uniqueID && !window.opera && !window.sidebar && window.localStorage && typeof window.orientation == "undefined",
					Mobile:typeof window.orientation != "undefined"
				}
			})();
			var elementHtml = self._createMenu( self.options.menu );
			$('body').append( elementHtml );
			$('body').append( '<div class="' + FLYOUTTOOLTIP_CLASS + '" id="' + FLYOUTTOOLTIP_ID_BASE + data.id + '"></div>' );
			data.flyout = $('#' + FLYOUTMENU_ID_BASE + data.id);
			data.flyout_tool_tip = $('#' + FLYOUTTOOLTIP_ID_BASE + data.id);
			data.eachMenu = $('#' + FLYOUTMENU_ID_BASE + data.id + ' ul li');
			this.element.addClass(FLYOUTMENU_FOOK_CLASS);
			return this.element;
		},
		_init: function() {
			var self = this,
			    element = self.element;
			var data = $(element).data();
			$(document).click(function(e) {
				if (( ! $(e.target).is('.'+FLYOUTMENU_FOOK_CLASS) && ! $(e.target).parent().is('.'+FLYOUTMENU_FOOK_CLASS) ) && data.isFlyoutMenuShow == true) {
					self._hideMenu(e);
				}
				return true;
			});
			data.showMenuHandler = function(data) {
				self._showMenuModern(data);
			};
			data.hideMenuHandler = function(data) {
				self._hideMenuModern(data);
			};
			data.commitMenuHandler = function(button, i) {
				self._commitMenuModern(button, i);
			};
			if ( data._ua.IE || data._ua.Opera ) {
				data.showMenuHandler = function(data) {
					self._showMenuLegacy(data);
				};
				data.hideMenuHandler = function(data) {
					self._hideMenuLegacy(data);
				};
				data.commitMenuHandler = function(button, i) {
					self._commitMenuLegacy(button, i);
				};
			}
			this.element.click(function(e) {
				if (( $(e.target).is('.'+FLYOUTMENU_FOOK_CLASS) || $(e.target).parent().is('.'+FLYOUTMENU_FOOK_CLASS) ) && data.isFlyoutMenuShow == false) {
					data.flyoutElement = $(this);
					data.flyoutElement.pageX = e.pageX;
					data.flyoutElement.pageY = e.pageY;
					self._showMenu(e);
				} else if ( data.isFlyoutMenuShow == true ) {
					self._hideMenu(e);
				}
				return true;
			});
			for ( var i = 0; i < data.menuLength; i++ ) {
				var target = $($(data.eachMenu).get(i));
				if ( typeof target.data('label') === "undefined" ) {
					var label = target.find('img').attr('alt');
					target.data('label', label);
				}
				target.data('index', i);
				target.click( function(e) {
					var button = $(this);
					self._commitButton(e,button);
					return false;
				} );
				if ( !data._ua.Mobile ) {
					target.hover(
						function(e) {
							self._showToolTip(e, $(this).data('label'));
						},
						function(e) {
							data.flyout_tool_tip.hide();
						}
					);
				}
			}
			$(this).mousemove( function(e) {
				data.flyout_tool_tip.css( {
					top: e.pageY+(-15),
					left: e.pageX+15
				} );
			} );
			return this.element;
		},
		_setOption: function(key, value) {
			var self = this,
			    element = self.element;
			var data = $(element).data();
			//$._super('_setOption', this, arguments);
		},
		destroy: function() {
			var self = this,
			    element = self.element;
			var data = $(element).data();
			//$._super('destroy', this, arguments);
		},
		getNamespace: function() {
			return this.namespace;
		},
		getWidgetName: function() {
			return this.widgetName;
		},
		getDisabledClassName: function() {
			return this.getNamespace() + '-' + this.getWidgetName() + '-' + 'disabled';
		},
		_createMenu: function(m) {
			var self = this,
			    element = self.element;
			var data = $(element).data();
			var elementHtml = '<div class="' + FLYOUTMENU_CLASS + '" id="' + FLYOUTMENU_ID_BASE + data.id + '"><ul>';
			var hash = self._createHash();
			data.hash = hash;
			for ( var i = 0; i < m.length; i++ ) {
				var idPrefix = m[i].idPrefix;
				if ( typeof idPrefix === "undefined" ) {
					idPrefix = FLYOUTMENU_ID_PREFIX_EACH[i];
				}
				var id = idPrefix + hash;
				var label = m[i].label;
				var img = m[i].img;
				elementHtml += '<li id="' + id + '"><img src="' + img + '" alt="' + label + '" /></li>';
			}
			elementHtml += '</ul></div>';
			return elementHtml;
		},
		_showToolTip: function(e, label) {
			var self = this,
			    element = self.element;
			var data = $(element).data();
			data.flyout_tool_tip.text( label );
			data.flyout_tool_tip.css({
				position: "absolute",
				top: e.pageY+(-15),
				left: e.pageX+15
			});
			data.flyout_tool_tip.show();
		},
		showMenu: function(e) {
			var self = this;
			self._showMenu(e);
		},
		_showMenu: function(e) {
			if ( nowAnimation == true ) return;
			//nowAnimation = true;
			var self = this,
			    element = self.element;
			if ( showElement != null ) {
			//	showElement._hideMenu(e);
			}
			showElement = self;
			var data = $(element).data();
			var disabledClassName = self.getDisabledClassName();
			//data.isFlyoutMenuShow = true;
			if ( typeof data.start === "function" ) data.start();
			var adjustLeft = data.positionAdjust.left;
			var adjustTop = data.positionAdjust.top;
			data.flyout.css( { 'position' : 'absolute', 'left' : e.pageX + adjustLeft + 'px', 'top' : e.pageY + adjustTop + 'px' } );
			data.flyout.find('li').fadeIn(10, function() {
				data.showMenuHandler( data );
				data.isFlyoutMenuShow = true;
			} );
			data.autoHideTimer = setTimeout( function(e) {
				self._autoHide(e);
			}, data.timeout );
			if ( typeof data.end === "function" ) data.end();
			//self._endAnimation();
		},
		_showMenuModern: function( data ) {
			for ( var i = 0; i < data.menuLength; i++ ) {
				var target = $($(data.eachMenu).get(i));
				this._removeClass( target, 'flyout-reset-base' );
				this._removeClass( target, 'flyout-reset' + data.menuLength + '_' + i );
				this._removeClass( target, 'flyout-clicked-base' );
				this._removeClass( target, 'flyout-clicked' + data.menuLength + '_' + i );
				target.addClass( 'flyout-motion-base' );
				target.addClass( 'flyout-motion' + data.menuLength + '_' + i );
			}
		},
		_showMenuLegacy: function( data ) {
			for ( var i = 0; i < data.menuLength; i++ ) {
				var target = $($(data.eachMenu).get(i));
				target.css( data.points[i] );
				this._removeClass( target, 'flyout-clicked-base' );
				this._removeClass( target, 'flyout-clicked' + data.menuLength + '_' + i );
			}
		},
		_endAnimation: function() {
			setTimeout( function() {
				nowAnimation = false;
			}, 100 );
		},
		_autoHide: function(e) {
			var self = this,
			    element = self.element;
			var data = $(element).data();
			if ( data.autoHideTimer != null ) {
				clearTimeout( data.autoHideTimer );
				data.autoHideTimer = null;
				if ( data.isFlyoutMenuShow == true ) {
					self._hideMenu(e);
				}
			}
		},
		hideMenu: function(e) {
			var self = this,
			    element = self.element;
			var data = $(element).data();
			self._hideMenu(e);
		},
		_hideMenu: function(e) {
			if ( nowAnimation == true ) return;
			nowAnimation = true;
			showElement = null;
			var self = this,
			    element = self.element;
			var data = $(element).data();
			if ( data.autoHideTimer != null ) {
				clearTimeout( data.autoHideTimer );
				data.autoHideTimer = null;
			}
			if ( typeof data.start === "function" ) data.start();
			data.hideMenuHandler( data );
			data.flyout.find('li').fadeOut(data.timeFadeout);
			data.isFlyoutMenuShow = false;
			if ( typeof data.end === "function" ) data.end();
			self._endAnimation();
		},
		_hideMenuModern: function( data ) {
			data.flyout_tool_tip.hide();
			for ( var i = 0; i < data.menuLength; i++ ) {
				var target = $($(data.eachMenu).get(i));
				this._removeClass( target, 'flyout-motion-base' );
				this._removeClass( target, 'flyout-motion' + data.menuLength + '_' + i );
				//this._removeClass( target, 'flyout-clicked-base' );
				//this._removeClass( target, 'flyout-clicked' + data.menuLength + '_' + i );
				if ( target.hasClass( 'flyout-clicked-base' ) ) {
					//console.log( i );
				} else {
					target.addClass( 'flyout-reset-base' );
					target.addClass( 'flyout-reset' + data.menuLength + '_' + i );
				}
			}
		},
		_hideMenuLegacy: function( data ) {
		},
		_commitButton: function(e,button) {
			var self = this,
			    element = self.element;
			var data = $(element).data();
			var i = button.data('index');
			data.commitMenuHandler( button, i );
			if ( typeof data.clicked === "function" ) {
				data.clicked(button, i, data.flyoutElement, e);
			}
			button.fadeOut(data.delayFadeout, function() {
				self._hideMenu(e);
			} );
		},
		_commitMenuModern: function( button, i ) {
			var self = this,
			    element = self.element;
			var data = $(element).data();
			//console.log( button );
			//console.log( data.menuLength + "/" + i );
			button.addClass( 'flyout-clicked-base' );
			button.addClass( 'flyout-clicked' + data.menuLength + '_' + i );
		},
		_commitMenuLegacy: function( button, i ) {
		},
		_removeClass: function( target, className ) {
			if ( target.hasClass( className ) ) {
				target.removeClass( className );
			}
		},
		_createHash: function() {
			return  String( Math.random() ).replace( '.', '' );
		},
		_n2pi: function(n) {
			return 2 / n;
		},
		_getPoints: function(n, distance) {
			var self = this;
			var pi = self._n2pi( n );
			var pos = new Array();
			for ( var i = 0; i < n; i++ ) {
				var rad = pi * Math.PI * i;
				rad -= Math.PI / 2;   // -90度
				var x = Math.floor( distance * Math.cos( rad ) );
				var y = Math.floor( distance * Math.sin( rad ) );
				pos[i] = { 'left' : x, 'top' : y };
			}
			return pos;
		},
		_vendorPrefix: function( key, value ) {
			var css = '';
			['-webkit-','-moz-','-o-','-ms-','-khtml-',''].forEach(function(prefix){
			//[''].forEach(function(prefix){
				if ( key === 'keyframes' ) {
					var keyframes = value.replace( '@keyframe', '@' + prefix + 'keyframe' );
					keyframes = keyframes.replace( /transform/g, prefix + 'transform' );
					css += keyframes + ' \n';
				} else if ( key.toLowerCase() == 'opacity' ) {
					switch ( prefix ) {
						case '-webkit-':
						case '-moz-':
							css += prefix + 'opacity:' + value + ';';
							break;
						case '-o-':
							css += 'alpha(opacity=' + Math.round(value*100) + ');';
							break;
						case '-ms-':
							css += prefix + 'filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=' + Math.round(value*100) + ');';
							break;
					}
				} else {
					css += prefix + key + ':' + value + ';';
				}
			});
			return css;
		},
		_createStyleSheet: function() {
			var self = this,
			    element = self.element;
			var data = $(element).data();
			var stylesheetBase = '';
			var stylesheetMotion = '';
			var stylesheetReset = '';
			var stylesheetClicked = '';
			var key, value, prefixed, keyframes;
			key = 'border-radius';
			value = '4px';
			prefixed = self._vendorPrefix( key, value );
			stylesheetBase += '.flyout-tool-tip{' + prefixed;
			key = 'opacity';
			value = 0.9;
			prefixed = self._vendorPrefix( key, value );
			stylesheetBase += prefixed + '}\n';
			key = 'animation-timing-function';
			value = 'ease';
			prefixed = self._vendorPrefix( key, value );
			stylesheetBase += '.flyoutmenu ul li{' + prefixed;
			key = 'animation-fill-mode';
			value = 'both';
			prefixed = self._vendorPrefix( key, value );
			stylesheetBase += prefixed + '}\n';
			key = 'animation-duration';
			value = '0.4s';
			prefixed = self._vendorPrefix( key, value );
			stylesheetBase += '.flyout-motion-base{' + prefixed + '}\n';
			stylesheetBase += '.flyout-reset-base{' + prefixed + '}\n';
			value = '0.9s';
			prefixed = self._vendorPrefix( key, value );
			stylesheetBase += '.flyout-clicked-base{' + prefixed + '}\n';
			for ( var i = 0; i < data.menuLength; i++ ) {
				key = 'animation-name';
				value = 'motion' + data.menuLength + '_' + i;
				prefixed = self._vendorPrefix( key, value );
				stylesheetMotion += '.flyout-motion' + data.menuLength + '_' + i + '{ ' + prefixed + '} \n';
				keyframes = '@keyframes motion' + data.menuLength + '_' + i + '{';
				keyframes += '0% {';
				keyframes += 'transform:rotate(720deg);';
				keyframes += 'margin-left:0px;';
				keyframes += 'margin-top:0px;';
				keyframes += '}';
				keyframes += '70% {';
				keyframes += 'margin-left:' + data.pointsMax[i].left + 'px;';
				keyframes += 'margin-top:' + data.pointsMax[i].top + 'px;';
				keyframes += '}';
				keyframes += '100% {';
				keyframes += 'transform:rotate(0deg);';
				keyframes += 'margin-left:' + data.points[i].left + 'px;';
				keyframes += 'margin-top:' + data.points[i].top + 'px;';
				keyframes += '}';
				keyframes += '}';
				key = 'keyframes';
				value = keyframes;
				stylesheetMotion += self._vendorPrefix( key, value );

				key = 'animation-name';
				value = 'reset' + data.menuLength + '_' + i;
				prefixed = self._vendorPrefix( key, value );
				stylesheetReset += '.flyout-reset' + data.menuLength + '_' + i + '{ ' + prefixed + '} \n';
				keyframes = '@keyframes reset' + data.menuLength + '_' + i + '{';
				keyframes += '0% {';
				keyframes += 'transform:rotate(-720deg);';
				keyframes += 'margin-left:' + data.points[i].left + 'px;';
				keyframes += 'margin-top:' + data.points[i].top + 'px;';
				keyframes += '}';
				keyframes += '70% {';
				keyframes += 'margin-left:' + data.pointsMax[i].left + 'px;';
				keyframes += 'margin-top:' + data.pointsMax[i].top + 'px;';
				keyframes += '}';
				keyframes += '100% {';
				keyframes += 'transform:rotate(-0deg);';
				keyframes += 'margin-left:0px;';
				keyframes += 'margin-top:0px;';
				keyframes += '}';
				keyframes += '}';
				key = 'keyframes';
				value = keyframes;
				stylesheetReset += self._vendorPrefix( key, value );

				key = 'animation-name';
				value = 'clicked' + data.menuLength + '_' + i;
				prefixed = self._vendorPrefix( key, value );
				stylesheetClicked += '.flyout-clicked' + data.menuLength + '_' + i + '{ ' + prefixed + '} \n';
				keyframes = '@keyframes clicked' + data.menuLength + '_' + i + '{';
				keyframes += '0% {';
				keyframes += 'transform:scale(1);';
				//keyframes += 'opacity:1;';
				key = 'opacity';
				value = 1;
				prefixed = self._vendorPrefix( key, value );
				keyframes += prefixed;
				keyframes += 'margin-left:' + data.points[i].left + 'px;';
				keyframes += 'margin-top:' + data.points[i].top + 'px;';
				keyframes += '}';
				keyframes += '90% {';
				keyframes += 'transform:scale(5);';
				//keyframes += 'opacity:0;';
				key = 'opacity';
				value = 0;
				prefixed = self._vendorPrefix( key, value );
				keyframes += prefixed;
				keyframes += 'margin-left:' + data.points[i].left + 'px;';
				keyframes += 'margin-top:' + data.points[i].top + 'px;';
				keyframes += '}';
				keyframes += '100% {';
				keyframes += 'transform:scale(1);';
				//keyframes += 'opacity:0;';
				key = 'opacity';
				value = 0;
				prefixed = self._vendorPrefix( key, value );
				keyframes += prefixed;
				keyframes += 'margin-left:' + data.points[i].left + 'px;';
				keyframes += 'margin-top:' + data.points[i].top + 'px;';
				keyframes += '}';
				keyframes += '}';
				key = 'keyframes';
				value = keyframes;
				stylesheetClicked += self._vendorPrefix( key, value );
			}
			$('head').append('<style class="flyoutmenu' + data.menuLength + '">' + stylesheetBase + stylesheetMotion + stylesheetReset + stylesheetClicked + '</style>');
		}
	});
})(jQuery);
