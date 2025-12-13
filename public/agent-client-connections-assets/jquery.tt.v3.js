(function ($) {

    $.fn.twentytwenty = function (options) {
        var options = $.extend({ default_offset_pct: 0.5, orientation: 'horizontal' }, options);
        return this.each(function () {

            var sliderPct = options.default_offset_pct;
            var container = $(this);
            var sliderOrientation = options.orientation;
            var beforeDirection = (sliderOrientation === 'vertical') ? 'down' : 'left';
            var afterDirection = (sliderOrientation === 'vertical') ? 'up' : 'right';


            container.wrap("<div class='twentytwenty-wrapper twentytwenty-" + sliderOrientation + "'></div>");
            //container.append("<div class='twentytwenty-overlay'></div>");
            var beforeImg = container.find("img:first");
            var afterImg = container.find("img:last");
            container.append("<div class='twentytwenty-handle'></div>");
            var slider = container.find(".twentytwenty-handle");
            slider.append("<span class='tt-arrow-before twentytwenty-" + beforeDirection + "-arrow'></span>");
            slider.append("<span class='tt-arrow-after twentytwenty-" + afterDirection + "-arrow'></span>");
            container.addClass("twentytwenty-container");
            beforeImg.addClass("twentytwenty-before");
            afterImg.addClass("twentytwenty-after");

            //var overlay = container.find(".twentytwenty-overlay");
            //overlay.append("<div class='twentytwenty-before-label'></div>");
            //overlay.append("<div class='twentytwenty-after-label'></div>");

            var calcOffset = function (dimensionPct) {
                var w = beforeImg.width();
                var h = getWidgetImageHeight();
                return {
                    w: w + "px",
                    h: h + "px",
                    cw: (dimensionPct * w) + "px",
                    ch: (dimensionPct * h) + "px"
                };
            };

            var adjustContainer = function (offset) {
                if (getWidgetImageHeight() == 0) return;
                if (sliderOrientation === 'vertical') {
                    beforeImg.css("clip", "rect(0," + offset.w + "," + offset.ch + ",0)");
                    afterImg.css("clip", "rect(" + offset.ch + "," + offset.w + "," + offset.h + ",0)");
                }
                else {
                    beforeImg.css("clip", "rect(0," + offset.cw + "," + offset.h + ",0)");
                    afterImg.css("clip", "rect(0," + offset.w + "," + offset.h + "," + offset.cw + ")");
                }
                //container.css("height", offset.h);
                container.css("height", getWidgetImageHeight());

            };

            var adjustSlider = function (pct) {
                var offset = calcOffset(pct);
                slider.css((sliderOrientation === "vertical") ? "top" : "left", (sliderOrientation === "vertical") ? offset.ch : offset.cw);
                adjustContainer(offset);
            };

            $(window).on("resize.twentytwenty", function (e, pct) {
                if (typeof pct !== 'undefined') {
                   if (pct > 0)
                        sliderPct = pct;
                }
               
                adjustSlider(sliderPct);
            });
            $(window).on("changeOrientation.twentytwenty", function (e, orient) {
                log('changeOrient:' + orient);
                sliderOrientation = orient;
                beforeDirection = (sliderOrientation === 'vertical') ? 'down' : 'left';
                afterDirection = (sliderOrientation === 'vertical') ? 'up' : 'right';
                slider.find(".tt-arrow-before").removeClass('twentytwenty-down-arrow').removeClass('twentytwenty-left-arrow').addClass("twentytwenty-" + beforeDirection + "-arrow");
                slider.find(".tt-arrow-after").removeClass('twentytwenty-up-arrow').removeClass('twentytwenty-right-arrow').addClass("twentytwenty-" + afterDirection + "-arrow");
                if (sliderOrientation === "vertical")
                    slider.css( "left", '');
                else
                    slider.css("top", '');

                container.parent().removeClass('twentytwenty-horizontal').removeClass('twentytwenty-vertical').addClass("twentytwenty-" + sliderOrientation);
                adjustSlider(sliderPct);
            });

            var offsetX = 0;
            var imgWidth = 0;
            var imgHeight = 0;
            var isOutside = false;

            $(document).mouseenter(function () {
                isOutside = false;
            });
            $(document).mouseleave(function () {
                isOutside = true;
            });

            slider.on("movestart", function (e) {
                if (((e.distX > e.distY && e.distX < -e.distY) || (e.distX < e.distY && e.distX > -e.distY)) && sliderOrientation !== 'vertical') {
                    e.preventDefault();
                }
                else if (((e.distX < e.distY && e.distX < -e.distY) || (e.distX > e.distY && e.distX > -e.distY)) && sliderOrientation === 'vertical') {
                    e.preventDefault();
                }
                container.addClass("active");
                offsetX = container.offset().left;
                offsetY = container.offset().top;
                imgWidth = beforeImg.width();
                //imgHeight = beforeImg.height();
                imgHeight = getWidgetImageHeight();

            });

            slider.on("moveend", function (e) {
                container.removeClass("active");
            });

            slider.on("move", function (e) {
                //log('e.pageX:' + e.pageX + ';' + e.deltaX + ';' + e.startX + ';' + e.distX + ';' + e.velocityX);
                //log(isOutside);
                var isEdge = false;
                if (typeof isIeOrEdge === "function") {
                    isEdge = isIeOrEdge();
                }

                if (container.hasClass("active") && (!isOutside || !isEdge  )) {
                    sliderPct = (sliderOrientation === 'vertical') ? (e.pageY - offsetY) / imgHeight : (e.pageX - offsetX) / imgWidth;
                    if (sliderPct < 0) {
                        sliderPct = 0;
                    }
                    if (sliderPct > 1) {
                        sliderPct = 1;
                    }
                    adjustSlider(sliderPct);
                }
            });

            container.find("img").on("mousedown", function (event) {
                event.preventDefault();
            });

            slider.on("touchmove", function (e) {
                e.preventDefault();
            });

            $(window).trigger("resize.twentytwenty");
        });
    };

})(jQuery);
