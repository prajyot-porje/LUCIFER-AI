function cleanString(inputString) {
  return inputString.replace(/[#*]/g, ''); // Replace '#' and '*' characters
}

async function postData(url = '', data = {}) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Handle rate-limiting with exponential backoff
        const retryAfter = response.headers.get('Retry-After') || 5000; // Default to 5 seconds
        console.log(`Rate limited. Retrying in ${retryAfter}ms`);
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        return await postData(url, data); // Retry request
      }

      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
  const sendButton = document.getElementById("sendButton");
  const errorMessage = document.getElementById("errorMessage");
  
  sendButton.addEventListener("click", async () => { 
    const questionInput = document.getElementById("questionInput").value.trim();
    document.getElementById("questionInput").value = "";
    document.querySelector(".right2").style.display = "block";
    document.querySelector(".right1").style.display = "none";

    document.getElementById("question1").innerHTML = questionInput;
    document.getElementById("question2").innerHTML = questionInput;

    try {
      const result = await postData("/api", { "question": questionInput });
      document.getElementById("solution").innerHTML = cleanString(result.answer);
      errorMessage.textContent = ""; // Clear any previous error messages
    } catch (error) {
      errorMessage.textContent = error.message; // Display the error message
    }
  });
});

document.addEventListener("DOMContentLoaded", function() {
  const newChatButton = document.getElementById("newchat");
  const right1Div = document.querySelector(".right1");
  const right2Div = document.querySelector(".right2");

  newChatButton.addEventListener("click", function() {

      if (right1Div.style.display === "none" || right1Div.style.display === "") {
          right1Div.style.display = "block";
          right2Div.style.display = "none";
      } else {
          right1Div.style.display = "none";
          right2Div.style.display = "block";
      }
  });
});
