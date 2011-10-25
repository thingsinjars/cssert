var page = new WebPage();
page.viewportSize = { width: 1024, height: 768 };

page.onConsoleMessage = function(msg) {
  console.log(msg);
};

page.open("test1.html", function(status) {
  if ( status === "success" ) {
    page.injectJs("jquery-1.6.4.min.js");
    page.injectJs("cssert.js");
    page.evaluate(function() {
      runTest();
    });
    page.render('test1-output.png');
    phantom.exit();
  } else {
    console.log('failed');
    phantom.exit();
  }
});


