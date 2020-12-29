/**
* Listen for clicks on the buttons, and send the appropriate message to
* the content script in the page.
*/
function listenForClicks() {
    document.addEventListener("click", (e) => {

        function runControls(tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "run",
            });
        }

        /**
        * Just log the error to the console.
        */
        function reportError(error) {
            console.error(`Could not run: ${error}`);
        }
        
        browser.tabs.query({active: true, currentWindow: true})
                    .then(runControls)
                    .catch(reportError);
    });
}

/**
* There was an error executing the script.
* Display the popup's error message, and hide the normal UI.
*/
function reportExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error(`Failed to execute content script: ${error.message}`);
}

if (window)

/**
* When the popup loads, inject a content script into the active tab,
* and add a click handler.
* If we couldn't inject the script, handle the error.
*/
browser.tabs.executeScript({file: "/content_scripts/controls.js"})
            .then(listenForClicks)
            .catch(reportExecuteScriptError);

