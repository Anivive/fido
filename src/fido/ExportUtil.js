function createTimestamp() {
    var output = "";
    var now = new Date(),
    _d  = ( now.getDate() ).toString(),
    _m  = ( now.getMonth() + 1 ).toString(),
    _y  = ( now.getUTCFullYear() ).toString(),
    _h  = ( now.getHours() ).toString(),
    _mn = ( now.getMinutes() ).toString(),
    _s  = ( now.getSeconds() ).toString();

    if( _m.length === 1)  _m = "0" + _m;
    if( _d.length === 1)  _d = "0" + _d;
    if( _h.length === 1)  _h = "0" + _h;
    if(_mn.length === 1) _mn = "0" + _mn;
    if( _s.length === 1)  _s = "0" + _s;
    
    output += _m  + "/";
    output += _d  + "/";
    output += _y  + " :: ";
    output += _h  + ":"
    output += _mn + ":";
    output += _s;

    return output;
}

function getRelativeFilePath(file) {
    var aeRoot = "/";
    if(app.project.file !== null) {
        aeRoot = app.project.file.parent.absoluteURI + "/";
    }
    var a = file.split(aeRoot);
    return a.length > 1 ? a[1] : a[0];
}

function getContentType(path) {
    var type = path.split(".");
    type = type[ type.length-1 ];
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
    return 'noType';
}

//

function ExportTransform(transform, exportOptions) {
    var _retina      = exportOptions.retina;
    var _anchorPoint = transform.property("Anchor Point");
    var _position    = transform.property("Position");
    var _scale       = transform.property("Scale");
    var _rotationX   = transform.property("xRotation");
    var _rotationY   = transform.property("yRotation");
    var _rotationZ   = transform.property("Rotation");
    var _opacity     = transform.property("Opacity");
    var obj          = {
        'anchor':      _anchorPoint.valueAtTime(0, false),
        'position':    _position.valueAtTime(0, false),
        'scale':       [
                        _scale.valueAtTime(0, false)[0] / 100,
                        _scale.valueAtTime(0, false)[1] / 100,
                        _scale.valueAtTime(0, false)[2] / 100
        ],
        'rotation':    [
                        _rotationX.valueAtTime(0, false),
                        _rotationY.valueAtTime(0, false),
                        _rotationZ.valueAtTime(0, false)
        ],
        'opacity':     _opacity.valueAtTime(0, false) / 100
    };
    
    obj.anchor[0] *= _retina;
    obj.anchor[1] *= _retina;
    if(obj.anchor.length > 2) obj.anchor[2] *= _retina;
    
    obj.position[0] *= _retina;
    obj.position[1] *= _retina;
    if(obj.position.length > 2) obj.position[2] *= _retina;

    if(_anchorPoint.numKeys > 0) {
        _anchorPoint    = _anchorPoint.keyValue(1);
        obj.anchor      = [
            _anchorPoint[0] * _retina,
            _anchorPoint[1] * _retina
        ];
        if(_anchorPoint.length > 2) obj.anchor.push(_anchorPoint[2] * _retina);
    }

    if(_opacity.numKeys > 0) {
        _opacity    = _opacity.keyValue(1);
        obj.opacity = _opacity / 100;
    }

    if(_position.numKeys > 0) {
        _position    = _position.keyValue(1);
        obj.position = [
            _position[0] * _retina,
            _position[1] * _retina
        ];
        if(_position.length > 2) obj.position.push(_position[2] * _retina);
    }

    if(_rotationX.numKeys > 0) {
        _rotationX = _rotationX.keyValue(1);
        obj.rotation[0] = _rotationX;
    }

    if(_rotationY.numKeys > 0) {
        _rotationY = _rotationY.keyValue(1);
        obj.rotation[1] = _rotationY;
    }

    if(_rotationZ.numKeys > 0) {
        _rotationZ = _rotationZ.keyValue(1);
        obj.rotation[2] = _rotationZ;
    }

    if(_scale.numKeys > 0) {
        _scale    = _scale.keyValue(1);
        obj.scale = [
            _scale[0] / 100,
            _scale[1] / 100,
            _scale[2] / 100
        ];
    }
    
    obj.timeline = [];
    obj.timeline = getKeyframesTransform( transform, exportOptions );

    return obj;
}

function ExportTransform2D(transform, exportOptions) {
    var _retina      = exportOptions.retina;
    var _anchorPoint = transform.property("Anchor Point");
    var _position    = transform.property("Position");
    var _scale       = transform.property("Scale");
    var _rotationZ   = transform.property("Rotation");
    var _opacity     = transform.property("Opacity");
    var obj          = {
        'anchor':      _anchorPoint.valueAtTime(0, false),
        'position':    _position.valueAtTime(0, false),
        'scale':       [
                        _scale.valueAtTime(0, false)[0] / 100,
                        _scale.valueAtTime(0, false)[1] / 100,
                        _scale.valueAtTime(0, false).length > 2 ? _scale.valueAtTime(0, false)[2] / 100 : 1
        ],
        'rotation':    [
                        0,
                        0,
                        _rotationZ.valueAtTime(0, false)
        ],
        'opacity':     _opacity.valueAtTime(0, false) / 100
    };
    
    obj.anchor[0] *= _retina;
    obj.anchor[1] *= _retina;
    if(obj.anchor.length > 2) obj.anchor[2] *= _retina;
    
    obj.position[0] *= _retina;
    obj.position[1] *= _retina;
    if(obj.position.length > 2) obj.position[2] *= _retina;

    if(_anchorPoint.numKeys > 0) {
        _anchorPoint    = _anchorPoint.keyValue(1);
        obj.anchor      = [
            _anchorPoint[0] * _retina,
            _anchorPoint[1] * _retina
        ];
        if(_anchorPoint.length > 2) obj.anchor.push(_anchorPoint[2] * _retina);
    }

    if(_opacity.numKeys > 0) {
        _opacity    = _opacity.keyValue(1);
        obj.opacity = _opacity / 100;
    }

    if(_position.numKeys > 0) {
        _position    = _position.keyValue(1);
        obj.position = [
            _position[0] * _retina,
            _position[1] * _retina
        ];
        if(_position.length > 2) obj.position.push(_position[2] * _retina);
    }

    if(_rotationZ.numKeys > 0) {
        _rotationZ = _rotationZ.keyValue(1);
        obj.rotation[2] = _rotationZ;
    }

    if(_scale.numKeys > 0) {
        _scale    = _scale.keyValue(1);
        obj.scale = [
            _scale[0] / 100,
            _scale[1] / 100,
            _scale[2] / 100
        ];
    }
    
    obj.timeline = [];
    obj.timeline = getKeyframesTransform( transform, exportOptions, true );

    return obj;
}

