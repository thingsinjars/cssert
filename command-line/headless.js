/* cssert - headless.js
 * version 1.0
 *
 * (C) Simon Madine (@thingsinjars) - Mit Style License
 * CSS verification test framework
 * @see http://thingsinjars.github.com/cssert
 *
 * PhantomJS headless control script
 *
 * This loads the same test file as in the browser
 * but instead of running the tests in iframes,
 * they are run in separate browser pages
 */

var fs = require('fs'),
  verbose = false,

  // Application stages
  CREATING_TESTS = 1,
  RUNNING_TESTS = 2,
  FINISHED = 3,
  stage,

  // This is the page object in which we run our tests
  page = require('webpage').create(),

  // To make the test creation/running synchronous
  outstandingTests = 0,
  consoleMessage = function(msg) {
    console.log(msg);
  },

  // All the tests we find in the passed in test runner.
  tests = [];

// Pipe console logs from host page to command-line
page.onConsoleMessage = consoleMessage;

// Make sure we are called with at least one test runner
if (phantom.args.length === 0) {
  console.log('Usage: cssert testcase.html');
  phantom.exit();
} else {
  stage = CREATING_TESTS;
}

// Create the test files and begin running the tests
page.open(phantom.args[0], function(status) {
  // make sure we only create the test files once.
  if (stage === CREATING_TESTS) {
    if (status === "success") {

      // Inject jQuery and cssert into the test page so we can test the styles
      page.injectJs("../lib/jquery-1.6.4.min.js");
      page.injectJs("../lib/cssert.js");

      // Tell the test page to run the tests when it is loaded
      tests = page.evaluate(function() {
        return CSSERT.parseTests();
      });

      outstandingTests = tests.length - 1;

      // This writes out files containing each individual test in the runner
      // These will be read individually rather than injecting the content 
      // directly into the page object.
      for (var a = 0; a < tests.length; a++) {
        testObject = tests[a];
        if(verbose) {
          console.log('\033[0;33mCreating runner:\033[0;37m '+testObject.title);
        }
        fs.write('test-' + testObject.title + '.html', testObject.unit, 'w');
        // beginTest('test-' + testObject.title + '.html', testObject.selector, JSON.parse(testObject.styles), testObject.title);
      }
    } else {
      console.log('\033[0;31mCSSERT : Failed to create runner files');
    }

    stage = RUNNING_TESTS;

  } else if (stage === RUNNING_TESTS) {
    runTheTests();
    stage = FINISHED;
  }
});

runTest = function(filename, testSubject, stylesToAssert, testTitle) {
  var page = require('webpage').create();

  // Arbitrary. Can be changed but suits most purposes.
  page.viewportSize = {
    width: 1600,
    height: 1600
  };
  page.onConsoleMessage = consoleMessage;

  page.onLoadStarted = function() {};

  page.onLoadFinished = function(status) {
    if (status === "success") {

      page.render('screenshots/test' + testTitle + '.png');

      //Inject our libraries into the page
      page.injectJs("../lib/jquery-1.6.4.min.js");
      page.injectJs("../lib/cssert.js");

      //Inject variables into the page context
      eval("function fn() { stylesToAssert = JSON.parse('" + JSON.stringify(stylesToAssert).replace(/'/g, "\\'") + "');  testSubject = $('" + testSubject + "'); testTitle = '" + testTitle + "'}");
      page.evaluate(fn);

      //Run the actual test case
      page.evaluate(function() {
        console.log("--");
        if (CSSERT.assertStyles(testSubject, stylesToAssert)) {
          console.log('\033[0;32m' + testTitle + ' : Passed\033[0;37m');
        } else {
          console.log('\033[0;31m' + testTitle + ' : Failed\033[0;37m');
        }
      });

    } else {
      console.log('Failed to open test page');
    }

    // Tidy up after ourselves
    fs.remove(filename);

    //This prevents PhantomJS quitting before we've run each individual test case.
    if (outstandingTests-- <= 0) {
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
    if (outstandingTests-- <= 0) {
      runTheTests();
    }
    page.release();
  };

  page.open(filename);
};


// Once we've created all the files, open them again and do the actual testing
runTheTests = function() {
  outstandingTests = tests.length - 1;
  for (var a = 0; a < tests.length; a++) {
    testObject = tests[a];
    runTest('test-' + testObject.title + '.html', testObject.selector, JSON.parse(testObject.styles), testObject.title);
  }
}