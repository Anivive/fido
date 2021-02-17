function FidoMeta() {
    // Meta data
    this.defaultComp = "";
    this.outputFile  = "";
    this.dataFolder  = "";
    this.comps       = [];
    return this;
};

FidoMeta.XMP_NAMESPACE = "Fido/000022";
FidoMeta.OUTPUT_FILE   = "outputFile";
FidoMeta.DATA_PATH     = "dataPath";
FidoMeta.DEFAULT_COMP  = "defaultComp";
FidoMeta.COMPOSITIONS  = "compositions";
FidoMeta.OPT_ASSETS    = "optAssets";
FidoMeta.OPT_EFFECTS   = "optEffects";

FidoMeta.prototype.init = function() {
    var _this = this;
    function saveComp(e) {
        _this.defaultComp = e.params;
        _this.save(FidoMeta.DEFAULT_COMP, _this.defaultComp);
    }
    function saveDataPath(e) {
        _this.dataFolder = e.params;
        _this.save(FidoMeta.DATA_PATH, _this.dataFolder);
    }
    function saveJSONPath(e) {
        _this.outputFile = e.params;
        _this.save(FidoMeta.OUTPUT_FILE, _this.outputFile);
    }
    //
    function compIndex(comp) {
        var i, total = _this.comps.length;
        for(i = 0; i < total; ++i) {
            if(comp === _this.comps[i]) return i;
        }
        return -1;
    }
    function saveComps(e) {
        if(_this.comps.length > 0) {
            _this.save(FidoMeta.COMPOSITIONS, _this.comps.join(", "));
        } else {
            _this.save(FidoMeta.COMPOSITIONS, "-empty-");
        }
    }
    function addComp(e) {
        var index = compIndex(e.params);
        if(index > -1) return; // already added
        _this.comps.push( e.params );
        Raven.dispatch(FidoEvent.SAVE_COMPS);
    }
    function removeComp(e) {
        var index = compIndex(e.params);
        if(index < 0) return; // comp not added
        _this.comps.splice(index, 1);
        if(_this.comps.length == 0) _this.comps = [];
        Raven.dispatch(FidoEvent.SAVE_COMPS);
    }
    //
    Raven.addListener(FidoEvent.SAVE_DEFAULT_COMP, saveComp);
    Raven.addListener(FidoEvent.SAVE_JSON_PATH,    saveJSONPath);
    Raven.addListener(FidoEvent.SAVE_DATA_PATH,    saveDataPath);
    Raven.addListener(FidoEvent.ADD_COMP,    addComp);
    Raven.addListener(FidoEvent.SAVE_COMPS,  saveComps);
    Raven.addListener(FidoEvent.REMOVE_COMP, removeComp);
    return this;
};

FidoMeta.prototype.read = function() {
    if (ExternalObject.AdobeXMPScript == undefined) {
        ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
    }

    if(XMPMeta.getNamespacePrefix(FidoMeta.XMP_NAMESPACE) != "") {
        var mdata = new XMPMeta(app.project.xmpPacket);

        // Comp
        if(mdata.doesPropertyExist(FidoMeta.XMP_NAMESPACE, FidoMeta.DEFAULT_COMP)){
            var comp = mdata.getProperty(FidoMeta.XMP_NAMESPACE, FidoMeta.DEFAULT_COMP);
            if(comp) {
                comp = comp.toString()
                this.defaultComp = comp;
                Raven.dispatch(FidoEvent.UPDATE_COMP, comp);
            }
        }

        // Comps
        if(mdata.doesPropertyExist(FidoMeta.XMP_NAMESPACE, FidoMeta.COMPOSITIONS)){
            var comp = mdata.getProperty(FidoMeta.XMP_NAMESPACE, FidoMeta.COMPOSITIONS);
            if(comp) {
                comp = comp.toString().split(", ");
                var i, total = comp.length;
                for(i = 0; i < total; ++i) {
                    if( comp[i] !== "-empty-") {
                        Raven.dispatch(FidoEvent.ADD_COMP, comp[i]);
                    }
                }
            }
        }

        // Data Path
        if(mdata.doesPropertyExist(FidoMeta.XMP_NAMESPACE, FidoMeta.DATA_PATH)){
            var file = mdata.getProperty(FidoMeta.XMP_NAMESPACE, FidoMeta.DATA_PATH);
            if(file) {
                file = file.toString()
                this.dataFolder = file;
                Raven.dispatch(FidoEvent.UPDATE_DATA_PATH, file);
            }
        }

        // JSON Path
        if(mdata.doesPropertyExist(FidoMeta.XMP_NAMESPACE, FidoMeta.OUTPUT_FILE)){
            var file = mdata.getProperty(FidoMeta.XMP_NAMESPACE, FidoMeta.OUTPUT_FILE);
            if(file) {
                file = file.toString()
                this.outputFile = file;
                Raven.dispatch(FidoEvent.UPDATE_JSON_PATH, file);
            }
        }
    }
    return this;
};

FidoMeta.prototype.save = function(namespace, value) {
    if (ExternalObject.AdobeXMPScript == undefined) {
        ExternalObject.AdobeXMPScript = new
        ExternalObject('lib:AdobeXMPScript');
    }

    var mdata = new XMPMeta(app.project.xmpPacket);
    
    try {
        // define new namespace
        XMPMeta.registerNamespace(FidoMeta.XMP_NAMESPACE, "vision");
        mdata.setProperty(FidoMeta.XMP_NAMESPACE, namespace, value);
    } catch(e) {
        alert(e);
    }

    app.project.xmpPacket = mdata.serialize();
    return this;
};
