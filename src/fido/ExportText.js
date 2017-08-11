function ExportText(prop, exportOptions) {
    var _retina = exportOptions.retina;
    var text  = prop.property("Text");
    var sTxt  = text.property("Source Text");
    var data  = {
        'text':          sTxt.value.text,
        'font':          sTxt.value.font,
        'fontSize':      sTxt.value.fontSize * _retina,
        'fillColor':     sTxt.value.fillColor,
        'justification': "left",
        'spacing':       sTxt.value.tracking * _retina,
        'weight':        'regular'
    };

    data.text    = data.text.replace(/\r/g, "\n");

    var isLeft   = sTxt.value.justification == ParagraphJustification.LEFT_JUSTIFY;
    var isRight  = sTxt.value.justification == ParagraphJustification.RIGHT_JUSTIFY;
    var isCenter = sTxt.value.justification == ParagraphJustification.CENTER_JUSTIFY;
    if(!isLeft) {
        if(isRight)  data.justification = "right";
        if(isCenter) data.justification = "center";
    }
    
    var aeNames   = ["Source Text"];
    var codeNames = ["text"];
    var timeline  = exportProps( prop, aeNames, codeNames, exportOptions );
    data.timeline = timeline;
    
    return data;
};
