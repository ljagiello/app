/*!
 * VisualEditor MediaWiki ViewPageTarget init.
 *
 * This file must remain as widely compatible as the base compatibility
 * for MediaWiki itself (see mediawiki/core:/resources/startup.js).
 * Avoid use of: ES5, SVG, HTML5 DOM, ContentEditable etc.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

/**
 * Platform preparation for the MediaWiki view page. This loads (when user needs it) the
 * actual MediaWiki integration and VisualEditor library.
 *
 * @class ve.init.mw.WikiaViewPageTarget.init
 * @singleton
 */
( function () {
	var conf, tabMessages, uri, pageExists, viewUri, veEditUri, isViewPage,
		init, support, getTargetDeferred, userPrefEnabled, $edit, thisPageIsAvailable,
		plugins = [],
		// Used by tracking calls that go out before ve.track is available.
		trackerConfig = {
			'category': 'editor-ve',
			'trackingMethod': 'both'
		};

	function indicator( type, hook ) {
		var timer,
			$indicator = $( '<div>' ).addClass( 've-indicator visible' ),
			$content = $( '<div>' ).addClass( 'content' ),
			$icon = $( '<div>' ).addClass( type ),
			$message = $( '<p>' )
				.addClass( 'message' )
				.text( mw.message( 'wikia-visualeditor-' + type ).plain() );

		$content
			.append( $icon )
			.append( $message );

		$indicator
			.append( $content )
			.appendTo( $( 'body' ) )
			.animate( { 'opacity': 1 }, 400 );

		// Display the message if loading is taking awhile
		timer = setTimeout( function () {
			$message.slideDown( 400 );
		}, 3000 );

		// Cleanup indicator when hook is fired
		mw.hook( hook ).add( function cleanup() {
			clearTimeout( timer );
			$indicator.animate( { 'opacity': 0 }, 400, function () {
				mw.hook( hook ).remove( cleanup );
				$indicator.remove();
			} );
		} );
	}

	/**
	 * Use deferreds to avoid loading and instantiating Target multiple times.
	 * @returns {jQuery.Promise}
	 */
	function getTarget() {
		var loadTargetDeferred;

		indicator( 'loading', 've.activationComplete' );

		if ( !getTargetDeferred ) {
			Wikia.Tracker.track( trackerConfig, {
				'action': Wikia.Tracker.ACTIONS.IMPRESSION,
				'label': 'edit-page'
			} );
			getTargetDeferred = $.Deferred();
			loadTargetDeferred = $.Deferred();

			$.when(
				loadTargetDeferred,
				$.getResources( $.getSassCommonURL( '/extensions/VisualEditor/wikia/VisualEditor.scss' ) )
			).done( function () {
				var target = new ve.init.mw.WikiaViewPageTarget();
				ve.init.mw.targets.push( target );

				// Transfer methods
				ve.init.mw.WikiaViewPageTarget.prototype.setupSectionEditLinks = init.setupSectionLinks;

				// Add plugins
				target.addPlugins( plugins );

				getTargetDeferred.resolve( target );
			} ).fail( getTargetDeferred.reject );

			mw.loader.using( 'ext.visualEditor.wikiaViewPageTarget', loadTargetDeferred.resolve, loadTargetDeferred.reject );
		}
		return getTargetDeferred.promise();
	}

	conf = mw.config.get( 'wgVisualEditorConfig' );
	tabMessages = conf.tabMessages;
	uri = new mw.Uri( location.href );
	// For special pages, no information about page existence is exposed to
	// mw.config, so we assume it exists TODO: fix this in core.
	pageExists = !!mw.config.get( 'wgArticleId' ) || mw.config.get( 'wgNamespaceNumber' ) < 0;
	viewUri = new mw.Uri( mw.util.getUrl( mw.config.get( 'wgRelevantPageName' ) ) );
	veEditUri = viewUri.clone().extend( { 'veaction': 'edit' } );
	isViewPage = (
		mw.config.get( 'wgIsArticle' ) &&
		!( 'diff' in uri.query )
	);

	support = {
		es5: !!(
			// It would be much easier to do a quick inline function that asserts "use strict"
			// works, but since IE9 doesn't support strict mode (and we don't use strict mode) we
			// have to instead list all the ES5 features we do use.
			Array.isArray &&
			Array.prototype.filter &&
			Array.prototype.indexOf &&
			Array.prototype.map &&
			Date.now &&
			Date.prototype.toJSON &&
			Function.prototype.bind &&
			Object.create &&
			Object.keys &&
			String.prototype.trim &&
			window.JSON &&
			JSON.parse &&
			JSON.stringify
		),
		contentEditable: 'contentEditable' in document.createElement( 'div' )
	};

	init = {
		activateOnPageLoad: uri.query.veaction === 'edit',

		support: support,

		blacklist: conf.blacklist,

		/**
		 * Add a plugin module or function.
		 *
		 * Plugins are run after VisualEditor is loaded, but before it is initialized. This allows
		 * plugins to add classes and register them with the factories and registries.
		 *
		 * The parameter to this function can be a ResourceLoader module name or a function.
		 *
		 * If it's a module name, it will be loaded together with the VisualEditor core modules when
		 * VE is loaded. No special care is taken to ensure that the module runs after the VE
		 * classes are loaded, so if this is desired, the module should depend on
		 * ext.visualEditor.core .
		 *
		 * If it's a function, it will be invoked once the VisualEditor core modules and any
		 * plugin modules registered through this function have been loaded, but before the editor
		 * is intialized. The function takes one parameter, which is the ve.init.mw.Target instance
		 * that's initializing, and can optionally return a jQuery.Promise . VisualEditor will
		 * only be initialized once all promises returned by plugin functions have been resolved.
		 *
		 *     @example
		 *     // Register ResourceLoader module
		 *     ve.libs.mw.addPlugin( 'ext.gadget.foobar' );
		 *
		 *     // Register a callback
		 *     ve.libs.mw.addPlugin( function ( target ) {
		 *         ve.dm.Foobar = .....
		 *     } );
		 *
		 *     // Register a callback that loads another script
		 *     ve.libs.mw.addPlugin( function () {
		 *         return $.getScript( 'http://example.com/foobar.js' );
		 *     } );
		 *
		 * @param {string|Function} plugin Module name or callback that optionally returns a promise
		 */
		addPlugin: function( plugin ) {
			plugins.push( plugin );
		},

		setupSkin: function () {
			if ( isViewPage ) {
				init.setupTabs();
				init.setupSectionLinks();
			}
		},

		setupTabs: function () {
			$( '#ca-ve-edit' ).click( init.onEditTabClick );
		},

		setupSectionLinks: function () {
			$( '#mw-content-text' ).find( '.editsection a' ).click( init.onEditSectionLinkClick );
		},

		onEditTabClick: function ( e ) {
			// Default mouse button is normalised by jQuery to key code 1.
			// Only do our handling if no keys are pressed, mouse button is 1
			// (e.g. not middle click or right click) and no modifier keys
			// (e.g. cmd-click to open in new tab).
			if ( ( e.which && e.which !== 1 ) || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey ) {
				return;
			}

			e.preventDefault();

			Wikia.Tracker.track( trackerConfig, {
				'action': Wikia.Tracker.ACTIONS.CLICK,
				'category': 'article',
				'label': 've-edit'
			} );

			getTarget().done( function ( target ) {
				target.activate();
			} );
		},

		onEditSectionLinkClick: function ( e ) {
			if ( ( e.which && e.which !== 1 ) || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey ) {
				return;
			}

			e.preventDefault();

			Wikia.Tracker.track( trackerConfig, {
				'action': Wikia.Tracker.ACTIONS.CLICK,
				'category': 'article',
				'label': 've-section-edit'
			} );

			getTarget().done( function ( target ) {
				target.saveEditSection( $( e.target ).closest( 'h1, h2, h3, h4, h5, h6' ).get( 0 ) );
				target.activate();
			} );
		}
	};

	support.visualEditor = support.es5 &&
		support.contentEditable &&
		( ( 'vewhitelist' in uri.query ) || !$.client.test( init.blacklist, null, true ) );

	userPrefEnabled = (
		// Allow disabling for anonymous users separately from changing the
		// default preference (bug 50000)
		!( conf.disableForAnons && mw.config.get( 'wgUserName' ) === null ) &&

		// User has 'visualeditor-enable' preference enabled (for alpha opt-in)
		// User has 'visualeditor-betatempdisable' preference disabled
		// Because user.options is embedded in the HTML and cached per-page for anons on wikis
		// with static caching (e.g. wgUseFileCache or reverse-proxy) ignore user.options for
		// anons as it is likely outdated.
		(
			mw.config.get( 'wgUserName' ) === null ?
				( conf.defaultUserOptions.enable && !conf.defaultUserOptions.betatempdisable ) :
				(
					mw.user.options.get( 'visualeditor-enable', conf.defaultUserOptions.enable ) &&
						!mw.user.options.get(
							'visualeditor-betatempdisable',
							conf.defaultUserOptions.betatempdisable
						)
				)
		)
	);

	// Whether VisualEditor should be available for the current user, page, wiki, mediawiki skin,
	// browser etc.
	init.isAvailable = function ( article ) {
		return (
			// Disable on redirect pages until redirects are editable (bug 47328)
			// Property wgIsRedirect is relatively new in core, many cached pages
			// don't have it yet. We do a best-effort approach using the url query
			// which will cover all working redirect (the only case where one can
			// read a redirect page without ?redirect=no is in case of broken or
			// double redirects).
			!(
				article === mw.config.get( 'wgRelevantPageName' ) &&
				mw.config.get( 'wgIsRedirect', !!uri.query.redirect )
			) &&

			support.visualEditor &&

			userPrefEnabled &&

			// Only in supported skins
			$.inArray( mw.config.get( 'skin' ), conf.skins ) !== -1 &&

			// Only in enabled namespaces
			$.inArray(
				new mw.Title( article ).getNamespaceId(),
				conf.namespaces
			) !== -1
		);
	};

	// Note: Though VisualEditor itself only needs this exposure for a very small reason
	// (namely to access init.blacklist from the unit tests...) this has become one of the nicest
	// ways to easily detect whether the VisualEditor initialisation code is present.
	//
	// The VE global was once available always, but now that platform integration initialisation
	// is properly separated, it doesn't exist until the platform loads VisualEditor core.
	//
	// Most of mw.libs.ve is considered subject to change and private.  The exception is that
	// mw.libs.ve.isAvailable is public, and indicates whether the VE editor itself can be loaded
	// on this page. See above for why it may be false.
	mw.libs.ve = init;

	thisPageIsAvailable = init.isAvailable( mw.config.get( 'wgRelevantPageName' ) );

	if ( !thisPageIsAvailable ) {
		$edit = $( '#ca-edit' );
		$( 'html' ).addClass( 've-not-available' );
		$( '#ca-ve-edit' ).attr( 'href', $edit.attr( 'href' ) );
		$edit.parent().remove();
	} else {
		$( 'html' ).addClass( 've-available' );
	}

	if ( !userPrefEnabled ) {
		return;
	}

	if ( thisPageIsAvailable ) {
		$( function () {
			if ( isViewPage ) {
				if ( init.activateOnPageLoad ) {
					getTarget().done( function ( target ) {
						target.activate();
					} );
				}
			}
			init.setupSkin();
		} );
	}

	// Redlinks
	$( function () {
		$( document ).on(
			'mouseover click',
			'a[href*="action=edit"][href*="&redlink"]:not([href*="veaction=edit"])',
			function () {
				var $element = $( this ),
					href = $element.attr( 'href' ),
					articlePath = mw.config.get( 'wgArticlePath' ).replace( '$1', '' ),
					redlinkArticle = new mw.Uri( href ).path.replace( articlePath, '' );

				if ( init.isAvailable( redlinkArticle ) ) {
					$element.attr( 'href', href.replace( 'action=edit', 'veaction=edit' ) );
				}
			}
		);
	} );
}() );
