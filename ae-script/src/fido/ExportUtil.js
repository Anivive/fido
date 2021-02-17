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

function getBlendmode(blend) {
  switch(blend) {
    case 1:
      return 'normal';
    break;
    
    case 3:
      return 'darken';
    break;
    case 4:
      return 'multiply';
    break;
    case 5:
      return 'colorBurn';
    break;
    case 6:
      return 'linearBurn';
    break;
    case 7:
      return 'darkenColor';
    break;
    
    case 9:
      return 'lighten';
    break;
    case 10:
      return 'screen';
    break;
    case 11:
      return 'colorDodge';
    break;
    case 12:
      return 'linearDodge';
    break;
    case 13:
      return 'lighterColor';
    break;
    
    case 15:
      return 'overlay';
    break;
    case 16:
      return 'softLight';
    break;
    case 17:
      return 'hardLight';
    break;
    case 18:
      return 'linearLight';
    break;
    case 19:
      return 'vividLight';
    break;
    case 20:
      return 'pinLight';
    break;
    case 21:
      return 'hardMix';
    break;
    
    case 23:
      return 'difference';
    break;
    case 24:
      return 'exclusion';
    break;
    
    case 26:
      return 'hue';
    break;
    case 27:
      return 'saturation';
    break;
    case 28:
      return 'color';
    break;
    case 29:
      return 'luminosity';
    break;
  }
  return 'unknown';
}

function getAVBlendmode(blend) {
  switch(blend) {
    case BlendingMode.ADD:
      return 'add';
    break;
    case BlendingMode.ALPHA_ADD:
      return 'alphaAdd';
    break;
    case BlendingMode.CLASSIC_COLOR_BURN:
      return 'classicColorBurn';
    break;
    case BlendingMode.CLASSIC_COLOR_DODGE:
      return 'classicColorDodge';
    break;
    case BlendingMode.CLASSIC_DIFFERENCE:
      return 'classicDifference';
    break;
    case BlendingMode.COLOR:
      return 'color';
    break;
    case BlendingMode.COLOR_BURN:
      return 'colorBurn';
    break;
    case BlendingMode.COLOR_DODGE:
      return 'colorDodge';
    break;
    case BlendingMode.DANCING_DISSOLVE:
      return 'dancingDissolve';
    break;
    case BlendingMode.DARKEN:
      return 'darken';
    break;
    case BlendingMode.DARKER_COLOR:
      return 'darkenColor';
    break;
    case BlendingMode.DIFFERENCE:
      return 'difference';
    break;
    case BlendingMode.DISSOLVE:
      return 'dissolve';
    break;
    case BlendingMode.EXCLUSION:
      return 'exclusion';
    break;
    case BlendingMode.HARD_LIGHT:
      return 'hardLight';
    break;
    case BlendingMode.HARD_MIX:
      return 'hardMix';
    break;
    case BlendingMode.HUE:
      return 'hue';
    break;
    case BlendingMode.LIGHTEN:
      return 'lighten';
    break;
    case BlendingMode.LIGHTER_COLOR:
      return 'lighterColor';
    break;
    case BlendingMode.LINEAR_BURN:
      return 'linearBurn';
    break;
    case BlendingMode.LINEAR_DODGE:
      return 'linearDodge';
    break;
    case BlendingMode.LINEAR_LIGHT:
      return 'linearLight';
    break;
    case BlendingMode.LUMINESCENT_PREMUL:
      return 'luminescentPremul';
    break;
    case BlendingMode.LUMINOSITY:
      return 'luminosity';
    break;
    case BlendingMode.MULTIPLY:
      return 'multiply';
    break;
    case BlendingMode.NORMAL:
      return 'normal';
    break;
    case BlendingMode.OVERLAY:
      return 'overlay';
    break;
    case BlendingMode.PIN_LIGHT:
      return 'pinLight';
    break;
    case BlendingMode.SATURATION:
      return 'saturation';
    break;
    case BlendingMode.SCREEN:
      return 'screen';
    break;
    case BlendingMode.SILHOUETE_ALPHA:
      return 'silhoueteAlpha';
    break;
    case BlendingMode.SILHOUETTE_LUMA:
      return 'silhoueteLuma';
    break;
    case BlendingMode.SOFT_LIGHT:
      return 'softLight';
    break;
    case BlendingMode.STENCIL_ALPHA:
      return 'stencilAlpha';
    break;
    case BlendingMode.STENCIL_LUMA:
      return 'stencilLuma';
    break;
    case BlendingMode.VIVID_LIGHT:
      return 'vividLight';
    break;
  }
  return 'unknown';
}

function getTrackMatte(trackMatteType) {
    switch(trackMatteType) {
        case TrackMatteType.ALPHA:
            return 'alpha';
        break;
        
        case TrackMatteType.ALPHA_INVERTED:
            return 'alphaInverted';
        break;
        
        case TrackMatteType.LUMA:
            return 'luma';
        break;
        
        case TrackMatteType.LUMA_INVERTED:
            return 'lumaInverted';
        break;
        
        case TrackMatteType.NO_TRACK_MATTE:
            return 'none';
        break;
    }
    return 'none';
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
    var _orientation = transform.property("Orientation"); // Camera
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
            1
        ];
        if(_scale.length > 2) obj.scale[2] = _scale[2] / 100;
    }
    if(_orientation !== undefined) {
        obj.orientation = _orientation.valueAtTime(0, false)
        if(_orientation.numKeys > 0) {
            _orientation    = _orientation.keyValue(1);
            obj.orientation = _orientation;
            if(_orientation.length > 2) obj.orientation.push(_orientation[2]);
        }
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
            1
        ];
        if(_scale.length > 2) obj.scale[2] = _scale[2] / 100;
    }
    
    obj.timeline = [];
    obj.timeline = getKeyframesTransform( transform, exportOptions, true );

    return obj;
}

