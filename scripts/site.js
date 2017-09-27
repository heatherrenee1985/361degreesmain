Y.use('node', function (Y) {
	window.Site = Singleton.create({

		ready: function () {
			console.log('ready');
			this.resetGalleryPosition();

			if (Y.one('.collection-type-index')) {
				this.resetIndexGalleryPosition();
			}

			if (Y.one('.collection-type-blog.view-list .sqs-featured-posts-gallery')) {
				Y.one('body').addClass('has-banner-image');
			}

			Y.on('domready', function () {
				this.init();
				this.bindUI();
				this.syncUI();
			}, this);

		},

		init: function() {

			this.forceMobileNav();
			this.promotedGalleryShrink();

			// Text shrink in banner areas
			if(Y.one('.has-promoted-gallery')){
				this.textShrink('.meta-description p > strong','p');
				this.textShrink('.meta-description p > em > strong','p');
			}else{
				this.textShrink('.desc-wrapper p > strong','p');
				this.textShrink('.desc-wrapper p > em > strong','p');
			}
			this.textShrink('.post-title a','.post-title');
			this.textShrink('.blog-item-wrapper .post-title','.title-desc-wrapper');

			this._touch = Y.one('.touch-styles');


			// Featured Posts Gallery
			if (Y.one('.collection-type-blog.view-list .sqs-featured-posts-gallery')) {
				this.makeFeaturedGallery('.posts', '.post');
			}

			this.hideArrowsWhenOneSlide();
			this.repositionCartButton();

			if (!this._touch) {
				var preFooter = Y.one('#preFooter');
				if (preFooter.inViewportRegion() === false) {
					preFooter.addClass('unscrolled');
				}

				Y.one(window).on('scroll', function () {
					if (preFooter.hasClass('unscrolled')) {
						preFooter.toggleClass('unscrolled', !preFooter.inViewportRegion());
					}
				});
			}
		},

		bindUI: function () {

			Y.one(window).on('resize', this.syncUI, this);

			if(Y.one('#mobileNavToggle')){
				Y.one('.body-overlay').on('click',function(e){
					e.preventDefault();
					Y.one('#mobileNavToggle').set('checked',false);
				});
			}

			// Scrolling stuff
			var throttleScroll = Y.throttle(Y.bind(function () {
				this.bindScroll('#preFooter', Y.one('#preFooter').height()*0.6);
			}, this), 200);

			if (!this._touch) {
				Y.one(window).on('scroll', throttleScroll);
			}

			Y.all('.subnav').each(function (subnav) {
				var rect = subnav._node.getBoundingClientRect();

				if (rect.right > Y.config.win.innerWidth) {
					subnav.addClass('right');
				}
			});
			// disabled to fix [TMP-3640]
			// look into fixing when possible -aparks
			// helper.scrollAnchors('#siteWrapper a[href^="#"], #siteWrapper a[href^="/#"]');

			Y.all('#sidecarNav a[href^="#"], #sidecarNav a[href^="/#"], #sidecarNav a[href^="/"][href*="#"]').each(function (hashLink) {
				hashLink.on('click', function (e) {
					e.halt();

					Y.one('#mobileNavToggle').set('checked',false);

					Y.later(300, this, function () {
						var hash = hashLink.getAttribute('href');

						if (hash.indexOf('#') > -1) {
							hash = hash.substr(hash.indexOf('#'));
						}

						var hashNode = Y.one(hash);
						if (hashNode) {
							helper.smoothScrollTo(hashNode.getY());
						}

						history.pushState({}, hash, hash);
					});
				}, this);
			}, this);

			this.showIndexNavOnScroll();
			this.disableHoverOnScroll();
			
			// GOOGLE MAP IFRAME
			var map = Y.one('#map');
			if(map) {
				map.on('click', function(event){
					event.preventDefault();
					if(map.hasClass('scrolloff')) {
						map.removeClass('scrolloff');
					}
					else {
						map.addClass('scrolloff');
					}
				});
			}
			
			// FEEFO
			var feefo = Y.one('.feefo-data');
			if(feefo) {
				var feefoSince = item.getAttribute('data-since');
				var feefoLimit = item.getAttribute('data-limit');
				var feefoSortBy = item.getAttribute('data-sortby');
				var feefoVendorRef = item.getAttribute('data-product');
				
				var xhr = new XMLHttpRequest();
				xhr.onload = function() {
					dump(xhr.responseXML.documentElement.nodeName);
				}
				xhr.onerror = function() {
					dump('Error while getting XML.');
				}
				xhr.open('GET', 'http://ww2.feefo.com/api/xmlfeedback?merchantidentifier=361-degrees&since=' + feefoSince +'&limit=' + feefoLimit + '&sortby=' + feefoSortBy + '&vendorref=' + urlencode(feefoVendorRef));
				xhr.responseType = 'document';
				xhr.send();

			}
			
			var videoItem = Y.one('.collection-type-video.view-item'); 
			if(videoItem) {
				Y.one('#logoImage img').setAttribute('src', '/assets/logo_green.png');
			}
			
			var itemTypes = Y.all('.type-list li');
			itemTypes.on('click', function(event){
				var a = event.target;
				event.preventDefault();



				itemTypes.each(function(item){
						item.removeClass('selected');
				});

				var titleListings = Y.all('.title-list .title-listing');
				titleListings.each(function(item){
						item.removeClass('selected');
				});
				a.addClass('selected');

				if(a.hasClass('blog')){
					Y.one('.title-list .blog-listing').addClass('selected');
				}
				if(a.hasClass('case')){
					Y.one('.title-list .case-study-listing').addClass('selected');
				}
				if(a.hasClass('video')){
					Y.one('.title-list .video-listing').addClass('selected');
				}
			
			});


			var knowledgeHub = Y.one('.knowledge-hub-block');
			if(knowledgeHub) {
				var categories = [],
					categoryList = knowledgeHub.one('ol.category-filter'),
					lists = knowledgeHub.all('ol.blog-list, ol.case-study-list, ol.video-list');
				lists.each(function(list){
					var counter = 0;
					var blogCounter = 0;
					var caseStudyCounter = 0;
					var videoCounter = 0;
					list.all('li').each(function(item){
						var cats = item.getAttribute('data-categories') || "";
						// assuming only one each, must fix for multi-cats
						Y.each(cats.split(','), function(cat){
							if(categories.indexOf(cat) == -1 && cat.length) {
								categories.push(cat);
							}
						});
						if(item.hasClass('blog-item') && blogCounter < 2) {
							item.removeClass('hide');
							item.addClass('show');
							blogCounter++;
							counter++;
						}
						if(item.hasClass('case-study-item') && caseStudyCounter < 2) {
							item.removeClass('hide');
							item.addClass('show');
							caseStudyCounter++;
							counter++;
						}
						if(item.hasClass('video-item') && videoCounter < 2) {
							item.removeClass('hide');
							item.addClass('show');
							caseStudyCounter++;
							counter++;
						}
						if(counter > 6 && item._node.parentNode.nodeName === 'OL') {
							item.removeClass('show');
							item.addClass('hide');
						}
						if(counter > 10 && item._node.parentNode.nodeName === 'UL') {
							item.removeClass('show');
							item.addClass('hide');
						}
					});
				});
				var li = Y.Node.create('<li><a></a></li>'),
							a = li.one('a');
						a.setHTML('All');
						a.addClass('filter-link');
						a.set('href', '#category:');
						a.on('click', function(event){
							event.preventDefault();
							if(a.hasClass('active')) {
								a.removeClass('active');
								lists.each(function(list){
									list.all('li').show();
								});
								return;
							}
							
							lists.each(function(list){
								var counter = 0;
								var blogCounter = 0;
								var caseStudyCounter = 0;
								var videoCounter = 0;
								list.all('li').each(function(item){
									item.removeClass('show');
									item.addClass('hide');
									//item[ item.getAttribute('data-categories').split(',').indexOf(category) == -1 ? 'hide' : 'show' ]();
									if(counter < 6) {
											if(item.hasClass('blog-item') && blogCounter < 2) {
												item.removeClass('hide');
												item.addClass('show');
												blogCounter++;
												counter++;
											}
											if(item.hasClass('case-study-item') && caseStudyCounter < 2) {
												item.removeClass('hide');
												item.addClass('show');
												caseStudyCounter++;
												counter++;
											}
											if(item.hasClass('video-item') && videoCounter < 2) {
												item.removeClass('hide');
												item.addClass('show');
												caseStudyCounter++;
												counter++;
											}
											//item.removeClass('hide');
											//item.addClass('show');
											
										}
										else {
											item.removeClass('show');
											item.addClass('hide');
										}
								})
							});
							Y.all('.filter-link').removeClass('active');
							a.addClass('active');
						});
					categoryList.append(li);
				Y.each(categories, function(category){
					if(category === 'News' || category === 'Videos' || category === 'Solutions' || category === 'Technology' || category === 'Company News' || category === 'Case Studies') {
						var li = Y.Node.create('<li><a></a></li>'),
							a = li.one('a');
						a.setHTML(category);
						a.addClass('filter-link');
						a.set('href', '#category:' + category);
						a.on('click', function(event){
							event.preventDefault();
							if(a.hasClass('active')) {
								a.removeClass('active');
								lists.each(function(list){
									list.all('li').show();
								});
								return;
							}
							var heading =  Y.one('.case_studies_heading');
							var caseStudyListing =  Y.one('.case-study-list');
							if(heading !== null)
							{
								if(category === 'Company News' || category === 'Technology') {
									heading.hide();
									caseStudyListing.hide();
								}
								else {
									heading.show();
									caseStudyListing.show();
								}
							}
							
							
							lists.each(function(list){
								var counter = 0;
								var blogCounter = 0;
								var caseStudyCounter = 0;
								var videoCounter = 0;
								list.all('li').each(function(item){
									//item[ item.getAttribute('data-categories').split(',').indexOf(category) == -1 ? 'hide' : 'show' ]();
									if (item.getAttribute('data-categories').split(',').indexOf(category) == -1) {
										item.removeClass('show');
										item.addClass('hide');
									} 
									else {
										if(category === 'Company News' || category === 'Case Studies' || category === 'Videos') {
											switch(category) {
												case 'Company News':
													var news = Y.all('ol .blog-item');
													news.each(function(item){
														  item.removeClass('hide');
															item.addClass('show');
													});
													var others = Y.all('ol .case-study-item, ol .video-item');
													others.each(function(item){
														  item.removeClass('show');
															item.addClass('hide');
													});
													
												break;
												case 'Case Studies':
													var news = Y.all('ol .case-study-item');
													news.each(function(item){
														  item.removeClass('hide');
															item.addClass('show');
													});
													var others = Y.all('ol .blog-item, ol .video-item');
													others.each(function(item){
														  item.removeClass('show');
															item.addClass('hide');
													});
													
												break;
												case 'Videos':
												default:
													
													var news = Y.all('ol .video-item');
													news.each(function(item){
														  item.removeClass('hide');
															item.addClass('show');
													});
													var others = Y.all('ol .blog-item, ol .case-study-item');
													others.each(function(item){
															item.removeClass('show');
															item.addClass('hide');
													});
												break;
											}
										}
										else {
											if(counter < 6) {
												if(item.hasClass('blog-item') && blogCounter < 2) {
													item.removeClass('hide');
													item.addClass('show');
													blogCounter++;
													counter++;
												}
												if(item.hasClass('case-study-item') && caseStudyCounter < 2) {
													item.removeClass('hide');
													item.addClass('show');
													caseStudyCounter++;
													counter++;
												}
												if(item.hasClass('video-item') && videoCounter < 2) {
													item.removeClass('hide');
													item.addClass('show');
													caseStudyCounter++;
													counter++;
												}
												//item.removeClass('hide');
												//item.addClass('show');
												
											}
											else {
												item.removeClass('show');
												item.addClass('hide');
											}
										}
									}
								})
							});
							Y.all('.filter-link').removeClass('active');
							a.addClass('active');
						});
						categoryList.append(li);
					}
				})
			}
		},

		syncUI: function () {

			if (this._touch || Y.one('.force-mobile-nav') || window.innerWidth <= 640) {
				helper.radioCheckboxes('#mainNavigation');
				helper.radioCheckboxes('#mobileNavigation');
			} else {
				helper.folderRedirect('#headerNav .folder-toggle-label');
				helper.folderRedirect('#footer .folder-toggle-label');
			}

			this.forceMobileNav();

			// Not sure why this is here.
			// Disabling to fix a bug (mobile nav was closing since syncUI is run on resize
			// and scrolling to the top after you open it is a resize?)
			// if(Y.one('#mobileNavToggle')){
			// 	Y.one('#mobileNavToggle').set('checked',false);
			// }

			helper.debounce(function () {
				this.addPaddingToFooter();
			});

		},

		bindScroll: function(element, offset){
			var nextElement;

			if (!nextElement) {
				nextElement = Y.one(element + '.unscrolled');
			}

			if (nextElement){
				var scrollPosition = window.pageYOffset + Y.one('body').get('winHeight');
				var elementPosition = nextElement.getY() + (offset || 0);

				if (scrollPosition >= elementPosition){
					nextElement.removeClass('unscrolled');
				}
			}

		},

		_atLeast: 0,
		forceMobileNav: function () {

			var nav = Y.one('#mainNavWrapper');

				if (nav) {

				var windowWidth = Y.one('body').get('winWidth');
				var header = Y.one('#header');
				var headerWidth;
				var navWidth;
				var logoWidth;

				if (Y.one('#logoWrapper')) {
					logoWidth = parseInt(Y.Squarespace.Template.getTweakValue('logoContainerWidth'),10);
				} else {
					logoWidth = parseInt(Y.Squarespace.Template.getTweakValue('siteTitleContainerWidth'),10);
				}

				if (windowWidth > this._atLeast) {
					Y.one('body').removeClass('force-mobile-nav');

					headerWidth = header.get('offsetWidth') - parseInt(header.getStyle('paddingLeft'),10) - parseInt(header.getStyle('paddingRight'),10);
					navWidth = nav.get('offsetWidth');

					if (navWidth > headerWidth - logoWidth) {
						Y.one('body').addClass('force-mobile-nav');
						this._atLeast = windowWidth;
					}
				} else {
					Y.one('body').addClass('force-mobile-nav');
				}
			}
		},

		makeFeaturedGallery: function (container, slides) {

			var featuredGallery = new Y.Squarespace.Gallery2({
				autoHeight: false,
				container: container,
				slides: slides,
				elements: {
					next: '.next-slide, .simple .next, .sqs-gallery-controls .next',
					previous: '.previous-slide, .simple .previous, .sqs-gallery-controls .previous',
					controls: '.dots, .circles',
					currentIndex: '.current-index',
					totalSlides: '.total-slides'
				},
				loop: true,
				loaderOptions: {
					load: true
				},
				design: 'stacked',
				designOptions: {
					transition: 'fade',
					clickBehavior: 'auto'
				},
				refreshOnResize: true
			});

		},

		promotedGalleryShrink: function () {

			var meta = '.has-promoted-gallery #promotedGalleryWrapper .meta';
			var promotedGalleryHeight;
			var metaHeight;
			var slide;

			if (Y.one(meta)) {
				promotedGalleryHeight = Y.one('#promotedGalleryWrapper').get('offsetHeight');
				if(Y.one('.transparent-header')){
					// Provide less of an allowance if transparent header
					promotedGalleryHeight = promotedGalleryHeight - 90;
				}

				Y.all(meta).each(function(current){
					current.setStyle('display','block');
					metaHeight = current.get('offsetHeight');

					if(metaHeight > promotedGalleryHeight){
						slide = current.ancestor('.slide');
						slide.addClass('reduce-text-size');
						metaHeight = current.get('offsetHeight');

						if(metaHeight > promotedGalleryHeight){
							slide.removeClass('reduce-text-size');
							slide.addClass('hide-body-text');
							metaHeight = current.get('offsetHeight');

							if(metaHeight > promotedGalleryHeight){
								slide.addClass('reduce-text-size');
							}
						}
					}

					current.setAttribute('style','');
				});

			}
		},

		textShrink: function (element, ancestor) {
			if(Y.one(element) && Y.one(element).ancestor(ancestor)){
				Y.all(element).each(function(item){
					item.plug(Y.Squarespace.TextShrink, {
						parentEl: item.ancestor(ancestor)
					});
				});
			}
		},

		resetIndexGalleryPosition: function () {

			var slideshows = '.collection-type-index .index-section .sqs-layout > .sqs-row:first-child > .sqs-col-12 > .gallery-block:first-child .sqs-gallery-block-slideshow';
			var slideshowContainers = '.collection-type-index .index-section .promoted-gallery-wrapper ~ .index-section-wrapper .sqs-layout > .sqs-row:first-child > .sqs-col-12 > .gallery-block:first-child';

			var firstPageSlideshow = Y.one('.collection-type-index .index-section:first-child .sqs-layout > .sqs-row:first-child > .sqs-col-12 > .gallery-block:first-child .sqs-gallery-block-slideshow');

			if (firstPageSlideshow) {
				Y.one('body').addClass('has-banner-image');
			}

			if (Y.one(slideshows)) {
				Y.one('body').addClass('has-promoted-gallery');
				Y.all(slideshowContainers).each(function(current) {
					if (current.one('.sqs-gallery-block-slideshow')) {
						current.ancestor('.index-section-wrapper').previous('.promoted-gallery-wrapper').addClass('promoted-full').append(current);
					}
				});
			}

		},

		resetGalleryPosition: function () {

			var slideshow = Y.one('.collection-type-page .main-content .sqs-layout > .sqs-row:first-child > .sqs-col-12 > .gallery-block:first-child .sqs-gallery-block-slideshow');
			var slideshowContainer = Y.one('.collection-type-page .main-content .sqs-layout > .sqs-row:first-child > .sqs-col-12 > .gallery-block:first-child');

			if (slideshow) {
				Y.one('#promotedGalleryWrapper .row .col').append(slideshowContainer);
				Y.one('body').addClass('has-promoted-gallery').addClass('has-banner-image');
			}

		},

		hideArrowsWhenOneSlide: function () {

			if (Y.one('.posts .post:only-child')) {
				Y.all('.circles').addClass('hidden');
			}

		},

		repositionCartButton: function () {

			var headerHeight = Y.one('#header').get('offsetHeight');
			var cartPill = Y.one('.sqs-cart-dropzone');
			if (cartPill) {
				if (Y.one('.transparent-header.has-banner-image')) {
					cartPill.setStyle('top', headerHeight);
				} else {
					cartPill.setStyle('top', headerHeight + 20);
				}
			}

		},


		// takes care of showing the index nav on mobile
		showIndexNavOnScroll: function() {

			var navShowPosition,
					headerHeight;

			var getVariables = function() {
				if (Y.one('.index-section')) {
					navShowPosition = Y.one('.index-section').get('offsetHeight');
				}
			};

			getVariables();

			if (Y.one('.collection-type-index') && window.innerWidth <= 640) {

				var scrollStates = function () {

					// scrolled past first index page?
					if ((navShowPosition - window.pageYOffset) <= 0) {
						Y.one('body').addClass('fix-header-nav');
					} else {
						Y.one('body').removeClass('fix-header-nav');
					}

				};

				Y.one(window).on('resize', function() {
					getVariables();
				});

				scrollStates();

				Y.one(window).on('scroll',function(){
					scrollStates();
				}, this);

				// forcibly removes fix-header-nav class for ios safari
				// which doesn't seem to recognize opening the nav as a scroll event
				Y.one('.mobile-nav-toggle-label.fixed-nav-toggle-label').on('click', function() {
					if (Y.one('body').hasClass('fix-header-nav')) {
						Y.one('body').removeClass('fix-header-nav');
					}
				});

				Y.one(window).on(['touchstart', 'MSPointerDown'], function () {
					this._timeout && this._timeout.cancel();
					this.isHidden = true;
					if (this.isHidden === true) {
						Y.one('.mobile-nav-toggle-label.fixed-nav-toggle-label').setStyle('opacity', 1);
						this.isHidden = false;
					}
				}, this);

				Y.one(window).on(['touchend', 'MSPointerUp'], function () {
					this._timeout = Y.later(1500, this, function () {
						this.isHidden = true;
						Y.one('.mobile-nav-toggle-label.fixed-nav-toggle-label').setStyle('opacity', 0);
					});
				}, this);

	    	}
		},

		//keeps the mobile nav from peeking out of the bottom on short pages
		addPaddingToFooter: function () {

			var footerPadding = parseInt(Y.one('#footer').getStyle('paddingBottom'),10);
			var siteHeight = Y.one('#siteWrapper').get('offsetHeight');
			var windowHeight = Y.one('body').get('winHeight');
			if ((siteHeight - footerPadding) <= windowHeight) {
				Y.one('#footer').setStyle('paddingBottom', windowHeight - (siteHeight - footerPadding));
			}

		},

		disableHoverOnScroll: function () {
			if (Y.UA.mobile) {
				return false;
			}

			var css = '.disable-hover:not(.sqs-layout-editing), .disable-hover:not(.sqs-layout-editing) * { pointer-events: none  ; }',
			    head = document.head || document.getElementsByTagName('head')[0],
			    style = document.createElement('style'),
				body = document.body,
				timer;

			style.type = 'text/css';
			if (style.styleSheet){
			  style.styleSheet.cssText = css;
			} else {
			  style.appendChild(document.createTextNode(css));
			}

			head.appendChild(style);

			window.addEventListener('scroll', function() {
				clearTimeout(timer);
				if(!body.classList.contains('disable-hover')) {
					body.classList.add('disable-hover');
				}

				timer = setTimeout(function(){
					body.classList.remove('disable-hover');
				},300);
			}, false);
		}

	});
});
