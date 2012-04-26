/**
 * @class Lusc.Api
 * 
 * Class implements an API for an easy to use embedding of
 * our pre-defined mapservices in any website with an OpenLayers slippy map.
 * This class is based upon the Terrestris WMS-API
 * 
 * @examples
 * 
 *  <iframe width="400" height="300" frameborder="0" 
 *    scrolling="no" marginheight="0" marginwidth="0" 
 *    src="/api/api.html?marker=136260,456394&loc=136260,456394&zl=8"
 *    style="border: 0">
 * OR
 *  <iframe width="400" height="300" frameborder="0" 
 *    scrolling="no" marginheight="0" marginwidth="0" 
 *    src="/api/api.html?marker=136260,456394&bbox=130000,450000,150000,470000"
 *    style="border: 0">
 */
Lusc = {};
Lusc.Api = function(config) {
    
    /**
     * Reference to the zoomlevel object
     */
    this.zl = null;

	/**
     * Reference to the location object
     */
    this.loc = null;

    /**
     * Reference to the BBOX object
     */
    this.bbox = null;
    
    /**
     * Reference to the layer
     */
    this.layer = null;
    
    /**
     * Reference to map object
     */
    this.map = null;
    
    /**
     * Reference to the DIV-id the map should be rendered in
     */
    this.div = null;
    
    /**
     * @private
     * Look up array, having the supported layers ATM.
     */
    this.supportedLayers = ["AAN","AHN25M","GEMEENTEGRENZEN","NATIONALE_PARKEN","NOK2011","TEXEL_20120423","TEXEL_20120423_OUTLINE"];
    
    /**
     * @private
     * The style object for the marker.
     * Generated with http://www.webmapcenter.de/olstyle/generator.php
     */
    this.styleObj = {
          strokeColor : '#ee0028',
          strokeWidth : 1,
          strokeOpacity : 1,
          fillColor : '#ee000d',
          fillOpacity : 1,
          pointRadius : 12,
          externalGraphic: './lusc_pointer.png'
    };

    
    /**
     * @private
     * The attribution added to the map
     */
    this.attribution = '&copy; <a target="_parent" href="http://www.terrestris.de">terrestris GmbH & Co. KG</a>,</br>' +
        'Data by <a target="_parent" href="http://www.openstreetmap.org">OpenStreetMap</a> and contributors, <a target="_parent" href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
    
    if (config) {
        
        // read out and validate the given values
        this.validateConfig(config);
        
        // create the OpenLayers Map instance
        this.map = this.createOlMap();
        
    } else {
        // exception
    }
}

/**
 * @private
 * 
 * Reads out and validates the given config options.
 * The values are restored in member vars. On error a default is set.
 */
Lusc.Api.prototype.validateConfig = function(config) {
	if (config.layer && !OpenLayers.Util.isArray(config.layer)) {
		config.layer = [config.layer];
	}
	if (config.layer && OpenLayers.Util.indexOf(this.supportedLayers, config.layer) && OpenLayers.Util.isArray(config.layer)) {
        this.layer = config.layer;
	}
    
    if (config.zl) {
        this.zl = config.zl;
    }

    if (config.loc && OpenLayers.Util.isArray(config.loc) && config.loc.length == 2) {
        this.loc = config.loc;
    }

    if (config.bbox && OpenLayers.Util.isArray(config.bbox) && config.bbox.length == 4) {
        this.bbox = config.bbox;
    }
    
    if (config.marker && OpenLayers.Util.isArray(config.marker) && config.marker.length == 2) {
        this.marker = config.marker;
    }
    
    if (config.div) {
    	this.div = config.div;
    }
}

/**
 * @private
 * 
 * Creates an OpenLayers Map object due to the given config.
 */
Lusc.Api.prototype.createOlMap = function() {
    var olMap = new OpenLayers.Map ({
        controls: [
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.Zoom()
        ],
        maxExtent: new OpenLayers.Bounds(-285401.92,22598.08,595401.9199999999,903401.9199999999),
        theme: null,
		resolutions: [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76,
					26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42],
        units: 'm',
        projection: new OpenLayers.Projection("EPSG:28992"),
        div: (this.div != null) ? this.div : 'map'
      });
    
    
    // create TMS
	lyrBRTAchtergrondkaart = new OpenLayers.Layer.TMS(
		"BRT Achtergrondkaart",
		"http://geodata.nationaalgeoregister.nl/tms/",
		{layername: "brtachtergrondkaart", type:"png8"}
	);
    olMap.addLayer(lyrBRTAchtergrondkaart);
	
    // apply layer if a layer was given
	if (this.layer != null) {
		var layer = null;
		var l;
		for (l in this.layer)
		{
			switch (this.layer[l].toUpperCase()){
				case "AAN":
					var layer = new OpenLayers.Layer.WMS.Untiled(
							"AAN",
							"http://geodata.nationaalgeoregister.nl/aan/wms",
							{layers: 'aan',transparent: 'true',format: "image/gif"},
							{visibility: true,isBaseLayer:false},
							{singleTile: true}
					);
					olMap.addLayer(layer);
					break;
				case "AHN25M":
					var layer = new OpenLayers.Layer.WMS.Untiled(
							"AHN25M",
							"http://geodata.nationaalgeoregister.nl/ahn25m/wms",
							{layers: 'ahn25m',transparent: 'true',format: "image/gif"},
							{visibility: true,isBaseLayer:false},
							{singleTile: true}
					);
					olMap.addLayer(layer);
					break;
				case "GEMEENTEGRENZEN":
					var layer = new OpenLayers.Layer.WMS.Untiled(
							"Gemeentegrenzen",
							"http://geodata.nationaalgeoregister.nl/bestuurlijkegrenzen/wms?sld=http://luuks.github.com/API/gemeentegrenzen_grijs_gestippeld.sld",
							{layers: 'gemeenten',transparent: 'true',format: "image/gif"},
							{visibility: true,isBaseLayer:false},
							{singleTile: true}
					);
					olMap.addLayer(layer);
					break;
				case "NATIONALE_PARKEN":
					var layer = new OpenLayers.Layer.WMS.Untiled(
							"Nationale parken",
							"http://geodata.nationaalgeoregister.nl/nationaleparken/wms",
							{layers: 'nationaleparken',transparent: 'true',format: "image/gif"},
							{visibility: true,isBaseLayer:false},
							{singleTile: true}
					);
					olMap.addLayer(layer);
					break;
				case "NOK2011":
					var layer = new OpenLayers.Layer.WMS.Untiled(
							"NOK2011",
							"http://geodata.nationaalgeoregister.nl/nok2011/wms",
							{layers: 'begrenzing,planologischeehs,verwervinginrichting',transparent: 'true',format: "image/gif"},
							{visibility: true,isBaseLayer:false},
							{singleTile: true}
					);
					olMap.addLayer(layer);
					break;
				case "TEXEL_20120423":
					var layer = new OpenLayers.Layer.WMS.Untiled(
							"Gevectoriseerde Bonnebladen",
							"http://mapserver.sara.nl/bonne_vect/cgi-bin/mapserv?map=bonne_vect_texel.map", 
							{layers: 'TEXEL_20120423',transparent: 'true',format: "image/gif"},
							{visibility: true,isBaseLayer:false},
							{singleTile: true}
					);
					olMap.addLayer(layer);
					break;
				case "TEXEL_20120423_OUTLINE":
					var layer = new OpenLayers.Layer.WMS.Untiled(
							"Gevectoriseerde Bonnebladen",
							"http://mapserver.sara.nl/bonne_vect/cgi-bin/mapserv?map=bonne_vect_texel.map", 
							{layers: 'TEXEL_20120423_OUTLINE',transparent: 'true',format: "image/gif"},
							{visibility: true,isBaseLayer:false},
							{singleTile: true},
							{
								attribution: this.attribution
							} 
					);
					olMap.addLayer(layer);
					break;
				default:
					//do nothing
					var layer;
					break;
			}
		}
	}
	
    // apply BBOX or zoomlevel and location
    if (this.bbox != null) {
        olMap.zoomToExtent(OpenLayers.Bounds.fromArray(this.bbox).transform(olMap.displayProjection, olMap.getProjectionObject()));
	}
    else if (this.zl != null && this.loc != null) {
		olMap.setCenter (new OpenLayers.LonLat(parseInt(this.loc[0]), parseInt(this.loc[1])), parseInt(this.zl));
    } else {
        olMap.zoomToMaxExtent();
    }
    
    // add marker
    if (this.marker != null) {
        var markerGeom = new OpenLayers.Geometry.Point(this.marker[0], this.marker[1]);
        var markerFeat = new OpenLayers.Feature.Vector(markerGeom);
        
        var markerLayer = new OpenLayers.Layer.Vector('Marker', {
            styleMap: new OpenLayers.StyleMap(this.styleObj)
        });
        markerLayer.addFeatures([markerFeat]);
        
        olMap.addLayer(markerLayer);
    }

    return olMap;
}

/**
 * Returns the current map object of this instance.
 * @public
 */
Lusc.Api.prototype.getMapObject = function() {
	
	return this.map;
}
