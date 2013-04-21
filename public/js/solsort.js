solsort_modules={};solsort_require = function(name){  name = name.slice(2);  var t = solsort_modules[name];  if(typeof t === "function") {     t(solsort_modules[name]={},solsort_require);     return solsort_modules[name]}  return t;};solsort_define = function(name,fn){solsort_modules[name]=fn};solsort_define("server",function(exports, require){if(undefined) {};
});solsort_define("v2d",function(exports, require){exports.V2d = V2d = function(x, y) {
    // outer: this
    this.x = x;
    this.y = y;
};
V2d.prototype.add = function(v) {
    // outer: this
    // outer: V2d
    return new V2d(this.x + v.x, this.y + v.y);
};
V2d.prototype.sub = function(v) {
    // outer: this
    // outer: V2d
    return new V2d(this.x - v.x, this.y - v.y);
};
V2d.prototype.scale = function(a) {
    // outer: this
    // outer: V2d
    return new V2d(this.x * a, this.y * a);
};
V2d.prototype.length = function() {
    // outer: this
    // outer: Math
    return Math.sqrt(this.x * this.x + this.y * this.y);
};
V2d.prototype.dot = function(v) {
    // outer: this
    return this.x * v.x + this.y * v.y;
};
V2d.prototype.norm = function() {
    // outer: this
    var len;
    len = this.length();
    return this.scale(len ? 1 / len : 0);
};
});solsort_define("test",function(exports, require){test = {};
test.name = "";
test.error = function(description) {
    // outer: console
    // outer: this
    ++this.error;
    console.log(this.name + ":", description);
};
test.assertEqual = function(a, b, description) {
    // outer: this
    description = description || "test: " + a + " !== " + b;
    if(a === b) {
        ++this.ok;
    } else  {
        this.error("assertEqual " + description);
    };
};
test.assert = function(result, description) {
    // outer: this
    if(result) {
        ++this.ok;
    } else  {
        this.error("assert " + description);
    };
};
test.done = function() {
    // outer: clearTimeout
    // outer: true
    // outer: this
    // outer: console
    console.log(this.name + ": " + this.ok + "/" + (this.ok + this.error) + " tests ok");
    this.finished = true;
    clearTimeout(this.timeout);
};
test.create = function(name, timeout) {
    // outer: setTimeout
    // outer: this
    // outer: test
    // outer: Object
    var self;
    self = Object.create(test);
    self.error = self.ok = 0;
    timeout = timeout || 60000;
    self.name = this.name + name;
    self.timeout = setTimeout(function() {
        // outer: timeout
        // outer: self
        if(!self.finished) {
            self.error("test timed out after " + timeout + "ms");
            self.done();
        };
    }, timeout);
    return self;
};
runTest = function(moduleName) {
    // outer: test
    // outer: ;
    // outer: use
    var module;
    module = use(moduleName);
    if(!module) {
        return ;
    };
    if(module.test) {
        module.test(test.create(moduleName));
    };
};
exports.main = function() {
    // outer: runTest
    // outer: console
    // outer: require
    require("./module").list().forEach(function(moduleName) {
        // outer: runTest
        // outer: console
        console.log(moduleName);
        runTest(moduleName);
    });
};
});solsort_define("experiments",function(exports, require){require("./build2");
1 - (2 - 3);
exports.apimain = function() {};
});solsort_define("storage",function(exports, require){util = require("./util");
// sync api
storeProto = {
    sync : util.throttledFn(function(done) {
        // outer: console
        // outer: true
        // outer: false
        // outer: ;
        // outer: setTimeout
        // outer: require
        var syncLocal;
        var serverSync;
        var connectTimeout;
        // outer: Object
        var newServer;
        var self;
        // outer: util
        // outer: this
        if(!this.lastSync) {
            // TODO: this should be gotten/stored in localstorage
            this.lastSync = 0;
        };
        util = util;
        self = this;
        newServer = {};
        connectTimeout = 10000;
        serverSync = function(callback) {
            // outer: serverSync
            // outer: newServer
            // outer: ;
            // outer: setTimeout
            // outer: self
            // outer: Object
            // outer: require
            // outer: util
            util = util;
            require("./rest").api.store({
                owner : self.owner,
                store : self.storename,
                timestamp : self.lastSync,
            }, function(result) {
                // outer: serverSync
                // outer: newServer
                // outer: self
                // outer: callback
                // outer: util
                // outer: ;
                // outer: setTimeout
                var connectTimeout;
                if(result.err) {
                    // retry exponentially later on connection failure
                    connectTimeout *= 1.5;
                    setTimeout(function() {
                        // outer: callback
                        // outer: self
                        self.sync(callback);
                    }, connectTimeout);
                    return ;
                };
                connectTimeout = 10000;
                result.forEach(function(obj) {
                    // outer: newServer
                    newServer[obj.key] = obj;
                });
                if(result.length === 100) {
                    util.nextTick(function() {
                        // outer: callback
                        // outer: serverSync
                        serverSync(callback);
                    });
                } else  {
                    callback();
                };
            });
        };
        syncLocal = function() {
            // outer: syncLocal
            // outer: serverSync
            // outer: console
            // outer: require
            // outer: true
            // outer: false
            var needSync;
            // outer: newServer
            // outer: self
            // outer: util
            // outer: Object
            var changedKeys;
            changedKeys = Object.keys(util.extend(util.extend({}, self.local), newServer));
            needSync = false;
            util.aForEach(changedKeys, function(key, done) {
                // outer: console
                // outer: Object
                // outer: require
                var timestamp;
                // outer: true
                // outer: needSync
                // outer: util
                // outer: newServer
                var serverVal;
                var localVal;
                // outer: self
                var prevVal;
                prevVal = self.server[key] && self.server[key].val;
                localVal = self.local[key];
                serverVal = newServer[key] && newServer[key].val;
                if(localVal === serverVal) {
                    self.server[key] = newServer[key];
                    util.delprop(self.local, key);
                    util.delprop(serverVal, key);
                    done();
                } else  {
                    needSync = true;
                    self.local[key] = self.mergeFn(prevVal, localVal, serverVal, key);
                    if(!self.local[key]) {
                        throw "empty mergeFn result";
                    };
                    timestamp = timestamp || (newServer[key] && newServer[key].timestamp);
                    timestamp = timestamp || (self.server[key] && self.server[key].timestamp);
                    timestamp = timestamp || 0;
                    require("./rest").api.store({
                        owner : self.owner,
                        store : self.storename,
                        timestamp : timestamp,
                        key : key,
                        val : self.local[key],
                    }, function(result) {
                        // outer: done
                        // outer: console
                        if(result.err) {
                            console.log(result);
                        };
                        done();
                    });
                };
            }, function() {
                // outer: syncLocal
                // outer: serverSync
                // outer: util
                // outer: needSync
                if(needSync) {
                    util.nextTick(function() {
                        // outer: syncLocal
                        // outer: serverSync
                        serverSync(syncLocal);
                    });
                };
            });
        };
        serverSync(syncLocal);
    }),
    set : function(key, val) {
        // outer: this
        this.local[key] = val;
        this.sync();
    },
    get : function(key) {
        // outer: this
        return this.local[key] || this.server[key] && this.server[key].val;
    },
    keys : function() {
        // outer: true
        // outer: this
        // outer: Object
        var result;
        result = {};
        Object.keys(this.local).concat(Object.keys(this.server)).forEach(function(key) {
            // outer: true
            // outer: result
            result[key] = true;
        });
        return Object.keys(result);
    },
};
exports.create = function(owner, storename, mergeFn) {
    // outer: storeProto
    // outer: Object
    var store;
    store = Object.create(storeProto);
    store.owner = owner;
    store.storename = storename;
    store.mergeFn = mergeFn;
    store.local = {};
    store.server = {};
    store.sync();
    return store;
};
// storage server-database/rest-api;
if(undefined) {};
});solsort_define("images",function(exports, require){require("./webapp");
jsonml = require("./jsonml");
exports.webmain = function() {
    // outer: console
    // outer: Math
    // outer: next
    // outer: jsonml
    // outer: undefined
    var current;
    var nextImg;
    var imgs;
    var i;
    // outer: Object
    // outer: location
    // outer: window
    var socket;
    // outer: Array
    var buttons;
    // outer: $
    $("body").append("<div id=\"menu\" style=\"position:fixed; right: 0; width: 100pt;\"></div>");
    buttons = [
        "foto_pub",
        "foto_ok",
        "foto_bad",
        "ppl_pub",
        "ppl_ok",
        "ppl_bad",
        "delete",
        "private",
        "bug",
    ];
    buttons.forEach(function(name) {
        // outer: socket
        // outer: current
        // outer: next
        // outer: Object
        // outer: Array
        // outer: jsonml
        // outer: $
        $("#menu").append(jsonml.toXml([
            "span",
            {id : name, style : "font: 16pt sans-serif; margin: 6pt 6pt 6pt 6pt; padding: 6pt 6pt 6pt 6pt; display: inline-block; border: 1px solid #ccc; border-radius: 6pt; box-shadow: 2pt 2pt 4pt 0pt #999; width: 80pt; text-align: center;"},
            name,
        ]));
        $("#menu").append("<br>");
        $("#" + name).live("click", function() {
            // outer: socket
            // outer: name
            // outer: current
            // outer: next
            next();
            current.rating = name;
            socket.emit("rate", current);
        });
    });
    socket = window.io.connect("http://" + location.host);
    socket.emit("my other event", {my : "data"});
    socket.on("hello", function(data) {
        // outer: next
        // outer: imgs
        imgs = data;
        next();
        next();
    });
    i = - 1;
    imgs = [];
    nextImg = current = undefined;
    window.next = function() {
        // outer: next
        // outer: console
        var extension;
        // outer: i
        // outer: imgs
        var img;
        // outer: window
        // outer: Math
        var wh;
        var h;
        // outer: nextImg
        // outer: current
        var $cur;
        // outer: $
        $("#current").remove();
        $cur = $("#next");
        $cur.attr("id", "current");
        current = nextImg;
        h = $cur.height();
        wh = Math.min($(window).height(), 500);
        $cur.attr("width", $cur.width() * wh / h);
        $cur.attr("height", wh);
        $cur.css("display", "inline");
        nextImg = img = imgs[++i];
        extension = img.exts.JPG || img.exts.jpg || img.exts.png || img.exts["RAF.bz2.png"] || img.exts["RAF.bz2.png"] || img.exts["raf.bz2.png"];
        console.log(extension);
        if(img.rating || !extension || i > 10000) {
            return next();
        };
        $("body").append("<img style=\"display:none;position:fixed;top:0;left:0;\" src=\"" + img.name + "." + extension + "\" id=\"next\">");
        //$('body').append("<img src=" + imgs[++i].name +);
    };
};
exports.nodemain = function() {
    // outer: console
    // outer: Math
    // outer: Object
    // outer: null
    // outer: __dirname
    var writeJSON;
    var io;
    var server;
    var app;
    var express;
    // outer: JSON
    var imgs;
    // outer: require
    var fs;
    fs = require("fs");
    /*
    var files = require("fs").readdirSync("/home/rasmuserik/private/image/DCIM/");
    files = files.sort();
    var imgs = {};
    var exts = {};
    files.forEach(function(filename) {
        var name = filename.split(".")[0];
        var extension = filename.split(".").slice(1).join(".");
        var obj = imgs[name] || (imgs[name] = {name : name, exts : {}});
        obj.exts[extension] = extension;
    });
    Object.keys(imgs).forEach(function(key) {
        var extension = Object.keys(imgs[key].exts).join(",");
        exts[extension] = (exts[extension] || 0) + 1;
    });
    console.log(files.length, exts);
    //fs.writeFile('/home/rasmuserik/solsort/imagelist.json', JSON.stringify(imgs, null, "  "));
    */
    imgs = JSON.parse(fs.readFileSync("/home/rasmuserik/solsort/imagelist.json"));
    // server
    express = require("express");
    app = require("express")();
    server = require("http").createServer(app);
    io = require("socket.io").listen(server);
    server.listen(8080);
    app.get("/", function(req, res) {
        // outer: __dirname
        // outer: require
        require("fs").readFile(__dirname + "/../apps/images/index.html", "utf8", function(err, data) {
            // outer: res
            res.send(data);
        });
    });
    app.get("/webapp.js", function(req, res) {
        // outer: __dirname
        // outer: require
        require("fs").readFile(__dirname + "/../apps/images/webapp.js", "utf8", function(err, data) {
            // outer: res
            res.send(data);
        });
    });
    app.use("/", express["static"]("/home/rasmuserik/private/image/DCIM"));
    writeJSON = require("./util").throttledFn(function() {
        // outer: null
        // outer: imgs
        // outer: JSON
        // outer: fs
        fs.writeFile("/home/rasmuserik/solsort/imagelist.json", JSON.stringify(imgs, null, "  "));
    }, 5000);
    io.sockets.on("connection", function(socket) {
        // outer: writeJSON
        // outer: console
        // outer: Math
        // outer: imgs
        // outer: Object
        var imlist;
        //socket.emit("news", {hello : "world"});
        imlist = Object.keys(imgs).map(function(key) {
            // outer: imgs
            return imgs[key];
        });
        imlist = imlist.sort(function() {
            // outer: Math
            return Math.random() - .5;
        });
        socket.emit("hello", imlist);
        socket.on("rate", function(data) {
            // outer: writeJSON
            // outer: console
            // outer: imgs
            imgs[data.name] = data;
            console.log(data);
            writeJSON();
        });
        socket.on("my other event", function(data) {
            // outer: console
            console.log(data);
        });
    });
};
});solsort_define("build2",function(exports, require){exports.nodemain = function() {
    // outer: setTimeout
    // outer: false
    // outer: true
    var dest;
    // outer: console
    var watch;
    // outer: process
    var restartServer;
    var startServer;
    var killServer;
    // outer: undefined
    var server;
    var compileModuleObjects;
    var buildFiles;
    var recurseRequires;
    var findRequires;
    var findExports;
    var updateDest;
    var compileFns;
    var webapp;
    // outer: Array
    var platforms;
    var makeModuleObjects;
    var readModule;
    var mTime;
    // outer: Object
    var modules;
    var parseFile;
    var templatepath;
    var buildpath;
    // outer: __dirname
    var sourcepath;
    var child_process;
    var compiler;
    var async;
    var util;
    // outer: require
    var fs;
    // # requirements
    fs = require("fs");
    util = require("./util");
    async = require("async");
    compiler = require("./compiler");
    child_process = require("child_process");
    // # constants
    sourcepath = __dirname + "/../../lightscript/";
    buildpath = sourcepath + "../build/";
    templatepath = sourcepath + "../template/";
    // # functions
    parseFile = function(filename, done) {};
    modules = {};
    mTime = function(filename) {
        // outer: fs
        // outer: util
        return util.trycatch(function() {
            // outer: filename
            // outer: fs
            return fs.statSync(filename).mtime.getTime();
        }, function() {
            return 0;
        });
    };
    readModule = function(lsname, callback) {
        // outer: mTime
        // outer: compiler
        // outer: Object
        // outer: modules
        // outer: undefined
        // outer: console
        // outer: sourcepath
        // outer: fs
        fs.readFile(sourcepath + lsname, "utf8", function(err, source) {
            // outer: callback
            // outer: mTime
            // outer: compiler
            // outer: Object
            // outer: modules
            var module;
            var name;
            // outer: undefined
            // outer: lsname
            // outer: sourcepath
            // outer: console
            if(err) {
                console.log(err, "could not read \"" + sourcepath + lsname + "\"");
                return undefined;
            };
            name = lsname.slice(0, - 3);
            module = modules[name] || (modules[name] = {});
            module.filename = lsname;
            module.name = name;
            module.ast = compiler.parsels(source);
            module.timestamp = mTime(lsname);
            module.depends = module.depends || {};
            console.log("< " + name);
            callback();
        });
    };
    makeModuleObjects = function(callback) {
        // outer: readModule
        // outer: sourcepath
        // outer: fs
        // outer: async
        async.forEach(fs.readdirSync(sourcepath).filter(function(name) {
            return name.slice(- 3) === ".ls";
        }), readModule, callback);
    };
    platforms = [
        "lightscript",
        "nodejs",
        "webjs",
    ];
    webapp = function(opts, kind) {
        // outer: modules
        // outer: fs
        // outer: Object
        // outer: Array
        // outer: async
        // outer: templatepath
        // outer: recurseRequires
        // outer: util
        var apppath;
        // outer: console
        console.log("> " + "apps/" + opts.module.name);
        apppath = "/usr/share/nginx/www/solsort/apps/" + opts.module.name;
        util.mkdir(apppath);
        opts.dest.requires = recurseRequires(opts.dest.requires, "webjs");
        util.cp(templatepath + kind + ".html", apppath + "/index.html", function() {
            // outer: apppath
            // outer: kind
            // outer: modules
            // outer: fs
            // outer: Object
            // outer: opts
            // outer: Array
            // outer: async
            var canvasapp;
            canvasapp = "(function(){var modules={};";
            canvasapp += "var require=function(name){name=name.slice(2);";
            canvasapp += "var t=modules[name];if(typeof t===\"function\"){";
            canvasapp += "t(modules[name]={},require);return modules[name];}return t;};";
            canvasapp += "var define=function(name,fn){modules[name]=fn};";
            async.forEach([opts.module.name].concat(Object.keys(opts.dest.requires)), function(name, callback) {
                // outer: canvasapp
                // outer: modules
                // outer: fs
                fs.readFile(modules[name].webjs.filename, "utf8", function(err, data) {
                    // outer: callback
                    // outer: canvasapp
                    if(err) {
                        throw err;
                    };
                    canvasapp += data;
                    callback();
                });
            }, function() {
                // outer: apppath
                // outer: fs
                // outer: opts
                // outer: kind
                // outer: canvasapp
                canvasapp += "require(\"./" + kind + "\").run(\"" + opts.module.name + "\");";
                canvasapp += "})();";
                fs.writeFile(apppath + "/" + kind + ".js", canvasapp, opts.callback);
            });
        });
    };
    compileFns = {
        webjs : function(opts) {
            // outer: webapp
            // outer: dest
            // outer: fs
            // outer: compiler
            var result;
            result = "define(\"";
            result += opts.module.name;
            result += "\",function(exports, require){\n";
            result += compiler.ppjs(opts.ast);
            result += "});";
            fs.writeFile(dest.filename, result, function() {
                // outer: webapp
                // outer: opts
                if(opts.dest.requires.canvasapp) {
                    webapp(opts, "canvasapp");
                } else if(opts.dest.requires.webapp) {
                    webapp(opts, "webapp");
                } else  {
                    opts.callback();
                };
            });
        },
        nodejs : function(opts) {
            // outer: restartServer
            // outer: compiler
            // outer: dest
            // outer: fs
            fs.writeFile(dest.filename, compiler.ppjs(opts.ast), function() {
                // outer: restartServer
                // outer: dest
                // outer: opts
                if(opts.module.name === "api" || dest.exports.apimain) {
                    restartServer(opts.callback);
                } else  {
                    opts.callback();
                };
            });
        },
        lightscript : function(opts) {
            // outer: dest
            // outer: fs
            // outer: true
            // outer: Object
            // outer: compiler
            var ast;
            ast = compiler.applyMacros({
                ast : opts.ast,
                name : opts.module.name,
                platform : "lightscript",
                reverse : true,
            });
            fs.writeFile(dest.filename, compiler.ppls(ast), opts.callback);
        },
    };
    updateDest = function(name, platform) {
        // outer: mTime
        // outer: util
        // outer: buildpath
        // outer: Object
        // outer: modules
        // outer: dest
        dest = modules[name][platform];
        if(!dest) {
            modules[name][platform] = dest = {};
            dest.type = platform.slice(- 2) === "js" ? "js" : "ls";
            dest.filename = buildpath + platform + "/" + name + "." + dest.type;
            util.mkdir(buildpath + platform);
            dest.lastModified = mTime(dest.filename);
        };
        return dest;
    };
    findExports = function(ast) {
        // outer: true
        var doIt;
        // outer: Object
        var acc;
        acc = {};
        doIt = function(ast) {
            // outer: doIt
            // outer: true
            // outer: acc
            if(ast.isa("call:.=") && ast.children[0].isa("id:exports")) {
                acc[ast.children[1].val] = true;
            };
            ast.children.forEach(doIt);
        };
        doIt(ast);
        return acc;
    };
    findRequires = function(ast) {
        // outer: true
        var doIt;
        // outer: Object
        var acc;
        acc = {};
        doIt = function(ast) {
            // outer: doIt
            // outer: true
            // outer: acc
            if(ast.isa("call:*()") && ast.children[0].isa("id:require")) {
                if(ast.children[1].kind === "str" && ast.children[1].val.slice(0, 2) === "./") {
                    acc[ast.children[1].val.slice(2)] = true;
                };
            };
            ast.children.forEach(doIt);
        };
        doIt(ast);
        return acc;
    };
    recurseRequires = function(reqs, platform) {
        // outer: true
        // outer: modules
        // outer: Object
        var count;
        count = 0;
        while(count !== Object.keys(reqs).length) {
            count = Object.keys(reqs).length;
            Object.keys(reqs).forEach(function(name) {
                // outer: true
                // outer: reqs
                // outer: Object
                // outer: platform
                // outer: modules
                if(modules[name] && modules[name][platform] && modules[name][platform].requires) {
                    Object.keys(modules[name][platform].requires).forEach(function(dep) {
                        // outer: true
                        // outer: reqs
                        reqs[dep] = true;
                    });
                };
            });
        };
        return reqs;
    };
    buildFiles = function(name, callback) {
        // outer: buildFiles
        // outer: true
        // outer: compileFns
        // outer: console
        // outer: findRequires
        // outer: recurseRequires
        // outer: findExports
        // outer: updateDest
        // outer: modules
        // outer: Object
        // outer: compiler
        // outer: platforms
        // outer: async
        async.forEach(platforms, function(platform, callback) {
            // outer: true
            // outer: compileFns
            // outer: console
            // outer: findRequires
            // outer: recurseRequires
            // outer: findExports
            // outer: updateDest
            var dest;
            // outer: name
            // outer: modules
            // outer: Object
            // outer: compiler
            var ast;
            ast = compiler.applyMacros({
                ast : modules[name].ast,
                name : name,
                platform : platform,
            });
            dest = updateDest(name, platform);
            dest.exports = findExports(ast);
            dest.requires = recurseRequires(findRequires(ast), platform);
            Object.keys(dest.requires).forEach(function(reqname) {
                // outer: true
                // outer: name
                // outer: modules
                modules[reqname].depends[name] = true;
            });
            console.log("> " + platform + "/" + name);
            compileFns[platform]({
                module : modules[name],
                ast : ast,
                dest : dest,
                callback : callback,
            });
        }, function() {
            // outer: buildFiles
            // outer: Object
            // outer: async
            // outer: callback
            // outer: true
            // outer: name
            // outer: modules
            if(!modules[name].haveRun) {
                modules[name].haveRun = true;
                callback();
            } else  {
                async.forEach(Object.keys(modules[name].depends), buildFiles, callback);
            };
        });
    };
    compileModuleObjects = function(callback) {
        // outer: buildFiles
        // outer: modules
        // outer: Object
        // outer: async
        async.forEach(Object.keys(modules), buildFiles, callback);
    };
    server = undefined;
    killServer = function(callback) {
        // outer: true
        // outer: setTimeout
        // outer: false
        var killed;
        // outer: undefined
        // outer: server
        if(!server) {
            callback();
            return undefined;
        };
        killed = false;
        server.on("exit", function() {
            // outer: callback
            // outer: undefined
            // outer: server
            // outer: true
            // outer: killed
            killed = true;
            server = undefined;
            callback();
        });
        server.kill();
        setTimeout(function() {
            // outer: server
            // outer: killed
            if(!killed) {
                server.kill(9);
            };
        }, 3000);
    };
    startServer = function(callback) {
        // outer: buildpath
        // outer: child_process
        // outer: server
        var js;
        // outer: modules
        // outer: Object
        // outer: Array
        var apimodules;
        apimodules = [];
        Object.keys(modules).forEach(function(name) {
            // outer: apimodules
            // outer: modules
            if(modules[name].nodejs.exports.apimain) {
                apimodules.push(name);
            };
        });
        js = "require('./api').nodemain();";
        js += apimodules.map(function(name) {
            return "require('./" + name + "').apimain();";
        }).join("");
        server = child_process.spawn("node", ["-e", js], {cwd : buildpath + "nodejs", stdio : "inherit"});
        callback();
    };
    restartServer = function(callback) {
        // outer: startServer
        // outer: killServer
        killServer(function() {
            // outer: callback
            // outer: startServer
            startServer(callback);
        });
    };
    process.on("exit", killServer);
    watch = function(callback) {
        // outer: buildFiles
        // outer: readModule
        // outer: setTimeout
        // outer: fs
        // outer: sourcepath
        // outer: modules
        // outer: Object
        Object.keys(modules).forEach(function(name) {
            // outer: buildFiles
            // outer: readModule
            // outer: setTimeout
            // outer: fs
            // outer: modules
            // outer: sourcepath
            var filename;
            var watchFn;
            watchFn = function() {
                // outer: buildFiles
                // outer: watchFn
                // outer: filename
                // outer: fs
                // outer: readModule
                // outer: setTimeout
                // outer: name
                // outer: modules
                modules[name].watcher.close();
                setTimeout(function() {
                    // outer: buildFiles
                    // outer: watchFn
                    // outer: filename
                    // outer: fs
                    // outer: name
                    // outer: modules
                    // outer: readModule
                    readModule(modules[name].filename, function() {
                        // outer: buildFiles
                        // outer: watchFn
                        // outer: filename
                        // outer: fs
                        // outer: name
                        // outer: modules
                        modules[name].watcher = fs.watch(filename, watchFn);
                        buildFiles(name, function() {});
                    });
                }, 100);
            };
            filename = sourcepath + modules[name].filename;
            modules[name].watcher = fs.watch(filename, watchFn);
        });
    };
    // # main
    async.series([
        makeModuleObjects,
        compileModuleObjects,
        function(callback) {
            // outer: console
            console.log("initial build done");
            callback();
        },
        restartServer,
        watch,
        function() {},
    ]);
};
});solsort_define("webapp",function(exports, require){exports.run = function(name) {
    // outer: require
    require("./" + name).webmain();
};
});solsort_define("publish",function(exports, require){exports.nodemain = function() {
    // outer: undefined
    // outer: file
    // outer: process
    // outer: true
    // outer: RegExp
    // outer: Array
    var savehtml;
    var replacer;
    var includeFiles;
    // outer: Object
    var sitemaps;
    var rstat;
    var util;
    // outer: require
    var fs;
    // outer: console
    var src;
    var dst;
    dst = "/usr/share/nginx/www/";
    src = "/home/rasmuserik/solsort/sites/";
    console.log("copying sites to " + dst);
    fs = require("fs");
    util = require("./util");
    rstat = function(root) {
        // outer: true
        // outer: RegExp
        // outer: Object
        // outer: fs
        var recurse;
        // outer: Array
        var acc;
        acc = acc || [];
        recurse = function(path) {
            // outer: acc
            // outer: true
            // outer: RegExp
            // outer: root
            // outer: Object
            var fobj;
            // outer: recurse
            // outer: fs
            var stat;
            stat = fs.lstatSync(path);
            if(stat.isDirectory()) {
                fs.readdirSync(path).map(function(name) {
                    // outer: path
                    return path + "/" + name;
                }).forEach(recurse);
            } else  {
                fobj = {name : path.replace(root, "")};
                fobj.type = path.replace(RegExp("^[^.]*\\."), "");
                if(stat.isSymbolicLink()) {
                    fobj.symlink = true;
                };
                acc.push(fobj);
            };
        };
        recurse(root);
        return acc;
    };
    sitemaps = {};
    includeFiles = {};
    replacer = function(str, obj) {
        // outer: RegExp
        return str.replace(RegExp("\\{\\{([^{}]*)\\}\\}", "g"), function(_, s) {
            // outer: obj
            s = s.split(" ");
            if(obj[s[0]]) {
                return obj[s[0]];
            };
        });
    };
    savehtml = function(filename, html, replace) {
        // outer: fs
        // outer: dst
        // outer: sitemaps
        var sitemap;
        var path;
        var site;
        // outer: replacer
        // outer: RegExp
        // outer: Object
        replace = replace || {};
        html.replace(RegExp("<title>([\\s\\S]*)</title>"), function(_, title) {
            // outer: replace
            replace.title = replace.title || title;
        });
        html = replacer(html, replace);
        site = filename.split("/")[1];
        path = filename.split("/").slice(2).join("/");
        sitemap = sitemaps[site] = sitemaps[site] || {};
        sitemap[path] = {};
        sitemap[path].title = replace.title;
        //console.log(sitemaps);
        filename = dst + filename;
        fs.writeFile(filename, html.replace(RegExp("=\"http(s?):/(/[^\"]*\")", "g"), function(_, s, url) {
            return "=\"/redirect" + (s && "/s") + url;
        }));
    };
    (function() {
        // outer: RegExp
        // outer: Object
        // outer: undefined
        // outer: savehtml
        // outer: fs
        // outer: src
        // outer: Array
        // outer: file
        // outer: console
        // outer: require
        // outer: dst
        // outer: util
        // outer: process
        // outer: rstat
        var files;
        files = rstat(process.env.HOME + "/solsort/sites");
        util.mkdir(dst + "/common/js/");
        util.cp("./build/webjs/solsort.js", dst + "/common/js/solsort.js", function(err) {
            // outer: file
            // outer: console
            if(err) {
                console.log("Error:", err, file);
            };
        });
        files.map(function(file) {
            // outer: console
            // outer: RegExp
            // outer: Object
            // outer: undefined
            // outer: savehtml
            // outer: fs
            // outer: src
            // outer: Array
            // outer: require
            // outer: dst
            // outer: util
            util.mkdir(dst + file.name.split("/").slice(0, - 1).join("/"));
            if(file.symlink) {
                require("child_process").spawn("cp", [
                    "-a",
                    src + file.name,
                    dst + file.name,
                ]);
            } else  {
                if(file.type === "html") {
                    fs.readFile(src + file.name, "utf8", function(err, html) {
                        // outer: file
                        // outer: savehtml
                        savehtml(file.name, html);
                    });
                } else if(file.type === "md") {
                    fs.readFile(src + file.name, "utf8", function(err, markdown) {
                        // outer: savehtml
                        // outer: console
                        // outer: fs
                        // outer: src
                        var templatename;
                        // outer: require
                        // outer: RegExp
                        // outer: Object
                        var doc;
                        // outer: undefined
                        // outer: file
                        if(file.name.split("/").slice(- 1)[0] === "README.md") {
                            return undefined;
                        };
                        doc = {title : file.name.split("/").slice(- 1)[0].slice(0, - 3)};
                        markdown = markdown.split("\n");
                        if(markdown[0][0] === "%") {
                            doc.title = markdown[0].slice(1).trim();
                            markdown.shift();
                            if(markdown[0][0] === "%") {
                                doc.author = markdown[0].slice(1).trim();
                                markdown.shift();
                                if(markdown[0][0] === "%") {
                                    doc.date = markdown[0].slice(1).trim();
                                    markdown.shift();
                                };
                            };
                        };
                        markdown = markdown.join("\n").replace(RegExp("<!--.*?-->", "g"), "");
                        doc.content = require("markdown").markdown.toHTML(markdown);
                        templatename = src + file.name.split("/").slice(0, - 1).join("/") + "/markdown.template.html";
                        fs.readFile(templatename, "utf8", function(err, html) {
                            // outer: doc
                            // outer: savehtml
                            // outer: templatename
                            // outer: file
                            // outer: console
                            if(err) {
                                console.log(file.name);
                                return console.log("could not access:", templatename);
                            };
                            savehtml(file.name.slice(0, - 2) + "html", html, doc);
                        });
                    });
                } else  {
                    util.cp(src + file.name, dst + file.name, function(err) {
                        //console.log('Error:', err, file);
                    });
                };
            };
        });
        require("child_process").exec("cp -a ~/lightscript/build/apps/* /usr/share/nginx/www/solsort/apps/");
        require("child_process").exec("cp -a ~/solsort/sites/* /usr/share/nginx/www/", function(err, stdout, stderr) {
            // outer: console
            console.log("done");
            if(err) {
                console.log("Error:", err);
            };
        });
    })();
};
});solsort_define("main",function(exports, require){util = require("./util");
use = function(name) {
    // outer: require
    return require("./" + name);
};
util.nextTick(function() {
    // outer: undefined
    // outer: use
    // outer: arguments
    // outer: this
    // outer: require
    // outer: window
    var platform;
    // outer: process
    var commandName;
    // outer: Array
    var args;
    args = [];
    if(undefined) {};
    if(true) {
        commandName = window.location.hash.slice(1);
        platform = "web";
    };
    if(undefined) {};
    if(use(commandName) && use(commandName)[platform + "main"]) {
        use(commandName)[platform + "main"].apply(undefined, args);
    } else if(use(commandName) && use(commandName).main) {
        use(commandName)["main"].apply(undefined, args);
    } else if(use(platform) && use(platform).main) {
        use(platform).main.apply(undefined, args);
    };
});
});solsort_define("canvasapp",function(exports, require){exports.run = function(name) {
    // outer: Object
    // outer: require
    // outer: document
    var canvas;
    canvas = document.getElementById("canvas");
    require("./" + name).init({canvas : canvas});
};
});solsort_define("api",function(exports, require){cookieRegExp = RegExp(".*(^|[ ;,])c=([a-zA-Z0-9+/]*).*");
cookieId = function(cookie) {
    // outer: cookieRegExp
    return cookie.replace(cookieRegExp, function(_, _, id) {
        return id;
    });
};
cookieIdStr = function(id) {
    var cookiestr;
    // outer: Date
    var expires;
    expires = new Date(Date.now() + 360 * 24 * 60 * 60 * 1000);
    cookiestr = "c=" + id + "; Expires=" + expires.toUTCString() + ";";
};
if(undefined) {};
// # client
if(undefined) {} else if(true) {
    exports.clientid = window.solsortapi_clientid;
    if(!exports.clientid) {
        exports.clientid = cookieId(document.cookie);
    } else  {
        document.cookie = cookieIdStr(exports.clientid);
    };
    if(location.hostname.slice(- 9) === "localhost") {
        exports.socket = window.io.connect("http://localhost:8888");
    } else  {
        exports.socket = window.io.connect("http://api.solsort.com");
    };
    exports.socket.on("solsortapi_clientid", function(id) {
        // outer: cookieIdStr
        // outer: document
        // outer: exports
        exports.clientid = id;
        document.cookie = cookieIdStr(id);
    });
};
});solsort_define("jsonml",function(exports, require){// # JsonML
//
// Various functions for handling
// jsonml in array form.
// For more info on jsonml,
// see [jsonml.org](http://jsonml.org/)
// or [wikipedia](http://en.wikipedia.org/wiki/JsonML)
//
// Implemented to be as portable as possible.
// Not depending on any libraries, and also
// avoid regular expressions to be possible to
// run on javascript-subsets on j2me devices.
//
// ## XML parser
//
// Parse an XML-string.
// Actually this is not a full implementation, but just
// the basic parts to get it up running.
// Nonetheless it is Good Enough(tm) for most uses.
//
// Known deficiencies: CDATA is not supported, will accept even
// non-well-formed documents, <?... > <!... > are not really handled, ...
exports.fromXml = function(xml) {
    // outer: entities
    // outer: parseInt
    // outer: String
    // outer: undefined
    // outer: isArray
    var parent_tag;
    var value_terminator;
    var attr;
    var has_attributes;
    // outer: Object
    var attributes;
    var newtag;
    var read_until;
    var is_a;
    var next_char;
    var tag;
    // outer: Array
    var stack;
    var pos;
    var c;
    var whitespace;
    // outer: JsonML_Error
    if(typeof xml !== "string") {
        JsonML_Error("Error: jsonml.parseXML didn't receive a string as parameter");
    };
    // white space definition
    whitespace = " \n\r\t";
    // the current char in the string that is being parsed
    c = xml[0];
    // the position in the string
    pos = 0;
    // stack for handling nested tags
    stack = [];
    // current tag being parsed
    tag = [];
    // read the next char from the string
    next_char = function() {
        // outer: undefined
        // outer: xml
        // outer: pos
        // outer: c
        c = ++pos < xml.length ? xml[pos] : undefined;
    };
    // check if the current char is one of those in the string parameter
    is_a = function(str) {
        // outer: c
        return str.indexOf(c) !== - 1;
    };
    // return the string from the current position to right before the first
    // occurence of any of symb. Translate escaped xml entities to their value
    // on the fly.
    read_until = function(symb) {
        // outer: JsonML_Error
        // outer: entities
        // outer: parseInt
        // outer: String
        // outer: read_until
        var entity;
        // outer: next_char
        // outer: is_a
        // outer: c
        // outer: Array
        var buffer;
        buffer = [];
        while(c && !is_a(symb)) {
            if(c === "&") {
                next_char();
                entity = read_until(";");
                if(entity[0] === "#") {
                    if(entity[1] === "x") {
                        c = String.fromCharCode(parseInt(entity.slice(2), 16));
                    } else  {
                        c = String.fromCharCode(parseInt(entity.slice(1), 10));
                    };
                } else  {
                    c = entities[entity];
                    if(!c) {
                        JsonML_Error("error: unrecognisable xml entity: " + entity);
                    };
                };
            };
            buffer.push(c);
            next_char();
        };
        return buffer.join("");
    };
    // The actual parsing
    while(is_a(whitespace)) {
        next_char();
    };
    while(c) {
        if(is_a("<")) {
            next_char();
            // `<?xml ... >`, `<!-- -->` or similar - skip these
            if(is_a("?!")) {
                if(xml.slice(pos, pos + 3) === "!--") {
                    pos += 3;
                    while(xml.slice(pos, pos + 2) !== "--") {
                        ++pos;
                    };
                };
                read_until(">");
                next_char();
                // `<sometag ...>` - handle begin tag
            } else if(!is_a("/")) {
                // read tag name
                newtag = [read_until(whitespace + ">/")];
                // read attributes
                attributes = {};
                has_attributes = 0;
                while(c && is_a(whitespace)) {
                    next_char();
                };
                while(c && !is_a(">/")) {
                    has_attributes = 1;
                    attr = read_until(whitespace + "=>");
                    if(c === "=") {
                        next_char();
                        value_terminator = whitespace + ">/";
                        if(is_a("\"'")) {
                            value_terminator = c;
                            next_char();
                        };
                        attributes[attr] = read_until(value_terminator);
                        if(is_a("\"'")) {
                            next_char();
                        };
                    } else  {
                        JsonML_Error("something not attribute in tag");
                    };
                    while(c && is_a(whitespace)) {
                        next_char();
                    };
                };
                if(has_attributes) {
                    newtag.push(attributes);
                };
                // end of tag, is it `<.../>` or `<...>`
                if(is_a("/")) {
                    next_char();
                    if(!is_a(">")) {
                        JsonML_Error("expected \">\" after \"/\" within tag");
                    };
                    tag.push(newtag);
                } else  {
                    stack.push(tag);
                    tag = newtag;
                };
                next_char();
                // `</something>` - handle end tag
            } else  {
                next_char();
                if(read_until(">") !== tag[0]) {
                    JsonML_Error("end tag not matching: " + tag[0]);
                };
                next_char();
                parent_tag = stack.pop();
                if(tag.length <= 2 && !isArray(tag[1]) && typeof tag[1] !== "string") {
                    tag.push("");
                };
                parent_tag.push(tag);
                tag = parent_tag;
            };
            // actual content / data between tags
        } else  {
            tag.push(read_until("<"));
        };
    };
    return tag;
};
// ## XML generation
// Convert jsonml in array form to xml.
exports.toXml = function(jsonml) {
    // outer: toXmlAcc
    // outer: Array
    var acc;
    acc = [];
    toXmlAcc(jsonml, acc);
    return acc.join("");
};
/*

// The actual implementation. As the XML-string is built by appending to the
// `acc`umulator.
*/
toXmlAcc = function(jsonml, acc) {
    // outer: String
    // outer: xmlEscape
    // outer: toXmlAcc
    // outer: Object
    var attributes;
    var pos;
    // outer: isArray
    if(isArray(jsonml)) {
        acc.push("<");
        acc.push(jsonml[0]);
        pos = 1;
        attributes = jsonml[1];
        if(attributes && !isArray(attributes) && typeof attributes !== "string") {
            Object.keys(attributes).forEach(function(key) {
                // outer: attributes
                // outer: xmlEscape
                // outer: acc
                acc.push(" ");
                acc.push(key);
                acc.push("=\"");
                xmlEscape(attributes[key], acc);
                acc.push("\"");
            });
            ++pos;
        };
        if(pos < jsonml.length) {
            acc.push(">");
            while(pos < jsonml.length) {
                toXmlAcc(jsonml[pos], acc);
                ++pos;
            };
            acc.push("</");
            acc.push(jsonml[0]);
            acc.push(">");
        } else  {
            acc.push(" />");
        };
    } else  {
        xmlEscape(String(jsonml), acc);
    };
};
// XML escaped entity table
entities = {
    quot : "\"",
    amp : "&",
    apos : "'",
    lt : "<",
    gt : ">",
};
// Generate a reverse xml entity table.
reventities = (function() {
    // outer: entities
    // outer: Object
    var result;
    result = {};
    Object.keys(entities).forEach(function(key) {
        // outer: entities
        // outer: result
        result[entities[key]] = key;
    });
    return result;
})();
// Append the characters of `str`, or the xml-entity they map to, to the `acc`umulator array.
xmlEscape = function(str, acc) {
    // outer: reventities
    var s;
    var code;
    var c;
    var i;
    i = 0;
    while(i < str.length) {
        c = str[i];
        code = c.charCodeAt(0);
        s = reventities[c];
        if(s) {
            acc.push("&" + s + ";");
        } else if(code >= 128) {
            //code < 32 ||
            acc.push("&#" + code + ";");
        } else  {
            acc.push(c);
        };
        ++i;
    };
};
// ## Utility functions
// Apply a function to all the child elements of a given jsonml array.
childReduce = exports.childReduce = function(jsonml, fn, acc) {
    var pos;
    // outer: isArray
    var first;
    first = jsonml[1];
    if(typeof first !== "object" || isArray(first)) {
        acc = fn(acc, first);
    };
    pos = 2;
    while(pos < jsonml.length) {
        acc = fn(acc, jsonml[pos]);
        ++pos;
    };
    return acc;
};
// - `jsonml.ensureAttributeObject(jsonml_array)` changes an jsonml array such that it has a (possibly empty) attribute object at position 1
exports.ensureAttributeObject = function(jsonml) {
    // outer: Object
    // outer: Array
    if(typeof jsonml[1] !== "object" || jsonml[1].constructor === Array) {
        jsonml.unshift(jsonml[0]);
        jsonml[1] = {};
    };
};
exports.getAttr = function(jsonml, attribute) {
    // outer: undefined
    // outer: Array
    if(typeof jsonml[1] !== "object" || jsonml[1].constructor === Array) {
        return undefined;
    } else  {
        return jsonml[1][attribute];
    };
};
// Convert jsonml into an easier subscriptable json structure, not preserving
// the order of the elements
exports.toObject = function(jsonml) {
    // outer: toObjectInner
    // outer: Object
    var result;
    result = {};
    result[jsonml[0]] = toObjectInner(jsonml);
    return result;
};
// Internal function called by toObject. Return an object corresponding to
// the child nodes of the `jsonml`-parameter
toObjectInner = function(jsonml) {
    // outer: toObjectInner
    // outer: addprop
    var current;
    // outer: isArray
    var pos;
    var attr;
    // outer: Object
    var result;
    result = {};
    attr = jsonml[1];
    pos;
    if(typeof attr === "object" && !isArray(attr)) {
        Object.keys(attr).forEach(function(key) {
            // outer: attr
            // outer: result
            result["@" + key] = attr[key];
        });
        pos = 2;
    } else  {
        pos = 1;
        if(jsonml.length === 2 && !isArray(attr)) {
            return attr;
        };
    };
    while(pos < jsonml.length) {
        current = jsonml[pos];
        if(isArray(current)) {
            addprop(result, current[0], toObjectInner(current));
        } else  {
            addprop(result, "_", current);
        };
        ++pos;
    };
    return result;
};
// Add a property to the object. If the property is already there, append
// the `val`ue to an array at the key instead, possibly putting existing
// object in front of such array, if that is not an array yet.
addprop = function(obj, key, val) {
    // outer: Array
    // outer: isArray
    if(obj[key]) {
        if(isArray(obj[key])) {
            obj[key].push(val);
        } else  {
            obj[key] = [obj[key], val];
        };
    } else  {
        obj[key] = val;
    };
};
// Error handler
JsonML_Error = function(desc) {
    throw desc;
};
// Array check, implemented here to avoid depending on any library
isArray = function(a) {
    // outer: Array
    // outer: null
    return a !== null && typeof a === "object" && a.constructor === Array;
};
});solsort_define("module",function(exports, require){exports.list = function() {
    // outer: window
    // outer: Object
    // outer: __dirname
    // outer: require
    if(undefined) {};
    if(true) {
        return Object.keys(window.modules);
    };
};
});solsort_define("web",function(exports, require){// web {{{1
exports.main = function() {
    // outer: arguments
    // outer: Array
    // outer: JSON
    // outer: alert
    // outer: String
    // outer: window
    // outer: Date
    // outer: Math
    // outer: setTimeout
    // outer: true
    // outer: ;
    // outer: false
    // outer: document
    // outer: RegExp
    // outer: location
    var access_token;
    // outer: localStorage
    var loggingIn;
    var loginAs;
    var loginUI;
    // outer: Object
    var stores;
    // outer: exports
    var solsort;
    // outer: console
    console.log("here");
    // TODO: remove the following line
    solsort = exports;
    // # Utility functions {{{1
    // ## load an external .js file {{{2
    // TODO: callback parameter (+onreadychange etc.)
    exports.loadJS = function(url) {
        // outer: document
        var scriptElem;
        scriptElem = document.createElement("script");
        scriptElem.src = url;
        document.body.appendChild(scriptElem);
    };
    // ## identity function {{{2
    exports.id = function(a) {
        return a;
    };
    // ## Throttle a function {{{2
    exports.throttledFn = function(fn, delay) {
        // outer: Date
        // outer: Math
        // outer: setTimeout
        // outer: true
        // outer: ;
        // outer: false
        var scheduled;
        var lastRun;
        lastRun = 0;
        scheduled = false;
        return function(callback) {
            // outer: fn
            // outer: false
            // outer: lastRun
            // outer: Date
            // outer: delay
            // outer: Math
            // outer: setTimeout
            // outer: true
            var run;
            // outer: ;
            // outer: scheduled
            if(scheduled) {
                return ;
            };
            run = function() {
                // outer: fn
                // outer: Date
                // outer: lastRun
                // outer: false
                // outer: scheduled
                scheduled = false;
                lastRun = Date.now();
                fn();
            };
            scheduled = true;
            setTimeout(run, Math.max(0, delay - (Date.now() - lastRun)));
        };
    };
    // ## extract url parameters {{{2
    exports.getVars = function() {
        // outer: window
        // outer: Object
        var result;
        // TODO: unencode urlencoding
        result = {};
        window.location.search.slice(1).split("&").forEach(function(s) {
            // outer: result
            var t;
            t = s.split("=");
            result[t[0]] = t[1];
        });
        return result;
    };
    // ## jsonp {{{2
    exports.jsonp = function(uri, args, callback, callbackName) {
        // outer: Object
        // outer: exports
        // outer: window
        // TODO: urlencode args
        // TODO: make reentrant
        // TODO: add timeout with error
        if(callback) {
            callbackName = callbackName || "callback";
            args[callbackName] = "solsortJSONP0";
            window.solsortJSONP0 = callback;
        };
        exports.loadJS(uri + "?" + Object.keys(args).map(function(key) {
            // outer: args
            return key + "=" + args[key];
        }).join("&"));
    };
    exports.error = function(err) {
        // outer: alert
        // outer: String
        // outer: Object
        // outer: exports
        exports.jsonp("http://solsort.com/clientError", {error : String(err)});
        alert("Error on solsort.com: \n" + err + "\nSorry, not quite bug free, if you are online, then the error has been reported...");
        throw err;
    };
    // # Storage  {{{1
    stores = {};
    exports.Storage = function(storageName, mergeFunction) {
        // outer: ;
        // outer: Object
        var get;
        var set;
        var throttledSync;
        // outer: exports
        var sync5s;
        var sync;
        // outer: Array
        var syncCallbacks;
        var storage;
        // outer: JSON
        // outer: localStorage
        var data;
        // outer: stores
        if(stores[storageName]) {
            return stores[storageName];
        };
        // ## Private data {{{2
        data = localStorage.getItem(storageName) || "{}";
        data = JSON.parse(storage.store);
        syncCallbacks = [];
        // ## Synchronise with localStorage and server {{{2
        sync = function() {
            // outer: syncCallbacks
            // outer: ;
            var user;
            // outer: data
            // outer: JSON
            // outer: storageName
            // outer: localStorage
            var execSyncCallbacks;
            execSyncCallbacks = function() {
                // outer: syncCallbacks
                while(syncCallbacks.length) {
                    syncCallbacks.pop()();
                };
            };
            localStorage.setItem(storageName, JSON.stringify(data));
            user = localStorage.getItem("userId");
            if(!user) {
                execSyncCallbacks();
                return ;
            };
            // TODO: implement server-side sync
            execSyncCallbacks();
        };
        // ## Throttled version of synchronisation function {{{2
        sync5s = exports.throttledFn(sync, 5000);
        throttledSync = function(callback) {
            // outer: sync5s
            // outer: syncCallbacks
            if(callback) {
                syncCallbacks.push(callback);
            };
            sync5s();
        };
        // ## setters/getters {{{2
        set = function(key, val) {
            // outer: throttledSync
            // outer: JSON
            // outer: data
            data[key] = JSON.stringify(val);
            throttledSync();
        };
        get = function(key) {
            // outer: data
            // outer: JSON
            return JSON.parse(data[key]);
        };
        // ## Create and return+cache store object {{{2
        storage = {
            sync : throttledSync,
            set : set,
            get : get,
        };
        stores[storageName] = storage;
        return storage;
    };
    // # Login system {{{1
    // ## Update user interface: add loginbuttons to `#solsortLogin` {{{2
    loginUI = function() {
        // outer: Object
        var userName;
        // outer: localStorage
        var userId;
        // outer: document
        var solsortLogin;
        solsortLogin = document.getElementById("solsortLogin");
        if(solsortLogin) {
            userId = localStorage.getItem("userId");
            userName = localStorage.getItem("userName");
            if(!userId) {
                solsortLogin.innerHTML = "<ul class=\"nav\"><li class=\"dropdown\">" + "<a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">Login<b class=\"caret\"></b></a>" + "<ul class=\"dropdown-menu\">" + "<li><a href=\"javascript:use('web').loginGitHub()\"><span class=\"icon-github\"></span> github</a></li>" + "<li><a href=\"#\" onclick=\"use('web').loginFacebook()\"><span class=\"icon-facebook-sign\"></span> facebook</a></li>" + "<li><a href=\"#\" onclick=\"use('web').loginGoogle()\"><span class=\"icon-google-plus-sign\"></span> google</a></li>" + "</ul></li></ul>";
            } else  {
                solsortLogin.innerHTML = "<ul class=\"nav\"><li><a onclick=\"use('web').logout();\">" + userName + "<span class=\"icon-" + ({
                    github : "github",
                    facebook : "facebook-sign",
                    google : "google-plus-sign",
                })[userId.split(":")[0]] + " icon-large\"></span>" + "logout" + "</a></li></ul>";
            };
        };
    };
    // ## Logout {{{2
    exports.logout = function() {
        // outer: loginUI
        // outer: localStorage
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        loginUI();
    };
    // ## solsort.login {{{2
    exports.login = function() {
        // outer: localStorage
        var user;
        var callback;
        // outer: arguments
        var i;
        i = 0;
        while(i < arguments.length) {
            if(typeof arguments[i] === "function") {
                callback = arguments[i];
            };
            ++i;
        };
        user = localStorage.getItem("userId");
        if(user) {
            return callback(user);
        };
        throw "not implemented yet";
    };
    // ## Internal utility functions {{{2
    // ### Log in to facebook {{{2
    exports.loginFacebook = function() {
        // outer: window
        // outer: localStorage
        localStorage.setItem("logging in", "facebook");
        window.location = "https://www.facebook.com/dialog/oauth?client_id=201142456681777&redirect_uri=http://solsort.com/&scope=&response_type=token";
    };
    // ### Log in to github {{{3
    exports.loginGitHub = function() {
        // outer: window
        // outer: localStorage
        localStorage.setItem("logging in", "github");
        window.location = "https://github.com/login/oauth/authorize?client_id=cc14f7f75ff01bdbb1e7";
    };
    // ### Log in to google {{{3
    exports.loginGoogle = function() {
        // outer: window
        // outer: localStorage
        localStorage.setItem("logging in", "google");
        window.location = "https://accounts.google.com/o/oauth2/auth?scope=https://www.googleapis.com/auth/userinfo.profile&state=&redirect_uri=http://solsort.com/&response_type=token&client_id=500223099774.apps.googleusercontent.com";
    };
    // ### Utility for setting userid/username when logged in {{{3
    loginAs = function(user, name) {
        // outer: window
        var loginFromUrl;
        // outer: Object
        // outer: exports
        // outer: localStorage
        localStorage.setItem("userId", user);
        localStorage.setItem("userName", name);
        exports.jsonp("http://solsort.com/", {user : user, name : name});
        loginFromUrl = localStorage.getItem("loginFromUrl");
        if(loginFromUrl) {
            localStorage.removeItem("loginFromUrl");
            window.location = loginFromUrl;
        };
    };
    // ### Handle second part of login, if magic cookie {{{3
    loggingIn = localStorage.getItem("logging in");
    if(loggingIn) {
        localStorage.removeItem("logging in");
        if(loggingIn === "github") {
            exports.jsonp("http://solsort.com/githubLogin", exports.getVars(), function(access_token) {
                // outer: loginUI
                // outer: loginAs
                // outer: Object
                // outer: exports
                // outer: RegExp
                access_token = access_token.replace(RegExp(".*access_token="), "").replace(RegExp("&.*"), "");
                exports.jsonp("https://api.github.com/user", {access_token : access_token}, function(data) {
                    // outer: loginUI
                    // outer: loginAs
                    if(data.data.login) {
                        loginAs("github:" + data.data.login, data.data.name);
                        loginUI();
                    };
                });
            });
        };
        if(loggingIn === "facebook") {
            access_token = location.hash.replace(RegExp(".*access_token="), "").replace(RegExp("&.*"), "");
            exports.jsonp("https://graph.facebook.com/me", {access_token : access_token}, function(data) {
                // outer: loginUI
                // outer: loginAs
                if(data.id) {
                    loginAs("facebook:" + data.id, data.name);
                    loginUI();
                };
            });
        };
        if(loggingIn === "google") {
            access_token = location.hash.replace(RegExp(".*access_token="), "").replace(RegExp("&.*"), "");
            exports.jsonp("https://www.googleapis.com/oauth2/v1/userinfo", {access_token : access_token}, function(data) {
                // outer: loginUI
                // outer: loginAs
                if(data.id) {
                    loginAs("google:" + data.id, data.name);
                    loginUI();
                };
            });
        };
    };
    // # Various initialisation on page
    loginUI();
    //exports.loadJS("http://solsort.com/store.js");
};
});solsort_define("addon",function(exports, require){if(undefined) {};
if(true) {
    exports.main = function() {
        // outer: document
        // outer: alert
        alert(document.body.innerHTML);
        document.body.innerHTML += "<div style=\"position:fixed;top:0px;left:0px;width:44px;height:44px;z-index:100000;\">XXX</div>";
    };
};
// # nodejs runner
if(undefined) {};
});solsort_define("rest",function(exports, require){exports.api = {};
apis = {store : require("./storage").restapi};
util = require("./util");
Object.keys(apis).forEach(function(name) {
    // outer: Object
    // outer: util
    // outer: JSON
    // outer: true
    // outer: XMLHttpRequest
    // outer: console
    // outer: exports
    // create api functions
    if(true) {
        exports.api[name] = function(args, callback) {
            // outer: Object
            // outer: util
            // outer: JSON
            // outer: true
            // outer: XMLHttpRequest
            var xhr;
            // outer: name
            // outer: console
            console.log("rest:", name, args);
            xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                // outer: JSON
                // outer: Object
                // outer: util
                // outer: callback
                // outer: xhr
                if(xhr.readyState === 4) {
                    if(xhr.status === 200) {
                        callback(util.trycatch(function() {
                            // outer: xhr
                            // outer: JSON
                            return JSON.parse(xhr.responseText);
                        }, function() {
                            // outer: xhr
                            // outer: Object
                            return {err : "cannot parse: " + xhr.responseText};
                        }));
                    } else  {
                        callback({
                            err : "HTTP-status !== 200",
                            status : xhr.status,
                            statusText : xhr.statusText,
                            content : xhr.responseText,
                        });
                    };
                };
            };
            xhr.open("POST", "/api/" + name, true);
            xhr.send(JSON.stringify(args));
        };
    } else if(undefined) {};
});
RestObject = function(req, res, next) {
    // outer: Object
    var self;
    self = {};
    self.done = function(data) {
        // outer: res
        res.header("Content-Type", "application/json");
        res.send(data);
    };
    return self;
};
exports.nodemain = function() {
    // outer: String
    // outer: RestObject
    // outer: JSON
    // outer: util
    // outer: Array
    // outer: apis
    // outer: Object
    var solsortjs;
    // outer: __dirname
    var index;
    var server;
    // outer: require
    var express;
    // setup server
    express = require("express");
    server = express();
    // serve api-script and index from memory
    index = require("fs").readFileSync(__dirname + "/../webjs/index.html", "utf8");
    solsortjs = require("fs").readFileSync(__dirname + "/../webjs/solsort.js", "utf8");
    server.get("/api/solsort.js", function(req, res, next) {
        // outer: solsortjs
        res.end(solsortjs);
    });
    // setup apis
    Object.keys(apis).forEach(function(name) {
        // outer: String
        // outer: Object
        // outer: RestObject
        // outer: JSON
        // outer: util
        // outer: Array
        // outer: server
        // outer: apis
        var fn;
        fn = apis[name];
        // setup request handle
        server.post("/api/" + name, function(req, res, next) {
            // outer: String
            // outer: Object
            // outer: RestObject
            // outer: fn
            // outer: JSON
            // outer: util
            // outer: Array
            var data;
            data = [];
            req.setEncoding("utf8");
            req.addListener("data", function(chunk) {
                // outer: req
                // outer: data
                data.push(chunk);
                req.content += chunk;
            });
            req.addListener("end", function(chunk) {
                // outer: String
                // outer: Object
                // outer: next
                // outer: res
                // outer: req
                // outer: RestObject
                // outer: fn
                // outer: JSON
                // outer: util
                // outer: data
                data = data;
                util.trycatch(function() {
                    // outer: next
                    // outer: res
                    // outer: req
                    // outer: RestObject
                    // outer: fn
                    // outer: JSON
                    // outer: data
                    data = JSON.parse(data.join(""));
                    fn(data, RestObject(req, res, next));
                }, function(e) {
                    // outer: String
                    // outer: Object
                    // outer: JSON
                    // outer: res
                    res.send(JSON.stringify({err : "Server error: " + String(e)}));
                });
            });
        });
    });
    // start the server
    server.listen(8002);
};
});solsort_define("combigame",function(exports, require){(function() {
    // outer: parseInt
    // outer: item
    // outer: webutil
    // outer: _
    // outer: fullbrows
    // outer: localStorage
    // outer: JSON
    // outer: delete
    // outer: Date
    // outer: setTimeout
    // outer: false
    // outer: Math
    // outer: true
    // outer: $
    // outer: exports
    var menu;
    var startGame;
    var okDeck;
    var hint;
    var okSet;
    var rnd3;
    var randomCard;
    var testSelected;
    var partialScore;
    var showScore;
    var log;
    var curDate;
    var logData;
    var reshuffle;
    var click;
    var anim;
    var doLayout;
    var cardPositions;
    var unselectedStyle;
    var selectedStyle;
    var visibleStyle;
    var transitionStyle;
    var hidden;
    // outer: Array
    var cards;
    // outer: Object
    var selected;
    var giveup;
    // outer: undefined
    var prevtime;
    // ## Dependencies
    /*global localStorage: true*/
    //var webutil = require('webutil');
    //var fullbrows = require('fullbrows');
    //
    //
    // ## Game state
    prevtime = undefined;
    giveup = undefined;
    selected = {};
    cards = [];
    //
    // ## Styles
    hidden = {
        opacity : 0,
        width : 0,
        height : 0,
    };
    //
    transitionStyle = {
        transition : "opacity 1s",
        "-moz-transition" : "opacity 1s",
        "-webkit-transition" : "opacity 1s",
        "-o-transition" : "opacity 1s",
    };
    //
    visibleStyle = undefined;
    selectedStyle = undefined;
    unselectedStyle = undefined;
    cardPositions = undefined;
    // ## Layout
    doLayout = function() {
        // outer: cards
        // outer: anim
        // outer: unselectedStyle
        // outer: selectedStyle
        // outer: visibleStyle
        // outer: Object
        var i;
        // outer: false
        var leftPad;
        var topPad;
        // outer: Math
        var size;
        // outer: Array
        // outer: cardPositions
        // outer: true
        var landscape;
        var h;
        var w;
        // outer: $
        var $content;
        $content = $("#content");
        $content.css("background", "white");
        w = $content.width();
        h = $content.height();
        landscape = true;
        cardPositions = [];
        size = Math.min(Math.max(w, h) / 4, Math.min(w, h) / 3);
        //*0.85;
        if(w > h) {
            topPad = h - size * 3 >> 1;
            leftPad = w - size * 4 >> 1;
        } else  {
            topPad = h - size * 4 >> 1;
            leftPad = w - size * 3 >> 1;
            landscape = false;
        };
        topPad += 0;
        //0.05*size;
        leftPad += 0;
        //0.05*size;
        i = 0;
        while(i < 12) {
            if(landscape) {
                cardPositions.push({top : topPad + (0.5 + i % 3) * size, left : leftPad + (0.5 + (i / 3 | 0)) * size});
            } else  {
                cardPositions.push({left : leftPad + (0.5 + i % 3) * size, top : topPad + (0.5 + (i / 3 | 0)) * size});
            };
            ++i;
        };
        visibleStyle = {
            opacity : 1,
            "margin-top" : - size / 2,
            "margin-left" : - size / 2,
            background : "none",
            width : 0.9 * size,
            height : 0.9 * size,
        };
        selectedStyle = {
            "border-style" : "solid",
            "border-width" : 1,
            "margin-top" : - size / 2 - 1,
            "margin-left" : - size / 2 - 1,
            "border-radius" : size / 16,
            "border-color" : "gray",
        };
        unselectedStyle = {
            "margin-top" : - size / 2,
            "margin-left" : - size / 2,
            border : "none",
        };
        //
        $(".card").css({top : h, left : w});
        i = 0;
        while(i < 12) {
            anim(i, $("#card" + cards[i]))();
            ++i;
        };
    };
    // ### Animate that a card fades in
    anim = function(i, $card) {
        // outer: visibleStyle
        // outer: transitionStyle
        // outer: setTimeout
        // outer: cardPositions
        return function() {
            // outer: visibleStyle
            // outer: transitionStyle
            // outer: setTimeout
            // outer: i
            // outer: cardPositions
            // outer: $card
            $card.css(cardPositions[i]);
            setTimeout(function() {
                // outer: visibleStyle
                // outer: transitionStyle
                // outer: $card
                $card.css(transitionStyle).css(visibleStyle);
            }, 0);
        };
    };
    //
    // ## Handle clicking on cards
    click = (function() {
        // outer: testSelected
        // outer: true
        // outer: selectedStyle
        // outer: delete
        // outer: unselectedStyle
        // outer: $
        // outer: selected
        // outer: undefined
        // outer: Date
        var prevCard;
        var lastClickTime;
        // private variables, to make sure we only click once, even if the browser sends several events.
        lastClickTime = 0;
        prevCard = "";
        return function(card) {
            // outer: testSelected
            // outer: true
            // outer: selectedStyle
            // outer: delete
            // outer: unselectedStyle
            // outer: $
            // outer: selected
            // outer: undefined
            // outer: lastClickTime
            // outer: Date
            // outer: prevCard
            if(card === prevCard && Date.now() - lastClickTime < 100) {
                return undefined;
            };
            prevCard = card;
            lastClickTime = Date.now();
            // swap whether the card is selected
            if(selected[card]) {
                $("#card" + card).css(unselectedStyle);
                delete(selected[card]);
            } else  {
                $("#card" + card).css(selectedStyle);
                selected[card] = true;
            };
            // test if selected cards makes a valid combination
            testSelected();
        };
    })();
    //
    // ## Shuffle cards until a valid combination
    // reshuffle 10 times, and take the worst/best combination if hard/easy
    reshuffle = function(shuffleFn) {
        // outer: okDeck
        var i;
        var score;
        // shuffle until we have a valid combination. (score=0 => no valid set)
        score = 0;
        i = 0;
        while(!score && i < 1000) {
            shuffleFn();
            score = okDeck();
            ++i;
        };
    };
    // ## Keep track of score
    logData = undefined;
    curDate = undefined;
    log = function(obj) {
        // outer: Array
        // outer: localStorage
        // outer: JSON
        // outer: setTimeout
        setTimeout(function() {
            // outer: Array
            // outer: localStorage
            // outer: JSON
            var logData;
            var curDate;
            // outer: obj
            var objDate;
            objDate = obj.now / 24 / 60 / 60 / 1000 | 0;
            if(objDate !== curDate) {
                curDate = objDate;
                logData = JSON.parse(localStorage.getItem("combigamelog" + curDate) || "[]");
            };
            logData = logData || [];
            logData.push(obj);
            localStorage.setItem("combigamelog" + curDate, JSON.stringify(logData));
        }, 0);
    };
    // ## Score reporting
    showScore = function() {
        // outer: Date
        // outer: exports
        // outer: webutil
        // outer: partialScore
        // outer: logData
        // outer: _
        // outer: $
        // outer: true
        // outer: Object
        // outer: fullbrows
        fullbrows.start({hideButtons : true, update : function() {
            // outer: Date
            // outer: exports
            // outer: fullbrows
            // outer: webutil
            // outer: Object
            // outer: partialScore
            // outer: logData
            // outer: _
            var log;
            // outer: $
            var $t;
            $t = $("<div>");
            log = _(logData).filter(function(elem) {
                return !elem.hint;
            }).sort(function(a, b) {
                return a.time - b.time;
            });
            $t.append($("<h3>Timingsxa0</h3>"));
            if(log.length === 0) {
                $t.append("<p>No score available, please play the game before looking at the timings.</p>");
            };
            partialScore($t, "Today", log);
            partialScore($t, "Last five minutes", log.filter(function(elem) {
                // outer: Date
                return Date.now() - elem.now < 5 * 60 * 1000;
            }));
            partialScore($t, "Last minute", log.filter(function(elem) {
                // outer: Date
                return Date.now() - elem.now < 60 * 1000;
            }));
            $t.append("<p>Click to close.</p>");
            $("#content").html("").append($t);
            $t.css({width : "80%", height : "90%"});
            webutil.scaleText($t);
            $t.css({margin : "3% 10% 7% 10%", overflow : "visible"});
            $t.bind("mousedown touchstart", fullbrows.startFn(exports.app));
        }});
    };
    partialScore = function($t, title, log) {
        // outer: $
        if(log.length > 0) {
            if(title) {
                $t.append($("<div><b>" + title + "</b></div>"));
            };
            $t.append($("<div>Best time: " + (log[0].time / 10 | 0) / 100 + "s"));
            $t.append($("<div>Median time: " + (log[log.length >> 1].time / 10 | 0) / 100 + "s"));
        };
    };
    // ## Check whether the selected figures yields a valid combination
    testSelected = function() {
        // outer: randomCard
        // outer: doLayout
        // outer: reshuffle
        // outer: _
        // outer: Array
        // outer: unselectedStyle
        // outer: $
        // outer: setTimeout
        // outer: false
        // outer: cards
        // outer: giveup
        // outer: prevtime
        // outer: log
        // outer: Date
        var now;
        // outer: okSet
        // outer: undefined
        // outer: selected
        // outer: Object
        var list;
        list = Object.keys(selected);
        // 3 not selected yet, break
        if(list.length < 3) {
            return undefined;
        };
        if(okSet(list[0], list[1], list[2])) {
            // valid combination, log to score
            now = Date.now();
            log({
                time : now - prevtime,
                hint : giveup,
                cards : cards.slice(0),
                choosen : list,
                now : now,
            });
            giveup = false;
            prevtime = now;
            // fade-out the cards
            setTimeout(function() {
                // outer: $
                // outer: list
                list.forEach(function(id) {
                    // outer: $
                    $("#card" + id).css("opacity", 0);
                });
            }, 0);
            // reshuffle, and bring in 3 new cards
            setTimeout(function() {
                // outer: randomCard
                // outer: doLayout
                // outer: reshuffle
                // outer: list
                // outer: cards
                // outer: _
                // outer: Array
                var ids;
                // outer: unselectedStyle
                // outer: $
                $(".card").css(unselectedStyle);
                ids = [
                    _(cards).indexOf(list[0]),
                    _(cards).indexOf(list[1]),
                    _(cards).indexOf(list[2]),
                ];
                reshuffle(function() {
                    // outer: randomCard
                    // outer: ids
                    // outer: cards
                    var i;
                    i = 0;
                    while(i < 3) {
                        cards[ids[i]] = randomCard();
                        ++i;
                    };
                });
                doLayout();
            }, 1000);
            // invalid combination clear selection
        } else  {
            $(".card").css(unselectedStyle);
        };
        selected = {};
    };
    // ## Random card id
    randomCard = function() {
        // outer: rnd3
        return "" + rnd3() + rnd3() + rnd3() + rnd3();
    };
    // ### Randomly 0, 1, or 2
    rnd3 = function() {
        // outer: Math
        return Math.random() * 3 | 0;
    };
    // ## return true if the three card-ids forms a valid combination
    okSet = function(a, b, c) {
        // outer: true
        // outer: false
        var ok;
        var i;
        i = 0;
        while(i < 4) {
            ok = a[i] === b[i] && b[i] === c[i] || (a[i] !== b[i] && b[i] !== c[i] && c[i] !== a[i]);
            if(!ok) {
                return false;
            };
            ++i;
        };
        return true;
    };
    // ## show where there is a valid set
    hint = function() {
        // outer: undefined
        // outer: true
        // outer: giveup
        // outer: selectedStyle
        // outer: cards
        // outer: okSet
        var c;
        var b;
        var a;
        // outer: unselectedStyle
        // outer: $
        // outer: Object
        // outer: selected
        selected = {};
        $(".card").css(unselectedStyle);
        a = 0;
        while(a < 10) {
            b = a + 1;
            while(b < 11) {
                c = b + 1;
                while(c < 12) {
                    if(okSet(cards[a], cards[b], cards[c])) {
                        $("#card" + cards[a]).css(selectedStyle).css({
                            opacity : 0.6,
                            background : "#ccc",
                            border : "1px solid #bbb",
                        });
                        $("#card" + cards[b]).css(selectedStyle).css({
                            opacity : 0.6,
                            background : "#ccc",
                            border : "1px solid #bbb",
                        });
                        $("#card" + cards[c]).css(selectedStyle).css({
                            opacity : 0.6,
                            background : "#ccc",
                            border : "1px solid #bbb",
                        });
                        giveup = true;
                        return undefined;
                    };
                    ++c;
                };
                ++b;
            };
            ++a;
        };
    };
    // ## The number of valid combinations among the 12 figures
    okDeck = function() {
        // outer: okSet
        var c;
        var b;
        var a;
        // outer: true
        // outer: false
        // outer: cards
        var i;
        var ok;
        // outer: Object
        var cardHash;
        cardHash = {};
        ok = 0;
        i = 0;
        while(i < 12) {
            if(cardHash[cards[i]]) {
                return false;
            };
            cardHash[cards[i]] = true;
            ++i;
        };
        a = 0;
        while(a < 10) {
            b = a + 1;
            while(b < 11) {
                c = b + 1;
                while(c < 12) {
                    if(okSet(cards[a], cards[b], cards[c])) {
                        ++ok;
                    };
                    ++c;
                };
                ++b;
            };
            ++a;
        };
        return ok;
    };
    // ## Initialisation function
    startGame = function() {
        // outer: randomCard
        // outer: Array
        // outer: true
        // outer: click
        // outer: doLayout
        // outer: reshuffle
        // outer: cards
        // outer: Object
        var l;
        var k;
        var j;
        var i;
        // outer: Date
        // outer: prevtime
        var $content;
        // outer: $
        // outer: false
        // outer: giveup
        giveup = false;
        $("body").append("<div id=\"content\"></div>");
        $content = $("#content");
        $content.html("");
        prevtime = Date.now();
        //require('combigameCards').createCards($('#content').width()/3|0);
        i = 0;
        while(i < 3) {
            j = 0;
            while(j < 3) {
                k = 0;
                while(k < 3) {
                    l = 0;
                    while(l < 3) {
                        $content.append($("<img class=\"card\" src=\"imgs/combigame" + i + j + k + l + ".png\" id=\"card" + i + j + k + l + "\">"));
                        ++l;
                    };
                    ++k;
                };
                ++j;
            };
            ++i;
        };
        $(".card").css({position : "absolute", opacity : "0"});
        $(".card").bind("touchstart mousedown", function(e) {
            // outer: true
            // outer: click
            click(e.target.id.slice(4));
            e.preventDefault();
            return true;
        });
        cards;
        reshuffle(function() {
            // outer: randomCard
            // outer: i
            // outer: Array
            // outer: cards
            cards = [];
            i = 0;
            while(i < 12) {
                cards.push(randomCard());
                ++i;
            };
        });
        doLayout();
    };
    // # Utility for showing a menu
    menu = function(items) {
        // outer: parseInt
        // outer: webutil
        // outer: $
        // outer: Math
        // outer: item
        // outer: true
        // outer: Object
        // outer: fullbrows
        fullbrows.start({hideButtons : true, update : function() {
            // outer: parseInt
            // outer: webutil
            // outer: items
            // outer: Object
            var $content;
            var $menu;
            // outer: $
            // outer: Math
            var s;
            // outer: item
            item;
            s = Math.min($("#content").height() + $("#content").width());
            $menu = $("<div>");
            $content = $("#content");
            $content.html("").append($menu);
            Object.keys(items).forEach(function(item) {
                // outer: items
                // outer: s
                // outer: Object
                // outer: $
                // outer: $menu
                $menu.append($("<div>").text(item).css({
                    border : "1px solid black",
                    "border-radius" : s * 0.02,
                    "text-align" : "center",
                    margin : s * 0.01,
                    padding : s * 0.01,
                }).bind("click", items[item]));
            });
            webutil.scaleText($content);
            $content.css("font-size", parseInt($content.css("font-size"), 10) * 0.8);
            $menu.css("top", ($content.height() - $menu.height()) / 2);
            $menu.css("position", "absolute");
            $menu.css("width", "100%");
        }});
    };
    // ## App definition
    exports.app = {start : startGame, update : doLayout};
})();
});solsort_define("blobshot",function(exports, require){(function() {
    // outer: document
    // outer: console
    // outer: null
    // outer: Object
    // outer: Date
    // outer: Math
    // outer: window
    var blobMain;
    var animate;
    var gameOver;
    var h;
    var w;
    var canvas;
    var ctx;
    var size;
    var newBullet;
    var bullets;
    // outer: undefined
    var bulletSource;
    var score;
    // outer: true
    var running;
    var bulletSize;
    var count;
    // outer: Array
    var enemies;
    // outer: false
    var started;
    var V2d;
    // outer: exports
    // outer: require
    require("./canvasapp");
    exports.init = function() {
        // outer: exports
        exports.run();
    };
    V2d = require("./v2d").V2d;
    // webcanvas, exports.run
    started = false;
    enemies = [];
    count = 0;
    bulletSize = 0;
    running = true;
    score = 0;
    bulletSource = undefined;
    bullets = [];
    newBullet = undefined;
    size = 100;
    ctx = undefined;
    canvas = undefined;
    w = undefined;
    h = undefined;
    gameOver = function() {
        // outer: exports
        // outer: canvas
        // outer: score
        // outer: h
        // outer: w
        // outer: size
        // outer: window
        // outer: ctx
        // outer: false
        // outer: running
        running = false;
        ctx["fillStyle"] = "#fff";
        window.setTimeout(function() {
            // outer: exports
            // outer: canvas
            // outer: score
            // outer: h
            // outer: w
            // outer: size
            // outer: ctx
            ctx["fillStyle"] = "#000";
            ctx["shadowColor"] = "#fff";
            ctx["shadowBlur"] = size;
            ctx["font"] = size * 4 + "px Sans Serif";
            ctx["textBaseline"] = "middle";
            ctx["textAlign"] = "center";
            ctx.fillText("GAME OVER", w / 2, h / 3);
            ctx.fillText("Score: " + score, w / 2, h * 2 / 3);
            canvas["onmousedown"] = function(e) {
                // outer: exports
                exports.run();
            };
        }, 1000);
    };
    animate = function(list, color) {
        // outer: Math
        // outer: h
        // outer: w
        // outer: gameOver
        // outer: size
        // outer: ctx
        // outer: Array
        var result;
        result = [];
        ctx["fillStyle"] = color;
        list.forEach(function(obj) {
            // outer: Math
            // outer: result
            // outer: h
            // outer: w
            // outer: gameOver
            // outer: size
            // outer: ctx
            ctx.beginPath();
            obj["pos"] = obj["pos"].add(obj["v"]);
            if(obj["pos"]["x"] < 0 - size) {
                gameOver.call();
            };
            if(obj["dead"] || w + size * 4 < obj["pos"]["x"] || obj["pos"]["y"] < 0 - size || h + size < obj["pos"]["y"]) {} else  {
                result.push(obj);
            };
            ctx.arc(obj["pos"]["x"], obj["pos"]["y"], obj["size"], Math["PI"] * 2, 0);
            ctx.fill();
        });
        return result;
    };
    blobMain = function() {
        // outer: true
        // outer: blobMain
        // outer: window
        // outer: bulletSource
        // outer: bullets
        // outer: console
        // outer: newBullet
        // outer: null
        // outer: animate
        // outer: V2d
        // outer: Math
        // outer: Object
        // outer: enemies
        // outer: count
        // outer: score
        // outer: h
        // outer: w
        // outer: ctx
        // outer: size
        // outer: bulletSize
        // outer: Date
        var startTime;
        // outer: undefined
        // outer: running
        if(!running) {
            return undefined;
        };
        startTime = Date.now();
        bulletSize = bulletSize + size / 40;
        ctx["fillStyle"] = "rgba(0,0,0,0.3)";
        ctx.fillRect(0, 0, w, h);
        ctx["fillStyle"] = "#fff";
        ctx["textBaseline"] = "top";
        ctx["font"] = size + "px Sans Serif";
        ctx.fillText("Score: " + score, size * 2, 0);
        count = count + 1;
        if(enemies["length"] < count / 100) {
            enemies.push({
                size : size * Math.random() + .5,
                pos : new V2d(w + size * 2, Math.random() * (h - size)),
                v : new V2d(Math.random() * size * (- 0.9), 0),
            });
        };
        enemies = animate.call(null, enemies, "#f00");
        if(newBullet) {
            console.log("newbullet");
            bullets.push({
                size : bulletSize,
                pos : bulletSource,
                v : newBullet.sub(bulletSource).norm().scale(size),
            });
            bulletSize = 1;
            score = Math.max(0, score - 1);
            newBullet = undefined;
        };
        bullets = animate.call(null, bullets, "#080");
        score;
        bullets.forEach(function(bullet) {
            // outer: true
            // outer: enemies
            // outer: score
            score;
            enemies.forEach(function(enemy) {
                // outer: score
                // outer: true
                // outer: bullet
                if(bullet["pos"].sub(enemy["pos"]).length() < bullet["size"] + enemy["size"]) {
                    bullet["dead"] = true;
                    enemy["dead"] = true;
                    score = 20 + score;
                };
            });
        });
        window.setTimeout(blobMain, Math.max(0, 50 - (Date.now() - startTime)));
    };
    canvas = ctx = w = h = undefined;
    exports.run = function() {
        // outer: console
        // outer: blobMain
        // outer: started
        // outer: newBullet
        // outer: Math
        // outer: Object
        // outer: count
        // outer: score
        // outer: bullets
        // outer: Array
        // outer: enemies
        var i;
        var wallcount;
        // outer: V2d
        // outer: bulletSource
        // outer: size
        // outer: true
        // outer: running
        // outer: w
        // outer: h
        // outer: ctx
        // outer: document
        // outer: canvas
        canvas = document.getElementById("canvas");
        canvas.onmousedown = function() {
            // outer: console
            console.log("blahblah");
        };
        ctx = canvas.getContext("2d");
        h = ctx.height = canvas.height = canvas.offsetHeight;
        w = ctx.width = canvas.width = canvas.offsetWidth;
        running = true;
        size = h / 30;
        bulletSource = new V2d(0, h / 2);
        wallcount = 30;
        i = 0;
        enemies = [];
        bullets = [];
        score = 0;
        count = 0;
        while(i <= wallcount) {
            bullets.push({
                pos : new V2d(Math.random() * size, i * h / wallcount),
                v : new V2d(0, 0),
                size : h / wallcount,
            });
            i = i + 1;
        };
        newBullet;
        canvas["onmousedown"] = function(e) {
            // outer: console
            var E;
            // outer: V2d
            // outer: newBullet
            newBullet = new V2d(e["clientX"], e["clientY"]);
            E = e;
            console.log("here!!!");
        };
        if(!started) {
            blobMain.call();
        };
    };
})();
});solsort_define("build",function(exports, require){exports.nodemain = function(arg) {
    // outer: true
    // outer: console
    // outer: ;
    var webjs;
    var createSolsortJS;
    var compileToJS;
    var optionalCompile;
    var sourcefiles;
    // outer: Object
    var compiled;
    var buildpath;
    // outer: __dirname
    var sourcepath;
    // outer: require
    var fs;
    fs = require("fs");
    sourcepath = __dirname + "/../../lightscript/";
    buildpath = sourcepath + "../build/";
    compiled = {};
    sourcefiles = fs.readdirSync(sourcepath).filter(function(name) {
        return name.slice(- 3) === ".ls";
    });
    optionalCompile = function(src, dst, fn, done) {
        // outer: ;
        // outer: fs
        fs.stat(src, function(err, srcStat) {
            // outer: done
            // outer: src
            // outer: fn
            // outer: dst
            // outer: fs
            // outer: ;
            if(err) {
                return ;
            };
            fs.stat(dst, function(err, dstStat) {
                // outer: done
                // outer: dst
                // outer: src
                // outer: fn
                // outer: srcStat
                if(err || dstStat.mtime.getTime() <= srcStat.mtime.getTime()) {
                    fn(src, dst, done);
                } else  {
                    done();
                };
            });
        });
    };
    compileToJS = function(fn) {
        // outer: fs
        // outer: true
        // outer: compiled
        // outer: console
        return function(ls, js, done) {
            // outer: fn
            // outer: fs
            // outer: true
            // outer: compiled
            // outer: console
            var shortname;
            shortname = ls.split("/").slice(- 1)[0];
            console.log("compiling:", shortname);
            compiled[shortname] = true;
            fs.readFile(ls, "utf8", function(err, src) {
                // outer: done
                // outer: js
                // outer: fs
                // outer: fn
                src = fn(src);
                fs.writeFile(js, src, function() {
                    // outer: done
                    done();
                });
            });
        };
    };
    if(arg === "pretty") {
        sourcefiles.forEach(function(filename) {
            // outer: require
            // outer: sourcepath
            // outer: fs
            var src;
            // outer: console
            console.log("prettyprinting:", filename);
            src = fs.readFileSync(sourcepath + filename, "utf8");
            src = require("./compiler").ls2ls(src);
            fs.writeFileSync(sourcepath + filename, src);
        });
    };
    createSolsortJS = function() {
        // outer: buildpath
        // outer: fs
        // outer: require
        var result;
        result = "solsort_modules={};";
        result += "solsort_require = function(name){";
        result += "  name = name.slice(2);";
        result += "  var t = solsort_modules[name];";
        result += "  if(typeof t === \"function\") {";
        result += "     t(solsort_modules[name]={},solsort_require);";
        result += "     return solsort_modules[name]}";
        result += "  return t;};";
        result += "solsort_define = function(name,fn){solsort_modules[name]=fn};";
        require("./module").list().forEach(function(name) {
            // outer: buildpath
            // outer: fs
            // outer: result
            result += fs.readFileSync(buildpath + "webjs/" + name + ".js");
        });
        result += "solsort_require(\"./main\");";
        fs.writeFile(buildpath + "webjs/solsort.js", result);
        fs.writeFile(buildpath + "mozjs/data/solsort.js", result + "solsort_require(\"./addon\").main();");
    };
    webjs = function(name) {
        // outer: require
        //return require("./compiler").ls2webjs;
        return function(ls) {
            // outer: require
            // outer: name
            var result;
            result = "solsort_define(\"" + name + "\",function(exports, require){";
            result += require("./compiler").ls2webjs(ls);
            result += "});";
            return result;
        };
    };
    require("async").forEach(sourcefiles, function(filename, done) {
        // outer: webjs
        // outer: require
        // outer: compileToJS
        // outer: sourcepath
        // outer: optionalCompile
        // outer: buildpath
        var nodefile;
        done;
        nodefile = buildpath + "nodejs/" + filename.replace(".ls", ".js");
        optionalCompile(sourcepath + filename, nodefile, compileToJS(require("./compiler").ls2nodejs), function() {
            // outer: done
            // outer: webjs
            // outer: require
            // outer: compileToJS
            // outer: sourcepath
            // outer: optionalCompile
            // outer: filename
            // outer: buildpath
            var mozfile;
            mozfile = buildpath + "mozjs/lib/" + filename.replace(".ls", ".js");
            optionalCompile(sourcepath + filename, mozfile, compileToJS(require("./compiler").ls2mozjs), function() {
                // outer: done
                // outer: webjs
                // outer: compileToJS
                // outer: sourcepath
                // outer: optionalCompile
                // outer: filename
                // outer: buildpath
                var webfile;
                webfile = buildpath + "webjs/" + filename.replace(".ls", ".js");
                optionalCompile(sourcepath + filename, webfile, compileToJS(webjs(filename.replace(".ls", ""))), done);
            });
        });
    }, function() {
        // outer: webjs
        // outer: compileToJS
        // outer: sourcepath
        // outer: optionalCompile
        // outer: buildpath
        // outer: createSolsortJS
        // outer: sourcefiles
        // outer: require
        // outer: arg
        // outer: compiled
        if(compiled["compiler.ls"] || compiled["build.ls"] || arg === "web") {
            require("async").forEach(sourcefiles, function(filename, done) {
                // outer: webjs
                // outer: require
                // outer: compileToJS
                // outer: sourcepath
                // outer: optionalCompile
                // outer: buildpath
                var nodefile;
                done;
                nodefile = buildpath + "nodejs/" + filename.replace(".ls", ".js");
                optionalCompile(sourcepath + filename, nodefile, compileToJS(require("./compiler").ls2nodejs), function() {
                    // outer: done
                    // outer: webjs
                    // outer: require
                    // outer: compileToJS
                    // outer: sourcepath
                    // outer: optionalCompile
                    // outer: filename
                    // outer: buildpath
                    var mozfile;
                    mozfile = buildpath + "mozjs/lib/" + filename.replace(".ls", ".js");
                    optionalCompile(sourcepath + filename, mozfile, compileToJS(require("./compiler").ls2mozjs), function() {
                        // outer: done
                        // outer: webjs
                        // outer: compileToJS
                        // outer: sourcepath
                        // outer: optionalCompile
                        // outer: filename
                        // outer: buildpath
                        var webfile;
                        webfile = buildpath + "webjs/" + filename.replace(".ls", ".js");
                        optionalCompile(sourcepath + filename, webfile, compileToJS(webjs(filename.replace(".ls", ""))), done);
                    });
                });
            }, createSolsortJS);
        } else  {
            createSolsortJS();
        };
    });
};
});solsort_define("log",function(exports, require){api = require("./api");
if(undefined) {};
logfn = function(level) {
    // outer: console
    // outer: arguments
    // outer: Array
    // outer: api
    api;
    return function() {
        // outer: api
        // outer: level
        // outer: console
        // outer: arguments
        // outer: Array
        var args;
        args = Array.prototype.slice.call(arguments, 0);
        console.log("log", level, args);
        api.socket.emit("log", level, args);
    };
};
exports.info = logfn("info");
exports.warn = logfn("warn");
exports.error = logfn("error");
});solsort_define("compiler",function(exports, require){// Compiler {{{1
codegen = undefined;
(function() {
    // outer: tokenLookup
    // outer: Array
    // outer: ast2rst
    // outer: ast2js
    // outer: prettyprint
    // outer: analyse
    // outer: this
    // outer: addMacro
    // outer: compiletime
    // outer: true
    // outer: rst2ast
    // outer: tokenise
    // outer: parse
    // outer: Object
    // outer: runMacro
    // outer: undefined
    // outer: exports
    // outer: codegen
    var ls2compiler;
    var applyMacros;
    applyMacros = function(macros, compiler) {
        // outer: runMacro
        // outer: undefined
        var doIt;
        var relations;
        relations = function(ast) {
            // outer: relations
            // outer: undefined
            var prev;
            prev = undefined;
            ast.children.forEach(function(child) {
                // outer: ast
                // outer: prev
                // outer: relations
                relations(child);
                if(prev) {
                    child.prev = prev;
                    prev.next = child;
                };
                child.parent = ast;
                prev = child;
            });
        };
        doIt = function(ast) {
            // outer: macros
            // outer: runMacro
            // outer: doIt
            if(ast.kind === "compiletime") {
                return ast;
            };
            ast.children = ast.children.map(doIt);
            return runMacro(macros, ast);
        };
        compiler.asts.forEach(relations);
        compiler.asts = compiler.asts.map(doIt);
    };
    // orig build {{{2
    ls2compiler = function(src, target) {
        // outer: this
        // outer: addMacro
        // outer: applyMacros
        // outer: compiletime
        // outer: true
        // outer: rst2ast
        // outer: tokenise
        // outer: parse
        // outer: Object
        var compiler;
        compiler = {
            asts : parse(tokenise(src)).map(rst2ast),
            forwardMacros : {},
            reverseMacros : {},
            macro : function(pattern, fn) {
                // outer: this
                // outer: addMacro
                addMacro(this.forwardMacros, pattern, fn);
            },
            unmacro : function(pattern, fn) {
                // outer: this
                // outer: addMacro
                addMacro(this.reverseMacros, pattern, fn);
            },
            target : target,
        };
        compiler[target] = true;
        compiletime(compiler);
        applyMacros(compiler.forwardMacros, compiler);
        return compiler;
    };
    codegen = function(astTransform, asts) {
        // outer: prettyprint
        // outer: analyse
        asts = analyse(asts);
        asts = asts.map(astTransform);
        return prettyprint(asts).slice(1);
    };
    exports.ls2mozjs = function(ls) {
        // outer: ls2compiler
        // outer: ast2js
        // outer: codegen
        return codegen(ast2js, ls2compiler(ls, "mozjs").asts);
    };
    exports.ls2webjs = function(ls) {
        // outer: ls2compiler
        // outer: ast2js
        // outer: codegen
        return codegen(ast2js, ls2compiler(ls, "webjs").asts);
    };
    exports.ls2nodejs = function(ls) {
        // outer: ls2compiler
        // outer: ast2js
        // outer: codegen
        return codegen(ast2js, ls2compiler(ls, "nodejs").asts);
    };
    exports.ls2ls = function(ls) {
        // outer: ast2rst
        // outer: codegen
        // outer: analyse
        // outer: applyMacros
        // outer: ls2compiler
        var compiler;
        compiler = ls2compiler(ls, "lightscript");
        applyMacros(compiler.reverseMacros, compiler);
        compiler.asts = analyse(compiler.asts);
        return codegen(ast2rst, compiler.asts);
    };
    // for build2 {{{2
    exports.parsels = function(src) {
        // outer: tokenise
        // outer: parse
        // outer: rst2ast
        return rst2ast(parse(tokenise("(function(){" + src + "})()"))[0]);
    };
    exports.applyMacros = function(opt) {
        // outer: this
        // outer: addMacro
        // outer: applyMacros
        // outer: compiletime
        // outer: true
        // outer: Array
        // outer: Object
        var compiler;
        //asts : [opt.ast.copy()],
        //console.log(require('util').inspect(opt.ast, true, null));
        //console.log(require('util').inspect(opt.ast.copy(), true, null));
        compiler = {
            asts : [opt.ast.copy()],
            forwardMacros : {},
            reverseMacros : {},
            macro : function(pattern, fn) {
                // outer: this
                // outer: addMacro
                addMacro(this.forwardMacros, pattern, fn);
            },
            unmacro : function(pattern, fn) {
                // outer: this
                // outer: addMacro
                addMacro(this.reverseMacros, pattern, fn);
            },
            target : opt.platform,
        };
        compiler[opt.platform] = true;
        compiletime(compiler);
        applyMacros(opt.reverse ? compiler.forwardMacros : compiler.reverseMacros, compiler);
        return compiler.asts[0];
    };
    exports.optimise = function(ast) {
        return ast;
    };
    exports.ppjs = function(ast) {
        // outer: Array
        // outer: analyse
        // outer: ast2js
        // outer: tokenLookup
        return tokenLookup(ast2js(analyse([ast])[0])).pp().split("\n").slice(1, - 1).join("\n") + "\n";
    };
    exports.ppls = function(ast) {
        // outer: Array
        // outer: analyse
        // outer: ast2rst
        // outer: tokenLookup
        return tokenLookup(ast2rst(analyse([ast])[0])).pp().split("\n").slice(1, - 1).join("\n") + "\n";
    };
})();
// compile-time-execution {{{1
compiletime = undefined;
(function() {
    // outer: JSON
    // outer: console
    // outer: Function
    // outer: ast2js
    // outer: codegen
    // outer: Array
    // outer: compiletime
    // outer: require
    var util;
    util = require("./util");
    compiletime = function(compiler) {
        // outer: JSON
        // outer: console
        // outer: require
        // outer: util
        // outer: Function
        var fn;
        // outer: ast2js
        // outer: codegen
        var code;
        var ast;
        var i;
        var deepcopy;
        var visitAsts;
        var compiletimevals;
        // outer: Array
        var compiletimeasts;
        var asts;
        asts = compiler.asts;
        compiletimeasts = [];
        compiletimevals = [];
        visitAsts = function(asts) {
            // outer: visitAsts
            // outer: compiletimeasts
            asts.forEach(function(ast) {
                // outer: visitAsts
                // outer: compiletimeasts
                if(ast.kind === "compiletime") {
                    ast.assertEqual(ast.children.length, 1);
                    compiletimeasts.push(ast);
                } else  {
                    visitAsts(ast.children);
                };
            });
        };
        visitAsts(asts);
        deepcopy = function(ast) {
            // outer: deepcopy
            var result;
            result = ast.create(ast);
            result.children = ast.children.map(deepcopy);
            return result;
        };
        asts = compiletimeasts.map(function(ast) {
            return ast.children[0];
        }).map(deepcopy);
        i = 0;
        while(i < asts.length) {
            ast = asts[i];
            if(!ast.isa("branch:cond") && !ast.isa("branch:while") && !ast.isa("branch:return")) {
                asts[i] = ast.create("call:[]=", ast.create("id:__compiletimevals"), ast.create("num", i), ast);
            };
            ++i;
        };
        code = codegen(ast2js, asts);
        fn = Function("__compiletimevals", "compiler", "require", code);
        util.trycatch(function() {
            // outer: require
            // outer: compiler
            // outer: compiletimevals
            // outer: fn
            fn(compiletimevals, compiler, require);
        }, function(err) {
            // outer: console
            console.log("compile-time error", err);
            if(err.stack) {
                console.log(err.stack);
            };
        });
        i = 0;
        while(i < compiletimeasts.length) {
            compiletimeasts[i].val = util.trycatch(function() {
                // outer: i
                // outer: compiletimevals
                // outer: JSON
                return JSON.stringify(compiletimevals[i]);
            }, function() {}) || "undefined";
            ++i;
        };
    };
})();
// Tokeniser {{{1
tokenise = undefined;
(function() {
    // outer: true
    // outer: undefined
    // outer: Array
    // outer: Object
    // outer: tokenise
    var createToken;
    "use strict";
    createToken = function(kind, val, pos) {
        // outer: Object
        return {
            kind : kind,
            val : val,
            pos : pos,
        };
    };
    tokenise = function(buffer) {
        // outer: true
        // outer: undefined
        // outer: createToken
        var token;
        // outer: Array
        var tokens;
        var next;
        var newToken;
        var begin_token;
        var pop;
        var peek;
        var starts_with;
        var one_of;
        var lineno;
        // outer: Object
        var start;
        var pos;
        pos = 0;
        start = {lineno : 0, pos : 0};
        lineno = 0;
        one_of = function(str) {
            // outer: peek
            return str.indexOf(peek()) !== - 1;
        };
        starts_with = function(str) {
            // outer: peek
            return peek(str.length) === str;
        };
        peek = function(n, delta) {
            // outer: pos
            // outer: buffer
            n = n || 1;
            delta = delta || 0;
            return buffer.slice(pos + delta, pos + delta + n);
        };
        pop = function(n) {
            // outer: lineno
            // outer: pos
            // outer: buffer
            var result;
            n = n || 1;
            result = buffer.slice(pos, pos + n);
            result.split("").forEach(function(c) {
                // outer: lineno
                if(c === "\n") {
                    ++lineno;
                };
            });
            pos += n;
            return result;
        };
        begin_token = function() {
            // outer: pos
            // outer: lineno
            // outer: Object
            // outer: start
            start = {lineno : lineno, pos : pos};
        };
        newToken = function(kind, val) {
            // outer: pos
            // outer: lineno
            // outer: start
            // outer: createToken
            var result;
            result = createToken(kind, val, "l" + start.lineno + "p" + start.pos + "-l" + lineno + "p" + pos);
            return result;
        };
        next = function() {
            // outer: pos
            // outer: Object
            var quote;
            // outer: newToken
            // outer: starts_with
            // outer: pop
            // outer: one_of
            // outer: peek
            // outer: begin_token
            // outer: true
            var c;
            // outer: undefined
            var s;
            var hexdigits;
            var digits;
            var ident;
            var joined_symbol;
            var single_symbol;
            var whitespace;
            whitespace = " \t\r\n";
            single_symbol = "(){}[]:;,`?";
            joined_symbol = "=+-*/<>%!|&^~#.@";
            ident = "_qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM$";
            digits = "0123456789";
            hexdigits = digits + "abcdefABCDEF";
            s = undefined;
            c = undefined;
            while(true) {
                begin_token();
                if(peek() === "") {
                    return undefined;
                } else if(one_of(whitespace)) {
                    pop();
                } else if(starts_with("//")) {
                    s = "";
                    while(peek() && peek() !== "\n") {
                        s += pop();
                    };
                    s += pop();
                    return newToken("note", s);
                } else if(starts_with("/*")) {
                    s = "";
                    while(peek() && peek(2) !== "*/") {
                        s += pop();
                    };
                    s += pop(2);
                    return newToken("note", s);
                } else if(one_of("'\"")) {
                    s = "";
                    quote = pop();
                    while(!starts_with(quote)) {
                        c = pop();
                        if(c === "\\") {
                            c = pop();
                            c = ({
                                n : "\n",
                                r : "\r",
                                t : "\t",
                            })[c] || c;
                        };
                        s += c;
                    };
                    pop();
                    return newToken("str", s);
                } else if(one_of(digits) || (peek() === "." && digits.indexOf(peek(1, 1)) !== - 1)) {
                    s = pop();
                    if(peek() !== "x") {
                        while(peek() && one_of(".e" + digits)) {
                            s += pop();
                        };
                    } else  {
                        s = pop(2);
                        while(peek() && one_of(hexdigits)) {
                            s += pop();
                        };
                    };
                    return newToken("num", s);
                } else if(one_of(single_symbol)) {
                    return newToken("id", pop());
                } else if(one_of(joined_symbol)) {
                    s = "";
                    while(peek() && one_of(joined_symbol)) {
                        s += pop();
                    };
                    return newToken("id", s);
                } else if(one_of(ident)) {
                    s = "";
                    while(peek() && one_of(ident + digits)) {
                        s += pop();
                    };
                    return newToken("id", s);
                } else  {
                    throw "Tokenisation error: " + peek().charCodeAt(0) + " (" + peek() + ") at pos " + pos;
                };
            };
        };
        tokens = [];
        token = next();
        while(token) {
            tokens.push(token);
            token = next();
        };
        return tokens;
    };
})();
// Ast object {{{1
Ast = undefined;
(function() {
    // outer: require
    // outer: this
    // outer: Object
    // outer: arguments
    // outer: Array
    // outer: Ast
    Ast = function() {
        // outer: Ast
        // outer: arguments
        // outer: Array
        var args;
        args = Array.prototype.slice.call(arguments, 0);
        return Ast.prototype.create.apply(Ast.prototype, args);
    };
    Ast.prototype.create = function(arg) {
        var splitpos;
        // outer: require
        // outer: this
        // outer: Ast
        // outer: Object
        var self;
        // outer: arguments
        // outer: Array
        var args;
        args = Array.prototype.slice.call(arguments, 0);
        self = Object.create(Ast.prototype);
        self.pos = this.pos;
        if(typeof arg === "object") {
            self = require("./util").extend(self, arg);
        } else if(typeof arg === "string") {
            splitpos = arg.indexOf(":");
            if(splitpos === - 1) {
                self.kind = args.shift();
                self.val = args.shift();
            } else  {
                args.shift();
                self.kind = arg.slice(0, splitpos);
                self.val = arg.slice(splitpos + 1);
            };
            self.children = args;
        };
        return self;
    };
    Ast.prototype.isa = function(kindval) {
        // outer: this
        kindval = kindval.split(":");
        this.assertEqual(kindval.length, 2);
        return this.kind === kindval[0] && this.val === kindval[1];
    };
    Ast.prototype.assertEqual = function(a, b) {
        // outer: this
        if(a !== b) {
            this.error("assert error: " + a + " !== " + b);
        };
    };
    Ast.prototype.error = function(desc) {
        // outer: this
        // outer: Object
        // outer: require
        throw require("util").inspect({error : desc, token : this});
    };
    Ast.assert = function(ok, desc) {
        // outer: this
        if(!ok) {
            this.error(desc);
        };
    };
    Ast.prototype.toList = function() {
        // outer: this
        var result;
        result = this.children.map(function(node) {
            return node.toList();
        });
        result.unshift(this.kind + ":" + this.val);
        return result;
    };
    Ast.prototype.copy = function() {
        // outer: this
        // outer: Ast
        // outer: Object
        var result;
        result = Object.create(Ast.prototype);
        result.kind = this.kind;
        result.val = this.val;
        result.pos = this.pos;
        result.children = this.children.map(function(child) {
            return child.copy();
        });
        return result;
    };
})();
exports.test = function(test) {
    // outer: Array
    // outer: Object
    // outer: Ast
    var ast;
    ast = Ast("kind1:val1", "arg1");
    test.assertEqual(ast.kind, "kind1");
    test.assertEqual(ast.val, "val1");
    test.assertEqual(ast.children[0], "arg1");
    test.assertEqual(typeof ast.create, "function", "has create function");
    ast = Ast("kind2", "val2", "arg2");
    test.assertEqual(ast.kind, "kind2");
    test.assertEqual(ast.val, "val2");
    test.assertEqual(ast.children[0], "arg2");
    ast = Ast({
        kind : "kind3",
        val : "val3",
        children : ["arg3"],
    });
    test.assertEqual(ast.kind, "kind3");
    test.assertEqual(ast.val, "val3");
    test.assertEqual(ast.children[0], "arg3");
    test.done();
};
// Syntax {{{1
parse = undefined;
prettyprint = undefined;
tokenLookup = undefined;
(function() {
    // outer: JSON
    // outer: this
    // outer: true
    var symb;
    var nospace;
    var list;
    var special;
    var sep;
    var prefix;
    var rparen;
    var infixr;
    var infix;
    var infixLed;
    var nudPrefix;
    var stringpp;
    var blockpp;
    var pplistlines;
    var newline;
    var infixlistpp;
    var compactlistpp;
    var listpp;
    var ppPrio;
    // outer: prettyprint
    var pp;
    var indent;
    // outer: parse
    var parseExpr;
    var nextToken;
    // outer: undefined
    var token;
    // outer: Array
    // outer: Object
    // outer: Ast
    var defaultToken;
    // outer: tokenLookup
    // outer: require
    var extend;
    // setup, token lookup, default token {{{2
    extend = require("./util").extend;
    tokenLookup = function(ast) {
        // outer: Object
        // outer: extend
        // outer: defaultToken
        // outer: symb
        var proto;
        proto = symb[ast.kind + ":"] || symb[ast.val] || (ast.val && symb[ast.val[ast.val.length - 1]]) || defaultToken;
        ast = extend(Object.create(proto), ast);
        //console.log(ast.kind, ast.val, ast.bp, proto.bp, ast.pp === proto.pp);
        return ast;
    };
    defaultToken = Ast({
        nud : function() {},
        bp : 0,
        dbp : 0,
        space : " ",
        children : [],
    });
    // parser {{{2
    token = undefined;
    nextToken = undefined;
    parseExpr = function(rbp) {
        var left;
        // outer: nextToken
        // outer: token
        var t;
        rbp = rbp || 0;
        t = token;
        nextToken();
        t.nud();
        left = t;
        while(rbp < token.bp && !t.sep) {
            t = token;
            nextToken();
            if(!t.led) {
                t.error("expect led, which doesn't exists");
            };
            t.led(left);
            left = t;
        };
        return left;
    };
    parse = function(tokens) {
        // outer: true
        // outer: Object
        // outer: tokenLookup
        // outer: parseExpr
        // outer: token
        // outer: Array
        var result;
        // outer: nextToken
        var pos;
        pos = 0;
        nextToken = function() {
            // outer: true
            // outer: Object
            // outer: tokens
            // outer: pos
            // outer: tokenLookup
            // outer: token
            token = tokenLookup(pos === tokens.length ? {kind : "eof", rparen : true} : tokens[pos]);
            ++pos;
            return tokenLookup(token);
        };
        nextToken();
        result = [];
        while(token.kind !== "eof") {
            result.push(parseExpr());
        };
        return result;
    };
    // prettyprinter {{{2
    indent = - 4;
    defaultToken.pp = function() {
        // outer: pp
        var result;
        // outer: ppPrio
        // outer: this
        //console.log('pp', this.kind, this.val, this.bp, this.children.map(function(child) { return [child.kind, child.val, child.bp]; }));
        if(this.children.length === 0) {
            return this.val;
        } else if(this.children.length === 1) {
            return this.val + this.space + ppPrio(this.children[0], this.bp);
        } else if(this.children.length === 2) {
            result = "";
            result += ppPrio(this.children[0], this.bp);
            result += this.space + this.val + this.space;
            result += ppPrio(this.children[1], this.bp + 1 - this.dbp);
            return result;
        } else  {
            return "<([" + this.val + "|" + this.children.map(pp).join(", ") + "])>";
            this.error("cannot prettyprint...");
        };
    };
    pp = function(node) {
        // outer: tokenLookup
        return tokenLookup(node).pp();
    };
    prettyprint = function(stmts) {
        // outer: pplistlines
        return pplistlines(stmts, ";");
    };
    ppPrio = function(node, prio) {
        var result;
        // outer: tokenLookup
        node = tokenLookup(node);
        result = "";
        if(node.bp && node.bp < prio) {
            result += "(";
        };
        result += node.pp();
        if(node.bp && node.bp < prio) {
            result += ")";
        };
        return result;
    };
    listpp = function(nodes) {
        // outer: compactlistpp
        // outer: pplistlines
        if(nodes.length > 2) {
            return pplistlines(nodes, ",");
        } else  {
            return compactlistpp(nodes);
        };
    };
    compactlistpp = function(nodes) {
        // outer: pp
        var args;
        args = nodes.filter(function(elem) {
            return elem.val !== "," || elem.kind !== "id";
        });
        return args.map(pp).join(", ");
    };
    infixlistpp = function() {
        // outer: compactlistpp
        // outer: this
        // outer: ppPrio
        return ppPrio(this.children[0], this.bp) + this.val[1] + compactlistpp(this.children.slice(1)) + this.val[2];
    };
    newline = function() {
        // outer: indent
        var n;
        var result;
        result = "\n";
        n = indent;
        while(n > 0) {
            result += " ";
            --n;
        };
        return result;
    };
    pplistlines = function(nodes, sep) {
        // outer: tokenLookup
        // outer: newline
        // outer: indent
        var listline;
        var result;
        nodes = nodes.filter(function(elem) {
            // outer: sep
            return elem.val !== sep || elem.kind !== "id";
        });
        result = "";
        if(nodes.length === 0) {
            return result;
        };
        listline = function(node) {
            // outer: sep
            // outer: newline
            var lines;
            // outer: tokenLookup
            node = tokenLookup(node);
            lines = newline() + node.pp();
            if(!node.sep) {
                lines += sep;
            };
            return lines;
        };
        indent += 4;
        result += nodes.map(listline).join("");
        indent -= 4;
        result += newline();
        return result;
    };
    blockpp = function() {
        // outer: pplistlines
        // outer: this
        // outer: pp
        return pp(this.children[0]) + " {" + pplistlines(this.children.slice(1).filter(function(elem) {
            return elem.val !== ";" || elem.kind !== "id";
        }), ";") + "}";
    };
    stringpp = function() {
        // outer: this
        // outer: JSON
        return JSON.stringify(this.val);
    };
    // syntax constructors {{{2
    nudPrefix = function() {
        // outer: Array
        // outer: this
        // outer: parseExpr
        var child;
        child = parseExpr(this.bp);
        if(parseExpr.sep) {
            this.error("should be followed by a value, not a separator");
            child.error("missing something before this element");
        };
        this.children = [child];
    };
    infixLed = function(left) {
        // outer: parseExpr
        // outer: Array
        // outer: true
        // outer: this
        this.infix = true;
        this.children = [left, parseExpr(this.bp - this.dbp)];
    };
    infix = function(bp) {
        // outer: nudPrefix
        // outer: infixLed
        // outer: defaultToken
        // outer: Object
        // outer: extend
        return extend(Object.create(defaultToken), {
            led : infixLed,
            nud : nudPrefix,
            bp : bp,
        });
    };
    infixr = function(bp) {
        // outer: nudPrefix
        // outer: infixLed
        // outer: defaultToken
        // outer: Object
        // outer: extend
        return extend(Object.create(defaultToken), {
            led : infixLed,
            nud : nudPrefix,
            bp : bp,
            dbp : 1,
        });
    };
    rparen = function() {
        // outer: this
        // outer: true
        // outer: defaultToken
        // outer: Object
        // outer: extend
        return extend(Object.create(defaultToken), {rparen : true, nud : function() {
            // outer: this
            this.error("unmatched rparen");
        }});
    };
    prefix = function(bp) {
        // outer: nudPrefix
        // outer: defaultToken
        // outer: Object
        // outer: extend
        return extend(Object.create(defaultToken), {nud : nudPrefix, bp : bp});
    };
    sep = function() {
        // outer: true
        // outer: defaultToken
        // outer: Object
        // outer: extend
        return extend(Object.create(defaultToken), {sep : true, pp : function() {
            return "";
        }});
    };
    special = function(ext) {
        // outer: defaultToken
        // outer: Object
        // outer: extend
        return extend(Object.create(defaultToken), ext);
    };
    list = function(rparen) {
        // outer: listpp
        // outer: true
        // outer: Array
        // outer: this
        // outer: defaultToken
        // outer: Object
        // outer: extend
        // outer: nextToken
        // outer: parseExpr
        // outer: token
        var readList;
        readList = function(obj) {
            // outer: nextToken
            // outer: rparen
            // outer: parseExpr
            // outer: token
            while(!token.rparen) {
                obj.children.push(parseExpr());
            };
            if(token.val !== rparen) {
                obj.error("Paren mismatch begin");
                token.error("Paren mismatch end");
            };
            nextToken();
        };
        return function(bp) {
            // outer: listpp
            // outer: readList
            // outer: true
            // outer: Array
            // outer: rparen
            // outer: this
            // outer: defaultToken
            // outer: Object
            // outer: extend
            return extend(Object.create(defaultToken), {
                led : function(left) {
                    // outer: readList
                    // outer: true
                    // outer: Array
                    // outer: rparen
                    // outer: this
                    this.val = "*" + this.val + rparen;
                    this.children = [left];
                    this.infix = true;
                    readList(this);
                },
                nud : function() {
                    // outer: readList
                    // outer: Array
                    // outer: this
                    this.children = [];
                    readList(this);
                },
                bp : bp,
                pp : function() {
                    // outer: rparen
                    // outer: listpp
                    // outer: this
                    return this.val + listpp(this.children) + rparen;
                },
            });
        };
    };
    nospace = function(node) {
        node.space = "";
        return node;
    };
    // syntax definition {{{2
    symb = {
        "." : nospace(infix(1200)),
        "[" : list("]")(1200),
        "*[]" : special({pp : infixlistpp, bp : 1200}),
        "]" : rparen(),
        "(" : list(")")(1200),
        "*()" : special({pp : infixlistpp, bp : 1200}),
        ")" : rparen(),
        "{" : list("}")(1100),
        "*{}" : special({pp : blockpp, bp : 1100}),
        "}" : rparen(),
        "#" : nospace(prefix(1000)),
        "@" : nospace(prefix(1000)),
        "++" : nospace(prefix(1000)),
        "--" : nospace(prefix(1000)),
        "!" : nospace(prefix(1000)),
        "~" : nospace(prefix(1000)),
        "`" : nospace(prefix(1000)),
        "*" : infix(900),
        "/" : infix(900),
        "%" : infix(900),
        "-" : infix(800),
        "+" : infix(800),
        ">>>" : infix(700),
        ">>" : infix(700),
        "<<" : infix(700),
        "<=" : infix(600),
        ">=" : infix(600),
        ">" : infix(600),
        "<" : infix(600),
        "==" : infix(500),
        "!=" : infix(500),
        "!==" : infix(500),
        "===" : infix(500),
        "^" : infix(400),
        "|" : infix(400),
        "&" : infix(400),
        "&&" : infix(300),
        "||" : infix(300),
        ":" : infixr(200),
        "?" : infixr(200),
        "else" : special({
            led : function(left) {
                // outer: defaultToken
                // outer: Object
                // outer: extend
                var child1;
                // outer: this
                // outer: infixLed
                infixLed.call(this, left);
                child1 = this.children[1];
                if(child1.val === "{" && child1.kind === "id") {
                    child1.val = "*{}";
                    child1.children.unshift(extend(Object.create(defaultToken), {
                        kind : "id",
                        val : "",
                        pos : this.pos,
                    }));
                };
            },
            nud : nudPrefix,
            bp : 200,
            dbp : 1,
        }),
        "=" : infixr(100),
        "," : sep(),
        ";" : sep(),
        "constructor" : defaultToken,
        "valueOf" : defaultToken,
        "toString" : defaultToken,
        "toLocaleString" : defaultToken,
        "hasOwnProperty" : defaultToken,
        "isPrototypeOf" : defaultToken,
        "propertyIsEnumerable" : defaultToken,
        "return" : prefix(0),
        "throw" : prefix(0),
        "new" : prefix(0),
        "typeof" : prefix(0),
        "var" : prefix(0),
        "str:" : special({pp : stringpp}),
        "note:" : special({sep : true, pp : function() {
            // outer: this
            if(this.val.slice(0, 2) === "//") {
                return this.val.slice(0, - 1);
            } else  {
                return this.val;
            };
        }}),
        "annotation:" : sep(),
    };
})();
// macro system {{{1
addMacro = undefined;
runMacro = undefined;
(function() {
    // outer: Object
    // outer: runMacro
    // outer: addMacro
    var valPart;
    var kindPart;
    kindPart = function(pattern) {
        return pattern.split(":")[0];
    };
    valPart = function(pattern) {
        return pattern.split(":").slice(1).join(":");
    };
    addMacro = function(table, pattern, fn) {
        var orig_fn;
        // outer: Object
        var table_kind;
        // outer: valPart
        var val;
        // outer: kindPart
        var kind;
        kind = kindPart(pattern);
        val = valPart(pattern);
        table_kind = table[kind];
        if(!table_kind) {
            table[kind] = table_kind = {};
        };
        orig_fn = table_kind[val];
        table_kind[val] = orig_fn ? function(ast) {
            // outer: orig_fn
            // outer: fn
            return fn(ast) || orig_fn(ast);
        } : fn;
    };
    runMacro = function(table, node) {
        var fn;
        var valTable;
        valTable = table[node.kind];
        if(valTable) {
            fn = valTable[node.val] || valTable[""];
        };
        if(!fn) {
            valTable = table[""];
            if(valTable) {
                fn = valTable[node.val] || valTable[""];
            };
        };
        if(fn) {
            node = fn(node) || node;
        };
        return node;
    };
})();
// rst2ast {{{1
rst2ast = undefined;
(function() {
    // outer: false
    // outer: runMacro
    // outer: Array
    // outer: true
    // outer: rst2ast
    // outer: addMacro
    // outer: Object
    var postMacros;
    postMacros = {};
    "call:return call:throw call:&& call:||".split(" ").forEach(function(pattern) {
        // outer: postMacros
        // outer: addMacro
        addMacro(postMacros, pattern, function(ast) {
            ast.kind = "branch";
        });
    });
    addMacro(postMacros, "call:`", function(ast) {
        ast.kind = "compiletime";
    });
    // rst2ast {{{2
    rst2ast = function(ast) {
        // outer: false
        // outer: postMacros
        // outer: runMacro
        var lhs;
        // outer: rst2ast
        var rhs;
        // outer: Array
        var children;
        // outer: true
        var isHashTable;
        // Before recursive transformation {{{3
        // Object
        if(ast.isa("id:{")) {
            isHashTable = true;
            children = [ast.create("id:Object")];
            ast.children.forEach(function(elem) {
                // outer: false
                // outer: isHashTable
                // outer: children
                if(elem.kind === "id" && elem.val === ":" && elem.children.length === 2) {
                    elem.children[0].kind = "str";
                    children = children.concat(elem.children);
                } else if(elem.isa("id:,")) {} else  {
                    isHashTable = false;
                    elem.error("unexpected in object literal");
                };
            });
            if(isHashTable) {
                ast.kind = "call";
                ast.val = "new";
                ast.children = children;
            };
        };
        // ?: (here because of the :)
        if(ast.isa("id:?") && ast.children.length === 2) {
            rhs = ast.children[1];
            if(rhs.kind === "id" && rhs.val === ":" && rhs.children.length === 2) {
                ast.children.push(rhs.children[1]);
                ast.children[1] = rhs.children[0];
                ast.kind = "branch";
                ast.val = "?:";
            };
        };
        // Array
        if(ast.isa("id:[")) {
            ast.children.unshift(ast.create("id:Array"));
            ast.val = "new";
        };
        // transform children {{{3
        ast.children = ast.children.map(rst2ast);
        // After recursive transformation {{{3
        // parenthesie (x) -> x {{{4
        while(ast.isa("id:(") && ast.children.length === 1) {
            ast = ast.children[0];
        };
        // call {{{4
        if(ast.kind === "id" && ast.children.length > 0) {
            ast.kind = "call";
            ast.children = ast.children.filter(function(elem) {
                return !elem.isa("id:,");
            });
        };
        // remove var {{{4
        if(ast.isa("call:var")) {
            ast = ast.children[0];
        };
        // extract lhs and rhs {{{4
        lhs = ast.children[0];
        rhs = ast.children[1];
        // foo.bar -> foo.'bar' {{{4
        if(ast.isa("call:.")) {
            if(rhs.kind === "id") {
                rhs.kind = "str";
            };
        };
        // run postMacros
        ast = runMacro(postMacros, ast);
        // = {{{4
        if(ast.isa("call:=")) {
            if(lhs.kind === "id") {
                ast.kind = "assign";
                ast.val = lhs.val;
                ast.children = ast.children.slice(1);
            };
            if(lhs.isa("call:*[]")) {
                ast.val = "[]=";
                ast.children.unshift(lhs.children[0]);
                ast.children[1] = lhs.children[1];
            };
            if(lhs.isa("call:.")) {
                ast.val = ".=";
                ast.children.unshift(lhs.children[0]);
                ast.children[1] = lhs.children[1];
            };
        };
        // *{} {{{4
        if(ast.isa("call:*{}")) {
            ast.children = ast.children.filter(function(elem) {
                return !elem.isa("id:;");
            });
            // while(a) { b }; 
            if(lhs.isa("call:*()") && lhs.children[0].isa("id:while")) {
                lhs.kind = "branch";
                lhs.val = "while";
                lhs.assertEqual(lhs.children.length, 2);
                lhs.children[0] = lhs.children[1];
                ast.children = ast.children.slice(1);
                ast.kind = "block";
                ast.val = "";
                lhs.children[1] = ast;
                ast = lhs;
            };
            // if(a) { b };
            if(lhs.isa("call:*()") && lhs.children[0].isa("id:if")) {
                lhs.kind = "branch";
                lhs.val = "cond";
                lhs.assertEqual(lhs.children.length, 2);
                lhs.children[0] = lhs.children[1];
                ast.children = ast.children.slice(1);
                ast.kind = "block";
                ast.val = "";
                lhs.children[1] = ast;
                ast = lhs;
            };
            // function(a, b) { c }; 
            if(lhs.isa("call:*()") && lhs.children[0].isa("id:function")) {
                ast.kind = "fn";
                ast.val = lhs.children.length - 1;
                ast.children = lhs.children.slice(1).concat(ast.children.slice(1));
            };
        };
        // else {{{4
        if(ast.isa("call:else")) {
            if(lhs.isa("branch:cond")) {
                if(rhs.isa("branch:cond")) {
                    ast.kind = "branch";
                    ast.val = "cond";
                    ast.children = lhs.children.concat(rhs.children);
                } else if(rhs.isa("call:*{}") && rhs.children[0].isa("id:")) {
                    rhs.kind = "block";
                    rhs.val = "";
                    rhs.children = rhs.children.slice(1);
                    ast.kind = "branch";
                    ast.val = "cond";
                    ast.children = lhs.children.concat([rhs]);
                };
            };
        };
        // method call {{{4
        if(ast.isa("call:*()")) {
            if(lhs.isa("call:.")) {
                ast.val = lhs.children[1].val;
                ast.children[0] = lhs.children[0];
            };
        };
        return ast;
    };
})();
// code analysis {{{1
analyse = undefined;
(function() {
    // outer: Number
    // outer: true
    // outer: undefined
    // outer: Object
    // outer: Ast
    var localVars;
    var localVar;
    var box;
    // outer: analyse
    // outer: Array
    var fns;
    // functions in post-order traversal
    fns = [];
    analyse = function(asts) {
        // outer: localVars
        // outer: box
        // outer: Object
        // outer: Ast
        var global;
        // outer: Array
        // outer: fns
        fns = [];
        global = Ast("fn:0");
        global.scope = {};
        global.children = asts;
        asts.forEach(function(elem) {
            // outer: global
            // outer: localVars
            localVars(elem, global);
        });
        fns.forEach(box);
        return asts;
    };
    box = function(fn) {
        // outer: localVar
        // outer: true
        // outer: undefined
        // outer: Object
        Object.keys(fn.scope).forEach(function(name) {
            // outer: localVar
            // outer: Object
            // outer: true
            // outer: undefined
            // outer: fn
            var t;
            t = fn.scope[name];
            if(t.argument) {
                return undefined;
            };
            if(!t.argument) {
                if(fn.parent && typeof fn.parent.scope[name] === "object" || !t.set) {
                    t.boxed = true;
                    Object.keys(t).forEach(function(key) {
                        // outer: t
                        // outer: name
                        // outer: fn
                        // outer: localVar
                        localVar(fn.parent, name)[key] = localVar(fn.parent, name)[key] || t[key];
                    });
                } else  {
                    t.local = true;
                    if(t.firstSet) {
                        t.firstSet.doTypeAnnotate = true;
                    };
                };
            };
        });
    };
    localVar = function(ast, name) {
        // outer: Object
        if(typeof ast.scope[name] !== "object") {
            ast.scope[name] = {};
        };
        return ast.scope[name];
    };
    localVars = function(ast, parent) {
        // outer: localVars
        // outer: true
        // outer: localVar
        // outer: fns
        // outer: Number
        var argc;
        // outer: undefined
        // outer: Object
        if(ast.kind === "compiletime") {
            ast.scope = {};
            ast.parent = undefined;
            parent = ast;
        };
        if(ast.kind === "fn") {
            ast.scope = {};
            ast.parent = parent;
            argc = Number(ast.val);
            ast.children.slice(0, argc).forEach(function(elem) {
                // outer: true
                // outer: localVar
                // outer: ast
                ast.assertEqual(elem.kind, "id");
                localVar(ast, elem.val).argument = true;
            });
            ast.children.slice(argc).forEach(function(elem) {
                // outer: ast
                // outer: localVars
                localVars(elem, ast);
            });
            fns.push(ast);
            return undefined;
        };
        if(ast.kind === "id") {
            localVar(parent, ast.val).get = true;
        } else if(ast.kind === "assign") {
            if(!localVar(parent, ast.val).set) {
                localVar(parent, ast.val).firstSet = ast;
            };
            localVar(parent, ast.val).set = true;
        };
        ast.children.forEach(function(elem) {
            // outer: parent
            // outer: localVars
            localVars(elem, parent);
        });
    };
})();
// ast2rst, ast2js {{{1
ast2js = undefined;
ast2rst = undefined;
(function() {
    // outer: runMacro
    // outer: Object
    // outer: Array
    // outer: true
    // outer: false
    // outer: require
    // outer: ast2rst
    var rstMacros;
    // outer: ast2js
    // outer: addMacro
    var jsMacros;
    var jsrstMacros;
    var macroJsAssign;
    var macroJsFn;
    var macroFlattenBlock;
    var macroLsAssign;
    var macroFnDef;
    var macroJsInfixIf;
    var macroJsWhile;
    var macroCond2IfElse;
    var macroJsCond2IfElse;
    var macroNew;
    var macroJsCallMethod;
    var macroPut2Assign;
    var macroLhsStr2Id;
    var fog;
    var unblock;
    var isValidId;
    var reserved;
    var num;
    var validIdSymbs;
    var jsoperator;
    var str2obj;
    // Utility / definitions {{{2
    str2obj = function(str) {
        // outer: require
        return require("./util").list2obj(str.split(" "));
    };
    jsoperator = "= === !== < <= > >= += -= *= /= ! | & ^ << >> ~ - + ++ -- * / ! % *() *[] typeof throw return".split(" ");
    validIdSymbs = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890_$";
    num = "1234567890";
    reserved = str2obj("break case catch continue debugger default delete do else finally for function if in instanceof new return switch this throw try typeof var void while with class enum export extends import super implements interface let package private protected public static yield");
    isValidId = function(str) {
        // outer: true
        // outer: validIdSymbs
        var i;
        // outer: num
        // outer: false
        // outer: reserved
        if(reserved[str]) {
            return false;
        };
        if(num.indexOf(str[0]) !== - 1) {
            return false;
        };
        i = str.length;
        while(i) {
            --i;
            if(validIdSymbs.indexOf(str[i]) === - 1) {
                return false;
            };
        };
        return true;
    };
    // Utility functions {{{2
    unblock = function(node) {
        // outer: Array
        if(node.kind === "block") {
            return node.children;
        } else  {
            return [node];
        };
    };
    fog = function(f, g) {
        return function(ast) {
            // outer: g
            // outer: f
            return f(g(ast) || ast) || ast;
        };
    };
    // Macros {{{2
    macroLhsStr2Id = function(ast) {
        // foo.'bar' -> foo.bar
        if(ast.children[1].kind === "str") {
            ast.children[1].kind = "id";
        };
    };
    macroPut2Assign = function(memberVal) {
        return function(ast) {
            // outer: memberVal
            var lhs;
            lhs = ast.create(memberVal, ast.children[0], ast.children[1]);
            ast.children.shift();
            ast.children[0] = lhs;
            ast.val = "=";
        };
    };
    macroJsCallMethod = function(ast) {
        var lhs;
        // outer: isValidId
        // foo.bar(), foo['x'](bar)
        if(isValidId(ast.val)) {
            lhs = ast.create("id:.", ast.create("id", ast.val));
        } else  {
            lhs = ast.create("id:*[]", ast.create("str", ast.val));
        };
        lhs.children.unshift(ast.children[0]);
        ast.children[0] = lhs;
        ast.val = "*()";
    };
    macroNew = function(ast) {
        // outer: isValidId
        var lhs;
        var rhs;
        // outer: Array
        var children;
        if(ast.children[0] && ast.children[0].isa("id:Array")) {
            ast.children = ast.children.slice(1);
            ast.val = "[";
        } else if(ast.children[0] && ast.children[0].isa("id:Object")) {
            children = [];
            while(ast.children.length > 1) {
                rhs = ast.children.pop();
                lhs = ast.children.pop();
                if(lhs.kind === "str" && isValidId(lhs.val)) {
                    lhs.kind = "id";
                };
                children.push(ast.create("id", ":", lhs, rhs));
            };
            ast.children = children.reverse();
            ast.val = "{";
        };
    };
    macroJsCond2IfElse = function(ast) {
        // outer: Array
        var truthvalue;
        var lhs;
        // outer: unblock
        var rhs;
        var children;
        children = ast.children;
        if(children.length & 1) {
            rhs = ast.create("id:*{}");
            rhs.children = unblock(children.pop());
            rhs.children.unshift(ast.create("id:"));
        };
        while(children.length) {
            lhs = ast.create("id:*{}");
            truthvalue = children.slice(- 2)[0];
            if(truthvalue.isa("compiletime:undefined") || truthvalue.isa("compiletime:false")) {
                children.pop();
                lhs.children = [];
            } else  {
                lhs.children = unblock(children.pop());
            };
            lhs.children.unshift(ast.create("id:*()", ast.create("id:if"), children.pop()));
            if(rhs) {
                rhs = ast.create("id:else", lhs, rhs);
            } else  {
                rhs = lhs;
            };
        };
        return rhs;
    };
    macroCond2IfElse = function(ast) {
        var lhs;
        // outer: unblock
        var rhs;
        var children;
        children = ast.children;
        if(children.length & 1) {
            rhs = ast.create("id:*{}");
            rhs.children = unblock(children.pop());
            rhs.children.unshift(ast.create("id:"));
        };
        while(children.length) {
            lhs = ast.create("id:*{}");
            lhs.children = unblock(children.pop());
            lhs.children.unshift(ast.create("id:*()", ast.create("id:if"), children.pop()));
            if(rhs) {
                rhs = ast.create("id:else", lhs, rhs);
            } else  {
                rhs = lhs;
            };
        };
        return rhs;
    };
    macroJsWhile = function(ast) {
        // outer: unblock
        ast.val = "*{}";
        ast.children[0] = ast.create("id:*()", ast.create("id:while"), ast.children[0]);
        ast.children = ast.children.concat(unblock(ast.children.pop()));
    };
    macroJsInfixIf = function(ast) {
        var rhs;
        rhs = ast.create("id", ":", ast.children[1], ast.children[2]);
        ast.children.pop();
        ast.children[1] = rhs;
        ast.val = "?";
    };
    macroFnDef = function(ast) {
        var lhs;
        var len;
        len = + ast.val;
        lhs = ast.create("id:*()", ast.create("id:function"));
        lhs.children = lhs.children.concat(ast.children.slice(0, len));
        ast.children = ast.children.slice(len);
        ast.children.unshift(lhs);
        ast.kind = "id";
        ast.val = "*{}";
    };
    macroLsAssign = function(ast) {
        var lhs;
        // =
        lhs = ast.create("id", ast.val);
        if(ast.doTypeAnnotate) {
            //lhs = ast.create('call', ':', lhs, ast.type || ast.create('id:Any'));
            lhs = ast.create("call", "var", lhs);
        };
        ast.children.unshift(lhs);
        ast.val = "=";
    };
    macroFlattenBlock = function(ast) {
        var extractBlocks;
        // outer: Array
        var children;
        children = [];
        extractBlocks = function(elem) {
            // outer: children
            // outer: extractBlocks
            if(elem.kind === "block") {
                elem.children.map(extractBlocks);
            } else  {
                children.push(elem);
            };
        };
        extractBlocks(ast);
        ast.children = children;
    };
    macroJsFn = function(ast) {
        // outer: Object
        var lhs;
        var len;
        len = + ast.val;
        lhs = ast.create("id:*()", ast.create("id:function"));
        lhs.children = lhs.children.concat(ast.children.slice(0, len));
        ast.children = ast.children.slice(len);
        //ast.children.unshift(ast.create('str', 'XXX' + JSON.stringify(ast.scope)));
        Object.keys(ast.scope).forEach(function(varName) {
            // outer: ast
            if(ast.scope[varName].local) {
                ast.children.unshift(ast.create("id:var", ast.create("id", varName)));
            } else if(!ast.scope[varName].argument) {
                ast.children.unshift(ast.create("note", "// outer: " + varName + "\n"));
            };
        });
        ast.children.unshift(lhs);
        ast.kind = "id";
        ast.val = "*{}";
    };
    macroJsAssign = function(ast) {
        var lhs;
        // =
        lhs = ast.create("id", ast.val);
        ast.children.unshift(lhs);
        ast.val = "=";
    };
    // ast2 js/rst common macros {{{2
    jsrstMacros = function() {
        // outer: macroFlattenBlock
        // outer: macroJsInfixIf
        // outer: macroJsWhile
        // outer: macroJsCallMethod
        // outer: jsoperator
        // outer: fog
        // outer: macroPut2Assign
        // outer: macroNew
        // outer: macroLhsStr2Id
        // outer: addMacro
        // outer: Object
        var macros;
        macros = {};
        addMacro(macros, "call:.", macroLhsStr2Id);
        addMacro(macros, "call:new", macroNew);
        addMacro(macros, "call:[]=", macroPut2Assign("id:*[]"));
        addMacro(macros, "call:.=", fog(macroPut2Assign("id:."), macroLhsStr2Id));
        jsoperator.forEach(function(operatorName) {
            // outer: macros
            // outer: addMacro
            //operators - do nothing
            addMacro(macros, "call:" + operatorName, function() {});
        });
        addMacro(macros, "call", macroJsCallMethod);
        addMacro(macros, "branch:while", macroJsWhile);
        addMacro(macros, "branch:?:", macroJsInfixIf);
        addMacro(macros, "block", macroFlattenBlock);
        return macros;
    };
    // ast2js {{{2
    jsMacros = jsrstMacros();
    addMacro(jsMacros, "branch:cond", macroJsCond2IfElse);
    addMacro(jsMacros, "fn", macroJsFn);
    addMacro(jsMacros, "assign", macroJsAssign);
    addMacro(jsMacros, "compiletime", function(ast) {
        // outer: Array
        ast.children = [];
    });
    ast2js = function(ast) {
        // outer: jsMacros
        // outer: runMacro
        // outer: ast2js
        ast.children = ast.children.map(ast2js);
        return runMacro(jsMacros, ast);
    };
    // ast2rst {{{2
    rstMacros = jsrstMacros();
    addMacro(rstMacros, "branch:cond", macroCond2IfElse);
    addMacro(rstMacros, "fn", macroFnDef);
    addMacro(rstMacros, "assign", macroLsAssign);
    addMacro(rstMacros, "compiletime", function(ast) {
        ast.val = "`";
    });
    ast2rst = function(ast) {
        // outer: rstMacros
        // outer: runMacro
        // outer: ast2rst
        ast.children = ast.children.map(ast2rst);
        return runMacro(rstMacros, ast);
    };
})();
});solsort_define("forloops",function(exports, require){//`compiler.macro("", function(ast) { console.log(ast); });
undefined;
undefined;
//`console.log(compiler.asts);
});solsort_define("massdrive",function(exports, require){(function() {
    // outer: document
    // outer: setTimeout
    // outer: console
    // outer: false
    // outer: true
    // outer: Math
    var mouseup;
    var mousemove;
    var mousedown;
    var mousemoves;
    var mouse;
    var prevTime;
    var gameloop;
    var collisiontest;
    var psize;
    var y0;
    var x0;
    // outer: Date
    var lastTime;
    var goals;
    var map;
    var mapData;
    var newParticle;
    var tiles;
    // outer: Object
    var player;
    // outer: Array
    var particles;
    // outer: undefined
    var h;
    var w;
    var ctx;
    var canvas;
    var V2d;
    // outer: exports
    // outer: require
    //require("./api").socket.emit("log", "in massdrive");
    require("./log").info("in massdrive");
    require("./log").warn("...warning...");
    require("./canvasapp");
    exports.init = function() {
        // outer: exports
        exports.run();
    };
    V2d = require("./v2d").V2d;
    canvas = ctx = w = h = undefined;
    particles = [];
    player = {
        p : new V2d(32, 32),
        v : new V2d(0, 0),
        a : new V2d(0, 0),
    };
    tiles = {};
    newParticle = function(p, v) {
        // outer: Object
        // outer: particles
        particles.push({
            p : p,
            v : v,
            life : 100,
        });
    };
    mapData = {};
    map = function(x, y) {
        // outer: false
        // outer: true
        // outer: Math
        // outer: Object
        // outer: mapData
        var data;
        data = mapData[(x & ~63) + "," + (y & ~63)];
        if(!data) {
            mapData[(x & ~63) + "," + (y & ~63)] = data = {filled : Math.random() < .1 ? true : false};
        };
        return data;
    };
    goals = [];
    (function() {
        // outer: false
        // outer: map
        // outer: goals
        // outer: V2d
        var goal;
        var y;
        // outer: Math
        var x;
        var i;
        i = 0;
        while(i < 5) {
            x = Math.random() * 20 - 10 | 0;
            y = Math.random() * 20 - 10 | 0;
            x = x * 64 + 32;
            y = y * 64 + 32;
            goal = new V2d(x, y);
            goal.id = i;
            goals.push(goal);
            map(x, y).filled = false;
            map(x, y).goal = goal;
            ++i;
        };
    })();
    lastTime = Date.now();
    x0 = y0 = 0;
    psize = 10;
    collisiontest = function() {
        // outer: undefined
        var goaltile;
        // outer: h
        // outer: w
        // outer: ctx
        // outer: V2d
        // outer: psize
        // outer: player
        // outer: map
        // outer: Array
        // outer: tiles
        // outer: particles
        particles.forEach(function(particle) {
            // outer: h
            // outer: w
            // outer: ctx
            // outer: psize
            // outer: player
            // outer: map
            if(map(particle.p.x, particle.p.y).filled) {
                particle.life = 0;
            };
            if(player.p.x - psize < particle.p.x && particle.p.x < player.p.x + psize) {
                if(player.p.y - psize < particle.p.y && particle.p.y < player.p.y + psize) {
                    ctx.fillStyle = "rgba(255,0,0," + particle.life * .005 + ")";
                    ctx.fillRect(0, 0, w, h);
                    particle.life = 0;
                };
            };
        });
        tiles = [];
        tiles.push(map(player.p.x + psize, player.p.y + psize));
        tiles.push(map(player.p.x + psize, player.p.y - psize));
        tiles.push(map(player.p.x - psize, player.p.y + psize));
        tiles.push(map(player.p.x - psize, player.p.y - psize));
        if(tiles[0].filled || tiles[1].filled || tiles[2].filled || tiles[3].filled) {
            player.p = player.p.sub(player.v);
            player.v = new V2d(0, 0);
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fillRect(0, 0, w, h);
        };
        goaltile = tiles[0].goal && tiles[0] || (tiles[1].goal && tiles[1]);
        goaltile = goaltile || (tiles[2].goal && tiles[2]) || (tiles[3].goal && tiles[3]);
        if(goaltile) {
            goaltile.goal = undefined;
        };
    };
    gameloop = function() {
        // outer: true
        // outer: map
        // outer: gameloop
        // outer: setTimeout
        // outer: Date
        // outer: prevTime
        // outer: collisiontest
        // outer: Object
        var particleLifeList;
        var y;
        var x;
        var ys;
        // outer: Array
        var xs;
        // outer: y0
        // outer: psize
        // outer: x0
        // outer: h
        // outer: w
        // outer: ctx
        // outer: V2d
        // outer: player
        var particle;
        // outer: particles
        // outer: Math
        // outer: console
        var i;
        // outer: mouse
        var shootright;
        var shootleft;
        var shootdown;
        var shootup;
        var shootblur;
        var shootpower;
        var shoot;
        //
        // world update
        // 
        shoot = function(x, y, vx, vy) {
            // outer: player
            // outer: particles
            // outer: Math
            // outer: V2d
            // outer: Object
            var newParticle;
            newParticle = {
                p : new V2d(x, y),
                v : new V2d(vx, vy),
                life : Math.random() * 100,
            };
            particles.push(newParticle);
            player.a = player.a.sub(newParticle.v.scale(newParticle.life * 0.001));
            newParticle.v = newParticle.v.add(player.v);
        };
        shootpower = function() {
            // outer: Math
            return 10 + Math.random() * 20;
        };
        shootblur = function() {
            // outer: Math
            return Math.random() * 8 - 4;
        };
        shootup = function() {
            // outer: shootpower
            // outer: shootblur
            // outer: psize
            // outer: player
            // outer: shoot
            shoot(player.p.x, player.p.y - psize, shootblur(), - shootpower());
        };
        shootdown = function() {
            // outer: shootpower
            // outer: shootblur
            // outer: psize
            // outer: player
            // outer: shoot
            shoot(player.p.x, player.p.y + psize, shootblur(), shootpower());
        };
        shootleft = function() {
            // outer: shootblur
            // outer: shootpower
            // outer: psize
            // outer: player
            // outer: shoot
            shoot(player.p.x - psize, player.p.y, - shootpower(), shootblur());
        };
        shootright = function() {
            // outer: shootblur
            // outer: shootpower
            // outer: psize
            // outer: player
            // outer: shoot
            shoot(player.p.x + psize, player.p.y, shootpower(), shootblur());
        };
        // handle player interaction
        if(mouse) {
            i = mouse.length() / 5 | 0 || 1;
            console.log(i);
            while(--i) {
                if(Math.random() * Math.abs(mouse.x) > Math.random() * Math.abs(mouse.y)) {
                    if(mouse.x > 0) {
                        shootleft();
                    } else  {
                        shootright();
                    };
                } else  {
                    if(mouse.y > 0) {
                        shootup();
                    } else  {
                        shootdown();
                    };
                };
            };
        };
        // update life and position of particles
        i = particles.length;
        while(particle = particles[--i]) {
            if(particle.life < 0) {
                particles[i] = particles.pop();
            } else  {
                particle.life -= 1;
                particle.p = particle.p.add(particle.v);
                particle.v = particle.v.scale(0.95);
            };
        };
        // update player
        player.v = player.v.add(player.a);
        player.v = player.v.scale(0.95);
        player.p = player.p.add(player.v);
        player.a = new V2d(0, 0);
        //
        // Draw loop
        // 
        // clear world
        ctx.fillStyle = "#000";
        ctx.fillStyle = "rgba(0,0,0,0.9)";
        ctx.fillRect(0, 0, w, h);
        x0 = w / 2 - player.p.x - psize;
        y0 = h / 2 - player.p.y - psize;
        // draw grid
        ctx.fillStyle = "#888";
        xs = [];
        ys = [];
        x = - 63;
        while(x < w) {
            if(!(x - x0 & 63)) {
                xs.push(x - x0 | 0);
                //     ctx.fillRect(x,0,1,h); 
            };
            ++x;
        };
        y = - 63;
        while(y < h) {
            if(!(y - y0 & 63)) {
                ys.push(y - y0 | 0);
                //     ctx.fillRect(0,y,w,1); 
            };
            ++y;
        };
        ctx.shadowBlur = 0;
        // draw particles
        particleLifeList = {};
        particles.forEach(function(particle) {
            // outer: Array
            // outer: particleLifeList
            var list;
            if(particle.life > 0) {
                list = particleLifeList[particle.life | 0];
                if(!list) {
                    particleLifeList[particle.life | 0] = list = [];
                };
                list.push(particle);
            };
        });
        Object.keys(particleLifeList).forEach(function(key) {
            // outer: y0
            // outer: x0
            // outer: ctx
            // outer: particleLifeList
            var list;
            list = particleLifeList[key];
            ctx;
            ctx.fillStyle = "rgba(255,0,0," + (list[0].life | 0) / 100 + ")";
            list.forEach(function(particle) {
                // outer: y0
                // outer: x0
                // outer: ctx
                ctx.fillRect((x0 + particle.p.x | 0) + .5, (y0 + particle.p.y | 0) + .5, 3, 3);
            });
        });
        xs.forEach(function(x) {
            // outer: true
            // outer: Math
            // outer: y0
            // outer: x0
            // outer: ctx
            // outer: map
            // outer: ys
            ys.forEach(function(y) {
                // outer: true
                // outer: Math
                // outer: y0
                // outer: x0
                // outer: ctx
                // outer: x
                // outer: map
                var tile;
                tile = map(x, y);
                if(tile.filled) {
                    ctx.fillStyle = "#ccc";
                    ctx.fillRect(x0 + x + 1 | 0, y0 + y + 1 | 0, 63, 63);
                };
                if(tile.goal) {
                    ctx.fillStyle = "#040";
                    ctx.beginPath();
                    ctx.arc(x0 + x + 32.5 | 0, y0 + y + 32.5 | 0, 24, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#cfc";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.font = "32px sans-serif";
                    ctx.shadowBlur = 16;
                    ctx.shadowColor = "#fff";
                    ctx.fillText(tile.goal.id, x0 + x + 32.5 | 0, y0 + y + 32.5 | 0);
                    ctx.shadowBlur = 0;
                };
            });
        });
        // draw player
        ctx.fillStyle = "#66f";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 2;
        ctx.shadowColor = "#fff";
        ctx.fillRect(x0 + player.p.x - psize, y0 + player.p.y - psize, 2 * psize + 1, 2 * psize + 1);
        ctx.shadowBlur = 0;
        // collision handling
        collisiontest();
        // timing
        //console.log(Date.now() - prevTime, mousex, mousey);
        prevTime = Date.now();
        setTimeout(gameloop, 40);
    };
    prevTime = Date.now();
    mouse = undefined;
    mousemoves = [];
    mousedown = function(x, y) {
        // outer: undefined
        // outer: mouse
        var mousetime;
        // outer: Date
        // outer: V2d
        // outer: Array
        // outer: mousemoves
        mousemoves = [new V2d(x, y)];
        mousemoves[0].time = Date.now();
        mousetime = Date.now();
        mouse = undefined;
    };
    mousemove = function(x, y) {
        // outer: mouse
        // outer: V2d
        var cursor;
        // outer: Date
        var now;
        var i;
        // outer: mousemoves
        if(mousemoves.length) {
            i = 0;
            now = Date.now();
            while(mousemoves[i] && mousemoves[i].time < now - 200) {
                ++i;
            };
            i -= 2;
            if(i) {
                mousemoves = mousemoves.slice(i);
            };
            cursor = new V2d(x, y);
            cursor.time = now;
            mousemoves.push(cursor);
            mouse = new V2d(x, y).sub(mousemoves[0]);
        };
    };
    mouseup = function() {
        // outer: undefined
        // outer: mouse
        // outer: Array
        // outer: mousemoves
        mousemoves = [];
        mouse = undefined;
    };
    exports.run = function() {
        // outer: mouseup
        // outer: mousemove
        // outer: mousedown
        // outer: gameloop
        // outer: w
        // outer: h
        // outer: ctx
        // outer: false
        // outer: document
        // outer: canvas
        // outer: undefined
        // outer: mouse
        mouse = undefined;
        canvas = document.getElementById("canvas");
        canvas.onmousedown = function(e) {
            // outer: mousedown
            mousedown(e.clientX, e.clientY);
        };
        canvas.onmouseup = function(e) {
            // outer: mouseup
            // outer: mousemove
            mousemove(e.clientX, e.clientY);
            mouseup();
        };
        canvas.onmouseout = function(e) {
            // outer: mouseup
            mouseup();
        };
        canvas.onmousemove = function(e) {
            // outer: mousemove
            mousemove(e.clientX, e.clientY);
        };
        canvas.addEventListener("touchstart", function(e) {
            // outer: mousedown
            mousedown(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
        }, false);
        canvas.addEventListener("touchmove", function(e) {
            // outer: mousemove
            mousemove(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
        }, false);
        canvas.addEventListener("touchend", function(e) {
            // outer: mouseup
            mouseup();
            e.preventDefault();
        }, false);
        ctx = canvas.getContext("2d");
        h = ctx.height = canvas.height = canvas.offsetHeight;
        w = ctx.width = canvas.width = canvas.offsetWidth;
        gameloop();
    };
})();
});solsort_define("util",function(exports, require){util = exports;
// Basic platform/language {{{1
// try-catch
exports.trycatch = Function("return function trycatch(fn,handle){try{return fn();}catch(e){return handle(e);}}")();
// delprop
exports.delprop = Function("return function delprop(obj,key){delete obj[key]}")();
// extend
exports.extend = function(a, b) {
    // outer: Object
    Object.keys(b).forEach(function(key) {
        // outer: b
        // outer: a
        a[key] = b[key];
    });
    return a;
};
// nextTick
if(undefined) {} else if(true) {
    exports.nextTick = function(f) {
        // outer: setTimeout
        setTimeout(f, 0);
    };
} else if(undefined) {};
// throttle function {{{1
// ## Throttle a function {{{2
exports.throttledFn = function(fn, delay) {
    // outer: Date
    // outer: Math
    // outer: setTimeout
    // outer: true
    // outer: this
    // outer: ;
    // outer: Array
    var callbacks;
    // outer: false
    var scheduled;
    var lastRun;
    delay = delay || 5000;
    lastRun = 0;
    scheduled = false;
    callbacks = [];
    return function(callback) {
        // outer: fn
        // outer: Array
        // outer: false
        // outer: lastRun
        // outer: Date
        // outer: delay
        // outer: Math
        // outer: setTimeout
        // outer: true
        var run;
        // outer: this
        var self;
        // outer: ;
        // outer: scheduled
        // outer: callbacks
        if(callback) {
            callbacks.push(callback);
        };
        if(scheduled) {
            return ;
        };
        self = this;
        run = function() {
            // outer: self
            // outer: fn
            // outer: Date
            // outer: lastRun
            // outer: Array
            // outer: callbacks
            // outer: false
            // outer: scheduled
            scheduled = false;
            callbacks = [];
            lastRun = Date.now();
            fn.call(self, function() {
                // outer: callbacks
                callbacks.forEach(function(f) {
                    f();
                });
            });
        };
        scheduled = true;
        setTimeout(run, Math.max(0, delay - (Date.now() - lastRun)));
    };
};
// List utils {{{1
// list-prettyprint
exports.listpp = function(list, indent) {
    // outer: exports
    var len;
    var result;
    indent = indent || "  ";
    if(typeof list === "string") {
        return list;
    };
    result = list.map(function(elem) {
        // outer: indent
        // outer: exports
        return exports.listpp(elem, indent + "  ");
    });
    len = 0;
    result.forEach(function(elem) {
        // outer: len
        len += elem.length + 1;
    });
    if(len < 72) {
        return "[" + result.join(" ") + "]";
    } else  {
        return "[" + result.join("\n" + indent) + "]";
    };
};
// list to object
exports.list2obj = function(arr) {
    // outer: true
    // outer: Object
    var result;
    result = {};
    arr.forEach(function(elem) {
        // outer: true
        // outer: result
        result[elem] = true;
    });
    return result;
};
// async {{{3
exports.aForEach = function(arr, fn, done) {
    var cb;
    var count;
    count = arr.length;
    cb = function() {
        // outer: done
        // outer: count
        if(count === 0) {
            done();
        };
        --count;
    };
    cb();
    arr.forEach(function(key) {
        // outer: cb
        // outer: fn
        fn(key, cb);
    });
};
// uri/string-escape {{{1
// transform to urlsafe string
exports.name2url = function(name) {
    // outer: Object
    // outer: RegExp
    return name.replace(RegExp("[^a-zA-Z0-9_-]", "g"), function(c) {
        // outer: Object
        var subs;
        subs = {
            "Æ" : "AE",
            "Ø" : "O",
            "Å" : "AA",
            "æ" : "ae",
            "ø" : "o",
            "å" : "aa",
            "é" : "e",
            "?" : "",
            ":" : "",
            " " : "_",
        };
        if(typeof subs[c] === "string") {
            return "_";
        } else  {
            return subs[c];
        };
    });
};
// local storage {{{1
if(undefined) {} else if(typeof localStorage !== "undefined") {
    exports.local = {set : function(key, val) {
        // outer: localStorage
        localStorage.setItem(key, val);
    }, get : function(key) {
        // outer: localStorage
        localStorage.getItem(key);
    }};
};
// runonce {{{1
util.runonce = function(fn) {
    // outer: false
    // outer: arguments
    // outer: Array
    // outer: this
    // outer: true
    var execute;
    execute = true;
    return function() {
        // outer: false
        // outer: arguments
        // outer: Array
        // outer: this
        // outer: fn
        // outer: execute
        if(execute) {
            fn.apply(this, Array.prototype.slice.call(arguments, 0));
            execute = false;
        };
    };
};
// flatteArray {{{1
util.flattenArray = function(arr) {
    var flatten;
    // outer: Array
    var acc;
    acc = [];
    flatten = function(arr) {
        // outer: acc
        // outer: flatten
        // outer: Array
        if(Array.isArray(arr)) {
            arr.forEach(flatten);
        } else  {
            acc.push(arr);
        };
    };
    flatten(arr);
    return acc;
};
// valmap {{{1
util.valmap = function(obj, fn) {
    // outer: Object
    var result;
    result = {};
    Object.keys(obj).forEach(function(key) {
        // outer: obj
        // outer: fn
        // outer: result
        result[key] = fn(obj[key]);
    });
    return result;
};
// mkdir,cp {{{1
if(undefined) {};
});solsort_require("./main");