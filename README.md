# Clip
[![Hits](https://hitcount.dev/p/lukeeey/clip.svg)](https://hitcount.dev/p/lukeeey/clip)  
Effortlessly copy & paste between devices.

### How it works
1. Open up [the site](https://clip.glitch.je) on two devices (or two tabs if you're testing!). 
2. On one page, click **Create Session**
3. On another page, enter the **Session ID** and click **Join**
4. Type in the box, hit enter, and watch it appear on the other page!

> [!NOTE]
> You can delete invidual items or delete the entire session itself. Please note that clicking Change session will not delete the session, it will remove you from it.

> [!NOTE]
> Sessions expire automatically after 10 minutes of inactivity

### Compiling
The backend is in Java using the Javalin framework and the frontend uses React. Maven is used as the build system.

To package the app, simply install Java & Maven and then run `mvn package`.

### TODO
* The `encrypted` property is stored per item currently. The encryption key should be the same for each item that is encrypted, currently there are edge cases where you can set two encryption keys in different windows and you won't be able to view the items. I implemented encryption very quickly so haven't tidied this up yet.
* Image pasting?
* Port is currently hardcoded, let this be specified with an environment variable
