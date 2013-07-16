/*!
 * Strict iOS Safari and initialize view.
 * https://github.com/typista/editors
 * (C) 2013 editors
 * Released under the MIT license
 */
;(function($){
	"use strict";
	var dummyClassName = "jquery-ios-device-dummy";
	$.strict = $.strict || {};
	var config = $.strict.ios = function( options ){
		options = $.extend({}, config.defaults, options, config.const);
		var info = {};
		this.get = function() { return info; };

		var navigator = window.navigator;

		// WebClipモードのサポート
		info.standalone = navigator.standalone;
		if ( typeof info.standalone === "undefined" ) return ( void 0 );

		// ブラウザ
		info.userAgent = navigator.userAgent;
		info.browser = getBrowser( info.userAgent, info.standalone );
		if ( info.browser !== "Safari" ) return( void 0 );

		// レンダリングエンジン
		info.engine = getEngine();
		if ( info.engine !== "Webkit" ) return( void 0 );

		// iOS用初期設定
		var initialSetting = getSetting( options );
		var deviceList = initialSetting.deviceList;
		var meta = initialSetting.meta;
		var style = initialSetting.style;
		$("meta").after( meta + style );

		// デバイス
		info.device = getDevice( deviceList );
		if ( info.device === "" ) return ( void 0 );

		// iOS用環境構築
		window.addEventListener('touchstart', function() {
			if ( typeof options.isScrollableNone === "boolean" && options.isScrollableNone === true ) {
				document.body.ontouchmove = event.preventDefault()
			}
		}, false );
		window.addEventListener('orientationchange', function() {
			hideAddressbar( info, options );
			if ( typeof options.isReloadOrientation === "boolean" && options.isReloadOrientation === true ) {
				location.reload();
			}
			info = $.extend( info, getOrientation() );
			info = $.extend( info, getScreen( info ) );
			if ( typeof options.orientationchange === "function" ) {
				options.orientationchange();
			}
		}, false );
		window.addEventListener('scroll', function() {
			if ( typeof options.scroll === "function" ) {
				options.scroll();
			}
		}, false );
		info.pixelRatio = window.devicePixelRatio;
		info = $.extend( info, getOrientation() );
		info.initialScale = 1.0 / info.pixelRatio;
		if ( info.device === "ipad" && ( typeof options.isUseRatina !== "boolean" || options.isUseRatina !== true ) ) {
			info.initialScale = 1.0;
		}
		setViewport( info );

		// 情報取得
		info = $.extend( info, getScreen( info, options ) );

		// 画面調整
		$("body").css( { 'width' : info.width + 'px', 'height' : info.height + 'px' } );
		hideAddressbar( info, options );

		return this;
	};
	config.defaults = {
		'isUseRatina' : true,
		'isUserSelectNone' : true,
		'isScrollableNone' : true,
		'isReloadOrientation' : true,
		'orientationchange' : null,
		'resize' : null,
		'scroll' : null
	};
	config.const = {
		'fullscreenHeight' : 640,
		'meta' : [
			{
				'name' : 'apple-mobile-web-app-capable',
				'content' : 'yes'
			},
			{
				'name' : 'apple-mobile-web-app-status-bar-style',
				'content' : 'default'
			},
			{
				'name' : 'robots',
				'content' : 'noindex,nofollow'
			}
		],
		'screen' : {
			'iphone5' : [
				{ 'orientation' : 'portrait',
				  'device-aspect-ratio' : '40/71' },
				{ 'orientation' : 'landscape',
				  'device-aspect-ratio' : '40/71' }
			],
			'iphone4' : [
				{ 'orientation' : 'portrait',
				  'device-aspect-ratio' : '2/3',
				  '-webkit-min-device-pixel-ratio' : 1.5 },
				{ 'orientation' : 'landscape',
				  'device-aspect-ratio' : '2/3',
				  '-webkit-min-device-pixel-ratio' : 1.5 }
			],
			'ipad' : [
				{ 'orientation' : 'portrait',
				  'device-aspect-ratio' : '3/4' },
				{ 'orientation' : 'landscape',
				  'device-aspect-ratio' : '3/4' }
			]
		}
	};
	function cleanTimer( _id ) {
		if ( typeof _id !== "undefined" && _id !== null ) {
			clearTimeout( _id );
			_id = null;
		}
	}
	function getSetting( options ) {
		if ( typeof options.statusBarStyle !== "undefined" ) {
			switch ( options.statusBarStyle ) {
			case "black":
			case "black-translucent":
				for ( var metaObject in options.meta ) {
					if ( options.meta[ metaObject ]["name"] === "apple-mobile-web-app-status-bar-style" ) {
						options.meta[ metaObject ]["content"] = options.statusBarStyle;
						break;
					}
				}
				break;
			default:
				break;
			}
		}
		if ( typeof options.appTitle !== "undefined" ) {
			var appTitle = {
					"name" : "apple-mobile-web-app-title",
					"content" : options.appTitle
			};
			options.meta.push(appTitle);
		}
		var mediaQuery = makeMediaQuery( options.screen );
		var style = "<style>";
		style += "* {\n";
		style += "margin: 0; padding: 0; -webkit-text-size-adjust: none !important;\n";
		if ( typeof options.isUserSelectNone === "boolean" && options.isUserSelectNone === true ) {
			style += "user-select: none";
			style += "-webkit-user-select: none";
			style += "-moz-user-select: none";
			style += "-ms-user-select: none";
			style += "-o-user-select: none";
			style += "-khtml-user-select: none";
		}
		style += "}\n";
		style += "body { margin: 0 !important; padding: 0 !important; }\n";
		style += "." + dummyClassName + " { ";
		style += "display: none; position: absolute; left: -1px; top: -1px; width: 1px; height: 1px;";
		style += "}\n";
		style += mediaQuery.style;
		style += "</style>";
		return {
			'meta' : makeMeta( options.meta ),
			'style' : style,
			'deviceList' : mediaQuery.deviceList
		};
	}
	function setViewport( info ) {
		var viewport = makeMeta( {
			"name" : "viewport",
			"content" : "initial-scale=" + info.initialScale + ", user-scalable=no"
		} );
		var metaViewport = $("meta[name=viewport]");
		if ( metaViewport.length > 0 ) metaViewport.remove();
		$("head").prepend( viewport );
		console.log( $('head').html() );
	}
	function makeMeta( meta ) {
		if ( typeof meta === "object" && typeof meta.length !== "undefined" ) {
			var _meta = "";
			for ( var i = 0; i < meta.length; i++ ) {
				_meta += '<meta ' + extractKeyValue( meta[i] ) + '>';
			}
			return _meta;
		} else {
			return '<meta ' + extractKeyValue( meta ) + '>';
		}
	}
	function extractKeyValue( obj ) {
		var keyValue = [];
		for ( var key in obj ) {
			var value = obj[key];
			keyValue.push( key + '="' + value + '"' );
		}
		return keyValue.join(' ');
	}
	function makeMediaQuery( options ) {
		var style = "";
		var deviceList = [];
		var css = "";
		for ( var _options in options ) {
			deviceList.push( _options );
			var _device = options[_options];
			for ( var _array in _device ) {
				var _media = "";
				var _one = _device[ _array ];
				for ( var _property in _one ) {
					if ( _media === "" ) {
						_media = "@media all and ";
					} else {
						_media += "and ";
					}
					var _value = _one[ _property ];
					_media += " (" +  _property + ":" +_value + ") ";
				}
				_media += "{\n";
				css += _media;
				css += "\t#" + _options + " {\n\t\tdisplay : block;\n\t}\n}\n";
			}
		}
		style += css;
		return {
			'style' : style,
			'deviceList' : deviceList
		};
	}
	function getDevice( deviceList ) {
		var dummy = "";
		var check = "";
		for ( var _d in deviceList ) {
			var _id = deviceList[_d];
			var dummy = '<div class="' + dummyClassName + '" id="' + _id + '"></div>';
			$('html').append( dummy );
			check = ( $("#"+_id).css("display") === "block" ) ? _id : "";
			$("#"+_id).remove();
			if ( check !== "" ) break;
		}
		return check;
	}
	function getEngine() {
		var engine;
		if ( "undefined" !== typeof window.execScript ) {
			engine = "Trident";
		} else if ( "undefined" !== typeof window.Components ) {
			engine = "Gecko";
		} else if ( "undefined" !== typeof window.defaultstatus ) {
			engine = "Webkit";
		} else if ( "undefined" !== typeof window.opera ) {
			engine = "Presto";
		}
		return engine;
	}
	function getBrowser( ua, standalone ) {
		var browser;
		if ( ua.indexOf( "Intel Mac" ) !== -1 ) {
			browser = "Chrome-PC";
		} else if ( ua.indexOf( "CriOS" ) !== -1 ) {
			browser = "Chrome";
		} else if ( ua.indexOf( "Lunascape" ) !== -1 ) {
			browser = "Lunascape";
		} else if ( ua.indexOf( "Mercury" ) !== -1 ) {
			browser = "Mercury";
		} else if ( ( ua.indexOf( "Version" ) !== -1 && ua.indexOf( "Safari" ) !== -1 ) ||
				  ( standalone === true )
		) {
			browser = "Safari";
			if ( ! ua.match( /iPhone|iPod|iPad/ ) ) {
				browser += "-PC";
			}
		} else {
			browser = "Other";
		}
		return browser;
	}
	function getOrientation() {
		var orientation = window.orientation;
		var landscape = ( Math.abs( orientation ) === 90 ) ? true : false;
		var portrait = landscape ? false : true;
		return {
			orientation : orientation,
			landscape : landscape,
			portrait : portrait
		};
	}
	function getScreen( info, options ) {
		var width = $(window).width();
		var height = $(window).height();
		if ( ( info.portrait === true && info.device === "iphone4" && height === 712 ) ||
			 ( info.portrait === true && info.device === "iphone5" && height === 888 ) ||
			 ( info.landscape === true && info.device === "iphone4" && height === 416 ) ||
			 ( info.landscape === true && info.device === "iphone5" && height === 416 ) ) {
			height += 120;
		}
		var fullscreen = false;
		if ( ( info.landscape === true ) &&
			 ( info.device === "iphone4" || info.device === "iphone5" ) &&
			 ( height === options.fullscreenHeight ) ) {
			fullscreen = true;
		}
		return {
			width : width,
			height : height,
			fullscreen : fullscreen
		};
	}
	function hideAddressbar( info, options ) {
		var scrollTimerId = setTimeout( function() {
			window.scrollTo(0,1);
			cleanTimer( scrollTimerId );
			$(window).on("resize", function() {
				info = $.extend( info, getScreen( info, options ) );
				setViewport( info );
				$("body").css( { 'width' : info.width + 'px', 'height' : info.height + 'px' } );
				scrollTimerId = setTimeout( function() {
					window.scrollTo(0,1);
					cleanTimer( scrollTimerId );
					if ( typeof options.resize === "function" ) {
						options.resize();
					}
				}, 100 );
			} );
		}, 100 );
	}
})(jQuery);

