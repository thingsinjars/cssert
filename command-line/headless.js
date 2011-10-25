var fs = require('fs');
consoleMessage = function(msg) {console.log(msg);};

var page = require('webpage').create();
page.onConsoleMessage = consoleMessage;

var testRemaining = 0;

if (phantom.args.length === 0) {
    console.log('Usage: cssert testcase.html');
    phantom.exit();
}
page.open(phantom.args[0], function(status) {
  if ( status === "success" ) {
    page.injectJs("../lib/jquery-1.6.4.min.js");
    page.injectJs("../lib/cssert.js");
    var tests = page.evaluate(function() {
      return loadHeadless();
    });
    testRemaining = tests.length - 1;
    for(var a=0;a<tests.length;a++) {
      testObject = tests[a];
      fs.write('test'+testObject.title+'case.html', testObject.unit, 'w');
      runTest('test'+testObject.title+'case.html', testObject.selector, JSON.parse(testObject.styles), testObject.title);
    }
  } else {
    console.log('failed');
  }
});


runTest = function(filename, testSubject, stylesToAssert, testTitle) {
  var page = require('webpage').create();
  page.viewportSize = { width: 1024, height: 768 };

  page.onConsoleMessage = function(msg) {
    console.log(msg);
  };


  page.open(filename, function(status) {
    if ( status === "success" ) {

      //Inject our libraries into the page
      page.injectJs("../lib/jquery-1.6.4.min.js");
      page.injectJs("../lib/cssert.js");

      //Inject variables into the page context
      eval("function fn() { stylesToAssert = JSON.parse('" + JSON.stringify(stylesToAssert) + "');  testSubject = $('" + testSubject + "'); testTitle = '" + testTitle + "'}");
      page.evaluate(fn);

      //Run the actual test case
      page.evaluate(function() {
        console.log("--\n" + 'Testing: '+testTitle);
        if(assertStyles(testSubject, stylesToAssert)) {
          console.log(testTitle + ' : Passed');
        } else {
          console.log(testTitle + ' : Failed');
        }
      });

      page.render('test'+testTitle+'.png');
    } else {
      console.log('Failed to open test page');
    }

    //This is to get round the asynchronous open calls
    if(testRemaining==0) {phantom.exit();}
    testRemaining--;

  });
};
