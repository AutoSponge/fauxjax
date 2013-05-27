(function () {
    var scripts = document.getElementsByTagName("script");
    var payload = scripts[ scripts.length - 1 ].innerHTML;
    function handleMessage(e) {
        e.source.postMessage(e.data + payload, "*");
    }
    try {
        this.addEventListener("message", handleMessage, false);
    } catch (e) {
        this.attachEvent("onmessage", handleMessage);
    }
}());