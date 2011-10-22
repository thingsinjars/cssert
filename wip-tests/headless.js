var page = new WebPage();

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open("broken-a-link-test.html", function (status) {
    if (status !== "success") {
        console.log("Unable to load file");
    } else {
        console.log("Opened Test file. At this point, we'd kick off the test run");
    }
});
page.onLoadFinished = function (status) {
        page.evaluate(function () {
          var tags = document.getElementsByTagName('h1');
          console.log(tags.length);
          for(var t in tags) {
             console.log(tags[t].innerHTML);
           }
     });
//    phantom.exit();
};
