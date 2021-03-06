/**
 * Preview for the editor, this should be moved to /resources/wikia/modules once we want to use it for several skins
 */
define( 'wikia.preview', [
	'wikia.window',
	'wikia.nirvana',
	'jquery',
	'wikia.loader',
	'wikia.mustache',
	'JSMessages',
	'wikia.tracker',
	'wikia.csspropshelper',
	'wikia.fluidlayout'
], function (
	window,
	nirvana,
	$,
	loader,
	mustache,
	msg,
	tracker,
	cssPropHelper,
	fluidlayout
) {
	'use strict';

	var $article,
		$previewTypeDropdown = $(), // in case preview loaded quicker than switchPreview
		previewTemplate, // current design of preview has this margins to emulate page margins
		// TODO: when we will redesign preview to meet darwin design directions -
		// TODO: this should be done differently and refactored
		// values for min and max are Darwin minimum and maximum supported article width.
		articleMargin = fluidlayout.getWidthPadding() + fluidlayout.getArticleBorderWidth(),
		rightRailWidth = fluidlayout.getRightRailWidth(),
		isRailDropped = false,
		isWidePage = false,
		articleWrapperWidth, // width of article wrapper needed as reference for preview scaling
		// pixels to be removed from modal width to fit modal on small screens,
		// won't be needed when new modals will be introduced
		FIT_SMALL_SCREEN = 80,
		previewTypes, //List of available preview options
		currentTypeName, //Currently used preview type
		editPageOptions, //options passed from EditPageLayout
		previewLoaded; //a flag indicating that preview has been loaded

	// show dialog for preview / show changes and scale it to fit viewport's height
	function renderDialog ( title, options, callback ) {
		options = $.extend({
			callback: function () {
				var contentNode = $( '#EditPageDialog' ).find( '.ArticlePreviewInner' );

				// block all clicks
				contentNode.bind( 'click', function ( ev ) {
						var target = $( ev.target );

						//links to other pages should be open in new windows
						target.closest( 'a' ).not( '[href^="#"]' ).attr( 'target', '_blank' );
					}).closest( '.ArticlePreview' ).css({
						'height': options.height || ( $( window ).height() - 250 ),
						'overflow': 'auto',
						'overflow-x': 'hidden'
					});

				if ( typeof callback === 'function' ) {
					callback( contentNode );
				}
			},
			id: 'EditPageDialog',
			width: 680
		}, options );

		// use loading indicator before real content will be fetched
		var content = '<div class="ArticlePreview"><div class="ArticlePreviewInner"><img src="' +
			window.stylepath +
			'/common/images/ajax.gif" class="loading"></div></div>';

		$.showCustomModal( title, content, options );
	}

	/**
	 * @desc Handles appending mobile preview to modal
	 *
	 * This is a separate skin so we're loading it in iframe
	 * @param {object} data - data that comes from preview api
	 */
	function handleMobilePreview ( data ) {
		var iframe = $article.html(
				'<div class="mobile-preview"><iframe  width="320" height="480"></iframe></div>'
			).find( 'iframe' )[ 0 ],
			doc = iframe.document;

		if ( iframe.contentDocument ) {
			doc = iframe.contentDocument;
		} else if ( iframe.contentWindow ) {
			doc = iframe.contentWindow.document;
		}

		doc.open();
		doc.writeln( data.html );
		doc.close();
	}

	/**
	 * @desc Handles appending desktop preview to modal
	 * @param {object} data - data that comes from preview api
	 */
	function handleDesktopPreview ( data ) {
		$article.html( data.html + data.catbox + data.interlanglinks );
	}

	/**
	 * @desc Function that loads preview
	 * @param {string} type - What type of preview to load currently
	 *                          empty -> Desktop preview,
	 *                          mobile -> Mobile preview
	 * @param {boolean} opening - whether this is first load and all values should be calculated
	 */
	function loadPreview ( type, opening ) {
		if ( !opening ) {
			$previewTypeDropdown.attr( 'disabled', true );
			$article.parent().startThrobbing();
		}

		editPageOptions.getPreviewContent( function ( data ) {
			previewLoaded = true;
			$previewTypeDropdown.attr( 'disabled', false );
			$article.parent().stopThrobbing();

			if ( type === previewTypes.mobile.name ) {
				handleMobilePreview( data );
			} else {
				handleDesktopPreview( data );
			}

			if ( window.wgOasisResponsive ) {
				if ( opening ) {

					if ( isRailDropped || isWidePage ) {
						// set proper preview width for shrinken modal
						$article.width( editPageOptions.width - articleMargin * 2 );
					}

					// set current width of the article
					previewTypes.current.value = previewTypes.mobile.value = $article.width();

					// get width of article Wrapper
					// subtract scrollbar width to get correct width needed as reference point for scaling
					articleWrapperWidth = $article.parent().width() - editPageOptions.scrollbarWidth;

					if ( currentTypeName ) {
						$article.width( previewTypes[ currentTypeName ].value );
					}
				}

				// initial scale of article preview
				scalePreview( currentTypeName );
			}

			if ( opening ) {
				// move "edit" link to the right side of heading names
				$article.find( '.editsection' ).each(function () {
					var $this = $( this );
					$this.appendTo( $this.next() );
				});

				addEditSummary( $article, editPageOptions.width, data.summary );

				// fire an event once preview is rendered
				$( window ).trigger( 'EditPageAfterRenderPreview', [ $article ] );
			}
			//If current view is different skin, pass it to getPreviewContent
		}, previewTypes[ currentTypeName ].skin );
	}

	/**
	 * @desc Function that handles adding preview switch to modal
	 * @param {string} template - preview dropdown template
	 */
	function handlePreviewDropdown ( template ) {
		var $dialog = $( '#EditPageDialog' ),
			dialog = $dialog[ 0 ],
			tooltipParams = {
				placement: 'right'
			},
			params = {
				options: [
					{
						value: previewTypes.current.name,
						name: msg( 'wikia-editor-preview-current-width' )
					},
					{
						value: previewTypes.min.name,
						name: msg( 'wikia-editor-preview-min-width' )
					},
					{
						value: previewTypes.max.name,
						name: msg( 'wikia-editor-preview-max-width' )
					},
					{
						value: previewTypes.mobile.name,
						name: msg( 'wikia-editor-preview-mobile-width' )
					}
				],
				toolTipMessage: msg( 'wikia-editor-preview-type-tooltip' )
			},
			html = mustache.render( template, params );

		$( html ).insertAfter( $dialog.find( 'h1:first' ) );

		// attach events to type dropdown
		$previewTypeDropdown = $( '#previewTypeDropdown' ).on( 'change', function ( event ) {
			switchPreview( $( event.target ).val() );
		}).val( currentTypeName );

		if ( previewLoaded ) {
			$previewTypeDropdown.attr( 'disabled', false );
		}

		if ( dialog && dialog.style && dialog.style.zIndex ) {
			// on Chrome when using $.css('z-index') / $.css('zIndex') it returns 2e+9
			// this vanilla solution works better
			tooltipParams[ 'z-index' ] = parseInt( dialog.style.zIndex, 10 );
		}

		$( '.tooltip-icon' ).tooltip( tooltipParams );
	}

	/**
	 * Display a dialog with article preview. Options passed in the object are:
	 *  - 'width' - dialog width in pixels
	 *  - 'isRailDropped' - flag set to true for window size 1023 and below when responsive layout is enabled
	 *  - 'scrollbarWidth' - width of the scrollbar
	 *                      (need do be subtracted from article wrapper width as reference for scaling)
	 *  - 'onPublishButton' - callback function launched when user presses the 'Publish' button on the dialog
	 *  - 'getPreviewContent' - callback function called when the dialog tries to fetch the current article content from
	 *    the editor. this function takes a callback as a parameter and is supposed to call it with two parameters. the
	 *    first parameter is the article markup, the second is the edit summary markup
	 *  Additionally the preview dialog triggers the EditPagePreviewClosed event when the dialog is closed.
	 *
	 * @param {object} options - object containing dialog options, see method description for details
	 */
	function renderPreview ( options ) {
		editPageOptions = options;
		isRailDropped = !!options.isRailDropped;
		isWidePage = !!options.isWidePage;
		getPreviewTypes( isWidePage );

		var dialogOptions = {
			buttons: [
				{
					id: 'close',
					message: msg( 'back' ),
					handler: function () {
						$( '#EditPageDialog' ).closeModal();
						$( window ).trigger( 'EditPagePreviewClosed' );
					}
				},
				{
					id: 'publish',
					defaultButton: true,
					message: msg( 'savearticle' ),
					handler: options.onPublishButton
				}
			],
			// set modal width based on screen size
			width: ( ( isRailDropped === false && isWidePage === false ) || !window.wgOasisResponsive ) ?
				options.width :
				options.width - FIT_SMALL_SCREEN,
			className: 'preview',
			onClose: function () {
				previewLoaded = false;
				$( window ).trigger( 'EditPagePreviewClosed' );
			}
		};

		// allow extension to modify the preview dialog
		$( window ).trigger( 'EditPageRenderPreview', [ dialogOptions ] );

		renderDialog( msg( 'preview' ), dialogOptions, function ( contentNode ) {
			// cache selector for other functions in this module
			$article = contentNode;

			loadPreview( previewTypes[ currentTypeName ].name, true );

			if ( window.wgOasisResponsive ) {
				// adding type dropdown to preview
				if ( !previewTemplate ) {
					loader({
						type: loader.MULTI,
						resources: {
							mustache: 'extensions/wikia/EditPreview/templates/preview_type_dropdown.mustache'
						}
					}).done(function ( response ) {
						previewTemplate = response.mustache[ 0 ];
						handlePreviewDropdown( previewTemplate );
					});
				} else {
					handlePreviewDropdown( previewTemplate );
				}
			}
		});
	}

	/**
	 * If summary parameter's type isn't undefined adds summary (new DOM element) and change height of article preview
	 *
	 * @param {object} contentNode article's wrapper
	 * @param {int} width
	 * @param {string} summary Summary text in HTML (parsed wikitext)
	 */
	function addEditSummary ( contentNode, width, summary ) {
		if ( typeof summary !== 'undefined' ) {
			var $editPagePreviewEditSummary = $( '<div>', {id: 'EditPagePreviewEditSummary'} ),
				$articlePreview = contentNode.closest( '.ArticlePreview' ),
				articlePreviewWidth = $articlePreview.width(),
				$modalToolbar = $( '.modalToolbar' ),
				modalToolbarWidth = $modalToolbar.outerWidth( true );

			$editPagePreviewEditSummary
				.width( articlePreviewWidth - modalToolbarWidth )
				.html( summary );

			$modalToolbar.before( $editPagePreviewEditSummary );
		}
	}

	/**
	 * change preview type
	 *
	 * @param {string} type - type of the preview
	 */

	function switchPreview ( type ) {
		var lastTypeName = currentTypeName;

		currentTypeName = type;

		//load again preview only if changing mobile <-> desktop
		if ( type === previewTypes.mobile.name || lastTypeName === previewTypes.mobile.name ) {
			loadPreview( previewTypes[ currentTypeName ].name );
		}

		$article.width( previewTypes[ currentTypeName ].value );
		scalePreview( currentTypeName );

		tracker.track({
			action: Wikia.Tracker.ACTIONS.CLICK,
			category: 'edit-preview',
			label: 'preview-type-changed',
			trackingMethod: 'both',
			value: type
		});
	}

	/**
	 * Scale articleWrapper so it fits current modal size
	 *
	 * @param {string} type - type of the preview
	 */

	function scalePreview ( type ) {
		var selectedPreviewWidth = previewTypes[ type ].value,
			scaleRatio = articleWrapperWidth / selectedPreviewWidth,
			cssTransform = cssPropHelper.getSupportedProp( 'transform' ),
			cssTransformOrigin = cssPropHelper.getSupportedProp( 'transform-origin' ),
			scaleVar = 'scale(' + scaleRatio + ')';

		setClassesForWidePage( type, $article );

		if ( selectedPreviewWidth > articleWrapperWidth ) {
			$article.css( cssTransformOrigin, 'left top' );
			$article.css( cssTransform, scaleVar );
		} else {
			$article.css( cssTransform, '' );
		}

		// Force browser to redraw/repaint
		// http://stackoverflow.com/q/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes
		$article.hide();
		$article.height();
		$article.show();
	}

	/**
	 * Adds/removes id to article preview according to selected type if it's a wide page
	 *
	 * @param {string} type type of
	 * @param {jQuery} $article
	 */

	function setClassesForWidePage ( type, $article ) {
		var dataSize;

		// DAR-2506 make the preview works like correctly for main pages
		switch ( type ) {
			case 'min':
				dataSize = 'min';
				break;
			case 'max':
				dataSize = 'max';
				break;
			default:
				dataSize = '';
		}

		$article.attr( 'data-size', dataSize );
	}

	/**
	 * Returns previewTypes object which depends on the type of previewing page
	 *
	 * @param {boolean} isWidePage - type of previewing article page
	 *                               is it mainpage / a page without right rail or not (DAR-2366)
	 */

	function getPreviewTypes ( isWidePage ) {
		if ( !previewTypes ) {
			var articleMinWidth = fluidlayout.getMinArticleWidth(),
				articleMaxWidth = fluidlayout.getMaxArticleWidth();

			previewTypes = {
				current: {
					name: 'current',
					value: null
				},
				min: {
					name: 'min',
					value: articleMinWidth - 2 * articleMargin
				},
				max: {
					name: 'max',
					value: articleMaxWidth - 2 * articleMargin
				},
				mobile: {
					name: 'mobile',
					skin: 'wikiamobile',
					type: 'full',
					value: null
				}
			};

			if ( isWidePage ) {
				previewTypes.max.value += rightRailWidth;
			}
		}

		//Set base currentTypeName as a current - if it is there that means that preview was reopened
		if ( !currentTypeName ) {
			currentTypeName = previewTypes.current.name;
		}

		return previewTypes;
	}

	/** @public **/
	return {
		renderPreview: renderPreview,
		renderDialog: renderDialog
	};
} );
