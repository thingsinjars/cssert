/* cssert */

// Add jQuery to the page so we keep the test page as basic as possible
var jQs = document.createElement('script');
jQs.src = 'jquery-1.6.4.min.js';
document.body.appendChild(jQs);
jQs.onload = function() {
  // Add a handy helper to allow injecting source into an iframe
  var ifs = document.createElement('script');
  ifs.src = 'jquery.iframe.inject.js';
  document.body.appendChild(ifs);
  ifs.onload = function() {
    // Kick things off by parsing the test cases
    parseTests();

    //Run the tests
    for(var a=0;a<tests.length;a++) {
      runTest(tests[a]);
    }
  };
};


var tests = [];

assertStyles = function(testSubject, stylesToAssert) {
  var overall = true;
  for(var s in stylesToAssert) {
    var outcome = (testSubject.css(s)==stylesToAssert[s]);
    if(!outcome) {
      overall = false;
      console.log('Expected '+s+' : '+stylesToAssert[s]+'; Found ' +s+' : '+testSubject.css(s));
    }
  }
  if(overall) {
    console.log('All tests passed');
  }
  return overall;
}

parseTests = function() {
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
};

runTest = function(testObject) {
  var testresult = $('<h1>Test result: </h1>');
  var testframe = $('<iframe>');
  $('body').append(testresult);
  $('body').append(testframe);

  testframe.inject(testObject.unit);

  var testSubject = $(testObject.selector, testframe[0].contentWindow.document);
  var stylesToAssert = JSON.parse(testObject.styles);
  $(testframe).load(function() {
    console.log("--\n" + 'testing:',testObject.title);
    if(assertStyles(testSubject, stylesToAssert)) {
      testresult.html(testObject.title + ' : Passed').addClass('pass');
    } else {
      testresult.html(testObject.title + ' : Failed').addClass('fail');
    }
  });

}
