$(document).ready(function(){
	var $navLinks = $('#nav-links')
	var $hamburger = $('.hamburger-slim')
	
	$navLinks.hide()
	
	$hamburger.click(function(){
		$('#nav-links').toggle();
	});
	
})