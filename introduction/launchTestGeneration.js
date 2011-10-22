var cssert = cssert || {};

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

elementToString = function($el) {
	return $('<div>').append($el.clone()).remove().html();
}

linkStylesheetToString = function() {
	return elementToString($('link[rel="stylesheet"], style'));
}

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
	unit.find('head').prepend('<base href="' + window.location.href + '"/>');
	returnable.unit = '<!doctype html>' + elementToString(unit);
	returnable.selector = selector.toLowerCase();
	returnable.styles = generateStyleDeclaration(selector, target.css());
  return returnable;
}

generateStyleDeclaration = function(selector, cssObject) {
	return JSON.stringify(cssObject);
}

outputTest = function(testObject) {
  var outputable = "==\n";
  outputable += testObject.title;
  outputable += "\n-\n";
  outputable += testObject.unit.replace(/</g,'&lt;').replace(/>/g,'&gt;');
  outputable += "\n-\n";
  outputable += testObject.selector;
  outputable += "\n-\n";
  outputable += testObject.styles;
  outputable += "\n==\n\n\n";
  cssert.testDisplay.html(cssert.testDisplay.html() + outputable);
}
var jQs = document.createElement('script');
jQs.src = 'jquery-1.6.4.min.js';
document.body.appendChild(jQs);
jQs.onload = function() {
  cssert.testDisplay = $('<pre style="position:fixed;top:10px;right:10px;background:white;border:1px solid gray;width:200px;height:200px;overflow:auto;"></pre>');
  $('body').append(cssert.testDisplay);

$(document).click(function(e) {
// Create holder for test cases
	e.preventDefault();
  var testTitle = prompt('Name of test?');
  if (testTitle && testTitle !='') {
    var testObject = createTestUnit(e.target);
    testObject.title = testTitle;
    outputTest(testObject);
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
