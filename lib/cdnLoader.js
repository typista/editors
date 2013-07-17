/*!
 * CDN Loader Plugin
 * https://github.com/typista/editors
 * (C) 2013 editors
 * Released under the MIT license
 */

/* Copyright (c) 2010 Chris O'Hara <cohara87@gmail.com>. MIT Licensed */
/* Include the chain.js microframework (http://github.com/chriso/chain.js) */
;(function(a){a=a||{};var b={},c,d;c=function(a,d,e){var f=a.halt=!1;a.error=function(a){throw a},a.next=function(c){c&&(f=!1);if(!a.halt&&d&&d.length){var e=d.shift(),g=e.shift();f=!0;try{b[g].apply(a,[e,e.length,g])}catch(h){a.error(h)}}return a};for(var g in b){if(typeof a[g]==="function")continue;(function(e){a[e]=function(){var g=Array.prototype.slice.call(arguments);if(e==="onError"){if(d){b.onError.apply(a,[g,g.length]);return a}var h={};b.onError.apply(h,[g,g.length]);return c(h,null,"onError")}g.unshift(e);if(!d)return c({},[g],e);a.then=a[e],d.push(g);return f?a:a.next()}})(g)}e&&(a.then=a[e]),a.call=function(b,c){c.unshift(b),d.unshift(c),a.next(!0)};return a.next()},d=a.addMethod=function(d){var e=Array.prototype.slice.call(arguments),f=e.pop();for(var g=0,h=e.length;g<h;g++)typeof e[g]==="string"&&(b[e[g]]=f);--h||(b["then"+d.substr(0,1).toUpperCase()+d.substr(1)]=f),c(a)},d("chain",function(a){var b=this,c=function(){if(!b.halt){if(!a.length)return b.next(!0);try{null!=a.shift().call(b,c,b.error)&&c()}catch(d){b.error(d)}}};c()}),d("run",function(a,b){var c=this,d=function(){c.halt||--b||c.next(!0)},e=function(a){c.error(a)};for(var f=0,g=b;!c.halt&&f<g;f++)null!=a[f].call(c,d,e)&&d()}),d("defer",function(a){var b=this;setTimeout(function(){b.next(!0)},a.shift())}),d("onError",function(a,b){var c=this;this.error=function(d){c.halt=!0;for(var e=0;e<b;e++)a[e].call(c,d)}})})(this);
/* End of include the chain.js */

(function() {
var head = document.getElementsByTagName('head')[0] || document.documentElement;
var that;
addMethod('load', function (args, argc) {
    for (var queue = [], i = 0; i < argc; i++) {
        (function (i) {
            queue.push(asyncLoadScript(args[i]));
        }(i));
    }
    that = this;
    this.call('run', queue);
});

function asyncLoadScript(arg) {
    return function (onload, onerror) {
	//console.log( window.navigator.userAgent );
	var CDN_LOADER_PREFIX = "cdn-loader";
	var isStupid = false;
	if ( window.navigator.userAgent.indexOf( "AppleWebKit/534" ) !== -1 ||
	     window.navigator.userAgent.indexOf( "resto/2.12" ) !== -1 ||
	     window.navigator.userAgent.indexOf( "Trident/5" ) !== -1
	) {
		isStupid = true;
	}
	var hash = String( Math.random() ).replace( '.', '' );
        var url;
        if ( isArray( arg ) ) {
                url = arg[0];
                arg.shift();
        } else {
                url = arg;
                arg = '';
        }
	var isCss = ( url.match(/.*\.css.*/) !== null ) ? true : false;
	var attr, tag;
	if ( isCss ) {
		if ( isStupid ) {
			tag = "script";
        		attr = {
				src : url,
				type : "text/javascript"
			};
		} else {
			tag = "link";
        		attr = {
				href : url,
				rel : "stylesheet",
				type : "text/css"
			};
		}
	} else {
		tag = "script";
        	attr = {
			src : url,
			type : "text/javascript"
		};
	}
        attr.id = CDN_LOADER_PREFIX+hash;
        var script = document.createElement(tag);
	if ( isStupid ) {
		script.addEventListener( "DOMContentLoaded", (function(){
			script.removeEventListener('DOMContentLoaded', arguments.callee);
			setTimeout( function() {
				if ( isCss ) {
					var removeThis = document.getElementById(CDN_LOADER_PREFIX+hash);
					if ( removeThis === null ) return;
					var _src = removeThis.src;
					removeThis.parentNode.removeChild( removeThis );
        				var _script = document.createElement("link");
					_script.href = _src;
					_script.rel = "stylesheet";
					_script.type = "text/css";
        				head.insertBefore(_script, null);
				}
				onload();
			}, 900 );
		})(), false );
		script.addEventListener( "error", function(e) {(function(){
			script.removeEventListener('error', arguments.callee);
			var removeThis = document.getElementById('cdn-loader'+hash);
			removeThis.parentNode.removeChild( removeThis );
			//if ( e.type === "error" && arg.length > 0 ) {
			if ( arg.length > 0 ) {
				var queue = [];
				queue.push(asyncLoadScript(arg));
				that.call('run', queue);
			} else {
				//setTimeout( function(e) {
					onerror(e);
				//}, 100 );
			}
		})()}, false );
	} else {
        	script.onload = function (e) {
			onload();
		};
        	script.onerror = function(e) {
			var removeThis = document.getElementById(CDN_LOADER_PREFIX+hash);
			removeThis.parentNode.removeChild( removeThis );
			if ( e.type === "error" && arg.length > 0 ) {
				var queue = [];
				queue.push(asyncLoadScript(arg));
				that.call('run', queue);
			} else {
				onerror(e);
			}
		};
	}
        script.onreadystatechange = function () {
            var state = this.readyState;
            if (state === 'loaded' || state === 'complete') {
                script.onreadystatechange = null;
                onload();
            }
        };
	for ( var key in attr ) {
		script[key] = attr[key];
	}
        //head.insertBefore(script, head.firstChild);
       	head.insertBefore(script, null);
    }
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
})();
