/* Display markers on an interactive map
 *
 * Expected data
 * markers: A cursor of geojson documents
 *
 * */

Template.map.onCreated(function() {
	this.fullscreen = new ReactiveVar(false);
});

var OpenkiControl = L.Control.extend({
	options: {
		icon: '',
		action: '',
		title: '',
		position: 'topright'
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
	},

	onAdd: function(map) {
		return L.DomUtil.create('span', 'fa fa-'+this.options.icon+' '+this.options.action);
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
		icon: 'arrows-alt',
		action: '-fullscreen',
		title: mf('map.fullscreen', 'big map')
	});
	var closeFullscreenControl = new OpenkiControl({
		icon: 'close',
		action: '-fullscreenClose',
		title: mf('map.fullscreenClose', 'close')
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

		var controlSize = fullscreen ? '10vh' : (instance.data.height/10)+'px';
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

	var geojsonCandidateMarkerOptions = {
		radius: 10,
		fillColor: "#00ff00",
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

		// To give some perspective, we extend the bounds to include the region center when there are few markers
		if (count < 2) {
			for (centerPos in centers) { bounds.extend(centers[centerPos]); }
			count += 1;
		}
		if (bounds.isValid()) {
			// Have some padding
			bounds.pad(10);
			map.fitBounds(bounds);
		}
	}, 100);

	fitBounds();

	// Tracked so that observe() will be stopped when the template is destroyed
	Tracker.autorun(function() {
		var markers = instance.data.markers;
		markers.find().observe({
			added: function(mark) {
				// Marks that have the center flage set are not displayed but used for anchoring the map
				if (mark.center) {
					centers[mark._id] = L.geoJson(mark.loc).getBounds();
				} else {
					var marker = L.geoJson(mark.loc, {
						pointToLayer: function(feature, latlng) {
							var options = geojsonMarkerOptions;
							if (mark.proposed) options = geojsonProposedMarkerOptions;
							if (mark.candidate) options = geojsonCandidateMarkerOptions;

							var marker = L.circleMarker(latlng, options);
							// When the marker is clicked, mark it as 'selected' in the collection, and deselect all others
							marker.on('click', function() {
								markers.update({}, { $set: { selected: false } });
								markers.update(mark._id, { $set: { selected: true } });
							});
							return marker;
						}
					});
					layers[mark._id] = marker;
					marker.addTo(map);
				}
				fitBounds();
			},
			removed: function(mark) {
				if (layers[mark._id]) map.removeLayer(layers[mark._id]);
				delete layers[mark._id];
				delete centers[mark._id];
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
