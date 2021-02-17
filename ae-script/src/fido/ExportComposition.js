function ExportComposition(item, exportOptions) {
    if(!item instanceof CompItem) return null;
    var _retina = exportOptions.retina;
    var data = {
        "name":     item.name.replace(" ", "_"),
        "bg":       item.bgColor,
        "width":    item.width  * _retina,
        "height":   item.height * _retina,
        "duration": item.workAreaDuration,
        "layers":   [],
        "markers":  []
    };
    
    exportOptions.duration = data.duration;
    exportOptions.nextLayer = undefined;
    exportOptions.prevLayer = undefined;

    // Composition Markers
    for(var n = 1; n <= item.markerProperty.numKeys; ++n) {
        var value = item.markerProperty.keyValue(n);
        var mObj  = {
            'name'      : value.comment,
            'time'      : item.markerProperty.keyTime(n),
            'duration'  : value.duration
        };
        data.markers.push( mObj );
    }
    
    var i, total = item.numLayers;
    for(i = 1; i <= total; ++i) {
        var l = item.layer(i);
        var layer;
        
        if(l.enabled || l.isTrackMatte) {
            var marker = l.property("Marker");
            for(var n = 1; n <= marker.numKeys; ++n) {
                var value = marker.keyValue(n);
                var mObj  = {
                    'name'      : value.comment,
                    'time'      : marker.keyTime(n),
                    'duration'  : value.duration
                };
                data.markers.push( mObj );
            }
            if(i < total) {
                exportOptions.nextLayer = item.layer(i+1);
            }
            if(i > 1) {
                exportOptions.prevLayer = item.layer(i-1);
            }
            
            try {
                layer = ExportLayer( l, exportOptions );
            } catch(err) {
                alert('layer error: ' + l.name);
                return data;
            }
            if(layer !== undefined) {
                layer.duration = Math.min(layer.duration, data.duration);
                data.layers.push( layer );
            }
        }
    }

    return data;
};
