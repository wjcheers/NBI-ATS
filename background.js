/* Copyright (C) 2017 <WJ Chen, https://github.com/wjcheers>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var addresses = {};
var selectedAddress = null;
var selectedId = null;

function updateAddress(tabId, url) {
      chrome.tabs.sendRequest(tabId, {}, function(address) {
        console.log("get address:" + address);
        addresses[tabId] = address;
        if (!address) {
          chrome.pageAction.hide(tabId);      
        } else {
          chrome.pageAction.show(tabId);
          if (selectedId == tabId) {
            updateSelected(tabId);
          }
        }
      });
}

function updateSelected(tabId) {
  selectedAddress = addresses[tabId];
  if (selectedAddress)
    chrome.pageAction.setTitle({tabId:tabId, title:selectedAddress});
}

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
  if (change.status == "complete") {
    updateAddress(tabId, tab.url);
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
