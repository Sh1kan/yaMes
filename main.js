const { app, BrowserWindow, shell, Tray, Menu, Notification } = require("electron")
const path = require("path")
const { ipcMain } = require("electron")
let win
let tray

ipcMain.on("new-message", (event, data) => {

  const { title, body } = data

  showNotification(title, body)

})

function createWindow() {

  win = new BrowserWindow({
    width: 1200,
    height: 900,
    icon: path.join(__dirname, "icon.png"),
    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      partition: "persist:yandex",
      contextIsolation: true
    }
  })

  win.loadURL("https://messenger.360.yandex.ru")

  // перехват window.open
  win.webContents.setWindowOpenHandler(({ url }) => {

    if (url.includes("yandex")) {
      win.loadURL(url)
      return { action: "deny" }
    }

    shell.openExternal(url)
    return { action: "deny" }
  })

  // скрываем вместо закрытия
  win.on("close", (event) => {

    if (!app.isQuiting) {
      event.preventDefault()
      win.hide()
    }

  })

  win.webContents.on("page-title-updated", (event, title) => {

  const match = title.match(/\((\d+)\)/)

  if (match) {

    const count = parseInt(match[1])

    tray.setTitle(` ${count}`)

  } else {

    tray.setTitle("")

  }

})

}

function createTray() {

  tray = new Tray(path.join(__dirname, "icon.png"))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Открыть",
      click: () => {
        win.show()
      }
    },
    {
      label: "Выход",
      click: () => {
        app.isQuiting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip("Yandex Messenger")

  tray.setContextMenu(contextMenu)

  tray.on("click", () => {
    win.isVisible() ? win.hide() : win.show()
  })
}

function showNotification(title, body) {

  new Notification({
    title,
    body,
    icon: path.join(__dirname, "icon.png")
  }).show()

}

app.whenReady().then(() => {

  createWindow()
  createTray()

  // тестовое уведомление
  setTimeout(() => {

    showNotification(
      "Yandex Messenger",
      "Приложение запущено"
    )

  }, 3000)

})

app.on("window-all-closed", () => {})
