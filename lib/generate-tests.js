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
  };

  //Returns the string representation of the element
  elementToString = function($el) {
    return $('<div>').append($el.clone()).remove().html();
  };

  //Turns all the stylesheet links and style blocks into strings
  linkStylesheetToString = function() {
    return elementToString($('link[rel="stylesheet"], style')).replace(/\/\*.*\*\//mg, '');
  };

    //Gathers all the different bits of the test together
    // - title, selector, DOM, styles
    createTestUnit = function(target, chosenStyles) {
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
      returnable.styles = generateStyleDeclaration(selector, target.css(), chosenStyles);
      return returnable;
    };

    //This intersects the complete list of measured styles with the chosen ones
    generateStyleDeclaration = function(selector, cssObject, chosenStyles) {
      var returnable = {};
      for(var i=0; i<chosenStyles.length;i++) {
        returnable[chosenStyles[i]] = cssObject[chosenStyles[i]];
      }
      return JSON.stringify(returnable);
    };


    //This is the content of 'blank-test-page.html' with the tests put in the middle
    wrapInPage = function(testCode) {
      return '<!doctype html><html><head><title>cssert test page</title><link rel="stylesheet" href="cssert.css"></head><body><h1>cssert Test cases</h1><p>click to expand test</p><script type="text/html">/*' + testCode + '*/</script><script src="cssert.js"></script></body></html>';
    };

    //Create the actual text of a test unit.
    //Tests are separated by "==\n"
    //sections of tests are separated by "\n-\n"
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

    //Attach jQuery to the page.
    //This doesn't check to see if jQuery is already loaded.
    var jQs = document.createElement('script');
    jQs.src = 'http://code.jquery.com/jquery-1.6.4.min.js';
    document.body.appendChild(jQs);
    jQs.onload = function() {
      testDisplay = $('<pre id="cssert-pre"></pre>');
      dragHandle = $('<div id="cssert-drag"><img src="https://github.com/thingsinjars/cssert/raw/master/introduction/package.png" id="cssert-download"></div>');
      testDisplay.data('original', '');

      $('body').append(testDisplay);
      $('body').append(dragHandle);

      //This generates the actual HTML file and allows it to be downloaded.
      //In Chrome, at least.
      document.getElementById('cssert-download').addEventListener("dragstart", function(e) {
        e.dataTransfer.setData("DownloadURL", "text/html:testcases.html:data:image/png;base64," + btoa(wrapInPage(testDisplay.data('original'))));
      });

      //Handler for launching the test generation flow
      var launcher = function(e) {
        // Create holder for test cases
        e.preventDefault();
        var testTitle = prompt('Name of test?');
        if (testTitle && testTitle !='') {
          $(document).unbind('click.cssert');
          showModal(testTitle, e);
        }
      };
      $(document).bind('click.cssert', launcher);
      showModal = function(testTitle, originalEvent) {
        console.log('calling showModal');
        if(true) {
          $('#cssert-style-modal').fadeIn();
          $('#cssert-style-modal button').unbind('click');
          $('#cssert-style-modal button').click(function(evt) {
            evt.preventDefault();
            var chosenStyles = $('#cssert-style-modal input:checked').map(function () {return this.value;}).get();
            addTest(testTitle, originalEvent, chosenStyles);
          });
        } else {
          addTest(testTitle, originalEvent);
        }
      }
      addTest = function(testTitle, originalEvent, chosenStyles) {
        console.log('calling addtest');
        var testObject = createTestUnit(originalEvent.target, chosenStyles);
        testObject.title = testTitle;
        testDisplay.html(testDisplay.html() + outputTest(testObject, true));
        testDisplay.data('original', testDisplay.data('original') + outputTest(testObject, false));
        $('#cssert-style-modal').fadeOut(function() {$(document).bind('click.cssert', launcher);});
      }

      //Reassigning .css to .css2 and adding extra functionality to .css
      //Got this from Keith Bentrup here:
      //http://stackoverflow.com/questions/1004475/
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
      };

      //Generate Modal form to allow users to create small, specific test cases
      var styleForm = $('<form>').attr('id', 'cssert-style-modal'), setHeader, styleList;
      if(styles) {
        styleList = $('<ul>');
        for(var set in styles) {
          setHeader = $('<li><label><input type="checkbox" name="'+set+'" value="'+set+'"> '+set+'</label></li>');
          setHeader.append(makeInputs(styles[set]));
          styleList.append(setHeader);
        }
        styleForm.append(styleList);
        styleForm.append('<button>Create test</button>');
      }

      //Check or uncheck everything in this set
      styleForm.children('ul').children('li').children('label').children('input').change(function() {
        var $parent = $(this).parents('li');
        if($(this).is(':checked')) {
          $parent.find('ul>li>label>input').attr('checked', 'checked');
        } else {
          $parent.find('ul>li>label>input').removeAttr('checked');
        } 
      });
      $('body').append(styleForm);
      $('<style>').appendTo('body').text(cssertStyles);
    }

    //A DOM generation function for the modal style selector
    makeInputs = function(styleSet) {
      var inputs = $('<ul>');
      for(var s in styleSet) {
        inputs.append("<li><label><input type=\"checkbox\" name=\"" + styleSet[s] + "\" value=\"" + styleSet[s] + "\"> "+styleSet[s]+"</label></li>");
      }
      return inputs;
    };

    //This is a list of the styles used by the modal form grouped by general function
    var styles = {
      'Typography': ['font-family','font-weight','font-style','color','text-transform','text-decoration', 'letter-spacing', 'word-spacing', 'line-height', 'text-align', 'vertical-align', 'direction' ],
      'Background': [ 'background-color', 'background-image', 'background-repeat', 'background-position', 'background-attachment'],
      'Shape': [ 'width', 'height', 'top', 'right', 'bottom', 'left', 'margin-top', 'margin-right ', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'clip', 'overflow-x', 'overflow-y'],
      'Border': [ 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'],  'Position': [ 'position', 'z-index', 'float', 'clear'],
      'Appearance': [ 'opacity', 'display', 'visibility'],
      'Other': [ 'white-space', 'cursor', 'list-style-image', 'list-style-position', 'list-style-type', 'marker-offset']
    };

    //The CSS used by this bookmarklet
    var cssertStyles = "#cssert-style-modal {display:none;position: fixed;top: 10%;left: 50%;margin-left: -350px;width: 700px;background: #39c;color: white;padding: 10px;color: #fff;text-shadow: 0 1px 0 rgba(0,0,0,.3);background-image: -webkit-linear-gradient(-45deg, rgba(255,255,255,0), rgba(255,255,255,.1) 60%, rgba(255,255,255,0) 60%);border-radius: 5px;border: 1px solid #17a;box-shadow: inset 0 0 0 1px rgba(255,255,255,.3);}";
    cssertStyles += "#cssert-style-modal ul,#cssert-style-modal li {margin:0;padding:0;font-size:11px;list-style:none;}";
    cssertStyles += "#cssert-style-modal>ul>li {float:left;width:140px;font-size:13px;}";
    cssertStyles += "#cssert-style-modal ul {margin-bottom:10px;}";
    cssertStyles += "#cssert-pre {position:fixed;top:10px;right:10px;background:white;border:1px solid gray;width:200px;height:200px;overflow:auto;}";
    cssertStyles += "#cssert-drag {position:fixed;top:210px;right:10px;background:white;border:1px solid gray;width:200px;height:20px;overflow:auto;}";
})();
