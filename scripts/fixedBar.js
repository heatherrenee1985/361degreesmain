 function stickyHeader() {
     // Get this value outside of the scroll listener.
     // That way the browser doesn't have to recalculate a million times.
     var anchorY = Y.one('#sticky-anchor').getY();

     if (anchorY < window.scrollY) {
            Y.one('#header').addClass('sticky');
     }

     Y.on('scroll', function() {
        if (anchorY < window.scrollY) {
            Y.one('#header').addClass('sticky');
						Y.one('#logoImage img').setAttribute('src', '/assets/logo_green.png');
						if (window.location.pathname.indexOf('contact-consulting') != -1) {
							Y.one('#logoImage img').setAttribute('src', '/assets/logo_consulting.png');
						}
        } else {
            Y.one('#header').removeClass('sticky');
            var videoItem = Y.one('.collection-type-video.view-item');
			if(!videoItem) {
				Y.one('#logoImage img').setAttribute('src', '/assets/logo_white.png');
			}

        }
     });

 }

function showScrollTop() {
    var body = Y.one(Y.UA.gecko || Y.UA.ie || !!navigator.userAgent.match(/Trident.*rv.11\./) ? 'html' : 'body');
    Y.on('scroll', function() {
        if (window.scrollY > 900) {
           Y.one('#scrollToTop').addClass('show');

        } else {
            Y.one('#scrollToTop').removeClass('show');
        }
    });
}

function scrollTop() {
    var scrollTop = Y.one('#scrollToTop');
    scrollTop.on('click', function() {
        var a = new Y.Anim({
            node: Y.one(Y.UA.gecko || Y.UA.ie || !!navigator.userAgent.match(/Trident.*rv.11\./) ? 'html' : 'body'),
            to: {
                scrollTop : 0
            },
            duration: 2.0,
            easing: 'easeOut'
        });

        a.run();

        a.on('end', function () {
            a.destroy();
        });

    });
}


 // Call the function on domready and window resize, just in case the Y position changes.
 Y.use('node', function() {
     Y.on('domready', function() {
         stickyHeader();
         showScrollTop();
         scrollTop();
         Y.on('windowresize', function() {
             stickyHeader();
         });
     });
 });