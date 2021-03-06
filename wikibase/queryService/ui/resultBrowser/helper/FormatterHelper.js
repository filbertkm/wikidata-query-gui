var wikibase = wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};
wikibase.queryService.ui.resultBrowser.helper = wikibase.queryService.ui.resultBrowser.helper || {};
window.mediaWiki = window.mediaWiki || {};

wikibase.queryService.ui.resultBrowser.helper.FormatterHelper = ( function( $, mw ) {
	'use strict';

	var EXPLORE_URL = 'http://www.wikidata.org/entity/Q';
	var COMMONS_FILE_PATH = 'http://commons.wikimedia.org/wiki/special:filepath/';

	var NUMBER_TYPES = [
			'http://www.w3.org/2001/XMLSchema#double', 'http://www.w3.org/2001/XMLSchema#float',
			'http://www.w3.org/2001/XMLSchema#decimal', 'http://www.w3.org/2001/XMLSchema#integer',
			'http://www.w3.org/2001/XMLSchema#long', 'http://www.w3.org/2001/XMLSchema#int',
			'http://www.w3.org/2001/XMLSchema#short',
			'http://www.w3.org/2001/XMLSchema#nonNegativeInteger',
			'http://www.w3.org/2001/XMLSchema#positiveInteger',
			'http://www.w3.org/2001/XMLSchema#unsignedLong',
			'http://www.w3.org/2001/XMLSchema#unsignedInt',
			'http://www.w3.org/2001/XMLSchema#unsignedShort',
			'http://www.w3.org/2001/XMLSchema#nonPositiveInteger',
			'http://www.w3.org/2001/XMLSchema#negativeInteger'
	];

	/**
	 * Formatting helper provides methods useful for formatting results
	 *
	 * @class wikibase.queryService.ui.resultBrowser.helper.FormatterHelper
	 * @license GNU GPL v2+
	 *
	 * @author Jonas Kress
	 * @constructor
	 */
	function SELF() {
	}

	/**
	 * Format a data row
	 *
	 * @param {Object} row
	 * @return {jQuery} element
	 */
	SELF.prototype.formatRow = function( row ) {
		var self = this;

		var $result = $( '<div/>' );

		$.each( row, function( key, value ) {
			$result.prepend( $( '<div/>' ).text( key + ': ' )
					.append( self.formatValue( value, key ) ) );
		} );

		return $result;
	};

	/**
	 * Format a data value
	 *
	 * @param {Object} data
	 * @param {string} key
	 * @return {jQuery} element
	 */
	SELF.prototype.formatValue = function( data, key ) {
		var value = data.value, $html = $( '<span>' );

		if ( !data.type ) {
			return value;
		}

		if ( data.type === 'uri' ) {
			var $link = $( '<a>' ).attr( 'href', value ).attr( 'target', '_blank' );
			$html.append( $link );

			if ( this.isCommonsResource( value ) ) {
				$link.text( 'commons:' +
						decodeURIComponent( this.getCommonsResourceFileName( value ) ) );
				$html.prepend( this.createGalleryButton( value, key ), ' ' );

			} else {
				$link.text( this.abbreviateUri( value ) );
				if ( this.isExploreUrl( value ) ) {
					$html.prepend( this.createExploreButton( value ), ' ' );
				}
			}

		} else {
			var $label = $( '<span>' ).text( value );
			if ( data['xml:lang'] ) {
				$label.attr( 'title', value + '@' + data['xml:lang'] );
			}
			$html.append( $label );
		}

		return $html;
	};

	/**
	 * Checks whether given URL is available for explorer
	 *
	 * @param {string} url
	 * @return {boolean}
	 */
	SELF.prototype.isExploreUrl = function( url ) {
		if ( url && url.match ) {
			return url.match( EXPLORE_URL + '(.+)' );
		}
		return false;
	};

	/**
	 * Creates an explore button
	 *
	 * @return {jQuery}
	 */
	SELF.prototype.createExploreButton = function( url ) {
		var $button = $( '<a href="' + url +
				'" title="Explore item" class="explore glyphicon glyphicon-search" aria-hidden="true">' );
		$button.click( $.proxy( this.handleExploreItem, this ) );

		return $button;
	};

	/**
	 * Checks whether given url is commons resource URL
	 *
	 * @param {string} url
	 * @return {boolean}
	 */
	SELF.prototype.isCommonsResource = function( url ) {
		return url.toLowerCase().startsWith( COMMONS_FILE_PATH.toLowerCase() );
	};

	/**
	 * Returns the file name of a commons resource URL
	 *
	 * @param {string} url
	 * @return {string}
	 */
	SELF.prototype.getCommonsResourceFileName = function( url ) {
		var regExp = new RegExp( COMMONS_FILE_PATH, 'ig' );

		return decodeURIComponent( url.replace( regExp, '' ) );
	};

	/**
	 * Creates a thumbnail URL from given commons resource URL
	 *
	 * @param {string} url
	 * @param {number} width
	 * @return {String}
	 */
	SELF.prototype.getCommonsResourceFileNameThumbnail = function( url, width ) {
		if ( !this.isCommonsResource( url ) ) {
			return url;
		}
		if ( !width ) {
			width = 400;
		}

		if ( url.match( /^http\:\/\//i ) ) {
			url = url.replace( /^http\:\/\//, 'https://' );
		}

		return url + '?width=' + width;
	};

	/**
	 * Creates a gallery button
	 *
	 * @param {string} url
	 * @param {string} galleryId
	 * @return {jQuery}
	 */
	SELF.prototype.createGalleryButton = function( url, galleryId ) {
		var fileName = this.getCommonsResourceFileName( url ), thumbnail = this
				.getCommonsResourceFileNameThumbnail( url, 900 );

		var $button = $(
				'<a title="Show Gallery" class="gallery glyphicon glyphicon-picture" aria-hidden="true">' )
				.attr( 'href', thumbnail ).attr( 'data-gallery', 'G_' + galleryId ).attr(
						'data-title', decodeURIComponent( fileName ) );

		$button.click( this.handleCommonResourceItem );

		return $button;
	};

	/**
	 * Produce abbreviation of the URI.
	 *
	 * @param {string} uri
	 * @return {string}
	 */
	SELF.prototype.abbreviateUri = function( uri ) {
		var nsGroup, ns, NAMESPACE_SHORTCUTS = wikibase.queryService.RdfNamespaces.NAMESPACE_SHORTCUTS;

		for ( nsGroup in NAMESPACE_SHORTCUTS ) {
			for ( ns in NAMESPACE_SHORTCUTS[nsGroup] ) {
				if ( uri.indexOf( NAMESPACE_SHORTCUTS[nsGroup][ns] ) === 0 ) {
					return uri.replace( NAMESPACE_SHORTCUTS[nsGroup][ns], ns + ':' );
				}
			}
		}
		return '<' + uri + '>';
	};

	/**
	 * Handler for explore links
	 */
	SELF.prototype.handleExploreItem = function( e ) {
		var id, url = $( e.target ).attr( 'href' ) || '', match;
		e.preventDefault();

		match = url.match( EXPLORE_URL + '(.+)' );
		if ( !match ) {
			return false;
		}

		var $explorer = $( '.explorer' );

		$explorer.empty();
		$( '.explorer-panel' ).show();

		id = match[1];
		mw.config = {
			get: function() {
				return 'Q' + id;
			}
		};
		EXPLORER( $, mw, $explorer );

		return false;
	};

	/**
	 * Handler for commons resource links
	 */
	SELF.prototype.handleCommonResourceItem = function( e ) {
		e.preventDefault();
		$( this ).ekkoLightbox( {
			'scale_height': true
		} );
	};

	/**
	 * Checks whether the current cell contains a label
	 *
	 * @private
	 * @param {Object} cell
	 * @return {boolean}
	 */
	SELF.prototype.isLabel = function( cell ) {
		if ( !cell || !cell.hasOwnProperty ) {
			return false;
		}

		return cell.hasOwnProperty( 'xml:lang' );
	};

	/**
	 * Checks whether the current cell contains a number
	 *
	 * @private
	 * @param {Object} cell
	 * @return {boolean}
	 */
	SELF.prototype.isNumber = function( cell ) {
		if ( !cell || !cell.datatype ) {
			return false;
		}

		return NUMBER_TYPES.indexOf( cell.datatype ) !== -1;
	};

	return SELF;
}( jQuery, mediaWiki ) );
