//ver 0.6.2
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

io.httpInspectorCreate("http.*hdrezka.*", function(req) {
  req.setHeader("User-Agent", "Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36");
  req.setHeader("Accept-Encoding", "gzip, deflate");
});

new page.Route(PREFIX + ":start", start);
new page.Route(PREFIX + ":index:(.*):(.*)", index);
new page.Route(PREFIX + ":mediaInfo:(http.*):(.*)", mediaInfo);
new page.Route(PREFIX + ":page:(.*)", contentPage);
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
  resp = http.request(BASE_URL + href)
    .toString();
    //dom = html.parse(v);
  var myRe = /data-url="(http:\/\/hdrezka.me.+?)"[\S\s]+?<img src="([^"]+)[\S\s]+?item-link[\S\s]+?">([^<]+)[\S\s]+?<div>(.+?)<\/div>/g;
  var myArray;
  i = 0;
  while ((myArray = myRe.exec(resp)) !== null && i <= 7) {
    page.appendItem(PREFIX + ":mediaInfo:" + myArray[1]+':null', "video", {
      title: myArray[3],
      description: myArray[4],
      icon: BASE_URL + myArray[2],
      year: +match(/([0-9]+(?:\.[0-9]*)?)/, myArray[4], 1)
    });
    i++;
  }
  page.appendItem(PREFIX + ":sort:" + href, "directory", {
    title: "\u0414\u0430\u043b\u044c\u0448\u0435 \u0431\u043e\u043b\u044c\u0448\u0435" + " \u25ba",
    icon: LOGO
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
      filter: filter
    }
  })
    .toString();
  var dom = html.parse(resp);
  page.metadata.title = PREFIX + " | " + dom.root.getElementByTagName("title")[0].textContent.replace("\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c ", "")
    .replace(" \u0432 720p hd", ".");
  page.appendItem(PREFIX + ":select:" + href, "directory", {
    title: "\u0441\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u043e : " + dom.root.getElementByClassName("b-content__main_filters_link active")[0].textContent
  });

  function loader() {
    p("loader start");
    page.haveMore(false);
    setTimeout(function() {
      p(BASE_URL + href + "page/" + offset + "/");
      urlData = http.request(BASE_URL + href + "page/" + offset + "/", {
        method: "GET",
        debug: service.debug,
        noFail: true,
        args: {
          filter: filter
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
  page.type = "directory";
  page.paginator = loader;
  // page.asyncPaginator = loader;
  // loader();
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
      //"Referer": link
      
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
  p("perevod" + perevod);
  var dom = html.parse(resp);
  p(link.match(/\d+/)
    .toString());
  id = link.match(/\d+/);
  var content = dom.root.getElementByClassName("b-content__main")[0];
  var md = {},
    data = {};
  data.id = +link.match(/\d+/);
  title_year = MetaTag(dom, "og:title");
  cover = MetaTag(dom, "og:image");
  page.metadata.title = title_year;
  data.title = md.title = content.getElementByClassName("b-post__title")[0].textContent;
  md.orgTitle = content.getElementByClassName("b-post__origtitle")[0] ? content.getElementByClassName("b-post__origtitle")[0].textContent : content.getElementByClassName(
    "b-post__title")[0].textContent;
  md.year = +title_year.match(/\d+/);
  page.appendItem("", "separator", {
    title: "\u0422\u0440\u0435\u0439\u043b\u0435\u0440:"
  });
        //vynesti v otdelnuj blok
        // curl
        //curl "http://hdrezka.me/engine/ajax/gettrailervideo.php" -H "Pragma: no-cache" -H "Origin: http://hdrezka.me" -H "Accept-Encoding: gzip, deflate" -H "Accept-Language: en-US,en;q=0.8,zh;q=0.6,zh-CN;q=0.4,zh-TW;q=0.2" -H "User-Agent: Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.103 Safari/537.36" -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" -H "Accept: */*" -H "Cache-Control: no-cache" -H "X-Requested-With: XMLHttpRequest" -H "Cookie: _ym_uid=1454537866763348444; PHPSESSID=butiq2can3stcpsq85cjckr8g6; _ym_isad=0; _ga=GA1.2.663779013.1454537865; _gat=1" -H "Connection: keep-alive" -H "Referer: http://hdrezka.me/films/comedy/11782-deyv.html" --data "id=11782" --compressed
  var trailer = match(/http:\\\/\\\/www.youtube.com\\\/embed\\\/(.+?)\?iv_load_policy/, resp, 1);
  if (trailer) {
    page.appendItem("youtube:video:simple:" + escape(page.metadata.title + " - " + "\u0422\u0440\u0435\u0439\u043b\u0435\u0440") + ":" + trailer, "video", {
      title: md.title,
      icon: "http://i.ytimg.com/vi/" + trailer + "/hqdefault.jpg",
      rating: +md.rating * 10
    });
  } else {
    page.appendItem("youtube:feed:" + escape("https://gdata.youtube.com/feeds/api/videos?q=" + "\u0422\u0440\u0435\u0439\u043b\u0435\u0440 " + md.title), "directory", {
      title: "\u043d\u0430\u0439\u0442\u0438 \u0442\u0440\u0435\u0439\u043b\u0435\u0440 \u043d\u0430 YouTube"
    });
  }
  p("perevod");
  p(perevod);
  p("perevod !== null");
  p(perevod !== "null");
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
        "Referer": link,
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
    p(content.getElementById("player").getElementByTagName("iframe")[0].attributes.getNamedItem("src").value);
  }
  p("zzzzzzzzzzzzzzzzzzzzz");
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
        page.appendItem(PREFIX + ":mediaInfo:" + item.url+':null', "video", {
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

function contentPage(page, link) {
  page.type = "directory";
  page.loading = false;
  var i, v, item, re, re2, m, m2;
  p(BASE_URL + link);
  v = http.request(BASE_URL + link)
    .toString();
  try {
    var md = {};
    var data = {};
    md.url = BASE_URL + link;
    data.id = match(/\/([0-9]+(?:\.[0-9]*)?)-/, link, 1);
    md.title = match(/<h1 itemprop="name">(.+?)<\/h1>/, v, 1);
    data.title = md.title;
    md.eng_title = match(/<div class="b-post__origtitle" itemprop="alternativeHeadline">(.+?)<\/div>/, v, 1);
    data.eng_title = md.eng_title;
    md.icon = match(/<img itemprop="image" src="(.+?)"/, v, 1);
    md.rating = +match(/<span class="b-post__info_rates imdb">IMDb:[\S\s]+?([0-9]+(?:\.[0-9]*)?)<\/span>/, v, 1);
    md.year = +match(/http:\/\/hdrezka.me\/year\/(\d{4})/, v, 1);
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
      title: "\u0422\u0440\u0435\u0439\u043b\u0435\u0440:"
    });
    var trailer = match(/http:\\\/\\\/www.youtube.com\\\/embed\\\/(.+?)\?iv_load_policy/, v, 1);
    if (trailer) {
      page.appendItem("youtube:video:simple:" + escape(page.metadata.title + " - " + "\u0422\u0440\u0435\u0439\u043b\u0435\u0440") + ":" + trailer, "video", {
        title: md.title,
        icon: "http://i.ytimg.com/vi/" + trailer + "/hqdefault.jpg",
        rating: +md.rating * 10
      });
    } else {
      page.appendItem("youtube:feed:" + escape("https://gdata.youtube.com/feeds/api/videos?q=" + "\u0422\u0440\u0435\u0439\u043b\u0435\u0440 " + md.title), "directory", {
        title: "\u043d\u0430\u0439\u0442\u0438 \u0442\u0440\u0435\u0439\u043b\u0435\u0440 \u043d\u0430 YouTube"
      });
    }
    p();
    var moonwalk = match(/(http:\/\/hdcdn.nl\/.*?iframe)/, v, 1);
    p("iframe: " + moonwalk);
    if (moonwalk) {
      var html = http.request(moonwalk, {
        method: "GET",
        headers: {
          "Referer": BASE_URL + link
        }
      })
        .toString();
      p("source:" + html);
      re = /<option .*value="(.*)">(.*)<\/option>/g;
      m = re.execAll(html.match(/<select id="season"[\S\s]+?option><\/select>/));
      p("count seasons:" + m.length);
      if (m.length === 0) {
        data.url = moonwalk;
        separator = v.match(/<span class="b-sidelinks__text">\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c ([^<]+)/)[1];
        page.appendItem("", "separator", {
          title: separator.ucfirst() + ":"
        });
        item = page.appendItem(PREFIX + ":play:" + escape(JSON.stringify(data)), "video", {
          title: md.title + (md.eng_title ? " | " + md.eng_title : ""),
          season: +md.season,
          year: md.year,
          imdbid: md.imdbid,
          icon: md.icon,
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
      for (i = 0; i < m.length; i++) {
        page.appendItem("", "separator", {
          title: m[i][2]
        });
        var seasons = moonwalk + "?season=" + m[i][1];
        p("season " + m[i][1]);
        p("iframe: " + seasons);
        var html2 = http.request(seasons, {
          method: "GET",
          headers: {
            "Referer": BASE_URL + link
          }
        })
          .toString();
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
            genre: md.genre,
            duration: md.duration ? getDuration(md.duration) : "",
            rating: +md.rating * 10,
            description: (md.slogan ? coloredStr("\u0421\u043b\u043e\u0433\u0430\u043d: ", orange) + md.slogan + "\n" : "") + (md.rel_date ? coloredStr(
              "\u0414\u0430\u0442\u0430 \u0432\u044b\u0445\u043e\u0434\u0430: ", orange) + md.rel_date + " " : "") + (md.country ? coloredStr(
              " \u0421\u0442\u0440\u0430\u043d\u0430: ", orange) + md.country + "\n" : "") + (md.director ? coloredStr("\u0420\u0435\u0436\u0438\u0441\u0441\u0435\u0440: ",
              orange) + md.director + " " : "") + (md.actor ? "\n" + coloredStr("\u0412 \u0440\u043e\u043b\u044f\u0445 \u0430\u043a\u0442\u0435\u0440\u044b: ", orange) +
              md.actor + "\n" : "") + (md.description ? "\n " + md.description + "\n" : "")
          });
        }
      }
    }
    var player = /<iframe id="cdn-player" src="http:\/\/cdnhd.nl\/m\/link\/([^/]+)/g.exec(v);
    if (player) {
      separator = v.match(/<span class="b-sidelinks__text">\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c ([^<]+)/)[1];
      page.appendItem("", "separator", {
        title: separator.ucfirst() + ":"
      });
      item = page.appendItem(PREFIX + ":play:" + escape(JSON.stringify(data)), "video", {
        title: md.title + (md.eng_title ? " | " + md.eng_title : ""),
        season: +md.season,
        year: md.year,
        imdbid: md.imdbid,
        icon: md.icon,
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
  } catch (ex) {
    page.error("Failed to process page");
    err(ex);
  }
}

function select(page, url) {
  page.metadata.title = PREFIX + " | " + "\u0416\u0430\u043d\u0440\u044b \u0438 \u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438";
  try {
    page.appendItem(PREFIX + ":start", "directory", {
      title: "\u041d\u0430 \u043d\u0430\u0447\u0430\u043b\u044c\u043d\u0443\u044e \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443",
      description: "\u041d\u0430 \u043d\u0430\u0447\u0430\u043b\u044c\u043d\u0443\u044e \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443",
      icon: LOGO
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
      .toString() + "sessions/create_session";
    var responseText = http.request(url1, {
      debug: 1,
      headers: {
        "Accept-Encoding": "identity",
        "Accept-Language": "en-us,en;q=0.5",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.2.6) Gecko/20100627 Firefox/3.6.6",
        "Accept-Charset": "ISO-8859-1,utf-8;q=0.7,*;q=0.7",
        "X-CSRF-Token": csrftoken,
        "Content-Data": content,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Connection": "close"
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
    p('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')
  var v, re, m, i;
  try {
    console.log("Search HDRezka Videos for: " + query);
    resp = http.request(BASE_URL, {
      debug: true,
      args: {
        "do": "search",
        subaction: "search",
        q: query
      }
    });
    //p(resp)
    //dom = html.parse(v);
  var myRe = /data-url="(http:\/\/hdrezka.me.+?)"[\S\s]+?<img src="([^"]+)[\S\s]+?item-link[\S\s]+?">([^<]+)[\S\s]+?<div>(.+?)<\/div>/g;
  var myArray;
  i = 0;
  while ((myArray = myRe.exec(resp)) !== null /*&& i <= 7*/) {
    page.appendItem(PREFIX + ":mediaInfo:" + myArray[1]+':null', "video", {
      title: myArray[3],
      description: myArray[4],
      icon: BASE_URL + myArray[2],
      year: +match(/([0-9]+(?:\.[0-9]*)?)/, myArray[4], 1)
    });
    page.entries = i;
    i++;
  }
    //re = /data-url="(http:\/\/hdrezka.me.+?)"[\S\s]+?<img src="([^"]+)[\S\s]+?item-link[\S\s]+?">([^<]+)[\S\s]+?<div>(.+?)<\/div>/g;
    //m = re.execAll(v);
    //for (i = 0; i < m.length; i++) {
    //  page.appendItem(PREFIX + ":page:" + m[i][1], "video", {
    //    title: m[i][3],
    //    description: m[i][4],
    //    icon: BASE_URL + m[i][2],
    //    year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][4], 1)
    //  });
    //  page.entries = i;
    //}
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