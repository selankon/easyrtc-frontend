# Easyrtc-frontend

_NOT WRITTED AT ALL, NOT CODED AT ALL!!!_

## Easyrtc front end built in AngularJS and Angular Material

This is a frontend built for the [EasyRTC](https://github.com/priologic/easyrtc) bundle, based in [WebRTC](https://webrtc.org/) project, that wants to make browser based real time communications easiest to use and implement using a simple API.

The technology used to build this frontend are [AngularJS](https://angularjs.org/) framework and [Angular Material](https://material.angularjs.org) how UI Component framework.

Also other technologies and open source codes are used for this purpose, _thanks to all_!

![EasyRTC](https://easyrtc.com/assets/images/site/easyrtc-logo.png)  ![AngularJS](http://2.bp.blogspot.com/-cFDEu1MlBoQ/VASmJppOkkI/AAAAAAAACtM/bSWD-rBq9pA/s1600/angularjs.png)
<!-- ![WebRTC](http://1.bp.blogspot.com/-P3WAVZtyytk/VO5Gou9SZzI/AAAAAAAAAPE/-550eUz_vVM/s1600/WebRTC.png =200x60)  -->



## Installation
#### Using server example from easyrtc github repository

0. Clone the easyrtc frontend in the cloned root of [EasyRTC](https://github.com/priologic/easyrtc) in a folder called `app`
1. Add the https feature to the server. (OPTIONAL)
  - ADD the following lines on server_example/server.js

  ```javascript
  var fs = require('fs');                   //For read fakekeys http
  var https    = require("https");          // https server core module


  var HTTP_PORT = 7070;
  var HTTPS_PORT = 7071;
  var privateKey = fs.readFileSync('fakekeys/privatekey.pem').toString(),
      certificate = fs.readFileSync('fakekeys/certificate.pem').toString();

  var httpsServer = https.createServer({key: privateKey, cert: certificate}, httpApp).listen(HTTPS_PORT);
  var webServer = http.createServer(httpApp).listen(HTTP_PORT);

  var socketServer = io.listen(webServer, {"log level":1});
  var socketServer = io.listen(httpsServer, {"log level":1});
  ```
2. Add the easyrtc-frontend files to the server avoiding create a new one
in. Configure it in `/lib/easyrtc_default_options.js`

  ```javascript
  // App Options
  option.appEnable          = true;
  option.appPublicFolder    = "/app";
  ```

3. In `/lib/easyrtc_default_event_listeners` after aproximately line 1616 add an `if` for our app.

  ```javascript
  // Set the EasyRTC demos
  if (pub.getOption("appEnable")) {
      pub.util.logDebug("Setting up app to be accessed from '" + pub.getOption("appPublicFolder") + "/'");
      pub.httpApp.get(pub.getOption("appPublicFolder") + "/*", function(req, res) {
          (res.sendFile||res.sendfile).call(res,
              "./app/" + (req.params[0] ? req.params[0] : "index.html"),
              {root:__dirname + "/../"},
              function(err) {
                  try{if (err && err.status && res && !res._headerSent) {
                      res.status(404);
                      var body =    "<html><head><title>File Not Found</title></head><body><h1>File Not Found</h1></body></html>";
                      res.setHeader("Content-Type", "text/html");
                      res.setHeader("Content-Length", body.length);
                      res.end(body);
                  }}catch(e){}
              }
          );
      });
      // Forward people who forget the trailing slash to the folder.
      pub.httpApp.get(pub.getOption("appPublicFolder"), function(req, res) {res.redirect(pub.getOption("appPublicFolder") + "/");});
    }
  ```

With this we could acces to the frontend directly from server_example, cloned from easyrtc github repo  without writing new one.

**Don't forget to run bower install if it's necessary**

## Configuration

You can configure some things like chat sound or urls paths on `configurations.js`

## ToDo

**General**
- [ ] Multiparty Veideo chatroom support.
- [ ] Only audio conference room support.
- [ ] Testing all components.
- [ ] Put the frontend work hardly and see the errors.
- [ ] Make interface fully responsive.
- [ ] Test responsive.
- [ ] Nickname feature.
- [ ] Improve file transfer system
  * Multiple download from different sources
  * Better communication system
- [ ] Start file sharing from videocall room and videocalls from filesharing room



**Improvements**
- [ ] Minimize / Maximize chat.
- [ ] Chat messages appear in the middle of the screen on little devices.
- [ ] Improved interface on file transfer rooms (more intuitive and easy to use).
- [ ] beautiful and explanative "choice" page.
- [ ] Improved chat features (like who is writting, beauty message show...).
- [ ] Improve Emoji menu (to be more beautiful).
- [ ] Make userlist beauty.
- [ ] Make filelist beauty.
- [ ] File transfer stop button.
- [ ] Button stop calling.
