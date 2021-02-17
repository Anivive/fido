var Obj = {
    isArray: function(obj) {
        return Object.prototype.toString.call( obj ) === '[object Array]';
    },
    isString: function(obj) {
        return typeof obj === 'string';
    },
    addTo: function(arr, item) {
        var i, total = arr.length;
        for(i = 0; i < total; ++i) {
            if(arr[i] == item) return; // already added
        }
        // New item
        arr.push( item );
    }
};

function between(value, min, max) {
    return value >= min && value <= max;
}

function normalize(value, min, max) {
  return (value - min) / (max - min);
}

// function getRelativeFilePath(file, aeRoot) {
//     var a = file.split(aeRoot + "/");
//     return a.length > 1 ? a[1] : a[0];
// }

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

function getFileObj(source) {
    var base = "";
    if(app.project.file !== null) {
        base = app.project.file.parent.absoluteURI;
    }
    var temp       = source.split("/");
    var fileName   = temp[ temp.length-1 ];
    var fileType   = getContentType( fileName );
    var filePath   = getRelativeFilePath( source );
    var isRelative = base.length > 1 && source.split( base ).length > 1;
    var file       = {
        "name"  : fileName,
        "path"  : filePath,
        "source": source,
        "type"  : fileType
    };
    if(fileType === 'audio') {
        if(!isRelative) file.path = "audio/" + fileName;
    } else if(fileType === 'image') {
        if(!isRelative) file.path = "images/" + fileName;
    } else if(fileType === 'video') {
        if(!isRelative) file.path = "video/" + fileName;
    }
    return file;
}

// var source = layer.source.mainSource.file.toString(); // original source
// var temp   = source.split("/");
// var fName  = temp[ temp.length-1 ]; // file name
// var relativeS  = getRelativeFilePath( source );
// var isRelative = source.split(app.project.file.parent.absoluteURI).length > 1;
// // writeLn( app.project.file.parent.absoluteURI );
// // var isRelate = false;
// //
// var file = {
//     "name"  : fName,
//     "path"  : relativeS,
//     "source": relativeS
// };
// //
// var type = getContentType( relativeS );
// if(type === 'audio') {
//     this.data.files.audio.push( relativeS );
// } else if(type === 'image') {
//     if(!isRelative) file.path = "images/" + fName;
//     this.data.files.image.push( file );
// }

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

function duplicateFile(original, path) {
    var file = new File(original);
    return file.copy(path);
}

function saveFile(data, path) {
    var json = JSON.stringify( data, null, "\t" );
    var file = new File(path);
    file.open("w");
    file.write(json);
    file.close();
}

function getCompIndexInProject(compName) {
    var i, total = app.project.items.length;
    for(i = 1; i <= total; ++i) {
        var itemName = app.project.items[i].name.toString();
        var itemType = app.project.items[i] instanceof CompItem;
        if( itemName === compName && itemType ) return i;
    }
    return -1;
}

function getCompByName(compName) {
    var i, item, total = app.project.items.length;
    for(i = 1; i <= total; ++i) {
        item = app.project.items[i];
        if( item.name === compName && item instanceof CompItem ) {
            return item;
        }
    }
    return undefined;
}

/**
 * @param comp - The composition to search through
 * @return { array } - List of all compositions as layers within specified composition
 */
function compWithCompLayers(comp) {
    var comps = [];
    if(!comp instanceof CompItem) return comps;

    var i, total = comp.numLayers;
    for(i = 1; i <= total; ++i) {
        var layer  = comp.layer(i);
        if(layer instanceof CompItem) {
            var isComp = getCompByName(layer.name) !== undefined;
            if(layer.enabled && isComp) {
                comps.push( layer.name );
            }
        }
    }
    return comps;
}
