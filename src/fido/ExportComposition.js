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
    
    exportOptions.duration = item.workAreaDuration;
    
    var i, total = item.numLayers;
    for(i = 1; i <= total; ++i) {
        var l = item.layer(i);
        var layer;
        if(l.enabled) {
            // data.timeline[ l.name ] = [];
            //
            // if(l.active) {
                if(l.nullLayer) {
                    var marker = l.property("Marker");
                    for(var n = 1; n <= marker.numKeys; ++n) {
                        var value = marker.keyValue(n);
                        var mObj  = {
                            'name'      : value.comment,
                            'time'      : marker.keyTime(n),
                            'duration'  : value.duration,
                            'action'    : value.cuePointName,
                            'params'    : value.getParameters()
                        };
                        data.markers.push( mObj );
                    }
                    // alert("Markers complete");
                } else {
                    layer = ExportLayer( l, exportOptions );
                    if(layer !== undefined) {
                        layer.duration = Math.min(layer.duration, data.duration);
                        data.layers.push( layer );
                    }
                }
                // if(layer.timeline.length > 0) {
                //     data.timeline[ l.name ] = layer.timeline;
                // }
            // } else if(l.audioEnabled) {
            //     // layer = ExportAudio( l );
            //     // data.layers.push( layer.layer );
            //     // if(layer.timeline.length > 0) {
            //     //     data.timeline[ l.name ] = layer.timeline;
            //     // }
            // }
        }
    }

    // Remove empty arrays
    // for(var obj in data.timeline) {
    //     if( data.timeline[obj].length === 0 ) {
    //         delete data.timeline[obj];
    //         data.timeline[obj] = undefined;
    //     }
    // }

    return data;
};
