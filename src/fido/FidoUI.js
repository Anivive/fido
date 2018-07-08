function FidoUI(context) {
    this.window      = undefined;
    // UI
    this.listComps   = undefined;
    this.btnAdd      = undefined;
    this.btnRemove   = undefined;
    this.btnDataPath = undefined;
    this.txtDataPath = undefined;
    this.btnJSONPath = undefined;
    this.txtJSONPath = undefined;
    this.txtTxtMulti = undefined;
    this.btnExport   = undefined;
    // this.tgAnimate   = undefined;
    this.tgAssets    = undefined;
    this.tgCSS       = undefined;
    this.tgRetina    = undefined;
    // this.tgEffects   = undefined;
    //
    this.defaultCompTxt = "Default Composition: ";
    //
    var w = 300;
    var h = 480;
    if(context instanceof Panel) {
        this.window = context;
    } else {
        this.window = new Window("palette", ["Fido",
            {
                'x': 0,
                'y': 0,
                'width':  w,
                'height': h
            },
            {
                "borderless": true,
                "resizeable": true
            }
        ]);
        this.window.size = [w,h];
    }
    //
    var _this = this;
    function addCompHandler(e) {
        _this.addComp( e.params );
    }
    function removeCompHandler(e) {
        _this.removeComp( e.params );
    }
    Raven.addListener(FidoEvent.ADD_COMP,    addCompHandler);
    Raven.addListener(FidoEvent.REMOVE_COMP, removeCompHandler);
    return this;
};

FidoUI.prototype.addComp = function(comp) {
    this.listComps.add( "item", comp );
    return this;
};

FidoUI.prototype.removeComp = function(comp) {
    var i, total = this.listComps.items.length;
    for(i = 0; i < total; ++i) {
        var item = this.listComps.items[i].toString();
        if( item === comp ) {
            this.listComps.remove( i );
            return i;
        }
    }
    return -1;
};

FidoUI.prototype.init = function() {
    var _this = this;

    //////////////////////////////////////////////////
    // Create text / buttons
    var group, item;
    // var grey = 30 / 255;
    // this.window.graphics.backgroundColor = this.window.graphics.newBrush( this.window.graphics.BrushType.SOLID_COLOR, [grey, grey, grey, 1] );
    this.window.spacing = 2;

    ////////////////////
    // Comps
    group = this.window.add("group{orientation:'row',alignment:['fill','top']}");

    // Add comp
    item  = group.add("button", undefined, "Add Composition");
    item.alignment = ["fill","fill"];
    this.btnAdd = item;

    // Remove comp
    item  = group.add("button", undefined, "Remove Composition");
    item.alignment = ["fill","fill"];
    this.btnRemove = item;

    group = this.window.add("group{orientation:'column',alignment:['fill', 'top']}");

    item  = group.add("ListBox", [0, 0, 290, 120], "Compositions",  {
        numberOfColumns: 1, 
        showHeaders: true, 
        columnTitles: ['Compositions']
    });
    item.alignment = ["fill", "fill"];
    this.listComps = item;

    ////////////////////
    // JSON output

    group = this.window.add("group{orientation:'column',alignment:['fill', 'top'],margins:5}");
    group.graphics.backgroundColor = group.graphics.newBrush( group.graphics.BrushType.SOLID_COLOR, [0, 0, 0, 0.3] );

    item  = group.add("statictext");
    item.alignment = ["fill","fill"];
    item.text = "JSON Path:";

    item  = group.add("statictext");
    item.alignment = ["fill","fill"];
    item.text = "Path: ~/";
    this.txtJSONPath = item;

    item  = group.add("button", undefined, "Choose JSON Path");
    item.alignment = ["fill","top"];
    this.btnJSONPath = item;

    ////////////////////
    // Asset output
    group = this.window.add("group{orientation:'column',alignment:['fill', 'top'],margins:5}");
    group.graphics.backgroundColor = group.graphics.newBrush( group.graphics.BrushType.SOLID_COLOR, [0, 0, 0, 0.3] );
    
    item  = group.add("statictext");
    item.alignment = ["fill","fill"];
    item.text = "Asset Path:";

    item  = group.add("statictext");
    item.alignment = ["fill","fill"];
    item.text = "Path: ~/";
    this.txtDataPath = item;

    item  = group.add("button", undefined, "Choose Asset Path");
    item.alignment = ["fill","top"];
    this.btnDataPath = item;

    ////////////////////
    // Toggle buttons
    group = this.window.add("group{orientation:'row',alignment:['fill', 'top'],margins:5}");
    group.graphics.backgroundColor = group.graphics.newBrush( group.graphics.BrushType.SOLID_COLOR, [0, 0, 0, 0.2] );

    // item  = group.add("checkbox", undefined, "Animation");
    // item.alignment = ["fill","fill"];
    // item.value     = true;
    // this.tgAnimate = item;

    item  = group.add("checkbox", undefined, "Assets");
    item.alignment = ["fill","fill"];
    item.value     = false;
    this.tgAssets  = item;
    
    item  = group.add("checkbox", undefined, "CSS3");
    item.alignment = ["fill","fill"];
    item.value     = false;
    this.tgCSS     = item;
    
    item  = group.add("statictext");
    item.alignment = ["fill", "fill"];
    item.text      = "Spacing";
    
    item  = group.add("edittext");
    item.text = "1";
    this.txtTxtMulti = item;
    
    // Retina
    
    item  = group.add("statictext");
    item.alignment = ["fill", "fill"];
    item.text      = "Retina";
    
    item  = group.add("edittext");
    item.text = "0.5";
    this.tgRetina = item;
    

    // item  = group.add("checkbox", undefined, "Effects");
    // item.alignment = ["fill","fill"];
    // item.value     = false;
    // this.tgEffects = item;

    ////////////////////
    // Export
    group = this.window.add("group{orientation:'column',alignment:['fill', 'top']}");
    item  = group.add("button", undefined, "Export");
    item.alignment = ["fill","top"];
    this.btnExport = item;

    //////////////////////////////////////////////////
    // Setup event listeners
    function hasCompInList(compName) {
        var i, total = _this.listComps.items.length;
        for(i = 0; i < total; ++i) {
            var item = _this.listComps.items[i].toString();
            if( item === compName ) return true;
        }
        return false;
    }
    this.btnAdd.onClick = function(e) {
        if(!app.project || !app.project.activeItem) return;

        if(!app.project.activeItem instanceof CompItem) {
            alert("Please highlight a composition in your Project window.");
            return;
        }

        var comp = app.project.activeItem.name;
        if( hasCompInList(comp) ) return; // already added

        Raven.dispatch(FidoEvent.ADD_COMP, comp);

        return;

        // Look for Compositions within new Comp's layering
        var compo  = getCompByName( comp );
        var layers = compWithCompLayers( compo );
        var i, total = layers.length;
        for(i = 0; i < total; ++i) {
            var _add = !hasCompInList( layers[i] );
            alert( _add.toString() );
            // if(_add) {
            //     Raven.dispatch(FidoEvent.ADD_COMP, layers[i]);
            // }
        }
    };
    
    this.btnRemove.onClick = function(e) {
        Raven.dispatch(FidoEvent.REMOVE_COMP, _this.listComps.selection.toString());
    };

    this.btnDataPath.onClick = function(e) {
        var folder = Folder.selectDialog("Choose output directory");
        if(folder) {
            var path = folder.absoluteURI;
            Raven.dispatch(FidoEvent.SAVE_DATA_PATH,   path);
            Raven.dispatch(FidoEvent.UPDATE_DATA_PATH, path);
        }
    };

    this.btnJSONPath.onClick = function(e) {
        var file = File.saveDialog("Choose an output file");
        if( file ) {
            var path = file.absoluteURI;
            Raven.dispatch(FidoEvent.SAVE_JSON_PATH,   path);
            Raven.dispatch(FidoEvent.UPDATE_JSON_PATH, path);
        }
    };

    this.btnExport.onClick = function(e) {
        Raven.dispatch(FidoEvent.EXPORT);
    }

    this.window.onResize = function(e) {
        this.layout.resize();
        var w = this.bounds[2];
        _this.txtJSONPath.bounds[2] = w;
    }

    this.window.onClose = function(e) {
        Raven._dispatcher.listenerChain = {};
        app.cancelTask(taskId);
        stopServer();
    }

    if(this.window instanceof Window) {
        this.window.show();
    } else {
        this.window.layout.layout(true);
    }

    // Listeners
    function updateDataPath(e) {
        _this.txtDataPath.text = e.params;
    }
    function updateJSONPath(e) {
        _this.txtJSONPath.text = e.params;
    }
    //
    Raven.addListener(FidoEvent.UPDATE_DATA_PATH, updateDataPath);
    Raven.addListener(FidoEvent.UPDATE_JSON_PATH, updateJSONPath);

    return this;
};
