/* Display markers on an interactive map
 *
 * Expected data
 * markers: A cursor of geojson documents
 *
 * */

Template.map.onRendered(function() {
	var instance = this;

	var layers = {};
	var centers = {};

	L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';

	var options = {};
	if (instance.data.mini) {
		options.zoomControl = false;
		options.attributionControl = false;
	}

	map = L.map(instance.find('.map'), options).setView(L.latLng(0,0), 1);
	L.tileLayer.provider('Thunderforest.Transport').addTo(map);

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
	}, 0);

	fitBounds();

	// Tracked so that observe() will be stopped when the template is destroyed
	Tracker.autorun(function() {
		var markers = instance.data.markers;
		markers.find().observe({
			added: function(mark) {
				// Marks that have the center flage set are not displayed but used for anchoring the map
				if (mark.center) {
					centers[mark._id] = L.geoJson(mark).getBounds();
				} else {
					var marker = L.geoJson(mark, {
						pointToLayer: function(feature, latlng) {
							var options = mark.proposed ? geojsonProposedMarkerOptions : geojsonMarkerOptions;
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
});

Template.map.helpers({
	mapStyle: function() {
		return "width: "+this.width+"px; height: "+this.height+"px;";
	}
});