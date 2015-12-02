/* Display markers on an interactive map
 *
 * Expected data
 * markers: A cursor of geojson documents
 *
 * */

Template.map.onCreated(function() {
	this.fullscreen = new ReactiveVar(false);
});

var FaIcon = function(faClass) {
	return function() {
		return L.DomUtil.create('span', 'fa fa-'+faClass);
	}
}

var FaCompIcon = function(opClass, icClass) {
	return function() {
		var cont = L.DomUtil.create('span', 'fa');
		var op = L.DomUtil.create('i', 'fa fa-'+opClass, cont);

		var ic = L.DomUtil.create('i', 'fa fa-lg fa-'+icClass, cont)
		ic.style.position = 'absolute';
		ic.style.left = '0.7ex';
		L.DomUtil.setOpacity(ic, 0.5);

		return cont;
	}
}

var OpenkiControl = L.Control.extend({
	options: {
		icon: null,
		action: '',
		title: '',
		position: 'topright'
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
	},

	onAdd: function(map) {
		var elm = this.options.icon();
		L.DomUtil.addClass(elm, this.options.action);
		elm.setAttribute('title', this.options.title);
		return elm;
	}
});

Template.map.onRendered(function() {
	var instance = this;

	var layers = {};
	var centers = {};

	L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';

	var options = {
		zoomControl: false,
		attributionControl: false
	};

	var map = L.map(instance.find('.map'), options).setView(L.latLng(0,0), 1);


	// Add tiles depending on language
	var tiles = null;
	var tileLayers = {
		'de': 'OpenStreetMap.DE',
		'fr': 'OpenStreetMap.France',
		'default': 'OpenStreetMap.Mapnik'
	}
	instance.autorun(function() {
		if (tiles) map.removeLayer(tiles);
		var tileLayer = tileLayers[Session.get('locale')];
		if (!tileLayer) tileLayer = tileLayers['default'];
		tiles = L.tileLayer.provider(tileLayer);
		tiles.addTo(map);
	});


	// Depending on view state, different controls are shown
	var zoomControl = L.control.zoom({
		zoomInTitle: mf('map.zoomInTitle', 'zoom in'),
		zoomOutTitle: mf('map.zoomOutTitle', 'zoom out')
	});
	var attributionControl = L.control.attribution();
	var scaleControl = L.control.scale({
		imperial: Session.get('locale') == 'en'
	});
	var fullscreenControl = new OpenkiControl({
		icon: FaIcon('arrows-alt'),
		action: '-fullscreen',
		title: mf('map.fullscreen', 'big map')
	});
	var closeFullscreenControl = new OpenkiControl({
		icon: FaIcon('close'),
		action: '-fullscreenClose',
		title: mf('map.fullscreenClose', 'close')
	});
	var addMarkerControl = new OpenkiControl({
		icon: FaCompIcon('plus', 'map-marker'),
		action: '-addMarker',
		title: mf('map.addMarker', 'set marker')
	});
	var removeMarkerControl = new OpenkiControl({
		icon: FaCompIcon('minus', 'map-marker'),
		action: '-removeMarker',
		title: mf('map.removeMarker', 'remove the marker')
	});

	instance.autorun(function() {
		var fullscreen = instance.fullscreen.get();
		var mini = instance.data.mini;
		var show = function(control, show) {
			if (show) {
				map.addControl(control);
			} else {
				map.removeControl(control);
			}
		}

		show(attributionControl, fullscreen || !mini);
		show(zoomControl, !mini);
		show(scaleControl, fullscreen);
		show(fullscreenControl, !mini && !fullscreen);
		show(closeFullscreenControl, fullscreen);

		// This is actually a function we can call to establish a reactive
		// dependeny into the other instance.
		var allowPlacing = instance.data.allowPlacing;
		show(addMarkerControl, allowPlacing && allowPlacing());

		var allowRemoving = instance.data.allowRemoving;
		show(removeMarkerControl, allowRemoving && allowRemoving());

		var controlSize = fullscreen ? '10vh' : Math.max(30, instance.data.height/10)+'px';
		instance.$('span.fa').css({ 'font-size': controlSize });
	});

	var geojsonMarkerOptions = {
		radius: 10,
		fillColor: "#ff7800",
		color: "#000",
		weight: 1.5,
		opacity: 0.9,
		fillOpacity: 0.6
	};

	var geojsonProposedMarkerOptions = {
		radius: 8,
		fillColor: "#12f",
		color: "#222",
		weight: 1,
		opacity: 0.9,
		fillOpacity: 0.4
	};

	// Zoom to show all markers
	// This is debounc'd so it's only done after the last marker in a series is added
	var fitBounds = _.debounce(function() {
		var bounds = L.latLngBounds([]);
		var count = 0;
		for (layerPos in layers) {
			bounds.extend(layers[layerPos].getBounds());
			count += 1;
		}

		var maxZoom = 16;

		// To give some perspective, we extend the bounds to include the region center when there are few markers
		if (count < 2) {
			for (centerPos in centers) { bounds.extend(centers[centerPos]); }
			count += 1;
			if (count == 1) maxZoom = 13;
		}
		if (bounds.isValid()) {
			map.fitBounds(bounds, { padding: [20, 20], maxZoom: maxZoom });
		}
	}, 100);

	fitBounds();

	// This must be one of the ugliest pieces of code I've written ever
	var mainIcon = L.divIcon({
		'html': '<span class="fa fa-map-marker" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>'
	});

	// Tracked so that observe() will be stopped when the template is destroyed
	Tracker.autorun(function() {
		var markers = instance.data.markers;

		var addMarker = function(mark) {
			// Marks that have the center flage set are not displayed but used for anchoring the map
			if (mark.center) {
				centers[mark._id] = L.geoJson(mark.loc).getBounds();
			} else {
				var marker = L.geoJson(mark.loc, {
					pointToLayer: function(feature, latlng) {
						var marker;
						if (mark.proposed) {
							marker = L.circleMarker(latlng, geojsonProposedMarkerOptions);
						} else {
							marker = L.marker(latlng, {
								icon: mainIcon,
								draggable: mark.draggable }
							);
						}
						// When the marker is clicked, mark it as 'selected' in the collection, and deselect all others
						marker.on('click', function() {
							markers.update({}, { $set: { selected: false } });
							markers.update(mark._id, { $set: { selected: true } });
						});
						marker.on('dragend', function(event) {
							var marker = event.target;
							var latLng = marker.getLatLng();
							loc = {
								type: "Point",
								coordinates: [latLng.lng, latLng.lat]
							};
							map.panTo(latLng);
							markers.update(mark._id, { $set: { loc: loc } });
						});
						marker.on('mouseover', function() {
							markers.update({}, { $set: { hover: false } }, { multi: true });
							markers.update(mark._id, { $set: { hover: true } });
						});
						marker.on('mouseout', function() {
							markers.update({}, { $set: { hover: false } }, { multi: true });
						});
						return marker;
					}
				});
				layers[mark._id] = marker;
				marker.addTo(map);
			}
		};

		var removeMarker = function(mark) {
			if (layers[mark._id]) map.removeLayer(layers[mark._id]);
			delete layers[mark._id];
			delete centers[mark._id];
		};

		var updateMarker = function(mark) {
			var layer = layers[mark._id];
			if (!layer) return;
			layer.setStyle({ weight: mark.hover ? 5 : 1});
		};

		markers.find().observe({
			added: function(mark) {
				addMarker(mark);
				fitBounds();
			},

			changed: function(mark, oldMark)  {
				updateMarker(mark);
			},

			removed: function(mark) {
				removeMarker(mark);
				fitBounds();
			}
		});
	});

	Tracker.autorun(function() {
		instance.fullscreen.get();
		window.setTimeout(function() {
			map.invalidateSize();
			fitBounds();
		}, 0);
	});

	instance.proposeMarker = function() {
		var center = map.getCenter();
		instance.data.markers.insert({
			proposed: true,
			selected: true,
			loc: { type: 'Point', coordinates: [center.lng, center.lat] }
		});
	};

	instance.removeMarker = function() {
		instance.data.markers.update(
			{ main: true },
			{ $set: { remove: true } }
		);
	};
});

Template.map.helpers({
	mapStyle: function() {
		// The font-size is specified for the icon height
		if (Template.instance().fullscreen.get()) {
			return [
				"z-index: 9999",
				"position: fixed",
				"top: 0",
				"left: 0",
				"bottom: 0",
				"right: 0",
				"font-size: 10vh"
			].join('; ');
		} else {
			return [
				"width: "+(this.width ? ""+this.width+"px" : "100%"),
				"height: "+this.height+"px",
				"font-size: "+this.height/10+"px"
			].join(';');
		}
	},

	fullscreen: function () {
		return Template.instance().fullscreen.get();
	},

	fullscreenControl: function () {
		var instance = Template.instance();
		return !instance.data.mini && !Template.instance().fullscreen.get();
	},
});


Template.map.events({
	'click': function(event, instance) {
		if (instance.data.mini) instance.fullscreen.set(true);
	},

	'mousedown .-addMarker': function(event, instance) {
		instance.proposeMarker();
	},

	'click .-removeMarker': function(event, instance) {
		instance.removeMarker();
	},

	'click .-fullscreen': function(event, instance) {
		instance.fullscreen.set(true);
	},

	'click .-fullscreenClose': function(event, instance) {
		instance.fullscreen.set(false);
	},

	'keyup': function(event, instance) {
		// Press escape to close fullscreen
		if (event.keyCode == 27) instance.fullscreen.set(false);
	}
});
