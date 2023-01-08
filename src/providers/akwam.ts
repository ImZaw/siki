const axios = require("axios")
const cheerio = require("cheerio");
import * as convert from "../utils/convertFunctions"

axios.interceptors.request.use(config => {
    config.headers['Accept-Encoding'] = 'null';
    return config;
});
export default class AkwamProvider implements ProviderClass {
    name = "Akwam";
    mainUrl = "https://akwam.cx";
    language = "ar";

    async homePage() {
        return await Promise.all([
            { "title": "Movies", "url": `${this.mainUrl}/movies` },
            { "title": "Series", "url": `${this.mainUrl}/series` }
        ].map(async json => {            
            const request = await axios.get(json.url)
            const $ = cheerio.load(request.data)
            const posts = $("div[class=\"col-lg-auto col-md-4 col-6 mb-12\"]").map((index, element) => {
                const post = $(element)
                const titleElement = post.find("h3.entry-title > a")
                return convert.searchResponse(
                    titleElement.text(),
                    (json.title == "Movies"),
                    titleElement.attr("href"),
                    post.find("div.entry-image img").attr("data-src"),
                    parseInt(post.find("div.entry-body span.badge-secondary").text().replace(/\D/g, '')),
                    parseFloat(post.find("span.rating").text())
                )
            }).toArray()
            return convert.HomePage(json.title, posts)
        }))
    }
    async search(query) {
        const request = await axios.get(`${this.mainUrl}/search?q=${query.replaceAll(" ", "+")}`)
        const $ = cheerio.load(request.data)
        return $("div[class=\"widget-body row flex-wrap\"] > div").map((index, element) => {
            const post = $(element)
            const titleElement = post.find("h3.entry-title > a")
            if (!/\/movie\/|\/series\//.test(titleElement.attr("href"))) return null;
            return convert.searchResponse(
                titleElement.text(),
                titleElement.attr("href").includes("/movie/"),
                titleElement.attr("href"),
                post.find("div.entry-image img").attr("data-src"),
                parseInt(post.find("div.entry-body span.badge-secondary").text().replace(/\D/g, '')),
                parseFloat(post.find("span.rating").text())
            )
        }).toArray()
    }
    async load(url: string): Promise<movieInterface | seriesInterface> {
        const request = await axios.get(url)
        const $ = cheerio.load(request.data)
        const title = $("h1.entry-title").text()
        const plot = $("div.widget-body > h2 p").text()
        const year = parseInt($("div[class=\"font-size-16 text-white mt-2\"]:contains(السنة)").text().replace(/.*:| /g, ""))
        const posterUrl = $("picture > img.img-fluid").first().attr("src")
        const trailer = $("a[class='btn btn-light btn-pill d-flex align-items-center']").attr("href")
        if (/movie/.test(url)) {
            return convert.movieResponse(title, url, posterUrl, year, plot, trailer)
        } else {
            const episodes = $("div.row > div[class='bg-primary2 p-4 col-lg-4 col-md-6 col-12']").map((index, element) => {
                const episode = $(element)
                const episodeTitleElement = episode.find("h2 > a")
                return convert.Episode(
                    episodeTitleElement.text(),
                    episodeTitleElement.attr("href"),
                    parseInt(episodeTitleElement.text().replace(/:.*/g, "").replace(/\D/g, '')),
                    0,
                    episode.find("picture > img").attr("src"),
                    null
                )
            })
            return convert.seriesResponse(title, url, posterUrl, year, plot, trailer, episodes.toArray().sort(function (a, b) { return a.episode < b.episode; }))
        }
    }
    async loadLinks(data: any): Promise<Array<mediaLink>> {
        const request = await axios.get(data)
        let $ = cheerio.load(request.data)
        const watchLink = new URL($("a:contains(مشاهدة).link-btn").first().attr("href"))
        const iframeLink = this.mainUrl + watchLink.pathname + "/" + (new URL(data)).pathname.split("/")[2]
        const iframeRequest = await axios.get(iframeLink)
        $ = cheerio.load(iframeRequest.data)
        const sources = $("source").map((index, element) => {
            return convert.mediaLink(
                "Akwam",
                $(element).attr("src"),
                $(element).attr("size"),
                [{ "Referer": this.mainUrl }],
                $(element).attr("src").includes(".m3u8")
            )
        }).toArray()
        return sources
    }
}
