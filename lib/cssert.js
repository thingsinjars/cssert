/*globals $  */
var CSSERT;
(function() {
  /* cssert - cssert.js
   * version 1.0
   *
   * (C) Simon Madine (@thingsinjars) - Mit Style License
   * CSS verification test framework
   * @see http://thingsinjars.com
   *
   * Main testing script
   *
   * This loads and parses test files, creates test cases
   * and runs the assertions
   */
  var tests = [],
    init, assertStyles, actuallyEqual, parseTests, bufferTest, runTest, log, log_LEVEL = 1;

  log = function(message, level) {
    var colors = ['\033[0;34m', '\033[0;31m', '\033[0;32m', '\033[0;33m', '\033[0;37m'],
      component = 'CSSERT :: \033[0;37m';
    level = level || 0;
    message = message.replace(/\{(\d)\}/g, '\033[0;3$1m');
    if (log_LEVEL >= level) {
      console.log(colors[level] + component + message);
    }

  };



  // Load required libs, parse test file, prepare tests and run tests
  init = function() {
    var jQscript, iFrameScript;
    log('init', 2);

    // Add jQuery to simplify test parsing
    jQscript = document.createElement('script');
    jQscript.src = '../lib/jquery-1.6.4.min.js';
    document.body.appendChild(jQscript);

    jQscript.onload = function() {
      // Add a handy helper to allow injecting source into an iframe
      iFrameScript = document.createElement('script');
      iFrameScript.src = '../lib/jquery.iframe.inject.js';
      document.body.appendChild(iFrameScript);
      iFrameScript.onload = function() {

        // Kick things off by parsing the test cases
        var a, tests = parseTests();

        //Run the tests
        for (a = 0; a < tests.length; a++) {
          runTest(tests[a]);
        }
      };
    };
  };

  // The main assertion
  // This checks that the values rendered are equal to those we expected
  assertStyles = function(testElement, stylesToAssert) {
    var outcome = true, rule, styleMatches;

    log('assertStyles', 2);

    for (rule in stylesToAssert) {
      if (stylesToAssert.hasOwnProperty(rule)) {
        log('Asserting \'{3}' + rule + ' : ' + stylesToAssert[rule] + '{7}\' === \'{3}' + rule + ' : ' + testElement.css(rule) + '{7}\'', 3);
        styleMatches = (testElement.css(rule) === stylesToAssert[rule]);
        if (!styleMatches) {
          if (!actuallyEqual(testElement.css(rule), stylesToAssert[rule])) {
            outcome = false;
            log('Expected ' + rule + ' : ' + stylesToAssert[rule] + '; Found ' + rule + ' : ' + testElement.css(rule));
          }
        }
      }
    }

    return outcome;
  };

  // This is to cater for differences in specific rules which are
  // actually equivalent.
  // For example, it removes vendor prefixes and equates alpha = 0 to transparent
  actuallyEqual = function(measuredValue, expectedValue) {

    log('actuallyEqual', 2);
    
    if (measuredValue.replace(/-webkit-/g, '') === expectedValue.replace(/-webkit-/g, '')) {
      return true;
    } else if ((measuredValue.indexOf('rgba') === 0 || measuredValue.indexOf('hsla') === 0) && (measuredValue.indexOf(', 0)') > 0) && expectedValue === 'transparent') {
      return true;
    } else if ((expectedValue.indexOf('rgba') === 0 || expectedValue.indexOf('hsla') === 0) && (expectedValue.indexOf(', 0)') > 0) && measuredValue === 'transparent') {
      return true;
    } else {
      return false;
    }
  };

  // Test blocks are kept in the test file, separated by '=='
  // The individual elements are separated by '--'
  // This just figures out what's what and puts in in an array of test objects
  parseTests = function() {
    log('parseTests', 2);
    var tests = [];
    $('script[type="text/html"]').each(function() {
      var originalText, testBlocks, testObject, testParts, i;

      // The original contents of the test template block
      originalText = $(this).html().replace('/*', '').replace('*/', '');

      // Find each individual test in the block
      testBlocks = originalText.split("==\n");


      for (i = 0; i < testBlocks.length; i++) {
        testBlocks[i] = $.trim(testBlocks[i]);
        if (testBlocks[i] !== '') {

          // Create the actual testable unit
          testObject = {};

          // Separate the test unit into individual elements
          testParts = testBlocks[i].split("-\n");

          // Title
          testObject.title = $.trim(testParts[0]);

          // Chunk of DOM
          testObject.unit = $.trim(testParts[1]);

          // Very specific selector to target a single element
          testObject.selector = $.trim(testParts[2]);

          // The styles we expect the element to have
          testObject.styles = $.trim(testParts[3]);

          // Add it to the tests list
          tests[tests.length] = testObject;
        }
      }
    });
    log("Tests Found: " + tests.length, 3);
    return tests;
  };

  // The output is generated for HTML and also pushed into the console.
  // The console output is used when running headless.
  runTest = function(testObject) {
    log('runTest', 2);
    var testresult = $('<h1>Test result: </h1>');
    var testframe = $('<iframe>');
    $('body').append(testresult);
    $('body').append(testframe);

    $(testframe).load(function() {
      var testSubject = $(testObject.selector, testframe[0].contentWindow.document);
      var stylesToAssert = JSON.parse(testObject.styles);

      console.log("--\n" + 'testing:', testObject.title);
      if (assertStyles(testSubject, stylesToAssert)) {
        testresult.html(testObject.title + ' : Passed').addClass('pass');
      } else {
        testresult.html(testObject.title + ' : Failed').addClass('fail');
      }

      // Inject the test object into the frame to keep it 
      // separate from the other tests
      if (navigator.userAgent !== 'CSSERT') {
        setTimeout(function() {
          if (testframe.inject) {
            testframe.inject(testObject.unit);
          }
        }, 500);
      } else {
        if (testframe.inject) {
          testframe.inject(testObject.unit);
        }
      }

    });

    // The .inject above was here. It should work where it is now.
        setTimeout(function() {
          if (testframe.inject) {
            testframe.inject(testObject.unit);
          }
        }, 500);
  };

  if (navigator.userAgent !== 'CSSERT') {
    // We're not running in headless mode, this is a browser
    init();
  }

  CSSERT = {
    init: init,
    parseTests: parseTests,
    assertStyles: assertStyles
  };

})();