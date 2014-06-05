;(function($){
    $.fn.blur = function(options){
        var defaults = {
            strength: 6,            // 20以上はblurとは呼べないが範囲チェックしてません
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
            style += 'background: inherit;';
            style += 'filter: blur('+strength+'px);';
            style += '-webkit-filter: blur('+strength+'px);';
            style += '-moz-filter: blur('+strength+'px);';
            style += '-ms-filter: blur('+strength+'px);';
            style += '-o-filter: blur('+strength+'px);';
            style += 'filter: url(#blur);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius="'+strength+'");';
            style += 'z-index: '+(zIndex-1)+';';
            style += '}';
            style += '.'+layerName+'-wrapper {';
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
            var $that = $(this);
            ['left','top','right','bottom'].forEach(function(d){
                margin[d] = parseInt($that.css('margin-'+d) || 0, 10);
                padding[d] = parseInt($that.css('padding-'+d) || 0, 10);
                border[d] = parseInt($that.css('border-'+d+'-width') || 0, 10);
            });
            var width = $(this).width()+padding.left+padding.right+border.left+border.right;
            var height = $(this).height()+padding.top+padding.bottom+border.top+border.bottom;
            var css = {
                overflow: 'hidden',
                width: width+'px',
                height: height+'px',
                marginLeft: margin.left+'px',
                marginTop: margin.top+'px',
                marginRight: margin.right+'px',
                marginBottom: margin.bottom+'px'
            };
            var ratio = 0.3;    // strengthが大きい場合のblur領域エッジが飛び気味になる対策係数
            var tuning = $.extend({},css,{
                width: Math.floor(width*(1+ratio*2))+'px',
                height: Math.floor(height*(1+ratio*2))+'px',
                marginLeft: (margin.left-Math.floor(width*ratio))+'px',
                marginTop: (margin.top-Math.floor(height*ratio))+'px'
            });
            zIndex = ($(this).css('zIndex') !== 'auto') ? $(this).css('zIndex') : zIndex;
            var id = 'blur-'+String( Math.random() ).replace( '.', '' );
            var blur_layer = '<div class="'+layerName+'"></div>';
            $(this).parent().css({'background-attachment': 'fixed'});    // 親要素のbackground-attachmentは強制的にfixedとする
            $(this).wrap('<div id="'+id+'" class="'+layerName+'-wrapper" />');
            $(this).css({position: 'absolute', zIndex: zIndex});
            $(this).after(blur_layer);
            $('#'+id).css(css).find('.'+layerName).css(tuning);
            blurs.push($('#'+id));
        });
        return $(blurs);
    };
})(jQuery);

