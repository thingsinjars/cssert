/* cssert - headless.js
 * version 1.0
 *
 * (C) Simon Madine (@thingsinjars) - Mit Style License
 * CSS verification test framework
 * @see http://thingsinjars.com
 *
 * PhantomJS headless control script
 *
 * This loads the same test file as in the browser 
 * but instead of running the tests in iframes,
 * they are run in separate browser pages
*/

var fs = require('fs'), 
page = require('webpage').create(), 
testsRemaining = 0,
firstTime = true,
consoleMessage = function(msg) {console.log(msg);},
tests = [];

var prepstage = true;

page.onConsoleMessage = consoleMessage;

if (phantom.args.length === 0) {
  console.log('Usage: cssert testcase.html');
  phantom.exit();
}

page.open(phantom.args[0], function(status) {
  if(prepstage) {
    prepstage = false;
    if ( status === "success" ) {
      page.injectJs("../lib/jquery-1.6.4.min.js");
      page.injectJs("../lib/cssert.js");

      tests = page.evaluate(function() {
        return loadHeadless();
      });

      testsRemaining = tests.length - 1;

      //This writes out files to be read later rather than injecting the content 
      //directly into the page object. It's more reliable this way.
      for(var a=0;a<tests.length;a++) {
        testObject = tests[a];
        fs.write('test'+testObject.title+'case.html', testObject.unit, 'w');
        beginTest('test'+testObject.title+'case.html', testObject.selector, JSON.parse(testObject.styles), testObject.title);
      }
    } else {
      console.log('failed');
    }
  }
});

runTest = function(filename, testSubject, stylesToAssert, testTitle) {
  var page = require('webpage').create();
  page.viewportSize = { width: 1600, height: 1600 };
  page.onConsoleMessage = consoleMessage;

  page.onLoadStarted = function() {};

  page.onLoadFinished = function(status) {
    if ( status === "success" ) {

      page.render('screenshots/test'+testTitle+'.png');

      //Inject our libraries into the page
      page.injectJs("../lib/jquery-1.6.4.min.js");
      page.injectJs("../lib/cssert.js");

      //Inject variables into the page context
      eval("function fn() { stylesToAssert = JSON.parse('" + JSON.stringify(stylesToAssert).replace(/'/g,"\\'") + "');  testSubject = $('" + testSubject + "'); testTitle = '" + testTitle + "'}");
      page.evaluate(fn);

      //Run the actual test case
      page.evaluate(function() {
        console.log("--");
        if(assertStyles(testSubject, stylesToAssert)) {
          console.log(testTitle + ' : Passed');
        } else {
          console.log(testTitle + ' : Failed');
        }
      });

    } else {
      console.log('Failed to open test page');
    }

    fs.remove(filename);

    //This is to get round the asynchronous open calls
    if(testsRemaining-- <= 0) {
      phantom.exit();
    }

    page.release();
  };

  page.open(filename);
};

// This is an odd workaround for the asynchronous page.open behaviour
// Open the file, do nothing with it.
// then open it again and perform the actual tests.
beginTest = function(filename) {
  var page = require('webpage').create();
  page.onLoadFinished = function(status) {
    //This is to get round the asynchronous open calls
    if(testsRemaining-- <= 0) {
      runTheTests();
    }
    page.release();
  };

  page.open(filename);
};


// Once we've opened all the files, open them again and do the actual testing
runTheTests = function() {
  testsRemaining = tests.length - 1;
  for(var a=0;a<tests.length;a++) {
    testObject = tests[a];
    runTest('test'+testObject.title+'case.html', testObject.selector, JSON.parse(testObject.styles), testObject.title);
  }
}
