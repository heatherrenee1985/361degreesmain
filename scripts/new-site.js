$(document).ready( function() {   
	$("#to-contact-form").click(function() {
		var headerHeight = $(header).height();
		
		$('html, body').animate({
				scrollTop: $("#contact-form").offset().top - headerHeight
		}, 600);
	});
 });