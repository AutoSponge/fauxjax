(function (global) {
    var body = null;
    var deferreds = {};
    var config = {};
    function registerUrl(url, filePath) {
        config[url] = filePath;
    }
    function registerUrls(tuples) {
        if (typeof tuples === "string") {
            return registerUrl.apply(null, arguments);
        }
        var i, len;
        for (i = 0, len = tuples.length; i < len; i += 1) {
            registerUrl(tuples[i][0], tuples[i][1]);
        }
    }
    function generateHeader(id) {
        return id + "\n";
    }
    function handleMessage(msg) {
        var file = msg.data.match(/.+/)[0];
        var raw = msg.data.replace(/.+\n\s*/, "");
        var data = raw;
        try {
            data = JSON.parse(raw);
        } catch(e) {}
        deferreds[file].resolveWith(null, [data, raw]);
        $("iframe[src='" + file + "']").remove();
    }
    function handleLoad(elm) {
        elm.contentWindow.postMessage(generateHeader(elm.getAttribute("src")), "*");
    }
    function createFrame(file) {
        body = body || $("body");
        if (!body.length) {
            return setTimeout(function () {
                createFrame(file);
            }, 100);
        }
        return $("<iframe src='" + file +
            "' onload='$$.handleLoad(this);' " +
            "style='width:0;height:0;border:0;'></iframe>").appendTo(body);
    }
    function fakeAjax(url, callback) {
        var obj, dfd, file, success;

        if (typeof url === "string") {
            success = callback;
            file = config[url];
        } else {
            obj = url;
            success = obj.success;
            file = config[obj.url];
        }
        deferreds[file] = dfd = $.Deferred();
        dfd.done(success);
        createFrame(file);
        return dfd.promise();
    }

    try {
        global.addEventListener("message", handleMessage, false);
    } catch (e) {
        global.attachEvent("onmessage", handleMessage, false);
    }

    global.$$ = {};
    global.$$.handleLoad = handleLoad;
    global.$$.registerUrl = registerUrls;
    global.$.ajax = fakeAjax;
}(this));