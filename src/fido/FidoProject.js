function FidoProject(exportData) {
    this.data   = {
        "build": "",
        "retina": exportData.retina !== 1,
        "assets": {
            "audio": [],
            "font":  [],
            "image": [],
            "video": []
        },
        "compositions": {}
    };
    return this;
};

FidoProject.prototype.build = function(compositions, exportOptions) {
    try {
        this.exportFiles( compositions, exportOptions );
    } catch(err) {
        alert("Error exporting assets");
    }
    
    try {
        this.exportCompositions( compositions, exportOptions );
    } catch(err) {
        alert("Error exporting compositions");
    }
    
    // this.data.defaultComp = exportOptions.defaultComp.replace(" ", "_");
    this.data.build       = createTimestamp();
    return this.data;
};

function inArray(item, array) {
    var i, total = array.length;
    for(i = 0; i < total; ++i) {
        if(item === array[i]) return true;
    }
    return false;
}

FidoProject.prototype.exportFiles = function(compNames, exportOptions) {
    var folder;
    if(exportOptions.assets) {
        folder = new Folder(exportOptions.dataPath + "/audio");
        if(!folder.exists) folder.create();
        
        folder = new Folder(exportOptions.dataPath + "/font");
        if(!folder.exists) folder.create();
        
        folder = new Folder(exportOptions.dataPath + "/images");
        if(!folder.exists) folder.create();
        
        folder = new Folder(exportOptions.dataPath + "/video");
        if(!folder.exists) folder.create();
    }

    var i, total = compNames.length;
    for(i = 0; i < total; ++i) {
        var index = getCompIndexInProject( compNames[i] );
        if(index > -1) {
            var comp = app.project.items[index];
            var n, nTotal = comp.numLayers;
            for(n = 1; n <= nTotal; ++n) {
                var layer = comp.layer(n);
                if(layer.enabled) {
                    if(layer instanceof AVLayer) {
                        if(layer.source.mainSource instanceof FileSource) {
                            //
                            var source = layer.source.mainSource.file.toString(); // original source
                            //jelly_07.jpg: images/jelly_07.jpg, ~/Pictures/ocean/jelly_07.jpg, image
                            //grid.png: images/global/grid.png, images/global/grid.png, image
                            var file    = getFileObj( source );
                            var type    = file.type;
                            var relativeS  = getRelativeFilePath( file.source );
                            file = file.source;
                            
                            if(type === "audio") {
                                if( !inArray(file, this.data.assets.audio) ) {
                                    this.data.assets.audio.push( file );
                                }
                            } else if(type === "image") {
                                if( !inArray(file, this.data.assets.image) ) {
                                    this.data.assets.image.push( file );
                                }
                            } else if(type === "video") {
                                if( !inArray(file, this.data.assets.video) ) {
                                    this.data.assets.video.push( file );
                                }
                            }
                            // var temp   = source.split("/");
                            // var fName  = temp[ temp.length-1 ]; // file name
                            // var relativeS  = getRelativeFilePath( source );
                            // var isRelative = source.split(app.project.file.parent.absoluteURI).length > 1;
                            // writeLn( app.project.file.parent.absoluteURI );
                            // var isRelate = false;
                            //
                            // var file = {
                            //     "name"  : fName,
                            //     "path"  : relativeS,
                            //     "source": relativeS
                            // };
                            //
                            // var type = getContentType( relativeS );
                            // if(type === 'audio') {
                            //     this.data.assets.audio.push( relativeS );
                            // } else if(type === 'image') {
                            //     // if(!isRelative) file.path = "images/" + fName;
                            //     this.data.assets.image.push( file );
                            // }
                            //
                            if(exportOptions.assets) {
                                var folder = "";
                                switch(type) {
                                    case 'audio':
                                        folder = 'audio';
                                    break;
                                    case 'image':
                                        folder = 'images';
                                    break;
                                    case 'video':
                                        folder = 'video';
                                    break;
                                }
                                //
                                var index  = relativeS.search(folder + "/");
                                if(index > -1) {
                                    fName  = relativeS.slice(folder.length + index+1);
                                }
                                // Create sub-directories
                                var directories = fName.split("/");
                                directories.pop();
                                var d, dTotal = directories.length;
                                var binDir = exportOptions.dataPath + "/" + folder + "/";
                                var dir = binDir;
                                for(d = 0; d < dTotal; ++d) {
                                    var folder = new Folder(dir + directories[d]);
                                    if(!folder.exists) folder.create();
                                    dir += directories[d] + "/";
                                }
                                //
                                var nPath  = binDir + fName;
                                // alert("Copy file: " + nPath);
                                var file = duplicateFile( source, nPath );
                                if(!file) {
                                    alert("Error saving: " + nPath);
                                }
                            }
                        }
                    } else if(layer instanceof TextLayer) {
                        var txtVal = layer.property("Source Text").value;
                        Obj.addTo( this.data.assets.font, txtVal.font );
                        // alert( txtVal.font );
                    }
                }
            }
        }
    }
    return this;
};

FidoProject.prototype.exportCompositions = function(compNames, exportOptions) {
    var i, total = compNames.length;
    for(i = 0; i < total; ++i) {
        var index = getCompIndexInProject( compNames[i] );
        if(index > -1) {
            var item = app.project.items[index];
            if( item instanceof CompItem ) {
                var comp = ExportComposition( item, exportOptions );
                if( comp !== null ) this.data.compositions[ comp.name ] = comp;
                // if( comp !== null ) this.data.compositions.push( comp );
            }
        }
    }
    return this;
};
