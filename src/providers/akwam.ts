const axios = require("axios")
const cheerio = require("cheerio");
import * as convert from "../utils/convertFunctions"

axios.interceptors.request.use(config => {
    config.headers['Accept-Encoding'] = 'null';
    return config;
});
export default class AkwamProvider implements ProviderClass {
    name = "Akwam";
    mainUrl = "https://on.akwam.cx";
    language = "ar";

    async homePage() {
        return await Promise.all([
            { "title": "Movies", "url": `${this.mainUrl}/movies` },
            { "title": "Series", "url": `${this.mainUrl}/series` }
        ].map(async json => {
            var request = await axios.get(json.url)
            var $ = cheerio.load(request.data)
            var posts = $("div[class=\"col-lg-auto col-md-4 col-6 mb-12\"]").map((index, element) => {
                var post = $(element)
                let titleElement = post.find("h3.entry-title > a")
                return convert.searchResponse(
                    titleElement.text(),
                    (json.title == "Movies"),
                    titleElement.attr("href"),
                    post.find("div.entry-image > picture > img").attr("src"),
                    Number(post.find("div[class=\"font-size-16 text-white mt-2\"]:contains(السنة)").text().replace(/\D/g, ''))
                )
            })
            return convert.HomePage(json.title, posts.toArray())
        }))
    }
    async search(query) {
        var request = await axios.get(`${this.mainUrl}/search?q=${query}`)
        var $ = cheerio.load(request.data)
        return $("div[class=\"col-lg-auto col-md-4 col-6 mb-12\"]").map((index, element) => {
            var post = $(element)
            let titleElement = post.find("h3.entry-title > a")
            if (!/\/movie\/|\/series\//.test(titleElement.attr("href"))) return null;
            return convert.searchResponse(
                titleElement.text(),
                titleElement.attr("href").includes("/movie/"),
                titleElement.attr("href"),
                post.find("div.entry-image > picture > img").attr("src"),
                post.find("span[class=\"badge badge-pill badge-secondary ml-1\"]").text()
            )
        }).toArray()
    }
    async load(url: string): Promise<movieInterface | seriesInterface> {
        var request = await axios.get(url)
        var $ = cheerio.load(request.data)
        var title = $("h1.entry-title").text()
        var plot = $("div.widget-body > h2 p").text()
        var year = Number($("div[class=\"font-size-16 text-white mt-2\"]:contains(السنة)").text().replace(/.*:| /g, ""))
        var posterUrl = $("picture > img.img-fluid").first().attr("src")
        var trailer = $("a[class='btn btn-light btn-pill d-flex align-items-center']").attr("href")
        if (/movie/.test(url)) {
            return convert.movieResponse(title, url, posterUrl, year, plot, trailer)
        } else {
            var episodes = $("div.row > div[class='bg-primary2 p-4 col-lg-4 col-md-6 col-12']").map((index, element) => {
                var episode = $(element)
                var episodeTitleElement = episode.find("h2 > a")
                return convert.Episode(
                    episodeTitleElement.text(),
                    episodeTitleElement.attr("href"),
                    Number(episodeTitleElement.text().replace(/:.*/g, "").replace(/\D/g, '')),
                    0,
                    episode.find("picture > img").attr("src"),
                    null
                )
            })
            return convert.seriesResponse(title, url, posterUrl, year, plot, trailer, episodes.toArray().sort(function (a, b) { return a.episode < b.episode; }))
        }
    }
    async loadLinks(data: any): Promise<Array<mediaLink>> {
        var request = await axios.get(data)
        var $ = cheerio.load(request.data)
        var watchLink = new URL($("a:contains(مشاهدة).link-btn").first().attr("href"))
        var iframeLink = this.mainUrl + watchLink.pathname + "/" + (new URL(data)).pathname.split("/")[2]
        var iframeRequest = await axios.get(iframeLink)
        $ = cheerio.load(iframeRequest.data)
        var sources = $("source").map((index, element) => {
            return convert.mediaLink(
                $(element).attr("src"),
                $(element).attr("size"),
                [{ "Referer": this.mainUrl }],
                $(element).attr("src").includes(".m3u8")
            )
        })
        return sources.toArray()
    }
}
