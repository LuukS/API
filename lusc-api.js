/**
 * @class Lusc.Api
 * 
 * Class implements an API for an easy to use embedding of
 * our pre-defined mapservices in any website with an OpenLayers slippy map.
 * This class is based upon the Terrestris WMS-API
 * The markerstyles are based upon the Mapicons from Nicolas Mollet (http://mapicons.nicolasmollet.com)
 * 
 * @examples
 * 
 *  <iframe width="400" height="300" frameborder="0" 
 *    scrolling="no" marginheight="0" marginwidth="0" 
 *    src="/api/api.html?mloc=136260,456394&loc=136260,456394&zl=8"
 *    style="border: 0">
 * OR
 *  <iframe width="400" height="300" frameborder="0" 
 *    scrolling="no" marginheight="0" marginwidth="0" 
 *    src="/api/api.html?mloc=136260,456394&mt=1&bbox=130000,450000,150000,470000"
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
     * Reference to markerlocation object
     */
    this.mloc = null;

    /**
     * Reference to markertype object
     */
    this.mt = null;

    /**
     * Reference to popup titel object
     */
    this.titel = null;
    
    /**
     * Reference to markertype object
     */
    this.tekst = null;
    
    /**
     * Reference to WMS-URL object
     */
    this.wmsurl = null;

    /**
     * Reference to WMS layer(s) object
     */
    this.wmslayers = null;

    /**
     * Reference to the DIV-id the map should be rendered in
     */
    this.div = null;
    
    /**
     * Reference to the graphic URL for the marker
     */
    this.externalGraphic = null;

    /**
     * Reference to the graphic radius for the marker
     */
    this.pointRadius = null;
    
    /**
     * @private
     * Look up array, having the supported layers.
     */
    this.supportedLayers = ["AAN","AHN25M","GEMEENTEGRENZEN","GEMEENTEGRENZEN_LABEL","NATIONALE_PARKEN","NOK2011","TEXEL_20120423","TEXEL_20120423_OUTLINE"];

    /**
     * @private
     * Look up array, having the supported markertypes.
     */
    this.markers = [
	    "default.png",
	    "rijk.png",
	    "information_blue.png",
	    "information_green.png",
	    "information_yellow.png",
	    "geonovum_blue.png",
	    "geonovum_green.png",
	    "geonovum_yellow.png",
	    "kadaster_blue.png",
	    "kadaster_green.png",
	    "kadaster_yellow.png",
	    "rijk_blue.png",
	    "rijk_green.png",
	    "rijk_yellow.png",
	    "star-3.png"
    ];
    
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
          externalGraphic: './markertypes/default.png'
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
    
    if (config.mloc && OpenLayers.Util.isArray(config.mloc) && config.mloc.length == 2) {
        this.mloc = config.mloc;
    }
    
    if (config.mt) {
        this.mt = config.mt;
    }

    if (config.titel) {
        this.titel = config.titel;
    }

    if (config.tekst) {
        this.tekst = config.tekst;
    }
    
    if (config.wmsurl) {
        this.wmsurl = config.wmsurl;
    }

    if (config.wmslayers) {
        this.wmslayers = config.wmslayers;
    }

    if (config.externalGraphic) {
        this.externalGraphic = config.externalGraphic;
    }

    if (config.pointRadius) {
        this.pointRadius = config.pointRadius;
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
    markerPath = "./markertypes/";
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
							{layers: 'gemeenten_2012',transparent: 'true',format: "image/gif"},
							{visibility: true,isBaseLayer:false},
							{singleTile: true}
					);
					olMap.addLayer(layer);
					break;
				case "GEMEENTEGRENZEN_LABEL":
					var layer = new OpenLayers.Layer.WMS.Untiled(
							"Gemeentegrenzen",
							"http://geodata.nationaalgeoregister.nl/bestuurlijkegrenzen/wms?sld=http://luuks.github.com/API/gemeentegrenzen_label_grijs_gestippeld.sld",
							{layers: 'gemeenten_2012',transparent: 'true',format: "image/gif"},
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
	
    // apply WMSURL and WMSLAYERS if applicable
	if ((this.wmsurl != null) && (this.wmslayers != null)) {
		var lyrWMS = new OpenLayers.Layer.WMS.Untiled(
				this.wmslayers,
				this.wmsurl, 
				{layers: this.wmslayers,transparent: 'true',format: "image/gif"},
				{visibility: true,isBaseLayer:false},
				{singleTile: true}
		);
        olMap.addLayer(lyrWMS);
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
    
    // add marker and use markertype if given, otherwise the default marker
    if (this.mloc != null) {
       var markerGeom = new OpenLayers.Geometry.Point(this.mloc[0], this.mloc[1]);
       var markerFeat = new OpenLayers.Feature.Vector(markerGeom);
       if (this.mt != null){
	        if ((this.mt >= 0) && (this.mt < this.markers.length)){
		        this.styleObj.externalGraphic = markerPath + this.markers[parseInt(this.mt)];
		    }
		    else{
		        this.styleObj.externalGraphic = markerPath + this.markers[0];
		    }
        }
        else if (this.externalGraphic != null){
        	this.styleObj.externalGraphic = this.externalGraphic;
        }
        if ((this.pointRadius !=null) && (this.pointRadius > 0)){
        	this.styleObj.pointRadius = this.pointRadius;
        }
        var markerLayer = new OpenLayers.Layer.Vector('Marker', {
            styleMap: new OpenLayers.StyleMap(this.styleObj)
        });

	    // add popup if the parameters titel or tekst are used
	    if (this.titel != null || this.tekst != null) {
	    	strOms = "";
	    	if (this.titel != null){
		    	strOms = "<h2>" + this.titel + "</h2>";
	    	}
	    	if (this.tekst != null){
		    	strOms = strOms + this.tekst;
	    	}
	    	markerFeat.attributes.oms = strOms;
	    	// Interaction; not needed for initial display.
            selectControl = new OpenLayers.Control.SelectFeature(markerLayer);
            olMap.addControl(selectControl);
            selectControl.activate();
            markerLayer.events.on({
                'featureselected': onFeatureSelect,
                'featureunselected': onFeatureUnselect
            });
		}

        olMap.addLayer(markerLayer);
        markerLayer.addFeatures([markerFeat]);
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

/**
 * Interaction functionality for clicking on the marker
 */
function onPopupClose(evt) {
    // 'this' is the popup.
    var feature = this.feature;
    if (feature.layer) { // The feature is not destroyed
        selectControl.unselect(feature);
    } else { // After "moveend" or "refresh" events on POIs layer all 
             //     features have been destroyed by the Strategy.BBOX
        this.destroy();
    }
}

function onFeatureSelect(evt) {
    feature = evt.feature;
    popup = new OpenLayers.Popup.FramedCloud("featurePopup",
                             feature.geometry.getBounds().getCenterLonLat(),
                             new OpenLayers.Size(100,100),
                             feature.attributes.oms,
                             null, true, onPopupClose);
    feature.popup = popup;
    popup.feature = feature;
    this.map.addPopup(popup, true);
}

function onFeatureUnselect(evt) {
    feature = evt.feature;
    if (feature.popup) {
        popup.feature = null;
        this.map.removePopup(feature.popup);
        feature.popup.destroy();
        feature.popup = null;
    }
}

Lusc.Api.prototype.getLayers = function(){
	return this.supportedLayers;
}    

Lusc.Api.prototype.getMarkers = function(){
	return this.markers;
}
Lusc.Api.prototype.getMarkerPath = function(){
	return markerPath;
}

Lusc.Api.prototype.setLocation = function(loc) {
	this.map.setCenter (new OpenLayers.LonLat(parseInt(loc[0]), parseInt(loc[1])));
}

Lusc.Api.prototype.setZoomLevel = function(zl) {
	this.map.zoomTo (zl);
}

Lusc.Api.prototype.reprojectWGS84toRD = function(lat,lon){
	Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.040,49.910,465.840,-0.40939,0.35971,-1.86849,4.0772";
	//Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.999908 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs <>";
	pointRD = new OpenLayers.LonLat(lon,lat)
        .transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from wgs84 
            new OpenLayers.Projection("EPSG:28992") // new RD
        );
	return(pointRD);
}
