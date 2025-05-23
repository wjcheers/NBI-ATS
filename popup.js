/* Copyright (C) 2017 <WJ Chen, https://github.com/wjcheers>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var urlATS = null;

function urlBtn() {  
    var urlBtn = document.getElementById("urlBtn");

    var storageObjectName = {};
    var url = document.getElementById("urlAddr").value;
    var urlText;
    var lastChar = url.substr(-1); // Selects the last character
    if(url.indexOf("index.php") >= 0) {
        console.log("urlBtn index.php");
        urlText = url.substr(0, url.indexOf("index.php")) + "index.php";
        storageObjectName['urlAddr'] = urlText;
        chrome.storage.local.set(storageObjectName, function() {
            //curURL = url + "index.php?m=toolbar&a=checkEmailIsInSystem&email=" + email;
            curURL = urlText + "?m=toolbar&a=authenticate";
            urlATS = urlText;
            getURL(curURL);
        });
    }
    else if(lastChar === '/') {
        console.log("urlBtn /");
        urlText = url + "index.php";
        storageObjectName['urlAddr'] = urlText;
        chrome.storage.local.set(storageObjectName, function() {
            //curURL = url + "index.php?m=toolbar&a=checkEmailIsInSystem&email=" + email;
            curURL = urlText + "?m=toolbar&a=authenticate";
            urlATS = urlText;
            getURL(curURL);
        });
    }
    else {
        console.log("urlBtn close");
        window.close();
    }
}

window.onload = function() {
    /*
    chrome.browserAction.setIcon({
    path : {
        "48": "markerD.png",
        "64": "markerD.png",
        "128": "markerD.png"
    }
    });
    chrome.browserAction.setTitle({
    path : {
        "48": "markerD.png",
        "64": "markerD.png",
        "128": "markerD.png"
    }
    });
    */

    console.log("window.onload");
    
    chrome.storage.local.get('urlAddr', function (data) {
        
        if(data.urlAddr) {
            console.log("data.urlAddr: " + data.urlAddr);
            urlAddr = data.urlAddr;            
            document.getElementById("urlAddr").value = urlAddr;
        }
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            var tab = tabs[0];
            console.log("current tab: " + tab.id);
            chrome.action.getTitle({tabId:tab.id}, function (data) {
                console.log("getTitle: " + data);
                if(data != "NBI ATS") {
                    var str = data; // contain &amp; change to &
                    var div = document.createElement('div');
                    div.innerHTML = str
                    var decoded = div.firstChild.nodeValue;
                    chrome.tabs.create({ url: decoded });
                }
            });            
        });
    });
        
    console.log("getElementById urlBtn");
    document.getElementById('urlBtn').onclick = urlBtn;
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
    window.close();
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
    }
    else {
        //success
        window.close();
    }
}


