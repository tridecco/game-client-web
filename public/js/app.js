/**
 * The main javascript file for the application.
 * @module js/app
 */

class App {
  /**
   * Create a new App object.
   * @param {string} serverUrl - The URL of the server.
   */
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  /**
   * Display a notification message in an element.
   * @param {string} type - The type of notification.
   * @param {string | string[]} message - The message to display.
   * @param {string} status - The status of the notification.
   * @param {HTMLElement} parentElement - The parent element to append the notification to.
   * @returns {HTMLElement} The notification element.
   */
  notification(type, message, status, parentElement) {
    let alert = document.createElement("div");

    let colorClasses = "";
    switch (status) {
      case "success":
        colorClasses = "text-green-800 border-green-300 bg-green-50";
        break;
      case "info":
        colorClasses = "text-gray-800 border-gray-300 bg-gray-50";
        break;
      case "warning":
        colorClasses = "text-yellow-800 border-yellow-300 bg-yellow-50";
        break;
      case "error":
        colorClasses = "text-red-800 border-red-300 bg-red-50";
        break;
      default:
        colorClasses = "text-gray-800 border-gray-300 bg-gray-50";
        break;
    }

    if (type === "alert") {
      alert.className = `flex items-center p-4 mt-2 mb-4 text-sm ${colorClasses} border rounded-lg`;
      alert.role = "alert";
      alert.innerHTML = `
          <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 1 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
          </svg>
          <span class="sr-only">Info</span>
          <div>
            <span class="font-medium">${message}</span>
          </div>`;
    } else if (type === "list") {
      const messageAfterOne = message.slice(1);
      const list = messageAfterOne.map((item) => `<li>${item}</li>`).join("");

      alert.className = `flex p-4 mt-2 mb-4 text-sm ${colorClasses} rounded-lg`;
      alert.role = "alert";
      alert.innerHTML = `
          <svg class="flex-shrink-0 inline w-4 h-4 me-3 mt-[2px]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 1 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
          </svg>
          <span class="sr-only">${message[0]}</span>
          <div>
            <span class="font-medium">Ensure that these requirements are met:</span>
            <ul class="mt-1.5 list-disc list-inside">
              ${list}
            </ul>
          </div>`;
    }

    parentElement.appendChild(alert);

    return alert;
  }
}

// Create a new App object (global variable)
const app = new App("http://127.0.0.1:3000");
