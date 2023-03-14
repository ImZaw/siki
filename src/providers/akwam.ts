const axios = require("axios")
const cheerio = require("cheerio");
import { Cast, Episode, HomePage, Season, getImdbId, mediaLink, movieResponse, searchResponse, seriesResponse } from "../utils/convert";

axios.interceptors.request.use(config => {
    config.headers['Accept-Encoding'] = 'null';
    return config;
});
export default class AkwamProvider implements ProviderClass {
    name = "Akwam";
    tvTypes = [tvTypes.MOVIE, tvTypes.SERIES, tvTypes.ANIME];
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
                return searchResponse(
                    titleElement.text(),
                    (json.title == "Movies") ? tvTypes.MOVIE : tvTypes.SERIES,
                    titleElement.attr("href"),
                    post.find("div.entry-image img").attr("data-src"),
                    parseInt(post.find("div.entry-body span.badge-secondary").text().replace(/\D/g, '')),
                    parseFloat(post.find("span.rating").text()),
                    [],
                    titleElement.attr("href")
                )
            }).toArray()
            return HomePage(json.title, posts)
        }))
    }
    async search(query) {
        const request = await axios.get(`${this.mainUrl}/search?q=${query.replaceAll(" ", "+")}`)
        const $ = cheerio.load(request.data)
        return $("div[class=\"widget-body row flex-wrap\"] > div").map((index, element) => {
            const post = $(element)
            const titleElement = post.find("h3.entry-title > a")
            if (!/\/movie\/|\/series\//.test(titleElement.attr("href"))) return null;
            return searchResponse(
                titleElement.text(),
                (titleElement.attr("href").includes("/movie/")) ? tvTypes.MOVIE : tvTypes.SERIES,
                titleElement.attr("href"),
                post.find("div.entry-image img").attr("data-src"),
                parseInt(post.find("div.entry-body span.badge-secondary").text().replace(/\D/g, '')),
                parseFloat(post.find("span.rating").text()),
                [],
                titleElement.attr("href")
            )
        }).toArray()
    }
    async load(url: string): Promise<movieInterface | seriesInterface> {
        const request = await axios.get(url)
        const $ = cheerio.load(request.data)
        const title = $("h1.entry-title").text()
        const plot = $("div.widget-body > h2 p").text()
        const year = parseInt($("div[class=\"font-size-16 text-white mt-2\"]:contains(السنة)").text().replace(/.*:| /g, ""))
        const age_rated = $(".badge-info").text()
        const country = $("div[class=\"font-size-16 text-white mt-2\"]:contains(انتاج)").text().replace(/.*:/g, "")
        const language = $("div[class=\"font-size-16 text-white mt-2\"]:contains(اللغة)").text().replace(/.*:/g, "")
        const cast = $("div.col-lg-auto").map((index, element) => {
            let c = $(element)
            let name = c.find(".entry-title").text()
            return Cast(name, name, c.find("img.img-fluid").attr("src"))
        }).toArray()
        const imdbId = getImdbId($("div.mt-2:nth-child(2) > a:nth-child(1)").attr("href"))
        const rating = parseFloat($("span.mx-2").text().replace(/.*\//g, ""))
        const posterUrl = $("picture > img.img-fluid").first().attr("src")
        const trailer = $("a[class='btn btn-light btn-pill d-flex align-items-center']").attr("href")
        const genres = $("a.badge").map((index, element) => { return $(element).text() }).toArray()
        const rec = $("div.row > div[class='col-6 col-lg-2 col-md-4 mb-12 d-none']").map((index, element) => {
            const post = $(element)
            const titleElement = post.find("h3.entry-title > a")
            if (!/\/movie\/|\/series\//.test(titleElement.attr("href"))) return null;
            return searchResponse(
                titleElement.text(),
                (titleElement.attr("href").includes("/movie/")) ? tvTypes.MOVIE : tvTypes.SERIES,
                titleElement.attr("href"),
                post.find("div.entry-image img").attr("data-src"),
                parseInt(post.find("div.entry-body span.badge-secondary").text().replace(/\D/g, '')),
                parseFloat(post.find("span.rating").text()),
                [],
                titleElement.attr("href")
            )
        }).toArray()
        if (/movie/.test(url)) {
            return movieResponse(
                title, 
                url, 
                posterUrl, 
                year, 
                plot, 
                trailer,
                genres, 
                age_rated, 
                country, 
                language, 
                cast, 
                imdbId, 
                rating,
                rec,
                url
            )
        } else {
            const episodes = $("div.row > div[class='bg-primary2 p-4 col-lg-4 col-md-6 col-12']").map((index, element) => {
                const episode = $(element)
                const episodeTitleElement = episode.find("h2 > a")
                return Episode(
                    episodeTitleElement.text(),
                    episodeTitleElement.attr("href"),
                    parseInt(episodeTitleElement.text().replace(/:.*/g, "").replace(/\D/g, '')),
                    0,
                    episode.find("picture > img").attr("src"),
                    null,
                    null,
                    episodeTitleElement.attr("href")
                )
            })
            return seriesResponse(
                title, 
                url, 
                posterUrl, 
                year, 
                plot, 
                trailer, 
                genres, 
                age_rated, 
                country, 
                language, 
                cast, 
                imdbId, 
                rating,
                rec,
                [Season(0, episodes.toArray())]
            )
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
            return mediaLink(
                "Akwam",
                $(element).attr("src"),
                $(element).attr("size"),
                [],
                [{ "Referer": this.mainUrl }],
                $(element).attr("src").includes(".m3u8")
            )
        }).toArray()
        return sources
    }
}
