function ExportCamera(props, exportOptions) {
    var options   = props.property("Camera Options");
    var aeNames   = ["Blur Level", "Depth of Field", "Focus Distance", "Zoom"];
    var codeNames = ["blur", "DOF", "focus", "zoom"];
    var data      = {};
    var i, total  = aeNames.length;
    for(i = 0; i < total; ++i) {
        data[ codeNames[i] ] = options.property( aeNames[i] ).value;
    }
    data.timeline = exportProps( props, aeNames, codeNames, exportOptions );
    return data;
};
