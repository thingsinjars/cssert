page.injectCss = function(stylesheet) {
  this.content = this.content.replace('</head>', '<link rel="stylesheet" href="' + stylesheet + '"></head>');
};


/* cssert */
(function() {
  var tests = [];

  assertStyles = function(testSubject, stylesToAssert) {
    var overall = true;
    for(var s in stylesToAssert) {
      var outcome = (testSubject.css(s)==stylesToAssert[s]);
      if(!outcome) {
        if(!actuallyEqual(testSubject.css(s), stylesToAssert[s])) {
          overall = false;
          console.log('Expected '+s+' : '+stylesToAssert[s]+'; Found ' +s+' : '+testSubject.css(s));
        }
      }
    }
    if(overall) {
      console.log('All tests passed');
    }
    return overall;
  }

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

})();
