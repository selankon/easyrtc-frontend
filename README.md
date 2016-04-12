# Easyrtc-frontend
## Easyrtc front end built in AngularJS and Angular Material

#### HOW DO YOU INSTALL THE FRONT-END?

#### NOT WRITTED AT ALL, NOT CODED AT ALL!!!


0. Clone the easyrtc frontend into server root in a folder called app
1. Add the https feature to the server with a fake keys for do the tests
  - ADD the following lines

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
2. Add your easyrtc-frontend files to the server avoiding create a new one
in `/lib/easyrtc_default_options.js`

  ```javascript
  // App Options
  option.appEnable          = true;
  option.appPublicFolder    = "/app";
  ```

3. In `/lib/easyrtc_default_event_listeners` after aproximately line 1616 add an if for our app.

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

With this we can acces to the forntend directly from our server installation without aditional http server.
