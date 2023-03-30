const axios = require("axios")
const cheerio = require("cheerio");
import { Cast, Episode, HomePage, Season, getImdbId, mediaLink, movieResponse, searchResponse, seriesResponse } from "../utils/convert";

function getImage(st): string {
    if(st == undefined) return undefined;
    return st.replace(new RegExp("--im(age|g):url\\(|\\);", "g"), "")
}
function toSearchResponse(element): searchInterface {
    let select = cheerio.load(element)
    let url = select("div.Thumb--GridItem a")
    let posterUrl = getImage(select("span.BG--GridItem")?.attr("data-lazy-style"))
    let year = select("div.GridItem span.year")?.text()
    let title = select("div.Thumb--GridItem strong").text()
            .replace(year, "")
            .replace(/مشاهدة|فيلم|مسلسل|مترجم/g, "")
            .replace("( نسخة مدبلجة )", " ( نسخة مدبلجة ) ")
    return searchResponse(
        title,
        (url.attr("title").includes("فيلم")) ? tvTypes.MOVIE : tvTypes.SERIES,
        url.attr("href"),
        posterUrl,
        year.replace(/\D/g, ""),
        null,
        [],
        url.attr("href")
    )
} 

export default class WeCimaProvider implements ProviderClass {
    name = "WeCima";
    tvTypes = [tvTypes.MOVIE, tvTypes.SERIES, tvTypes.ANIME];
    mainUrl: string = "https://wecima.tube";
    language = "ar";
    
    async homePage() {
        return await Promise.all([
            { "title": "Top Movies", "url": `${this.mainUrl}/movies/top` },
            { "title": "New Movies", "url": `${this.mainUrl}/movies` },
            { "title": "Recently Added Movies", "url": `${this.mainUrl}/movies/recent` },
            { "title": "Top Series", "url": `${this.mainUrl}/seriestv/top` },
            { "title": "New Series", "url": `${this.mainUrl}/seriestv/new` },
        ].map(async json => {            
            const request = await axios.get(json.url)
            const $ = cheerio.load(request.data)
            const posts = $("div.Grid--WecimaPosts div.GridItem").map((index, element) => {
                return toSearchResponse(element)
            }).toArray()
            return HomePage(json.title, posts)
        }))
    }
    async search(query) {
        let q = query.replace(" ", "%20")
        let result: searchInterface[] = []
        await Promise.all([
            { "url": `${this.mainUrl}/search/${q}` },
            { "url": `${this.mainUrl}/search/${q}/list/series/` },
            { "url": `${this.mainUrl}/search/${q}/list/anime/` },
        ].map(async json => {            
            const request = await axios.get(json.url)
            const $ = cheerio.load(request.data)
            $("div.Grid--WecimaPosts div.GridItem").map((index, element) => {
                let el = $(element)
                if(el.text().includes("اعلان")) return;
                result.push(toSearchResponse(element))
            })
        }))
        return result
    }
    async load(url: string): Promise<movieInterface | seriesInterface> {
        const request = await axios.get(url)
        let doc = { select: cheerio.load(request.data)}
        let isMovie = doc.select("ol li:nth-child(3)").text().includes("افلام")
        let posterUrl =
            getImage(doc.select("wecima.separated--top")?.attr("data-lazy-style"))
                ?? doc.select("meta[itemprop=\"thumbnailUrl\"]")?.attr("content")
                ?? getImage(doc.select("wecima.separated--top")?.attr("style"))
        let year = doc.select("div.Title--Content--Single-begin h1 a.unline")?.text()?.replace(/\D/g, '')
        let title = doc.select("div.Title--Content--Single-begin h1").text()
            .replace(`(${year})`, "")
            .replace(/مشاهدة|فيلم|مسلسل|مترجم|انمي/g, "")
        // A bit iffy to parse twice like this, but it'll do.
        let duration =
            doc.select("ul.Terms--Content--Single-begin li:contains(المدة)").text()?.replace(/\D/g, '')

        let synopsis = doc.select("div.StoryMovieContent").text()
            || doc.select("div.PostItemContent").text()

        let tags = doc.select("li:contains(النوع) > p > a").map((index, element) => doc.select(element).text()).toArray()

        let countryAndLanguage = doc.select("li:contains(البلد و اللغة) > p > a").map((index, element) => doc.select(element).text()).toArray()
        
        let age_rated = doc.select("li:contains(التصنيف) > p").text()

        let actors = doc.select("div.List--Teamwork > ul.Inner--List--Teamwork > li").map((index, element) => {
            let el = doc.select(element)
            let name = el.find("a > div.ActorName > span")?.text()
            let image = getImage(el.attr("style"))
            return Cast(name, name, image)
        }).toArray()
        let recommendations =
            doc.select("div.Grid--WecimaPosts div.GridItem").map((index, element) => {
                return toSearchResponse(element)
            }).toArray()
        let trailer = doc.select("iframe[name=\"trailer\"]").attr("data-ifr")
        if (isMovie) {
            return movieResponse(
                title, 
                url, 
                posterUrl, 
                year, 
                synopsis, 
                trailer,
                tags, 
                age_rated, 
                countryAndLanguage[0], 
                countryAndLanguage[1], 
                actors, 
                null, 
                null,
                recommendations,
                url
            )
        } else {
            async function getMoreEpisodes(pageDoc: { select: any }, episodesArray, mainUrl) {
                let episodes = episodesArray
                let pageMoreButton = pageDoc.select("div.MoreEpisodes--Button")
                if(pageMoreButton.attr("data-term") == undefined) return episodes
                let n = pageDoc.select("div.Episodes--Seasons--Episodes a").length
                let totals = pageDoc.select("div.Episodes--Seasons--Episodes a").first().text().replace(/\D/g, "")
                let mEPS = [
                    n,
                    n + 40,
                    n + 80,
                    n + 120,
                    n + 160,
                    n + 200,
                    n + 240,
                    n + 280,
                    n + 320,
                    n + 360,
                    n + 400,
                    n + 440,
                    n + 480,
                    n + 520,
                    n + 660,
                    n + 700,
                    n + 740,
                    n + 780,
                    n + 820,
                    n + 840,
                    n + 860,
                    n + 900,
                    n + 940,
                    n + 980,
                    n + 1020,
                    n + 1060,
                    n + 1100,
                    n + 1140,
                    n + 1180,
                    n + 1220,
                    totals
                ]
                await Promise.all(mEPS.map(async (element, index) => {
                    if(element > totals) return;
                    let ajaxUrl = `${mainUrl}/AjaxCenter/MoreEpisodes/${pageMoreButton.attr("data-term")}/${element}`
                    let response = (await axios.get(ajaxUrl)).data
                    let $ = cheerio.load(response.output.replace(/\\/g, ""))
                    $("a").map((index, element) => {
                        let el = $(element)
                        episodes.push(Episode(
                            el.text(),
                            el.attr("href"),
                            el.text().replace(/\D/g, ""),
                            null,
                            null,
                            "sub",
                            el.attr("href")
                        ))
                    })
                }))
                return episodes
            }
            let seasons: seasonInterface[] = []
            let seasonsElements = doc.select("div.List--Seasons--Episodes > a.activable")
            let moreButton = doc.select("div.MoreEpisodes--Button")
            let currentSeason =
                doc.select("div.List--Seasons--Episodes a.selected").text()?.replace(/\D/g, "")
            let currentEpisodes = doc.select("div.Episodes--Seasons--Episodes a")
                .map((index, element) => {
                    let el = doc.select(element)
                    return Episode(
                        el.text(),
                        el.attr("href"),
                        el.text()?.replace(/\D/g, ""),
                        null,
                        null,
                        "sub",
                        el.attr("href")
                    )
                }).toArray()
            if (moreButton) {
                currentEpisodes = await getMoreEpisodes(doc, currentEpisodes, this.mainUrl)
            }
            seasons.push(Season(currentSeason, currentEpisodes))
            if (seasonsElements.length > 1) {
                await Promise.all(seasonsElements.map(async (index, element) => {
                    let el = doc.select(element)
                    let url = el.attr("href")
                    if(url.includes("%d9%85%d8%af%d8%a8%d9%84%d8%ac")) return;
                    let seasonRequest = await axios.get(url)
                    let seasonDoc = { select: cheerio.load(seasonRequest.data)}
                    let FmoreButton = seasonDoc.select("div.MoreEpisodes--Button")
                    let Fseason = seasonDoc.select("div.List--Seasons--Episodes a.selected").text().replace(/\D/g, "") ?? 1
                    let FcurrentEpisodes = seasonDoc.select("div.Seasons--Episodes div.Episodes--Seasons--Episodes a").map((index, element) => {
                        let el = seasonDoc.select(element)
                        return Episode(
                            el.text(),
                            el.attr("href"),
                            el.text().replace(/\D/g, ""),
                            null,
                            null,
                            "sub",
                            el.attr("href")
                        )
                    }).toArray()
                    if (FmoreButton != undefined) {
                        FcurrentEpisodes = await getMoreEpisodes(seasonDoc, FcurrentEpisodes, this.mainUrl)
                    }
                    seasons.push(Season(Fseason, FcurrentEpisodes))
                }))
            }
            return seriesResponse(
                title, 
                url, 
                posterUrl, 
                year, 
                synopsis, 
                trailer, 
                tags, 
                age_rated, 
                countryAndLanguage, 
                countryAndLanguage, 
                actors, 
                null, 
                null,
                recommendations,
                seasons
            )
        }
    }
    async loadLinks(data: any): Promise<Array<mediaLink>> {
        let request = await axios.get(data)
        let $ = cheerio.load(request.data)
        return $("ul.List--Download--Wecima--Single:nth-child(2) li").map((index, element)=> {
            let el = $(element)
            let linkElement = el.find("a")
            return mediaLink(
                "WeCima",
                linkElement.attr("href"),
                linkElement.find("resolution").text().replace(/\D/g, "") ?? 0,
                [],
                [{ "Referer": this.mainUrl }],
                linkElement.attr("href").includes(".m3u8")
            )
        }).toArray()
    }
}
