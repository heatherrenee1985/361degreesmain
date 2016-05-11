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
        } else {
            Y.one('#header').removeClass('sticky');
            Y.one('#logoImage img').setAttribute('src', '/assets/logo_white.png');
        }
     });
 
 }
 // Call the function on domready and window resize, just in case the Y position changes.
 Y.use('node', function() {
     Y.on('domready', function() {
         stickyHeader();
         Y.on('windowresize', function() {
             stickyHeader();
         });
     });
 });