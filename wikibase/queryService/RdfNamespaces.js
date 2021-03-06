var wikibase = wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.RdfNamespaces = {};

( function ( $, RdfNamespaces ) {
	'use strict';

	RdfNamespaces.NAMESPACE_SHORTCUTS = {
		Wikidata: {
			wikibase: 'http://wikiba.se/ontology#',
			wd: 'http://www.wikidata.org/entity/',
			wdt: 'http://www.wikidata.org/prop/direct/',
			wds: 'http://www.wikidata.org/entity/statement/',
			p: 'http://www.wikidata.org/prop/',
			wdref: 'http://www.wikidata.org/reference/',
			wdv: 'http://www.wikidata.org/value/',
			ps: 'http://www.wikidata.org/prop/statement/',
			psv: 'http://www.wikidata.org/prop/statement/value/',
			pq: 'http://www.wikidata.org/prop/qualifier/',
			pqv: 'http://www.wikidata.org/prop/qualifier/value/',
			pr: 'http://www.wikidata.org/prop/reference/',
			prv: 'http://www.wikidata.org/prop/reference/value/',
			wdno: 'http://www.wikidata.org/prop/novalue/',
			wdata: 'http://www.wikidata.org/wiki/Special:EntityData/'
		},
		W3C: {
			rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
			rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
			owl: 'http://www.w3.org/2002/07/owl#',
			skos: 'http://www.w3.org/2004/02/skos/core#',
			xsd: 'http://www.w3.org/2001/XMLSchema#',
			prov: 'http://www.w3.org/ns/prov#'
		},
		'Social/Other': {
			schema: 'http://schema.org/'
		},
		Blazegraph: {
			bd: 'http://www.bigdata.com/rdf#',
			bds: 'http://www.bigdata.com/rdf/search#',
			gas: 'http://www.bigdata.com/rdf/gas#',
			hint: 'http://www.bigdata.com/queryHints#'
		}
	};

	RdfNamespaces.ENTITY_TYPES = {
		'http://www.wikidata.org/prop/direct/': 'property',
		'http://www.wikidata.org/prop/': 'property',
		'http://www.wikidata.org/prop/novalue/': 'property',
		'http://www.wikidata.org/prop/statement/': 'property',
		'http://www.wikidata.org/prop/statement/value/': 'property',
		'http://www.wikidata.org/prop/qualifier/': 'property',
		'http://www.wikidata.org/prop/qualifier/value/': 'property',
		'http://www.wikidata.org/prop/reference/': 'property',
		'http://www.wikidata.org/prop/reference/value/': 'property',
		'http://www.wikidata.org/wiki/Special:EntityData/': 'item',
		'http://www.wikidata.org/entity/': 'item'
	};

	RdfNamespaces.ALL_PREFIXES = $.map( RdfNamespaces.NAMESPACE_SHORTCUTS, function ( n ) {
		return n;
	} ).reduce( function ( p, v, i ) {
		return $.extend( p, v );
	}, {} );

	RdfNamespaces.STANDARD_PREFIXES = {
		wd: 'PREFIX wd: <http://www.wikidata.org/entity/>',
		wdt: 'PREFIX wdt: <http://www.wikidata.org/prop/direct/>',
		wikibase: 'PREFIX wikibase: <http://wikiba.se/ontology#>',
		p: 'PREFIX p: <http://www.wikidata.org/prop/>',
		ps: 'PREFIX ps: <http://www.wikidata.org/prop/statement/>',
		pq: 'PREFIX pq: <http://www.wikidata.org/prop/qualifier/>',
		rdfs: 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
		bd: 'PREFIX bd: <http://www.bigdata.com/rdf#>'
	};

	RdfNamespaces.getPrefixMap = function ( entityTypes ) {
		var prefixes = {};
		$.each( RdfNamespaces.ALL_PREFIXES, function ( prefix, url ) {
			if ( entityTypes[url] ) {
				prefixes[prefix] = entityTypes[url];
			}
		} );
		return prefixes;
	};

} )( jQuery, wikibase.queryService.RdfNamespaces );
