(function(plugin) {
    //ver 0.5
    var plugin_info = plugin.getDescriptor();
    var PREFIX = plugin_info.id;
    var BASE_URL = "http://hdrezka.tv";
    var logo = plugin.path + "logo.png";
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
    var service = plugin.createService(plugin_info.title, PREFIX + ":start", "video", true, logo);
    var settings = plugin.createSettings(plugin_info.title, logo, plugin_info.synopsis);
    settings.createInfo("info", logo, "Plugin developed by " + plugin_info.author + ". \n");
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

    function startPage(page) {
        page.metadata.logo = plugin.path + "logo.png";
        page.metadata.title = PREFIX;
        if (!service.tosaccepted) {
            if (showtime.message(tos, true, true)) {
                service.tosaccepted = 1;
            } else {
                page.error("TOS not accepted. plugin disabled");
                return;
            }
        }
        var v, re, m, i;
        re = /data-url="http:\/\/hdrezka.tv(.+?)"[\S\s]+?<img src="([^"]+)[\S\s]+?item-link[\S\s]+?">([^<]+)[\S\s]+?<div>(.+?)<\/div>/g;
        page.appendItem("", "separator", {
            title: new showtime.RichText("\u0424\u0438\u043b\u044c\u043c\u044b")
        });
        v = showtime.httpReq(BASE_URL + "/films/").toString();
        m = re.execAll(v);
        for (i = 0; i < 7; i++) {
            page.appendItem(PREFIX + ":page:" + m[i][1], "video", {
                title: new showtime.RichText(m[i][3]),
                description: new showtime.RichText(m[i][4]),
                icon: BASE_URL + m[i][2],
                year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][4], 1)
            });
        }
        page.appendItem(PREFIX + ":sort:" + "/films/", "directory", {
            title: "\u0414\u0430\u043b\u044c\u0448\u0435 \u0431\u043e\u043b\u044c\u0448\u0435" + " \u25ba",
            icon: logo
        });
        page.appendItem("", "separator", {
            title: new showtime.RichText("\u0421\u0435\u0440\u0438\u0430\u043b\u044b")
        });
        v = showtime.httpReq(BASE_URL + "/series/").toString();
        m = re.execAll(v);
        for (i = 0; i < 7; i++) {
            page.appendItem(PREFIX + ":page:" + m[i][1], "video", {
                title: new showtime.RichText(m[i][3]),
                description: new showtime.RichText(m[i][4]),
                icon: BASE_URL + m[i][2],
                year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][4], 1)
            });
        }
        page.appendItem(PREFIX + ":sort:" + "/series/", "directory", {
            title: "\u0414\u0430\u043b\u044c\u0448\u0435 \u0431\u043e\u043b\u044c\u0448\u0435" + " \u25ba",
            icon: logo
        });
        page.appendItem("", "separator", {
            title: new showtime.RichText("\u041c\u0443\u043b\u044c\u0442\u0444\u0438\u043b\u044c\u043c\u044b")
        });
        v = showtime.httpReq(BASE_URL + "/cartoons/").toString();
        m = re.execAll(v);
        for (i = 0; i < 7; i++) {
            page.appendItem(PREFIX + ":page:" + m[i][1], "video", {
                title: new showtime.RichText(m[i][3]),
                description: new showtime.RichText(m[i][4]),
                icon: BASE_URL + m[i][2],
                year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][4], 1)
            });
        }
        page.appendItem(PREFIX + ":sort:" + "/cartoons/", "directory", {
            title: "\u0414\u0430\u043b\u044c\u0448\u0435 \u0431\u043e\u043b\u044c\u0448\u0435" + " \u25ba",
            icon: logo
        });
        page.type = "directory";
        page.loading = false;
    }

    function indexPage(page, link, filter) {
        var re, v, m;
        page.type = "directory";
        page.metadata.logo = plugin.path + "logo.png";
        v = showtime.httpReq(BASE_URL + link).toString();
        re = /<title>(.*?)<\/title>/;
        m = re.exec(v);
        page.metadata.title = new showtime.RichText(PREFIX + " | " + m[1].replace("\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c ", "").replace(" \u0432 720p hd", "."));
        page.appendItem(PREFIX + ":select:" + link, "directory", {
            title: new showtime.RichText("\u0441\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u043e : " + m[1].replace(
                "\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c ", "").replace(" \u0432 720p hd", "."))
        });
        var offset = 1;

        function loader() {
            var v = showtime.httpReq(BASE_URL + link + "page/" + offset + "/", {
                args: {
                    filter: filter
                }
            }).toString();
            p(BASE_URL + link + "page/" + offset + "/");
            var has_nextpage = false;
            var m = v.match(/href="http:\/\/hdrezka.tv(.+?)"><span class="b-navigation__next i-sprt">.*<\/span><\/a>/);
            if (m) {
                has_nextpage = true;
            }
            re = /data-url="http:\/\/hdrezka.tv(.+?)"[\S\s]+?<img src="([^"]+)[\S\s]+?item-link[\S\s]+?">([^<]+)[\S\s]+?<div>(.+?)<\/div>/g;
            m = re.execAll(v);
            for (var i = 0; i < m.length; i++) {
                page.appendItem(PREFIX + ":page:" + m[i][1], "video", {
                    title: new showtime.RichText(m[i][3]),
                    description: new showtime.RichText(m[i][4]),
                    icon: BASE_URL + m[i][2],
                    year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][4], 1)
                });
            }
            offset++;
            return has_nextpage;
        }
        if (loader()) {
            page.paginator = loader;
        }
        page.loading = false;
    }

    function contentPage(page, link) {
        page.type = "directory";
        page.loading = false;
        var i, v, item, re, re2, m, m2;
        p(BASE_URL + link);
        v = showtime.httpReq(BASE_URL + link).toString();
        p(v);
        try {
            var md = {};
            var data = {};
            md.url = BASE_URL + link;
            data.id = match(/\/([0-9]+(?:\.[0-9]*)?)-/, link, 1);
            md.title = showtime.entityDecode(match(/<h1 itemprop="name">(.+?)<\/h1>/, v, 1));
            data.title = md.title;
            md.eng_title = showtime.entityDecode(match(/<div class="b-post__origtitle" itemprop="alternativeHeadline">(.+?)<\/div>/, v, 1));
            data.eng_title = md.eng_title;
            md.icon = match(/<img itemprop="image" src="(.+?)"/, v, 1);
            md.rating = +match(/<span class="b-post__info_rates imdb">IMDb:[\S\s]+?([0-9]+(?:\.[0-9]*)?)<\/span>/, v, 1);
            md.year = +match(/http:\/\/hdrezka.tv\/year\/(\d{4})/, v, 1);
            data.year = md.year ? md.year : 0;
            md.slogan = match(/>\u0421\u043b\u043e\u0433\u0430\u043d:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            md.rel_date = match(/>\u0414\u0430\u0442\u0430 \u0432\u044b\u0445\u043e\u0434\u0430:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            md.country = match(/>\u0421\u0442\u0440\u0430\u043d\u0430:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            md.director = match(/>\u0420\u0435\u0436\u0438\u0441\u0441\u0435\u0440:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            md.genre = match(/>\u0416\u0430\u043d\u0440:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            md.duration = match(/>\u0412\u0440\u0435\u043c\u044f:<\/td>[\S\s]+?>(.+?)<\/td>/, v, 1);
            md.actor = match(/>\u0412 \u0440\u043e\u043b\u044f\u0445 \u0430\u043a\u0442\u0435\u0440\u044b:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            md.description = match(/>\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            page.metadata.title = md.title + " (" + md.year + ")";
            page.appendItem("", "separator", {
                title: new showtime.RichText("\u0422\u0440\u0435\u0439\u043b\u0435\u0440:")
            });
            var trailer = match(/http:\\\/\\\/www.youtube.com\\\/embed\\\/(.+?)\?iv_load_policy/, v, 1);
            if (trailer) {
                page.appendItem("youtube:video:simple:" + escape(page.metadata.title + " - " + "\u0422\u0440\u0435\u0439\u043b\u0435\u0440") + ":" + trailer, "video", {
                    title: new showtime.RichText(md.title),
                    icon: "http://i.ytimg.com/vi/" + trailer + "/hqdefault.jpg",
                    rating: +md.rating * 10
                });
            } else {
                page.appendItem("youtube:feed:" + escape("https://gdata.youtube.com/feeds/api/videos?q=" + "\u0422\u0440\u0435\u0439\u043b\u0435\u0440 " + md.title),
                    "directory", {
                    title: "\u043d\u0430\u0439\u0442\u0438 \u0442\u0440\u0435\u0439\u043b\u0435\u0440 \u043d\u0430 YouTube"
                });
            }
            var moonwalk = match(/(http:\/\/hdcdn.nl\/.*?iframe)/, v, 1);
            p("iframe: " + moonwalk);
            if (moonwalk) {
                var html = showtime.httpReq(moonwalk, {
                    method: "GET",
                    headers: {
                        "Referer": BASE_URL + link
                    }
                }).toString();
                p("source:" + html);
                re = /<option .*value="(.*)">(.*)<\/option>/g;
                m = re.execAll(html.match(/<select id="season"[\S\s]+?option><\/select>/));
                p("count seasons:" + m.length);
                if (m.length === 0) {
                    data.url = moonwalk;
                    separator = v.match(/<span class="b-sidelinks__text">\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c ([^<]+)/)[1];
                    page.appendItem("", "separator", {
                        title: new showtime.RichText(separator.ucfirst() + ":")
                    });
                    item = page.appendItem(PREFIX + ":play:" + escape(JSON.stringify(data)), "video", {
                        title: new showtime.RichText(md.title + (md.eng_title ? " | " + md.eng_title : "")),
                        season: +md.season,
                        year: md.year,
                        imdbid: md.imdbid,
                        icon: md.icon,
                        genre: new showtime.RichText(md.genre),
                        duration: md.duration ? getDuration(md.duration) : "",
                        rating: +md.rating * 10,
                        description: new showtime.RichText((md.slogan ? coloredStr("\u0421\u043b\u043e\u0433\u0430\u043d: ", orange) + md.slogan + "\n" : "") + (md
                            .rel_date ? coloredStr("\u0414\u0430\u0442\u0430 \u0432\u044b\u0445\u043e\u0434\u0430: ", orange) + md.rel_date + " " : "") + (
                            md.country ? coloredStr(" \u0421\u0442\u0440\u0430\u043d\u0430: ", orange) + md.country + "\n" : "") + (md.director ?
                            coloredStr("\u0420\u0435\u0436\u0438\u0441\u0441\u0435\u0440: ", orange) + md.director + " " : "") + (md.actor ? "\n" +
                            coloredStr("\u0412 \u0440\u043e\u043b\u044f\u0445 \u0430\u043a\u0442\u0435\u0440\u044b: ", orange) + md.actor + "\n" : "") + (
                            md.description ? "\n " + md.description + "\n" : ""))
                    });
                }
                for (i = 0; i < m.length; i++) {
                    page.appendItem("", "separator", {
                        title: new showtime.RichText(m[i][2])
                    });
                    var seasons = moonwalk + "?season=" + m[i][1];
                    p("season " + m[i][1]);
                    p("iframe: " + seasons);
                    var html2 = showtime.httpReq(seasons, {
                        method: "GET",
                        headers: {
                            "Referer": BASE_URL + link
                        }
                    }).toString();
                    m2 = re.execAll(html2.match(/<select id="episode"[\S\s]+?option><\/select>/));
                    p("count episode: " + m2.length);
                    for (j = 0; j < m2.length; j++) {
                        data.url = moonwalk + "?season=" + m[i][1] + "&episode=" + m2[j][1];
                        data.series = {
                            season: +m[i][1],
                            episode: m2[j][1]
                        };
                        page.appendItem(PREFIX + ":play:" + escape(JSON.stringify(data)), "video", {
                            title: m2[j][2],
                            year: md.year,
                            icon: md.icon,
                            genre: new showtime.RichText(md.genre),
                            duration: md.duration ? getDuration(md.duration) : "",
                            rating: +md.rating * 10,
                            description: new showtime.RichText((md.slogan ? coloredStr("\u0421\u043b\u043e\u0433\u0430\u043d: ", orange) + md.slogan + "\n" : "") +
                                (md.rel_date ? coloredStr("\u0414\u0430\u0442\u0430 \u0432\u044b\u0445\u043e\u0434\u0430: ", orange) + md.rel_date + " " : "") +
                                (md.country ? coloredStr(" \u0421\u0442\u0440\u0430\u043d\u0430: ", orange) + md.country + "\n" : "") + (md.director ?
                                coloredStr("\u0420\u0435\u0436\u0438\u0441\u0441\u0435\u0440: ", orange) + md.director + " " : "") + (md.actor ? "\n" +
                                coloredStr("\u0412 \u0440\u043e\u043b\u044f\u0445 \u0430\u043a\u0442\u0435\u0440\u044b: ", orange) + md.actor + "\n" : "") +
                                (md.description ? "\n " + md.description + "\n" : ""))
                        });
                    }
                }
            }
            var player = /<iframe id="cdn-player" src="http:\/\/cdnhd.nl\/m\/link\/([^/]+)/g.exec(v);
            if (player) {
                separator = v.match(/<span class="b-sidelinks__text">\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c ([^<]+)/)[1];
                page.appendItem("", "separator", {
                    title: new showtime.RichText(separator.ucfirst() + ":")
                });
                item = page.appendItem(PREFIX + ":play:" + escape(JSON.stringify(data)), "video", {
                    title: new showtime.RichText(md.title + (md.eng_title ? " | " + md.eng_title : "")),
                    season: +md.season,
                    year: md.year,
                    imdbid: md.imdbid,
                    icon: md.icon,
                    genre: new showtime.RichText(md.genre),
                    duration: md.duration ? getDuration(md.duration) : "",
                    rating: +md.rating * 10,
                    description: new showtime.RichText((md.slogan ? coloredStr("\u0421\u043b\u043e\u0433\u0430\u043d: ", orange) + md.slogan + "\n" : "") + (md.rel_date ?
                        coloredStr("\u0414\u0430\u0442\u0430 \u0432\u044b\u0445\u043e\u0434\u0430: ", orange) + md.rel_date + " " : "") + (md.country ?
                        coloredStr(" \u0421\u0442\u0440\u0430\u043d\u0430: ", orange) + md.country + "\n" : "") + (md.director ? coloredStr(
                        "\u0420\u0435\u0436\u0438\u0441\u0441\u0435\u0440: ", orange) + md.director + " " : "") + (md.actor ? "\n" + coloredStr(
                        "\u0412 \u0440\u043e\u043b\u044f\u0445 \u0430\u043a\u0442\u0435\u0440\u044b: ", orange) + md.actor + "\n" : "") + (md.description ?
                        "\n " + md.description + "\n" : ""))
                });
            }
            var sidetitle = /<div class="b-sidetitle".+?>([^<]+)/g.exec(v)[1];
            if (sidetitle) {
                page.appendItem("", "separator", {
                    title: new showtime.RichText(sidetitle.replace(" \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0435", ""))
                });
                re =
                    /<div class="b-content__inline_item".+?data-id="([^"]+).+?data-url="http:\/\/hdrezka.tv([^"]+).+?img src="([^"]+).+?html">([^<]+).+?class="misc">([^<]+)/g;
                m = re.execAll(v.match(/<div class="b-sidelist">.*<\/div>/));
                for (i = 0; i < m.length; i++) {
                    page.appendItem(PREFIX + ":page:" + m[i][2], "video", {
                        title: new showtime.RichText(m[i][4]),
                        description: new showtime.RichText(m[i][5]),
                        icon: BASE_URL + m[i][3],
                        year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][5], 1)
                    });
                }
            }
        } catch (ex) {
            page.error("Failed to process page");
            e(ex);
        }
    }

    function select(page, url) {
        page.metadata.title = PREFIX + " | " + "\u0416\u0430\u043d\u0440\u044b \u0438 \u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438";
        try {
            var v = showtime.httpReq(BASE_URL).toString();
            var re = new RegExp('href="(' + url.match(/\/.+?\//) + '\\w+/)">(.+?)</a>', "g");
            var m = re.execAll(v);
            page.appendItem(PREFIX + ":start", "directory", {
                title: "\u041d\u0430 \u043d\u0430\u0447\u0430\u043b\u044c\u043d\u0443\u044e \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443",
                description: "\u041d\u0430 \u043d\u0430\u0447\u0430\u043b\u044c\u043d\u0443\u044e \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443",
                icon: logo
            });
            for (var i = 1; i < m.length; i++) {
                page.appendItem(PREFIX + ":sort:" + m[i][1], "directory", {
                    title: new showtime.RichText(m[i][2]),
                    description: new showtime.RichText(m[i][2]),
                    icon: logo
                });
            }
        } catch (ex) {
            page.error("Failed to process categories page (get_cat)");
            e(ex);
        }
        page.type = "directory";
        page.loading = false;
        page.metadata.logo = logo;
    }

    function sort(page, url) {
        page.metadata.title = PREFIX + " | " + "\u0421\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u043e:";
        page.appendItem(PREFIX + ":index:" + url + ":" + "last", "directory", {
            title: "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u043f\u043e\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u044f",
            description: "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u043f\u043e\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u044f",
            icon: logo
        });
        page.appendItem(PREFIX + ":index:" + url + ":" + "popular", "directory", {
            title: "\u041f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u044b\u0435",
            description: "\u041f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u044b\u0435",
            icon: logo
        });
        page.appendItem(PREFIX + ":index:" + url + ":" + "watching", "directory", {
            title: "\u0421\u0435\u0439\u0447\u0430\u0441 \u0441\u043c\u043e\u0442\u0440\u044f\u0442",
            description: "\u0421\u0435\u0439\u0447\u0430\u0441 \u0441\u043c\u043e\u0442\u0440\u044f\u0442",
            icon: logo
        });
        page.type = "directory";
        page.loading = false;
        page.metadata.logo = logo;
    }

    function play(page, data) {
        page.loading = true;
        p("play(page, data)");
        var canonicalUrl = PREFIX + ":play:" + data;
        data = JSON.parse(unescape(data));
        p(data);
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
            v = showtime.httpReq(BASE_URL + "/engine/ajax/getvideo.php", {
                postdata: {
                    id: data.id
                }
            }).toString();
            p("source:" + BASE_URL + "/engine/ajax/getvideo.php");
            v = JSON.parse(v);
            data.url = /(http:[^"]+)/.exec(v.link)[1];
            p(data.url);
        }
        //vk.com
        if (data.url.indexOf("oid=") !== -1) {
            p('Open url:' + data.url);
            args = /(oid=.\d+&id=.\d+&hash=[a-f\d]+)/.exec(data.url)[1];
            vars = JSON.parse(showtime.httpReq('https://api.vk.com/method/video.getEmbed?' + args.replace('&id', '&video_id').replace('&hash', '&embed_hash')).toString());
            p(vars);
            if (vars.error) {
                page.metadata.title = vars.error.error_msg;
                showtime.notify(vars.error.error_msg + '\n' + 'This video has been removed from public access.', 3);
            } else {
                for (var key in vars.response) {
                    if (key == 'cache240' || key == 'cache360' || key == 'cache480' || key == 'cache720' || key == 'url240' || key == 'url360' || key == 'url480' || key ==
                        'url720') {
                        videoparams.sources = [{
                                url: vars.response[key],
                                mimetype: "video/quicktime"
                            }
                        ];
                        video = "videoparams:" + JSON.stringify(videoparams);
                        page.appendItem(video, "video", {
                            title: "[" + key.match(/\d+/g) + "]-" + (data.eng_title ? data.eng_title : data.title) /*+ " | " + 'data.season' + " \u0441\u0435\u0437\u043e\u043d  | " + 'data.episode' + " \u0441\u0435\u0440\u0438\u044f"*/ ,
                            duration: vars.response.duration,
                            icon: vars.response.thumb
                        });
                    }
                }
            }
        }
        if (data.url.indexOf('hdcdn.nl') !== -1) {
            p("Open url:" + data.url);
            v = showtime.httpReq(data.url, {
                method: "GET",
                headers: {
                    Referer: BASE_URL
                }
            }).toString();
            p("source:" + v);
            p(/player_osmf\('([^']+)/.exec(v));
            page.metadata.title = /player_osmf\('([^']+)/.exec(v)[1];
            var postdata = {};
            postdata = /post\('\/sessions\/create_session', \{([^\}]+)/.exec(v)[1];
            p(postdata);
            postdata = {
                partner: /partner: (.*),/.exec(v)[1],
                d_id: /d_id: (.*),/.exec(v)[1],
                video_token: /video_token: '(.*)'/.exec(v)[1],
                content_type: /content_type: '(.*)'/.exec(v)[1],
                access_key: /access_key: '(.*)'/.exec(v)[1]
            };
            json = JSON.parse(showtime.httpReq(data.url.match(/http:\/\/.*?\//) + "sessions/create_session", {
                debug: true,
                postdata: postdata
            }));
            result_url = "hls:" + json.manifest_m3u8;
            videoparams.sources = [{
                    url: "hls:" + json.manifest_m3u8
                }
            ];
            video = "videoparams:" + JSON.stringify(videoparams);
            page.appendItem(video, "video", {
                title: "[Auto]" + " | " + (data.eng_title ? data.eng_title : data.title)
            });
            var video_urls = showtime.httpReq(json.manifest_m3u8).toString();
            p(video_urls);
            video_urls = /RESOLUTION=([^,]+)[\s\S]+?(http.*)/g.execAll(video_urls);
            p(video_urls);
            for (var i in video_urls) {
                videoparams.sources = [{
                        url: "hls:" + video_urls[i][2]
                    }
                ];
                video = "videoparams:" + JSON.stringify(videoparams);
                page.appendItem(video, "video", {
                    title: "[" + video_urls[i][1] + "]" + " | " + (data.eng_title ? data.eng_title : data.title)
                });
            }
        }
        page.appendItem("search:" + (data.eng_title ? data.eng_title : data.title), "directory", {
            title: "Try Search for: " + (data.eng_title ? data.eng_title : data.title)
        });
        page.type = "directory";
        page.contents = "contents";
        page.metadata.logo = logo;
        page.loading = false;
    }

    function searcher(page, query) {
        var v, re, m, i;
        try {
            showtime.trace("Search HDRezka Videos for: " + query);
            v = showtime.httpReq(BASE_URL, {
                debug: true,
                args: {
                    "do": "search",
                    subaction: "search",
                    q: query
                }
            });
            re = /data-url="http:\/\/hdrezka.tv(.+?)"[\S\s]+?<img src="([^"]+)[\S\s]+?item-link[\S\s]+?">([^<]+)[\S\s]+?<div>(.+?)<\/div>/g;
            m = re.execAll(v);
            for (i = 0; i < m.length; i++) {
                page.appendItem(PREFIX + ":page:" + m[i][1], "video", {
                    title: new showtime.RichText(m[i][3]),
                    description: new showtime.RichText(m[i][4]),
                    icon: BASE_URL + m[i][2],
                    year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][4], 1)
                });
                page.entries = i;
            }
        } catch (err) {
            showtime.trace("HDRezka - \u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u043e\u0438\u0441\u043a\u0430: " + err);
            e(err);
        }
    }
    plugin.addURI(PREFIX + ":start", startPage);
    plugin.addURI(PREFIX + ":index:(.*):(.*)", indexPage);
    plugin.addURI(PREFIX + ":page:(.*)", contentPage);
    plugin.addURI(PREFIX + ":select:(.*)", select);
    plugin.addURI(PREFIX + ":sort:(.*)", sort);
    plugin.addURI(PREFIX + ":play:(.*)", play);
    plugin.addSearcher(PREFIX + " - Videos", plugin.path + "logo.png", searcher);
    RegExp.prototype.execAll = function(e) {
        for (var c = [], b = null; null !== (b = this.exec(e));) {
            var d = [],
                a;
            for (a in b) {
                parseInt(a, 10) == a && d.push(b[a]);
            }
            c.push(d);
        }
        return c;
    };

    function match(re, st, i) {
        i = typeof i !== "undefined" ? i : 0;
        if (re.exec(st.toString())) {
            return re.exec(st)[i];
        } else {
            return "";
        }
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
        return this.charAt(0).toUpperCase() + this.substr(1);
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

    function e(ex) {
        t(ex);
        t("Line #" + ex.lineNumber);
    }

    function t(message) {
        showtime.trace(message, plugin.getDescriptor().id);
    }

    function p(message) {
        if (typeof message === "object") {
            message = "### object ###" + "\n" + JSON.stringify(message) + "\n" + "### object ###";
        }
        if (service.debug) {
            showtime.print(message);
        }
    }
})(this);