const { app, BrowserWindow, shell, Tray, Menu, Notification, ipcMain, session } = require("electron")
const path = require("path")

let win
let tray
let unreadCount = 0
const iconNormal = path.join(__dirname, "icon.png")
const iconUnread = path.join(__dirname, "icon-unread.jpg")
app.commandLine.appendSwitch("disable-features", "BlockInsecurePrivateNetworkRequests")

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
win.webContents.openDevTools()
  win.webContents.setWindowOpenHandler(({ url }) => {

    if (url.includes("yandex")) {
      win.loadURL(url)
      return { action: "deny" }
    }

    shell.openExternal(url)
    return { action: "deny" }
  })

  win.on("close", (event) => {

    if (!app.isQuiting) {
      event.preventDefault()
      win.hide()
    }

  })
}

function updateTray() {

  if (!tray) return

  if (unreadCount > 0) {

    tray.setImage(iconUnread)
    tray.setTitle(` ${unreadCount}`)

  } else {

    tray.setImage(iconNormal)
    tray.setTitle("")

  }

}

function createTray() {

  tray = new Tray(iconNormal)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Открыть",
      click: () => {
        unreadCount = 0
        updateTray()
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

    if (win.isVisible()) {
      win.hide()
    } else {
      unreadCount = 0
      updateTray()
      win.show()
    }

  })
}

function showNotification(author, text) {

  const notification = new Notification({
    title: author || "Новое сообщение",
    body: text,
    icon: path.join(__dirname, "icon.png")
  })

  notification.show()

  notification.on("click", () => {
    unreadCount = 0
    updateTray()
    win.show()
  })
}

ipcMain.on("new-message", (event, data) => {

  const { author, text } = data

  if (!text) return

  unreadCount++

  updateTray()

  const notification = new Notification({
    title: author || "Новое сообщение",
    body: text,
    icon: path.join(__dirname, "icon.png")
  })

  notification.show()

})

ipcMain.on("update-unread", (event, count) => {

  unreadCount = count
  updateTray()

})

app.whenReady().then(() => {

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {

    if (permission === "notifications") {
      callback(true)
    } else {
      callback(false)
    }

  })

  createWindow()
  createTray()

})

app.on("window-all-closed", () => {})
