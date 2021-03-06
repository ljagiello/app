/*!
 * OOJS UI v0.1.0-pre (0267100ab3)
 * https://www.mediawiki.org/wiki/OOJS
 *
 * Copyright 2011-2013 OOJS Team and other contributors.
 * Released under the MIT license
 * http://oojs.mit-license.org
 *
 * Date: Wed Nov 20 2013 10:23:02 GMT+0530 (IST)
 */
( function () {

'use strict';
/**
 * Namespace for all classes, static methods and static properties.
 *
 * @class
 * @singleton
 */
OO.ui = {};

OO.ui.bind = $.proxy;

/**
 * Get the user's language and any fallback languages.
 *
 * These language codes are used to localize user interface elements in the user's language.
 *
 * In environments that provide a localization system, this function should be overridden to
 * return the user's language(s). The default implementation returns English (en) only.
 *
 * @returns {string[]} Language codes, in descending order of priority
 */
OO.ui.getUserLanguages = function () {
	return [ 'en' ];
};

/**
 * Get a value in an object keyed by language code.
 *
 * @param {Object.<string,Mixed>} obj Object keyed by language code
 * @param {string|null} [lang] Language code, if omitted or null defaults to any user language
 * @param {string} [fallback] Fallback code, used if no matching language can be found
 * @returns {Mixed} Local value
 */
OO.ui.getLocalValue = function ( obj, lang, fallback ) {
	var i, len, langs;

	// Requested language
	if ( obj[lang] ) {
		return obj[lang];
	}
	// Known user language
	langs = OO.ui.getUserLanguages();
	for ( i = 0, len = langs.length; i < len; i++ ) {
		lang = langs[i];
		if ( obj[lang] ) {
			return obj[lang];
		}
	}
	// Fallback language
	if ( obj[fallback] ) {
		return obj[fallback];
	}
	// First existing language
	for ( lang in obj ) {
		return obj[lang];
	}

	return undefined;
};

( function () {

/**
 * Message store for the default implementation of OO.ui.msg
 *
 * Environments that provide a localization system should not use this, but should override
 * OO.ui.msg altogether.
 *
 * @private
 */
var messages = {
	// Label text for button to exit from dialog
	'ooui-dialog-action-close': 'Close',
	// TODO remove me
	'ooui-inspector-close-tooltip': 'Close',
	// TODO remove me
	'ooui-inspector-remove-tooltip': 'Remove',
	// Tool tip for a button that moves items in a list down one place
	'ooui-outline-control-move-down': 'Move item down',
	// Tool tip for a button that moves items in a list up one place
	'ooui-outline-control-move-up': 'Move item up',
	// Label for toggle on state
	'ooui-toggle-on': 'On',
	// Label for toggle off state
	'ooui-toggle-off': 'Off',
	// Label for the toolbar group that contains a list of all other available tools
	'ooui-toolbar-more': 'More'
};

/**
 * Get a localized message.
 *
 * In environments that provide a localization system, this function should be overridden to
 * return the message translated in the user's language. The default implementation always returns
 * English messages.
 *
 * After the message key, message parameters may optionally be passed. In the default implementation,
 * any occurrences of $1 are replaced with the first parameter, $2 with the second parameter, etc.
 * Alternative implementations of OO.ui.msg may use any substitution system they like, as long as
 * they support unnamed, ordered message parameters.
 *
 * @abstract
 * @param {string} key Message key
 * @param {Mixed...} [params] Message parameters
 * @returns {string} Translated message with parameters substituted
 */
OO.ui.msg = function ( key ) {
	var message = messages[key], params = Array.prototype.slice.call( arguments, 1 );
	if ( typeof message === 'string' ) {
		// Perform $1 substitution
		message = message.replace( /\$(\d+)/g, function ( unused, n ) {
			var i = parseInt( n, 10 );
			return params[i - 1] !== undefined ? params[i - 1] : '$' + n;
		} );
	} else {
		// Return placeholder if message not found
		message = '[' + key + ']';
	}
	return message;
};

} )();

// Add more as you need
OO.ui.Keys = {
	'UNDEFINED': 0,
	'BACKSPACE': 8,
	'DELETE': 46,
	'LEFT': 37,
	'RIGHT': 39,
	'UP': 38,
	'DOWN': 40,
	'ENTER': 13,
	'END': 35,
	'HOME': 36,
	'TAB': 9,
	'PAGEUP': 33,
	'PAGEDOWN': 34,
	'ESCAPE': 27,
	'SHIFT': 16,
	'SPACE': 32
};
/**
 * DOM element abstraction.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {Function} [$] jQuery for the frame the widget is in
 * @cfg {string[]} [classes] CSS class names
 * @cfg {jQuery} [$content] Content elements to append
 */
OO.ui.Element = function OoUiElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.$ = config.$ || OO.ui.Element.getJQuery( document );
	this.$element = this.$( this.$.context.createElement( this.getTagName() ) );

	// Initialization
	if ( Array.isArray( config.classes ) ) {
		this.$element.addClass( config.classes.join( ' ' ) );
	}
	if ( config.$content ) {
		this.$element.append( config.$content );
	}
};

/* Static Properties */

/**
 * @static
 * @property
 * @inheritable
 */
OO.ui.Element.static = {};

/**
 * HTML tag name.
 *
 * This may be ignored if getTagName is overridden.
 *
 * @static
 * @property {string}
 * @inheritable
 */
OO.ui.Element.static.tagName = 'div';

/* Static Methods */

/**
 * Gets a jQuery function within a specific document.
 *
 * @static
 * @param {jQuery|HTMLElement|HTMLDocument|Window} context Context to bind the function to
 * @param {OO.ui.Frame} [frame] Frame of the document context
 * @returns {Function} Bound jQuery function
 */
OO.ui.Element.getJQuery = function ( context, frame ) {
	function wrapper( selector ) {
		return $( selector, wrapper.context );
	}

	wrapper.context = this.getDocument( context );

	if ( frame ) {
		wrapper.frame = frame;
	}

	return wrapper;
};

/**
 * Get the document of an element.
 *
 * @static
 * @param {jQuery|HTMLElement|HTMLDocument|Window} obj Object to get the document for
 * @returns {HTMLDocument} Document object
 * @throws {Error} If context is invalid
 */
OO.ui.Element.getDocument = function ( obj ) {
	var doc =
		// jQuery - selections created "offscreen" won't have a context, so .context isn't reliable
		( obj[0] && obj[0].ownerDocument ) ||
		// Empty jQuery selections might have a context
		obj.context ||
		// HTMLElement
		obj.ownerDocument ||
		// Window
		obj.document ||
		// HTMLDocument
		( obj.nodeType === 9 && obj );

	if ( doc ) {
		return doc;
	}

	throw new Error( 'Invalid context' );
};

/**
 * Get the window of an element or document.
 *
 * @static
 * @param {jQuery|HTMLElement|HTMLDocument|Window} obj Context to get the window for
 * @returns {Window} Window object
 */
OO.ui.Element.getWindow = function ( obj ) {
	var doc = this.getDocument( obj );
	return doc.parentWindow || doc.defaultView;
};

/**
 * Get the direction of an element or document.
 *
 * @static
 * @param {jQuery|HTMLElement|HTMLDocument|Window} obj Context to get the direction for
 * @returns {string} Text direction, either `ltr` or `rtl`
 */
OO.ui.Element.getDir = function ( obj ) {
	var isDoc, isWin;

	if ( obj instanceof jQuery ) {
		obj = obj[0];
	}
	isDoc = obj.nodeType === 9;
	isWin = obj.document !== undefined;
	if ( isDoc || isWin ) {
		if ( isWin ) {
			obj = obj.document;
		}
		obj = obj.body;
	}
	return $( obj ).css( 'direction' );
};

/**
 * Get the offset between two frames.
 *
 * TODO: Make this function not use recursion.
 *
 * @static
 * @param {Window} from Window of the child frame
 * @param {Window} [to=window] Window of the parent frame
 * @param {Object} [offset] Offset to start with, used internally
 * @returns {Object} Offset object, containing left and top properties
 */
OO.ui.Element.getFrameOffset = function ( from, to, offset ) {
	var i, len, frames, frame, rect;

	if ( !to ) {
		to = window;
	}
	if ( !offset ) {
		offset = { 'top': 0, 'left': 0 };
	}
	if ( from.parent === from ) {
		return offset;
	}

	// Get iframe element
	frames = from.parent.document.getElementsByTagName( 'iframe' );
	for ( i = 0, len = frames.length; i < len; i++ ) {
		if ( frames[i].contentWindow === from ) {
			frame = frames[i];
			break;
		}
	}

	// Recursively accumulate offset values
	if ( frame ) {
		rect = frame.getBoundingClientRect();
		offset.left += rect.left;
		offset.top += rect.top;
		if ( from !== to ) {
			this.getFrameOffset( from.parent, offset );
		}
	}
	return offset;
};

/**
 * Get the offset between two elements.
 *
 * @static
 * @param {jQuery} $from
 * @param {jQuery} $to
 * @returns {Object} Translated position coordinates, containing top and left properties
 */
OO.ui.Element.getRelativePosition = function ( $from, $to ) {
	var from = $from.offset(),
		to = $to.offset();
	return { 'top': Math.round( from.top - to.top ), 'left': Math.round( from.left - to.left ) };
};

/**
 * Get element border sizes.
 *
 * @param {HTMLElement} el Element to measure
 * @return {Object} Dimensions object with `top`, `left`, `bottom` and `right` properties
 */
OO.ui.Element.getBorders = function ( el ) {
	var doc = el.ownerDocument,
		win = doc.parentWindow || doc.defaultView,
		style = win && win.getComputedStyle ?
			win.getComputedStyle( el, null ) :
			el.currentStyle,
		$el = $( el ),
		top = parseFloat( style ? style.borderTopWidth : $el.css( 'borderTopWidth' ) ) || 0,
		left = parseFloat( style ? style.borderLeftWidth : $el.css( 'borderLeftWidth' ) ) || 0,
		bottom = parseFloat( style ? style.borderBottomWidth : $el.css( 'borderBottomWidth' ) ) || 0,
		right = parseFloat( style ? style.borderRightWidth : $el.css( 'borderRightWidth' ) ) || 0;

	return {
		'top': Math.round( top ),
		'left': Math.round( left ),
		'bottom': Math.round( bottom ),
		'right': Math.round( right )
	};
};

/**
 * Get dimensions of an element or window.
 *
 * @param {HTMLElement|Window} el Element to measure
 * @return {Object} Dimensions object with `borders`, `scroll`, `scrollbar` and `rect` properties
 */
OO.ui.Element.getDimensions = function ( el ) {
	var $el, $win,
		doc = el.ownerDocument || el.document,
		win = doc.parentWindow || doc.defaultView;

	if ( win === el || el === doc.documentElement ) {
		$win = $( win );
		return {
			'borders': { 'top': 0, 'left': 0, 'bottom': 0, 'right': 0 },
			'scroll': {
				'top': $win.scrollTop(),
				'left': $win.scrollLeft()
			},
			'scrollbar': { 'right': 0, 'bottom': 0 },
			'rect': {
				'top': 0,
				'left': 0,
				'bottom': $win.innerHeight(),
				'right': $win.innerWidth()
			}
		};
	} else {
		$el = $( el );
		return {
			'borders': this.getBorders( el ),
			'scroll': {
				'top': $el.scrollTop(),
				'left': $el.scrollLeft()
			},
			'scrollbar': {
				'right': $el.innerWidth() - el.clientWidth,
				'bottom': $el.innerHeight() - el.clientHeight
			},
			'rect': el.getBoundingClientRect()
		};
	}
};

/**
 * Get closest scrollable container.
 *
 * Traverses up until either a scrollable element or the root is reached, in which case the window
 * will be returned.
 *
 * @static
 * @param {HTMLElement} el Element to find scrollable container for
 * @param {string} [dimension] Dimension of scrolling to look for; `x`, `y` or omit for either
 * @return {HTMLElement|Window} Closest scrollable container
 */
OO.ui.Element.getClosestScrollableContainer = function ( el, dimension ) {
	var i, val,
		props = [ 'overflow' ],
		$parent = $( el ).parent();

	if ( dimension === 'x' || dimension === 'y' ) {
		props.push( 'overflow-' + dimension );
	}

	while ( $parent.length ) {
		if ( $parent[0] === el.ownerDocument.body ) {
			return $parent[0];
		}
		i = props.length;
		while ( i-- ) {
			val = $parent.css( props[i] );
			if ( val === 'auto' || val === 'scroll' ) {
				return $parent[0];
			}
		}
		$parent = $parent.parent();
	}
	return this.getDocument( el ).body;
};

/**
 * Scroll element into view
 *
 * @static
 * @param {HTMLElement} el Element to scroll into view
 * @param {Object} [config={}] Configuration config
 * @param {string} [config.duration] jQuery animation duration value
 * @param {string} [config.direction] Scroll in only one direction, e.g. 'x' or 'y', omit
 *  to scroll in both directions
 * @param {Function} [config.complete] Function to call when scrolling completes
 */
OO.ui.Element.scrollIntoView = function ( el, config ) {
	// Configuration initialization
	config = config || {};

	var anim = {},
		callback = typeof config.complete === 'function' && config.complete,
		sc = this.getClosestScrollableContainer( el, config.direction ),
		$sc = $( sc ),
		eld = this.getDimensions( el ),
		scd = this.getDimensions( sc ),
		rel = {
			'top': eld.rect.top - ( scd.rect.top + scd.borders.top ),
			'bottom': scd.rect.bottom - scd.borders.bottom - scd.scrollbar.bottom - eld.rect.bottom,
			'left': eld.rect.left - ( scd.rect.left + scd.borders.left ),
			'right': scd.rect.right - scd.borders.right - scd.scrollbar.right - eld.rect.right
		};

	if ( !config.direction || config.direction === 'y' ) {
		if ( rel.top < 0 ) {
			anim.scrollTop = scd.scroll.top + rel.top;
		} else if ( rel.top > 0 && rel.bottom < 0 ) {
			anim.scrollTop = scd.scroll.top + Math.min( rel.top, -rel.bottom );
		}
	}
	if ( !config.direction || config.direction === 'x' ) {
		if ( rel.left < 0 ) {
			anim.scrollLeft = scd.scroll.left + rel.left;
		} else if ( rel.left > 0 && rel.right < 0 ) {
			anim.scrollLeft = scd.scroll.left + Math.min( rel.left, -rel.right );
		}
	}
	if ( !$.isEmptyObject( anim ) ) {
		$sc.stop( true ).animate( anim, config.duration || 'fast' );
		if ( callback ) {
			$sc.queue( function ( next ) {
				callback();
				next();
			} );
		}
	} else {
		if ( callback ) {
			callback();
		}
	}
};

/* Methods */

/**
 * Get the HTML tag name.
 *
 * Override this method to base the result on instance information.
 *
 * @returns {string} HTML tag name
 */
OO.ui.Element.prototype.getTagName = function () {
	return this.constructor.static.tagName;
};

/**
 * Get the DOM document.
 *
 * @returns {HTMLDocument} Document object
 */
OO.ui.Element.prototype.getElementDocument = function () {
	return OO.ui.Element.getDocument( this.$element );
};

/**
 * Get the DOM window.
 *
 * @returns {Window} Window object
 */
OO.ui.Element.prototype.getElementWindow = function () {
	return OO.ui.Element.getWindow( this.$element );
};

/**
 * Get closest scrollable container.
 *
 * @method
 * @see #static-method-getClosestScrollableContainer
 */
OO.ui.Element.prototype.getClosestScrollableElementContainer = function () {
	return OO.ui.Element.getClosestScrollableContainer( this.$element[0] );
};

/**
 * Scroll element into view
 *
 * @method
 * @see #static-method-scrollIntoView
 * @param {Object} [config={}]
 */
OO.ui.Element.prototype.scrollElementIntoView = function ( config ) {
	return OO.ui.Element.scrollIntoView( this.$element[0], config );
};
/**
 * Embedded iframe with the same styles as its parent.
 *
 * @class
 * @extends OO.ui.Element
 * @mixins OO.EventEmitter
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.Frame = function OoUiFrame( config ) {
	// Parent constructor
	OO.ui.Element.call( this, config );

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Properties
	this.initialized = false;
	this.config = config;

	// Initialize
	this.$element
		.addClass( 'oo-ui-frame' )
		.attr( { 'frameborder': 0, 'scrolling': 'no' } );

};

/* Inheritance */

OO.inheritClass( OO.ui.Frame, OO.ui.Element );

OO.mixinClass( OO.ui.Frame, OO.EventEmitter );

/* Static Properties */

OO.ui.Frame.static.tagName = 'iframe';

/* Events */

/**
 * @event initialize
 */

/* Methods */

/**
 * Load the frame contents.
 *
 * Once the iframe's stylesheets are loaded, the `initialize` event will be emitted.
 *
 * Sounds simple right? Read on...
 *
 * When you create a dynamic iframe using open/write/close, the window.load event for the
 * iframe is triggered when you call close, and there's no further load event to indicate that
 * everything is actually loaded.
 *
 * By dynamically adding stylesheet links, we can detect when each link is loaded by testing if we
 * have access to each of their `sheet.cssRules` properties. Every 10ms we poll to see if we have
 * access to the style's `sheet.cssRules` property yet.
 *
 * However, because of security issues, we never have such access if the stylesheet came from a
 * different site. Thus, we are left with linking to the stylesheets through a style element with
 * multiple `@import` statements - which ends up being simpler anyway. Since we created that style,
 * we always have access, and its contents are only available when everything is done loading.
 *
 * @fires initialize
 */
OO.ui.Frame.prototype.load = function () {
	var win = this.$element.prop( 'contentWindow' ),
		doc = win.document;

	// Figure out directionality:
	this.dir = this.$element.closest( '[dir]' ).prop( 'dir' ) || 'ltr';

	// Initialize contents
	doc.open();
	doc.write(
		'<!doctype html>' +
		'<html class="oo-ui-frame-html">' +
			'<body class="oo-ui-frame-body oo-ui-' + this.dir + '" style="direction:' + this.dir + ';" dir="' + this.dir + '">' +
				'<div class="oo-ui-frame-content"></div>' +
			'</body>' +
		'</html>'
	);
	doc.close();

	// Properties
	this.$ = OO.ui.Element.getJQuery( doc, this );
	this.$content = this.$( '.oo-ui-frame-content' );
	this.$document = this.$( doc );

	this.transplantStyles();
	this.initialized = true;
	this.emit( 'initialize' );
};

/**
 * Transplant the CSS styles from the frame's parent document to the frame's document.
 *
 * This loops over the style sheets in the parent document, and copies their tags to the
 * frame's document. `<link>` tags pointing to same-origin style sheets are inlined as `<style>` tags;
 * `<link>` tags pointing to foreign URLs and `<style>` tags are copied verbatim.
 */
OO.ui.Frame.prototype.transplantStyles = function () {
	var i, ilen, j, jlen, sheet, rules, cssText, styleNode,
		newDoc = this.$document[0],
		parentDoc = this.getElementDocument();
	for ( i = 0, ilen = parentDoc.styleSheets.length; i < ilen; i++ ) {
		sheet = parentDoc.styleSheets[i];
		styleNode = undefined;
		try {
			rules = sheet.cssRules;
		} catch ( e ) { }
		// Disabled with `false` for Wikia
		if ( false && sheet.ownerNode.nodeName.toLowerCase() === 'link' && rules ) {
			// This is a <link> tag pointing to a same-origin style sheet. Rebuild it as a
			// <style> tag. This needs to be in a try-catch because it sometimes fails in Firefox.
			try {
				cssText = '';
				for ( j = 0, jlen = rules.length; j < jlen; j++ ) {
					if ( typeof rules[j].cssText !== 'string' ) {
						// WTF; abort and fall back to cloning the node
						throw new Error( 'sheet.cssRules[' + j + '].cssText is not a string' );
					}
					cssText += rules[j].cssText + '\n';
				}
				cssText += '/* Transplanted styles from ' + sheet.href + ' */\n';
				styleNode = newDoc.createElement( 'style' );
				styleNode.textContent = cssText;
			} catch ( e ) {
				styleNode = undefined;
			}
		}
		if ( !styleNode ) {
			// It's either a <style> tag or a <link> tag pointing to a foreign URL; just copy
			// it to the new document
			styleNode = newDoc.importNode( sheet.ownerNode, true );
		}
		newDoc.body.appendChild( styleNode );
	}
};

/**
 * Run a callback as soon as the frame has been initialized.
 *
 * @param {Function} callback
 */
OO.ui.Frame.prototype.run = function ( callback ) {
	if ( this.initialized ) {
		callback();
	} else {
		this.once( 'initialize', callback );
	}
};

/**
 * Sets the size of the frame.
 *
 * @method
 * @param {number} width Frame width in pixels
 * @param {number} height Frame height in pixels
 * @chainable
 */
OO.ui.Frame.prototype.setSize = function ( width, height ) {
	this.$element.css( { 'width': width, 'height': height } );
	return this;
};
/**
 * Container for elements in a child frame.
 *
 * @class
 * @abstract
 * @extends OO.ui.Element
 * @mixins OO.EventEmitter
 *
 * @constructor
 * @param {OO.ui.WindowSet} windowSet Window set this dialog is part of
 * @param {Object} [config] Configuration options
 * @fires initialize
 */
OO.ui.Window = function OoUiWindow( windowSet, config ) {
	// Parent constructor
	OO.ui.Element.call( this, config );

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Properties
	this.windowSet = windowSet;
	this.visible = false;
	this.opening = false;
	this.closing = false;
	this.frame = new OO.ui.Frame( { '$': this.$ } );
	this.$frame = this.$( '<div>' );
	this.$ = function () {
		throw new Error( 'this.$() cannot be used until the frame has been initialized.' );
	};

	// Initialization
	this.$element
		.addClass( 'oo-ui-window' )
		.append( this.$frame );
	this.$frame
		.addClass( 'oo-ui-window-frame' )
		.append( this.frame.$element );

	// Events
	this.frame.connect( this, { 'initialize': 'initialize' } );
};

/* Inheritance */

OO.inheritClass( OO.ui.Window, OO.ui.Element );

OO.mixinClass( OO.ui.Window, OO.EventEmitter );

/* Events */

/**
 * Initialize contents.
 *
 * Fired asynchronously after construction when iframe is ready.
 *
 * @event initialize
 */

/**
 * Open window.
 *
 * Fired after window has been opened.
 *
 * @event open
 * @param {Object} data Window opening data
 */

/**
 * Close window.
 *
 * Fired after window has been closed.
 *
 * @event close
 * @param {Object} data Window closing data
 */

/* Static Properties */

/**
 * Symbolic name of icon.
 *
 * @static
 * @inheritable
 * @property {string}
 */
OO.ui.Window.static.icon = 'window';

/**
 * Localized message for title.
 *
 * @static
 * @inheritable
 * @property {string}
 */
OO.ui.Window.static.titleMessage = null;

/* Methods */

/**
 * Check if window is visible.
 *
 * @method
 * @returns {boolean} Window is visible
 */
OO.ui.Window.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Check if window is opening.
 *
 * @method
 * @returns {boolean} Window is opening
 */
OO.ui.Window.prototype.isOpening = function () {
	return this.opening;
};

/**
 * Check if window is closing.
 *
 * @method
 * @returns {boolean} Window is closing
 */
OO.ui.Window.prototype.isClosing = function () {
	return this.closing;
};

/**
 * Get the window frame.
 *
 * @method
 * @returns {OO.ui.Frame} Frame of window
 */
OO.ui.Window.prototype.getFrame = function () {
	return this.frame;
};

/**
 * Get the window set.
 *
 * @method
 * @returns {OO.ui.WindowSet} Window set
 */
OO.ui.Window.prototype.getWindowSet = function () {
	return this.windowSet;
};

/**
 * Get the title of the window.
 *
 * Use #titleMessage to set this unless you need to do something fancy.
 * @returns {string} Window title
 */
OO.ui.Window.prototype.getTitle = function () {
	return OO.ui.msg( this.constructor.static.titleMessage );
};

/**
 * Set the size of window frame.
 *
 * @param {number} [width=auto] Custom width
 * @param {number} [height=auto] Custom height
 * @chainable
 */
OO.ui.Window.prototype.setSize = function ( width, height ) {
	if ( !this.frame.$content ) {
		return;
	}

	this.frame.$element.css( {
		'width': width === undefined ? 'auto' : width,
		'height': height === undefined ? 'auto' : height
	} );

	return this;
};

/**
 * Set the title of the window.
 *
 * @param {string} [customTitle] Custom title, override the #titleMessage
 * @chainable
 */
OO.ui.Window.prototype.setTitle = function ( customTitle ) {
	this.$title.text( customTitle || this.getTitle() );
	return this;
};

/**
 * Set the position of window to fit with contents..
 *
 * @param {string} left Left offset
 * @param {string} top Top offset
 * @chainable
 */
OO.ui.Window.prototype.setPosition = function ( left, top ) {
	this.$element.css( { 'left': left, 'top': top } );
	return this;
};

/**
 * Set the height of window to fit with contents.
 *
 * @param {number} [min=0] Min height
 * @param {number} [max] Max height (defaults to content's outer height)
 * @chainable
 */
OO.ui.Window.prototype.fitHeightToContents = function ( min, max ) {
	var height = this.frame.$content.outerHeight();

	this.frame.$element.css(
		'height', Math.max( min || 0, max === undefined ? height : Math.min( max, height ) )
	);

	return this;
};

/**
 * Set the width of window to fit with contents.
 *
 * @param {number} [min=0] Min height
 * @param {number} [max] Max height (defaults to content's outer width)
 * @chainable
 */
OO.ui.Window.prototype.fitWidthToContents = function ( min, max ) {
	var width = this.frame.$content.outerWidth();

	this.frame.$element.css(
		'width', Math.max( min || 0, max === undefined ? width : Math.min( max, width ) )
	);

	return this;
};

/**
 * Initialize window contents.
 *
 * The first time the window is opened, #initialize is called when it's safe to begin populating
 * its contents. See #setup for a way to make changes each time the window opens.
 *
 * Once this method is called, this.$$ can be used to create elements within the frame.
 *
 * @method
 * @fires initialize
 * @chainable
 */
OO.ui.Window.prototype.initialize = function () {
	// Properties
	this.$ = this.frame.$;
	this.$title = this.$( '<div class="oo-ui-window-title"></div>' );
	if ( this.getTitle() ) {
		this.setTitle();
	}
	this.$icon = this.$( '<div class="oo-ui-window-icon"></div>' )
		.addClass( 'oo-ui-icon-' + this.constructor.static.icon );
	this.$head = this.$( '<div class="oo-ui-window-head"></div>' );
	this.$body = this.$( '<div class="oo-ui-window-body"></div>' );
	this.$foot = this.$( '<div class="oo-ui-window-foot"></div>' );
	this.$overlay = this.$( '<div class="oo-ui-window-overlay"></div>' );

	// Initialization
	this.frame.$content.append(
		this.$head.append( this.$icon, this.$title ),
		this.$body,
		this.$foot,
		this.$overlay
	);

	this.emit( 'initialize' );

	return this;
};

/**
 * Setup window for use.
 *
 * Each time the window is opened, once it's ready to be interacted with, this will set it up for
 * use in a particular context, based on the `data` argument.
 *
 * When you override this method, you must call the parent method at the very beginning.
 *
 * @method
 * @abstract
 * @param {Object} [data] Window opening data
 */
OO.ui.Window.prototype.setup = function () {
	// Override to do something
};

/**
 * Tear down window after use.
 *
 * Each time the window is closed, and it's done being interacted with, this will tear it down and
 * do something with the user's interactions within the window, based on the `data` argument.
 *
 * When you override this method, you must call the parent method at the very end.
 *
 * @method
 * @abstract
 * @param {Object} [data] Window closing data
 */
OO.ui.Window.prototype.teardown = function () {
	// Override to do something
};

/**
 * Open window.
 *
 * Do not override this method. See #setup for a way to make changes each time the window opens.
 *
 * @method
 * @param {Object} [data] Window opening data
 * @fires open
 * @chainable
 */
OO.ui.Window.prototype.open = function ( data ) {
	if ( !this.opening && !this.closing && !this.visible ) {
		this.opening = true;
		this.$element.show();
		this.visible = true;
		this.frame.run( OO.ui.bind( function () {
			this.frame.$element.focus();
			this.emit( 'opening', data );
			this.setup( data );
			this.emit( 'open', data );
			this.opening = false;
		}, this ) );
	}

	return this;
};

/**
 * Close window.
 *
 * See #teardown for a way to do something each time the window closes.
 *
 * @method
 * @param {Object} [data] Window closing data
 * @fires close
 * @chainable
 */
OO.ui.Window.prototype.close = function ( data ) {
	if ( !this.opening && !this.closing && this.visible ) {
		this.frame.$content.find( ':focus' ).blur();
		this.closing = true;
		this.$element.hide();
		this.visible = false;
		this.emit( 'closing', data );
		this.teardown( data );
		this.emit( 'close', data );
		this.closing = false;
	}

	return this;
};
/**
 * Set of mutually exclusive windows.
 *
 * @class
 * @extends OO.ui.Element
 * @mixins OO.EventEmitter
 *
 * @constructor
 * @param {OO.Factory} factory Window factory
 * @param {Object} [config] Configuration options
 */
OO.ui.WindowSet = function OoUiWindowSet( factory, config ) {
	// Parent constructor
	OO.ui.Element.call( this, config );

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Properties
	this.factory = factory;
	this.windows = {};
	this.currentWindow = null;

	// Initialization
	this.$element.addClass( 'oo-ui-windowSet' );
};

/* Inheritance */

OO.inheritClass( OO.ui.WindowSet, OO.ui.Element );

OO.mixinClass( OO.ui.WindowSet, OO.EventEmitter );

/* Events */

/**
 * @event opening
 * @param {OO.ui.Window} win Window that's being opened
 * @param {Object} config Window opening information
 */

/**
 * @event open
 * @param {OO.ui.Window} win Window that's been opened
 * @param {Object} config Window opening information
 */

/**
 * @event closing
 * @param {OO.ui.Window} win Window that's being closed
 * @param {Object} config Window closing information
 */

/**
 * @event close
 * @param {OO.ui.Window} win Window that's been closed
 * @param {Object} config Window closing information
 */

/* Methods */

/**
 * Handle a window that's being opened.
 *
 * @method
 * @param {OO.ui.Window} win Window that's being opened
 * @param {Object} [config] Window opening information
 * @fires opening
 */
OO.ui.WindowSet.prototype.onWindowOpening = function ( win, config ) {
	if ( this.currentWindow && this.currentWindow !== win ) {
		this.currentWindow.close();
	}
	this.currentWindow = win;
	this.emit( 'opening', win, config );
};

/**
 * Handle a window that's been opened.
 *
 * @method
 * @param {OO.ui.Window} win Window that's been opened
 * @param {Object} [config] Window opening information
 * @fires open
 */
OO.ui.WindowSet.prototype.onWindowOpen = function ( win, config ) {
	this.emit( 'open', win, config );
};

/**
 * Handle a window that's being closed.
 *
 * @method
 * @param {OO.ui.Window} win Window that's being closed
 * @param {Object} [config] Window closing information
 * @fires closing
 */
OO.ui.WindowSet.prototype.onWindowClosing = function ( win, config ) {
	this.currentWindow = null;
	this.emit( 'closing', win, config );
};

/**
 * Handle a window that's been closed.
 *
 * @method
 * @param {OO.ui.Window} win Window that's been closed
 * @param {Object} [config] Window closing information
 * @fires close
 */
OO.ui.WindowSet.prototype.onWindowClose = function ( win, config ) {
	this.emit( 'close', win, config );
};

/**
 * Get the current window.
 *
 * @method
 * @returns {OO.ui.Window} Current window
 */
OO.ui.WindowSet.prototype.getCurrentWindow = function () {
	return this.currentWindow;
};

/**
 * Return a given window.
 *
 * @param {string} name Symbolic name of window
 * @return {OO.ui.Window} Window with specified name
 */
OO.ui.WindowSet.prototype.getWindow = function ( name ) {
	var win;

	if ( !this.factory.lookup( name ) ) {
		throw new Error( 'Unknown window: ' + name );
	}
	if ( !( name in this.windows ) ) {
		win = this.windows[name] = this.factory.create( name, this, { '$': this.$ } );
		win.connect( this, {
			'opening': [ 'onWindowOpening', win ],
			'open': [ 'onWindowOpen', win ],
			'closing': [ 'onWindowClosing', win ],
			'close': [ 'onWindowClose', win ]
		} );
		this.$element.append( win.$element );
		win.getFrame().load();
	}
	return this.windows[name];
};
/**
 * Modal dialog box.
 *
 * @class
 * @abstract
 * @extends OO.ui.Window
 *
 * @constructor
 * @param {OO.ui.WindowSet} windowSet Window set this dialog is part of
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [footless] Hide foot
 * @cfg {boolean} [small] Make the dialog small
 */
OO.ui.Dialog = function OoUiDialog( windowSet, config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.Window.call( this, windowSet, config );

	// Properties
	this.visible = false;
	this.footless = !!config.footless;
	this.small = !!config.small;
	this.onWindowMouseWheelHandler = OO.ui.bind( this.onWindowMouseWheel, this );
	this.onDocumentKeyDownHandler = OO.ui.bind( this.onDocumentKeyDown, this );

	// Events
	this.$element.on( 'mousedown', false );

	// Initialization
	this.$element.addClass( 'oo-ui-dialog' );
};

/* Inheritance */

OO.inheritClass( OO.ui.Dialog, OO.ui.Window );

/* Static Properties */

/**
 * Symbolic name of dialog.
 *
 * @abstract
 * @static
 * @property {string}
 * @inheritable
 */
OO.ui.Dialog.static.name = '';

/* Methods */

/**
 * Handle close button click events.
 *
 * @method
 */
OO.ui.Dialog.prototype.onCloseButtonClick = function () {
	this.close( { 'action': 'cancel' } );
};

/**
 * Handle window mouse wheel events.
 *
 * @method
 * @param {jQuery.Event} e Mouse wheel event
 */
OO.ui.Dialog.prototype.onWindowMouseWheel = function () {
	return false;
};

/**
 * Handle document key down events.
 *
 * @method
 * @param {jQuery.Event} e Key down event
 */
OO.ui.Dialog.prototype.onDocumentKeyDown = function ( e ) {
	switch ( e.which ) {
		case OO.ui.Keys.PAGEUP:
		case OO.ui.Keys.PAGEDOWN:
		case OO.ui.Keys.END:
		case OO.ui.Keys.HOME:
		case OO.ui.Keys.LEFT:
		case OO.ui.Keys.UP:
		case OO.ui.Keys.RIGHT:
		case OO.ui.Keys.DOWN:
			// Prevent any key events that might cause scrolling
			return false;
	}
};

/**
 * Handle frame document key down events.
 *
 * @method
 * @param {jQuery.Event} e Key down event
 */
OO.ui.Dialog.prototype.onFrameDocumentKeyDown = function ( e ) {
	if ( e.which === OO.ui.Keys.ESCAPE ) {
		this.close( { 'action': 'cancel' } );
		return false;
	}
};

/**
 * @inheritdoc
 */
OO.ui.Dialog.prototype.initialize = function () {
	// Parent method
	OO.ui.Window.prototype.initialize.call( this );

	// Properties
	this.closeButton = new OO.ui.IconButtonWidget( {
		'$': this.$, 'title': OO.ui.msg( 'ooui-dialog-action-close' ), 'icon': 'close'
	} );

	// Events
	this.closeButton.connect( this, { 'click': 'onCloseButtonClick' } );
	this.frame.$document.on( 'keydown', OO.ui.bind( this.onFrameDocumentKeyDown, this ) );

	// Initialization
	this.frame.$content.addClass( 'oo-ui-dialog-content' );
	if ( this.footless ) {
		this.frame.$content.addClass( 'oo-ui-dialog-content-footless' );
	}
	if ( this.small ) {
		this.$frame.addClass( 'oo-ui-window-frame-small' );
	}
	this.closeButton.$element.addClass( 'oo-ui-window-closeButton' );
	this.$head.append( this.closeButton.$element );
};

/**
 * @inheritdoc
 */
OO.ui.Dialog.prototype.setup = function ( data ) {
	// Parent method
	OO.ui.Window.prototype.setup.call( this, data );

	// Prevent scrolling in top-level window
	this.$( window ).on( 'mousewheel', this.onWindowMouseWheelHandler );
	this.$( document ).on( 'keydown', this.onDocumentKeyDownHandler );
};

/**
 * @inheritdoc
 */
OO.ui.Dialog.prototype.teardown = function ( data ) {
	// Parent method
	OO.ui.Window.prototype.teardown.call( this, data );

	// Allow scrolling in top-level window
	this.$( window ).off( 'mousewheel', this.onWindowMouseWheelHandler );
	this.$( document ).off( 'keydown', this.onDocumentKeyDownHandler );
};

/**
 * @inheritdoc
 */
OO.ui.Dialog.prototype.close = function ( data ) {
	if ( !this.opening && !this.closing && this.visible ) {
		// Trigger transition
		this.$element.addClass( 'oo-ui-dialog-closing' );
		// Allow transition to complete before actually closing
		setTimeout( OO.ui.bind( function () {
			this.$element.removeClass( 'oo-ui-dialog-closing' );
			// Parent method
			OO.ui.Window.prototype.close.call( this, data );
		}, this ), 250 );
	}
};
/**
 * Container for elements.
 *
 * @class
 * @abstract
 * @extends OO.ui.Element
 * @mixin OO.EventEmitter
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.Layout = function OoUiLayout( config ) {
	// Initialize config
	config = config || {};

	// Parent constructor
	OO.ui.Element.call( this, config );

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Initialization
	this.$element.addClass( 'oo-ui-layout' );
};

/* Inheritance */

OO.inheritClass( OO.ui.Layout, OO.ui.Element );

OO.mixinClass( OO.ui.Layout, OO.EventEmitter );
/**
 * User interface control.
 *
 * @class
 * @abstract
 * @extends OO.ui.Element
 * @mixin OO.EventEmitter
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [disabled=false] Disable
 */
OO.ui.Widget = function OoUiWidget( config ) {
	// Initialize config
	config = $.extend( { 'disabled': false }, config );

	// Parent constructor
	OO.ui.Element.call( this, config );

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Properties
	this.disabled = config.disabled;

	// Initialization
	this.$element.addClass( 'oo-ui-widget' );
	this.setDisabled( this.disabled );
};

/* Inheritance */

OO.inheritClass( OO.ui.Widget, OO.ui.Element );

OO.mixinClass( OO.ui.Widget, OO.EventEmitter );

/* Methods */

/**
 * Check if the widget is disabled.
 *
 * @method
 * @param {boolean} Button is disabled
 */
OO.ui.Widget.prototype.isDisabled = function () {
	return this.disabled;
};

/**
 * Set the disabled state of the widget.
 *
 * This should probably change the widgets's appearance and prevent it from being used.
 *
 * @method
 * @param {boolean} disabled Disable button
 * @chainable
 */
OO.ui.Widget.prototype.setDisabled = function ( disabled ) {
	this.disabled = !!disabled;
	if ( this.disabled ) {
		this.$element.addClass( 'oo-ui-widget-disabled' );
	} else {
		this.$element.removeClass( 'oo-ui-widget-disabled' );
	}
	return this;
};
/**
 * Element that can be automatically clipped to visible boundaies.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} $clippable Nodes to clip, assigned to #$clippable
 */
OO.ui.ClippableElement = function OoUiClippableElement( $clippable ) {
	// Properties
	this.$clippable = $clippable;
	this.clipping = false;
	this.clipped = false;
	this.$clippableContainer = null;
	this.$clippableScroller = null;
	this.$clippableWindow = null;
	this.onClippableContainerScrollHandler = OO.ui.bind( this.clip, this );
	this.onClippableWindowResizeHandler = OO.ui.bind( this.clip, this );

	// Initialization
	this.$clippable.addClass( 'oo-ui-clippableElement-clippable' );
};

/* Methods */

/**
 * Set clipping.
 *
 * @method
 * @param {boolean} value Enable clipping
 * @chainable
 */
OO.ui.ClippableElement.prototype.setClipping = function ( value ) {
	value = !!value;

	if ( this.clipping !== value ) {
		this.clipping = value;
		if ( this.clipping ) {
			this.$clippableContainer = this.$( this.getClosestScrollableElementContainer() );
			// If the clippable container is the body, we have to listen to scroll events and check
			// jQuery.scrollTop on the window because of browser inconsistencies
			this.$clippableScroller = this.$clippableContainer.is( 'body' ) ?
				this.$( OO.ui.Element.getWindow( this.$clippableContainer ) ) :
				this.$clippableContainer;
			this.$clippableScroller.on( 'scroll', this.onClippableContainerScrollHandler );
			this.$clippableWindow = this.$( this.getElementWindow() )
				.on( 'resize', this.onClippableWindowResizeHandler );
			// Initial clip after visible
			setTimeout( OO.ui.bind( this.clip, this ) );
		} else {
			this.$clippableContainer = null;
			this.$clippableScroller.off( 'scroll', this.onClippableContainerScrollHandler );
			this.$clippableScroller = null;
			this.$clippableWindow.off( 'resize', this.onClippableWindowResizeHandler );
			this.$clippableWindow = null;
		}
	}

	return this;
};

/**
 * Check if the element will be clipped to fit the visible area of the nearest scrollable container.
 *
 * @method
 * @return {boolean} Element will be clipped to the visible area
 */
OO.ui.ClippableElement.prototype.isClipping = function () {
	return this.clipping;
};

/**
 * Check if the bottom or right of the element is being clipped by the nearest scrollable container.
 *
 * @method
 * @return {boolean} Part of the element is being clipped
 */
OO.ui.ClippableElement.prototype.isClipped = function () {
	return this.clipped;
};

/**
 * Clip element to visible boundaries and allow scrolling when needed.
 *
 * Element will be clipped the bottom or right of the element is within 10px of the edge of, or
 * overlapped by, the visible area of the nearest scrollable container.
 *
 * @method
 * @chainable
 */
OO.ui.ClippableElement.prototype.clip = function () {
	if ( !this.clipping ) {
		// this.$clippableContainer and this.$clippableWindow are null, so the below will fail
		return this;
	}

	var buffer = 10,
		cOffset = this.$clippable.offset(),
		ccOffset = this.$clippableContainer.offset() || { 'top': 0, 'left': 0 },
		ccHeight = this.$clippableContainer.innerHeight() - buffer,
		ccWidth = this.$clippableContainer.innerWidth() - buffer,
		scrollTop = this.$clippableScroller.scrollTop(),
		scrollLeft = this.$clippableScroller.scrollLeft(),
		desiredWidth = ( ccOffset.left + scrollLeft + ccWidth ) - cOffset.left,
		desiredHeight = ( ccOffset.top + scrollTop + ccHeight ) - cOffset.top,
		naturalWidth = this.$clippable.prop( 'scrollWidth' ),
		naturalHeight = this.$clippable.prop( 'scrollHeight' ),
		clipWidth = desiredWidth < naturalWidth,
		clipHeight = desiredHeight < naturalHeight;

	if ( clipWidth ) {
		this.$clippable.css( { 'overflow-x': 'auto', 'width': desiredWidth } );
	} else {
		this.$clippable.css( { 'overflow-x': '', 'width': '' } );
	}
	if ( clipHeight ) {
		this.$clippable.css( { 'overflow-y': 'auto', 'height': desiredHeight } );
	} else {
		this.$clippable.css( { 'overflow-y': '', 'height': '' } );
	}

	this.clipped = clipWidth || clipHeight;

	return this;
};
/**
 * Element with named flags, used for styling, that can be added, removed and listed and checked.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {string[]} [flags=[]] Styling flags, e.g. 'primary', 'destructive' or 'constructive'
 */
OO.ui.FlaggableElement = function OoUiFlaggableElement( config ) {
	// Config initialization
	config = config || {};

	// Properties
	this.flags = {};

	// Initialization
	this.setFlags( config.flags );
};

/* Methods */

/**
 * Check if a flag is set.
 *
 * @method
 * @param {string} flag Flag name to check
 * @returns {boolean} Has flag
 */
OO.ui.FlaggableElement.prototype.hasFlag = function ( flag ) {
	return flag in this.flags;
};

/**
 * Get the names of all flags.
 *
 * @method
 * @returns {string[]} flags Flag names
 */
OO.ui.FlaggableElement.prototype.getFlags = function () {
	return Object.keys( this.flags );
};

/**
 * Add one or more flags.
 *
 * @method
 * @param {string[]|Object.<string, boolean>} flags List of flags to add, or list of set/remove
 *  values, keyed by flag name
 * @chainable
 */
OO.ui.FlaggableElement.prototype.setFlags = function ( flags ) {
	var i, len, flag,
		classPrefix = 'oo-ui-flaggableElement-';

	if ( Array.isArray( flags ) ) {
		for ( i = 0, len = flags.length; i < len; i++ ) {
			flag = flags[i];
			// Set
			this.flags[flag] = true;
			this.$element.addClass( classPrefix + flag );
		}
	} else if ( OO.isPlainObject( flags ) ) {
		for ( flag in flags ) {
			if ( flags[flags] ) {
				// Set
				this.flags[flag] = true;
				this.$element.addClass( classPrefix + flag );
			} else {
				// Remove
				delete this.flags[flag];
				this.$element.removeClass( classPrefix + flag );
			}
		}
	}
	return this;
};
/**
 * Element containing a sequence of child elements.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} $group Container node, assigned to #$group
 */
OO.ui.GroupElement = function OoUiGroupElement( $group ) {
	// Properties
	this.$group = $group;
	this.items = [];
	this.$items = this.$( [] );
};

/* Methods */

/**
 * Get items.
 *
 * @method
 * @returns {OO.ui.Element[]} Items
 */
OO.ui.GroupElement.prototype.getItems = function () {
	return this.items.slice( 0 );
};

/**
 * Add items.
 *
 * @method
 * @param {OO.ui.Element[]} items Item
 * @param {number} [index] Index to insert items after
 * @chainable
 */
OO.ui.GroupElement.prototype.addItems = function ( items, index ) {
	var i, len, item, currentIndex,
		$items = this.$( [] );

	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];

		// Check if item exists then remove it first, effectively "moving" it
		currentIndex = this.items.indexOf( item );
		if ( currentIndex >= 0 ) {
			this.removeItems( [ item ] );
			// Adjust index to compensate for removal
			if ( currentIndex < index ) {
				index--;
			}
		}
		// Add the item
		$items = $items.add( item.$element );
	}

	if ( index === undefined || index < 0 || index >= this.items.length ) {
		this.$group.append( $items );
		this.items.push.apply( this.items, items );
	} else if ( index === 0 ) {
		this.$group.prepend( $items );
		this.items.unshift.apply( this.items, items );
	} else {
		this.$items.eq( index ).before( $items );
		this.items.splice.apply( this.items, [ index, 0 ].concat( items ) );
	}

	this.$items = this.$items.add( $items );

	return this;
};

/**
 * Remove items.
 *
 * Items will be detached, not removed, so they can be used later.
 *
 * @method
 * @param {OO.ui.Element[]} items Items to remove
 * @chainable
 */
OO.ui.GroupElement.prototype.removeItems = function ( items ) {
	var i, len, item, index;
	// Remove specific items
	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];
		index = this.items.indexOf( item );
		if ( index !== -1 ) {
			this.items.splice( index, 1 );
			item.$element.detach();
			this.$items = this.$items.not( item.$element );
		}
	}

	return this;
};

/**
 * Clear all items.
 *
 * Items will be detached, not removed, so they can be used later.
 *
 * @method
 * @chainable
 */
OO.ui.GroupElement.prototype.clearItems = function () {
	this.items = [];
	this.$items.detach();
	this.$items = this.$( [] );

	return this;
};
/**
 * Element containing an icon.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} $icon Icon node, assigned to #$icon
 * @param {Object} [config] Configuration options
 * @cfg {Object|string} [icon=''] Symbolic icon name, or map of icon names keyed by language ID;
 *  use the 'default' key to specify the icon to be used when there is no icon in the user's language.
 */
OO.ui.IconedElement = function OoUiIconedElement( $icon, config ) {
	// Config intialization
	config = config || {};

	// Properties
	this.$icon = $icon;
	this.icon = null;

	// Initialization
	this.$icon.addClass( 'oo-ui-iconedElement-icon' );
	this.setIcon( config.icon );
};

/* Methods */

/**
 * Set the icon.
 *
 * @method
 * @param {Object|string} [value] Symbolic name of icon to use
 * @chainable
 */
OO.ui.IconedElement.prototype.setIcon = function ( value ) {
	var icon = OO.isPlainObject( value ) ? OO.ui.getLocalValue( value, null, 'default' ) : value;

	if ( this.icon ) {
		this.$icon.removeClass( 'oo-ui-icon-' + this.icon );
	}
	if ( typeof icon === 'string' ) {
		icon = icon.trim();
		if ( icon.length ) {
			this.$icon.addClass( 'oo-ui-icon-' + icon );
			this.icon = icon;
		}
	}
	return this;
};
/**
 * Element containing a label.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} $label Label node, assigned to #$label
 * @param {Object} [config] Configuration options
 * @cfg {jQuery|string} [label=''] Label text
 */
OO.ui.LabeledElement = function OoUiLabeledElement( $label, config ) {
	// Config intialization
	config = config || {};

	// Properties
	this.$label = $label;
	this.label = null;

	// Initialization
	this.$label.addClass( 'oo-ui-labeledElement-label' );
	this.setLabel( config.label );
};

/* Static Properties */

OO.ui.LabeledElement.static = {};

/* Methods */

/**
 * Set the label.
 *
 * @method
 * @param {jQuery|string} [value] jQuery HTML node selection or string text value to use for label
 * @chainable
 */
OO.ui.LabeledElement.prototype.setLabel = function ( value ) {
	var empty = false;

	if ( typeof value === 'string' && value.trim() ) {
		this.$label.text( value );
		this.label = value;
	} else if ( value instanceof jQuery ) {
		this.$label.empty().append( value );
		this.label = value;
	} else {
		this.$label.empty();
		this.label = null;
		empty = true;
	}
	this.$label[empty ? 'addClass' : 'removeClass']( 'oo-ui-labeledElement-empty' );

	return this;
};

/**
 * Fit the label.
 *
 * @method
 * @chainable
 */
OO.ui.LabeledElement.prototype.fitLabel = function () {
	if ( this.$label.autoEllipsis ) {
		this.$label.autoEllipsis( { 'hasSpan': false, 'tooltip': true } );
	}
	return this;
};
/**
 * Popuppable element.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {number} [popupWidth=320] Width of popup
 * @cfg {number} [popupHeight] Height of popup
 * @cfg {Object} [popup] Configuration to pass to popup
 */
OO.ui.PopuppableElement = function OoUiPopuppableElement( config ) {
	// Configuration initialization
	config = $.extend( { 'popupWidth': 320 }, config );

	// Properties
	this.popup = new OO.ui.PopupWidget( $.extend(
		{ 'align': 'center', 'autoClose': true },
		config.popup,
		{ '$': this.$, '$autoCloseIgnore': this.$element }
	) );
	this.popupWidth = config.popupWidth;
	this.popupHeight = config.popupHeight;
};

/* Methods */

/**
 * Get popup.
 *
 * @method
 * @returns {OO.ui.PopupWidget} Popup widget
 */
OO.ui.PopuppableElement.prototype.getPopup = function () {
	return this.popup;
};

/**
 * Show popup.
 *
 * @method
 */
OO.ui.PopuppableElement.prototype.showPopup = function () {
	this.popup.show().display( this.popupWidth, this.popupHeight );
};

/**
 * Hide popup.
 *
 * @method
 */
OO.ui.PopuppableElement.prototype.hidePopup = function () {
	this.popup.hide();
};
/**
 * Generic toolbar tool.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 * @mixins OO.ui.IconedElement
 * @mixins OO.ui.LabeledElement
 *
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
OO.ui.Tool = function OoUiTool( toolGroup, config ) {
	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.IconedElement.call( this, this.$( '<span>' ) );
	OO.ui.LabeledElement.call( this, this.$( '<span>' ) );

	// Properties
	this.toolGroup = toolGroup;
	this.toolbar = this.toolGroup.getToolbar();
	this.active = false;
	this.$link = this.$( '<a>' );

	// Events
	this.toolbar.connect( this, { 'updateState': 'onUpdateState' } );

	// Initialization
	this.$link
		.addClass( 'oo-ui-tool-link' )
		.append( this.$icon, this.$label );
	this.$element
		.data( 'oo-ui-tool', this )
		.addClass(
			'oo-ui-tool ' + 'oo-ui-tool-name-' +
			this.constructor.static.name.replace( /^([^\/]+)\/([^\/]+).*$/, '$1-$2' )
		)
		.append( this.$link );
	this.setIcon( this.constructor.static.icon );
	this.updateLabel();
};

/* Inheritance */

OO.inheritClass( OO.ui.Tool, OO.ui.Widget );

OO.mixinClass( OO.ui.Tool, OO.ui.IconedElement );
OO.mixinClass( OO.ui.Tool, OO.ui.LabeledElement );

/* Events */

/**
 * @event select
 */

/* Static Properties */

OO.ui.Tool.static.tagName = 'span';

/**
 * Symbolic name of tool.
 *
 * @abstract
 * @static
 * @property {string}
 * @inheritable
 */
OO.ui.Tool.static.name = '';

/**
 * Tool group.
 *
 * @abstract
 * @static
 * @property {string}
 * @inheritable
 */
OO.ui.Tool.static.group = '';

/**
 * Symbolic name of icon.
 *
 * Value should be the unique portion of an icon CSS class name, such as 'up' for 'oo-ui-icon-up'.
 *
 * For i18n purposes, this property can be an object containing a `default` icon name property and
 * additional icon names keyed by language code.
 *
 * Example of i18n icon definition:
 *     { 'default': 'bold-a', 'en': 'bold-b', 'de': 'bold-f' }
 *
 * @abstract
 * @static
 * @property {string|Object}
 * @inheritable
 */
OO.ui.Tool.static.icon = '';

/**
 * Message key for tool title.
 *
 * Title is used as a tooltip when the tool is part of a bar tool group, or a label when the tool
 * is part of a list or menu tool group. If a trigger is associated with an action by the same name
 * as the tool, a description of its keyboard shortcut for the appropriate platform will be
 * appended to the title if the tool is part of a bar tool group.
 *
 * @abstract
 * @static
 * @property {string}
 * @inheritable
 */
OO.ui.Tool.static.titleMessage = '';

/**
 * Tool can be automatically added to tool groups.
 *
 * @static
 * @property {boolean}
 * @inheritable
 */
OO.ui.Tool.static.autoAdd = true;

/**
 * Check if this tool is compatible with given data.
 *
 * @method
 * @static
 * @inheritable
 * @param {Mixed} data Data to check
 * @returns {boolean} Tool can be used with data
 */
OO.ui.Tool.static.isCompatibleWith = function () {
	return false;
};

/* Methods */

/**
 * Handle the toolbar state being updated.
 *
 * This is an abstract method that must be overridden in a concrete subclass.
 *
 * @abstract
 * @method
 */
OO.ui.Tool.prototype.onUpdateState = function () {
	throw new Error(
		'OO.ui.Tool.onUpdateState not implemented in this subclass:' + this.constructor
	);
};

/**
 * Handle the tool being selected.
 *
 * This is an abstract method that must be overridden in a concrete subclass.
 *
 * @abstract
 * @method
 */
OO.ui.Tool.prototype.onSelect = function () {
	throw new Error(
		'OO.ui.Tool.onSelect not implemented in this subclass:' + this.constructor
	);
};

/**
 * Check if the button is active.
 *
 * @method
 * @param {boolean} Button is active
 */
OO.ui.Tool.prototype.isActive = function () {
	return this.active;
};

/**
 * Make the button appear active or inactive.
 *
 * @method
 * @param {boolean} state Make button appear active
 */
OO.ui.Tool.prototype.setActive = function ( state ) {
	this.active = !!state;
	if ( this.active ) {
		this.$element.addClass( 'oo-ui-tool-active' );
	} else {
		this.$element.removeClass( 'oo-ui-tool-active' );
	}
};

/**
 * Get the tool title.
 *
 * @method
 * @returns {string} [title] Title text
 */
OO.ui.Tool.prototype.getTitle = function () {
	var key = this.constructor.static.titleMessage;
	return typeof key === 'string' ? OO.ui.msg( key ) : '';
};

/**
 * Get the tool's symbolic name.
 *
 * @method
 * @returns {string} Symbolic name of tool
 */
OO.ui.Tool.prototype.getName = function () {
	return this.constructor.static.name;
};

/**
 * Update the label.
 *
 * @method
 */
OO.ui.Tool.prototype.updateLabel = function () {
	var title = this.getTitle(),
		labelTooltips = this.toolGroup.constructor.static.labelTooltips,
		accelTooltips = this.toolGroup.constructor.static.accelTooltips,
		accel = this.toolbar.getToolAccelerator( this.constructor.static.name ),
		tooltipParts = [];

	this.setLabel(
		this.$( '<span>' )
			.addClass( 'oo-ui-tool-title' )
			.text( title )
			.add(
				this.$( '<span>' )
					.addClass( 'oo-ui-tool-accel' )
					.text( accel )
			)
	);

	if ( labelTooltips && typeof title === 'string' && title.length ) {
		tooltipParts.push( title );
	}
	if ( accelTooltips && typeof accel === 'string' && accel.length ) {
		tooltipParts.push( accel );
	}
	if ( tooltipParts.length ) {
		this.$link.attr( 'title', tooltipParts.join( ' ' ) );
	} else {
		this.$link.removeAttr( 'title' );
	}
};

/**
 * Destroy tool.
 *
 * @method
 */
OO.ui.Tool.prototype.destroy = function () {
	this.toolbar.disconnect( this );
	this.$element.remove();
};
/**
 * Collection of tool groups.
 *
 * @class
 * @extends OO.ui.Element
 * @mixins OO.EventEmitter
 * @mixins OO.ui.GroupElement
 *
 * @constructor
 * @param {OO.Factory} toolFactory Factory for creating tools
 * @param {Object} [options] Configuration options
 * @cfg {boolean} [actions] Add an actions section opposite to the tools
 * @cfg {boolean} [shadow] Add a shadow below the toolbar
 */
OO.ui.Toolbar = function OoUiToolbar( toolFactory, options ) {
	// Configuration initialization
	options = options || {};

	// Parent constructor
	OO.ui.Element.call( this, options );

	// Mixin constructors
	OO.EventEmitter.call( this );
	OO.ui.GroupElement.call( this, this.$( '<div>' ) );

	// Properties
	this.toolFactory = toolFactory;
	this.groups = [];
	this.tools = {};
	this.$bar = this.$( '<div>' );
	this.$actions = this.$( '<div>' );
	this.initialized = false;

	// Events
	this.$element
		.add( this.$bar ).add( this.$group ).add( this.$actions )
		.on( 'mousedown', OO.ui.bind( this.onMouseDown, this ) );

	// Initialization
	this.$group.addClass( 'oo-ui-toolbar-tools' );
	this.$bar.addClass( 'oo-ui-toolbar-bar' ).append( this.$group );
	if ( options.actions ) {
		this.$actions.addClass( 'oo-ui-toolbar-actions' );
		this.$bar.append( this.$actions );
	}
	this.$bar.append( '<div style="clear:both"></div>' );
	if ( options.shadow ) {
		this.$bar.append( '<div class="oo-ui-toolbar-shadow"></div>' );
	}
	this.$element.addClass( 'oo-ui-toolbar' ).append( this.$bar );
};

/* Inheritance */

OO.inheritClass( OO.ui.Toolbar, OO.ui.Element );

OO.mixinClass( OO.ui.Toolbar, OO.EventEmitter );
OO.mixinClass( OO.ui.Toolbar, OO.ui.GroupElement );

/* Methods */

/**
 * Get the tool factory.
 *
 * @method
 * @returns {OO.Factory} Tool factory
 */
OO.ui.Toolbar.prototype.getToolFactory = function () {
	return this.toolFactory;
};

/**
 * Handles mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
OO.ui.Toolbar.prototype.onMouseDown = function ( e ) {
	var $closestWidgetToEvent = this.$( e.target ).closest( '.oo-ui-widget' ),
		$closestWidgetToToolbar = this.$element.closest( '.oo-ui-widget' );
	if ( !$closestWidgetToEvent.length || $closestWidgetToEvent[0] === $closestWidgetToToolbar[0] ) {
		return false;
	}
};

/**
 * Sets up handles and preloads required information for the toolbar to work.
 * This must be called immediately after it is attached to a visible document.
 */
OO.ui.Toolbar.prototype.initialize = function () {
	this.initialized = true;
};

/**
 * Setup toolbar.
 *
 * Tools can be specified in the following ways:
 *  - A specific tool: `{ 'name': 'tool-name' }` or `'tool-name'`
 *  - All tools in a group: `{ 'group': 'group-name' }`
 *  - All tools: `'*'` - Using this will make the group a list with a "More" label by default
 *
 * @method
 * @param {Object.<string,Array>} groups List of tool group configurations
 * @param {Array|string} [groups.include] Tools to include
 * @param {Array|string} [groups.exclude] Tools to exclude
 * @param {Array|string} [groups.promote] Tools to promote to the beginning
 * @param {Array|string} [groups.demote] Tools to demote to the end
 */
OO.ui.Toolbar.prototype.setup = function ( groups ) {
	var i, len, type, group,
		items = [],
		// TODO: Use a registry instead
		defaultType = 'bar',
		constructors = {
			'bar': OO.ui.BarToolGroup,
			'list': OO.ui.ListToolGroup,
			'menu': OO.ui.MenuToolGroup
		};

	// Cleanup previous groups
	this.reset();

	// Build out new groups
	for ( i = 0, len = groups.length; i < len; i++ ) {
		group = groups[i];
		if ( group.include === '*' ) {
			// Apply defaults to catch-all groups
			if ( group.type === undefined ) {
				group.type = 'list';
			}
			if ( group.label === undefined ) {
				group.label = 'ooui-toolbar-more';
			}
		}
		type = constructors[group.type] ? group.type : defaultType;
		items.push(
			new constructors[type]( this, $.extend( { '$': this.$ }, group ) )
		);
	}
	this.addItems( items );
};

/**
 * Remove all tools and groups from the toolbar.
 */
OO.ui.Toolbar.prototype.reset = function () {
	var i, len;

	this.groups = [];
	this.tools = {};
	for ( i = 0, len = this.items.length; i < len; i++ ) {
		this.items[i].destroy();
	}
	this.clearItems();
};

/**
 * Destroys toolbar, removing event handlers and DOM elements.
 *
 * Call this whenever you are done using a toolbar.
 */
OO.ui.Toolbar.prototype.destroy = function () {
	this.reset();
	this.$element.remove();
};

/**
 * Check if tool has not been used yet.
 *
 * @param {string} name Symbolic name of tool
 * @return {boolean} Tool is available
 */
OO.ui.Toolbar.prototype.isToolAvailable = function ( name ) {
	return !this.tools[name];
};

/**
 * Prevent tool from being used again.
 *
 * @param {OO.ui.Tool} tool Tool to reserve
 */
OO.ui.Toolbar.prototype.reserveTool = function ( tool ) {
	this.tools[tool.getName()] = tool;
};

/**
 * Allow tool to be used again.
 *
 * @param {OO.ui.Tool} tool Tool to release
 */
OO.ui.Toolbar.prototype.releaseTool = function ( tool ) {
	delete this.tools[tool.getName()];
};

/**
 * Get accelerator label for tool.
 *
 * This is a stub that should be overridden to provide access to accelerator information.
 *
 * @param {string} name Symbolic name of tool
 * @returns {string|undefined} Tool accelerator label if available
 */
OO.ui.Toolbar.prototype.getToolAccelerator = function () {
	return undefined;
};
/**
 * Factory for tools.
 *
 * @class
 * @extends OO.Factory
 * @constructor
 */
OO.ui.ToolFactory = function OoUiToolFactory() {
	// Parent constructor
	OO.Factory.call( this );
};

/* Inheritance */

OO.inheritClass( OO.ui.ToolFactory, OO.Factory );

/* Methods */

OO.ui.ToolFactory.prototype.getTools = function ( include, exclude, promote, demote ) {
	var i, len, included, promoted, demoted,
		auto = [],
		used = {};

	// Collect included and not excluded tools
	included = OO.simpleArrayDifference( this.extract( include ), this.extract( exclude ) );

	// Promotion
	promoted = this.extract( promote, used );
	demoted = this.extract( demote, used );

	// Auto
	for ( i = 0, len = included.length; i < len; i++ ) {
		if ( !used[included[i]] ) {
			auto.push( included[i] );
		}
	}

	return promoted.concat( auto ).concat( demoted );
};

/**
 * Get a flat list of names from a list of names or groups.
 *
 * Tools can be specified in the following ways:
 *  - A specific tool: `{ 'name': 'tool-name' }` or `'tool-name'`
 *  - All tools in a group: `{ 'group': 'group-name' }`
 *  - All tools: `'*'`
 *
 * @private
 * @param {Array|string} collection List of tools
 * @param {Object} [used] Object with names that should be skipped as properties; extracted
 *   names will be added as properties
 * @return {string[]} List of extracted names
 */
OO.ui.ToolFactory.prototype.extract = function ( collection, used ) {
	var i, len, item, name, tool,
		names = [];

	if ( collection === '*' ) {
		for ( name in this.registry ) {
			tool = this.registry[name];
			if (
				// Only add tools by group name when auto-add is enabled
				tool.static.autoAdd &&
				// Exclude already used tools
				( !used || !used[name] )
			) {
				names.push( name );
				if ( used ) {
					used[name] = true;
				}
			}
		}
	} else if ( Array.isArray( collection ) ) {
		for ( i = 0, len = collection.length; i < len; i++ ) {
			item = collection[i];
			// Allow plain strings as shorthand for named tools
			if ( typeof item === 'string' ) {
				item = { 'name': item };
			}
			if ( OO.isPlainObject( item ) ) {
				if ( item.group ) {
					for ( name in this.registry ) {
						tool = this.registry[name];
						if (
							// Include tools with matching group
							tool.static.group === item.group &&
							// Only add tools by group name when auto-add is enabled
							tool.static.autoAdd &&
							// Exclude already used tools
							( !used || !used[name] )
						) {
							names.push( name );
							if ( used ) {
								used[name] = true;
							}
						}
					}
				}
				// Include tools with matching name and exclude already used tools
				else if ( item.name && ( !used || !used[item.name] ) ) {
					names.push( item.name );
					if ( used ) {
						used[item.name] = true;
					}
				}
			}
		}
	}
	return names;
};
/**
 * Collection of tools.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 * @mixins OO.ui.GroupElement
 *
 * Tools can be specified in the following ways:
 *  - A specific tool: `{ 'name': 'tool-name' }` or `'tool-name'`
 *  - All tools in a group: `{ 'group': 'group-name' }`
 *  - All tools: `'*'`
 *
 * @constructor
 * @param {OO.ui.Toolbar} toolbar
 * @param {Object} [config] Configuration options
 * @cfg {Array|string} [include=[]] List of tools to include
 * @cfg {Array|string} [exclude=[]] List of tools to exclude
 * @cfg {Array|string} [promote=[]] List of tools to promote to the beginning
 * @cfg {Array|string} [demote=[]] List of tools to demote to the end
 */
OO.ui.ToolGroup = function OoUiToolGroup( toolbar, config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.GroupElement.call( this, this.$( '<div>' ) );

	// Properties
	this.toolbar = toolbar;
	this.tools = {};
	this.pressed = null;
	this.include = config.include || [];
	this.exclude = config.exclude || [];
	this.promote = config.promote || [];
	this.demote = config.demote || [];
	this.onCapturedMouseUpHandler = OO.ui.bind( this.onCapturedMouseUp, this );

	// Events
	this.$element.on( {
		'mousedown': OO.ui.bind( this.onMouseDown, this ),
		'mouseup': OO.ui.bind( this.onMouseUp, this ),
		'mouseover': OO.ui.bind( this.onMouseOver, this ),
		'mouseout': OO.ui.bind( this.onMouseOut, this )
	} );
	this.toolbar.getToolFactory().connect( this, { 'register': 'onToolFactoryRegister' } );

	// Initialization
	this.$group.addClass( 'oo-ui-toolGroup-tools' );
	this.$element
		.addClass( 'oo-ui-toolGroup' )
		.append( this.$group );
	this.populate();
};

/* Inheritance */

OO.inheritClass( OO.ui.ToolGroup, OO.ui.Widget );

OO.mixinClass( OO.ui.ToolGroup, OO.ui.GroupElement );

/* Events */

/**
 * @event update
 */

/* Static Properties */

/**
 * Show labels in tooltips.
 *
 * @static
 * @property {boolean}
 * @inheritable
 */
OO.ui.ToolGroup.static.labelTooltips = false;

/**
 * Show acceleration labels in tooltips.
 *
 * @static
 * @property {boolean}
 * @inheritable
 */
OO.ui.ToolGroup.static.accelTooltips = false;

/* Methods */

/**
 * Handle mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
OO.ui.ToolGroup.prototype.onMouseDown = function ( e ) {
	if ( !this.disabled && e.which === 1 ) {
		this.pressed = this.getTargetTool( e );
		if ( this.pressed ) {
			this.pressed.setActive( true );
			this.getElementDocument().addEventListener(
				'mouseup', this.onCapturedMouseUpHandler, true
			);
			return false;
		}
	}
};

/**
 * Handle captured mouse up events.
 *
 * @method
 * @param {Event} e Mouse up event
 */
OO.ui.ToolGroup.prototype.onCapturedMouseUp = function ( e ) {
	this.getElementDocument().removeEventListener( 'mouseup', this.onCapturedMouseUpHandler, true );
	// onMouseUp may be called a second time, depending on where the mouse is when the button is
	// released, but since `this.pressed` will no longer be true, the second call will be ignored.
	this.onMouseUp( e );
};

/**
 * Handle mouse up events.
 *
 * @method
 * @param {jQuery.Event} e Mouse up event
 */
OO.ui.ToolGroup.prototype.onMouseUp = function ( e ) {
	var tool = this.getTargetTool( e );

	if ( !this.disabled && e.which === 1 && this.pressed && this.pressed === tool ) {
		this.pressed.onSelect();
	}

	this.pressed = null;
	return false;
};

/**
 * Handle mouse over events.
 *
 * @method
 * @param {jQuery.Event} e Mouse over event
 */
OO.ui.ToolGroup.prototype.onMouseOver = function ( e ) {
	var tool = this.getTargetTool( e );

	if ( this.pressed && this.pressed === tool ) {
		this.pressed.setActive( true );
	}
};

/**
 * Handle mouse out events.
 *
 * @method
 * @param {jQuery.Event} e Mouse out event
 */
OO.ui.ToolGroup.prototype.onMouseOut = function ( e ) {
	var tool = this.getTargetTool( e );

	if ( this.pressed && this.pressed === tool ) {
		this.pressed.setActive( false );
	}
};

/**
 * Get the closest tool to a jQuery.Event.
 *
 * Only tool links are considered, which prevents other elements in the tool such as popups from
 * triggering tool group interactions.
 *
 * @method
 * @private
 * @param {jQuery.Event} e
 * @returns {OO.ui.Tool|null} Tool, `null` if none was found
 */
OO.ui.ToolGroup.prototype.getTargetTool = function ( e ) {
	var tool,
		$item = this.$( e.target ).closest( '.oo-ui-tool-link' );

	if ( $item.length ) {
		tool = $item.parent().data( 'oo-ui-tool' );
	}

	return tool && !tool.isDisabled() ? tool : null;
};

/**
 * Handle tool registry register events.
 *
 * If a tool is registered after the group is created, we must repopulate the list to account for:
 * - a tool being added that may be included
 * - a tool already included being overridden
 *
 * @param {string} name Symbolic name of tool
 */
OO.ui.ToolGroup.prototype.onToolFactoryRegister = function () {
	this.populate();
};

/**
 * Get the toolbar this group is in.
 *
 * @return {OO.ui.Toolbar} Toolbar of group
 */
OO.ui.ToolGroup.prototype.getToolbar = function () {
	return this.toolbar;
};

/**
 * Add and remove tools based on configuration.
 *
 * @method
 */
OO.ui.ToolGroup.prototype.populate = function () {
	var i, len, name, tool,
		names = {},
		add = [],
		remove = [],
		list = this.toolbar.getToolFactory().getTools(
			this.include, this.exclude, this.promote, this.demote
		);

	// Build a list of needed tools
	for ( i = 0, len = list.length; i < len; i++ ) {
		name = list[i];
		if ( this.toolbar.isToolAvailable( name ) ) {
			tool = this.tools[name];
			if ( !tool ) {
				// Auto-initialize tools on first use
				this.tools[name] = tool =
					this.toolbar.getToolFactory().create( name, this );
				tool.updateLabel();
			}
			this.toolbar.reserveTool( tool );
			add.push( tool );
			names[name] = true;
		}
	}
	// Remove tools that are no longer needed
	for ( name in this.tools ) {
		if ( !names[name] ) {
			this.tools[name].destroy();
			this.toolbar.releaseTool( this.tools[name] );
			remove.push( this.tools[name] );
			delete this.tools[name];
		}
	}
	if ( remove.length ) {
		this.removeItems( remove );
	}
	// Update emptiness state
	if ( add.length ) {
		this.$element.removeClass( 'oo-ui-toolGroup-empty' );
	} else {
		this.$element.addClass( 'oo-ui-toolGroup-empty' );
	}
	// Re-add tools (moving existing ones to new locations)
	this.addItems( add );
};

/**
 * Destroy tool group.
 *
 * @method
 */
OO.ui.ToolGroup.prototype.destroy = function () {
	var name;

	this.clearItems();
	this.toolbar.getToolFactory().disconnect( this );
	for ( name in this.tools ) {
		this.toolbar.releaseTool( this.tools[name] );
		this.tools[name].disconnect( this ).destroy();
		delete this.tools[name];
	}
	this.$element.remove();
};
/**
 * Layout made of a fieldset and optional legend.
 *
 * @class
 * @extends OO.ui.Layout
 * @mixins OO.ui.LabeledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {string} [icon] Symbolic icon name
 */
OO.ui.FieldsetLayout = function OoUiFieldsetLayout( config ) {
	// Config initialization
	config = config || {};

	// Parent constructor
	OO.ui.Layout.call( this, config );

	// Mixin constructors
	OO.ui.LabeledElement.call( this, this.$( '<legend>' ), config );

	// Initialization
	if ( config.icon ) {
		this.$element.addClass( 'oo-ui-fieldsetLayout-decorated' );
		this.$label.addClass( 'oo-ui-icon-' + config.icon );
	}
	this.$element.addClass( 'oo-ui-fieldsetLayout' );
	if ( config.icon || config.label ) {
		this.$element
			.addClass( 'oo-ui-fieldsetLayout-labeled' )
			.append( this.$label );
	}
};

/* Inheritance */

OO.inheritClass( OO.ui.FieldsetLayout, OO.ui.Layout );

OO.mixinClass( OO.ui.FieldsetLayout, OO.ui.LabeledElement );

/* Static Properties */

OO.ui.FieldsetLayout.static.tagName = 'fieldset';
/**
 * Layout made of proportionally sized columns and rows.
 *
 * @class
 * @extends OO.ui.Layout
 *
 * @constructor
 * @param {OO.ui.PanelLayout[]} panels Panels in the grid
 * @param {Object} [config] Configuration options
 * @cfg {number[]} [widths] Widths of columns as ratios
 * @cfg {number[]} [heights] Heights of columns as ratios
 */
OO.ui.GridLayout = function OoUiGridLayout( panels, config ) {
	var i, len, widths;

	// Config initialization
	config = config || {};

	// Parent constructor
	OO.ui.Layout.call( this, config );

	// Properties
	this.panels = [];
	this.widths = [];
	this.heights = [];

	// Initialization
	this.$element.addClass( 'oo-ui-gridLayout' );
	for ( i = 0, len = panels.length; i < len; i++ ) {
		this.panels.push( panels[i] );
		this.$element.append( panels[i].$element );
	}
	if ( config.widths || config.heights ) {
		this.layout( config.widths || [1], config.heights || [1] );
	} else {
		// Arrange in columns by default
		widths = [];
		for ( i = 0, len = this.panels.length; i < len; i++ ) {
			widths[i] = 1;
		}
		this.layout( widths, [1] );
	}
};

/* Inheritance */

OO.inheritClass( OO.ui.GridLayout, OO.ui.Layout );

/* Events */

/**
 * @event layout
 */

/**
 * @event update
 */

/* Static Properties */

OO.ui.GridLayout.static.tagName = 'div';

/* Methods */

/**
 * Set grid dimensions.
 *
 * @method
 * @param {number[]} widths Widths of columns as ratios
 * @param {number[]} heights Heights of rows as ratios
 * @fires layout
 * @throws {Error} If grid is not large enough to fit all panels
 */
OO.ui.GridLayout.prototype.layout = function ( widths, heights ) {
	var x, y,
		xd = 0,
		yd = 0,
		cols = widths.length,
		rows = heights.length;

	// Verify grid is big enough to fit panels
	if ( cols * rows < this.panels.length ) {
		throw new Error( 'Grid is not large enough to fit ' + this.panels.length + 'panels' );
	}

	// Sum up denominators
	for ( x = 0; x < cols; x++ ) {
		xd += widths[x];
	}
	for ( y = 0; y < rows; y++ ) {
		yd += heights[y];
	}
	// Store factors
	this.widths = [];
	this.heights = [];
	for ( x = 0; x < cols; x++ ) {
		this.widths[x] = widths[x] / xd;
	}
	for ( y = 0; y < rows; y++ ) {
		this.heights[y] = heights[y] / yd;
	}
	// Synchronize view
	this.update();
	this.emit( 'layout' );
};

/**
 * Update panel positions and sizes.
 *
 * @method
 * @fires update
 */
OO.ui.GridLayout.prototype.update = function () {
	var x, y, panel,
		i = 0,
		left = 0,
		top = 0,
		dimensions,
		width = 0,
		height = 0,
		cols = this.widths.length,
		rows = this.heights.length;

	for ( y = 0; y < rows; y++ ) {
		for ( x = 0; x < cols; x++ ) {
			panel = this.panels[i];
			width = this.widths[x];
			height = this.heights[y];
			dimensions = {
				'width': Math.round( width * 100 ) + '%',
				'height': Math.round( height * 100 ) + '%',
				'top': Math.round( top * 100 ) + '%'
			};
			// If RTL, reverse:
			if ( OO.ui.Element.getDir( this.$.context ) === 'rtl' ) {
				dimensions.right = Math.round( left * 100 ) + '%';
			} else {
				dimensions.left = Math.round( left * 100 ) + '%';
			}
			panel.$element.css( dimensions );
			i++;
			left += width;
		}
		top += height;
		left = 0;
	}

	this.emit( 'update' );
};

/**
 * Get a panel at a given position.
 *
 * The x and y position is affected by the current grid layout.
 *
 * @method
 * @param {number} x Horizontal position
 * @param {number} y Vertical position
 * @returns {OO.ui.PanelLayout} The panel at the given postion
 */
OO.ui.GridLayout.prototype.getPanel = function ( x, y ) {
	return this.panels[( x * this.widths.length ) + y];
};
/**
 * Layout containing a series of pages.
 *
 * @class
 * @extends OO.ui.Layout
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.attachPagesPanel] Whether or not to attach pagesPanel to this.$element on
 *  initialization.
 */
OO.ui.PagedLayout = function OoUiPagedLayout( config ) {
	// Initialize configuration
	config = config || {};

	// Parent constructor
	OO.ui.Layout.call( this, config );

	// Properties
	this.attached = !!config.attachPagesPanel;
	this.currentPageName = null;
	this.pages = {};
	this.pagesPanel = new OO.ui.StackPanelLayout( { '$': this.$ } );

	// Initialization
	this.$element.addClass( 'oo-ui-pagedLayout' );
	this.pagesPanel.$element.addClass( 'oo-ui-pagedLayout-pagesPanel' );

	if ( this.attached ) {
		this.$element.append( this.pagesPanel.$element );
	}
};

/* Inheritance */

OO.inheritClass( OO.ui.PagedLayout, OO.ui.Layout );

/* Events */

/**
 * @event add
 * @param {string} name The name of the page added.
 * @param {OO.ui.PanelLayout} page The page panel.
 */

/**
 * @event remove
 * @param {OO.ui.PanelLayout[]} pages An array of page panels that were removed.
 */

/**
 * @event set
 * @param {OO.ui.PanelLayout} page The page panel that is now the current page.
 */

/* Methods */

/**
 * Add a page to the layout.
 *
 * @method
 * @param {string} name Symbolic name of page
 * @param {Object} [config] Condifugration options
 * @param {number} [config.index] Specific index to insert page at
 * @param {jQuery} [config.$content] Page content
 * @fires add
 * @chainable
 */
OO.ui.PagedLayout.prototype.addPage = function ( name, config ) {
	var page = new OO.ui.PanelLayout( { '$': this.$, 'scrollable': true } );

	config = config || {};

	if ( config.$content ) {
		page.$element.append( config.$content );
	}

	this.pages[name] = page;
	this.pagesPanel.addItems( [ page ], config.index );
	this.emit( 'add', name, page );

	return this;
};

/**
 * Clear all pages from the layout.
 *
 * @method
 * @fires remove
 * @chainable
 */
OO.ui.PagedLayout.prototype.clearPages = function () {
	var pages = this.pagesPanel.getItems();

	this.currentPageName = null;
	this.pages = {};
	this.pagesPanel.clearItems();
	this.emit( 'remove', pages );

	return this;
};

/**
 * Get a page by name.
 *
 * @method
 * @param {string} name Symbolic name of page
 * @returns {OO.ui.PanelLayout|undefined} Page, if found
 */
OO.ui.PagedLayout.prototype.getPage = function ( name ) {
	return this.pages[name];
};


/**
 * Get the current page name.
 *
 * @method
 * @returns {string|null} Current page name
 */
OO.ui.PagedLayout.prototype.getPageName = function () {
	return this.currentPageName;
};

/**
 * Remove a page from the layout.
 *
 * @method
 * @fires remove
 * @chainable
 */
OO.ui.PagedLayout.prototype.removePage = function ( name ) {
	var page = this.pages[name];

	if ( page ) {
		page = [ page ];
		delete this.pages[name];
		this.pagesPanel.removeItems( page );
		this.emit( 'remove', page );
	}

	return this;
};

/**
 * Set the current page by name.
 *
 * @method
 * @fires set
 * @param {string} name Symbolic name of page
 */
OO.ui.PagedLayout.prototype.setPage = function ( name ) {
	var page = this.pages[name];

	if ( page ) {
		this.currentPageName = name;
		this.pagesPanel.showItem( page );
		this.emit( 'set', page );
	}
};
/**
 * Layout containing a series of pages and an outline controlling their visibility.
 *
 * The outline takes up the left third, the pages taking up the remaining two-thirds on the right.
 *
 * @class
 * @extends OO.ui.PagedLayout
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.editable] Show controls for adding, removing and reordering items in
 *  the outline
 * @param {Object[]} [config.adders] List of adders for controls, each an object with name, icon
 *  and title properties
 */
OO.ui.PagedOutlineLayout = function OoUiPagedOutlineLayout( config ) {
	// Initialize configuration
	config = config || {};
	config.attachPagesPanel = false;

	// Parent constructor
	OO.ui.PagedLayout.call( this, config );

	// Properties
	this.adders = config.adders || null;
	this.editable = !!config.editable;
	this.outlineControlsWidget = null;
	this.outlinePanel = new OO.ui.PanelLayout( { '$': this.$, 'scrollable': true } );
	this.outlineWidget = new OO.ui.OutlineWidget( { '$': this.$ } );
	this.gridLayout = new OO.ui.GridLayout(
		[this.outlinePanel, this.pagesPanel], { '$': this.$, 'widths': [1, 2] }
	);

	if ( this.editable ) {
		this.outlineControlsWidget = new OO.ui.OutlineControlsWidget(
			this.outlineWidget, { '$': this.$, 'adders': this.adders }
		);
	}

	// Events
	this.outlineWidget.connect( this, { 'select': 'onPageOutlineSelect' } );
	this.pagesPanel.connect( this, { 'set': 'onPagedLayoutSet' } );

	// Initialization
	this.outlinePanel.$element
		.addClass( 'oo-ui-pagedOutlineLayout-outlinePanel' )
		.append( this.outlineWidget.$element );

	if ( this.editable ) {
		this.outlinePanel.$element
			.addClass( 'oo-ui-pagedOutlineLayout-outlinePanel-editable' )
			.append( this.outlineControlsWidget.$element );
	}

	this.$element
		.addClass( 'oo-ui-pagedOutlineLayout' )
		.append( this.gridLayout.$element );
};

/* Inheritance */

OO.inheritClass( OO.ui.PagedOutlineLayout, OO.ui.PagedLayout );

/* Methods */

/**
 * Add a page to the layout.
 *
 * @method
 * @param {string} name Symbolic name of page
 * @param {Object} [config] Condifugration options
 * @param {jQuery|string} [config.label=name] Page label
 * @param {string} [config.icon] Symbolic name of icon
 * @param {number} [config.level=0] Indentation level
 * @param {number} [config.index] Specific index to insert page at
 * @param {jQuery} [config.$content] Page content
 * @param {jQuery} [config.moveable] Allow page to be moved in the outline
 * @chainable
 */
OO.ui.PagedOutlineLayout.prototype.addPage = function ( name, config ) {
	config = config || {};

	this.outlineWidget.addItems(
		[
			new OO.ui.OutlineItemWidget( name, {
				'$': this.$,
				'label': config.label || name,
				'level': config.level || 0,
				'icon': config.icon,
				'moveable': config.moveable
			} )
		],
		config.index
	);

	this.updateOutlineWidget();

	// Parent method
	return OO.ui.PagedLayout.prototype.addPage.call( this, name, config );
};

/**
 * Clear all pages.
 *
 * @method
 * @chainable
 */
OO.ui.PagedOutlineLayout.prototype.clearPages = function () {
	this.outlineWidget.clearItems();

	// Parent method
	return OO.ui.PagedLayout.prototype.clearPages.call( this );
};

/**
 * Get the outline widget.
 *
 * @method
 * @returns {OO.ui.OutlineWidget} The outline widget.
 */
OO.ui.PagedOutlineLayout.prototype.getOutline = function () {
	return this.outlineWidget;
};

/**
 * Get the outline controls widget. If the outline is not editable, null is returned.
 *
 * @method
 * @returns {OO.ui.OutlineControlsWidget|null} The outline controls widget.
 */
OO.ui.PagedOutlineLayout.prototype.getOutlineControls = function () {
	return this.outlineControlsWidget;
};

/**
 * Handle PagedLayout set events.
 *
 * @method
 * @param {OO.ui.PanelLayout} page The page panel that is now the current panel.
 */
OO.ui.PagedOutlineLayout.prototype.onPagedLayoutSet = function ( page ) {
	page.$element.find( ':input:first' ).focus();
};

/**
 * Handle outline select events.
 *
 * @method
 * @param {OO.ui.OptionWidget} item Selected item
 */
OO.ui.PagedOutlineLayout.prototype.onPageOutlineSelect = function ( item ) {
	if ( item ) {
		OO.ui.PagedLayout.prototype.setPage.call( this, item.getData() );
	}
};

/**
 * Remove a page.
 *
 * @method
 * @chainable
 */
OO.ui.PagedOutlineLayout.prototype.removePage = function ( name ) {
	var page = this.pages[name];

	if ( page ) {
		this.outlineWidget.removeItems( [ this.outlineWidget.getItemFromData( name ) ] );
		this.updateOutlineWidget();
	}

	// Parent method
	return OO.ui.PagedLayout.prototype.removePage.call( this, name );
};

/**
 * Call this after adding or removing items from the OutlineWidget.
 *
 * @method
 * @chainable
 */
OO.ui.PagedOutlineLayout.prototype.updateOutlineWidget = function () {
	// Auto-select first item when nothing is selected anymore
	if ( !this.outlineWidget.getSelectedItem() ) {
		this.outlineWidget.selectItem( this.outlineWidget.getFirstSelectableItem() );
	}

	return this;
};

/**
 * @inheritdoc
 */
OO.ui.PagedOutlineLayout.prototype.setPage = function ( name ) {
	if ( name !== this.outlineWidget.getSelectedItem().getData() ) {
		this.outlineWidget.selectItem( this.outlineWidget.getItemFromData( name ) );
	}
};
/**
 * Layout that expands to cover the entire area of its parent, with optional scrolling and padding.
 *
 * @class
 * @extends OO.ui.Layout
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [scrollable] Allow vertical scrolling
 * @cfg {boolean} [padded] Pad the content from the edges
 */
OO.ui.PanelLayout = function OoUiPanelLayout( config ) {
	// Config initialization
	config = config || {};

	// Parent constructor
	OO.ui.Layout.call( this, config );

	// Initialization
	this.$element.addClass( 'oo-ui-panelLayout' );
	if ( config.scrollable ) {
		this.$element.addClass( 'oo-ui-panelLayout-scrollable' );
	}

	if ( config.padded ) {
		this.$element.addClass( 'oo-ui-panelLayout-padded' );
	}

	// Add directionality class:
	this.$element.addClass( 'oo-ui-' + OO.ui.Element.getDir( this.$.context ) );
};

/* Inheritance */

OO.inheritClass( OO.ui.PanelLayout, OO.ui.Layout );
/**
 * Layout containing a series of mutually exclusive pages.
 *
 * @class
 * @extends OO.ui.PanelLayout
 * @mixins OO.ui.GroupElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {string} [icon=''] Symbolic icon name
 */
OO.ui.StackPanelLayout = function OoUiStackPanelLayout( config ) {
	// Config initialization
	config = $.extend( { 'scrollable': true }, config );

	// Parent constructor
	OO.ui.PanelLayout.call( this, config );

	// Mixin constructors
	OO.ui.GroupElement.call( this, this.$element, config );

	// Properties
	this.currentItem = null;

	// Initialization
	this.$element.addClass( 'oo-ui-stackPanelLayout' );
};

/* Inheritance */

OO.inheritClass( OO.ui.StackPanelLayout, OO.ui.PanelLayout );

OO.mixinClass( OO.ui.StackPanelLayout, OO.ui.GroupElement );

/* Methods */

/**
 * Add items.
 *
 * Adding an existing item (by value) will move it.
 *
 * @method
 * @param {OO.ui.PanelLayout[]} items Items to add
 * @param {number} [index] Index to insert items after
 * @chainable
 */
OO.ui.StackPanelLayout.prototype.addItems = function ( items, index ) {
	var i, len;

	for ( i = 0, len = items.length; i < len; i++ ) {
		if ( !this.currentItem ) {
			this.showItem( items[i] );
		} else {
			items[i].$element.hide();
		}
	}
	OO.ui.GroupElement.prototype.addItems.call( this, items, index );

	return this;
};

/**
 * Remove items.
 *
 * Items will be detached, not removed, so they can be used later.
 *
 * @method
 * @param {OO.ui.PanelLayout[]} items Items to remove
 * @chainable
 */
OO.ui.StackPanelLayout.prototype.removeItems = function ( items ) {
	OO.ui.GroupElement.prototype.removeItems.call( this, items );
	if ( items.indexOf( this.currentItem ) !== -1 ) {
		this.currentItem = null;
		if ( !this.currentItem && this.items.length ) {
			this.showItem( this.items[0] );
		}
	}

	return this;
};

/**
 * Clear all items.
 *
 * Items will be detached, not removed, so they can be used later.
 *
 * @method
 * @chainable
 */
OO.ui.StackPanelLayout.prototype.clearItems = function () {
	this.currentItem = null;
	OO.ui.GroupElement.prototype.clearItems.call( this );

	return this;
};

/**
 * Show item.
 *
 * Any currently shown item will be hidden.
 *
 * @method
 * @param {OO.ui.PanelLayout} item Item to show
 * @chainable
 */
OO.ui.StackPanelLayout.prototype.showItem = function ( item ) {
	this.$items.hide();
	item.$element.show();
	this.currentItem = item;

	return this;
};
/**
 * Horizontal bar layout of tools as icon buttons.
 *
 * @class
 * @abstract
 * @extends OO.ui.ToolGroup
 *
 * @constructor
 * @param {OO.ui.Toolbar} toolbar
 * @param {Object} [config] Configuration options
 */
OO.ui.BarToolGroup = function OoUiBarToolGroup( toolbar, config ) {
	// Parent constructor
	OO.ui.ToolGroup.call( this, toolbar, config );

	// Initialization
	this.$element.addClass( 'oo-ui-barToolGroup' );
};

/* Inheritance */

OO.inheritClass( OO.ui.BarToolGroup, OO.ui.ToolGroup );

/* Static Properties */

OO.ui.BarToolGroup.static.labelTooltips = true;

OO.ui.BarToolGroup.static.accelTooltips = true;
/**
 * Popup list of tools with an icon and optional label.
 *
 * @class
 * @abstract
 * @extends OO.ui.ToolGroup
 * @mixins OO.ui.IconedElement
 * @mixins OO.ui.LabeledElement
 * @mixins OO.ui.ClippableElement
 *
 * @constructor
 * @param {OO.ui.Toolbar} toolbar
 * @param {Object} [config] Configuration options
 */
OO.ui.PopupToolGroup = function OoUiPopupToolGroup( toolbar, config ) {
	// Configuration initialization
	config = $.extend( { 'icon': 'down' }, config );

	// Parent constructor
	OO.ui.ToolGroup.call( this, toolbar, config );

	// Mixin constructors
	OO.ui.IconedElement.call( this, this.$( '<span>' ), config );
	OO.ui.LabeledElement.call( this, this.$( '<span>' ) );
	OO.ui.ClippableElement.call( this, this.$group );

	// Properties
	this.active = false;
	this.dragging = false;
	this.onBlurHandler = OO.ui.bind( this.onBlur, this );
	this.$handle = this.$( '<span>' );

	// Events
	this.$handle.on( {
		'mousedown': OO.ui.bind( this.onHandleMouseDown, this ),
		'mouseup': OO.ui.bind( this.onHandleMouseUp, this )
	} );

	// Initialization
	this.$handle
		.addClass( 'oo-ui-popupToolGroup-handle' )
		.append( this.$label, this.$icon );
	this.$element
		.addClass( 'oo-ui-popupToolGroup' )
		.prepend( this.$handle );
	this.setLabel( config.label ? OO.ui.msg( config.label ) : '' );
};

/* Inheritance */

OO.inheritClass( OO.ui.PopupToolGroup, OO.ui.ToolGroup );

OO.mixinClass( OO.ui.PopupToolGroup, OO.ui.IconedElement );
OO.mixinClass( OO.ui.PopupToolGroup, OO.ui.LabeledElement );
OO.mixinClass( OO.ui.PopupToolGroup, OO.ui.ClippableElement );

/* Static Properties */

/* Methods */

/**
 * Handle focus being lost.
 *
 * The event is actually generated from a mouseup, so it is not a normal blur event object.
 *
 * @method
 * @param {jQuery.Event} e Mouse up event
 */
OO.ui.PopupToolGroup.prototype.onBlur = function ( e ) {
	// Only deactivate when clicking outside the dropdown element
	if ( this.$( e.target ).closest( '.oo-ui-popupToolGroup' )[0] !== this.$element[0] ) {
		this.setActive( false );
	}
};

/**
 * @inheritdoc
 */
OO.ui.PopupToolGroup.prototype.onMouseUp = function ( e ) {
	this.setActive( false );
	return OO.ui.ToolGroup.prototype.onMouseUp.call( this, e );
};

/**
 * @inheritdoc
 */
OO.ui.PopupToolGroup.prototype.onMouseDown = function ( e ) {
	return OO.ui.ToolGroup.prototype.onMouseDown.call( this, e );
};

/**
 * Handle mouse up events.
 *
 * @method
 * @param {jQuery.Event} e Mouse up event
 */
OO.ui.PopupToolGroup.prototype.onHandleMouseUp = function () {
	return false;
};

/**
 * Handle mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
OO.ui.PopupToolGroup.prototype.onHandleMouseDown = function ( e ) {
	if ( !this.disabled && e.which === 1 ) {
		this.setActive( !this.active );
	}
	return false;
};

/**
 * Switch into active mode.
 *
 * When active, mouseup events anywhere in the document will trigger deactivation.
 *
 * @method
 */
OO.ui.PopupToolGroup.prototype.setActive = function ( value ) {
	value = !!value;
	if ( this.active !== value ) {
		this.active = value;
		if ( value ) {
			this.setClipping( true );
			this.$element.addClass( 'oo-ui-popupToolGroup-active' );
			this.getElementDocument().addEventListener( 'mouseup', this.onBlurHandler, true );
		} else {
			this.setClipping( false );
			this.$element.removeClass( 'oo-ui-popupToolGroup-active' );
			this.getElementDocument().removeEventListener( 'mouseup', this.onBlurHandler, true );
		}
	}
};
/**
 * Drop down list layout of tools as labeled icon buttons.
 *
 * @class
 * @abstract
 * @extends OO.ui.PopupToolGroup
 *
 * @constructor
 * @param {OO.ui.Toolbar} toolbar
 * @param {Object} [config] Configuration options
 */
OO.ui.ListToolGroup = function OoUiListToolGroup( toolbar, config ) {
	// Parent constructor
	OO.ui.PopupToolGroup.call( this, toolbar, config );

	// Initialization
	this.$element.addClass( 'oo-ui-listToolGroup' );
};

/* Inheritance */

OO.inheritClass( OO.ui.ListToolGroup, OO.ui.PopupToolGroup );

/* Static Properties */

OO.ui.ListToolGroup.static.accelTooltips = true;
/**
 * Drop down menu layout of tools as selectable menu items.
 *
 * @class
 * @abstract
 * @extends OO.ui.PopupToolGroup
 *
 * @constructor
 * @param {OO.ui.Toolbar} toolbar
 * @param {Object} [config] Configuration options
 */
OO.ui.MenuToolGroup = function OoUiMenuToolGroup( toolbar, config ) {
	// Parent constructor
	OO.ui.PopupToolGroup.call( this, toolbar, config );

	// Events
	this.toolbar.connect( this, { 'updateState': 'onUpdateState' } );

	// Initialization
	this.$element.addClass( 'oo-ui-menuToolGroup' );
};

/* Inheritance */

OO.inheritClass( OO.ui.MenuToolGroup, OO.ui.PopupToolGroup );

/* Static Properties */

OO.ui.MenuToolGroup.static.accelTooltips = true;

/* Methods */

/**
 * Handle the toolbar state being updated.
 *
 * When the state changes, the title of each active item in the menu will be joined together and
 * used as a label for the group. The label will be empty if none of the items are active.
 *
 * @method
 */
OO.ui.MenuToolGroup.prototype.onUpdateState = function () {
	var name,
		labelTexts = [];

	for ( name in this.tools ) {
		if ( this.tools[name].isActive() ) {
			labelTexts.push( this.tools[name].$label.find( '.oo-ui-tool-title' ).text() );
		}
	}

	this.setLabel( labelTexts.join( ', ' ) );
};
/**
 * UserInterface popup tool.
 *
 * @abstract
 * @class
 * @extends OO.ui.Tool
 * @mixins OO.ui.PopuppableElement
 *
 * @constructor
 * @param {OO.ui.Toolbar} toolbar
 * @param {Object} [config] Configuration options
 */
OO.ui.PopupTool = function OoUiPopupTool( toolbar, config ) {
	// Parent constructor
	OO.ui.Tool.call( this, toolbar, config );

	// Mixin constructors
	OO.ui.PopuppableElement.call( this, config );

	// Initialization
	this.$element
		.addClass( 'oo-ui-popupTool' )
		.append( this.popup.$element );
};

/* Inheritance */

OO.inheritClass( OO.ui.PopupTool, OO.ui.Tool );

OO.mixinClass( OO.ui.PopupTool, OO.ui.PopuppableElement );

/* Methods */

/**
 * Handle the tool being selected.
 *
 * @inheritdoc
 */
OO.ui.PopupTool.prototype.onSelect = function () {
	if ( !this.disabled ) {
		if ( this.popup.isVisible() ) {
			this.hidePopup();
		} else {
			this.showPopup();
		}
	}
	this.setActive( false );
	return false;
};

/**
 * Handle the toolbar state being updated.
 *
 * @inheritdoc
 */
OO.ui.PopupTool.prototype.onUpdateState = function () {
	this.setActive( false );
};
/**
 * Creates an OO.ui.ButtonWidget object.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 * @mixins OO.ui.FlaggableElement
 * @mixins OO.ui.LabeledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {number} [tabIndex] Button's tab index
 * @cfg {string} [title=''] Title text
 * @cfg {string} [href] Hyperlink to visit when clicked
 * @cfg {string} [target] Target to open hyperlink in
 */
OO.ui.ButtonWidget = function OoUiButtonWidget( config ) {
	// Configuration initialization
	config = $.extend( { 'target': '_blank' }, config );

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.FlaggableElement.call( this, config );
	OO.ui.LabeledElement.call( this, this.$( '<span>' ), config );
	OO.ui.IconedElement.call( this, this.$( '<span>' ), config );

	// Properties
	this.$button = this.$( '<a>' );
	this.isHyperlink = typeof config.href === 'string';
	this.tabIndex = null;

	// Events
	this.$button.on( {
		'mousedown': OO.ui.bind( this.onMouseDown, this ),
		'mouseup': OO.ui.bind( this.onMouseUp, this ),
		'click': OO.ui.bind( this.onClick, this ),
		'keypress': OO.ui.bind( this.onKeyPress, this )
	} );

	// Initialization
	this.$button
		.addClass( 'oo-ui-buttonWidget-button' )
		.append( this.$label )
		.attr( {
			'role': 'button',
			'title': config.title,
			'href': config.href,
			'target': config.target
		} )
		.prop( 'tabIndex', config.tabIndex || 0 );
	this.$element
		.addClass( 'oo-ui-buttonWidget' )
		.append( this.$button );
};

/* Inheritance */

OO.inheritClass( OO.ui.ButtonWidget, OO.ui.Widget );

OO.mixinClass( OO.ui.ButtonWidget, OO.ui.FlaggableElement );
OO.mixinClass( OO.ui.ButtonWidget, OO.ui.LabeledElement );

/* Events */

/**
 * @event click
 */

/* Methods */

/**
 * Handles mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
OO.ui.ButtonWidget.prototype.onMouseDown = function () {
	this.tabIndex = this.$button.attr( 'tabIndex' );
	// Remove the tab-index while the button is down to prevent the button from stealing focus
	this.$button.removeAttr( 'tabIndex' );
};

/**
 * Handles mouse up events.
 *
 * @method
 * @param {jQuery.Event} e Mouse up event
 */
OO.ui.ButtonWidget.prototype.onMouseUp = function () {
	// Restore the tab-index after the button is up to restore the button's accesssibility
	this.$button.attr( 'tabIndex', this.tabIndex );
};

/**
 * Handles mouse click events.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 * @fires click
 */
OO.ui.ButtonWidget.prototype.onClick = function () {
	if ( !this.disabled ) {
		this.emit( 'click' );
		if ( this.isHyperlink ) {
			return true;
		}
	}
	return false;
};

/**
 * Handles keypress events.
 *
 * @method
 * @param {jQuery.Event} e Keypress event
 * @fires click
 */
OO.ui.ButtonWidget.prototype.onKeyPress = function ( e ) {
	if ( !this.disabled && e.which === OO.ui.Keys.SPACE ) {
		if ( this.isHyperlink ) {
			this.onClick();
			return true;
		}
	}
	return false;
};
/**
 * Creates an OO.ui.IconButtonWidget object.
 *
 * @class
 * @extends OO.ui.ButtonWidget
 * @mixins OO.ui.IconedElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.IconButtonWidget = function OoUiIconButtonWidget( config ) {
	// Parent constructor
	OO.ui.ButtonWidget.call( this, config );

	// Mixin constructors
	OO.ui.IconedElement.call( this, this.$( '<span>' ), config );

	// Initialization
	this.$button.prepend( this.$icon );
	this.$element.addClass( 'oo-ui-iconButtonWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.IconButtonWidget, OO.ui.ButtonWidget );

OO.mixinClass( OO.ui.IconButtonWidget, OO.ui.IconedElement );

/* Static Properties */

OO.ui.IconButtonWidget.static.emptyHtml = '';
/**
 * Creates an OO.ui.InputWidget object.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {string} [name=''] HTML input name
 * @cfg {string} [value=''] Input value
 * @cfg {boolean} [readOnly=false] Prevent changes
 * @cfg {Function} [inputFilter] Filter function to apply to the input. Takes a string argument and returns a string.
 */
OO.ui.InputWidget = function OoUiInputWidget( config ) {
	// Config intialization
	config = $.extend( { 'readOnly': false }, config );

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Properties
	this.$input = this.getInputElement( config );
	this.value = '';
	this.readonly = false;
	this.inputFilter = config.inputFilter;

	// Events
	this.$input.on( 'keydown mouseup cut paste change input select', OO.ui.bind( this.onEdit, this ) );

	// Initialization
	this.$input.attr( 'name', config.name );
	this.setReadOnly( config.readOnly );
	this.$element.addClass( 'oo-ui-inputWidget' ).append( this.$input );
	this.setValue( config.value );
};

/* Inheritance */

OO.inheritClass( OO.ui.InputWidget, OO.ui.Widget );

/* Events */

/**
 * @event change
 * @param value
 */

/* Methods */

/**
 * Get input element.
 *
 * @method
 * @param {Object} [config] Configuration options
 * @returns {jQuery} Input element
 */
OO.ui.InputWidget.prototype.getInputElement = function () {
	return this.$( '<input>' );
};

/**
 * Handle potentially value-changing events.
 *
 * @method
 * @param {jQuery.Event} e Key down, mouse up, cut, paste, change, input, or select event
 */
OO.ui.InputWidget.prototype.onEdit = function () {
	if ( !this.disabled ) {
		// Allow the stack to clear so the value will be updated
		setTimeout( OO.ui.bind( function () {
			this.setValue( this.$input.val() );
		}, this ) );
	}
};

/**
 * Get the value of the input.
 *
 * @method
 * @returns {string} Input value
 */
OO.ui.InputWidget.prototype.getValue = function () {
	return this.value;
};

/**
 * Sets the direction of the current input, either RTL or LTR
 *
 * @method
 * @param {boolean} isRTL
 */
OO.ui.InputWidget.prototype.setRTL = function ( isRTL ) {
	if ( isRTL ) {
		this.$input.removeClass( 'oo-ui-ltr' );
		this.$input.addClass( 'oo-ui-rtl' );
	} else {
		this.$input.removeClass( 'oo-ui-rtl' );
		this.$input.addClass( 'oo-ui-ltr' );
	}
};

/**
 * Set the value of the input.
 *
 * @method
 * @param {string} value New value
 * @fires change
 * @chainable
 */
OO.ui.InputWidget.prototype.setValue = function ( value ) {
	value = this.sanitizeValue( value );
	if ( this.value !== value ) {
		this.value = value;
		this.emit( 'change', this.value );
	}
	// Update the DOM if it has changed. Note that with sanitizeValue, it
	// is possible for the DOM value to change without this.value changing.
	if ( this.$input.val() !== this.value ) {
		this.$input.val( this.value );
	}
	return this;
};

/**
 * Sanitize incoming value.
 *
 * Ensures value is a string, and converts undefined and null to empty strings.
 *
 * @method
 * @param {string} value Original value
 * @returns {string} Sanitized value
 */
OO.ui.InputWidget.prototype.sanitizeValue = function ( value ) {
	if ( value === undefined || value === null ) {
		return '';
	} else if ( this.inputFilter ) {
		return this.inputFilter( String( value ) );
	} else {
		return String( value );
	}
};

/**
 * Check if the widget is read-only.
 *
 * @method
 * @param {boolean} Input is read-only
 */
OO.ui.InputWidget.prototype.isReadOnly = function () {
	return this.readOnly;
};

/**
 * Set the read-only state of the widget.
 *
 * This should probably change the widgets's appearance and prevent it from being used.
 *
 * @method
 * @param {boolean} state Make input read-only
 * @chainable
 */
OO.ui.InputWidget.prototype.setReadOnly = function ( state ) {
	this.readOnly = !!state;
	this.$input.prop( 'readonly', this.readOnly );
	return this;
};
/**
 * Creates an OO.ui.InputLabelWidget object.
 *
 * CSS classes will be added to the button for each flag, each prefixed with 'oo-ui-InputLabelWidget-'
 *
 * @class
 * @extends OO.ui.Widget
 * @mixins OO.ui.LabeledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {OO.ui.InputWidget|null} [input] Related input widget
 */
OO.ui.InputLabelWidget = function OoUiInputLabelWidget( config ) {
	// Config intialization
	config = $.extend( { 'input': null }, config );

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.LabeledElement.call( this, this.$element, config );

	// Properties
	this.input = config.input;

	// Events
	this.$element.on( 'click', OO.ui.bind( this.onClick, this ) );

	// Initialization
	this.$element.addClass( 'oo-ui-inputLabelWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.InputLabelWidget, OO.ui.Widget );

OO.mixinClass( OO.ui.InputLabelWidget, OO.ui.LabeledElement );

/* Static Properties */

OO.ui.InputLabelWidget.static.tagName = 'label';

/* Methods */

/**
 * Handles mouse click events.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
OO.ui.InputLabelWidget.prototype.onClick = function () {
	if ( !this.disabled && this.input ) {
		this.input.$input.focus();
	}
	return false;
};
/**
 * Lookup input widget.
 *
 * Mixin that adds a menu showing suggested values to a text input. Subclasses must handle `select`
 * events on #lookupMenu to make use of selections.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {OO.ui.TextInputWidget} input Input widget
 * @param {Object} [config] Configuration options
 * @cfg {jQuery} [$overlay=this.$( 'body' )] Overlay layer
 */
OO.ui.LookupInputWidget = function OoUiLookupInputWidget( input, config ) {
	// Config intialization
	config = config || {};

	// Properties
	this.lookupInput = input;
	this.$overlay = config.$overlay || this.$( 'body' );
	this.lookupMenu = new OO.ui.TextInputMenuWidget( this, {
		'$': OO.ui.Element.getJQuery( this.$overlay ),
		'input': this.lookupInput,
		'$container': config.$container
	} );
	this.lookupCache = {};
	this.lookupQuery = null;
	this.lookupRequest = null;

	// Events
	this.$overlay.append( this.lookupMenu.$element );

	this.lookupInput.$input.on( {
		'focus': OO.ui.bind( this.onLookupInputFocus, this ),
		'blur': OO.ui.bind( this.onLookupInputBlur, this ),
		'mousedown': OO.ui.bind( this.onLookupInputMouseDown, this )
	} );
	this.lookupInput.connect( this, { 'change': 'onLookupInputChange' } );

	// Initialization
	this.$element.addClass( 'oo-ui-lookupWidget' );
	this.lookupMenu.$element.addClass( 'oo-ui-lookupWidget-menu' );
};

/* Methods */

/**
 * Handle input focus event.
 *
 * @method
 * @param {jQuery.Event} e Input focus event
 */
OO.ui.LookupInputWidget.prototype.onLookupInputFocus = function () {
	this.openLookupMenu();
};

/**
 * Handle input blur event.
 *
 * @method
 * @param {jQuery.Event} e Input blur event
 */
OO.ui.LookupInputWidget.prototype.onLookupInputBlur = function () {
	this.lookupMenu.hide();
};

/**
 * Handle input mouse down event.
 *
 * @method
 * @param {jQuery.Event} e Input mouse down event
 */
OO.ui.LookupInputWidget.prototype.onLookupInputMouseDown = function () {
	this.openLookupMenu();
};

/**
 * Handle input change event.
 *
 * @method
 * @param {string} value New input value
 */
OO.ui.LookupInputWidget.prototype.onLookupInputChange = function () {
	this.openLookupMenu();
};

/**
 * Open the menu.
 *
 * @method
 * @chainable
 */
OO.ui.LookupInputWidget.prototype.openLookupMenu = function () {
	var value = this.lookupInput.getValue();

	if ( this.lookupMenu.$input.is( ':focus' ) && $.trim( value ) !== '' ) {
		this.populateLookupMenu();
		if ( !this.lookupMenu.isVisible() ) {
			this.lookupMenu.show();
		}
	} else {
		this.lookupMenu.hide();
	}

	return this;
};

/**
 * Populate lookup menu with current information.
 *
 * @method
 * @chainable
 */
OO.ui.LookupInputWidget.prototype.populateLookupMenu = function () {
	var items = this.getLookupMenuItems();

	this.lookupMenu.clearItems();

	if ( items.length ) {
		this.lookupMenu.show();
		this.lookupMenu.addItems( items );
		this.initializeLookupMenuSelection();
	} else {
		this.lookupMenu.hide();
	}

	return this;
};

/**
 * Set selection in the lookup menu with current information.
 *
 * @method
 * @chainable
 */
OO.ui.LookupInputWidget.prototype.initializeLookupMenuSelection = function () {
	if ( !this.lookupMenu.getSelectedItem() ) {
		this.lookupMenu.intializeSelection( this.lookupMenu.getFirstSelectableItem() );
	}
	this.lookupMenu.highlightItem( this.lookupMenu.getSelectedItem() );
};

/**
 * Get lookup menu items for the current query.
 *
 * @method
 * @returns {OO.ui.MenuItemWidget[]} Menu items
 */
OO.ui.LookupInputWidget.prototype.getLookupMenuItems = function () {
	var value = this.lookupInput.getValue();

	if ( value && value !== this.lookupQuery ) {
		// Abort current request if query has changed
		if ( this.lookupRequest ) {
			this.lookupRequest.abort();
			this.lookupQuery = null;
			this.lookupRequest = null;
		}
		if ( value in this.lookupCache ) {
			return this.getLookupMenuItemsFromData( this.lookupCache[value] );
		} else {
			this.lookupQuery = value;
			this.lookupRequest = this.getLookupRequest()
				.always( OO.ui.bind( function () {
					this.lookupQuery = null;
					this.lookupRequest = null;
				}, this ) )
				.done( OO.ui.bind( function ( data ) {
					this.lookupCache[value] = this.getLookupCacheItemFromData( data );
					this.openLookupMenu();
				}, this ) );
			this.pushPending();
			this.lookupRequest.always( OO.ui.bind( function () {
				this.popPending();
			}, this ) );
		}
	}
	return [];
};

/**
 * Get a new request object of the current lookup query value.
 *
 * @method
 * @abstract
 * @returns {jqXHR} jQuery AJAX object, or promise object with an .abort() method
 */
OO.ui.LookupInputWidget.prototype.getLookupRequest = function () {
	// Stub, implemented in subclass
	return null;
};

/**
 * Handle successful lookup request.
 *
 * Overriding methods should call #populateLookupMenu when results are available and cache results
 * for future lookups in #lookupCache as an array of #OO.ui.MenuItemWidget objects.
 *
 * @method
 * @abstract
 * @param {Mixed} data Response from server
 */
OO.ui.LookupInputWidget.prototype.onLookupRequestDone = function () {
	// Stub, implemented in subclass
};

/**
 * Get a list of menu item widgets from the data stored by the lookup request's done handler.
 *
 * @method
 * @abstract
 * @param {Mixed} data Cached result data, usually an array
 * @returns {OO.ui.MenuItemWidget[]} Menu items
 */
OO.ui.LookupInputWidget.prototype.getLookupMenuItemsFromData = function () {
	// Stub, implemented in subclass
	return [];
};
/**
 * Creates an OO.ui.OptionWidget object.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 * @mixins OO.ui.LabeledElement
 *
 * @constructor
 * @param {Mixed} data Option data
 * @param {Object} [config] Configuration options
 * @cfg {jQuery|string} [label] Option label
 * @cfg {string} [icon] Symbolic name of icon
 * @cfg {boolean} [selected=false] Select option
 * @cfg {boolean} [highlighted=false] Highlight option
 * @cfg {string} [rel] Value for `rel` attribute in DOM, allowing per-option styling
 */
OO.ui.OptionWidget = function OoUiOptionWidget( data, config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.LabeledElement.call( this, this.$( '<span>' ), config );

	// Properties
	this.data = data;
	this.selected = false;
	this.highlighted = false;

	// Initialization
	this.$element
		.data( 'oo-ui-optionWidget', this )
		.attr( 'rel', config.rel )
		.addClass( 'oo-ui-optionWidget' )
		.append( this.$label );
	this.setSelected( config.selected );
	this.setHighlighted( config.highlighted );

	// Options
	if ( config.icon ) {
		this.$icon = this.$( '<div>' )
			.addClass( 'oo-ui-optionWidget-icon oo-ui-icon-' + config.icon )
			.appendTo( this.$element );
	}
};

/* Inheritance */

OO.inheritClass( OO.ui.OptionWidget, OO.ui.Widget );

OO.mixinClass( OO.ui.OptionWidget, OO.ui.LabeledElement );

/* Static Properties */

OO.ui.OptionWidget.static.tagName = 'li';

OO.ui.OptionWidget.static.selectable = true;

OO.ui.OptionWidget.static.highlightable = true;

OO.ui.OptionWidget.static.scrollIntoViewOnSelect = false;

/* Methods */

/**
 * Check if option can be selected.
 *
 * @method
 * @returns {boolean} Item is selectable
 */
OO.ui.OptionWidget.prototype.isSelectable = function () {
	return this.constructor.static.selectable && !this.disabled;
};

/**
 * Check if option can be highlighted.
 *
 * @method
 * @returns {boolean} Item is highlightable
 */
OO.ui.OptionWidget.prototype.isHighlightable = function () {
	return this.constructor.static.highlightable && !this.disabled;
};

/**
 * Check if option is selected.
 *
 * @method
 * @returns {boolean} Item is selected
 */
OO.ui.OptionWidget.prototype.isSelected = function () {
	return this.selected;
};

/**
 * Check if option is highlighted.
 *
 * @method
 * @returns {boolean} Item is highlighted
 */
OO.ui.OptionWidget.prototype.isHighlighted = function () {
	return this.highlighted;
};

/**
 * Set selected state.
 *
 * @method
 * @param {boolean} [state=false] Select option
 * @chainable
 */
OO.ui.OptionWidget.prototype.setSelected = function ( state ) {
	if ( !this.disabled && this.constructor.static.selectable ) {
		this.selected = !!state;
		if ( this.selected ) {
			this.$element.addClass( 'oo-ui-optionWidget-selected' );
			if ( this.constructor.static.scrollIntoViewOnSelect ) {
				this.scrollElementIntoView();
			}
		} else {
			this.$element.removeClass( 'oo-ui-optionWidget-selected' );
		}
	}
	return this;
};

/**
 * Set highlighted state.
 *
 * @method
 * @param {boolean} [state=false] Highlight option
 * @chainable
 */
OO.ui.OptionWidget.prototype.setHighlighted = function ( state ) {
	if ( !this.disabled && this.constructor.static.highlightable ) {
		this.highlighted = !!state;
		if ( this.highlighted ) {
			this.$element.addClass( 'oo-ui-optionWidget-highlighted' );
		} else {
			this.$element.removeClass( 'oo-ui-optionWidget-highlighted' );
		}
	}
	return this;
};

/**
 * Make the option's highlight flash.
 *
 * @method
 * @param {Function} [done] Callback to execute when flash effect is complete.
 */
OO.ui.OptionWidget.prototype.flash = function ( done ) {
	var $this = this.$element;

	if ( !this.disabled && this.constructor.static.highlightable ) {
		$this.removeClass( 'oo-ui-optionWidget-highlighted' );
		setTimeout( OO.ui.bind( function () {
			$this.addClass( 'oo-ui-optionWidget-highlighted' );
			if ( done ) {
				setTimeout( done, 100 );
			}
		}, this ), 100 );
	}
};

/**
 * Get option data.
 *
 * @method
 * @returns {Mixed} Option data
 */
OO.ui.OptionWidget.prototype.getData = function () {
	return this.data;
};
/**
 * Create an OO.ui.SelectWidget object.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 * @mixin OO.ui.GroupElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.SelectWidget = function OoUiSelectWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.GroupElement.call( this, this.$element, config );

	// Properties
	this.pressed = false;
	this.selecting = null;
	this.hashes = {};

	// Events
	this.$element.on( {
		'mousedown': OO.ui.bind( this.onMouseDown, this ),
		'mouseup': OO.ui.bind( this.onMouseUp, this ),
		'mousemove': OO.ui.bind( this.onMouseMove, this ),
		'mouseover': OO.ui.bind( this.onMouseOver, this ),
		'mouseleave': OO.ui.bind( this.onMouseLeave, this )
	} );

	// Initialization
	this.$element.addClass( 'oo-ui-selectWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.SelectWidget, OO.ui.Widget );

OO.mixinClass( OO.ui.SelectWidget, OO.ui.GroupElement );

/* Events */

/**
 * @event highlight
 * @param {OO.ui.OptionWidget|null} item Highlighted item or null if no item is highlighted
 */

/**
 * @event select
 * @param {OO.ui.OptionWidget|null} item Selected item or null if no item is selected
 */

/**
 * @event add
 * @param {OO.ui.OptionWidget[]} items Added items
 * @param {number} index Index items were added at
 */

/**
 * @event remove
 * @param {OO.ui.OptionWidget[]} items Removed items
 */

/* Static Properties */

OO.ui.SelectWidget.static.tagName = 'ul';

/* Methods */

/**
 * Handle mouse down events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse down event
 */
OO.ui.SelectWidget.prototype.onMouseDown = function ( e ) {
	var item;

	if ( !this.disabled && e.which === 1 ) {
		this.pressed = true;
		item = this.getTargetItem( e );
		if ( item && item.isSelectable() ) {
			this.intializeSelection( item );
			this.selecting = item;
			this.$( this.$.context ).one( 'mouseup', OO.ui.bind( this.onMouseUp, this ) );
		}
	}
	return false;
};

/**
 * Handle mouse up events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse up event
 */
OO.ui.SelectWidget.prototype.onMouseUp = function ( e ) {
	var item;
	this.pressed = false;
	if ( !this.selecting ) {
		item = this.getTargetItem( e );
		if ( item && item.isSelectable() ) {
			this.selecting = item;
		}
	}
	if ( !this.disabled && e.which === 1 && this.selecting ) {
		this.selectItem( this.selecting );
		this.selecting = null;
	}
	return false;
};

/**
 * Handle mouse move events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse move event
 */
OO.ui.SelectWidget.prototype.onMouseMove = function ( e ) {
	var item;

	if ( !this.disabled && this.pressed ) {
		item = this.getTargetItem( e );
		if ( item && item !== this.selecting && item.isSelectable() ) {
			this.intializeSelection( item );
			this.selecting = item;
		}
	}
	return false;
};

/**
 * Handle mouse over events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse over event
 */
OO.ui.SelectWidget.prototype.onMouseOver = function ( e ) {
	var item;

	if ( !this.disabled ) {
		item = this.getTargetItem( e );
		if ( item && item.isHighlightable() ) {
			this.highlightItem( item );
		}
	}
	return false;
};

/**
 * Handle mouse leave events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse over event
 */
OO.ui.SelectWidget.prototype.onMouseLeave = function () {
	if ( !this.disabled ) {
		this.highlightItem();
	}
	return false;
};

/**
 * Get the closest item to a jQuery.Event.
 *
 * @method
 * @private
 * @param {jQuery.Event} e
 * @returns {OO.ui.OptionWidget|null} Outline item widget, `null` if none was found
 */
OO.ui.SelectWidget.prototype.getTargetItem = function ( e ) {
	var $item = this.$( e.target ).closest( '.oo-ui-optionWidget' );
	if ( $item.length ) {
		return $item.data( 'oo-ui-optionWidget' );
	}
	return null;
};

/**
 * Get selected item.
 *
 * @method
 * @returns {OO.ui.OptionWidget|null} Selected item, `null` if no item is selected
 */
OO.ui.SelectWidget.prototype.getSelectedItem = function () {
	var i, len;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		if ( this.items[i].isSelected() ) {
			return this.items[i];
		}
	}
	return null;
};

/**
 * Get highlighted item.
 *
 * @method
 * @returns {OO.ui.OptionWidget|null} Highlighted item, `null` if no item is highlighted
 */
OO.ui.SelectWidget.prototype.getHighlightedItem = function () {
	var i, len;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		if ( this.items[i].isHighlighted() ) {
			return this.items[i];
		}
	}
	return null;
};

/**
 * Get an existing item with equivilant data.
 *
 * @method
 * @param {Object} data Item data to search for
 * @returns {OO.ui.OptionWidget|null} Item with equivilent value, `null` if none exists
 */
OO.ui.SelectWidget.prototype.getItemFromData = function ( data ) {
	var hash = OO.getHash( data );

	if ( hash in this.hashes ) {
		return this.hashes[hash];
	}

	return null;
};

/**
 * Highlight an item.
 *
 * Highlighting is mutually exclusive.
 *
 * @method
 * @param {OO.ui.OptionWidget} [item] Item to highlight, omit to deselect all
 * @fires highlight
 * @chainable
 */
OO.ui.SelectWidget.prototype.highlightItem = function ( item ) {
	var i, len;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		this.items[i].setHighlighted( this.items[i] === item );
	}
	this.emit( 'highlight', item );

	return this;
};

/**
 * Select an item.
 *
 * @method
 * @param {OO.ui.OptionWidget} [item] Item to select, omit to deselect all
 * @fires select
 * @chainable
 */
OO.ui.SelectWidget.prototype.selectItem = function ( item ) {
	var i, len;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		this.items[i].setSelected( this.items[i] === item );
	}
	this.emit( 'select', item );

	return this;
};

/**
 * Setup selection and highlighting.
 *
 * This should be used to synchronize the UI with the model without emitting events that would in
 * turn update the model.
 *
 * @param {OO.ui.OptionWidget} [item] Item to select
 * @chainable
 */
OO.ui.SelectWidget.prototype.intializeSelection = function( item ) {
	var i, len, selected;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		selected = this.items[i] === item;
		this.items[i].setSelected( selected );
		this.items[i].setHighlighted( selected );
	}

	return this;
};

/**
 * Get an item relative to another one.
 *
 * @method
 * @param {OO.ui.OptionWidget} item Item to start at
 * @param {number} direction Direction to move in
 * @returns {OO.ui.OptionWidget|null} Item at position, `null` if there are no items in the menu
 */
OO.ui.SelectWidget.prototype.getRelativeSelectableItem = function ( item, direction ) {
	var inc = direction > 0 ? 1 : -1,
		len = this.items.length,
		index = item instanceof OO.ui.OptionWidget ?
			this.items.indexOf( item ) : ( inc > 0 ? -1 : 0 ),
		stopAt = Math.max( Math.min( index, len - 1 ), 0 ),
		i = inc > 0 ?
			// Default to 0 instead of -1, if nothing is selected let's start at the beginning
			Math.max( index, -1 ) :
			// Default to n-1 instead of -1, if nothing is selected let's start at the end
			Math.min( index, len );

	while ( true ) {
		i = ( i + inc + len ) % len;
		item = this.items[i];
		if ( item instanceof OO.ui.OptionWidget && item.isSelectable() ) {
			return item;
		}
		// Stop iterating when we've looped all the way around
		if ( i === stopAt ) {
			break;
		}
	}
	return null;
};

/**
 * Get the next selectable item.
 *
 * @method
 * @returns {OO.ui.OptionWidget|null} Item, `null` if ther aren't any selectable items
 */
OO.ui.SelectWidget.prototype.getFirstSelectableItem = function () {
	var i, len, item;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		item = this.items[i];
		if ( item instanceof OO.ui.OptionWidget && item.isSelectable() ) {
			return item;
		}
	}

	return null;
};

/**
 * Add items.
 *
 * Adding an existing item (by value) will move it.
 *
 * @method
 * @param {OO.ui.OptionWidget[]} items Items to add
 * @param {number} [index] Index to insert items after
 * @fires add
 * @chainable
 */
OO.ui.SelectWidget.prototype.addItems = function ( items, index ) {
	var i, len, item, hash;

	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];
		hash = OO.getHash( item.getData() );
		if ( hash in this.hashes ) {
			// Use existing item with the same value
			items[i] = this.hashes[hash];
		} else {
			// Add new item
			this.hashes[hash] = item;
		}
	}
	OO.ui.GroupElement.prototype.addItems.call( this, items, index );

	// Always provide an index, even if it was omitted
	this.emit( 'add', items, index === undefined ? this.items.length - items.length - 1 : index );

	return this;
};

/**
 * Remove items.
 *
 * Items will be detached, not removed, so they can be used later.
 *
 * @method
 * @param {OO.ui.OptionWidget[]} items Items to remove
 * @fires remove
 * @chainable
 */
OO.ui.SelectWidget.prototype.removeItems = function ( items ) {
	var i, len, item, hash;

	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];
		hash = OO.getHash( item.getData() );
		if ( hash in this.hashes ) {
			// Remove existing item
			delete this.hashes[hash];
		}
		if ( item.isSelected() ) {
			this.selectItem( null );
		}
	}
	OO.ui.GroupElement.prototype.removeItems.call( this, items );

	this.emit( 'remove', items );

	return this;
};

/**
 * Clear all items.
 *
 * Items will be detached, not removed, so they can be used later.
 *
 * @method
 * @fires remove
 * @chainable
 */
OO.ui.SelectWidget.prototype.clearItems = function () {
	var items = this.items.slice();

	// Clear all items
	this.hashes = {};
	OO.ui.GroupElement.prototype.clearItems.call( this );
	this.selectItem( null );

	this.emit( 'remove', items );

	return this;
};
/**
 * Creates an OO.ui.MenuItemWidget object.
 *
 * @class
 * @extends OO.ui.OptionWidget
 *
 * @constructor
 * @param {Mixed} data Item data
 * @param {Object} [config] Configuration options
 */
OO.ui.MenuItemWidget = function OoUiMenuItemWidget( data, config ) {
	// Configuration initialization
	config = $.extend( { 'icon': 'check' }, config );

	// Parent constructor
	OO.ui.OptionWidget.call( this, data, config );

	// Initialization
	this.$element.addClass( 'oo-ui-menuItemWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.MenuItemWidget, OO.ui.OptionWidget );
/**
 * Create an OO.ui.MenuWidget object.
 *
 * @class
 * @extends OO.ui.SelectWidget
 * @mixins OO.ui.ClippableElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {OO.ui.InputWidget} [input] Input to bind keyboard handlers to
 */
OO.ui.MenuWidget = function OoUiMenuWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	OO.ui.SelectWidget.call( this, config );

	// Mixin constructor
	OO.ui.ClippableElement.call( this, this.$group );

	// Properties
	this.newItems = [];
	this.$input = config.input ? config.input.$input : null;
	this.$previousFocus = null;
	this.isolated = !config.input;
	this.visible = false;
	this.onKeyDownHandler = OO.ui.bind( this.onKeyDown, this );

	// Initialization
	this.$element.hide().addClass( 'oo-ui-menuWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.MenuWidget, OO.ui.SelectWidget );

OO.mixinClass( OO.ui.MenuWidget, OO.ui.ClippableElement );

/* Methods */

/**
 * Handles key down events.
 *
 * @method
 * @param {jQuery.Event} e Key down event
 */
OO.ui.MenuWidget.prototype.onKeyDown = function ( e ) {
	var nextItem,
		handled = false,
		highlightItem = this.getHighlightedItem();

	if ( !this.disabled && this.visible ) {
		if ( !highlightItem ) {
			highlightItem = this.getSelectedItem();
		}
		switch ( e.keyCode ) {
			case OO.ui.Keys.ENTER:
				this.selectItem( highlightItem );
				handled = true;
				break;
			case OO.ui.Keys.UP:
				nextItem = this.getRelativeSelectableItem( highlightItem, -1 );
				handled = true;
				break;
			case OO.ui.Keys.DOWN:
				nextItem = this.getRelativeSelectableItem( highlightItem, 1 );
				handled = true;
				break;
			case OO.ui.Keys.ESCAPE:
				if ( highlightItem ) {
					highlightItem.setHighlighted( false );
				}
				this.hide();
				handled = true;
				break;
		}

		if ( nextItem ) {
			this.highlightItem( nextItem );
			nextItem.scrollElementIntoView();
		}

		if ( handled ) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}
};

/**
 * Check if the menu is visible.
 *
 * @method
 * @returns {boolean} Menu is visible
 */
OO.ui.MenuWidget.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Bind key down listener
 *
 * @method
 */
OO.ui.MenuWidget.prototype.bindKeyDownListener = function () {
	if ( this.$input ) {
		this.$input.on( 'keydown', this.onKeyDownHandler );
	} else {
		// Capture menu navigation keys
		this.getElementWindow().addEventListener( 'keydown', this.onKeyDownHandler, true );
	}
};

/**
 * Unbind key down listener
 *
 * @method
 */
OO.ui.MenuWidget.prototype.unbindKeyDownListener = function () {
	if ( this.$input ) {
		this.$input.off( 'keydown' );
	} else {
		this.getElementWindow().removeEventListener( 'keydown', this.onKeyDownHandler, true );
	}
};

/**
 * Select an item.
 *
 * The menu will stay open if an item is silently selected.
 *
 * @method
 * @param {OO.ui.OptionWidget} [item] Item to select, omit to deselect all
 * @chainable
 */
OO.ui.MenuWidget.prototype.selectItem = function ( item ) {
	// Parent method
	OO.ui.SelectWidget.prototype.selectItem.call( this, item );

	if ( !this.disabled ) {
		if ( item ) {
			this.disabled = true;
			item.flash( OO.ui.bind( function () {
				this.hide();
				this.disabled = false;
			}, this ) );
		} else {
			this.hide();
		}
	}

	return this;
};

/**
 * Add items.
 *
 * Adding an existing item (by value) will move it.
 *
 * @method
 * @param {OO.ui.MenuItemWidget[]} items Items to add
 * @param {number} [index] Index to insert items after
 * @chainable
 */
OO.ui.MenuWidget.prototype.addItems = function ( items, index ) {
	var i, len, item;

	// Parent method
	OO.ui.SelectWidget.prototype.addItems.call( this, items, index );

	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];
		if ( this.visible ) {
			// Defer fitting label until
			item.fitLabel();
		} else {
			this.newItems.push( item );
		}
	}

	return this;
};

/**
 * Show the menu.
 *
 * @method
 * @chainable
 */
OO.ui.MenuWidget.prototype.show = function () {
	var i, len;

	if ( this.items.length ) {
		this.$element.show();
		this.visible = true;
		this.bindKeyDownListener();

		// Change focus to enable keyboard navigation
		if ( this.isolated && this.$input && !this.$input.is( ':focus' ) ) {
			this.$previousFocus = this.$( ':focus' );
			this.$input.focus();
		}
		if ( this.newItems.length ) {
			for ( i = 0, len = this.newItems.length; i < len; i++ ) {
				this.newItems[i].fitLabel();
			}
			this.newItems = [];
		}

		this.setClipping( true );
	}

	return this;
};

/**
 * Hide the menu.
 *
 * @method
 * @chainable
 */
OO.ui.MenuWidget.prototype.hide = function () {
	this.$element.hide();
	this.visible = false;
	this.unbindKeyDownListener();

	if ( this.isolated && this.$previousFocus ) {
		this.$previousFocus.focus();
		this.$previousFocus = null;
	}

	this.setClipping( false );

	return this;
};
/**
 * Creates an OO.ui.MenuSectionItemWidget object.
 *
 * @class
 * @extends OO.ui.OptionWidget
 *
 * @constructor
 * @param {Mixed} data Item data
 * @param {Object} [config] Configuration options
 */
OO.ui.MenuSectionItemWidget = function OoUiMenuSectionItemWidget( data, config ) {
	// Parent constructor
	OO.ui.OptionWidget.call( this, data, config );

	// Initialization
	this.$element.addClass( 'oo-ui-menuSectionItemWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.MenuSectionItemWidget, OO.ui.OptionWidget );

OO.ui.MenuSectionItemWidget.static.selectable = false;

OO.ui.MenuSectionItemWidget.static.highlightable = false;
/**
 * Create an OO.ui.OutlineWidget object.
 *
 * @class
 * @extends OO.ui.SelectWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.OutlineWidget = function OoUiOutlineWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	OO.ui.SelectWidget.call( this, config );

	// Initialization
	this.$element.addClass( 'oo-ui-outlineWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.OutlineWidget, OO.ui.SelectWidget );
/**
 * Creates an OO.ui.OutlineControlsWidget object.
 *
 * @class
 *
 * @constructor
 * @param {OO.ui.OutlineWidget} outline Outline to control
 * @param {Object} [config] Configuration options
 * @cfg {Object[]} [adders] List of icons to show as addable item types, each an object with
 *  name, title and icon properties
 */
OO.ui.OutlineControlsWidget = function OoUiOutlineControlsWidget( outline, config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Properties
	this.outline = outline;
	this.adders = {};
	this.$adders = this.$( '<div>' );
	this.$movers = this.$( '<div>' );
	this.addButton = new OO.ui.IconButtonWidget( { '$': this.$, 'icon': 'add-item' } );
	this.upButton = new OO.ui.IconButtonWidget( {
		'$': this.$, 'icon': 'collapse', 'title': OO.ui.msg( 'ooui-outline-control-move-up' )
	} );
	this.downButton = new OO.ui.IconButtonWidget( {
		'$': this.$, 'icon': 'expand', 'title': OO.ui.msg( 'ooui-outline-control-move-down' )
	} );

	// Events
	outline.connect( this, {
		'select': 'onOutlineChange',
		'add': 'onOutlineChange',
		'remove': 'onOutlineChange'
	} );
	this.upButton.connect( this, { 'click': ['emit', 'move', -1] } );
	this.downButton.connect( this, { 'click': ['emit', 'move', 1] } );

	// Initialization
	this.$element.addClass( 'oo-ui-outlineControlsWidget' );
	this.$adders.addClass( 'oo-ui-outlineControlsWidget-adders' );
	this.$movers
		.addClass( 'oo-ui-outlineControlsWidget-movers' )
		.append( this.upButton.$element, this.downButton.$element );
	this.$element.append( this.$adders, this.$movers );
	if ( config.adders && config.adders.length ) {
		this.setupAdders( config.adders );
	}
};

/* Inheritance */

OO.inheritClass( OO.ui.OutlineControlsWidget, OO.ui.Widget );

/* Events */

/**
 * @event move
 * @param {number} places Number of places to move
 */

/* Methods */

/**
 * Handle outline change events.
 *
 * @method
 */
OO.ui.OutlineControlsWidget.prototype.onOutlineChange = function () {
	var i, len, firstMoveable, lastMoveable,
		moveable = false,
		items = this.outline.getItems(),
		selectedItem = this.outline.getSelectedItem();

	if ( selectedItem && selectedItem.isMoveable() ) {
		moveable = true;
		i = -1;
		len = items.length;
		while ( ++i < len ) {
			if ( items[i].isMoveable() ) {
				firstMoveable = items[i];
				break;
			}
		}
		i = len;
		while ( i-- ) {
			if ( items[i].isMoveable() ) {
				lastMoveable = items[i];
				break;
			}
		}
	}
	this.upButton.setDisabled( !moveable || selectedItem === firstMoveable );
	this.downButton.setDisabled( !moveable || selectedItem === lastMoveable );
};

/**
 * Setup adders icons.
 *
 * @method
 * @param {Object[]} adders List of configuations for adder buttons, each containing a name, title
 *  and icon property
 */
OO.ui.OutlineControlsWidget.prototype.setupAdders = function ( adders ) {
	var i, len, addition, button,
		$buttons = this.$( [] );

	this.$adders.append( this.addButton.$element );
	for ( i = 0, len = adders.length; i < len; i++ ) {
		addition = adders[i];
		button = new OO.ui.IconButtonWidget( {
			'$': this.$, 'icon': addition.icon, 'title': addition.title
		} );
		button.connect( this, { 'click': ['emit', 'add', addition.name] } );
		this.adders[addition.name] = button;
		this.$adders.append( button.$element );
		$buttons = $buttons.add( button.$element );
	}
};
/**
 * Creates an OO.ui.OutlineItemWidget object.
 *
 * @class
 * @extends OO.ui.OptionWidget
 *
 * @constructor
 * @param {Mixed} data Item data
 * @param {Object} [config] Configuration options
 * @cfg {number} [level] Indentation level
 * @cfg {boolean} [moveable] Allow modification from outline controls
 */
OO.ui.OutlineItemWidget = function OoUiOutlineItemWidget( data, config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	OO.ui.OptionWidget.call( this, data, config );

	// Properties
	this.level = 0;
	this.moveable = !!config.moveable;

	// Initialization
	this.$element.addClass( 'oo-ui-outlineItemWidget' );
	this.setLevel( config.level );
};

/* Inheritance */

OO.inheritClass( OO.ui.OutlineItemWidget, OO.ui.OptionWidget );

/* Static Properties */

OO.ui.OutlineItemWidget.static.highlightable = false;

OO.ui.OutlineItemWidget.static.scrollIntoViewOnSelect = true;

OO.ui.OutlineItemWidget.static.levelClass = 'oo-ui-outlineItemWidget-level-';

OO.ui.OutlineItemWidget.static.levels = 3;

/* Methods */

/**
 * Check if item is moveable.
 *
 * Moveablilty is used by outline controls.
 *
 * @returns {boolean} Item is moveable
 */
OO.ui.OutlineItemWidget.prototype.isMoveable = function () {
	return this.moveable;
};

/**
 * Get indentation level.
 *
 * @returns {number} Indentation level
 */
OO.ui.OutlineItemWidget.prototype.getLevel = function () {
	return this.level;
};

/**
 * Set indentation level.
 *
 * @method
 * @param {number} [level=0] Indentation level, in the range of [0,#maxLevel]
 * @chainable
 */
OO.ui.OutlineItemWidget.prototype.setLevel = function ( level ) {
	var levels = this.constructor.static.levels,
		levelClass = this.constructor.static.levelClass,
		i = levels;

	this.level = level ? Math.max( 0, Math.min( levels - 1, level ) ) : 0;
	while ( i-- ) {
		if ( this.level === i ) {
			this.$element.addClass( levelClass + i );
		} else {
			this.$element.removeClass( levelClass + i );
		}
	}

	return this;
};
/**
 * Creates an OO.ui.PopupWidget object.
 *
 * @class
 * @extends OO.ui.Widget
 * @mixins OO.ui.LabeledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [tail=true] Show tail pointing to origin of popup
 * @cfg {string} [align='center'] Alignment of popup to origin
 * @cfg {jQuery} [$container] Container to prevent popup from rendering outside of
 * @cfg {boolean} [autoClose=false] Popup auto-closes when it loses focus
 * @cfg {jQuery} [$autoCloseIgnore] Elements to not auto close when clicked
 * @cfg {boolean} [head] Show label and close button at the top
 */
OO.ui.PopupWidget = function OoUiPopupWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.LabeledElement.call( this, this.$( '<div>' ), config );

	// Properties
	this.visible = false;
	this.$popup = this.$( '<div>' );
	this.$head = this.$( '<div>' );
	this.$body = this.$( '<div>' );
	this.$tail = this.$( '<div>' );
	this.$container = config.$container || this.$( 'body' );
	this.autoClose = !!config.autoClose;
	this.$autoCloseIgnore = config.$autoCloseIgnore;
	this.transitionTimeout = null;
	this.tail = false;
	this.align = config.align || 'center';
	this.closeButton = new OO.ui.IconButtonWidget( { '$': this.$, 'icon': 'close' } );
	this.onMouseDownHandler = OO.ui.bind( this.onMouseDown, this );

	// Events
	this.closeButton.connect( this, { 'click': 'onCloseButtonClick' } );

	// Initialization
	this.useTail( config.tail !== undefined ? !!config.tail : true );
	this.$body.addClass( 'oo-ui-popupWidget-body' );
	this.$tail.addClass( 'oo-ui-popupWidget-tail' );
	this.$head
		.addClass( 'oo-ui-popupWidget-head' )
		.append( this.$label, this.closeButton.$element );
	if ( !config.head ) {
		this.$head.hide();
	}
	this.$popup
		.addClass( 'oo-ui-popupWidget-popup' )
		.append( this.$head, this.$body );
	this.$element.hide()
		.addClass( 'oo-ui-popupWidget' )
		.append( this.$popup, this.$tail );
};

/* Inheritance */

OO.inheritClass( OO.ui.PopupWidget, OO.ui.Widget );

OO.mixinClass( OO.ui.PopupWidget, OO.ui.LabeledElement );

/* Events */

/**
 * @event hide
 */

/**
 * @event show
 */

/* Methods */

/**
 * Handles mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
OO.ui.PopupWidget.prototype.onMouseDown = function ( e ) {
	if (
		this.visible &&
		!$.contains( this.$element[0], e.target ) &&
		( !this.$autoCloseIgnore || !this.$autoCloseIgnore.has( e.target ).length )
	) {
		this.hide();
	}
};

/**
 * Bind mouse down listener
 *
 * @method
 */
OO.ui.PopupWidget.prototype.bindMouseDownListener = function () {
	// Capture clicks outside popup
	this.getElementWindow().addEventListener( 'mousedown', this.onMouseDownHandler, true );
};

/**
 * Handles close button click events.
 *
 * @method
 */
OO.ui.PopupWidget.prototype.onCloseButtonClick = function () {
	if ( this.visible ) {
		this.hide();
	}
};

/**
 * Unbind mouse down listener
 *
 * @method
 */
OO.ui.PopupWidget.prototype.unbindMouseDownListener = function () {
	this.getElementWindow().removeEventListener( 'mousedown', this.onMouseDownHandler, true );
};

/**
 * Check if the popup is visible.
 *
 * @method
 * @returns {boolean} Popup is visible
 */
OO.ui.PopupWidget.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Set whether to show a tail.
 *
 * @method
 * @returns {boolean} Make tail visible
 */
OO.ui.PopupWidget.prototype.useTail = function ( value ) {
	value = !!value;
	if ( this.tail !== value ) {
		this.tail = value;
		if ( value ) {
			this.$element.addClass( 'oo-ui-popupWidget-tailed' );
		} else {
			this.$element.removeClass( 'oo-ui-popupWidget-tailed' );
		}
	}
};

/**
 * Check if showing a tail.
 *
 * @method
 * @returns {boolean} tail is visible
 */
OO.ui.PopupWidget.prototype.hasTail = function () {
	return this.tail;
};

/**
 * Show the context.
 *
 * @method
 * @fires show
 * @chainable
 */
OO.ui.PopupWidget.prototype.show = function () {
	if ( !this.visible ) {
		this.$element.show();
		this.visible = true;
		this.emit( 'show' );
		if ( this.autoClose ) {
			this.bindMouseDownListener();
		}
	}
	return this;
};

/**
 * Hide the context.
 *
 * @method
 * @fires hide
 * @chainable
 */
OO.ui.PopupWidget.prototype.hide = function () {
	if ( this.visible ) {
		this.$element.hide();
		this.visible = false;
		this.emit( 'hide' );
		if ( this.autoClose ) {
			this.unbindMouseDownListener();
		}
	}
	return this;
};

/**
 * Updates the position and size.
 *
 * @method
 * @param {number} width Width
 * @param {number} height Height
 * @param {boolean} [transition=false] Use a smooth transition
 * @chainable
 */
OO.ui.PopupWidget.prototype.display = function ( width, height, transition ) {
	var padding = 10,
		originOffset = Math.round( this.$element.offset().left ),
		containerLeft = Math.round( this.$container.offset().left ),
		containerWidth = this.$container.innerWidth(),
		containerRight = containerLeft + containerWidth,
		popupOffset = width * ( { 'left': 0, 'center': -0.5, 'right': -1 } )[this.align],
		popupLeft = popupOffset - padding,
		popupRight = popupOffset + padding + width + padding,
		overlapLeft = ( originOffset + popupLeft ) - containerLeft,
		overlapRight = containerRight - ( originOffset + popupRight );

	// Prevent transition from being interrupted
	clearTimeout( this.transitionTimeout );
	if ( transition ) {
		// Enable transition
		this.$element.addClass( 'oo-ui-popupWidget-transitioning' );
	}

	if ( overlapRight < 0 ) {
		popupOffset += overlapRight;
	} else if ( overlapLeft < 0 ) {
		popupOffset -= overlapLeft;
	}

	// Position body relative to anchor and resize
	this.$popup.css( {
		'left': popupOffset,
		'width': width,
		'height': height === undefined ? 'auto' : height
	} );

	if ( transition ) {
		// Prevent transitioning after transition is complete
		this.transitionTimeout = setTimeout( OO.ui.bind( function () {
			this.$element.removeClass( 'oo-ui-popupWidget-transitioning' );
		}, this ), 200 );
	} else {
		// Prevent transitioning immediately
		this.$element.removeClass( 'oo-ui-popupWidget-transitioning' );
	}

	return this;
};
/**
 * Button that shows and hides a popup.
 *
 * @class
 * @extends OO.ui.IconButtonWidget
 * @mixins OO.ui.PopuppableElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.PopupButtonWidget = function OoUiPopupButtonWidget( config ) {
	// Parent constructor
	OO.ui.IconButtonWidget.call( this, config );

	// Mixin constructors
	OO.ui.PopuppableElement.call( this, config );

	// Initialization
	this.$element
		.addClass( 'oo-ui-popupButtonWidget' )
		.append( this.popup.$element );
};

/* Inheritance */

OO.inheritClass( OO.ui.PopupButtonWidget, OO.ui.IconButtonWidget );

OO.mixinClass( OO.ui.PopupButtonWidget, OO.ui.PopuppableElement );

/* Methods */

/**
 * Handles mouse click events.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
OO.ui.PopupButtonWidget.prototype.onClick = function ( e ) {
	// Skip clicks within the popup
	if ( $.contains( this.popup.$element[0], e.target ) ) {
		return;
	}

	if ( !this.disabled ) {
		if ( this.popup.isVisible() ) {
			this.hidePopup();
		} else {
			this.showPopup();
		}
		OO.ui.IconButtonWidget.prototype.onClick.call( this );
	}
	return false;
};
/**
 * Creates an OO.ui.PushButtonWidget object.
 *
 * @class
 * @extends OO.ui.ButtonWidget
 * @mixins OO.ui.IconedElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.PushButtonWidget = function OoUiPushButtonWidget( config ) {
	// Parent constructor
	OO.ui.ButtonWidget.call( this, config );

	// Mixin constructors
	OO.ui.IconedElement.call( this, this.$( '<span>' ), config );

	// Initialization
	this.$element.addClass( 'oo-ui-pushButtonWidget' );
	if ( config.icon ) {
		this.$button.prepend( this.$icon );
	}
};

/* Inheritance */

OO.inheritClass( OO.ui.PushButtonWidget, OO.ui.ButtonWidget );

OO.mixinClass( OO.ui.PushButtonWidget, OO.ui.IconedElement );

/**
 * Creates an OO.ui.SearchWidget object.
 *
 * @class
 * @extends OO.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {string|jQuery} [placeholder] Placeholder text for query input
 * @cfg {string} [value] Initial query value
 */
OO.ui.SearchWidget = function OoUiSearchWidget( config ) {
	// Configuration intialization
	config = config || {};

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Properties
	this.query = new OO.ui.TextInputWidget( {
		'$': this.$,
		'icon': 'search',
		'placeholder': config.placeholder,
		'value': config.value
	} );
	this.results = new OO.ui.SelectWidget( { '$': this.$ } );
	this.$query = this.$( '<div>' );
	this.$results = this.$( '<div>' );

	// Events
	this.query.connect( this, {
		'change': 'onQueryChange',
		'enter': 'onQueryEnter'
	} );
	this.results.connect( this, {
		'highlight': 'onResultsHighlight',
		'select': 'onResultsSelect'
	} );
	this.query.$input.on( 'keydown', OO.ui.bind( this.onQueryKeydown, this ) );

	// Initialization
	this.$query
		.addClass( 'oo-ui-searchWidget-query' )
		.append( this.query.$element );
	this.$results
		.addClass( 'oo-ui-searchWidget-results' )
		.append( this.results.$element );
	this.$element
		.addClass( 'oo-ui-searchWidget' )
		.append( this.$results, this.$query );
};

/* Inheritance */

OO.inheritClass( OO.ui.SearchWidget, OO.ui.Widget );

/* Events */

/**
 * @event highlight
 * @param {Object|null} item Item data or null if no item is highlighted
 */

/**
 * @event select
 * @param {Object|null} item Item data or null if no item is selected
 */

/* Methods */

/**
 * Handle query key down events.
 *
 * @method
 * @param {jQuery.Event} e Key down event
 */
OO.ui.SearchWidget.prototype.onQueryKeydown = function ( e ) {
	var highlightedItem, nextItem,
		dir = e.which === OO.ui.Keys.DOWN ? 1 : ( e.which === OO.ui.Keys.UP ? -1 : 0 );

	if ( dir ) {
		highlightedItem = this.results.getHighlightedItem();
		if ( !highlightedItem ) {
			highlightedItem = this.results.getSelectedItem();
		}
		nextItem = this.results.getRelativeSelectableItem( highlightedItem, dir );
		this.results.highlightItem( nextItem );
		nextItem.scrollElementIntoView();
	}
};

/**
 * Handle select widget select events.
 *
 * Clears existing results. Subclasses should repopulate items according to new query.
 *
 * @method
 * @param {string} value New value
 */
OO.ui.SearchWidget.prototype.onQueryChange = function () {
	// Reset
	this.results.clearItems();
};

/**
 * Handle select widget enter key events.
 *
 * Selects highlighted item.
 *
 * @method
 * @param {string} value New value
 */
OO.ui.SearchWidget.prototype.onQueryEnter = function () {
	// Reset
	this.results.selectItem( this.results.getHighlightedItem() );
};

/**
 * Handle select widget highlight events.
 *
 * @method
 * @param {OO.ui.OptionWidget} item Highlighted item
 * @fires highlight
 */
OO.ui.SearchWidget.prototype.onResultsHighlight = function ( item ) {
	this.emit( 'highlight', item ? item.getData() : null );
};

/**
 * Handle select widget select events.
 *
 * @method
 * @param {OO.ui.OptionWidget} item Selected item
 * @fires select
 */
OO.ui.SearchWidget.prototype.onResultsSelect = function ( item ) {
	this.emit( 'select', item ? item.getData() : null );
};

/**
 * Get the query input.
 *
 * @method
 * @returns {OO.ui.TextInputWidget} Query input
 */
OO.ui.SearchWidget.prototype.getQuery = function () {
	return this.query;
};

/**
 * Get the results list.
 *
 * @method
 * @returns {OO.ui.SelectWidget} Select list
 */
OO.ui.SearchWidget.prototype.getResults = function () {
	return this.results;
};
/**
 * Creates an OO.ui.TextInputWidget object.
 *
 * @class
 * @extends OO.ui.InputWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {string} [placeholder] Placeholder text
 * @cfg {string} [icon] Symbolic name of icon
 * @cfg {boolean} [multiline=false] Allow multiple lines of text
 */
OO.ui.TextInputWidget = function OoUiTextInputWidget( config ) {
	config = config || {};

	// Parent constructor
	OO.ui.InputWidget.call( this, config );

	// Properties
	this.pending = 0;
	this.multiline = !!config.multiline;

	// Events
	this.$input.on( 'keypress', OO.ui.bind( this.onKeyPress, this ) );

	// Initialization
	this.$element.addClass( 'oo-ui-textInputWidget' );
	if ( config.icon ) {
		this.$element.addClass( 'oo-ui-textInputWidget-decorated' );
		this.$element.append(
			this.$( '<span>' )
				.addClass( 'oo-ui-textInputWidget-icon oo-ui-icon-' + config.icon )
				.mousedown( OO.ui.bind( function () {
					this.$input.focus();
					return false;
				}, this ) )
		);
	}
	if ( config.placeholder ) {
		this.$input.attr( 'placeholder', config.placeholder );
	}
};

/* Inheritance */

OO.inheritClass( OO.ui.TextInputWidget, OO.ui.InputWidget );

/* Events */

/**
 * User presses enter inside the text box.
 *
 * Not called if input is multiline.
 *
 * @event enter
 */

/* Methods */

/**
 * Handles key press events.
 *
 * @param {jQuery.Event} e Key press event
 * @fires enter If enter key is pressed and input is not multiline
 */
OO.ui.TextInputWidget.prototype.onKeyPress = function ( e ) {
	if ( e.which === OO.ui.Keys.ENTER && !this.multiline ) {
		this.emit( 'enter' );
	}
};

/**
 * Get input element.
 *
 * @method
 * @param {Object} [config] Configuration options
 * @returns {jQuery} Input element
 */
OO.ui.TextInputWidget.prototype.getInputElement = function ( config ) {
	return config.multiline ? this.$( '<textarea>' ) : this.$( '<input>' ).attr( 'type', 'text' );
};

/* Methods */

/**
 * Checks if input is pending.
 *
 * @method
 * @returns {boolean} Input is pending
 */
OO.ui.TextInputWidget.prototype.isPending = function () {
	return !!this.pending;
};

/**
 * Increases the pending stack.
 *
 * @method
 * @chainable
 */
OO.ui.TextInputWidget.prototype.pushPending = function () {
	this.pending++;
	this.$element.addClass( 'oo-ui-textInputWidget-pending' );
	this.$input.addClass( 'oo-ui-texture-pending' );
	return this;
};

/**
 * Reduces the pending stack.
 *
 * Clamped at zero.
 *
 * @method
 * @chainable
 */
OO.ui.TextInputWidget.prototype.popPending = function () {
	this.pending = Math.max( 0, this.pending - 1 );
	if ( !this.pending ) {
		this.$element.removeClass( 'oo-ui-textInputWidget-pending' );
		this.$input.removeClass( 'oo-ui-texture-pending' );
	}
	return this;
};
/**
 * Creates an OO.ui.TextInputMenuWidget object.
 *
 * @class
 * @extends OO.ui.MenuWidget
 *
 * @constructor
 * @param {OO.ui.TextInputWidget} input Text input widget to provide menu for
 * @param {Object} [config] Configuration options
 * @cfg {jQuery} [$container=input.$element] Element to render menu under
 */
OO.ui.TextInputMenuWidget = function OoUiTextInputMenuWidget( input, config ) {
	// Parent constructor
	OO.ui.MenuWidget.call( this, config );

	// Properties
	this.input = input;
	this.$container = config.$container || this.input.$element;
	this.onWindowResizeHandler = OO.ui.bind( this.onWindowResize, this );

	// Initialization
	this.$element.addClass( 'oo-ui-textInputMenuWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.TextInputMenuWidget, OO.ui.MenuWidget );

/* Methods */

/**
 * Handle window resize event.
 *
 * @method
 * @param {jQuery.Event} e Window resize event
 */
OO.ui.TextInputMenuWidget.prototype.onWindowResize = function () {
	this.position();
};

/**
 * Shows the menu.
 *
 * @method
 * @chainable
 */
OO.ui.TextInputMenuWidget.prototype.show = function () {
	// Parent method
	OO.ui.MenuWidget.prototype.show.call( this );

	this.position();
	this.$( this.getElementWindow() ).on( 'resize', this.onWindowResizeHandler );
	return this;
};

/**
 * Hides the menu.
 *
 * @method
 * @chainable
 */
OO.ui.TextInputMenuWidget.prototype.hide = function () {
	// Parent method
	OO.ui.MenuWidget.prototype.hide.call( this );

	this.$( this.getElementWindow() ).off( 'resize', this.onWindowResizeHandler );
	return this;
};

/**
 * Positions the menu.
 *
 * @method
 * @chainable
 */
OO.ui.TextInputMenuWidget.prototype.position = function () {
	var frameOffset,
		$container = this.$container,
		dimensions = $container.offset();

	// Position under input
	dimensions.top += $container.height();
	dimensions.width = $container.width();

	// Compensate for frame position if in a differnt frame
	if ( this.input.$.frame && this.input.$.context !== this.$element[0].ownerDocument ) {
		frameOffset = OO.ui.Element.getRelativePosition(
			this.input.$.frame.$element, this.$element.offsetParent()
		);
		dimensions.left += frameOffset.left;
		dimensions.top += frameOffset.top;
	} else {
		// Fix for RTL (for some reason, no need to fix if the frameoffset is set)
		if ( this.$element.css( 'direction' ) === 'rtl' ) {
			dimensions.right = this.$element.parent().position().left - dimensions.width - dimensions.left;
			// Erase the value for 'left':
			delete dimensions.left;
		}
	}

	this.$element.css( dimensions );
	return this;
};
/**
 * Creates an OO.ui.ToggleWidget object.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [value=false] Initial value
 * @cfg {string} [onLabel='On'] Label for on state
 * @cfg {string} [offLabel='Off'] Label for off state
 */
OO.ui.ToggleWidget = function OoUiToggleWidget( config ) {
	// Configuration initialization
	config = $.extend( {
		'onLabel': OO.ui.msg( 'ooui-toggle-on' ),
		'offLabel': OO.ui.msg( 'ooui-toggle-on' )
	}, config );

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Properties
	this.value = null;
	this.dragging = false;
	this.dragStart = null;
	this.sliding = false;
	this.$slide = this.$( '<span>' );
	this.$grip = this.$( '<span>' );
	this.$onLabel = this.$( '<span>' );
	this.$offLabel = this.$( '<span>' );
	this.onDocumentMouseMoveHandler = OO.ui.bind( this.onDocumentMouseMove, this );
	this.onDocumentMouseUpHandler = OO.ui.bind( this.onDocumentMouseUp, this );

	// Events
	this.$slide.on( 'mousedown', OO.ui.bind( this.onMouseDown, this ) );

	// Initialization
	this.$grip.addClass( 'oo-ui-toggleWidget-grip' );
	this.$onLabel
		.addClass( 'oo-ui-toggleWidget-label oo-ui-toggleWidget-label-on' )
		.text( config.onLabel || '' );
	this.$offLabel
		.addClass( 'oo-ui-toggleWidget-label oo-ui-toggleWidget-label-off' )
		.text( config.offLabel || '' );
	this.$slide
		.addClass( 'oo-ui-toggleWidget-slide' )
		.append( this.$onLabel, this.$offLabel, this.$grip );
	this.$element
		.addClass( 'oo-ui-toggleWidget' )
		.append( this.$slide );
	this.setValue( !!config.value );
};

/* Inheritance */

OO.inheritClass( OO.ui.ToggleWidget, OO.ui.Widget );

/* Events */

/**
 * @event change
 * @param {boolean} value Changed value
 */

/* Methods */

/**
 * Handles mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
OO.ui.ToggleWidget.prototype.onMouseDown = function ( e ) {
	if ( e.which === 1 ) {
		this.dragging = true;
		this.dragStart = e.pageX;
		this.$( this.$.context ).on( {
			'mousemove': this.onDocumentMouseMoveHandler,
			'mouseup': this.onDocumentMouseUpHandler
		} );
		this.$element.addClass( 'oo-ui-toggleWidget-dragging' );
		return false;
	}
};

/**
 * Handles document mouse up events.
 *
 * @method
 * @param {jQuery.Event} e Mouse up event
 */
OO.ui.ToggleWidget.prototype.onDocumentMouseUp = function ( e ) {
	var overlap, dragOffset;

	if ( e.which === 1 ) {
		this.$element.removeClass( 'oo-ui-toggleWidget-dragging' );

		if ( !this.sliding ) {
			this.setValue( !this.value );
		} else {
			this.$slide.css( 'margin-left', 0 );
			dragOffset = e.pageX - this.dragStart;
			overlap = this.$element.outerWidth() - this.$slide.outerWidth();
			if ( this.value ? overlap / 2 > dragOffset : -overlap / 2 < dragOffset ) {
				this.setValue( !this.value );
			}
		}
		this.dragging = false;
		this.sliding = false;
		this.$( this.$.context ).off( {
			'mousemove': this.onDocumentMouseMoveHandler,
			'mouseup': this.onDocumentMouseUpHandler
		} );
	}
};

/**
 * Handles document mouse move events.
 *
 * @method
 * @param {jQuery.Event} e Mouse move event
 */
OO.ui.ToggleWidget.prototype.onDocumentMouseMove = function ( e ) {
	var overlap, dragOffset, left;

	if ( this.dragging ) {
		dragOffset = e.pageX - this.dragStart;
		if ( dragOffset !== 0 || this.sliding ) {
			this.sliding = true;
			overlap = this.$element.outerWidth() - this.$slide.outerWidth();
			left = this.value ?
				Math.min( 0, Math.max( overlap, dragOffset ) ) :
				Math.min( -overlap, Math.max( 0, dragOffset ) );
			this.$slide.css( 'margin-left', left );
		}
	}
};

/**
 * Get the value of the toggle.
 *
 * @method
 * @returns {boolean} Toggle value
 */
OO.ui.ToggleWidget.prototype.getValue = function () {
	return this.value;
};

/**
 * Set the value of the toggle.
 *
 * @method
 * @param {boolean} value New value
 * @fires change
 * @chainable
 */
OO.ui.ToggleWidget.prototype.setValue = function ( value ) {
	if ( this.value !== value ) {
		this.value = value;
		this.$element
			.toggleClass( 'oo-ui-toggleWidget-on', value )
			.toggleClass( 'oo-ui-toggleWidget-off', !value );
		this.emit( 'change', this.value );
	}
	return this;
};
}() );
