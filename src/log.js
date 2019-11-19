function logData(data, logFunction) {
    if (data === null) logFunction("NULL");
    else if (data === undefined) logFunction("UNDEFINED");
    else if (typeof(data) === 'boolean') logFunction(data);
    else if (typeof(data) === 'number') logFunction(data);
    else if (typeof(data) === 'string') logFunction(data);
    else if (Array.isArray(data)) logFunction(JSON.stringify(data, null, 4));
    else if (typeof(data) === 'object') {
        if (data.__Proxy) prop.print(data);
        else if (data instanceof Error) {
            // print info related to error
            logFunction(data.stack);
        } else logFunction(JSON.stringify(data, null, 4));
    } else if (typeof(data) === 'function') {
        logFunction(data.toString());
    } else logFunction("Unknown data type");
}

exports.d = function(data) {
    if (service.debug) logData(data, console.log);
};

exports.e = function(data) {
    if (service.debug) logData(data, console.error);
};

exports.p = function(data) {
    if (service.debug) logData(dump(data), console.error);
};

function dump(arr, level) {
    var dumped_text = '';
    if (!level) {
        level = 0;
    }
    var level_padding = '';
    for (var j = 0; j < level + 1; j++) {
        level_padding += '    ';
    }
    if (typeof arr == 'object') {
        for (var item in arr) {
            var value = arr[item];
            if (typeof value == 'object') {
                dumped_text += level_padding + "'" + item + "' ...\n";
                dumped_text += dump(value, level + 1);
            } else {
                dumped_text += level_padding + "'" + item + '\' => "' + value + '"\n';
            }
        }
    } else {
        dumped_text = '===>' + arr + '<===(' + typeof arr + ')';
    }
    return dumped_text;
}


/*
 * Print to stdout the stacktrace of function calls.
 * Useful when we want to know the stacktrace but we are not handling an exception.
 */
exports.d.trace = function() {
    log.d("Stacktrace:");

    var e = new Error();
    // slice 2 so to not print the line with "Error" and the line of current function
    var stack = e.stack.split("\n").slice(2).join("\n");
    log.d(stack);
};

/*
 * Print to stdout the stacktrace of function calls.
 * Useful when we want to know the stacktrace but we are not handling an exception.
 */
exports.e.trace = function() {
    log.e("Stacktrace:");

    var e = new Error();
    // slice 2 so to not print the line with "Error" and the line of current function
    var stack = e.stack.split("\n").slice(2).join("\n");
    log.e(stack);
};
