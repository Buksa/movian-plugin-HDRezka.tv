data = {};
options = {};

function ScrapeList(href, pageHtml) {
    var returnValue = [];
    content = pageHtml.dom.getElementByClassName('b-content__inline_items');
    //document.getElementsByClassName('b-content__inline_item')
    if ((elements = pageHtml.dom.getElementByClassName('b-content__inline_item'))) {
        for (i = 0; i < elements.length; i++) {
            element = elements[i];

            returnValue.push({
                url: element.attributes.getNamedItem('data-url') !== null ? element.attributes.getNamedItem('data-url').value : '',
                id: element.attributes.getNamedItem('data-id').value,
                icon: element.getElementByTagName('img')[0].attributes.getNamedItem('src').value,
                title: element.getElementByClassName('b-content__inline_item-link')[0].getElementByTagName('a')[0].textContent,
                year: +element.getElementByClassName('b-content__inline_item-link')[0].children[1].textContent.match(/^\d+/)
                // description: element.getElementByClassName("b-content__inline_item-link")[0].children[1].textContent
            });
        }
    }
    //endOfData = document.getElementsByClassName('navigation').length ? document.getElementsByClassName('pagesList')[0].children[document.getElementsByClassName('pagesList')[0].children.length - 2].nodeName !== 'A' : true
    //document.getElementsByClassName('pagination').length ? document.getElementsByClassName('pagination')[0].getElementsByTagName('a')[document.getElementsByClassName('pagination')[0].getElementsByTagName('a').length - 2].attributes.length > 1 : true
    //!document.getElementsByClassName('navibut')[0].children[1].getElementsByTagName('a').length
    // if (pageHtml.dom.getElementByClassName("nnext").length !== 0) {
    //     returnValue.endOfData = !pageHtml.dom.getElementByClassName("nnext")[0].getElementByTagName("a").length;
    // } else returnValue.endOfData = true;
    if ((navigation = pageHtml.dom.getElementByClassName('b-navigation')[0])) {
        returnValue.endOfData = navigation.children[navigation.children.length - 1].attributes[0].value == 'no-page';
    } else returnValue.endOfData = true;
    return returnValue;
}

function populateItemsFromList(page, list) {
    log.d({
        function: 'populateItemsFromList'
        //  list: list
    });
    page.entries = 0;
    for (i = 0; i < list.length; i++) {
        page.appendItem(PREFIX + ':moviepage:' + JSON.stringify(list[i]), 'video', {
            title: list[i].title,
            description: list[i].description,
            icon: /^http/.test(list[i].icon) ? list[i].icon : BASE_URL + list[i].icon,
        });
        page.entries++;
    }
}

exports.searcher = function (page, params) {
    log.d('exports.searcher');
    log.d(params);

    page.loading = true;
    page.metadata.logo = LOGO;
    page.model.contents = 'grid';
    page.type = 'directory';
    page.entries = 0;

    var nPage = 1;
    params.args = {};

    // query = params.href.replace('/?do=search&subaction=search&q=', '');
    // page.appendItem(PREFIX + ':search:' + query, 'video', {
    //     title: 'Show me more',
    //     description: ''
    // });
    function loader() {
        log.d(params);
        url = params.page ? params.href + params.page : params.href; //+ "/";
        //https://rezka.ag/index.php?do=search&subaction=search&q=lost&page=1
        log.d('url=' + url);
        api.call(page, BASE_URL + url, params.args, function (pageHtml) {
            list = ScrapeList(url, pageHtml)
            populateItemsFromList(page, list);
            nPage++;
            //https://rezka.ag/index.php?do=search&subaction=search&q=lost&page=1
            params.page = '&page=' + nPage;
            page.haveMore(list.endOfData !== undefined && !list.endOfData);
        });
    }
    page.asyncPaginator = loader;
    loader();

};

exports.list = function (page, params) {
    page.loading = true;
    page.metadata.logo = LOGO;
    page.metadata.title = params.title;
    page.model.contents = 'grid';
    page.type = 'directory';
    page.entries = 0;
    log.d('exports.list');
    log.d(params);
    log.d('params.args:' + params.args);
    var nPage = 1;

    params.args = {};

    function loader() {
        log.d(params);
        url = params.page ? params.href + params.page : params.href; //+ "/";
        //http://hdrezka.me/new/page/2/?filter=last&genre=2
        log.d('url=' + url);
        api.call(page, BASE_URL + url, params.args, function (pageHtml) {
            list = ScrapeList(url, pageHtml);
            populateItemsFromList(page, list);
            nPage++;
            //http://hdrezka.me/new/page/2/?filter=last&genre=2
            params.page = 'page/' + nPage + '/';
            page.haveMore(list.endOfData !== undefined && !list.endOfData);
        });
    }

    /////
    function reload() {
        log.d(params);
        log.d('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzreload');
        delete params.page;
        nPage = 1;
        page.flush();
        loader();
    }


    CAT(params, page, reload);
    page.asyncPaginator = loader;
    loader();
};
exports.updates = function (page, params) {
    page.loading = true;
    page.metadata.logo = LOGO;
    page.metadata.title = params.title;
    page.type = 'directory';
    url = params.page ? params.href + params.page : params.href;

    api.call(page, BASE_URL + url, params.args, function (pageHtml) {
        //items = document.getElementsByClassName("b-seriesupdate__block")
        items = pageHtml.dom.getElementByClassName('b-seriesupdate__block');
        items.forEach(function (i) {
            day = i.children[0].textContent;
            page.appendItem('', 'separator', {
                title: day
            });
            i.children[1].children.forEach(function (i) {
                title = i.textContent;

                href = i.getElementByTagName('a')[0].attributes.getNamedItem('href').value;
                id = /(\d+)/.exec(href)[1];

                data = {
                    url: BASE_URL + href,
                    id: id,
                    icon: null,
                    title: title.split('(')[0],
                    year: null
                };
                page.appendItem(PREFIX + ':moviepage:' + JSON.stringify(data), 'directory', {
                    title: title
                });
            });
        });
    });

    // [... items].forEach(function (i){
    //     day = i.children[0].textContent;
    //     console.log(day);
    //     [... i.children[1].children].forEach(function(i){
    //     console.log(title = i.textContent);
    //     console.log(i.getElementsByTagName('a')[0].href)
    //     });
    //     })
    page.loading = false;
};

function CAT(params, page, reload) {
    if (params.href == '/new/') {
        page.options.createMultiOpt(
            'genre',
            'Type', [
                ['0', 'Все', true],
                ['1', 'Фильмы'],
                ['2', 'Сериалы'],
                ['3', 'Мультфильмы'],
                ['4', 'ТВ шоу'],
                ['82', 'Аниме']
            ],
            function (genre) {
                genre > 0 ? (params.args.genre = genre) : delete params.args.genre;
                if (page.asyncPaginator) {
                    reload();
                }
            },
            true
        );
    }
    if (params.href == '/new/' || !/.*?do=search.*/.test(params.href)) {
        order = [
            ['last', 'Последние поступления', true],
            ['popular', 'Популярные'],
            ['watching', 'Сейчас смотрят']
        ];
        page.options.createMultiOpt('order', 'Order by', order, function (filter) {
            params.args.filter = filter;
            if (page.asyncPaginator) {
                reload();
            }
        }, true);
        cat = '';
        films_cat = [
            ['/films/', 'Any', true],
            ['/films/arthouse/', 'Арт-хаус'],
            ['/films/biographical/', 'Биографические'],
            ['/films/action/', 'Боевики'],
            ['/films/western/', 'Вестерны'],
            ['/films/military/', 'Военные'],
            ['/films/detective/', 'Детективы'],
            ['/films/kids/', 'Детские'],
            ['/films/documentary/', 'Документальные'],
            ['/films/drama/', 'Драмы'],
            ['/films/foreign/', 'Зарубежные'],
            ['/films/historical/', 'Исторические'],
            ['/films/comedy/', 'Комедии'],
            ['/films/short/', 'Короткометражные'],
            ['/films/crime/', 'Криминал'],
            ['/films/melodrama/', 'Мелодрамы'],
            ['/films/musical/', 'Мюзиклы'],
            ['/films/our/', 'Наши'],
            ['/films/cognitive/', 'Познавательные'],
            ['/films/adventures/', 'Приключения'],
            ['/films/travel/', 'Путешествия'],
            ['/films/family/', 'Семейные'],
            ['/films/sport/', 'Спортивные'],
            ['/films/thriller/', 'Триллеры'],
            ['/films/horror/', 'Ужасы'],
            ['/films/ukrainian/', 'Украинские'],
            ['/films/fiction/', 'Фантастика'],
            ['/films/fantasy/', 'Фэнтези'],
            ['/films/erotic/', 'Эротика']
        ];
        series_cat = [
            ['/series/', 'Any', true],
            ['/series/arthouse/', 'Арт-хаус'],
            ['/series/biographical/', 'Биографические'],
            ['/series/action/', 'Боевики'],
            ['/series/western/', 'Вестерны'],
            ['/series/military/', 'Военные'],
            ['/series/detective/', 'Детективы'],
            ['/series/documentary/', 'Документальные'],
            ['/series/drama/', 'Драмы'],
            ['/series/foreign/', 'Зарубежные'],
            ['/series/historical/', 'Исторические'],
            ['/series/comedy/', 'Комедии'],
            ['/series/crime/', 'Криминал'],
            ['/series/melodrama/', 'Мелодрамы'],
            ['/series/musical/', 'Музыкальные'],
            ['/series/adventures/', 'Приключения'],
            ['/series/realtv/', 'Реальное ТВ'],
            ['/series/russian/', 'Русские'],
            ['/series/family/', 'Семейные'],
            ['/series/sport/', 'Спортивные'],
            ['/series/telecasts/', 'Телепередачи'],
            ['/series/thriller/', 'Триллеры'],
            ['/series/horror/', 'Ужасы'],
            ['/series/ukrainian/', 'Украинские'],
            ['/series/fiction/', 'Фантастика'],
            ['/series/fantasy/', 'Фэнтези'],
            ['/series/erotic/', 'Эротика']
        ];
        cartoons_cat = [
            ['/cartoons/', 'Any', true],
            ['/cartoons/anime/', 'Аниме'],
            ['/cartoons/action/', 'Боевики'],
            ['/cartoons/kids/', 'Детские'],
            ['/cartoons/adult/', 'Для взрослых'],
            ['/cartoons/drama/', 'Драмы'],
            ['/cartoons/foreign/', 'Зарубежные'],
            ['/cartoons/comedy/', 'Комедии'],
            ['/cartoons/multseries/', 'Мультсериалы'],
            ['/cartoons/our/', 'Наши'],
            ['/cartoons/cognitive/', 'Познавательные'],
            ['/cartoons/full-length/', 'Полнометражные'],
            ['/cartoons/adventures/', 'Приключения'],
            ['/cartoons/family/', 'Семейные'],
            ['/cartoons/fairytale/', 'Сказки'],
            ['/cartoons/soyzmyltfilm/', 'Советские'],
            ['/cartoons/sport/', 'Спортивные'],
            ['/cartoons/fiction/', 'Фантастика'],
            ['/cartoons/fantasy/', 'Фэнтези']
        ];
        animation_cat = [
            ['/animation/', 'Any', true],
            ['/animation/action/', 'Боевики'],
            ['/animation/fighting/', 'Боевые искусства'],
            ['/animation/military/', 'Военные'],
            ['/animation/detective/', 'Детективы'],
            ['/animation/kids/', 'Детские'],
            ['/animation/drama/', 'Драмы'],
            ['/animation/historical/', 'Исторические'],
            ['/animation/kodomo/', 'Кодомо'],
            ['/animation/comedy/', 'Комедии'],
            ['/animation/mahoushoujo/', 'Махо-сёдзё'],
            ['/animation/mecha/', 'Меха'],
            ['/animation/mystery/', 'Мистические'],
            ['/animation/musical/', 'Музыкальные'],
            ['/animation/educational/', 'Образовательные'],
            ['/animation/parody/', 'Пародия'],
            ['/animation/everyday/', 'Повседневность'],
            ['/animation/adventures/', 'Приключения'],
            ['/animation/romance/', 'Романтические'],
            ['/animation/samurai/', 'Самурайский боевик'],
            ['/animation/fairytale/', 'Сказки'],
            ['/animation/sport/', 'Спортивные'],
            ['/animation/shoujo/', 'Сёдзё'],
            ['/animation/shoujoai/', 'Сёдзё-ай'],
            ['/animation/shounen/', 'Сёнэн'],
            ['/animation/shounenai/', 'Сёнэн-ай'],
            ['/animation/thriller/', 'Триллеры'],
            ['/animation/horror/', 'Ужасы'],
            ['/animation/fiction/', 'Фантастика'],
            ['/animation/fantasy/', 'Фэнтези'],
            ['/animation/school/', 'Школа'],
            ['/animation/erotic/', 'Эротика'],
            ['/animation/ecchi/', 'Этти']
        ];
        if (/films/.test(params.href))
            cat = films_cat;
        if (/series/.test(params.href))
            cat = series_cat;
        if (/cartoons/.test(params.href))
            cat = cartoons_cat;
        if (/animation/.test(params.href))
            cat = animation_cat;
        if (cat) {
            page.options.createMultiOpt('genres', 'Genres', cat, function (newhref) {
                log.d(params);
                log.d('params inside genres');
                params.href = newhref;
                if (page.asyncPaginator) {
                    reload();
                }
            }, true);
        }
        //console.log(params)
    }
};

function trailer(page, pageHtml) {
    log.d({
        function: 'trailer',
        data: data
    });
    page.appendItem('', 'separator', {
        title: '\u0422\u0440\u0435\u0439\u043b\u0435\u0440:'
    });
    var re = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\/?\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g;
    var trailer = re.exec(pageHtml.text.toString());
    if (trailer) {
        page.appendItem('https://www.youtube.com/watch?v=' + trailer[1], 'video', {
            title: data.title,
            icon: 'http://i.ytimg.com/vi/' + trailer[1] + '/hqdefault.jpg',
            rating: +data.rating * 10
        });
    } else {
        page.appendItem('youtube:search:' + data.title + ' ' + data.year + ' трейлер', 'directory', {
            title: '\u043d\u0430\u0439\u0442\u0438 \u0442\u0440\u0435\u0439\u043b\u0435\u0440 \u043d\u0430 YouTube'
        });
    }
}

function Show_R_U(page, pageHtml) {
    log.d({
        function: 'Show_R_U start',
        data: data,
        options: options
    });
    page.metadata.title = data.title;

    if (null == options.seasons || null == options.episodes || null == options.episode) {
        page.appendItem('', 'separator', {
            title: 'Video:'
        });
        page.appendItem(PREFIX + ':play:' + JSON.stringify(data), 'video', {
                title: data.title,
                icon: data.icon
            }) //.bindVideoMetadata({filename: data.filename})
            .bindVideoMetadata({
                title: data.title_en ? data.title_en : data.title,
                year: +data.year
            });
    } else {
        page.appendItem('', 'separator', {
            title: 'Recently Updated:'
        });
        //todo
        //http://moonwalk.cc/serial/6cd62ddacc8264816d0f7174d60b09a4/iframe?season=1&episode=1&nocontrols=&nocontrols_translations=&nocontrols_seasons=&ref=WjJXRlBuZmZ4ajBTcTBDeTBodnRYaDZKUVBnZUFYQlZFbnBLdlFqWVp4WG83NlExWXU1ODNHWWRNUk9WSXlVcjFWOWFyZzNRL0dZV1l6elphdmNxaEVhQWFrWUVmSDhzbmV2bkI2RnNGTGFhOTE3d2w2aTlmK1p4OUNuS3U3YmQtLThlbU1tSHhDZkk1bnZ1TEdkRFVZeWc9PQ%3D%3D--153ad905bc2dbc2b5994091c5573707b9b6a6a58
        data.url = link(options.season, options.episode, options.serial_token);


        data.season = options.season;

        // data.series = {
        //     season: options.season,
        //     episode: options.episode
        // };

        item = page.appendItem(PREFIX + ':play:' + JSON.stringify(data), 'video', {
            episode: {
                number: fix_0(options.episode)
            },
            season: {
                number: fix_0(options.season)
            },
            title: (data.title_en ? data.title_en : data.title) + ' S' + fix_0(options.season) + 'E' + fix_0(options.episode),
            icon: data.icon
        });
        item.bindVideoMetadata({
            title: (data.title_en ? data.title_en : data.title) + ' S' + fix_0(options.season) + 'E' + fix_0(options.episode)
        });
    }
    log.d({
        function: 'Show_R_U start',
        data: data,
        data_url: link(options.season, options.episode, options.serial_token)
        //html: //console.log(pageHtml.text.toString())
    });
}

function showSeasonFolder(page, pageHtml) {
    log.d({
        function: 'showSeasonFolder'
        //        data: data,
        //html: //console.log(pageHtml.text.toString())
    });

    //???
    if (options.seasons) {
        log.d('count season: ' + options.seasons.length);
        page.appendPassiveItem('separator', null, {
            title: 'Seasons:'
        });

        for (var i = 0; i < options.seasons.length; i++) {
            //log.d(urls.parse(data.url))
            data.season = options.seasons[i];
            //            data.series.season = options.seasons[i];
            data.url = data.url.replace(/season=.*/, 'season=' + data.season);
            page.appendItem(PREFIX + ':SEASON:' + JSON.stringify(data), 'directory', {
                title: data.season + ' \u0441\u0435\u0437\u043e\u043d',
                icon: data.icon
            });
        }
    }
}

function showTranslateFolder(page, pageHtml) {
    log.d({
        function: 'showTranslateFolder',
        data: data
        //html: //console.log(pageHtml.text.toString())
    });
    //GET TRANSLATE FROM pageHtml options
    if (null != options.translations && options.translations.length > 0) {
        page.appendPassiveItem('separator', null, {
            title: 'Варианты Озвучки:'
        });
        for (var i = 0; i < options.translations.length; i++) {
            data.url = data.url.replace(/[a-f0-9]{32}.*/, options.translations[i][0] + '/iframe');
            // log.d({ uri: 'PREFIX + ":moviepage:" + ', data: data });
            if (options.translations[i][0] == options.serial_token) page.metadata.title += ' | ' + options.translations[i][1];
            page.appendItem(PREFIX + ':moviepage:' + JSON.stringify(data), 'directory', {
                title: options.translations[i][1],
                icon: data.icon
            });
        }
    }
};

function showTranslateFolderREZKA(page, pageHtml) {
    trans_list = pageHtml.dom.getElementById("translators-list");
    if (null != trans_list && trans_list.children.length > 0) {
        page.appendPassiveItem('separator', null, {
            title: 'Варианты Озвучки:'
        });
        for (var i = 0; i < trans_list.children.length; i++) {

            data.url = trans_list.children[i].attributes.getNamedItem('data-cdn_url').value;
            title = trans_list.children[i].attributes.getNamedItem('title').value;
            log.d({
                label: 'data inshowTranslateFolderREZKA',
                data: data
            });
            //log.d({ uri: 'PREFIX + ":moviepage:" + ', data: data });
            //                 if (options.translations[i][0] == options.serial_token) page.metadata.title += ' | ' + options.translations[i][1];
            page.appendItem(PREFIX + ':moviepage:' + JSON.stringify(data), 'directory', {
                title: title,
                icon: data.icon
            });
        }
    }

};

function get_url() {
    v = http.request(BASE_URL + '/engine/ajax/getvideo.php', {
        postdata: {
            id: data.id
        }
    }).toString();
    v = JSON.parse(v);
    if (v.success) {
        if (v.link) {
            data.url = html.parse(v.link).root.getElementByTagName('iframe')[0].attributes.getNamedItem('src').value;
            log.d({
                '1 data.url: ': data.url
            });
        }
        if (v.url) {
            data.url = v.url;
            log.d({
                '2 data.url: ': data.url
            });
        }
    } else {
        data.url = pageHtml.dom.getElementById('player').getElementByTagName('iframe')[0].attributes.getNamedItem('src').value;
    }
    data.url = data.url.replace('http://hdcdn.nl/', 'http://moonwalk.cc/');
    log.d({
        'iframe AKA data.url:': data.url
    });
}

function get_origtitle() {
    if (pageHtml.dom.getElementByClassName('b-post__origtitle').length)
        data.title_en = pageHtml.dom
        .getElementByClassName('b-post__origtitle')[0]
        .textContent.split('/')
        .pop();
}

function getYear() {
    //document.body.innerHTML.match(/year\/([^/]+)/)[1]
    if (/year\/([^/]+)/.exec(pageHtml.text)) data.year = /year\/([^/]+)/.exec(pageHtml.text)[1];
}

function getIcon() {
    if (pageHtml.dom.getElementByClassName('b-sidecover').length)
        data.icon = pageHtml.dom.getElementByClassName('b-sidecover')[0].getElementByTagName('img')[0].attributes.getNamedItem('src').value;
}

function get_filename() {
    log.d((/insertVideo\('(.*?)',/.exec(pageHtml.text.toString()) || [])[1]);
    data.filename = (/insertVideo\('(.*?)',/.exec(pageHtml.text.toString()) || [])[1];
    if (data.filename) data.filename = data.filename.split('/').pop();
    log.d(data);
}

function moondata(api_url) {
    api_url = api_url.replace(/.*video\//, 'http://moonwalk.cc/api/movie.json?token=');
    api_url = api_url.replace(/.*serial\//, 'http://moonwalk.cc/api/serial.json?token=');
    api_url = api_url.replace(/\/iframe.*/, '&api_token=6eb82f15e2d7c6cbb2fdcebd05a197a2');
    log.d(meta = JSON.parse(http.request(api_url).toString()))

    data.icon = meta.material_data ? meta.material_data.poster : data.icon;
    data.title = meta.title_en || meta.title_ru;
    data.year = meta.year;
    data.description = meta.material_data ? meta.material_data.description : '';
}

function movie_page(page, pageHtml) {
    get_origtitle();
    getYear();
    getIcon();
    trailer(page, pageHtml);
    //regexp = /http[\s\S]{0,25}video\/[a-f0-9]{16}\/iframe[^"]+|http[\s\S]{0,25}[a-f0-9]{32}\/iframe[^"]+|http[\s\S]{0,25}serial\/[a-f0-9]{32}\/iframe[^"]+/;
    regexp = /http[\s\S]{0,60}video\/[a-f0-9]{16}\/iframe|http[\s\S]{0,60}[a-f0-9]{32}\/iframe|http[\s\S]{0,60}serial\/[a-f0-9]{32}\/iframe/;
    if (!regexp.test(data.url)) data.url = (regexp.exec(pageHtml.text.toString()) || [])[0];
    if (!regexp.test(data.url)) get_url();
    if (regexp.test(data.url)) moondata(data.url);
    data.title_year = data.title + (data.year ? ' (' + data.year + ')' : '');
    page.metadata.title = data.title_year;
    page.metadata.logo = data.icon;
    page.loading = true;
    page.type = 'directory';

    if (!regexp.test(data.url)) {
        console.error('##############################');
        console.error('#### data.url ne moonwalk ####');
        console.error('##############################');
        page.appendItem('', 'separator', {
            title: 'плеер не найден:'
        });
        page.appendItem('youtube:search:' + data.title + ' ' + data.year, 'directory', {
            title: '\u043d\u0430\u0439\u0442\u0438 \u043d\u0430 YouTube'
        });
        page.appendItem('search:' + data.title + ' ' + data.year, 'directory', {
            title: 'найти ' + data.title + ' ' + data.year + ' в других плагинах'
        });
        log.d(pageHtml);
    } else {
        //data.url = data.url.replace(/.*video\//, 'http://mastarti.com/video/');
        //data.url = data.url.replace(/.*serial\//, 'http://mastarti.com/serial/');

        // api_url = data.url.replace(/.*video\//, 'http://moonwalk.cc/api/movie.json?token=');
        // api_url = api_url.replace(/.*serial\//, 'http://moonwalk.cc/api/serial.json?token=');
        // api_url = api_url.replace(/\/iframe.*/, '&api_token=997e626ac4d9ce453e6c920785db8f45');
        // moonmeta = JSON.parse(http.request(api_url).toString());
        // log.d({moonmeta:moonmeta});//68tq2FWP0T //Cookie: __ifzz=iframe.video

        api.call(page, data.url, null, function (pageHtml) {
            resp = pageHtml.text.toString();
            //https://regex101.com/r/3BPUoK/1/ //new ({[\s\S]+video_token[^\;]+})
            VideoBalancer = /video_balancer_options([^\;]+})/.exec(resp)[1];
            eval('options' + VideoBalancer);
            log.d({
                label: 'VideoBalancer',
                options: options
            });
            log.d('^^^^^^^^^^options has been update^^^^^^^^^');
            // get_filename()
            Show_R_U(page, pageHtml);
            showSeasonFolder(page, pageHtml);
            showTranslateFolder(page, pageHtml);
        });
    }
    if (/serial/.test(data.url) !== true) showTranslateFolderREZKA(page, pageHtml)
    page.loading = false;
}
exports.season = function (page, data) {
    data = JSON.parse(data);
    log.d({
        route: 'season',
        data: data
    });

    page.loading = true;
    page.type = 'directory';
    page.metadata.title = data.title_year;

    referer = 'http://hdrezka.ag';
    api.call(page, data.url /*.replace(/\d+&e=\d+/, sN)*/ , null, function (pageHtml) {
        resp = pageHtml.text.toString();
        //https://regex101.com/r/3BPUoK/1/
        VideoBalancer = /video_balancer_options([^\;]+})/.exec(resp)[1];
        log.p('VideoBalancer:\n' + VideoBalancer);
        eval('options' + VideoBalancer);
        log.p({
            label: 'VideoBalancer',
            options: options
        });
        log.d('^^^^^^^^^^options has been update^^^^^^^^^');
        log.d('count episode: ' + options.episodes.length);
        //        iframe = data.url.replace(/\d+&e=\d+/, sN);
        for (i = 0; i < options.episodes.length; i++) {

            data.url = link(options.season, options.episodes[i], options.serial_token);
            //data.ref = "&ref=" + options.ref,
            log.d({
                uri: 'PREFIX + ":play:" + ',
                data: data
            });
            item = page.appendItem(PREFIX + ':play:' + JSON.stringify(data), 'video', {
                episode: {
                    number: fix_0(options.episodes[i])
                },
                title: fix_0(options.episodes[i]) +
                    ' \u0441\u0435\u0440\u0438\u044f',
                icon: data.icon
            });
            item.bindVideoMetadata({
                title: (data.title_en ? data.title_en : data.title) + ' S' + fix_0(options.season) + 'E' + fix_0(options.episodes[i])
            });
        }

        page.loading = false;
        page.metadata.title += ' | ' + +options.season + ' \u0441\u0435\u0437\u043e\u043d';
    });
};

function link(e, t, n) {
    var r = '/serial/' + n + '/iframe',
        i = '';
    80 != options.port && (i = ':' + options.port);
    var o = 1 == options.nocontrols ? '1' : '',
        s = 1 == options.nocontrols_translations ? '1' : '',
        a = 1 == options.nocontrols_seasons ? '1' : '',
        u = '?season=' + e + '&episode=' + t; //+ "&nocontrols=" + o + "&nocontrols_translations=" + s + "&nocontrols_seasons=" + a
    return options.proto + options.host + i + r + u;
}

// vyzov s url
// PREFIX:moviepage:url
exports.moviepage = function (page, mdata) {
    /{"url":"/.test(mdata) ? (data = JSON.parse(mdata)) : (data.url = mdata);
    log.d({
        function: 'moviepage',
        data: data
    });
    //page.metadata.logo = data.icon;
    //delaem zapros na stranicu

    api.call(page, data.url, null, function (pageHtml) {

        movie_page(page, pageHtml);
    });
    page.loading = false;
};

function fix_0(n) {
    return n > 9 ? "" + n : "0" + n;
};