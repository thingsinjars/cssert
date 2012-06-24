var CSSERT;
(function () {
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
      loadParsePrepRun,
      assertStyles,
      actuallyEqual,
      parseTests,
      prepTest,
      runTest;

  // Load required libs, parse test file, prepare tests and run tests
  loadParsePrepRun = function() {
    var jQscript, iFrameScript;
    // Add jQuery to the page so we keep the test page as basic as possible
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
        var tests = parseTests();
        //Run the tests
        for(var a=0;a<tests.length;a++) {
          prepTest(tests[a]);
        }
        for(var a=0;a<tests.length;a++) {
          runTest(tests[a]);
        }
      };
    };
  };

  // The main assertion
  // This checks that the values rendered are equal to those we expected
  assertStyles = function(testSubject, stylesToAssert) {
    var overall = true, s, outcome;
    for(s in stylesToAssert) {
      outcome = (testSubject.css(s)==stylesToAssert[s]);
      if(!outcome) {
        if(!actuallyEqual(testSubject.css(s), stylesToAssert[s])) {
          overall = false;
          console.log('Expected ' + s + ' : ' + stylesToAssert[s] + '; Found ' + s + ' : ' + testSubject.css(s));
        }
      }
    }
    return overall;
  }

  // This is to cater for differences in specific rules which are
  // actually equivalent.
  // For example, it removes vendor prefixes and equates alpha = 0 to transparent
  actuallyEqual= function(measuredValue, expectedValue) {
    if (measuredValue.replace(/-webkit-/g,'') == expectedValue.replace(/-webkit-/g,'')) {
      return true;
    } else if ( (measuredValue.indexOf('rgba')===0 || measuredValue.indexOf('hsla')===0 ) && (measuredValue.indexOf(', 0)')>0 ) && expectedValue == 'transparent') {
      return true;
    } else if ( (expectedValue.indexOf('rgba')===0 || expectedValue.indexOf('hsla')===0 ) && (expectedValue.indexOf(', 0)')>0 ) && measuredValue == 'transparent') {
      return true;
    } else {
      return false;
    }
  }

  // Test blocks are kept in the test file, separated by '=='
  // The individual elements are separated by '--'
  // This just figures out what's what and puts in in an array of test objects
  parseTests = function() {
    var tests = [];
    $('script[type="text/html"]').each(function() {
      var originalText = $(this).html().replace('/*','').replace('*/','');
      var testblocks = originalText.split("==\n");
      for (var i=0; i<testblocks.length;i++) {
        testblocks[i] = $.trim(testblocks[i]);
        if(testblocks[i]!=='') {
          var testobject ={};
          var testparts = testblocks[i].split("-\n");
          testobject.title = $.trim(testparts[0]);
          testobject.unit = $.trim(testparts[1]);
          testobject.selector = $.trim(testparts[2]);
          testobject.styles = $.trim(testparts[3]);
          tests[tests.length] = testobject;
        }
      }
    });
    return tests;
  };

  // The output is generated for HTML and also pushed into the console.
  // The console output is used when running headless.
  prepTest = function(testObject) {
    var testframe = $('<iframe>');
    $('body').append(testframe);

    if(testframe.inject) {
      testframe.inject(testObject.unit);
    }
  };

  // The output is generated for HTML and also pushed into the console.
  // The console output is used when running headless.
  runTest = function(testObject) {
    var testresult = $('<h1>Test result: </h1>');
    var testframe = $('<iframe>');
    $('body').append(testresult);
    $('body').append(testframe);

    $(testframe).load(function() {
      var testSubject = $(testObject.selector, testframe[0].contentWindow.document);
      var stylesToAssert = JSON.parse(testObject.styles);

      console.log("--\n" + 'testing:',testObject.title);
      if(assertStyles(testSubject, stylesToAssert)) {
        testresult.html(testObject.title + ' : Passed').addClass('pass');
      } else {
        testresult.html(testObject.title + ' : Failed').addClass('fail');
      }
    });

    setTimeout(function() {if(testframe.inject) {testframe.inject(testObject.unit);}}, 500);

  };

  loadParsePrepRun();

  CSSERT = {
    parseTests: parseTests,
    assertStyles: assertStyles
  };

})();
