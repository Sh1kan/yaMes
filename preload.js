const { contextBridge, ipcRenderer } = require("electron")

window.addEventListener("DOMContentLoaded", () => {

  const observer = new MutationObserver(() => {

    const messages = document.querySelectorAll("[data-message-id]")

    const last = messages[messages.length - 1]

    if (!last) return

    const text = last.innerText

    ipcRenderer.send("new-message", {
      title: "Новое сообщение",
      body: text
    })

  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

})
