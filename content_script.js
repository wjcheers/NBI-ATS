/* Copyright (C) 2017 <WJ Chen, https://github.com/wjcheers>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var triggerNextCnt = 0;
var emailOuter = [];
var emailOuterCnt = 0;
var emailOuterCur = 0;
var linkAOuter = [];
var linkAOuterCnt = 0;
var linkAOuterCur = 0;
var urlATS = "";


chrome.storage.local.get('urlAddr', function (data) {
    
    if(data.urlAddr) {
        urlATS = data.urlAddr;
        console.log("data.urlAddr: " + data.urlAddr);


        if (window == top) {
          chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
              
          var url = document.URL.replace(/\/$/, ""); // remove last /
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
          
          
          // content part
            if (url.indexOf('linkedin.com/in/') >= 0) {
              // click the contact more button
              triggerNextCnt = 0;
              triggerNext();
            }
            else if(url.indexOf('linkedin.com/search/') >= 0) {
                var wait = 5000 * 1;
                triggerNextCnt++;
                if(triggerNextCnt > 30) {
                    return null;
                }

                parseLinkedinSearch();
                /*setTimeout(function() {
                    parseLinkedinSearch();
                }, wait);*/
            }
            else if (url.indexOf('github.com') >= 0) {
                parseEmail();
            }
            else {
                //parseEmail();
            }
          });
        }
        
        // this is for open the linkedin contact information
        function triggerNext() {
            // wait 0~1 seconds
            //var wait = Math.random() * 1000 * 1;
            var wait = 1000 * 1;
            triggerNextCnt++;
            if(triggerNextCnt > 30) {
                return null;
            }
            setTimeout(function() {
                //console.log("timeout");
                if(clickContactSeeMore() > 0) {
                    parseEmail();
                }
                else {
                    triggerNext();   
                }
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

        function clickContactSeeMore() {          
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
          return 0;
        }

        function parseLinkedinSearch() {
            console.log("parseEmail");
          var i;
          var url = document.URL;
          var email = null;
          if (url.indexOf('linkedin.com/search/') >= 0) {
            // Check each linkedin search result
              console.log("linkedin.com/search/");
              //var linkOuter = 
                var anchor = document.getElementsByClassName("search-result__result-link ember-view");
                var href;
                for(i=0; i < anchor.length; i++) {
                    // Get the href
                    console.log( anchor[i].getAttribute('href') + ' ' + anchor[i].getAttribute('href').substr(0, 4));
                    href = anchor[i].getAttribute('href');  //  href = /in/abcdef/
                    // Check if it's a /in/ link
                    if (href.substr(0, 4) == '/in/') {
                          linkAOuter[linkAOuterCnt++] = anchor[i];
                    }
                }
                console.log("linkAOuterCnt: " + linkAOuterCnt);
                if(linkAOuterCnt>0)
                {
                    console.log('https://www.linkedin.com' + linkAOuter[linkAOuterCur].getAttribute('href').replace(/\/$/, ""));
                    checkLinkInATS('https://www.linkedin.com' + linkAOuter[linkAOuterCur].getAttribute('href').replace(/\/$/, "")); // remove last /
                }
           }
          else {
              //console.log("ignore url");
          }
          return email;
        }

        function parseEmail() {
            console.log("parseEmail");
          var i;
          var url = document.URL;
          var email = null;
          var linkA = null;
          if (url.indexOf('linkedin.com/in/') >= 0) {
              console.log("linkedin.com/in/");
              var linkOuter = document.getElementsByClassName("pv-contact-info__contact-item pv-contact-info__contact-link");
              for(i=0; i < linkOuter.length; i++) {
                  console.log("find linkedin.com/in/: " + linkOuter[i].innerText);
                  if(validateEmail(linkOuter[i].innerText)) {
                      emailOuter[emailOuterCnt++] = linkOuter[i];
                      email = linkOuter[i].innerText;
                      // pick one
                      break;
                  }
                  else if(linkOuter[i].innerText.indexOf("linkedin.com/in/") >= 0) {
                      console.log("find linkedin.com/in/: " + linkOuter[i].innerText);
                      // pick the first one
                      if(linkA == null) {
                          linkAOuter[linkAOuterCnt++] = linkOuter[i];
                          linkA = linkOuter[i].innerText;
                      }
                  }
              }
              if(email != null) {
                  console.log("email: " + email);
                  checkEmailInATS(email);          
              }
              else if(linkA != null) {
                  console.log("linkA: " + linkA);
                  checkLinkInATS(linkA);          
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
                      if(validateEmail(anchor[i].innerText)) {
                          emailOuter[emailOuterCnt++] = anchor[i];
                      }            
                    }
                }
                if(emailOuterCnt>0)
                {
                    checkEmailInATS(emailOuter[linkAOuterCur].innerText);
                }
           }
          else {      
              //console.log("ignore url");
          }
          return email;
        }

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        function handleEmailError() {
            console.log('failed_to_fetch_url Email');
        }

        // Handles parsing the feed data we got back from XMLHttpRequest.
        function handleEmailResponse() {
            console.log('on Email handleResponse');
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
                        emailOuter[emailOuterCur++].innerHTML +=
                        '<a target="_blank" style="color: red" href="' + urlATS + '?m=candidates&amp;a=show&amp;candidateID=' + doc.substr(doc.indexOf(":candidateID=") + ":candidateID=".length) + '" style="text-decoration: none;">NBI ATS</a>';        
                    }
                }
                else if(doc.indexOf("cats_authenticationFailed") >= 0) {
                    if(emailOuterCnt) {
                        emailOuter[emailOuterCur++].innerHTML +=
                        '<a target="_blank" style="color: red" href="' + urlATS + '" style="text-decoration: none;">NBI ATS: Please login first!</a>';        
                    }
                }
                if(linkAOuterCur < linkAOuterCnt) {
                    checkLinkInATS(linkAOuter[linkAOuterCur].innerText);
                }
            }
            else if (url.indexOf('github.com') >= 0) {
                if(emailOuterCur < emailOuterCnt) {
                    if(doc.indexOf(":candidateID=") >= 0) {
                        emailOuter[emailOuterCur].outerHTML += '<a target="_blank" style="color: red" href="' + urlATS + '?m=candidates&amp;a=show&amp;candidateID=' + doc.substr(doc.indexOf(":candidateID=") + ":candidateID=".length) + '" style="text-decoration: none;">NBI ATS</a>';   
                    }
                    else if(doc.indexOf(emailOuter[emailOuterCur].innerText + ":0") >= 0) {
                        //emailOuter[emailOuterCur].outerHTML += 'NBI ATS: Not found'; 
                    }
                    else if(doc.indexOf("cats_authenticationFailed") >= 0) {
                        emailOuter[emailOuterCur].innerHTML +=
                        '<a target="_blank" style="color: red" href="' + urlATS + '" style="text-decoration: none;">NBI ATS: Please login first!</a>';        
                    
                    }
                    emailOuterCur++;
                }
                if(emailOuterCur < emailOuterCnt) {
                    checkEmailInATS(emailOuter[emailOuterCur].innerText);
                }
            }
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
            console.log('failed_to_fetch_url Link');
        }

        // Handles parsing the feed data we got back from XMLHttpRequest.
        function handleLinkResponse() {
            console.log('on Link handleResponse');
          var doc = req.responseText;
            if (!doc) {
                console.log('not_a_valid_url');
                return;
            }
            console.log(doc);
            //console.log(req);
            var url = document.URL;
            if (url.indexOf('linkedin.com/') >= 0) { // include /in/ and /search/
                if(linkAOuterCur < linkAOuterCnt) {
                    if(doc.indexOf(":candidateID=") >= 0) {
                            linkAOuter[linkAOuterCur].innerHTML +=
                            '<a target="_blank" style="color: red" href="' + urlATS + '?m=candidates&amp;a=show&amp;candidateID=' + doc.substr(doc.indexOf(":candidateID=") + ":candidateID=".length) + '" style="text-decoration: none;">NBI ATS</a>';
                    }
                    else if(doc.indexOf("cats_authenticationFailed") >= 0) {
                            linkAOuter[linkAOuterCur].innerHTML +=
                            '<a target="_blank" style="color: red" href="' + urlATS + '" style="text-decoration: none;">NBI ATS: Please login first!</a>';
                    }
                    linkAOuterCur++;
                }
                console.log("Cnt: " + linkAOuterCnt + ", Cur: " + linkAOuterCur);
                if(linkAOuterCur < linkAOuterCnt) {
                    checkLinkInATS('https://www.linkedin.com' + linkAOuter[linkAOuterCur].getAttribute('href').replace(/\/$/, ""));
                }
            }
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
    }
    else {
        if (window == top) {
          chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
              if(document.URL.indexOf('chrome://extensions/')) {
                  sendResponse('setup');
              }
          });
        }        
    }
});
