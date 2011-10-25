var page = new WebPage();
page.onConsoleMessage = function(msg) {console.log(msg);};

page.open("broken-a-link-test.html", function(status) {
  if ( status === "success" ) {
    page.injectJs("../browser/jquery-1.6.4.min.js");
    page.injectJs("../browser/jquery.iframe.inject.js");
    page.injectJs("../browser/cssert.js");
    page.evaluate(function() {
      console.log('a');
      loadHeadless2();
    });
    phantom.exit();
  } else {
    console.log('failed');
    phantom.exit();
  }
});
