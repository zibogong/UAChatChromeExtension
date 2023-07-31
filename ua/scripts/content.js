const endpoint = "https://api.openai.com/v1/chat/completions";

var timeoutID = null;

var messageList = [
    {"role": "system", "content": "You are a personal assistant, helping me communicate with United Airline customer service. Please help me with: 'Our baggage was delayed for two days, we want to get compensation for that. Baggage delay has caused a lot of inconvenience. Please try to ask for more compensation. The passengar name is John Doe. I've submitted the baggage claim form, referrence number is RANDOM123. Flight number: UA5552 and the date is 16 July 2023.'. Please respond based on UA customer service's reply. If given options by the customer service, please select the relevant one and reply. Please prioritize the option to communicate with the agent. If none of the options apply, please navigate to make it. If you don't have the context about the question, please answer 'please provide more context'"}
];
var message = ""

var stopped = false;

function extractText(dom) {
    let elements = dom.querySelectorAll('*');
    let output = [];

    elements.forEach((element) => {
        var filteredChildren = Array.from(element.children).filter(child => child.tagName !== "BR");
        if (element.textContent.trim() === '' || filteredChildren.length > 0) return;
        output.push(element.textContent.trim());
    });

    return output.join('\n');
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request.msg)
    if (request.msg === 'start') {
        stopped = false
        var observer = new MutationObserver(function(mutationsList, observer) {
            if (stopped) {
                return
            }
            for(var mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(newNode){
                        if(newNode.classList.contains('lp_agent')) {
                            var nodeText = extractText(newNode).trim()
                            console.log(nodeText);
                            if (timeoutID != null) {
                                clearTimeout(timeoutID);
                            }
                            message = message + "\n" + nodeText

                            timeoutID = setTimeout(() => {
                                messageList.push(
                                    {"role": "user", "content": message}
                                )
                                if (messageList.length > 10) {
                                    messageList.splice(1, 1);
                                }
                                message = "";

                                const data = {
                                    "model": "gpt-4",
                                    "messages": messageList
                                    };
                                
                                // console.log("####Message to send####")
                                // console.log(JSON.stringify(data))
                                // console.log("####Message to ends####")
                                
                                fetch(endpoint, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer {API_KEY}`  // replace with your actual API key
                                    },
                                    body: JSON.stringify(data)
                                })
                                .then(response => response.json())
                                .then(data => {
                                    var messageContent = data.choices[0].message.content
                                    console.log("####Response from chatgpt####")
                                    console.log(messageContent)
                                    console.log("####Response from chatgpt####")
                                    messageList.push(
                                        {"role": "assistant", "content": data.choices[0].message.content}
                                    )
                                    if (messageList.length > 10) {
                                        messageList.splice(1, 1);
                                    }
                                    if (messageContent.includes('please provide more context')) {
                                        console.log("Please provide more context")
                                    } else {
                                        textarea.focus();
                                        document.execCommand('insertText', false, data.choices[0].message.content);
                                        button.disabled = false;
                                        button.click();
                                    }
                                })
                                .catch((error) => {
                                    console.error('Error:', error);
                                });
                            }, 7000);
                        }
                    });
                }
            }
        });

        var config = { childList: true };
        targetNode = document.querySelector('.lpc_transcript');
        var textarea = document.querySelector('.lpview_form_textarea');
        var button = document.querySelector('.lp_paper_plane_button');

        observer.observe(targetNode, config);
    } else if (request.msg === 'stop') {
        stopped = true
    } else {
        console.log("Other msg")
    }
    sendResponse({});
});