/**
 *  HDRezka plugin for Movian
 *
 *  Copyright (C) 2014-2018 Buksa
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
//ver 2.3.13
var plugin = JSON.parse(Plugin.manifest);
var PREFIX = plugin.id;
var LOGO = Plugin.path + plugin.icon;
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36 OPR/60.0.3255.84";

var CryptoJS = require("crypto-js/crypto-js");

var page = require("movian/page");
var service = require("movian/service");
var settings = require("movian/settings");
var io = require("native/io");
var prop = require("movian/prop");
var popup = require("native/popup");
var http = require("movian/http");
var html = require("movian/html");

var log = require("./src/log");
var browse = require("./src/browse");
var api = require("./src/api");
var urls = require("url");

var tos = "The developer has no affiliation with the sites what so ever.\n";
tos += "Nor does he receive money or any other kind of benefits for them.\n\n";
tos += "The software is intended solely for educational and testing purposes,\n";
tos += "and while it may allow the user to create copies of legitimately acquired\n";
tos += "and/or owned content, it is required that such user actions must comply\n";
tos += "with local, federal and country legislation.\n\n";
tos += "Furthermore, the author of this software, its partners and associates\n";
tos += "shall assume NO responsibility, legal or otherwise implied, for any misuse\n";
tos += "of, or for any loss that may occur while using plugin.\n\n";
tos += "You are solely responsible for complying with the applicable laws in your\n";
tos += "country and you must cease using this software should your actions during\n";
tos += "plugin operation lead to or may lead to infringement or violation of the\n";
tos += "rights of the respective content copyright holders.\n\n";
tos += "plugin is not licensed, approved or endorsed by any online resource\n ";
tos += "proprietary. Do you accept this terms?";

io.httpInspectorCreate('http.*moonwalk.cc.*', function (ctrl) {
    ctrl.setHeader('User-Agent', UA);
    return 0;
});
io.httpInspectorCreate("http.*video/[a-f0-9]{16}/.*", function (ctrl) {
    ctrl.setHeader('User-Agent', UA);
    return 0;
});
// https://streamguard.cc
io.httpInspectorCreate('http.*streamguard.cc.*', function (ctrl) {
    ctrl.setHeader('User-Agent', UA);
    return 0;
});

//Content-Type: application/x-mpegURL
io.httpInspectorCreate("http.*.m3u8", function (ctrl) {
    ctrl.setHeader('Content-Type', 'application/x-mpegURL');
    return 0;
});

// Create the service (ie, icon on home screen)
service.create(plugin.title, PREFIX + ":start", "video", true, LOGO);
settings.globalSettings(plugin.id, plugin.title, LOGO, plugin.synopsis);
settings.createInfo("info", LOGO, "Plugin developed by " + plugin.author);
settings.createDivider("Settings:");
settings.createBool("tosaccepted", "Accepted TOS (available in opening the plugin)", false, function (v) {
    service.tosaccepted = v;
});
settings.createString("domain", "\u0414\u043e\u043c\u0435\u043d", "https://rezka.ag", function (v) {
    service.domain = v;
});
settings.createBool("debug", "Debug", false, function (v) {
    service.debug = v;
});
settings.createBool("Show_META", "Show more info from thetvdb", true, function (v) {
    service.tvdb = v;
});
settings.createBool("cp", "Continuous play", false, function (v) {
    service.cp = v;
});

var result = "",
    referer = service.domain,
    data = {},
    BASE_URL = service.domain;
//
new page.Route(PREFIX + ":list:(.*):(.*)", function (page, href, title) {
    browse.list(page, {
        href: href,
        title: title
    });
});
//
new page.Route(PREFIX + ":updates:(.*):(.*)", function (page, href, title) {
    browse.updates(page, {
        href: href,
        title: title
    });
});

//
new page.Route(PREFIX + ":moviepage:(.*)", function (page, data) {
    browse.moviepage(page, data);
});
//
new page.Route(PREFIX + ":SEASON:(.*)", function (page, data) {
    browse.season(page, data);
});
//
new page.Route(PREFIX + ":play:(.*)", function (page, data) {
    var canonicalUrl = PREFIX + ":play:" + data;
    page.loading = true;
    page.type = "video";
    data = JSON.parse(data);
    log.d(data);

    var videoparams = {
        canonicalUrl: canonicalUrl,
        no_fs_scan: true,
        icon: data.icon,
        title: data.title,
        year: data.year ? data.year : 0,
        season: data.season ? data.season : -1,
        episode: data.episode ? data.episode : -1,
        sources: [{
            url: []
        }],
        subtitles: []
    };

    referer = service.domain;
    api.call(page, data.url, null, function (pageHtml) {
        //resp = document.body.innerHTML
        resp = pageHtml.text.toString();
        //https://regex101.com/r/3BPUoK/1/
        VideoBalancer = /video_balancer_options([^\;]+})/.exec(resp)[1];
        eval('options' + VideoBalancer);
        //url = (options.proto + options.host + /script src="([^"]+)/.exec(resp)[1]);
        url = (options.proto + options.host + /script src=".*?(\/assets\/[^"]+)/.exec(resp)[1]);
        // Получение ссылки на js-скрипт, где есть список параметров POST запроса
        var jsscript = http.request(url, {
            method: 'GET',
            headers: {
                'Host': 'streamguard.cc',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': 1,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'ru,en-US;q=0.9,en;q=0.8,zh;q=0.7'
            },
            debug: 1,
            noFail: true, // Don't throw on HTTP errors (400- status code)
        }, null).toString();
        //https://regex101.com/r/Ic2EZp/1
        //jsscript = document.getElementsByTagName('pre')[0].textContent
        //console.log(jsscript.toString())

        var e = [],
            n = [];
        e._mw_adb = false;

        //getVideoManifests = /Yjc50Dg2NmZlZQ.*?\{([\s\S]+?;)\w+.done/g.exec(jsscript);
        getVideoManifests = /userAgent.*?function.*?\{([\s\S]+?;)\w+.done/g.exec(jsscript);
        //getVideoManifests = /\(\)\{(var n=\{[\s\S]+?)\w+.done/g.exec(jsscript);            
        getVideoManifests = getVideoManifests[1];
        getVideoManifests = getVideoManifests.replace('t.ajax', 'log.d');
        getVideoManifests = getVideoManifests.replace('navigator.userAgent', 'UA');
        try {
            eval(getVideoManifests.toString());
        } catch (e) {
            log.d(e.stack);
            log.d(e.fileName, e.lineNumber);
        }
        // log.d(i);
        // log.d(r);
        // log.d(a);
        // log.d(l);
        // log.d(c.toString());
        // log.d(u.toString())
        log.d(eval('postdata=' + /data:({.*?)\,dataType/g.exec(jsscript)[1]));
        headers = {
            //"Origin": "http://moonwalk.cc",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "ru,en-US;q=0.9,en;q=0.8,zh;q=0.7",
            "User-Agent": UA,
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Referer": decodeURIComponent(options.ref_url),
            "X-Requested-With": "XMLHttpRequest",
        }
        //eval(header)
        post = {
            debug: service.debug,
            headers: headers,
            postdata: postdata//{
            //      //q: l.toString(),
            //      q:u.toString(),
            //      ref: options.ref
            //  }
        };
        log.d('::::::::::::::::::::::::::::')
        log.d(options.proto + options.host + '/vs');
        log.d({
            post: post
        });
        log.d(options.proto + options.host + '/vs');
        log.d('::::::::::::::::::::::::::::');
        var responseText = http.request(options.proto + options.host + '/vs', post).toString();
        log.d('manifesty')
        log.d(JSON.parse(responseText));

        manifest_m3u8 = JSON.parse(responseText).m3u8;
        manifest_mp4 = JSON.parse(responseText).mp4;
        videoparams.sources = [{
            url: "hls:" + manifest_m3u8
        }];
        
        video = "videoparams:" + JSON.stringify(videoparams);
        if (service.cp) {
            page.type = "video";
            page.source = video;
        } else {
            page.type = "directory";
            page.appendItem("search:" + data.title, "directory", {
                title: "найти " + data.title
            });

            page.appendItem(video, "video", {
                title: "[Auto]" + " | " + data.title,
                icon: data.icon
            });

            // //m3u8 HLS
            try {
                if (null != manifest_m3u8) {
                    var video_urls = http.request(manifest_m3u8, {
                        header: {
                            "User-Agent": UA
                        }
                    }).toString();
                    var myRe = /RESOLUTION=([^,]+)[\s\S]+?(http.*)/g;
                    var myArray, i = 0;
                    while ((myArray = myRe.exec(video_urls)) !== null) {
                        videoparams.sources = [{
                            url: "hls:" + myArray[2]
                        }];
                        video = "videoparams:" + JSON.stringify(videoparams);
                        log.d(video);
                        log.d(videoparams.canonicalUrl == (PREFIX + ":play:" + JSON.stringify(data)));
                        log.d(data)

                        page.appendItem(video, "video", {
                            title: "[" + myArray[1] + "]" + " | " + data.title,
                            icon: data.icon
                        });
                        i++;
                    };
                }
            } catch (error) {
                log.e('oshibka pri vyvode variantov m3u8');
                log.e(error.stack);
            }
            // //MP4
            try {
                if (null != manifest_mp4) {
                    var video_urls = http.request(manifest_mp4, {
                        header: {
                            "User-Agent": UA
                        }
                    }).toString()
                    log.p(video_urls = (JSON.parse(video_urls)));                    
                    for (key in video_urls) {
                        videoparams.sources = [{
                            url: video_urls[key]
                        }];
                        video = "videoparams:" + JSON.stringify(videoparams);
                        page.appendItem(video, "video", {
                            title: "[" + key + "-MP4]" + " | " + data.title,
                            icon: data.icon
                        });
                    }
                }
            } catch (error) {
                log.d('oshibks v MP4');
                log.d(error.stack);
            }

            // null != this.options.subtitles && (r = [], null != this.options.subtitles.master_vtt && r.push({
            //     on_start: !0,
            //     srclang: "ru",
            //     label: "Russian",
            //     src: this.options.subtitles.master_vtt
            // }), null != this.options.subtitles.slave_vtt && r.push({
            //     srclang: "en",
            //     label: "English",
            //     src: this.options.subtitles.slave_vtt
            // }));

        };
    });
});


new page.Route(PREFIX + ":search:(.*)", function (page, query) {
    page.metadata.icon = LOGO;
    page.metadata.title = "Search results for: " + query + page.entries;
    page.type = 'directory';
    //http://getmovie.cc/query/tron
    //index.php?do=search&subaction=search&search_start=1&full_search=1&result_from=1&story=lost&titleonly=3&showposts=0
    browse.searcher(page, {
        href: "/?do=search&subaction=search&q=" + encodeURIComponent(query),
        title: PREFIX + " - " + query
    });
});
//
page.Searcher(PREFIX + " - Result", LOGO, function (page, query) {
    page.metadata.icon = LOGO;

    page.entries = 0;
    browse.searcher(page, {
        href: "/?do=search&subaction=search&q=" + encodeURIComponent(query),
        title: PREFIX + " - " + query
    });
});
// Landing page
new page.Route(PREFIX + ":start", function (page) {
    if (!service.tosaccepted) {
        if (popup.message(tos, true, true)) {
            service.tosaccepted = 1;
        } else {
            page.error("TOS not accepted. plugin disabled");
            return;
        }
    }
    page.type = "directory";
    page.metadata.title = PREFIX;
    page.metadata.icon = LOGO;
    page.appendItem(PREFIX + ":search:", "search", {
        title: "Search " + PREFIX
    });
    //     navmenu = document.getElementById("topnav-menu")
    //     for (i = 0;  i < navmenu.children.length; i++){
    //         e = navmenu.children[i]
    //         href = e.getElementsByClassName("b-topnav__item-link")[0].attributes[1].textContent;
    //         title = e.getElementsByClassName("b-topnav__item-link")[0].textContent.trim();
    //        console.log('page.appendItem(PREFIX + ":list:'+href+':'+title+'", "directory", { title: "'+title+'"});')
    //   }
    page.appendItem(PREFIX + ":updates:/:Горячие обновления сериалов", "directory", {
        title: "Горячие обновления сериалов"
    });
    page.appendItem(PREFIX + ":list:/new/:Новинки", "directory", {
        title: "Новинки"
    });
    page.appendItem(PREFIX + ":list:/announce/:Анонсы", "directory", {
        title: "Анонсы"
    });
    page.appendItem(PREFIX + ":list:/films/:Фильмы", "directory", {
        title: "Фильмы"
    });
    page.appendItem(PREFIX + ":list:/series/:Сериалы", "directory", {
        title: "Сериалы"
    });
    page.appendItem(PREFIX + ":list:/animation/:Аниме", "directory", {
        title: "Аниме"
    });
    page.appendItem(PREFIX + ":list:/cartoons/:Мультфильмы", "directory", {
        title: "Мультфильмы"
    });
    page.appendItem(PREFIX + ":list:/show/:Передачи и шоу", "directory", {
        title: "Передачи и шоу"
    });
    // page.appendItem(PREFIX + ":list:/collections/:Подборки", "directory", {
    //     title: "Подборки"
    // });
});

function d(sBase64) {
    return String(Duktape.dec('base64', sBase64));
};

function parser(a, c, e) {
    var d = "",
        b = a.indexOf(c);
    0 < b && ((a = a.substr(b + c.length)), (b = a.indexOf(e)), 0 < b && (d = a.substr(0, b)));
    return d;
}