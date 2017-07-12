var map = L.map('map').setView([-0.02, 36.7], 7);

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXJpY2tvdGVueW8iLCJhIjoiY2owYXlsb2kxMDAwcjJxcDk3a2Q0MmdpZSJ9.GJQzHfNMElZ7OhW_HbnaXw', {
  maxZoom: 18,
  attribution: ' Tiles &copy; <a href="http://www.mapbox.com">MapBox</a>'
}).addTo(map);

map.spin(true);

var votersLayer;


function getColor(d) {
  return d > 800000 ? '#33000F' :
    d > 900000 ? '#4C0016' :
    d > 600000 ? '#66001E' :
    d > 500000 ? '#7F0025' :
    d > 400000 ? '#99002D' :
    d > 300000 ? '#CC194E' :
    d > 200000 ? '#FF6693' :
    d > 100000 ? '#FF7FA5' :
    d > 70000 ? '#FFB2C9' :
    '#FFE5ED';
}


function style(feature) {
  return {
    fillColor: getColor(feature.properties.VOTERS),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });
  info.update(layer.feature.properties);
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  votersLayer.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}



function onEachFeature(feature, layer) {
  var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>County Name</th><td>" + feature.properties.COUNTY + "</td></tr>" + "<tr><th> No of Voters</th><td>" + feature.properties.VOTERS + "</td></tr>" + "<table>";

  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: function(e) {
      $("#feature-title").html(feature.properties.COUNTY);
      $("#feature-info").html(content);
      $("#featureModal").modal("show");
    }
  });
}

var votersLayer = L.geoJson(null, {
  style: style,
  onEachFeature: onEachFeature
});

$.ajax({
  methods: "GET",
  url: 'https://s3-eu-west-1.amazonaws.com/myspatialdata/voters_by_county.geojson',
  success: function(data) {
    votersLayer.addData(data);
    map.addLayer(votersLayer);
    map.fitBounds(votersLayer.getBounds());
    map.spin(false);
  }
});
var info = L.control();

info.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function(props) {
  this._div.innerHTML = '<h4>Voters by County</h4>' + (props ?
    '<b>' + props.COUNTY + '</b><br />' + "<b>" + props.VOTERS + " Voters </b>" :
    'Hover over a County');
};

info.addTo(map);
var legend = L.control({
  position: 'bottomright'
});

legend.onAdd = function(map) {

  var div = L.DomUtil.create('div', 'info legend'),
    grades = [70000, 100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000],
    labels = [];
  div.innerHTML = "<b> Voters Legend </b><br>"

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};

legend.addTo(map);
