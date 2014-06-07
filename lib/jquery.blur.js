// forked from typista's "流行のブラー処理を部分的にかけるプラグインのテスト" http://jsdo.it/typista/blur
;(function($){
	$.fn.blur = function(options){
		var defaults = {
			strength: 6,			// 20以上はblurとは呼べないが範囲チェックしてません
			zIndex: 100,
			layerName: 'blur-layer'
		};
		var setting = $.extend({},defaults,options);
		var layerName = setting.layerName;
		var strength = setting.strength;
		var zIndex = setting.zIndex;
		if ($('style.'+layerName).length === 0) {
			var style = '<style class="'+layerName+'">';
			style += '.'+layerName+'{';
			style += 'position: absolute;';
			style += 'top: 0px;';
			style += 'background: inherit;';
			style += 'filter: blur('+strength+'px);';
			style += '-webkit-filter: blur('+strength+'px);';
			style += '-moz-filter: blur('+strength+'px);';
			style += '-ms-filter: blur('+strength+'px);';
			style += '-o-filter: blur('+strength+'px);';
			style += 'filter: url(#blur);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius="'+strength+'");';
			style += '}';
			style += '.'+layerName+'-wrapper {';
			style += 'position: absolute;';
			style += 'top: 0px;';
			style += 'left: 0px;';
			style += 'margin: 0px;';
			style += 'background: inherit;';
			style += '}';
			style += '</style>';
			$(style).appendTo('head');
			var svg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">';
			svg += '<filter id="blur">';
			svg += '<feGaussianBlur stdDeviation="'+strength+'" />';
			svg += '</filter>';
			svg += '</svg>';
			$(svg).appendTo('body');
		}
		var blurs = [];
		this.each(function() {
			var margin = {};
			var padding = {};
			var border = {};
			var p_margin = {};
			var $that = $(this);
			var $parent = $(this).parent();
			['left','top','right','bottom'].forEach(function(d){
				margin[d] = parseInt($that.css('margin-'+d) || 0, 10);
				padding[d] = parseInt($that.css('padding-'+d) || 0, 10);
				border[d] = parseInt($that.css('border-'+d+'-width') || 0, 10);
				p_margin[d] = parseInt($parent.css('padding-'+d) || 0, 10);
			});
			zIndex = ($(this).css('zIndex') !== 'auto') ? $(this).css('zIndex') : zIndex;
			var width = $(this).width();
			var height = $(this).height();
			var css = {
				overflow: 'hidden',
				zIndex: zIndex,
				width: width+'px',
				height: height+'px',
				/*
				marginLeft: (padding.left*-1)+'px',
				marginTop: (padding.top*-1)+'px',
				marginRight: (padding.right*-1)+'px',
				marginBottom: (padding.bottom*-1)+'px',
				*/
				paddingLeft: padding.left+'px',
				paddingTop: padding.top+'px',
				paddingRight: padding.right+'px',
				paddingBottom: padding.bottom+'px'
			};
			var ratio = 0.3;	// strengthが大きい場合のblur領域エッジが飛び気味になる対策係数
			var tuning = $.extend({},css,{
				zIndex: zIndex-1,
				width: Math.floor(width*(1+ratio*2))+'px',
				height: Math.floor(height*(1+ratio*2))+'px',
				marginLeft: (-Math.floor(width*ratio))+'px',
				marginTop: (-Math.floor(height*ratio))+'px',
				marginRight: (-Math.floor(width*ratio))+'px',
				marginBottom: (-Math.floor(height*ratio))+'px',
				paddingLeft: 0+'px',
				paddingTop: 0+'px',
				paddingRight: 0+'px',
				paddingBottom: 0+'px'
			});
			var $children = $(this).children();
			var id = layerName+'-'+String( Math.random() ).replace( '.', '' );
			var blur_layer = '<div class="'+layerName+'"></div>';
			$('<div id="'+id+'" class="'+layerName+'-wrapper" />').appendTo($(this));
			$(blur_layer).appendTo($('#'+id));
			$('#'+id).css(css).find('.'+layerName).css(tuning);
			if ($(this).css('position') === 'static') {
				$(this).css({position: 'relative'});
			}
			$children.css({position: 'absolute', zIndex: zIndex+1});
			/**
			 * background属性の調整
			 */
			var bg;
			$(this).css({'background': 'inherit'});
			$(this).parents().each(function() {
				if (!bg) {
					if ($(this).css('background-image') === 'none') {	// 背景画像指定無しの場合
						// background属性を継承の指定
						$(this).css({'background': 'inherit'});
						$(this).css({'background-attachment': 'fixed'});
					} else {											// 背景画像指定された最上位親要素のみ
						// background-attachmentは強制的にfixedとする
						$(this).css({'background-attachment': 'fixed'});
						bg = true;
					}
				}
			});
			blurs.push($(this));
		});
		return $(blurs);
	};
})(jQuery);

