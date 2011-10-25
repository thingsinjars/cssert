// page.content='<!doctype html><html><head><meta charset="utf-8"><base href="../introduction/install.html"><link rel="stylesheet" href="main.css"></head><body><h1>cssert – CSS Unit testing</h1></body></html>';
// var fs = require('fs');

// fs.write('test2.html',page.content,'w');



runTest = function(filename, testSubject, stylesToAssert, testTitle) {
  var page = new WebPage();
  page.viewportSize = { width: 1024, height: 768 };

  page.onConsoleMessage = function(msg) {
    console.log(msg);
  };


  page.open(filename, function(status) {
    if ( status === "success" ) {
      page.injectJs("jquery-1.6.4.min.js");
      page.injectJs("cssert.js");

      // testSubject = 'html body h1';
      // stylesToAssert = {"font-family":"sans-serif","font-size":"32px","font-weight":"300","font-style":"normal","color":"rgb(68, 68, 68)","text-transform":"none","text-decoration":"none","letter-spacing":"normal","word-spacing":"0px","line-height":"normal","text-align":"-webkit-auto","vertical-align":"baseline","direction":"ltr","background-color":"rgba(0, 0, 0, 0)","background-image":"none","background-repeat":"repeat","background-position":"0% 0%","background-attachment":"scroll","opacity":"1","width":"800px","height":"37px","top":"auto","right":"auto","bottom":"auto","left":"auto","margin-top":"21px","margin-right":"0px","margin-bottom":"21px","margin-left":"0px","padding-top":"0px","padding-right":"0px","padding-bottom":"0px","padding-left":"0px","border-top-width":"0px","border-right-width":"0px","border-bottom-width":"0px","border-left-width":"0px","border-top-color":"rgb(68, 68, 68)","border-right-color":"rgb(68, 68, 68)","border-bottom-color":"rgb(68, 68, 68)","border-left-color":"rgb(68, 68, 68)","border-top-style":"none","border-right-style":"none","border-bottom-style":"none","border-left-style":"none","position":"static","display":"block","visibility":"visible","z-index":"auto","overflow-x":"visible","overflow-y":"visible","white-space":"normal","clip":"auto","float":"none","clear":"none","cursor":"auto","list-style-image":"none","list-style-position":"outside","list-style-type":"disc","marker-offset":null};


      eval("function fn() { stylesToAssert = JSON.parse('" + JSON.stringify(stylesToAssert) + "');  testSubject = $('" + testSubject + "'); testTitle = '" + testTitle + "'}");
      page.evaluate(fn);
      page.evaluate(function() {
        var testresult = $('<h1>Test result: </h1>');
        $('body').append(testresult);

        console.log("--\n" + 'testing: Header');
        if(assertStyles(testSubject, stylesToAssert)) {
          testresult.html('Header : Passed').addClass('pass');
        } else {
          testresult.html('Header : Failed').addClass('fail');
        }
        // runTest();
      });
      page.render('test1-output.png');
      phantom.exit();
    } else {
      console.log('failed');
      phantom.exit();
    }
  });

};


runTest('test2.html', 'html body h1', {"font-family":"sans-serif","font-size":"32px","font-weight":"300","font-style":"normal","color":"rgb(68, 68, 68)","text-transform":"none","text-decoration":"none","letter-spacing":"normal","word-spacing":"0px","line-height":"normal","text-align":"-webkit-auto","vertical-align":"baseline","direction":"ltr","background-color":"rgba(0, 0, 0, 0)","background-image":"none","background-repeat":"repeat","background-position":"0% 0%","background-attachment":"scroll","opacity":"1","width":"800px","height":"37px","top":"auto","right":"auto","bottom":"auto","left":"auto","margin-top":"21px","margin-right":"0px","margin-bottom":"21px","margin-left":"0px","padding-top":"0px","padding-right":"0px","padding-bottom":"0px","padding-left":"0px","border-top-width":"0px","border-right-width":"0px","border-bottom-width":"0px","border-left-width":"0px","border-top-color":"rgb(68, 68, 68)","border-right-color":"rgb(68, 68, 68)","border-bottom-color":"rgb(68, 68, 68)","border-left-color":"rgb(68, 68, 68)","border-top-style":"none","border-right-style":"none","border-bottom-style":"none","border-left-style":"none","position":"static","display":"block","visibility":"visible","z-index":"auto","overflow-x":"visible","overflow-y":"visible","white-space":"normal","clip":"auto","float":"none","clear":"none","cursor":"auto","list-style-image":"none","list-style-position":"outside","list-style-type":"disc","marker-offset":null}, 'H1');
