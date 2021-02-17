//////////////////////////////////////////////
// Shapes

function ExportEllipsePath(path, exportOptions) {
    var _retina    = exportOptions.retina;
    var rDirection = path.property(1).valueAtTime(0, false) < 3 ? 1 : -1;
    var rWidth     = path.property(2).valueAtTime(0, false)[0] * _retina;
    var rHeight    = path.property(2).valueAtTime(0, false)[1] * _retina;
    var rX         = path.property(3).valueAtTime(0, false)[0] * _retina;
    var rY         = path.property(3).valueAtTime(0, false)[1] * _retina;

    // var a = [rDirection, rWidth, rHeight, rX, rY].join(", ");
    // alert("Ellipse: " + a);

    // Export
    var exportObj  = {
        'type':      'ellipse',
        'direction': rDirection,
        'width':     rWidth,
        'height':    rHeight,
        'x':         rX,
        'y':         rY,
        'timeline':  exportProps( path, ["Size", "Position"], ["size", "position"], exportOptions )
    };

    return exportObj;
}

function ExportRectPath(path, exportOptions) {
    // Path Props
    var _retina    = exportOptions.retina;
    var rDirection = path.property("Shape Direction").valueAtTime(0, false) < 3 ? 1 : -1;
    var rWidth     = path.property("Size").valueAtTime(0, false)[0] * _retina;
    var rHeight    = path.property("Size").valueAtTime(0, false)[1] * _retina;
    var rX         = path.property("Position").valueAtTime(0, false)[0] * _retina;
    var rY         = path.property("Position").valueAtTime(0, false)[1] * _retina;
    var rRound     = path.property("Roundness").valueAtTime(0, false) * _retina;
    // var rWidth     = path.property("Size").value[0] * _retina;
    // var rHeight    = path.property("Size").value[1] * _retina;
    // var rX         = path.property("Position").value[0] * _retina;
    // var rY         = path.property("Position").value[1] * _retina;
    // var rRound     = path.property("Roundness").value * _retina;

    // Export
    var exportObj  = {
        'type':      'rectangle',
        'direction': rDirection,
        'roundness': rRound,
        'width':     rWidth,
        'height':    rHeight,
        'x':         rX,
        'y':         rY,
        'timeline':  exportProps( path, ["Size", "Position", "Roundness"], ["size", "position", "roundness"], exportOptions )
    };

    return exportObj;
}

function ExportPolygonPath(path, exportOptions) {
    var _retina    = exportOptions.retina;
    var rDirection = path.property(1).valueAtTime(0, false) < 3 ? 1 : -1;
    var rType      = path.property(2).valueAtTime(0, false) == 2 ? "polygon" : "polystar";
    var rPoints    = path.property(3).valueAtTime(0, false);
    var rX         = path.property(4).valueAtTime(0, false)[0] * _retina;
    var rY         = path.property(4).valueAtTime(0, false)[1] * _retina;
    var rRotation  = path.property(5).valueAtTime(0, false);
    var rInRadius  = path.property(6).valueAtTime(0, false) * _retina;
    var rOutRadius = path.property(7).valueAtTime(0, false) * _retina;
    var rInRound   = path.property(8).valueAtTime(0, false) * _retina;
    var rOutRound  = path.property(9).valueAtTime(0, false) * _retina;
    
    // exportProps(prop, ["Color", "Opacity", "Stroke Width"], ["color", "opacity", "width"], exportOptions);
    
    // Export
    var exportObj;
    if(rType === 'polystar') {
        exportObj = {
            'type':      rType,
            'direction': rDirection,
            'points':    rPoints,
            'x':         rX,
            'y':         rY,
            'rotation':  rRotation,
            'inRadius':  rInRadius,
            'outRadius': rOutRadius,
            'inRound':   rInRound,
            'outRound':  rOutRound,
            'timeline':  exportProps(
                path,
                ["Position", "Rotation", "Points", "Inner Radius", "Outer Radius", "Inner Roundness", "Outer Roundness"],
                ["position", "rotation", "points", "innerRadius", "outerRadius", "innerRoundness", "outerRoundness"],
                exportOptions )
        };
    } else {
        exportObj = {
            'type':      rType,
            'direction': rDirection,
            'points':    rPoints,
            'x':         rX,
            'y':         rY,
            'rotation':  rRotation,
            'radius':    rOutRadius,
            'round':     rOutRound,
            'timeline':  exportProps(
                path,
                ["Rotation", "Points", "Position", "Outer Radius", "Outer Roundness"],
                ["rotation", "points", "Position", "radius", "round"],
                exportOptions )
        };
    }

    return exportObj;
}

function ExportShapePath(path, exportOptions) {
    // var a = [];
    // for(var i = 1; i <= path.numProperties; ++i) {
    //     a.push( path.property(i).name );
    // }
    // alert("Shape path: " + a.join(", "));
    // return {};
    var _retina    = exportOptions.retina;
    var rDirection = path.property("Shape Direction").valueAtTime(0, false) < 3 ? 1 : -1;
    var pPath      = path.property("Path");
    var rShape     = pPath.valueAtTime(0, false);
    var vertices   = [];
    var inTangents = [];
    var outTangents= [];
    var i, total   = rShape.vertices.length;
    
    for(i = 0; i < total; ++i) {
        vertices.push([
            rShape.vertices[i][0] * _retina,
            rShape.vertices[i][1] * _retina
        ]);
        
        inTangents.push([
            rShape.inTangents[i][0] * _retina,
            rShape.inTangents[i][1] * _retina
        ]);
        
        outTangents.push([
            rShape.outTangents[i][0] * _retina,
            rShape.outTangents[i][1] * _retina
        ]);
    }
    
    // Export
    var exportObj  = {
        'type':        "shape",
        'closed':      rShape.closed,
        'direction':   rDirection,
        'vertices':    vertices,
        'inTangents':  inTangents,
        'outTangents': outTangents,
        'timeline':    []
    };
    
    exportObj.timeline = exportPathAni( pPath, exportOptions );

    return exportObj;
}

function ExportShape(prop, exportOptions) {
    var shape     = {
        'name':      prop.name,
        'type':      'shape',
        'path':      {},
        'transform': ExportTransform( transform, exportOptions )
    };
    //
    return shape;
}
