FidoEvent = function(type, params) {
    this.type = type;
    this.params = params;
    this.target = undefined;
    return this;
};

FidoEvent.prototype = new Raven.Event();
FidoEvent.prototype.constructor = FidoEvent;

FidoEvent.EXPORT            = "fidoExport";
FidoEvent.ADD_COMP          = "fidoAddComp";
FidoEvent.SAVE_COMPS        = "fidoSaveComps";
FidoEvent.SAVE_DEFAULT_COMP = "fidoSaveComp";
FidoEvent.SAVE_JSON_PATH         = "fidoSavePath";
FidoEvent.UPDATE_COMP       = "fidoUpdateComp";
FidoEvent.UPDATE_DATA_PATH  = "fidoUpdateDataPath";
FidoEvent.UPDATE_JSON_PATH  = "fidoUpdateJSONPath";
