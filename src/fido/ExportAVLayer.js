function ExportAVLayer(item, exportOptions) {
    var file = getFileObj( item.source.file.toString() );
    var data = {
        // 'source':  getRelativeFilePath( item.source.file.toString() ),
        'source':  file.path,
        'width':   item.width,
        'height':  item.height
    };
    return data;
};
