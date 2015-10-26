$(document).ready(function () {
	var $navLinks = $('#nav-links')
	var $hamburger = $('.hamburger-slim')

	$navLinks.hide() //nav links are initially hidden

	$hamburger.click(function () {
		var $links = $(this).next()

		if ($links.is(":hidden")) {
			if ($links.hasClass('bounceOutDown')) {
				$links.removeClass('bounceOutDown');
			}
			$links.show().addClass('animated bounceInUp');
		} else {
			$links.addClass('animated bounceOutDown').removeClass('bounceInUp')
			$links.promise().done(function(){
				// will be called when all the animations on the queue finish
				$links.hide()
			});
			//$links.css('display','none')
		}
	});

})
