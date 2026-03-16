const { ipcRenderer } = require("electron")

let lastUnread = 0

function getUnreadFromTitle() {

  const title = document.title

  const match = title.match(/(\d+)/)

  if (!match) return 0

  return parseInt(match[1])

}

window.addEventListener("DOMContentLoaded", () => {

  const observer = new MutationObserver(() => {

    const unread = getUnreadFromTitle()

    if (unread === lastUnread) return

    ipcRenderer.send("update-unread", unread)

    if (unread > lastUnread) {

      ipcRenderer.send("new-message", {
        author: "Новое сообщение",
        text: `Новых сообщений: ${unread - lastUnread}`
      })

    }

    lastUnread = unread

  })

  const titleElement = document.querySelector("title")

  observer.observe(titleElement, {
    childList: true
  })

})
