function getType(source) {
    var typeA = source.split(".");
    var type  = typeA[ typeA.length-1 ];
    // Image
    if(type === 'jpg' || type === 'jpeg' || type === 'png' || type === 'gif') {
        return 'image';
    }
    // Audio
    else if(type === 'mp3' || type === 'wav') {
        return 'audio';
    }
    // Video
    else if(type === 'mov' || type === 'mp4') {
        return 'video';
    }
    return "noType";
}

function sortObjArray(arr, value) {
    var newArr = [], i, total = arr.length;
    for(i = 0; i < total; ++i) {
        newArr.push( arr[i][value] );
    }
    newArr.sort();
    return newArr;
}

function ExportLayer(item, exportOptions) {
    exportOptions.name = item.name;
    var _retina   = exportOptions.retina;
    
    //////////////////////////////////////////////////
    // Export layer
    var transform = item.property("Transform");
    var data      = {
        "name":      item.name.replace(" ", "_"),
        "type":      "",
        "start":     item.inPoint,
        "duration":  item.outPoint - item.inPoint,
        "transform": ExportTransform( transform, exportOptions ),
        "content":   []
    };
    
    if(item instanceof CameraLayer) {
        data.type    = "camera";
        data.content = ExportCamera( item, exportOptions );
    } else {
        var effects   = item.property("effect");
        data.effects = ExportEffects( effects, exportOptions );

        var masks = item.property("Masks");
        if( masks.numProperties > 0 ) {
            data.masks = [];
            for(var i = 1; i <= masks.numProperties; ++i) {
                var prop = masks.property(i).property("Mask Path");
                var path = prop.valueAtTime(0, false);
                
                var vertices   = [];
                var inTangents = [];
                var outTangents= [];
                var n, total   = path.vertices.length;
                
                for(n = 0; n < total; ++n) {
                    vertices.push([
                        path.vertices[n][0] * _retina,
                        path.vertices[n][1] * _retina
                    ]);
                    
                    inTangents.push([
                        path.inTangents[n][0] * _retina,
                        path.inTangents[n][1] * _retina
                    ]);
                    
                    outTangents.push([
                        path.outTangents[n][0] * _retina,
                        path.outTangents[n][1] * _retina
                    ]);
                }
                
                var mask = {
                    "name"       : masks.property(i).name.replace(" ", "_"),
                    "vertices"   : vertices,
                    "inTangents" : inTangents,
                    "outTangents": outTangents,
                    "timeline"   : exportPathAni( prop, exportOptions )
                };
                data.masks.push( mask );
            }
        }

        if(     item instanceof ShapeLayer) {
            var content = item.property("content");
            data.type = "shape";
            data.content = exportShapeContent( content, exportOptions );
            // data.content = sortObjArray(data.content, "type");
            // for(var i = 1; i <= content.numProperties; ++i) {
            //     var shape = ExportShape( content.property(i), exportOptions );
            //     if(shape !== undefined) data.content.push( shape );
            // }
        } else if(item instanceof TextLayer) {
            data.type = "text";
            data.content = ExportText( item, exportOptions );
        } else if(item instanceof AVLayer) {
            if(item.adjustmentLayer) {
                data.type = "adjustment";
            } else {
                if(item.source instanceof CompItem) {
                    data.type = "composition";
                    data.content = item.source.name.replace(" ", "_");
                } else if(item.source instanceof FootageItem) {
                    if(item.source.mainSource instanceof SolidSource) {
                        data.type    = "shape";
                        data.content = {
                            'type':   'square',
                            'color':  item.source.mainSource.color,
                            'width':  item.source.width,
                            'height': item.source.height
                        };
                    } else if(item.source.mainSource instanceof FileSource) {
                        var source = getRelativeFilePath( item.source.mainSource.file.toString() );
                        data.type  = getType( item.source.mainSource.file.toString() );
                        
                        if(data.type === "audio") {
                            if(!item.audioEnabled) return undefined; // layer isn't enabled
                            data.content = ExportAudio( item, exportOptions );
                            data.effects = data.transform = undefined;
                        } else if(data.type === "image") {
                            data.content = ExportAVLayer( item, exportOptions );
                        } else if(data.type === "video") {
                            data.content = ExportAVLayer( item, exportOptions );
                        }
                        
                    } else {
                        // placeholder
                        alert("placeholder!");
                    }
                }
            }
        }
    }

    return data;
};

//////////////////////////////////////////////////
// Test functions

function _isShape(p) {
    return p.property("Path") !== null;
}
function _isRect(p) {
    return p.property("Size") !== null && p.property("Position") !== null && p.property("Roundness") !== null;
    // return p.name.search("Rectangle Path") > -1;
}
function _isEllipse(p) {
    return p.property("Size") !== null && p.property("Position") !== null;
    // return p.name.search("Ellipse Path") > -1;
}
function _isPoly(p) {
    return p.property("Points") !== null;
    // return p.name.search("Polystar Path") > -1;
}

function getPropShape(prop, i, exportOptions) {
    //
    var content = prop.property("Contents");
    var paths   = [];
    var i, total = content.numProperties;
    for(i = 1; i <= total; ++i) {
        var sPath = content.property(i);
        if( sPath.active && sPath.enabled ) {
            
            if( _isRect(sPath) ) {
                // return ExportRectPath( sPath );
                paths.push( ExportRectPath( sPath, exportOptions ) );
            } else if( _isEllipse(sPath) ) {
                // return ExportEllipsePath( sPath );
                paths.push( ExportEllipsePath( sPath, exportOptions ) );
            } else if( _isPoly(sPath) ) {
                // return ExportPolygonPath( sPath );
                paths.push( ExportPolygonPath( sPath, exportOptions ) );
            } else if( _isShape(sPath) ) {
                // return ExportShapePath( sPath );
                paths.push( ExportShapePath( sPath, exportOptions ) );
            }
            
        }
    }
    return paths;
}

function exportShapeContent(content, exportOptions) {
    var _retina = exportOptions.retina;
    var layers = [];
    for(var i = 1; i <= content.numProperties; ++i) {
        var prop = content.property(i);
        if( prop.active && prop.enabled ) {
            
            var layer = {
                name   : prop.name.replace(" ", "_"),
                type   : "none"
                // value  : {}
            };
            
            
            // Stroke
            if( prop.property("Color") !== null && prop.property("Stroke Width") !== null ) {
                layer.type          = "stroke";
                layer.content       = undefined;
                layer.value = {
                    color:      prop.property("Color").valueAtTime(0, false),
                    opacity:    prop.property("Opacity").valueAtTime(0, false) / 100,
                    width:      prop.property("Stroke Width").valueAtTime(0, false) * _retina,
                    cap:        "butt",
                    corner:     "miter"
                };
                
                switch(prop.property("Line Cap").valueAtTime(0, false)) {
                    case 1:
                        layer.value.cap = "butt";
                    break;
                    case 2:
                        layer.value.cap = "round";
                    break;
                    case 3:
                        layer.value.cap = "bevel";
                    break;
                }
                
                switch(prop.property("Line Join").valueAtTime(0, false)) {
                    case 1:
                        layer.value.corner = "miter";
                    break;
                    case 2:
                        layer.value.corner = "round";
                    break;
                    case 3:
                        layer.value.corner = "bevel";
                    break;
                }
                
                layer.timeline = exportProps(prop, ["Color", "Opacity", "Stroke Width"], ["color", "opacity", "width"], exportOptions);
                if(layer.timeline.length > 0 && layer.timeline[0].name === "color") layer.timeline[0].name = "stroke";
                
                var dashes = prop.property("Dashes");
                layer.value.dashes = {
                    dash  : dashes.property("Dash").valueAtTime(0, false) * _retina,
                    gap   : dashes.property("Gap").valueAtTime(0, false) * _retina,
                    offset: dashes.property("Offset").valueAtTime(0, false) * _retina
                };
                
                if(!dashes.isModified) {
                        layer.value.dashes = undefined; // delete, not actually added
                }
                
                if(layer.value.dashes !== undefined) {
                    var dashedTL = exportProps(dashes, ["Dash", "Gap", "Offset"], ["dash", "gap", "offset"], exportOptions);
                    if(dashedTL.length > 0) {
                        layer.value.dashes.timeline = dashedTL;
                    }
                }
            }
            // Fill
            else if( prop.property("Color") !== null && prop.property("Opacity") !== null ) {
                layer.type          = "fill";
                layer.content       = undefined;
                layer.value = {
                    color:      prop.property("Color").valueAtTime(0, false),
                    opacity:    prop.property("Opacity").valueAtTime(0, false) / 100
                };
                layer.timeline      = exportProps(prop, ["Color", "Opacity"], ["color", "opacity"], exportOptions);
                if(layer.timeline.length > 0 && layer.timeline[0].name === "color") layer.timeline[0].name = "fill";
            }
            // Repeater
            else if( prop.property("Copies") !== null && prop.property("Offset") !== null && prop.property("Transform") !== null ) {
                var transform           = prop.property("Transform");
                layer.type              = "repeater";
                layer.value = {
                    copies: prop.property("Copies").valueAtTime(0, false),
                    offset: prop.property("Offset").valueAtTime(0, false),
                    transform: {
                        anchor  : transform.property("Anchor Point").valueAtTime(0, false),
                        position: transform.property("Position").valueAtTime(0, false),
                        rotation: transform.property("Rotation").valueAtTime(0, false),
                        scale   : [
                            transform.property("Scale").valueAtTime(0, false)[0] / 100,
                            transform.property("Scale").valueAtTime(0, false)[1] / 100
                        ]
                    }
                };
                
                layer.value.transform.anchor[0] *= _retina;
                layer.value.transform.anchor[1] *= _retina;
                layer.value.transform.position[0] *= _retina;
                layer.value.transform.position[1] *= _retina;
                
                layer.timeline = [];
                // Transform
                layer.timeline = layer.timeline.concat( exportProps(transform, [
                    "Anchor Point",
                    "Position",
                    "Scale",
                    "Rotation"
                ], [
                    "anchor",
                    "position",
                    "scale",
                    "rotationZ"
                ]) );
                // Repeater
                layer.timeline = layer.timeline.concat( exportProps(prop, [
                    "Copies",
                    "Offset"
                ], [
                    "copies",
                    "offset"
                ]) );
            }
            // Trim
            else if( prop.property("Start") !== null && prop.property("End") !== null && prop.property("Offset") !== null ) {
                layer.type          = "trim";
                layer.value = {
                    start:  prop.property("Start").valueAtTime(0, false),
                    end:    prop.property("End").valueAtTime(0, false),
                    offset: prop.property("Offset").valueAtTime(0, false),
                };
                // layer.value.start   = prop.property("Start").valueAtTime(0, false) / 100;
                // layer.value.end     = prop.property("End").valueAtTime(0, false);
                // layer.value.offset  = prop.property("Offset").valueAtTime(0, false) / 100;
                layer.timeline  = exportProps(prop, ["Start", "End", "Offset"], ["start", "end", "offset"], exportOptions);
                normalizeAnimation("start",  layer);
                normalizeAnimation("end",    layer);
                normalizeAnimation("offset", layer, 360 * _retina);
            }
            // Offset
            else if( prop.property("Amount") !== null && prop.property("Line Join") !== null && prop.property("Miter Limit") !== null ) {
                layer.type          = "offset";
                layer.value = {
                    amount: prop.property("Amount").valueAtTime(0, false)
                };
                // layer.value.amount  = prop.property("Amount").valueAtTime(0, false);
                layer.timeline      = exportProps(prop, ["Amount"], ["amount"], exportOptions);
            }
            // Wiggle
            else if( prop.property("Size") !== null && prop.property("Detail") !== null && prop.property("Temporal Phase") !== null ) {
                layer.type          = "wiggle";
                layer.value = {
                    size:   prop.property("Size").valueAtTime(0, false),
                    detail: prop.property("Detail").valueAtTime(0, false)
                };
                // layer.value.size    = prop.property("Size").valueAtTime(0, false);
                // layer.value.detail  = prop.property("Detail").valueAtTime(0, false);
            }
            // Twist
            else if( prop.property("Angle") !== null && prop.property("Center") !== null ) {
                layer.type          = "twist";
                layer.value = {
                    angle:  prop.property("Angle").valueAtTime(0, false),
                    center: prop.property("Center").valueAtTime(0, false)
                };
                // layer.value.angle   = prop.property("Angle").valueAtTime(0, false);
                // layer.value.center  = prop.property("Center").valueAtTime(0, false);
            }
            // Zig Zag
            else if( prop.property("Size") !== null && prop.property("Points") !== null && prop.property("Ridges per segment") !== null ) {
                layer.type          = "zigzag";
                layer.value = {
                    size:   prop.property("Size").valueAtTime(0, false),
                    ridges: prop.property("Ridges per segment").valueAtTime(0, false)
                };
                // layer.value.size    = prop.property("Size").valueAtTime(0, false);
                // layer.value.ridges  = prop.property("Ridges per segment").valueAtTime(0, false);
            }
            // Shape
            else if( prop.property("Contents") !== null ) {
                layer.type      = "shape";
                layer.content   = exportShapeContent( prop.property("Contents"), exportOptions );
                
                var isGroup = layer.name.toLowerCase().search("group");
                if(isGroup > -1) {
                    layer.type = "group";
                } else {
                    layer.paths = getPropShape( prop, i, exportOptions );
                    var transform   = ExportTransform2D( prop.property("Transform"), exportOptions );
                    transform.type  = "transform";
                    layer.content.push( transform );
                    
                    // Sort by type
                    layer.content.sort(function(a,b) {
                        if (a.type < b.type) return -1;
                        if (a.type > b.type) return 1;
                        return 0;
                    });
                }
            }
            // Path
            else if( prop.property("Path") !== null ) {
                layer = undefined;
            } else {
                layer = undefined;
            }
            
            if(layer !== undefined) layers.push( layer );
            
        }
    }
    return layers;
}

//is something: Rectangle Path 1
//Error exporting: Rectangle Path 1, Size :: undefined is not an object
//Error exporting: Rectangle Path 1, Position

//////////////////////////////////////////////////
// Layer calls

function ExportEffects(effects, exportOptions) {
    var a = [];
    var i, effect, total = effects.numProperties;
    for(i = 1; i <= total; ++i) {
        effect = effects.property(i);
        var obj = {
            'name': effect.name,
            'timeline': {}
            // 'keys': effect.numKeys
        };
        for(var n = 1; n < effect.numProperties; ++n) {
            var prop = effect.property(n);
            if(prop !== undefined && prop !== null && prop.name.length > 0 && prop.value !== undefined) {
                
                // obj[ prop.name ] = prop.valueAtTime(1);
                if(prop.isTimeVarying) {
                    obj[ prop.name ] = prop.keyValue(1);
                    obj.timeline[ prop.name ] = exportPropAni( effect, prop.name, prop.name.toLowerCase(), exportOptions )[0];
                    // obj[ prop.name ].start = prop.keyValue(1);
                    // obj[ prop.name ].end   = prop.keyValue(prop.numKeys);
                } else {
                    obj[ prop.name ] = prop.value;
                }
            }
        }
        // if(effect.isTimeVarying) {
        //     obj['start']     = effect.keyValue(1);
        //     obj['end']       = effect.keyValue(effect.numKeys);
        //     // obj['keyframes'] = ExportKeyframes( effect );
        // }
        a.push( obj );
    }
    return a;
}
