(function () {
/* cssert 
 * version 1.0
 *
 * (C) Simon Madine (@thingsinjars) - Mit Style License
 * CSS unit test framework
 * @see http://thingsinjars.com
 *
 * Test generation bookmarklet
 *
 * When launched, this attaches a click handler to the entire page 
 * which will create the skeleton DOM structure required by the test 
 */

  //Given a node, this returns a simplified jQuery structure representing it
  generateUnit = function(object) {
    var returnable = $('<'+object.tagName+'>').addClass(object.className);
    if (object.id && object.id != '') {
      returnable.attr('id',object.id);
    }
    if (object.href && object.href != '') {
      returnable.attr('href',object.href);
    }
    return returnable;
  }

  //Returns the string representation of the element
  elementToString = function($el) {
    return $('<div>').append($el.clone()).remove().html();
  }

  //Turns all the stylesheet links and style blocks into strings
  linkStylesheetToString = function() {
    return elementToString($('link[rel="stylesheet"], style'));
  }

  //Gathers all the different bits of the test together
  // - title, selector, DOM, styles
  createTestUnit = function(target) {
    var returnable = {};
    target = $(target);
    var unit = generateUnit($(target).get()[0]);
    unit.html(target.html());
    var selector = target.get()[0].tagName;

    var chain = target.parents();
    chain.each(function () { 
      var extendUnit = generateUnit(this);
      unit = extendUnit.append(unit);
      selector = this.tagName+' '+selector;
    });
    unit.prepend($('<head>').html(linkStylesheetToString()));
    unit.find('head').prepend('<base href="' + window.location.href + '"/>').prepend('<meta charset="utf-8">');
    returnable.unit = '<!doctype html>' + elementToString(unit);
    returnable.selector = selector.toLowerCase();
    returnable.styles = generateStyleDeclaration(selector, target.css());
    return returnable;
  }

  generateStyleDeclaration = function(selector, cssObject) {
    return JSON.stringify(cssObject);
  }

  //This is the content of 'blank-test-page.html' with the tests put in the middle
  wrapInPage = function(testCode) {
    return '<!doctype html><html><head><title>cssert test page</title><link rel="stylesheet" href="cssert.css"></head><body><h1>cssert Test cases</h1><p>click to expand test</p><script type="text/html">/*' + testCode + '*/</script><script src="cssert.js"></script></body></html>';
  };

  outputTest = function(testObject, asEntities) {
    var outputable = "==\n";
    outputable += testObject.title;
    outputable += "\n-\n";
    if(asEntities) {
      outputable += htmlEntities(testObject.unit);
    } else {
      outputable += testObject.unit;
    }
    outputable += "\n-\n";
    outputable += testObject.selector;
    outputable += "\n-\n";
    outputable += testObject.styles;
    outputable += "\n==\n\n\n";
    return outputable;
  }

  //From Chris Coyier who got it from James Padolsey
  function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var jQs = document.createElement('script');
  jQs.src = 'http://code.jquery.com/jquery-1.6.4.min.js';
  document.body.appendChild(jQs);
  jQs.onload = function() {
    testDisplay = $('<pre style="position:fixed;top:10px;right:10px;background:white;border:1px solid gray;width:200px;height:200px;overflow:auto;"></pre>');
    dragHandle = $('<div style="position:fixed;top:210px;right:10px;background:white;border:1px solid gray;width:200px;height:20px;overflow:auto;"><img src="package.png" id="download"></div>');
    testDisplay.data('original', '');

    $('body').append(testDisplay);
    $('body').append(dragHandle);

    document.getElementById('download').addEventListener("dragstart", function(e) {
      e.dataTransfer.setData("DownloadURL", "text/html:testcases.html:data:image/png;base64," + btoa(wrapInPage(testDisplay.data('original'))));
    });

    $(document).click(function(e) {
      // Create holder for test cases
      e.preventDefault();
      var testTitle = prompt('Name of test?');
      if (testTitle && testTitle !='') {
        var testObject = createTestUnit(e.target);
        testObject.title = testTitle;
        testDisplay.html(testDisplay.html() + outputTest(testObject, true));
        testDisplay.data('original', testDisplay.data('original') + outputTest(testObject, false));
      }
    });
    jQuery.fn.css2 = jQuery.fn.css;
    jQuery.fn.css = function() {
      if (arguments.length) return jQuery.fn.css2.apply(this, arguments);
      var attr = ['font-family','font-size','font-weight','font-style','color',
        'text-transform','text-decoration','letter-spacing','word-spacing',
        'line-height','text-align','vertical-align','direction','background-color',
        'background-image','background-repeat','background-position',
        'background-attachment','opacity','width','height','top','right','bottom',
        'left','margin-top','margin-right','margin-bottom','margin-left',
        'padding-top','padding-right','padding-bottom','padding-left',
        'border-top-width','border-right-width','border-bottom-width',
        'border-left-width','border-top-color','border-right-color',
        'border-bottom-color','border-left-color','border-top-style',
        'border-right-style','border-bottom-style','border-left-style','position',
        'display','visibility','z-index','overflow-x','overflow-y','white-space',
        'clip','float','clear','cursor','list-style-image','list-style-position',
        'list-style-type','marker-offset'];
        var len = attr.length, obj = {};
        for (var i = 0; i < len; i++) 
        obj[attr[i]] = jQuery.fn.css2.call(this, attr[i]);
        return obj;
    }

  }
})();
