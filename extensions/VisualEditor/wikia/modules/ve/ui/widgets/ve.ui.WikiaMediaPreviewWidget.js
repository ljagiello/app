/*!
 * VisualEditor UserInterface WikiaMediaPreviewWidget class.
 */

/* global mw, require */

ve.ui.WikiaMediaPreviewWidget = function VeUiWikiaMediaPreviewWidget() {

	// Parent constructor
	OO.ui.Widget.call( this );

	// Properties
	this.model = null;
	this.videoInstance = null;
	this.$videoWrapper = null;

	this.closeButton = new OO.ui.IconButtonWidget( {
		'$': this.$,
		'title': ve.msg( 'visualeditor-dialog-action-close' ),
		'icon': 'close'
	} );

	this.$titlebar = this.$( '<div>' )
		.addClass( 've-ui-wikiaMediaPreviewWidget-titlebar' );

	this.$title = this.$( '<span>' )
		.addClass( 've-ui-wikiaMediaPreviewWidget-title' );

	// Events
	this.closeButton.connect( this, { 'click': 'close' } );
	this.$element.on( 'click', ve.bind( this.close, this ) );

	// Initialization
	this.closeButton.$element
		.addClass( 've-ui-wikiaMediaPreviewWidget-closeButton' );

	this.$titlebar
		.append( this.$title, this.closeButton.$element )
		.appendTo( this.$element );

	this.$element
		.addClass( 've-ui-wikiaMediaPreviewWidget-overlay' )
		.hide();
};

/* Inheritance */

OO.inheritClass( ve.ui.WikiaMediaPreviewWidget, OO.ui.Widget );

/* Methods */

/**
 * Resize image after it's loaded if it's too tall for the screen
 * @method
 */
ve.ui.WikiaMediaPreviewWidget.prototype.onImageLoad = function () {
	// TODO: Add image aspect ratio to model (sorta the same comment from WikiaMediaPageWidget)
	// thumbnailer.js only let's you restrict by width, not by height, so we'll do that here.
	if ( this.$image.height() > this.maxImgHeight ) {
		this.$image.height( this.maxImgHeight );
	}

	this.verticallyAlign( this.$image );
};

/**
 * @method
 */
ve.ui.WikiaMediaPreviewWidget.prototype.verticallyAlign = function( $element ) {
	var availableHeight = $( window ).height() - this.$titlebar.outerHeight();

	// TODO: Sort of confusing to have $element and this.$element.

	// Vertically align in available space:
	// * Divide available space by 2 to get the middle of the available space,
	// * Subtract half the image height to vertically center the image,
	// * Add add the titlebar height.
	// Show image.
	$element
		.css( 'top', availableHeight / 2 - $element.height() / 2 + this.$titlebar.outerHeight() )
		.show();

	this.$element.stopThrobbing();
};

/**
 * Embed video preview
 *
 * @param {string} embedCode Video embed code from ApiVideoPreview
 */
ve.ui.WikiaMediaPreviewWidget.prototype.embedVideo = function( embedCode ) {
	this.$videoWrapper = this.$( '<div>' )
		.addClass( 've-ui-wikiaMediaPreviewWidget-videoWrapper' )
		.appendTo( this.$element.show() );

	require( ['wikia.videoBootstrap'], ve.bind( function( VideoBootstrap ) {
		this.videoInstance = new VideoBootstrap(
			this.$videoWrapper[0],
			window.JSON.parse( embedCode ),
			've-preview'
		);

		this.verticallyAlign( this.$videoWrapper );

	}, this ) );
};


/**
 * Handle video preview request promise.done
 *
 * @method
 */
ve.ui.WikiaMediaPreviewWidget.prototype.onRequestVideoDone = function( data ) {
	if ( data.videopreview ) {
		this.embedVideo( data.videopreview.embedCode );
	} else {
		this.onRequestVideoFail( data );
	}
};

/**
 * Handle video preview request promise.fail
 *
 * @method
 */
ve.ui.WikiaMediaPreviewWidget.prototype.onRequestVideoFail = function() {
	mw.config.get( 'GlobalNotification' ).show(
		ve.msg( 'wikia-visualeditor-notification-video-preview-not-available' ),
		'error',
		$( '.ve-ui-frame' ).contents().find( '.ve-ui-window-body' )
	);
};

/**
 * Display overlay with a title and a throbber
 *
 * @method
 * @param {string} title
 */
ve.ui.WikiaMediaPreviewWidget.prototype.displayOverlay = function( title ) {
	this.$title.text( title );
	this.$element.show();
	this.$element.startThrobbing();
};

/**
 * Open the preview for image
 *
 * @method
 * @param {string} title
 * @param {string} url
 */
ve.ui.WikiaMediaPreviewWidget.prototype.openForImage = function( title, url ) {
	this.displayOverlay( title );

	this.maxImgHeight = Math.round( $( window ).height() * 0.95 ) - this.$titlebar.outerHeight();
	this.maxImgWidth = Math.round( $( window ).width() * 0.95 );

	this.$image = $( '<img>' )
		.addClass( 've-ui-wikiaMediaPreviewWidget-image' )
		.hide();

	require( ['wikia.thumbnailer'], ve.bind( function ( thumbnailer ) {
		this.$image.attr( 'src', thumbnailer.getThumbURL( url, 'nocrop', this.maxImgWidth ) );
	}, this ) );

	this.$image
		.load( ve.bind( this.onImageLoad, this ) )
		.appendTo( this.$element );
};

/**
 * Open the preview for video
 *
 * @method
 * @param {string} title
 * @param {string} provider
 * @param {string} videoId
 */
ve.ui.WikiaMediaPreviewWidget.prototype.openForVideo = function( title, provider, videoId ) {
	this.displayOverlay( title );

	$.ajax( {
		'url': mw.util.wikiScript( 'api' ),
		'data': {
			'format': 'json',
			'action': 'videopreview',
			'title': title,
			'provider': provider,
			'videoId': videoId
		}
	} )
		.done( ve.bind( this.onRequestVideoDone, this ) )
		.fail( ve.bind( this.onRequestVideoFail, this ) );
};

/**
 * Close the preview
 *
 * @method
 */
ve.ui.WikiaMediaPreviewWidget.prototype.close = function() {
	if ( this.$image ) {
		this.$image.remove();
		this.$image = null;
	} else if ( this.$videoWrapper ) {
		this.$videoWrapper.remove();
		this.$videoWrapper = null;
	}
	this.$element.hide();
};

/**
 * @method
 * @returns {boolean} Preview is open
 */
ve.ui.WikiaMediaPreviewWidget.prototype.isOpen = function() {
	return this.$element.is( ':visible' );
};
