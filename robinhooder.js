// ==UserScript==
// @name         Robinhooder
// @namespace    https://robinhood.com/
// @version      0.1
// @description  Enhance Robinhood by showing existence/non-existence of open orders in the dashboard
// @author       Chris Grimmett <chris@grimtech.net>
// @match        https://robinhood.com/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @run-at       document-idle
// ==/UserScript==



(function() {
    'use strict';
    var $ = window.jQuery;
    var positions = {};
    var instruments = {};
    const debugMode = false;


    /*--- waitForKeyElements():  A utility function, for Greasemonkey scripts,
    that detects and handles AJAXed content.

    Usage example:

        waitForKeyElements (
            "div.comments"
            , commentCallbackFunction
        );

        //--- Page-specific function to do what we want when the node is found.
        function commentCallbackFunction (jNode) {
            jNode.text ("This comment changed by waitForKeyElements().");
        }

    IMPORTANT: This function requires your script to have loaded jQuery.
    */
    function waitForKeyElements(
     selectorTxt,
     actionFunction,
     bWaitOnce,
     iframeSelector
    ) {
        var targetNodes, btargetsFound;

        if (typeof iframeSelector == "undefined") {
            targetNodes = $(selectorTxt);
        } else {
            targetNodes = $(iframeSelector).contents()
                .find(selectorTxt);
        }

        if (targetNodes && targetNodes.length > 0) {
            btargetsFound = true;
            /*--- Found target node(s).  Go through each and act if they
        are new.
    */
            targetNodes.each(function() {
                var jThis = $(this);
                var alreadyFound = jThis.data('alreadyFound') || false;

                if (!alreadyFound) {
                    //--- Call the payload function.
                    var cancelFound = actionFunction(jThis);
                    if (cancelFound) {
                        btargetsFound = false;
                    } else {
                        jThis.data('alreadyFound', true);
                    }
                }
            });
        } else {
            btargetsFound = false;
        }

        //--- Get the timer-control variable for this selector.
        var controlObj = waitForKeyElements.controlObj || {};
        var controlKey = selectorTxt.replace(/[^\w]/g, "_");
        var timeControl = controlObj[controlKey];

        //--- Now set or clear the timer as appropriate.
        if (btargetsFound && bWaitOnce && timeControl) {
            //--- The only condition where we need to clear the timer.
            clearInterval(timeControl);
            delete controlObj[controlKey]
        } else {
            //--- Set a timer, if needed.
            if (!timeControl) {
                timeControl = setInterval(function() {
                    waitForKeyElements(selectorTxt,
                                       actionFunction,
                                       bWaitOnce,
                                       iframeSelector
                                      );
                },
                                          300
                                         );
                controlObj[controlKey] = timeControl;
            }
        }
        waitForKeyElements.controlObj = controlObj;
    }

    // hook into XMLHttpRequest.prototype.open so we can listen in on JSON received from Robinhood
    (function(open) {
        XMLHttpRequest.prototype.open = function() {
            this.addEventListener("readystatechange", function() {
                //console.log(this.responseURL);
                if (this.responseURL === 'https://api.robinhood.com/positions/?nonzero=true') {
                    storePositions(this.response);
                }
                if (this.responseURL.substring(0, 44) === 'https://api.robinhood.com/marketdata/quotes/') {
                    //console.log('storing symbols');
                    //console.log(this.response);
                    //console.log(typeof this.response);
                    storeInstruments(this.response);
                }
            }, false);
            open.apply(this, arguments);
        };
    })(XMLHttpRequest.prototype.open);

    /**
     * Store positions locally. This later enables us to get shares_held_for_sells from the instrument.
     * positions are stored in array with the key being the instrument string.
     * ex: positions['https://api.robinhood.com/instruments/e39ed23a-7bd1-4587-b060-71988d9ef483/'] => 2;
     */
    const storePositions = (response) => {
        //console.log(response.length);
        //console.log(typeof response);
        if (response.length > 0) {
            const res = JSON.parse(response);
            if (res.results) {
                for (var x = 0; x < res.results.length; x++) {
                    positions[res.results[x].instrument] = parseInt(res.results[x].shares_held_for_sells);
                }
                console.log(positions);
            }
        }
    };

    /**
     * enables us to later get instrument from stock ticker symbol
     */
    const storeInstruments = (response) => {
        //console.log(response.length);
        //console.log(response);
        //console.log(typeof response);
        if (response.length > 0) {
            const res = JSON.parse(response);
            if (res.results) {
                for (var x = 0; x < res.results.length; x++) {
                    instruments[res.results[x].symbol] = res.results[x].instrument;
                }
            }
        }
    };


    const highlightDOM = () => {
        //$('section > div > header > h3').css("border", '3px solid blue');
        if (debugMode === true) {
            $('div.sidebar-content section:nth-child(1) a[href^="/stocks/"]').css("border", '3px solid blue');
            $('a[href="/account/referral"]').css("border", '3px solid red');
        }
    };

    const getOrdersCount = (tickerSymbol) => {
        const instrument = instruments[tickerSymbol];
        const ordersCount = positions[instrument];
        console.log(`ticker:${tickerSymbol} instrument:${instrument}, ordersCount:${ordersCount}`)
        return ordersCount;
    };

    const addRefreshButton = () => {
        $('a[href="/account/referral"]').parent().prepend('<a id="enhancement-button" class="rh-hyperlink xgzdGyr8bFpObMnpLZh5g" href="#" rel="">Enhance</a>');
    };

    const enhancePortfolio = () => {
        console.log('ENHANCE!');
        console.log(instruments);
      $('div.open-order-count').remove();

      $('div.sidebar-content section:nth-child(1) a[href^="/stocks/"] > div:nth-child(1) > h4').each(function (idx) {
          const ordersCount = getOrdersCount(this.innerText);
          if (debugMode === true) { $(this).css("border", '3px solid green'); }
          $(this).next().append('<div class="open-order-count">'+ordersCount+' Orders</div>');
      })
    };

    waitForKeyElements('h3:contains(Stocks)', function() {
        highlightDOM();
        addRefreshButton();
        enhancePortfolio();

        document.getElementById("enhancement-button").addEventListener("click", function(event){
            event.preventDefault()
            enhancePortfolio();
        });
    }, true, undefined);


})();
