/* Copyright (C) 2017 <WJ Chen, https://github.com/wjcheers>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var triggerNextCnt = 0
var emailOuter = [];
var emailA = [];
var emailOuterCnt = 0;
var emailOuterCur = 0;
var linkAOuter = [];
var linkA = [];
var linkAOuterCnt = 0;
var linkAOuterCur = 0;
var urlATS = "";
var isFinding = 0;
var isSearching = 0;

console.log("content script enter");



if (window == top) {
  chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
      
        chrome.storage.local.get('urlAddr', function (data) {
            console.log("content script enter chrome.storage.local.get");
            
            if(data.urlAddr) {
                urlATS = data.urlAddr;
                console.log("urlATS: " + data.urlAddr);
        
              var url = document.URL.replace(/\/$/, ""); // remove last /
              /*url = url.replace(/^.*linkedin.com/, "");*/
              var urlAddr = "";

              //url part
              if( url.indexOf('linkedin.com') || url.indexOf('github.com')) {              
                    urlAddr = urlATS;
                    
                    //console.log('urlAddr: ' + urlAddr);
                    var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            //console.log("xhr.readyState === 4" + xhr.responseText);
                            
                            if(xhr.responseText.indexOf(":candidateID=") >= 0) {
                                var candUrl = urlATS + '?m=candidates&amp;a=show&amp;candidateID=' + xhr.responseText.substr(xhr.responseText.indexOf(":candidateID=") + ":candidateID=".length);
                                sendResponse(candUrl);
                            }
                        }
                    }
                    xhr.open("GET", urlAddr + "?m=toolbar&a=checkLinkIsInSystem&link=" + url, true);
                    console.log(urlAddr + "?m=toolbar&a=checkLinkIsInSystem&link=" + url);
                    xhr.send();
              }
              
                if (url.indexOf('linkedin.com/in/') >= 0) {
                  triggerNext();
                }
                else if(url.indexOf('linkedin.com/search/') >= 0) {
                    triggerNext();
                }
                else if (url.indexOf('github.com') >= 0) {
                    triggerNext();
                }         
            }
        });
  });
}

function searchCATSLoop () {
    if(!isSearching) {    
        if(emailOuterCur < emailOuterCnt) {
            isSearching = 1;
            checkEmailInATS(emailA[emailOuterCur]);
        }
        else if(linkAOuterCur < linkAOuterCnt) {
            isSearching = 1;
            console.log('linkAOuterCur: ' + linkAOuterCur);
            checkLinkInATS(linkA[linkAOuterCur]);
        }
    }    
}

function findLinkAndEmail() {
      //console.log("findLinkAndEmail");
      var i;
      var url = document.URL;
      
      if (url.indexOf('linkedin.com/in/') >= 0) {
          //console.log("linkedin.com/in/");
          var linkOuter = document.getElementsByClassName("pv-contact-info__contact-item pv-contact-info__contact-link");
          for(i=0; i < linkOuter.length; i++) {
              //console.log("findLinkAndEmail linkedin.com/in/, email: " + linkOuter[i].innerText);
              if(validateEmail(linkOuter[i].innerText) && (linkOuter[i].className.indexOf("NBI_ATS_Checked") < 0)) {
                  console.log("findLinkAndEmail linkedin.com/in/, email: " + linkOuter[i].innerText);
                  emailOuter[emailOuterCnt] = linkOuter[i];
                  emailA[emailOuterCnt] = linkOuter[i].innerText;
                  linkOuter[i].className += " NBI_ATS_Checked";
                  emailOuterCnt++;
              }
              else if(linkOuter[i].innerText.indexOf("linkedin.com/in/") >= 0 && (linkOuter[i].className.indexOf("NBI_ATS_Checked") < 0)) {
                  console.log("findLinkAndEmail linkedin.com/in/, link: " + linkOuter[i].innerText);
                  linkAOuter[linkAOuterCnt] = linkOuter[i];
                  linkA[linkAOuterCnt] = linkOuter[i].innerText;
                  linkOuter[i].className += " NBI_ATS_Checked";
                  linkAOuterCnt++;
              }
          }
      }
    else if(url.indexOf('linkedin.com/search/') >= 0) {
              //console.log("linkedin.com/search/");
                var anchor = document.getElementsByClassName("search-result__result-link ember-view");
                var href;
                for(i=0; i < anchor.length; i++) {
                    // Get the href
                    //console.log( anchor[i].getAttribute('href') + ' ' + anchor[i].getAttribute('href').substr(0, 4));
                    href = anchor[i].getAttribute('href');  //  href = /in/abcdef/
                    // Check if it's a /in/ link
                    if ((href.substr(0, 4) == '/in/') && (anchor[i].className.indexOf("NBI_ATS_Checked") < 0)) {
                          linkAOuter[linkAOuterCnt] = anchor[i];
                          linkAOuter[linkAOuterCnt].className += " NBI_ATS_Checked";
                          linkA[linkAOuterCnt] = 'linkedin.com' + linkAOuter[linkAOuterCnt].getAttribute('href').replace(/\/$/, "");
                          console.log("findLinkAndEmail linkedin.com/search/, link: " + linkA[linkAOuterCnt]);
                          linkAOuterCnt++;
                    }
                }
    }
        else if (url.indexOf('github.com') >= 0) {
    // Check each link, include search & personal page
            var anchor = document.getElementsByTagName('a');
            var href;
          for(i=0; i < anchor.length; i++) {
                // Get the href
                href = anchor[i].getAttribute('href');
                // Check if it's a mailto link
                if (href.substr(0, 7) == 'mailto:') {
                  if(validateEmail(anchor[i].innerText) && (anchor[i].className.indexOf("NBI_ATS_Checked") < 0)) {
                      console.log("findLinkAndEmail github.com, email: " + anchor[i].innerText);
                      emailOuter[emailOuterCnt] = anchor[i];
                      emailA[emailOuterCnt] = anchor[i].innerText;
                      anchor[i].className += " NBI_ATS_Checked";
                      emailOuterCnt++;
                  }            
                }
            }
            
            // check after email parse
            if(url.indexOf('github.com/search') >= 0) {
              //console.log("linkedin.com/search/");
                var anchor = document.getElementById("user_search_results").getElementsByTagName("a");
                var href;
                for(i=0; i < anchor.length; i++) {
                    href = anchor[i].getAttribute('href');  //  href = /userlink
                    //console.log(anchor[i].className);
                    if ((anchor[i].className.indexOf("NBI_ATS_Checked") < 0) && (href.indexOf("/search?") < 0)){
                          console.log(anchor[i]);
                          linkAOuter[linkAOuterCnt] = anchor[i];
                          linkAOuter[linkAOuterCnt].className += " NBI_ATS_Checked";
                          linkA[linkAOuterCnt] = 'github.com' + linkAOuter[linkAOuterCnt].getAttribute('href').replace(/\/$/, "");
                          console.log("findLinkAndEmail github.com/search, link: " + linkA[linkAOuterCnt]);
                          linkAOuterCnt++;
                    }
                }
            }
       }
      else {      
          //console.log("ignore url");
      }
}

// this is for open the linkedin contact information
function triggerNext() {
    // wait 0~1 seconds
    //var wait = Math.random() * 1000 * 1;
    var wait = 1000 * 1;
    triggerNextCnt++;
    if(triggerNextCnt%5 == 0) {
        console.log("triggerNext: " + triggerNextCnt);
    }
    setTimeout(function() {
        clickLinkedinContactSeeMore();
        //if(!isFinding) {
            findLinkAndEmail();            
        //}
        if(!isSearching) {
            searchCATSLoop();            
        }
        //parseEmail();
        triggerNext();
    }, wait);
}


var getElementsByAttribute = function (el, attr, value) {
  var match = [];
 
  /* Get the droids we're looking for*/
  var elements = el.getElementsByTagName("*");
 
  /* Loop through all elements */
  for (var ii = 0, ln = elements.length; ii < ln; ii++) {
 
    if (elements[ii].hasAttribute(attr)) {
 
      /* If a value was passed, make sure it matches the element's */
      if (value) {
 
        if (elements[ii].getAttribute(attr) === value) {
          match.push(elements[ii]);
        }
      } else {
        /* Else, simply push it */
        match.push(elements[ii]);
      }
    }
  }
  return match;
};

function clickLinkedinContactSeeMore() {
  var url = document.URL;
  if (url.indexOf('linkedin.com/in/') >= 0) {
      var el = document.createElement( 'div' );
      el.innerHTML = document.body.innerHTML;
      buttonContactSeeMore = getElementsByAttribute(el, 'data-control-name', "contact_see_more");
      if(buttonContactSeeMore.length > 0) {
          var buttonC = document.getElementsByClassName("contact-see-more-less");
          if(buttonC.length > 0) {
            buttonC[0].click();
          }
          return 1;
      }
  }
  return 0;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function handleEmailError() {
    console.log('handleEmailResponse: handleEmailError');
    isSearching = 0;
    searchCATSLoop();
}

// Handles parsing the feed data we got back from XMLHttpRequest.
function handleEmailResponse() {
    console.log('handleEmailResponse');
  var doc = req.responseText;
    if (!doc) {
        console.log('not_a_valid_url');
        return;
    }
    console.log(doc);
    //console.log(req);
    var url = document.URL;
    if (url.indexOf('linkedin.com/in/') >= 0) {
        if(doc.indexOf(":candidateID=") >= 0) {
            if(emailOuterCnt) {
                emailOuter[emailOuterCur++].outerHTML +=
                '<a target="_blank" style="color: red" href="' + urlATS + '?m=candidates&amp;a=show&amp;candidateID=' + doc.substr(doc.indexOf(":candidateID=") + ":candidateID=".length) + '" style="text-decoration: none;">' + '<img src="' + chrome.extension.getURL("jecho.png") + '" alt="NBI ATS" height="20px">' + '</a>';        
            }
        }
        else if(doc.indexOf("cats_authenticationFailed") >= 0) {
            if(emailOuterCnt) {
                emailOuter[emailOuterCur++].outerHTML +=
                '<a target="_blank" style="color: red" href="' + urlATS + '" style="text-decoration: none;">NBI ATS: Please login first!</a>';        
            }
        }
    }
    else if (url.indexOf('github.com') >= 0) {
        if(emailOuterCur < emailOuterCnt) {
            if(doc.indexOf(":candidateID=") >= 0) {
                emailOuter[emailOuterCur].outerHTML += '<a target="_blank" style="color: red" href="' + urlATS + '?m=candidates&amp;a=show&amp;candidateID=' + doc.substr(doc.indexOf(":candidateID=") + ":candidateID=".length) + '" style="text-decoration: none;">' + '<img src="' + chrome.extension.getURL("jecho.png") + '" alt="NBI ATS" height="20px">' + '</a>';   
            }
            else if(doc.indexOf(emailOuter[emailOuterCur].innerText + ":0") >= 0) {
                //emailOuter[emailOuterCur].outerHTML += 'NBI ATS: Not found'; 
            }
            else if(doc.indexOf("cats_authenticationFailed") >= 0) {
                emailOuter[emailOuterCur].outerHTML +=
                '<a target="_blank" style="color: red" href="' + urlATS + '" style="text-decoration: none;">NBI ATS: Please login first!</a>';        
            
            }
            emailOuterCur++;
        }
    }
    isSearching = 0;
    searchCATSLoop();
}

function checkEmailInATS(email) {
    var curURL = urlATS + "?m=toolbar&a=checkEmailIsInSystem&email=" + email;
    
  console.log("checkEmailInATS: " + curURL);
  
  req = new XMLHttpRequest();

  req.onload = handleEmailResponse;
  req.onerror = handleEmailError;
  req.open("GET", curURL, true);
  req.send(null);
}

function handleLinkError() {
    console.log('handleLinkResponse: handleLinkError');
    isSearching = 0;
    searchCATSLoop();
}

// Handles parsing the feed data we got back from XMLHttpRequest.
function handleLinkResponse() {
    console.log('handleLinkResponse');
  var doc = req.responseText;
    if (!doc) {
        console.log('not_a_valid_url');
        return;
    }
    console.log(doc);
    //console.log(req);
    var url = document.URL;
    //if (url.indexOf('linkedin.com/') >= 0) { // include /in/ and /search/
        if(linkAOuterCur < linkAOuterCnt) {
            if(doc.indexOf(":candidateID=") >= 0) {
                    linkAOuter[linkAOuterCur].outerHTML +=
                    '<a target="_blank" style="color: red" href="' + urlATS + '?m=candidates&amp;a=show&amp;candidateID=' + doc.substr(doc.indexOf(":candidateID=") + ":candidateID=".length) + '" style="text-decoration: none;">' + '<img src="' + chrome.extension.getURL("jecho.png") + '" alt="NBI ATS" height="20px">' + '</a>';
            }
            else if(doc.indexOf("cats_authenticationFailed") >= 0) {
                    linkAOuter[linkAOuterCur].outerHTML +=
                    '<a target="_blank" style="color: red" href="' + urlATS + '" style="text-decoration: none;">NBI ATS: Please login first!</a>';
            }
            linkAOuterCur++;
        }
        //console.log("handleLinkResponse: Cnt: " + linkAOuterCnt + ", Cur: " + linkAOuterCur);
    //}
    isSearching = 0;
    searchCATSLoop();
}

function checkLinkInATS(link) {
    var curURL = urlATS + "?m=toolbar&a=checkLinkIsInSystem&link=" + link;
    console.log("checkLinkInATS: " + curURL);
  
  req = new XMLHttpRequest();

  req.onload = handleLinkResponse;
  req.onerror = handleLinkError;
  req.open("GET", curURL, true);
  req.send(null);
}


console.log("content script quit");
