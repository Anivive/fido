﻿{
    //////////////////////////////////////////////////
    // Imports
    // Libs
    #include "fido/json2.js";
    #include "fido/Raven.EventDispatcher.js";
    // Core
    #include "fido/FidoEvents.js";
    #include "fido/FidoMeta.js";
    #include "fido/FidoProject.js";
    #include "fido/FidoUI.js";
    #include "fido/FidoUtil.js";
    // Export
    #include "fido/ExportAnimation.js";
    #include "fido/ExportAudio.js";
    #include "fido/ExportAVLayer.js";
    #include "fido/ExportCamera.js";
    #include "fido/ExportComposition.js";
    #include "fido/ExportLayer.js";
    #include "fido/ExportShape.js";
    #include "fido/ExportText.js";
    #include "fido/ExportUtil.js";

    //////////////////////////////////////////////////
    // App

    function exportProject() {
        var exportData = {
            "animate":     true,
            "effects":     true,
            "assets":      UI.tgAssets.value,
            "css":         UI.tgCSS.value,
            "retina":      Number(UI.tgRetina.text),
            "spacingMulti": Number(UI.txtTxtMulti.text),
            "dataPath":    UI.txtDataPath.text,
            "defaultComp": meta.defaultComp
        };
        var eProject = new FidoProject(exportData);
        var eData    = eProject.build( meta.comps, exportData );
        saveFile( eData, meta.outputFile );
        eProject = eData = undefined;
        alert("Project saved!\n" + meta.outputFile);
    }

    clearOutput();

    // Setup UI
    var UI   = new FidoUI( this );
    UI.init();

    // Read Meta Data
    var meta = new FidoMeta();
    meta.init();
    meta.read();

    // Export project
    Raven.addListener(FidoEvent.EXPORT, function(e) {
        exportProject();
    });
}