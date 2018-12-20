/* Copyright (C) 2017 <WJ Chen, https://github.com/wjcheers>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var addresses = {};
var selectedAddress = null;
var selectedId = null;

function updateAddress(tabIdPar, url) {
      chrome.tabs.sendRequest(tabIdPar, {}, function(address) {
        console.log("get address:" + address + " id: " + tabIdPar);
        addresses[tabIdPar] = address;
        /*
        if (!address) {
          chrome.pageAction.hide(tabIdPar);
        } else {
          chrome.pageAction.show(tabIdPar);
          if (selectedId == tabIdPar) {
            updateSelected(tabIdPar);
          }
        }
        */
        updateSelected(tabIdPar);
        //console.log("chrome.tabs.sendRequest complete");
      });
}

function updateSelected(tabIdPar) {
  selectedAddress = addresses[tabIdPar];
  if (selectedAddress) {
    chrome.pageAction.setTitle({tabId:tabIdPar, title:selectedAddress});
    chrome.pageAction.show(tabIdPar);
    chrome.pageAction.setIcon({path: "jecho.png", tabId: tabIdPar});
  }
  else {
    chrome.pageAction.setTitle({tabId:tabIdPar, title: ""});
    chrome.pageAction.hide(tabIdPar);
    chrome.pageAction.setIcon({path: "jecho_briefcase.png", tabId: tabIdPar});
  }
}

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
  if (change.status == "complete") {
    updateAddress(tabId, tab.url);
    //console.log("get chrome.tabs.onUpdated.addListener complete" + tab.url);
  }
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, info) {
  selectedId = tabId;
  updateSelected(tabId);
});

// Ensure the current selected tab is set up.
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  updateAddress(tabs[0].id, tabs[0].url);
});

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    //console.log("get onHistoryStateUpdated");
    //chrome.tabs.executeScript(null,{file:"content_script.js"});
});
