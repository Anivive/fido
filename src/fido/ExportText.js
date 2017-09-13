function ExportText(prop, exportOptions) {
    var _retina = exportOptions.retina;
    var text  = prop.property("Text");
    var sTxt  = text.property("Source Text");
    var data  = {
        'text':     sTxt.value.text,
        'font':     sTxt.value.font,
        'fontSize': sTxt.value.fontSize * _retina,
        'color':    sTxt.value.fillColor,
        'align':    "left",
        'spacing':  Number((sTxt.value.tracking * _retina / exportOptions.spacingMulti).toFixed(3)),
        'weight':   'regular'
    };

    data.text    = data.text.replace(/\r/g, "\n");
    data.text    = data.text.replace(/’/g, "'");

    var isLeft   = sTxt.value.justification == ParagraphJustification.LEFT_JUSTIFY;
    var isRight  = sTxt.value.justification == ParagraphJustification.RIGHT_JUSTIFY;
    var isCenter = sTxt.value.justification == ParagraphJustification.CENTER_JUSTIFY;
    if(!isLeft) {
        if(isRight)  data.align = "right";
        if(isCenter) data.align = "center";
    }
    
    var aeNames   = ["Source Text"];
    var codeNames = ["text"];
    var timeline  = exportProps( prop, aeNames, codeNames, exportOptions );
    data.timeline = timeline;
    
    return data;
};
