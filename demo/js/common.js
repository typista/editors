load(
	[
		"http://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js",
		"http://code.jquery.com/jquery-2.0.3.min.js",
		"../../external/jquery-2.0.3.min.js"
	]
).thenLoad(
	"../css/style.css",
	[
		"../../external/jquery.ba-hashchange.1.3a.min.js"
	]
).thenRun( function() {
	$(document).ready( function() {
		var contentHeight = 0;
		$('#main-content div.content').each( function() {
			var thisHeight = $(this).height();
			contentHeight = thisHeight > contentHeight ? thisHeight : contentHeight;
		} );
		$('#main-content').css( { "height" : contentHeight + "px" } );
		var hash = location.hash;
		if ( typeof hash === "undefined" || hash === "" ) {
			location.hash = hash = "#about";
		}
		hash2content( hash );
		$(window).hashchange( function() {
			var hash = location.hash;
			hash2content( hash );
		} );
		function hash2content( hash ) {
			switch ( hash ) {
			case "#about":
			case "#usage":
				$('.on').removeClass('on');
				$('#demo-menu li a[href='+hash+']').addClass('on');
				$('#main-content div.content').fadeOut("fast", function() {
					$(hash).fadeIn("slow");
				});
				break;
			default:
				break;
			}
		}
	} );
} );
