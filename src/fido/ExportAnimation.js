function getPropType(prop) {
    if( prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL ||
        prop.propertyValueType === PropertyValueType.ThreeD ) {
        return 3;
    } else
    if( prop.propertyValueType === PropertyValueType.TwoD_SPATIAL ||
        prop.propertyValueType === PropertyValueType.TwoD ) {
        return 2;
    } else
    if( prop.propertyValueType === PropertyValueType.OneD ) {
        return 1;
    } else
    if( prop.propertyValueType === PropertyValueType.COLOR ) {
        return 4;
    }
    return [ prop.propertyValueType ];
}

function getProps(prop) {
    var output = "";
    var total = prop.numProperties;
    for(var i = 1; i <= total; ++i) {
        output += prop.property(i).name;
        if(i < total) output += ", ";
    }
    return output;
}

function testProp(prop) {
    var i, total = prop.numKeys;
    for(i = 1; 1 < total; ++i) {
        var n     = i + 1;
        var _inA  = prop.keyInTemporalEase(i)[0].influence.toString()  + ", " + prop.keyInTemporalEase(i)[0].speed.toString();
        var _outA = (prop.keyOutTemporalEase(i)[0].influence / 100).toString() + ", " + prop.keyOutTemporalEase(i)[0].speed.toString();
        var _inB  = (prop.keyInTemporalEase(n)[0].influence  / 100).toString() + ", " + (1-prop.keyInTemporalEase(n)[0].speed).toString();
        var _outB = prop.keyOutTemporalEase(n)[0].influence.toString() + ", " + prop.keyOutTemporalEase(n)[0].speed.toString();
        alert("Duration: " + (prop.keyTime(n) - prop.keyTime(i)).toFixed(2));
        // alert(_inA);  // 0.01, 0
        alert(_outA); // 75, 0 (key in)
        alert(_inB);  // 50, 0 (key out)
        // alert(_outB); // 0.01, 0
        // alert("In: "  + t1.toFixed(2) + " : " + (prop.keyInTemporalEase(i)[_i].influence).toString() + ", " + (prop.keyOutTemporalEase(i)[_i].speed).toString());
        // alert("Out: " + t2.toFixed(2) + " : " + (prop.keyInTemporalEase(n)[_i].influence).toString() + ", " + (prop.keyOutTemporalEase(n)[_i].speed).toString());
    }
}

function bezierKeyframes(prop, pName, options) {
    var keys = [];
    if(prop.numKeys <= 1) {
        return keys;
    }
    //
    var i, total = prop.numKeys;
    for(i = 1; i < total; ++i) {
        var n    = i + 1;
        var t1   = prop.keyTime(i);
        var t2   = prop.keyTime(n);
        var val1 = prop.keyValue(i);
        var val2 = prop.keyValue(n);
        if(t1 < options.duration) {
            var x1 = 0;
            var x2 = 0;
            var y1 = 0;
            var y2 = 0;
            var key  = {
                "type":     "bezier",
                "value":    val1,
                "target":   val2,
                "start":    t1,
                "duration": t2 - t1,
                "x0":       x1,
                "y0":       y1,
                "x1":       x2,
                "y1":       y2
            };
            //
            if(prop.propertyValueType !== PropertyValueType.OneD) {
                if(val1[0] !== val2[0]) {
                    val1 = val1[0];
                    val2 = val2[0];
                } else if(val1[1] !== val2[1]) {
                    val1 = val1[1];
                    val2 = val2[1];
                } else if(val1[2] !== val2[2]) {
                    val1 = val1[2];
                    val2 = val2[2];
                }
            }
            //
            var _min = Math.min(val1, val2);
            var _max = Math.max(val1, val2);
            var _range = _max - _min;
            //
            var delta_t = t2-t1;
            var delta   = val2-val1;
            var avSpeed = Math.abs(delta) / delta_t;
            x1 = prop.keyOutTemporalEase(i)[0].influence /100;
            
            if( prop.keyOutInterpolationType(i) === KeyframeInterpolationType.HOLD ) {
                // Hold
                x1 = y1 = 1/6;
                x2 = y2 = 1 - x1;
                key.type = "hold";
            } else {
                // Ease
                if( prop.keyOutInterpolationType(i) === KeyframeInterpolationType.LINEAR ) {
                    x1 = y1 = 1/6;
                }
                if( prop.keyInInterpolationType(n) === KeyframeInterpolationType.LINEAR ) {
                    x2 = y2 = 1 - (1/6);
                }
                
                if( prop.keyOutInterpolationType(i) === KeyframeInterpolationType.LINEAR &&
                    prop.keyInInterpolationType(n)  === KeyframeInterpolationType.LINEAR ) {
                    x1 = y1 = 1/6;
                    x2 = y2 = 1 - x1;
                    key.type = "linear";
                } else {
                    if (val1<val2){//, this should reproduce your website:     
                        y1 = Math.abs( x1*prop.keyOutTemporalEase(i)[0].speed / avSpeed );
                        x2 = 1-prop.keyInTemporalEase(n)[0].influence /100;
                        y2 = 1-(1-x2)*(prop.keyInTemporalEase(n)[0].speed / avSpeed);
                    } else if (val2<val1){//, to get a curve starting from point [0,1] going to point [1,0], it would be:
                        y1 = Math.abs( (-x1)*prop.keyOutTemporalEase(i)[0].speed / avSpeed );
                        x2 = prop.keyInTemporalEase(n)[0].influence /100;
                        y2 = 1+x2*(prop.keyInTemporalEase(n)[0].speed / avSpeed);
                        if(y2 > 1) y2 = 2 - y2;
                        x2 = 1-x2;
                    } else if (val1==val2){
                        x1 = prop.keyOutTemporalEase(i)[0].influence /100;  
                        y1 = Math.abs( (-x1)*prop.keyOutTemporalEase(i)[0].speed / (_range/(t2-t1)) );
                        x2 = prop.keyInTemporalEase(n)[0].influence /100;
                        y2 = 1+x2*(prop.keyInTemporalEase(n)[0].speed / (_range/(t2-t1)));
                        x2 = 1-x2;
                    }
                }
            }
            //
            key.x0 = x1;
            key.y0 = y1;
            key.x1 = x2;
            key.y1 = y2;
            keys.push( key );
        }
    }
    return {
        "name": pName,
        "keys": keys
    };
}

function textKeyframes(prop, pName, options) {
    var keys = [];
    if(prop.numKeys <= 1) {
        return keys;
    }
    //
    var i, total = prop.numKeys;
    var ease = 1/6;
    for(i = 1; i < total; ++i) {
        var n    = i + 1;
        var t1   = prop.keyTime(i);
        var t2   = prop.keyTime(n);
        var val1 = prop.keyValue(i);
        var val2 = prop.keyValue(n);
        if(val1 !== val2 && t1 < options.duration) {
            keys.push({
                type:     "hold",
                value:    val1.toString(),
                target:   val2.toString(),
                start:    t1,
                duration: t2 - t1,
                x0:       ease,
                y0:       ease,
                x1:       1-ease,
                y1:       1-ease
            });
        }
    }
    return {
        "name": pName,
        "keys": keys
    };
}

/*
Change vertices: 0 1: 1024 x 0 2: 0 x 0
Change vertices: 0 1: 0 x 0 2: 0 x 0
Change vertices: 0 1: 0 x 0 2: 0 x 0
 */

function exportPathAni(path, exportOptions) {
    var _retina = exportOptions.retina;
    function findShapeAni(prop, start, finish) {
        // alert( prop.vertices.length );
        var ani = {
            "start": 0,
            "end":   0
        };
        var val1 = prop.keyValue(start);
        var val2 = prop.keyValue(finish);
        var i, total = val1.vertices.length;
        // alert("Vertices: " + total.toString());
        for(i = 0; i < total; ++i) {
            
            // Vertices
            var x1 = val1.vertices[i][0] * _retina;
            var y1 = val1.vertices[i][1] * _retina;
            var x2 = val2.vertices[i][0] * _retina;
            var y2 = val2.vertices[i][1] * _retina;
            if(x1 !== x2 || y1 !== y2) {
                if(x1 !== x2) {
                    ani.start = x1;
                    ani.end   = x2;
                } else {
                    ani.start = y1;
                    ani.end   = y2;
                }
                return ani;
            }
            
            // In Tangents
            x1 = val1.inTangents[i][0] * _retina;
            y1 = val1.inTangents[i][1] * _retina;
            x2 = val2.inTangents[i][0] * _retina;
            y2 = val2.inTangents[i][1] * _retina;
            if(x1 !== x2 || y1 !== y2) {
                if(x1 !== x2) {
                    ani.start = x1;
                    ani.end   = x2;
                } else {
                    ani.start = y1;
                    ani.end   = y2;
                }
                return ani;
            }
            
            // Out Tangents
            x1 = val1.outTangents[i][0] * _retina;
            y1 = val1.outTangents[i][1] * _retina;
            x2 = val2.outTangents[i][0] * _retina;
            y2 = val2.outTangents[i][1] * _retina;
            if(x1 !== x2 || y1 !== y2) {
                if(x1 !== x2) {
                    ani.start = x1;
                    ani.end   = x2;
                } else {
                    ani.start = y1;
                    ani.end   = y2;
                }
                return ani;
            }
        }
        return ani;
    }
    //
    var keys = [];
    if(path.numKeys <= 1) return keys;
    
    var i, total = path.numKeys;
    for(i = 1; i < total; ++i) {
        var n    = i + 1;
        var t1   = path.keyTime(i);
        var t2   = path.keyTime(n);
        var ani  = findShapeAni(path, i, n);
        var val1 = ani.start;
        var val2 = ani.end;
        if(val1 !== val2) {
            var x1 = 0;
            var x2 = 0;
            var y1 = 0;
            var y2 = 0;
            var verticesValue       = [];
            var inTangentsValue     = [];
            var outTangentsValue    = [];
            var verticesTarget      = [];
            var inTangentsTarget    = [];
            var outTangentsTarget   = [];
            var c, totalVerts = path.keyValue(i).vertices.length;
            for(c = 0; c < totalVerts; ++c) {
                verticesValue.push([
                    path.keyValue(i).vertices[c][0] * _retina,
                    path.keyValue(i).vertices[c][1] * _retina
                ]);
                inTangentsValue.push([
                    path.keyValue(i).inTangents[c][0] * _retina,
                    path.keyValue(i).inTangents[c][1] * _retina
                ]);
                outTangentsValue.push([
                    path.keyValue(i).outTangents[c][0] * _retina,
                    path.keyValue(i).outTangents[c][1] * _retina
                ]);
                
                verticesTarget.push([
                    path.keyValue(n).vertices[c][0] * _retina,
                    path.keyValue(n).vertices[c][1] * _retina
                ]);
                inTangentsTarget.push([
                    path.keyValue(n).inTangents[c][0] * _retina,
                    path.keyValue(n).inTangents[c][1] * _retina
                ]);
                outTangentsTarget.push([
                    path.keyValue(n).outTangents[c][0] * _retina,
                    path.keyValue(n).outTangents[c][1] * _retina
                ]);
            }
            
            var key  = {
                "type"              : "bezier",
                "start"             : t1,
                "duration"          : t2 - t1,
                "x0"                : x1,
                "y0"                : y1,
                "x1"                : x2,
                "y1"                : y2,
                "verticesValue"     : verticesValue,
                "inTangentsValue"   : inTangentsValue,
                "outTangentsValue"  : outTangentsValue,
                "verticesTarget"    : verticesTarget,
                "inTangentsTarget"  : inTangentsTarget,
                "outTangentsTarget" : outTangentsTarget
            };
            //
            var _min = Math.min(val1, val2);
            var _max = Math.max(val1, val2);
            var _range = _max - _min;
            //
            var delta_t = t2-t1;
            var delta   = val2-val1;
            var avSpeed = Math.abs(delta) / delta_t;
            x1 = path.keyOutTemporalEase(i)[0].influence /100;
            
            var oHold   = path.keyOutInterpolationType(i) === KeyframeInterpolationType.HOLD;
            var oLinear = path.keyOutInterpolationType(i) === KeyframeInterpolationType.LINEAR;
            var oBezier = !oHold && !oLinear;
            
            var iHold   = path.keyInInterpolationType(n) === KeyframeInterpolationType.HOLD;
            var iLinear = path.keyInInterpolationType(n) === KeyframeInterpolationType.LINEAR;
            var iBezier = !oHold && !oLinear;
            
            if( oHold ) {
                // Hold
                x1 = y1 = 1/6;
                x2 = y2 = 1 - x1;
                key.type = "hold";
            } else {
                // Ease
                if( oLinear && iLinear ) {
                    x1 = y1 = 1/6;
                    x2 = y2 = 1 - x1;
                    key.type = "linear";
                } else {
                    // Is linear?
                    if(x1 === path.keyOutTemporalEase(n)[0].influence /100) {
                        y1 = Math.abs( x1 );
                        x2 = 1 - x1;
                        y2 = 1 - x1;
                    } else {
                        if (val1<val2){//, this should reproduce your website:     
                            y1 = Math.abs( x1*path.keyOutTemporalEase(i)[0].speed / avSpeed );
                            x2 = 1-path.keyInTemporalEase(n)[0].influence /100;
                            y2 = 1-(1-x2)*(path.keyInTemporalEase(n)[0].speed / avSpeed);
                        } else if (val2<val1){//, to get a curve starting from point [0,1] going to point [1,0], it would be:
                            y1 = Math.abs( (-x1)*path.keyOutTemporalEase(i)[0].speed / avSpeed );
                            x2 = path.keyInTemporalEase(n)[0].influence /100;
                            y2 = 1+x2*(path.keyInTemporalEase(n)[0].speed / avSpeed);
                            x2 = 1-x2;
                        } else if (val1==val2){
                            x1 = path.keyOutTemporalEase(i)[0].influence /100;  
                            y1 = Math.abs( (-x1)*path.keyOutTemporalEase(i)[0].speed / (_range/(t2-t1)) );
                            x2 = path.keyInTemporalEase(n)[0].influence /100;
                            y2 = 1+x2*(path.keyInTemporalEase(n)[0].speed / (_range/(t2-t1)));
                            x2 = 1-x2;
                        }
                    }
                }
            }
            
            //
            key.x0 = x1;
            key.y0 = y1;
            key.x1 = x2;
            key.y1 = y2;
            keys.push( key );
        }
    }
    
    return [{
        "name": "shape",
        "keys": keys
    }];
}

function soloVectorAni(frames, name) {
    var color = false;
    var coords;
    if(frames[0].value.length > 3) {
        color  = true;
        coords = [];
        // coords = {
        //     r: [],
        //     g: [],
        //     b: [],
        //     a: []
        // };
    } else {
        coords = {
            x: [],
            y: [],
            z: []
        };
    }

    var newFrames = [];
    var i, total = frames.length;
    if(color) {
        coords = frames;
    } else {
        // XYZ
        for(i = 0; i < total; ++i) {
            var key = frames[i];
            if(key.value.length > 0 && key.value[0] !== key.target[0]) {
                var newKey = {
                    "type":     key.type,
                    "value":    key.value[0],
                    "target":   key.target[0],
                    "start":    key.start,
                    "duration": key.duration,
                    "x0":       key.x0,
                    "y0":       key.y0,
                    "x1":       key.x1,
                    "y1":       key.y1
                }
                coords.x.push( newKey );
            }

            if(key.value.length > 1 && key.value[1] !== key.target[1]) {
                var newKey = {
                    "type":     key.type,
                    "value":    key.value[1],
                    "target":   key.target[1],
                    "start":    key.start,
                    "duration": key.duration,
                    "x0":       key.x0,
                    "y0":       key.y0,
                    "x1":       key.x1,
                    "y1":       key.y1
                }
                coords.y.push( newKey );
            }

            if(key.value.length > 2 && key.value[2] !== key.target[2]) {
                var newKey = {
                    "type":     key.type,
                    "value":    key.value[2],
                    "target":   key.target[2],
                    "start":    key.start,
                    "duration": key.duration,
                    "x0":       key.x0,
                    "y0":       key.y0,
                    "x1":       key.x1,
                    "y1":       key.y1
                }
                coords.z.push( newKey );
            }
        }
    }

    if(color) {
        newFrames.push({
            "name": "color",
            "keys": coords
        });
    } else {
        if(coords.x.length > 0) {
            newFrames.push({
                "name": name+"X",
                "keys": coords.x
            });
        }

        if(coords.y.length > 0) {
            newFrames.push({
                "name": name+"Y",
                "keys": coords.y
            });
        }

        if(coords.z.length > 0) {
            newFrames.push({
                "name": name+"Z",
                "keys": coords.z
            });
        }
    }

    return newFrames;
}

function getFrameCSSInfo(propName) {
    switch(propName) {
        case "opacity":     return { name: "opacity", transform: false, unit: "" }; break;
        
        // Position
        case "positionX":   return { name: "translateX", transform: true, unit: "px" }; break;
        case "positionY":   return { name: "translateY", transform: true, unit: "px" }; break;
        case "positionZ":   return { name: "translateZ", transform: true, unit: "px" }; break;
        
        // Rotation
        case "rotationX":   return { name: "rotateX", transform: true, unit: "deg" }; break;
        case "rotationY":   return { name: "rotateY", transform: true, unit: "deg" }; break;
        case "rotationZ":   return { name: "rotateZ", transform: true, unit: "deg" }; break;
        
        // Scale
        case "scaleX":      return { name: "scaleX", transform: true, unit: "%" }; break;
        case "scaleY":      return { name: "scaleY", transform: true, unit: "%" }; break;
        case "scaleZ":      return { name: "scaleZ", transform: true, unit: "%" }; break;
    }
    return { name: "", transform: false };
}

//
function frameToCSS(lName, frame, propName, index) {
    // animation: name duration timing-function delay iteration-count direction fill-mode play-state;
    var css  = {
        keyframes: "",
        animation: []
    };
    var info = getFrameCSSInfo(propName);
    
    var fName = lName + "_" + propName + "_" + index.toString();
    css.keyframes += "@keyframes " + fName + " {\n";
    css.keyframes += "from {\n";
    if(info.transform) {
        css.keyframes += "transform: " + info.name + "(" + frame.value.toFixed(3)  + info.unit + "); }\n";
        css.keyframes += "to {\n";
        css.keyframes += "transform: " + info.name + "(" + frame.target.toFixed(3) + info.unit + "); }\n";
    } else {
        css.keyframes += info.name + ": " + frame.value.toFixed(3)  + "; }\n";
        css.keyframes += "to {\n";
        css.keyframes += info.name + ": " + frame.target.toFixed(3) + "; }\n";
    }
    css.keyframes += "}\n";
    
    // css.push( keys );
    css.animation.push( frame.duration.toFixed(3) + 's' ); // duration
    
    // timing-function
    if(frame.type === "bezier") {
        var ease = "cubic-bezier(";
        ease += frame.x0.toFixed(3) + ", ";
        ease += frame.y0.toFixed(3) + ", ";
        ease += frame.x1.toFixed(3) + ", ";
        ease += frame.y1.toFixed(3) + ")";
        css.animation.push( ease );
    } else {
        css.animation.push( "linear" );
    }
    
    css.animation.push( frame.start.toFixed(3) + "s" ); // delay
    // css.animation.push( 1 ); // count
    // css.animation.push( "normal" );
    // css.animation.push( "forwards" );
    css.animation = css.animation.join(" ");
    
    return css;
}

function createCSSAnimation(timeline, exportOptions) {
    var i, total = timeline.length;
    for(i = 0; i < total; ++i) {
        var n, keys, nKeys, iKeys, ani, start, duration, cssKeys = [], cssTiming = [], cssName = [];
        ani   = timeline[i];
        keys  = ani.keys;
        nKeys = keys.length;
        iKeys = nKeys - 1;
        start = keys[0].start;
        duration = keys[iKeys].start + keys[iKeys].duration;
        for(n = 0; n < nKeys; ++n) {
            var f = keys[n]; // frame
            var css = frameToCSS( exportOptions.name, f, ani.name, n );
            var fName = css.keyframes.slice(11, css.keyframes.indexOf("{")-1);
            cssKeys.push( css.keyframes );
            cssTiming.push( fName + " " + css.animation );
        }
        ani.css = {
            keyframes: cssKeys.join("\n"),
            animation: cssTiming.join(",\n")
        }
    }
    return timeline;
}


/*
function createCSSAnimation(timeline, exportOptions) {
    var i, total = timeline[0].keys.length, iTotal = total-1;
    
    // opacity: 0: 0.03333333333333
    alert(
        timeline[0].name +
        ": " +
        timeline[0].keys[0].start.toString() +
        ": " +
        (timeline[0].keys[0].start+timeline[0].keys[0].duration).toString()
    );
    
    // opacity: 0.26666666666667: 0.33333333333333
    alert(
        timeline[0].name +
        ": " +
        timeline[0].keys[iTotal].start.toString() +
        ": " +
        (timeline[0].keys[iTotal].start+timeline[0].keys[iTotal].duration).toString()
    );
    
    // for(i = 0; i < total; ++i) {
    //     var n, keys, nKeys, iKeys, ani, start, duration;
    //     ani   = timeline[i];
    //     keys  = ani.keys;
    //     nKeys = keys.length;
    //     iKeys = nKeys - 1;
    //     start = keys[0].start;
    //     duration = keys[iKeys].start + keys[iKeys].duration;
    //     for(n = 0; n < nKeys; ++n) {
    //         var f = keys[n]; // frame
    //         f.css = frameToCSS( exportOptions.name, f, ani.name );
    //     }
    // }
    return timeline;
}
*/

function exportPropAni(prop, name, cName, exportOptions) {
    var _retina  = exportOptions.retina;
    var timeline = [];
    var frames   = undefined;
    var _prop    = prop.property(name);
    var normalize = cName === "scale" || cName === "opacity";
    var i, total = 0;
    var applyRetina = false;
    
    switch(cName) {
        case "anchor":
        case "position":
        case "width":
        case "dash":
        case "gap":
        case "innerRadius":
        case "outerRadius":
            applyRetina = true;
        break;
    }
    
    if(_prop !== null && _prop.numKeys > 0) {
        switch(_prop.propertyValueType) {
            // 1D
            // Opacity, Rotation(z)
            case PropertyValueType.OneD:
                // alert("1D: " + name + " : " + cName);
                frames = bezierKeyframes( _prop, cName, exportOptions );
                total = frames.keys.length;
                if(normalize) {
                    for(i = 0; i < total; ++i) {
                        frames.keys[i].value  /= 100;
                        frames.keys[i].target /= 100;
                    }
                }
                if(applyRetina) {
                    for(i = 0; i < total; ++i) {
                        frames.keys[i].value  *= _retina;
                        frames.keys[i].target *= _retina;
                    }
                }
                timeline.push( frames );
            break;
            // 2D
            case PropertyValueType.TwoD_SPATIAL:
            case PropertyValueType.TwoD:
                // alert("2D: " + name + " : " + cName);
                frames = bezierKeyframes( _prop, cName, exportOptions );
                total = frames.keys.length;
                if(normalize) {
                    for(i = 0; i < total; ++i) {
                        frames.keys[i].value[0]  /= 100;
                        frames.keys[i].value[1]  /= 100;
                        frames.keys[i].target[0] /= 100;
                        frames.keys[i].target[1] /= 100;
                    }
                }
                if(applyRetina) {
                    for(i = 0; i < total; ++i) {
                        frames.keys[i].value[0]  *= _retina;
                        frames.keys[i].value[1]  *= _retina;
                        frames.keys[i].target[0] *= _retina;
                        frames.keys[i].target[1] *= _retina;
                    }
                }
                timeline = timeline.concat( soloVectorAni(frames.keys, cName) );
            break;
            // 3D
            // Position, 
            case PropertyValueType.ThreeD_SPATIAL:
            case PropertyValueType.ThreeD:
                if(_prop.dimensionsSeparated) {
                    var x = prop.property("x" + name);
                    var y = prop.property("y" + name);
                    var z = prop.property("z" + name);
                    if(x.numKeys > 0) {
                        frames = bezierKeyframes( x, cName + "X", exportOptions );
                        total = frames.keys.length;
                        if(applyRetina) {
                            for(i = 0; i < total; ++i) {
                                frames.keys[i].value  *= _retina;
                                frames.keys[i].target *= _retina;
                            }
                        }
                        timeline.push( frames );
                    }
                    if(y.numKeys > 0) {
                        frames = bezierKeyframes( y, cName + "Y", exportOptions );
                        total = frames.keys.length;
                        if(applyRetina) {
                            for(i = 0; i < total; ++i) {
                                frames.keys[i].value  *= _retina;
                                frames.keys[i].target *= _retina;
                            }
                        }
                        timeline.push( frames );
                    }
                    if(z.numKeys > 0) {
                        frames = bezierKeyframes( z, cName + "Z", exportOptions );
                        total = frames.keys.length;
                        if(applyRetina) {
                            for(i = 0; i < total; ++i) {
                                frames.keys[i].value  *= _retina;
                                frames.keys[i].target *= _retina;
                            }
                        }
                        timeline.push( frames );
                    }
                    // if(y.numKeys > 0) timeline.push( bezierKeyframes( y, cName + "Y", exportOptions ) );
                    // if(z.numKeys > 0) timeline.push( bezierKeyframes( z, cName + "Z", exportOptions ) );
                } else {
                    frames = bezierKeyframes( _prop, cName, exportOptions );
                    total = frames.keys.length;
                    if(normalize) {
                        for(i = 0; i < total; ++i) {
                            frames.keys[i].value[0]  /= 100;
                            frames.keys[i].value[1]  /= 100;
                            frames.keys[i].value[2]  /= 100;
                            frames.keys[i].target[0] /= 100;
                            frames.keys[i].target[1] /= 100;
                            frames.keys[i].target[2] /= 100;
                        }
                    }
                    if(applyRetina) {
                        for(i = 0; i < total; ++i) {
                            frames.keys[i].value[0]  *= _retina;
                            frames.keys[i].value[1]  *= _retina;
                            frames.keys[i].value[2]  *= _retina;
                            frames.keys[i].target[0] *= _retina;
                            frames.keys[i].target[1] *= _retina;
                            frames.keys[i].target[2] *= _retina;
                        }
                    }
                    timeline = timeline.concat( soloVectorAni(frames.keys, cName) );
                }
            break;
            // 4D
            case PropertyValueType.COLOR:
                // alert("4D: " + name + " : " + cName);
                frames   = bezierKeyframes( _prop, cName, exportOptions );
                timeline = timeline.concat( soloVectorAni(frames.keys, cName) );
            break;
            // Custom, don't animate
            case PropertyValueType.CUSTOM_VALUE:
                alert("Custom: " + name + " : " + cName);
                alert(_prop.value);
            break;
            // Shape? Vertices and stuff
            case PropertyValueType.SHAPE:
                alert("PROP IS SHAPE");
                // alert("Shape: " + name + " : " + cName);
                // _prop.value = Shape Object
                // alert(_prop.value.vertices);
                // alert(_prop.value.inTangents);
                // alert(_prop.value.outTangents);
            break;
            // Text doc? WTF
            case PropertyValueType.TEXT_DOCUMENT:
                // alert("Text: " + name + " : " + cName);
                // alert(_prop.value);
                frames = textKeyframes( _prop, cName, exportOptions );
                timeline.push( frames );
            break;
            // I dunno
            case PropertyValueType.NO_VALUE:
                alert("No value: " + name + " : " + cName);
                alert(_prop.value);
            break;
        }
    }
    if(exportOptions.css && timeline.length > 0) {
        timeline = createCSSAnimation(timeline, exportOptions);
    }
    return timeline;
}

function exportProps( prop, aeNames, codeNames, exportOptions ) {
    var i, total = aeNames.length, timeline = [];
    for(i = 0; i < total; ++i) {
        var _prop = undefined;
        try {
            _prop = exportPropAni( prop, aeNames[i], codeNames[i], exportOptions );
            if(_prop !== undefined && _prop["length"] !== undefined) {
                if(_prop.length > 0) timeline = timeline.concat( _prop );
            }
        } catch(err) {
            // alert("Error exporting: " + prop.name + ", " + aeNames[i] + " :: " + err.message);
            // alert("Prop: " + aeNames[i] + ", " + codeNames[i]);
            // alert(_prop);
        }
    }
    return timeline;
}

function getKeyframesTransform(transform, exportOptions, is2D) {
    var aeNames   = ["Anchor Point", "Position", "Scale", "X Rotation", "Y Rotation", "Rotation", "Opacity"];
    var codeNames = ["anchor", "position", "scale", "rotationX", "rotationY", "rotationZ", "opacity"];
    if(is2D) {
        aeNames   = ["Anchor Point", "Position", "Scale", "Rotation", "Opacity"];
        codeNames = ["anchor", "position", "scale", "rotationZ", "opacity"];
    }
    return exportProps( transform, aeNames, codeNames, exportOptions );
}

function normalizeAnimation(aniName, sLayer, _max) {
    var max = _max !== undefined ? _max : 100;
    if(sLayer.value[aniName] !== undefined) {
        sLayer.value[aniName] /= max;
    }
    
    var i, total = sLayer.timeline.length;
    for(i = 0; i < total; ++i) {
        var layer = sLayer.timeline[i];
        if(layer.name === aniName) {
            var n, nTotal = layer.keys.length;
            for(n = 0; n < nTotal; ++n) {
                var key = layer.keys[n];
                key.value  /= max;
                key.target /= max;
            }
        }
    }
}
