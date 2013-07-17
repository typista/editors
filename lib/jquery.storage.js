/*!
 * jQuery Storage Plugin
 * https://github.com/typista/editors
 * (C) 2013 editors
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals.
		factory(jQuery);
	}
}(function ($) {
	var PREFIX = "jquery.storage.";
	var _storage = {
		"local" : localStorage,
		"session" : sessionStorage
	};
	var config = $.storage = function( key, value, options ) {
		options = $.extend({}, config.defaults, options);
		var _s = _storage[ options.type ];
		if ( typeof _s === "undefined" ) {
			return undefined;
		}
		// Write
		if ( value !== undefined ) {
			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
				__set(_s, key+"_expire", Date.parse( t.toUTCString() ));
			}

			var _json = new Array();
			if ( isArray( value ) ) {
				_json[ key ] = JSON.stringify(array2json( value ));
			} else if ( isJson( JSON.stringify( value ) ) ) {
				_json[ key ] = JSON.stringify( value );
			} else {
				_json[ key ] = value.replace( /"/g, '\"' );
			}
			__set(_s, key, _json[ key ]);
			return true;
		}

		// Read
		var _ret = new Array();
		for(var i = 0, j = 0; i < _s.length ; i++) {
			var _key = _s.key(i);
			if ( _key == PREFIX + key ) {
				var _value = __get( _s, _key );
				if (_checkArgument('String', _value)) {
					if ( isJson( _value ) ) {
						_ret[ key ] = JSON.parse( _value );
					} else {
						_ret[ key ] = _value;
					}
				} else {
					_ret[ key ] = _value;
				}
				j++;
			}
		}
		if ( j == 1 ) {
			var expire = __get( _s, PREFIX + key + "_expire" );
			if ( typeof expire !== "undefined" && expire != null ) {
				var now = Date.parse( new Date() );
				if ( now > Number( expire ) ) {
					__remove( _s, PREFIX + key );
					__remove( _s, PREFIX + key + "_expire" );
					return undefined;
				}
			}
			return _ret[ key ];
		} else {
			return undefined;
		}
	}
	config.defaults = {
		"type" : "local"
	};
	$.removeStorage = function (key, options) {
		options = $.extend({}, config.defaults, options);
		var _s = _storage[ options.type ];
		if ( typeof _s === "undefined" ) {
			return undefined;
		}
		return __remove( _s, PREFIX + key );
	};
	$.clearStorage = function (options) {
		options = $.extend({}, config.defaults, options);
		var _s = _storage[ options.type ];
		if ( typeof _s === "undefined" ) {
			return undefined;
		}
		console.log( "_s.length:" + _s.length );
		var last = _s.length - 1;
		for(var i = last; i >= 0 ; i-- ) {
			var _key = _s.key(i);
			if ( _key.indexOf( PREFIX ) == 0 ) {
				console.log( "remove:" + _key );
				__remove( _s, _key );
			} else {
				console.log( "not remove:" + _key );
			}
		}
		return true;
	};

	function __set( _s, key, value ) {
		key = PREFIX + key;
		return _s.setItem( key, value );
	}
	function __get( _s, key ) {
		return _s.getItem( key );
	}
	function __remove( _s, key ) {
		return _s.removeItem( key );
	}
	function __clear( _s ) {
		return _s.clear();
	}
	function isArray( argument ) {
		var ret = false;
		if (_checkArgument('Array', argument)) {
			ret = true;
		}
		return ret;
	}
	function _checkArgument(type, argument) {
		var object = Object.prototype.toString.call(argument).slice(8, -1);
		return argument !== undefined && argument !== null && object === type;
	}
	function array2json( _array ) {
		var json = null;
		if ( isArray( _array ) ) {
			var jsonString = '';
			for ( var _k in _array ) {
				var _v = _array[_k];
				var __v = null;
				if ( _checkArgument( 'String', _v ) ) {
					_v = _v.replace( /"/g, '\\"' );;
					__v = '"' + _v + '"';
				} else if ( _checkArgument( 'Number', _v ) ) {
					__v = _v;
				} else if ( _checkArgument( 'Array', _v ) ) {
					__v = JSON.stringify( array2json( _v ) );
				} else {
					continue;
				}
				if ( jsonString == '' ) {
					jsonString = '{';
				} else {
					jsonString += ',';
				}
				jsonString += '"' + _k + '"';
				jsonString += ':';
				jsonString += __v;
			}
			jsonString += '}';
			json = JSON.parse( jsonString );
		}
		return json;
	}
	var isJson = function(arg){
		arg = (typeof(arg) == "function") ? arg() : arg;
		if(typeof(arg) != "string"){return false;}
		try{arg = (!JSON) ? eval("(" + arg + ")") : JSON.parse(arg);return true;}catch(e){return false;}
	}
	function is_numeric(input){
		return typeof(input)=='number';
	}
}));
