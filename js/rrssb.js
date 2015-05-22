/*!
 Ridiculously Responsive Social Sharing Buttons
 Team: @dbox, @joshuatuscan
 Site: http://www.kurtnoble.com/labs/rrssb
 Twitter: @therealkni
        ___           ___
       /__/|         /__/\        ___
      |  |:|         \  \:\      /  /\
      |  |:|          \  \:\    /  /:/
    __|  |:|      _____\__\:\  /__/::\
   /__/\_|:|____ /__/::::::::\ \__\/\:\__
   \  \:\/:::::/ \  \:\~~\~~\/    \  \:\/\
    \  \::/~~~~   \  \:\  ~~~      \__\::/
     \  \:\        \  \:\          /__/:/
      \  \:\        \  \:\         \__\/
       \__\/         \__\/
*/

(function rrssb(window, $, undefined) {
	'use strict';

	var support = {
		calc : false
	};

	/*
	 * Public Function
	 */

	 $.fn.rrssb = function rssbPlugin() {
		this.each(rrssbInit);
	};

	/*
	 * Utility functions
	 */
	function detectCalcSupport() {
		//detect if calc is natively supported.
		var el = $('<div>');
		var calcProps = [
			'calc',
			'-webkit-calc',
			'-moz-calc'
		];

		$('body').append(el);

		for (var i=0; i < calcProps.length; i++) {
			el.css('width', calcProps[i] + '(1px)');
			if(el.width() === 1){
				support.calc = calcProps[i];
				break;
			}
		}

		el.remove();
	}

	function encodeString(string) {
		// Recursively decode string first to ensure we aren't double encoding.
		if (string !== undefined && string !== null) {
			if (string.match(/%[0-9a-f]{2}/i) !== null) {
				string = decodeURIComponent(string);
				encodeString(string);
			} else {
				return encodeURIComponent(string);
			}
		}
	}

	function setPercentBtns() {
        var self = $(this);
        var buttons = $('li:visible', self);
        var numOfButtons = buttons.length;
        var initBtnWidth = 100 / numOfButtons;

        // set initial width of buttons
        buttons.css('width', initBtnWidth + '%').attr('data-initwidth',initBtnWidth);
	}

	function makeExtremityBtns() {
        var self = $(this);
        //get button width
        var containerWidth = self.width();
        var buttonWidth = $('li', self).not('.small').first().width();

        // enlarge buttons if they get wide enough
        if (buttonWidth > 170 && $('li.small', self).length < 1) {
            self.addClass('large-format');
        } else {
            self.removeClass('large-format');
        }

        if (containerWidth < 200) {
            self.removeClass('small-format').addClass('tiny-format');
        } else {
            self.removeClass('tiny-format');
        }
	}

	function backUpFromSmall() {
        var self = $(this);

        var buttons = $('li', self);
        var smallButtons = buttons.filter('.small');
        var totalBtnSze = 0;
        var totalTxtSze = 0;
        var upCandidate = smallButtons.first();
        var nextBackUp = parseFloat(upCandidate.attr('data-size')) + 55;
        var smallBtnCount = smallButtons.length;

        if (smallBtnCount === buttons.length) {
            var btnCalc = smallBtnCount * 42;
            var containerWidth = self.width();

            if ((btnCalc + nextBackUp) < containerWidth) {
                self.removeClass('small-format');
                smallButtons.first().removeClass('small');

                sizeSmallBtns.call(this);
            }

        } else {
            buttons.not('.small').each(function forEachButton() {
                var button = $(this);
                var txtWidth = parseFloat(button.attr('data-size')) + 55;
                var btnWidth = parseFloat(button.width());

                totalBtnSze = totalBtnSze + btnWidth;
                totalTxtSze = totalTxtSze + txtWidth;
            });

            var spaceLeft = totalBtnSze - totalTxtSze;

            if (nextBackUp < spaceLeft) {
                upCandidate.removeClass('small');
                sizeSmallBtns.call(this);
            }
        }
	}

	function checkSize(init) {
        var self = $(this);
        var buttons = $('li', self);

        // get buttons in reverse order and loop through each
        $(buttons.get().reverse()).each(function forEachButton(index, count) {

            var button = $(this);

            if (button.hasClass('small') === false) {
                var txtWidth = parseFloat(button.attr('data-size')) + 55;
                var btnWidth = parseFloat(button.width());

                if (txtWidth > btnWidth) {
                    var btn2small = buttons.not('.small').last();
                    $(btn2small).addClass('small');
                    sizeSmallBtns.call(self.get(0));
                }
            }

            if (!--count) backUpFromSmall.call(self.get(0));
        });

		// if first time running, put it through the magic layout
		if (init === true) {
			rrssbMagicLayout.call(this, sizeSmallBtns.bind(this));
		}
	}

	function sizeSmallBtns() {
        var self = $(this);
        var regButtonCount;
        var regPercent;
        var pixelsOff;
        var magicWidth;
        var smallBtnFraction;
        var buttons = $('li', self);
        var smallButtons = buttons.filter('.small');

        // readjust buttons for small display
        var smallBtnCount = smallButtons.length;

        // make sure there are small buttons
        if (smallBtnCount > 0 && smallBtnCount !== buttons.length) {
            self.removeClass('small-format');

            //make sure small buttons are square when not all small
            smallButtons.css('width','42px');
            pixelsOff = smallBtnCount * 42;
            regButtonCount = buttons.not('.small').length;
            regPercent = 100 / regButtonCount;
            smallBtnFraction = pixelsOff / regButtonCount;

            // if calc is not supported. calculate the width on the fly.
            if (support.calc === false) {
                magicWidth = ((self.innerWidth()-1) / regButtonCount) - smallBtnFraction;
                magicWidth = Math.floor(magicWidth*1000) / 1000;
                magicWidth += 'px';
            } else {
                magicWidth = support.calc+'('+regPercent+'% - '+smallBtnFraction+'px)';
            }

            buttons.not('.small').css('width', magicWidth);

        } else if (smallBtnCount === buttons.length) {
            // if all buttons are small, change back to percentage
            self.addClass('small-format');
            setPercentBtns.call(this);
        } else {
            self.removeClass('small-format');
            setPercentBtns.call(this);
        }

		makeExtremityBtns.call(this);
	}

	function rrssbInit() {
		detectCalcSupport();

		setPercentBtns.call(this);

		// grab initial text width of each button and add as data attr
        $(this).find('li .rrssb-text').each(function forEachButtonText(index, element) {
			var buttonTxt = $(element);
			var txtWdth = buttonTxt.width();
			buttonTxt.closest('li').attr('data-size', txtWdth);
		});

		checkSize.call(this, true);
	}

	function rrssbMagicLayout(callback) {
		//remove small buttons before each conversion try
		$(this).find('li.small').removeClass('small');

		checkSize.call(this);

		callback();
	}

	function popupCenter(url, title, w, h) {
		// Fixes dual-screen position                         Most browsers      Firefox
		var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
		var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

		var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

		var left = ((width / 2) - (w / 2)) + dualScreenLeft;
		var top = ((height / 3) - (h / 3)) + dualScreenTop;

		var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

		// Puts focus on the newWindow
		if (window.focus) {
			newWindow.focus();
		}
	}

	var waitForFinalEvent = (function makeWaitFunction() {
		var timers = {};
		return function waitFunction(callback, ms, uniqueId) {
			if (!uniqueId) {
				uniqueId = "Don't call this twice without a uniqueId";
			}
			if (timers[uniqueId]) {
				clearTimeout (timers[uniqueId]);
			}
			timers[uniqueId] = setTimeout(callback, ms);
		};
	})();

	// init load
	$(document).ready(function rrssbOnReady(){
		/*
		 * Event listners
		 */

                $(document).on('click', '.rrssb-buttons a.popup', {}, function popUp(e) {
			var self = $(this);
			popupCenter(self.attr('href'), self.find('.rrssb-text').html(), 580, 470);
			e.preventDefault();
		});

		// resize function
		$(window).resize(function resize() {
            $('.rrssb-buttons').each(function doResize() {
                var container = this;
                rrssbMagicLayout.call(this, sizeSmallBtns.bind(this));

                waitForFinalEvent(function doMagicLayout() {
                    rrssbMagicLayout.call(container, sizeSmallBtns.bind(container));
                }, 200, "finished resizing");
            });
		});

		$('.rrssb-buttons').rrssb();
	});

})(window, jQuery);
