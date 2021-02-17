function ExportAudio(props, exportOptions) {
    var audio = props.property("Audio");
    var level = audio.property("Audio Levels");
    var data  = {
        value: {
            source: getRelativeFilePath( props.source.mainSource.file.toString() ),
            volume: level.value[0],
            audioEnabled: props.hasAudio ? props.audioEnabled : false
        }
        // "start"   : props.inPoint,
        // "duration": props.outPoint - props.inPoint
    };
    if(level.isTimeVarying) {
        data.value.volume = level.keyValue(1)[0];
        data.timeline = exportProps( audio, ["Audio Levels"], ["volume"], exportOptions );
        var timeline  = [];
        var i, total  = data.timeline.length;
        for(i = 0; i < total; ++i) {
            var key = data.timeline[i];
            if(key.name === "volumeX") {
                key.name = "volume";
                timeline.push(key);
            }
        }
        data.timeline = timeline;
    }
    return data;
};
