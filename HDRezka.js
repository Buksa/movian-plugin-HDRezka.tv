//ver 0.6.8
var plugin = JSON.parse(Plugin.manifest);

var PREFIX = plugin.id;
var BASE_URL = "http://hdrezka.me";
var LOGO = Plugin.path + "logo.png";

var service = require("showtime/service");
var settings = require("showtime/settings");
var page = require("showtime/page");
var http = require("showtime/http");
var html = require("showtime/html");
var io = require("native/io");
var popup = require("native/popup");

var UA = 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36';


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

service.create(plugin.title, PREFIX + ":start", "video", true, LOGO);

settings.globalSettings(plugin.id, plugin.title, LOGO, plugin.synopsis);
settings.createInfo("info", LOGO, "Plugin developed by " + plugin.author + ". \n");
settings.createDivider("Settings:");
settings.createBool("tosaccepted", "Accepted TOS (available in opening the plugin):", false, function(v) {
    service.tosaccepted = v;
});
settings.createBool("thetvdb", "Show more information using thetvdb", false, function(v) {
    service.thetvdb = v;
});
settings.createBool("debug", "Debug", false, function(v) {
    service.debug = v;
});

var blue = "6699CC",
    orange = "FFA500";

io.httpInspectorCreate('http.*hdrezka.me.*', function(req) {
    req.setHeader('User-Agent', UA);
    req.setHeader("Accept-Encoding", "gzip, deflate");
});

new page.Route(PREFIX + ":start", start);
new page.Route(PREFIX + ":index:(.*):(.*)", index);
new page.Route(PREFIX + ":mediaInfo:(http.*):(.*)", mediaInfo);
new page.Route(PREFIX + ":select:(.*)", select);
new page.Route(PREFIX + ":sort:(.*)", sort);
new page.Route(PREFIX + ":play:(.*)", play);
new page.Route(PREFIX + ":SEASON:(.*)", SEASON);
page.Searcher(PREFIX + " - Videos", plugin.path + "logo.png", searcher);



var resp, dom, id, cover;

function start(page) {
    page.metadata.logo = LOGO;
    page.metadata.title = PREFIX;
    if (!service.tosaccepted) {
        if (popup.message(tos, true, true)) {
            service.tosaccepted = 1;
        } else {
            page.error("TOS not accepted. plugin disabled");
            return;
        }
    }
    page.model.contents = 'grid';
    start_block(page, "/films/", "\u0424\u0438\u043b\u044c\u043c\u044b");
    start_block(page, "/series/", "\u0421\u0435\u0440\u0438\u0430\u043b\u044b");
    start_block(page, "/cartoons/", "\u041c\u0443\u043b\u044c\u0442\u0444\u0438\u043b\u044c\u043c\u044b");
    page.type = "directory";
    page.loading = false;
}

function start_block(page, href, title) {
    page.appendItem("", "separator", {
        title: title
    });
    resp = http.request(BASE_URL + href, {
        headers: {
            'User-Agent': UA
        },
        debug: service.debug
    })
        .toString();
    //dom = html.parse(v);
    var myRe = /data-url="(http:\/\/hdrezka.me.+?)"[\S\s]+?<img src="([^"]+)[\S\s]+?item-link[\S\s]+?">([^<]+)[\S\s]+?<div>(.+?)<\/div>/g;
    var myArray;
    i = 0;
    while ((myArray = myRe.exec(resp)) !== null && i <= 7) {
        page.appendItem(PREFIX + ":mediaInfo:" + myArray[1] + ':null', "video", {
            title: myArray[3],
            description: myArray[4],
            icon: BASE_URL + myArray[2],
            year: +match(/([0-9]+(?:\.[0-9]*)?)/, myArray[4], 1)
        });
        i++;
    }
    page.appendItem(PREFIX + ":sort:" + href, "directory", {
        title: "\u0414\u0430\u043b\u044c\u0448\u0435 \u0431\u043e\u043b\u044c\u0448\u0435" + " \u25ba",
    });
    page.appendItem(PREFIX + ":select:" + href, "directory", {
        title: "\u0416\u0430\u043d\u0440\u044b \u0438 \u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438" + " \u25ba"
    });
}

function sort(page, href) {
    page.metadata.title = PREFIX + " | " + "\u0421\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u043e:";
    page.appendItem(PREFIX + ":index:" + href + ":" + "last", "directory", {
        title: "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u043f\u043e\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u044f",
        description: "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u043f\u043e\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u044f",
        icon: LOGO
    });
    page.appendItem(PREFIX + ":index:" + href + ":" + "popular", "directory", {
        title: "\u041f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u044b\u0435",
        description: "\u041f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u044b\u0435",
        icon: LOGO
    });
    page.appendItem(PREFIX + ":index:" + href + ":" + "watching", "directory", {
        title: "\u0421\u0435\u0439\u0447\u0430\u0441 \u0441\u043c\u043e\u0442\u0440\u044f\u0442",
        description: "\u0421\u0435\u0439\u0447\u0430\u0441 \u0441\u043c\u043e\u0442\u0440\u044f\u0442",
        icon: LOGO
    });
    page.type = "directory";
    page.loading = false;
    page.metadata.logo = LOGO;
}

function index(page, href, filter) {


    var urlData, offset;
    offset = 1;
    page.metadata.logo = LOGO;
    resp = http.request(BASE_URL + href, {
        args: {
            'filter': filter
        },
        debug: service.debug
    }).toString();
    p(BASE_URL + href + '?filter=' + filter)
    var dom = html.parse(resp);
    page.metadata.title = PREFIX + " | " + dom.root.getElementByTagName("title")[0].textContent.replace("\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c ", "")
        .replace(" \u0432 720p hd", ".");
    page.appendItem(PREFIX + ":select:" + href, "directory", {
        title: "\u0441\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u043e : " + dom.root.getElementByClassName("b-content__main_filters_link active")[0].textContent
    });

    function loader() {
        p("loader start");
        //page.haveMore(false);
        setTimeout(function() {
            p(BASE_URL + href + "page/" + offset + "/");
            urlData = http.request(BASE_URL + href + "page/" + offset + "/", {
                method: "GET",
                debug: service.debug,
                noFail: true,
                args: {
                    filter: filter
                },
                headers: {
                    'User-Agent': UA
                }
            });
            if (urlData.statuscode === 404) {
                page.haveMore(false);
                p("loader stop");
                return;
            }
            getTitles(urlData, function(titleList) {
                for (var i = 0; i < titleList.length; i++) {
                    item = titleList[i];
                    page.appendItem(PREFIX + ":mediaInfo:" + item.url + ":" + null, "video", {
                        title: item.title,
                        year: parseInt(item.year, 10),
                        rating: parseInt(item.rating, 10),
                        genre: item.genre,
                        description: item.description ? item.description : item.title,
                        icon: item.icon
                    });
                }
            });
            offset++;
            page.haveMore(true);
            p("loader stop");
        }, 2E3);
    }
    //page.paginator = loader;
    loader();
    page.asyncPaginator = loader;
    page.type = "directory";
    page.loading = false;
}

function getTitles(response, callback) {
    var returnValue = [];
    if (response.statuscode === 200) {
        p(response.statuscode);
        var dom = html.parse(response.toString());
        var elements = dom.root.getElementByClassName("b-content__inline_item");
        for (i = 0; i < elements.length; i++) {
            element = elements[i];
            returnValue.push({
                url: element.attributes.getNamedItem("data-url")
                    .value,
                id: element.attributes.getNamedItem("data-id")
                    .value,
                icon: BASE_URL + element.getElementByTagName("img")[0].attributes.getNamedItem("src")
                    .value,
                title: element.getElementByClassName("b-content__inline_item-link")[0].getElementByTagName("a")[0].textContent,
                year: +element.getElementByClassName("b-content__inline_item-link")[0].children[1].textContent.match(/^\d+/),
                description: element.getElementByClassName("b-content__inline_item-link")[0].children[1].textContent
            });
        }
    }
    p(dump(returnValue))
    if (callback) {
        callback(returnValue);
    }
    return returnValue;
}

function SEASON(page, data) {
    data = JSON.parse(unescape(data));
    p(dump(data));
    var v = http.request(data.url + "?season=" + data.season, {
        debug: service.debug,
        method: "GET",
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.2.6) Gecko/20100627 Firefox/3.6.6",
            "Referer": data.Referer

        }
    })
        .toString();
    dom = html.parse(v);
    season = dom.root.getElementById("season");
    episode = dom.root.getElementById("episode");
    iframe = data.url;
    p("count episode: " + episode.children.length);
    for (i = 0; i < episode.children.length; i++) {
        data.url = iframe + "?season=" + data.season + "&episode=" + episode.children[i].attributes.getNamedItem("value")
            .value;
        data.series = {
            season: +data.season,
            episode: +episode.children[i].attributes.getNamedItem("value")
                .value
        };
        p(dump(data));
        page.appendItem(PREFIX + ":play:" + escape(JSON.stringify(data)), "video", {
            title: episode.children[i].textContent + " | " + season.children[data.season - 1].textContent + " | " + data.title,
            icon: cover
        });
    }
    page.metadata.title = data.title + "|" + season.children[data.season - 1].textContent;
    page.type = "directory";
    page.loading = false;
}

function mediaInfo(page, link, perevod) {
    var resp = http.request(link, {
        debug: service.debug
    });
    p(link)
    p("perevod" + perevod);
    var dom = html.parse(resp);
    p(link.match(/\d+/)
        .toString());
    id = link.match(/\d+/);
    var cdnplayer = dom.root.getElementById('cdn-player').attributes.getNamedItem("src").value.match(/http:\/\/[^\/]+/) || null
    var content = dom.root.getElementByClassName("b-content__main")[0];
    var md = {},
        data = {};
    data.id = +link.match(/\d+/);
    data.Referer = link;
    title_year = MetaTag(dom, "og:title");
    cover = MetaTag(dom, "og:image");
    page.metadata.title = title_year;
    data.title = md.title = content.getElementByClassName("b-post__title")[0].textContent;
    md.orgTitle = content.getElementByClassName("b-post__origtitle")[0] ? content.getElementByClassName("b-post__origtitle")[0].textContent : content.getElementByClassName(
        "b-post__title")[0].textContent;
    md.year = +title_year.match(/\d{4}/);
    page.appendItem("", "separator", {
        title: "\u0422\u0440\u0435\u0439\u043b\u0435\u0440:"
    });

    var trailer = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\/?\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g.exec(resp);
    if (trailer) {
        page.appendItem("youtube:video:simple:" + escape(page.metadata.title + " - " + "\u0422\u0440\u0435\u0439\u043b\u0435\u0440") + ":" + trailer[1], "video", {
            title: md.title,
            icon: "http://i.ytimg.com/vi/" + trailer[1] + "/hqdefault.jpg",
            rating: +md.rating * 10
        });
    } else {
        page.appendItem("youtube:search:" + title_year + ' трейлер', "directory", {
            title: "\u043d\u0430\u0439\u0442\u0438 \u0442\u0440\u0435\u0439\u043b\u0435\u0440 \u043d\u0430 YouTube"
        });
    }
    //get video by id
    if (/translator_id/.test(perevod)) {
        v = http.request("http://hdrezka.me/engine/ajax/getcdnvideo.php", {
            method: "POST",
            debug: service.debug,
            headers: {
                "Origin": "http://hdrezka.me",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "en-US,en;q=0.8,ru;q=0.6",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Accept": "*/*",
                "Referer": data.Referer,
                "X-Requested-With": "XMLHttpRequest"
            },
            postdata: perevod
        })
            .toString();
    } else {
        v = http.request(BASE_URL + "/engine/ajax/getvideo.php", {
            postdata: {
                id: data.id
            }
        })
            .toString();
    }
    p(v);
    p("source:" + BASE_URL + "/engine/ajax/getvideo.php?id=" + data.id);
    v = JSON.parse(v);
    p(dump(v));
    if (v.success) {
        if (v.link) {
            p(v.link);
            data.url = html.parse(v.link).root.getElementByTagName("iframe")[0].attributes.getNamedItem("src").value;
            p(data.url);
        }
        if (v.url) {
            p(v.url);
            data.url = v.url;
            p(data.url)
        }
    } else {
        data.url = content.getElementById("player").getElementByTagName("iframe")[0].attributes.getNamedItem("src").value;
    }
    p("zzzzzzzzzzzzzzzzzzzzz");
    data.url = cdnplayer+data.url.match(/\/video.*|\/serial.*/)
    p("iframe AKA data.url:" + data.url);
    p("zzzzzzzzzzzzzzzzzzzzz");
    if (/serial/.test(data.url)) {
        var v = http.request(data.url, {
            debug: service.debug,
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.2.6) Gecko/20100627 Firefox/3.6.6",
                "Referer": link
            }
        })
            .toString();
        dom = html.parse(v);
        season = dom.root.getElementById("season");
        episode = dom.root.getElementById("episode");
        page.appendItem("", "separator", {
            title: "Recently Updated:"
        });
        page.appendItem(PREFIX + ":play:" + escape(JSON.stringify(data)), "video", {
            title: season.children[season.children.length - 1].textContent + " " + episode.children[episode.children.length - 1].textContent,
            icon: cover
        });


        page.appendItem("", "separator", {
            title: "Seasons:"
        });
        for (var i = 0; i < season.children.length; i++) {
            p(season.children[i].attributes.getNamedItem("value")
                .value);
            data.season = season.children[i].attributes.getNamedItem("value")
                .value;
            page.appendItem(PREFIX + ":SEASON:" + escape(JSON.stringify(data)), "directory", {
                title: season.children[i].textContent,
                icon: cover
            });
        }
        p(data.url);
        p(dump(dom.root.getElementById("season")
            .children.length));
        p(dom.root.getElementById("season")
            .children[dom.root.getElementById("season")
            .children.length - 1].textContent);
        p("count season:" + +season.children.length);
        p("count episode:" + +episode.children.length);
        p(episode.children[episode.children.length - 1].textContent);
        p("zzzzzzzzzzzzzzzzzzzzz");
    }

    //spisok perevodov
    if (content.getElementByClassName("b-translators__title")[0]) {
        p(content.getElementByClassName("b-translators__title")[0].textContent);
        page.appendItem("", "separator", {
            title: content.getElementByClassName("b-translators__title")[0].textContent
        });
        perevod = content.getElementById("translators-list");
        for (var i = 0; i < perevod.children.length; i++) {
            p(perevod.children[i].attributes.getNamedItem("title")
                .value);
            p(perevod.children[i].attributes.getNamedItem("data-translator_id")
                .value);
            p(link);
            p("id=11454&translator_id=7");
            prams = "id=" + id + "&translator_id=" + perevod.children[i].attributes.getNamedItem("data-translator_id")
                .value;
            page.appendItem(PREFIX + ":mediaInfo:" + link + ":" + prams, "directory", {
                title: perevod.children[i].attributes.getNamedItem("title")
                    .value
            });
        }
    }
    p(!/serial/.test(data.url));
    if (!/serial/.test(data.url)) {
        page.appendItem("", "separator", {
            title: "Video:"
        });
        page.appendItem(PREFIX + ":play:" + escape(JSON.stringify(data)), "video", {
            title: md.title + (md.eng_title ? " | " + md.eng_title : ""),
            season: +md.season,
            year: md.year,
            imdbid: md.imdbid,
            icon: cover,
            genre: md.genre,
            duration: md.duration ? getDuration(md.duration) : "",
            rating: +md.rating * 10,
            description: (md.slogan ? coloredStr("\u0421\u043b\u043e\u0433\u0430\u043d: ", orange) + md.slogan + "\n" : "") + (md.rel_date ? coloredStr(
                "\u0414\u0430\u0442\u0430 \u0432\u044b\u0445\u043e\u0434\u0430: ", orange) + md.rel_date + " " : "") + (md.country ? coloredStr(
                " \u0421\u0442\u0440\u0430\u043d\u0430: ", orange) + md.country + "\n" : "") + (md.director ? coloredStr("\u0420\u0435\u0436\u0438\u0441\u0441\u0435\u0440: ",
                orange) + md.director + " " : "") + (md.actor ? "\n" + coloredStr("\u0412 \u0440\u043e\u043b\u044f\u0445 \u0430\u043a\u0442\u0435\u0440\u044b: ", orange) + md.actor +
                "\n" : "") + (md.description ? "\n " + md.description + "\n" : "")
        });
    }

    if (content.getElementByClassName("b-sidelist")) {
        page.appendItem("", "separator", {
            title: content.getElementByClassName("b-sidetitle")[0].textContent.replace(" \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0435", "")
        });
        getTitles(resp, function(titleList) {
            for (var i = 0; i < titleList.length; i++) {
                item = titleList[i];
                page.appendItem(PREFIX + ":mediaInfo:" + item.url + ':null', "video", {
                    title: item.title,
                    year: parseInt(item.year, 10),
                    rating: parseInt(item.rating, 10),
                    genre: item.genre,
                    description: item.description ? item.description : item.title,
                    icon: item.icon
                });
            }
        });
    }
    p(dump(md));
    p(dump(data));
    page.type = "directory";
    page.loading = false;
}

function select(page, url) {
    page.metadata.title = PREFIX + " | " + "\u0416\u0430\u043d\u0440\u044b \u0438 \u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438";
    try {
        page.appendItem(PREFIX + ":start", "directory", {
            title: "\u041d\u0430 \u043d\u0430\u0447\u0430\u043b\u044c\u043d\u0443\u044e \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443",
            description: "\u041d\u0430 \u043d\u0430\u0447\u0430\u043b\u044c\u043d\u0443\u044e \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443"

        });
        p(resp);
        var myRe = new RegExp('href="(' + url.match(/\/.+?\//) + '\\w+/)">(.+?)</a>', "g");
        var myArray;
        i = 0;
        while ((myArray = myRe.exec(resp)) !== null) {
            page.appendItem(PREFIX + ":sort:" + myArray[1], "directory", {
                title: myArray[2],
                description: myArray[2]
            });
            i++;
        }
    } catch (ex) {
        page.error("Failed to process categories page (get_cat)");
        err(ex);
    }
    page.type = "directory";
    page.loading = false;
    page.metadata.logo = LOGO;
}

function play(page, data) {
    page.loading = true;
    p("play(page, data)");
    var canonicalUrl = PREFIX + ":play:" + data;
    data = JSON.parse(unescape(data));
    p(dump(data));
    var videoparams = {
        canonicalUrl: canonicalUrl,
        no_fs_scan: true,
        title: data.eng_title ? data.eng_title : data.title,
        year: data.year ? data.year : 0,
        season: data.season ? data.season : -1,
        episode: data.episode ? data.episode : -1,
        sources: [{
                url: []
            }
        ],
        subtitles: []
    };
    if (!data.url) {
        p("############ !data.url ###########");
        v = http.request(BASE_URL + "/engine/ajax/getvideo.php", {
            postdata: {
                id: data.id
            }
        })
            .toString();
        p("source:" + BASE_URL + "/engine/ajax/getvideo.php?id=" + data.id);
        v = JSON.parse(v);
        p(dump(v));
        dom = html.parse(v.link);
        data.url = dom.root.getElementByTagName("iframe")[0].attributes.getNamedItem("src")
            .value;
    }
    if (data.url.indexOf("oid=") !== -1) {
        p("Open url:" + data.url);
        args = /(oid=.\d+&id=.\d+&hash=[a-f\d]+)/.exec(data.url)[1];
        vars = JSON.parse(http.request("https://api.vk.com/method/video.getEmbed?" + args.replace("&id", "&video_id")
            .replace("&hash", "&embed_hash"))
            .toString());
        p(vars);
        if (vars.error) {
            page.metadata.title = vars.error.error_msg;
            showtime.notify(vars.error.error_msg + "\n" + "This video has been removed from public access.", 3);
        } else {
            for (var key in vars.response) {
                if (key == "cache240" || key == "cache360" || key == "cache480" || key == "cache720" || key == "url240" || key == "url360" || key == "url480" || key == "url720") {
                    videoparams.sources = [{
                            url: vars.response[key],
                            mimetype: "video/quicktime"
                        }
                    ];
                    video = "videoparams:" + JSON.stringify(videoparams);
                    page.appendItem(video, "video", {
                        title: "[" + key.match(/\d+/g) + "]-" + (data.eng_title ? data.eng_title : data.title),
                        duration: vars.response.duration,
                        icon: vars.response.thumb
                    });
                }
            }
        }
    }
    if (data.url.indexOf("iframe") !== -1) {
        p("Open url:" + data.url);
        resp = http.request(data.url, {
            method: "GET",
            headers: {
                Referer: BASE_URL
            }
        })
            .toString();
        p("source:" + resp);
        var content = parser(resp, "|14", "|");
        content = Duktape.enc("base64", 14 + content);
        var csrftoken = parser(resp, 'csrf-token" content="', '"');
        var request = parser(resp, 'request_host_id = "', '"');
        var video_token = parser(resp, "video_token: '", "'");
        var partner = parser(resp, "partner: ", ",");
        var content_type = parser(resp, "content_type: '", "'");
        var access_key = parser(resp, "access_key: '", "'");
        var request_host = parser(resp, 'request_host = "', '"');
        var params = "partner=" + partner + "&d_id=" + request + "&video_token=" + video_token + "&content_type=" + content_type + "&access_key=" + access_key + "&cd=1";
        p(params);
        var url1 = data.url.match(/http:\/\/.*?\//)
            .toString() + "sessions/create_new";
        var responseText = http.request(url1, {
            debug: 1,
            headers: {
              "Accept": '*/*',
              "Accept-Encoding": 'gzip, deflate',
              "Accept-Language": 'en-US,en;q=0.8,zh;q=0.6,zh-CN;q=0.4,zh-TW;q=0.2,ru;q=0.2',
              "Cache-Control": 'no-cache',
              "Connection": 'keep-alive',
              "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8',
              "Encoding-Pool": content,
              "Referer":data.url.match(/http:\/\/.+?iframe/),
              "User-Agent": 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
              "X-CSRF-Token": csrftoken,
              "X-Requested-With": "XMLHttpRequest",
            },
            postdata: params
        })
            .toString();
        p(parser(resp, "insertVideo('", "'"));
        title = parser(resp, "insertVideo('", "'");
        page.metadata.title = title;
        json = JSON.parse(responseText);
        p(dump(json));
        result_url = "hls:" + json.manifest_m3u8;
        videoparams.sources = [{
                url: "hls:" + json.manifest_m3u8
            }
        ];
        video = "videoparams:" + JSON.stringify(videoparams);
        page.appendItem(video, "video", {
            title: "[Auto]" + " | " + title,
            icon: cover
        });
        var video_urls = http.request(json.manifest_m3u8)
            .toString();
        p(video_urls);
        var myRe = /RESOLUTION=([^,]+)[\s\S]+?(http.*)/g;
        var myArray, i = 0;
        while ((myArray = myRe.exec(video_urls)) !== null) {
            videoparams.sources = [{
                    url: "hls:" + myArray[2]
                }
            ];
            video = "videoparams:" + JSON.stringify(videoparams);
            page.appendItem(video, "video", {
                title: "[" + myArray[1] + "]" + " | " + title,
                icon: cover
            });
            i++;
        }
    }
    if (data.url.indexOf("youtube.com/embed/") !== -1) {
        p(/www.youtube.com\/embed\/([^"]+)/.exec(data.url)[1]);
        page.appendItem("youtube:video:simple:" + escape(page.metadata.title + " - " + "\u0422\u0440\u0435\u0439\u043b\u0435\u0440") + ":" + /www.youtube.com\/embed\/([^"]+)/.exec(
            data.url)[1], "video", {
            title: "\u0422\u0440\u0435\u0439\u043b\u0435\u0440: " + (data.eng_title ? data.eng_title : data.title)
        });
    }
    page.appendItem("search:" + (data.eng_title ? data.eng_title : data.title), "directory", {
        title: "Try Search for: " + (data.eng_title ? data.eng_title : data.title)
    });
    page.type = "directory";
    page.contents = "contents";
    page.metadata.logo = LOGO;
    page.loading = false;
}

function searcher(page, query) {
    var v, re, m, i;
    try {
        console.log("Search HDRezka Videos for: " + query);
        resp = http.request(BASE_URL, {
            debug: true,
            args: {
                "do": "search",
                subaction: "search",
                q: query
            },
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });
        getTitles(resp, function(titleList) {
            for (var i = 0; i < titleList.length; i++) {
                item = titleList[i];
                page.appendItem(PREFIX + ":mediaInfo:" + item.url + ":" + null, "video", {
                    title: item.title,
                    year: parseInt(item.year, 10),
                    rating: parseInt(item.rating, 10),
                    genre: item.genre,
                    description: item.description ? item.description : item.title,
                    icon: item.icon
                });
                page.entries = titleList.length;
            }
        });

    } catch (err$0) {
        console.log("HDRezka - \u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u043e\u0438\u0441\u043a\u0430: " + err$0);
        err(err$0);
    }
}

function MetaTag(c, b) {
    var a = c.root.getElementByTagName("meta");
    for (var i in a) {
        if (a[i].attributes.getNamedItem("property") && a[i].attributes.getNamedItem("property")
            .value == b || a[i].attributes.getNamedItem("name") && a[i].attributes.getNamedItem("name")
            .value == b) {
            return a[i].attributes.getNamedItem("content")
                .value;
        }
    }
    return 0;
}

function parser(a, c, e) {
    var d = "",
        b = a.indexOf(c);
    0 < b && (a = a.substr(b + c.length), b = a.indexOf(e), 0 < b && (d = a.substr(0, b)));
    return d;
}

function match(b, c, a) {
    a = "undefined" !== typeof a ? a : 0;
    return b.exec(c.toString()) ? b.exec(c)[a] : "";
}

function dump(c, d) {
    var a = "";
    d || (d = 0);
    for (var e = "", b = 0; b < d + 1; b++) {
        e += "    ";
    }
    if ("object" == typeof c) {
        for (var f in c) {
            b = c[f], "object" == typeof b ? (a += e + "'" + f + "' ...\n", a += dump(b, d + 1)) : a += e + "'" + f + "' => \"" + b + '"\n';
        }
    } else {
        a = "===>" + c + "<===(" + typeof c + ")";
    }
    return a;
}

function trim(s) {
    s = s.toString();
    s = s.replace(/(\r\n|\n|\r)/gm, "");
    s = s.replace(/(^\s*)|(\s*$)/gi, "");
    s = s.replace(/[ ]{2,}/gi, " ");
    return s;
}
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, "");
    };
}
String.prototype.ucfirst = function() {
    return this.charAt(0)
        .toUpperCase() + this.substr(1);
};

function colorStr(str, color) {
    return '<font color="' + color + '">(' + str + ")</font>";
}

function coloredStr(str, color) {
    return '<font color="' + color + '">' + str + "</font>";
}

function getDuration(duration) {
    var tmp = duration.split(":");
    if (tmp.length >= 2) {
        var h = parseInt(tmp[0], 10);
        var m = parseInt(tmp[1], 10);
        var total = m;
        total += h * 60;
        return total;
    }
    return parseInt(duration, 10);
}

function p(message) {
    if (service.debug == "1") {
        print(message);
    }
}

function err(ex) {
    p("e:" + ex);
    console.log(ex);
    console.log("Line #" + ex.lineNumber);
};