function ExportText(prop, exportOptions) {
    var _retina = exportOptions.retina;
    var text  = prop.property("Text");
    var sTxt  = text.property("Source Text");
    var data  = {
        'text':     sTxt.value.allCaps ? sTxt.value.text.toUpperCase() : sTxt.value.text,
        'font':     sTxt.value.font,
        'fontSize': sTxt.value.fontSize * _retina,
        'color':    sTxt.value.fillColor,
        'align':    "left",
        'spacing':  Number((sTxt.value.tracking / exportOptions.spacingMulti).toFixed(3)),
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
    var timeline = exportProps(prop, aeNames, codeNames, exportOptions);

    // Animators
    var animators = text.property("ADBE Text Animators");
    if (animators !== null) {
        var txtAnimator = animators.property("ADBE Text Animator");
        if (txtAnimator !== null) {
            var aniProps = txtAnimator.property("ADBE Text Animator Properties");
            // Fill-Color
            var fillColor = aniProps.property("ADBE Text Fill Color");
            if (fillColor !== null) {
                var aniFillColor = exportProps(aniProps, ["ADBE Text Fill Color"], ["fillColor"], exportOptions);
                timeline = timeline.concat(aniFillColor);
            }
        }
    }

    data.timeline = timeline;
    
    return data;
};
