"use strict";

var index    = require("../../../lib/index");
var messages = require("../../../lib/messages");
var config   = require("../../../lib/config");

var ansiTrim = require("cli-color/lib/trim");
var assert   = require("chai").assert;


describe("Messages module", function () {

    it("can be loaded", function () {
        assert.isDefined(messages);
    });

    describe("No server or Proxy output", function () {
        it("should output the", function () {
            var expected = "[BS] Copy the following snippet into your website, just before the closing </body> tag";
            expected    += "\n\n<script type='text/javascript'>//<![CDATA[\n;";
            expected    += "document.write(\"<script defer src='//HOST:3000/socket.io/socket.io.js'><\\/script>";
            expected    += "<script defer src='//HOST:3001/client/browser-sync-client.1.2.3.js'><\\/script>\".replace(/HOST/g, location.hostname));";
            expected    += "\n//]]></script>\n";

            var actual   = ansiTrim(messages.init({socket: 3000, controlPanel: 3001}, {version: "1.2.3"}));
            assert.equal(actual, expected);
        });
    });

    describe("Server Output", function () {
        it("Can confirm the server is running", function () {
            var expected = "[BS] Server running...\n";
            expected    += "[BS] You can access it through the following addresses:\n\n";
            expected    += "[BS] Local (this machine):\n";
            expected    += "[BS] >>> http://localhost:8000\n";
            expected    += "[BS] External (other devices etc):\n";
            expected    += "[BS] >>> http://0.0.0.0:8000\n";
            expected    += "[BS] Serving files from: /users/shakyshane/app/files";
            var actual = ansiTrim(messages.initServer("0.0.0.0", 8000, "/users/shakyshane/app/files"));
            assert.equal(actual, expected);
        });
        it("can fail when both server & proxy supplied", function () {
            var expected = "[BS] Invalid config. You cannot specify both a server & proxy option.";
            var actual   = ansiTrim(messages.server.withProxy());
            assert.equal(actual, expected);
        });

        it("Can confirm the server is running with muliple DIRS", function () {
            var expected = "[BS] Server running...\n";
            expected    += "[BS] You can access it through the following addresses:\n\n";
            expected    += "[BS] Local (this machine):\n";
            expected    += "[BS] >>> http://localhost:8000\n";
            expected    += "[BS] External (other devices etc):\n";
            expected    += "[BS] >>> http://0.0.0.0:8000\n";
            expected    += "[BS] Serving files from: /users/shakyshane/app/files\n";
            expected    += "[BS] Serving files from: /users/shakyshane/app/files2";

            var base = ["/users/shakyshane/app/files", "/users/shakyshane/app/files2"];
            var actual = ansiTrim(messages.initServer("0.0.0.0", 8000, base));
            assert.equal(actual, expected);
        });
        it("Can confirm the server is running with muliple DIRS", function () {
            var expected = "[BS] Server running...\n";
            expected    += "[BS] You can access it through the following addresses:\n\n";
            expected    += "[BS] Local (this machine):\n";
            expected    += "[BS] >>> http://localhost:8000\n";
            expected    += "[BS] External (other devices etc):\n";
            expected    += "[BS] >>> http://0.0.0.0:8000\n";
            expected    += "[BS] Serving files from: /users/shakyshane/app/files\n";
            expected    += "[BS] Serving files from: /users/shakyshane/app/files2\n";
            expected    += "[BS] Serving files from: /users/app";

            var base = ["/users/shakyshane/app/files", "/users/shakyshane/app/files2", "/users/app"];
            var actual = ansiTrim(messages.initServer("0.0.0.0", 8000, base));
            assert.equal(actual, expected);
        });
    });

    describe("Proxy Output", function () {

        var ports, host;

        beforeEach(function () {
            ports = [3000, 3001, 3002];
            host = "192.168.0.3";
        });
        it("can output a message about proxy (1)", function () {
            var expected = "[BS] Proxying: http://develop.dev:8080/\n";
            expected    += "[BS] Now you can access your site through the following addresses:\n\n";
            expected    += "[BS] Local (this machine):\n";
            expected    += "[BS] >>> http://127.0.0.1.xip.io:8000\n";
            expected    += "[BS] External (other devices etc):\n";
            expected    += "[BS] >>> http://0.0.0.0.xip.io:8000\n";

            var actual = ansiTrim(messages.initProxy("http://127.0.0.1.xip.io:8000", "http://0.0.0.0.xip.io:8000", "http://develop.dev:8080/"));
            assert.equal(actual, expected);
        });
        it("can output a message about proxy (2)", function () {
            var expected = "[BS] Proxying: http://localhost:9876/\n";
            expected    += "[BS] Now you can access your site through the following addresses:\n\n";
            expected    += "[BS] Local (this machine):\n";
            expected    += "[BS] >>> http://localhost:8000\n";
            expected    += "[BS] External (other devices etc):\n";
            expected    += "[BS] >>> http://0.0.0.0:8000\n";

            var actual = ansiTrim(messages.initProxy("http://localhost:8000", "http://0.0.0.0:8000", "http://localhost:9876/"));
            assert.equal(actual, expected);
        });
    });

    describe("Creating URLS", function () {
        it("can return a full URL with ports", function () {
            var expected = "http://192.168.0.4:3001";
            var actual   = messages._makeUrl("192.168.0.4", 3001, "http:");
            assert.equal(actual, expected);
        });
    });

    describe("Port Errors", function () {
        it("can print a error msg before killing process", function () {
            var expected = "[BS] Invalid port range! - At least 3 required!";
            var actual   = ansiTrim(messages.ports.invalid(3));
            assert.equal(actual, expected);
        });
    });

    describe("Outputting script tags", function () {
        var ports;
        before(function () {
            ports = {
                socket: 3000,
                controlPanel: 3001
            };
        });
        it("can output the new snippet", function () {
            var expected = "\n<script type='text/javascript'>//<![CDATA[\n;";
            expected    += "document.write(\"<script defer src='//HOST:3000/socket.io/socket.io.js'><\\/script>";
            expected    += "<script defer src='//HOST:3001/client/browser-sync-client.2.3.4.js'><\\/script>\".replace(/HOST/g, location.hostname));";
            expected    += "\n//]]></script>\n";

            var actual = messages.scriptTags(ports, {version:"2.3.4"});
            assert.equal(actual, expected);
        });
        it("can retrieve the injector", function () {
            var expected = "\n<script type='text/javascript'>//<![CDATA[\n;";
            expected    += "document.write(\"<script defer src='//HOST:3000/socket.io/socket.io.js'><\\/script>";
            expected    += "<script defer src='//HOST:3001/client/browser-sync-client.2.3.5.js'><\\/script>\".replace(/HOST/g, location.hostname));";
            expected    += "\n//]]></script>\n";

            var actual = messages.scriptTags(ports, {version:"2.3.5"});
            assert.equal(actual, expected);
        });
        it("can output Socket.io + connector only (for plugins, such as the control panel)", function () {
            var expected = "\n<script type='text/javascript'>//<![CDATA[\n;";
            expected    += "document.write(\"<script defer src='//HOST:3000/socket.io/socket.io.js'><\\/script>";
            expected    += "\".replace(/HOST/g, location.hostname));";
            expected    += "\n//]]></script>\n";

            var actual = messages.scriptTags(ports, {}, "controlPanel");
            assert.equal(actual, expected);
        });
    });

    describe("outputting the client Script file", function () {
        it("should return the client script with a version (1)", function () {
            var options = {
                version: "0.5.5"
            };
            var expected = "/client/browser-sync-client.0.5.5.js";
            var actual   = messages.clientScript(options);
            assert.equal(actual, expected);
        });
        it("should return the client script with a version (2)", function () {
            var options = {
                version: "1.2.3"
            };
            var expected = "/client/browser-sync-client.1.2.3.js";
            var actual   = messages.clientScript(options);
            assert.equal(actual, expected);
        });
    });

    describe("Outputting shims JS", function () {
        it("should return the client-shim js file", function () {
            var expected = "/client/client-shims.js";
            var actual   = config.client.shims;
            assert.equal(actual, expected);
        });
    });

    describe("Outputting App JS", function () {
        it("should return the app js file", function () {
            var expected = "/js/app.js";
            var actual   = config.controlPanel.jsFile;
            assert.equal(actual, expected);
        });
    });

    describe("Outputting the config created message", function () {
        it("should accept the params and print the correct message", function () {
            var expected  = "[BS] Config file created (bs-config.js)\n";
            expected += "[BS] To use it, in the same directory run: browser-sync";
            var actual    = ansiTrim(messages.config.confirm("/users/shakyshane/app/bs-config.js"));
            assert.equal(actual, expected);
        });
        it("should accept the params and print the correct message (2)", function () {
            var expected  = "[BS] Config file created (bs-config.js)\n";
            expected += "[BS] To use it, in the same directory run: browser-sync";
            var actual    = ansiTrim(messages.config.confirm("/app/bs-config.js"));
            assert.equal(actual, expected);
        });
    });

    describe("Outputting generic messages", function () {
        it("should output browser connected correctly", function () {
            var expected = "[BS] Browser Connected! (Chrome, version: 21.222)";
            var actual = ansiTrim(messages.browser.connection({name: "Chrome", version: "21.222"}));
            assert.equal(actual, expected);
        });
        it("should output invalid base dir message", function () {
            var expected = "[BS] Invalid Base Directory path for server. Should be like this ( baseDir: 'path/to/app' )";
            var actual = ansiTrim(messages.invalidBaseDir());
            assert.equal(actual, expected);
        });
    });

    describe("Outputting file watching messages", function () {
        it("should output warning if no files watched", function () {
            var expected = "[BS] Not watching any files...";
            var actual = ansiTrim(messages.files.watching([]));
            assert.equal(actual, expected);
        });
        it("should output a file-watching message", function () {
            var expected = "[BS] Watching files...";
            var actual = ansiTrim(messages.files.watching(["**/*.css"]));
            assert.equal(actual, expected);
        });
        it("should notify when a file is changed (1)", function () {
            var expected = "[BS] File Changed: file.js";
            var actual   = ansiTrim(messages.files.changed("/users/shane/file.js"));
            assert.equal(actual, expected);
        });
        it("should notify when a file is changed (2)", function () {
            var expected = "[BS] File Changed: file.js";
            var actual   = ansiTrim(messages.files.changed("/file.js"));
            assert.equal(actual, expected);
        });
        it("should notify when a file is changed & should be reloaded", function () {
            var expected = "[BS] Reloading all connected browsers...";
            var actual   = ansiTrim(messages.browser.reload());
            assert.equal(actual, expected);
        });
        it("should notify when a file is changed & should be injected", function () {
            var expected = "[BS] Injecting file into all connected browsers...";
            var actual   = ansiTrim(messages.browser.inject());
            assert.equal(actual, expected);
        });
        it("should notify when changing location", function () {
            var expected = "[BS] Link clicked! Redirecting all browsers to http://local.dev/forms.html";
            var actual   = ansiTrim(messages.location("http://local.dev/forms.html"));
            assert.equal(actual, expected);
        });
        it("should output the socket connector", function () {
            var expected = "var ___socket___ = io.connect('http://' + location.hostname + ':' + '3001');";
            var actual   = messages.socketConnector(3001);
            assert.equal(actual, expected);
        });
    });

    describe("Outputting the message about multiple IPs", function () {
        it("should warn when multiple IPs found", function () {
            var expected = "[BS] Warning: Multiple External IP addresses found\n";
            expected    += "[BS] If you have problems, you may need to manually set the 'host' option";
            var actual   = ansiTrim(messages.host.multiple());
            assert.equal(actual, expected);
        });
    });
});