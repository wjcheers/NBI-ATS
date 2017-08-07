/* Copyright (C) 2017 <WJ Chen, https://github.com/wjcheers>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var storage = chrome.storage.local;

// Get at the DOM controls used in the sample.
var resetButton = document.querySelector('button.reset');
var submitButton = document.querySelector('button.submit');
var textarea = document.querySelector('textarea');
var urlATS = "";

// Load any urlAddr that may have previously been saved.
loadChanges();

submitButton.addEventListener('click', saveChanges);
resetButton.addEventListener('click', reset);

function saveChanges() {
  // Get the current urlAddr snippet from the form.
  var urlAddrA = textarea.value;
  // Check that there's some code there.
  if (!urlAddrA) {
    message('Error: No urlAddr specified');
    return;
  }

  
    var storageObjectName = {};
  
    if(urlAddrA.indexOf("index.php") >= 0) {
        console.log("urlBtn index.php");
        urlText = urlAddrA.substr(0, urlAddrA.indexOf("index.php")) + "index.php";
        storageObjectName['urlAddr'] = urlText;
        chrome.storage.local.set(storageObjectName, function() {
            //curURL = urlAddrA + "index.php?m=toolbar&a=checkEmailIsInSystem&email=" + email;
            curURL = urlText + "?m=toolbar&a=authenticate";
            urlAddrA = urlText;
            textarea.value = urlAddrA;
            urlATS = urlAddrA;
            getURL(curURL);
              // Save it using the Chrome extension storage API.
              storage.set({'urlAddr': urlAddrA}, function() {
                // Notify that we saved.
                message('Settings saved');
              });
        });
    }
    else if(lastChar === '/') {
        console.log("urlBtn /");
        urlText = urlAddrA + "index.php";
        storageObjectName['urlAddr'] = urlText;
        chrome.storage.local.set(storageObjectName, function() {
            //curURL = urlAddrA + "index.php?m=toolbar&a=checkEmailIsInSystem&email=" + email;
            curURL = urlText + "?m=toolbar&a=authenticate";
            urlAddrA = urlText;
            textarea.value = urlAddrA;
            urlATS = urlAddrA;
            getURL(curURL);
              // Save it using the Chrome extension storage API.
              storage.set({'urlAddr': urlAddrA}, function() {
                // Notify that we saved.
                message('Settings saved');
              });
        });
    }
    else {
      message('Incorrect ATS address!');        
    }
  
}

function loadChanges() {
  storage.get('urlAddr', function(items) {
    // To avoid checking items.urlAddr we could specify storage.get({urlAddr: ''}) to
    // return a default value of '' if there is no urlAddr value yet.
    if (items.urlAddr) {
      textarea.value = items.urlAddr;
      message('Loaded saved urlAddr.');
    }
  });
}

function reset() {
  // Remove the saved value from storage. storage.clear would achieve the same
  // thing.
  storage.remove('urlAddr', function(items) {
    message('Reset stored urlAddr');
  });
  // Refresh the text area.
  textarea.value = '';
}

function message(msg) {
  var message = document.querySelector('.message');
  message.innerText = msg;
  setTimeout(function() {
    message.innerText = '';
  }, 3000);
}


function getURL(curURL) {
  req = new XMLHttpRequest();

  req.onload = handleResponse;
  req.onerror = handleError;
  req.open("GET", curURL, true);
  req.send(null);
}


function handleError() {
    console.log('handleError');
    //window.close();
    message('Can not connect to ATS!');
}


// Handles parsing the feed data we got back from XMLHttpRequest.
function handleResponse() {
    console.log('on handleResponse');
    var doc = req.responseText;
	if (!doc) {
		console.log('not_a_valid_url');
		return;
	}
    //console.log(doc);   
    
    if(doc.indexOf("cats_authenticationFailed(); Message:Invalid username or password.") >= 0) {
        // goto login
        //console.log('goCATSLogin');
        chrome.tabs.create({ url: urlATS });
        message('Please login ATS!');
    }
    else {
        //success
        //window.close();
        message('NBI ATS is ready!');
    }
}