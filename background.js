/* Copyright (C) 2017 <WJ Chen, https://github.com/wjcheers>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var addresses = {};
var selectedAddress = null;
var selectedId = null;


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("backend script chrome.runtime.onMessage.addListener");
    console.log("backend script request");
    if (request.contentScriptQuery == "currenturl") {
      var url = request.urlATS +request.item;
      console.log("backend script currenturl: " + url);
      fetch(url)
          .then(response => response.text())
          .then(function(text) {
                console.log("backend script text:　" + text);
                var candUrl = '';
                if (text.indexOf(":candidateID=") >= 0) {
                    candUrl = request.urlATS + '?m=candidates&a=show&candidateID=' + text.substr(text.indexOf(":candidateID=") + ":candidateID=".length);
                }
                console.log("Response: " + candUrl);
                addresses[request.tabIdPar] = candUrl;
                updateSelected(request.tabIdPar);
          })
          .catch((err) => {
            console.log('backend script error:', err);
            addresses[request.tabIdPar] = '';
            updateSelected(request.tabIdPar);
          })
    }
    else if (request.contentScriptQuery == "currenturlnotfound") {
        console.log('backend script currenturlnotfound');
        addresses[request.tabIdPar] = '';
        updateSelected(request.tabIdPar);
    }
    else if (request.contentScriptQuery == "link") {
      var url = request.urlATS +request.item;
      console.log("backend script link:" + url);
      
        var isTimeout = false;
        new Promise(function(resolve, reject) {
            const TO = setTimeout(function() {
                isTimeout = true;
                sendResponse("error: " + "Fetch timeout");
                console.log("backend script error: " + "Fetch timeout");
            }, 100000);

          fetch(url)
              .then(response => response.text())
              .then(function(text) {
                    clearTimeout(TO)
                    if(!isTimeout) {
                        sendResponse(text);
                    }
              })
              .catch((err) => {
                    if( !isTimeout ){
                        sendResponse("error: " + err);
                    }
                    console.log("backend script error: " + err);
              })
        })
    }
    else if (request.contentScriptQuery == "email") {
      var url = request.urlATS +request.item;
      console.log("backend script email:" + url);
      
      
        var isTimeout = false;
        new Promise(function(resolve, reject) {
            const TO = setTimeout(function() {
                isTimeout = true;
                sendResponse("error: " + "Fetch timeout");
                console.log("backend script error: " + "Fetch timeout");
            }, 100000);

          fetch(url)
              .then(response => response.text())
              .then(function(text) {
                    clearTimeout(TO)
                    if(!isTimeout) {
                        sendResponse(text);
                    }
              })
              .catch((err) => {
                    if( !isTimeout ){
                        sendResponse("error: " + err);
                    }
                    console.log("backend script error: " + err);
              })
        })
    }
    return true;
  }
);
    

function updateAddress(tabIdPar, url) {
      chrome.tabs.sendMessage(tabIdPar, {tabIdPar: tabIdPar}, function() {
        //console.log("get address:" + address + " id: " + tabIdPar);
        
        //updateSelected(tabIdPar);
        //console.log("chrome.tabs.sendMessage complete");
        return true;
      });
}

function updateSelected(tabIdPar) {
  selectedAddress = addresses[tabIdPar];
  if (selectedAddress) {
    chrome.action.setTitle({tabId:tabIdPar, title:selectedAddress});
    chrome.action.enable(tabIdPar);
    chrome.action.setIcon({path: "jecho.png", tabId: tabIdPar});
  }
  else {
    chrome.action.setTitle({tabId:tabIdPar, title: ""});
    chrome.action.disable(tabIdPar);
    chrome.action.setIcon({path: "jecho_briefcase.png", tabId: tabIdPar});
  }
}

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
  if (change.status == "complete") {
    updateAddress(tabId, tab.url);
    //console.log("get chrome.tabs.onUpdated.addListener complete" + tab.url);
  }
  return true;
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  selectedId = activeInfo.tabId;
  updateSelected(activeInfo.tabId);
  return true;
});

// Ensure the current selected tab is set up.
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  updateAddress(tabs[0].id, tabs[0].url);
  return true;
});

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    //console.log("get onHistoryStateUpdated");
    //chrome.tabs.executeScript(null,{file:"content_script.js"});
  return true;
});
