function ExportCamera(props, exportOptions) {
    var options   = props.property("Camera Options");
    var aeNames   = ["Blur Level", "Depth of Field", "Focus Distance", "Zoom"];
    var codeNames = ["blur", "DOF", "focus", "zoom"];
    var data      = {};
    var i, total  = aeNames.length;
    for (i = 0; i < total; ++i) {
        data[codeNames[i]] = options.property(aeNames[i]).value;
    }

    // Determine FOV
    var comp = props.containingComp;
    var width = comp.width;
    var aspect = width / comp.height;
    data.fov = Number((2 * Math.atan(width / aspect / (2 * data.zoom)) * (180 / Math.PI)).toFixed(3));

    data.timeline = exportProps(props, aeNames, codeNames, exportOptions);
    return data;
};
