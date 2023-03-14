const axios = require("axios")
import { Episode, HomePage, Season, mediaLink, movieResponse, searchResponse, seriesResponse } from "../utils/convert";
axios.interceptors.request.use(config => {
    config.headers['Accept-Encoding'] = 'null';
    return config;
});
export default class NetfilmProvider implements ProviderClass {
    name = "Netfilm";
    tvTypes = [tvTypes.MOVIE, tvTypes.SERIES, tvTypes.ANIME];
    mainUrl = "https://net-film.vercel.app/api";
    language = "en";

    async homePage() {
        let finalList = new Array()
        await Promise.all([
            { "url": `${this.mainUrl}/home?page=0` },
            { "url": `${this.mainUrl}/home?page=1` },
            { "url": `${this.mainUrl}/home?page=2` }
        ].map(async json => {            
            const response = (await axios.get(json.url)).data.data.homeSections
            response.forEach(element => {
                let posts = element.homeMovies.map(el=> {
                    return searchResponse(
                        el.title,
                        (el.category == 1) ? tvTypes.SERIES : tvTypes.MOVIE,
                        `${this.mainUrl}/detail?category=${el.category}&id=${el.id}`,
                        el.imageUrl,
                        null,
                        null,
                        [],
                        btoa(`${this.mainUrl}/detail?category=${el.category}&id=${el.id}`)
                    )
                })
                finalList.push(HomePage(element.homeSectionName, posts))
            });
        }))
        return finalList
    }
    async search(query) {
        const res = (await axios.get(`${this.mainUrl}/search?keyword=${query.replaceAll(" ", "%20")}&size=25`)).data
        return res.data.results.map((index, element) => {
            let value = res.data.results[element]
            return searchResponse(
                value.name,
                (value.domainType == 1) ? tvTypes.SERIES : tvTypes.MOVIE,
                `${this.mainUrl}/detail?category=${value.domainType}&id=${value.id}`,
                value.coverVerticalUrl,
                parseInt(value.releaseTime),
                parseFloat(value.sort),
                [],
                btoa(`${this.mainUrl}/detail?category=${value.domainType}&id=${value.id}`)
            )
        })
    }
    async load(url: string): Promise<movieInterface | seriesInterface> {
        const res = (await axios.get(Buffer.from(url, 'base64').toString("utf-8"))).data.data
        const title = res.name
        const plot = res.introduction
        const year = parseInt(res.year)
        const posterUrl = res.coverHorizontalUrl
        const rating = res.score
        const genres = res.tagList.map(value=> value.name)
        const country = res.areaList[0].name
        const trailer = null
        const rec = res.likeList.map(value=> {
            return searchResponse(
                value.name, 
                (value.category == 1) ? tvTypes.SERIES : tvTypes.MOVIE,
                `${this.mainUrl}/detail?category=${value.category}&id=${value.id}`,
                value.coverVerticalUrl,
                null,
                null,
                null,
                btoa(`${this.mainUrl}/detail?category=${value.category}&id=${value.id}`)
                )
        })
        if (res.category == 0) {
            return movieResponse(
                title, 
                `${this.mainUrl}/episode?category=${res.category}&id=${res.id}&episode=${res.episodeVo[0].id}`, 
                posterUrl, 
                year, 
                plot, 
                trailer,
                genres,
                null,
                country,
                null,
                null,
                null,
                rating,
                rec,
                btoa(`${this.mainUrl}/episode?category=${res.category}&id=${res.id}&episode=${res.episodeVo[0].id}`)
            )
        } else {
            const episodes = res.episodeVo.map((index, element) => {
                let value = res.episodeVo[element]
                return Episode(
                    `Episode ${value.seriesNo}`,
                    `${this.mainUrl}/episode?category=${res.category}&id=${res.id}&episode=${value.id}`,
                    parseInt(value.seriesNo),
                    res.seriesNo,
                    res.coverHorizontalUrl,
                    null,
                    null,
                    btoa(`${this.mainUrl}/episode?category=${res.category}&id=${res.id}&episode=${value.id}`)
                )
            })
            return seriesResponse(
                title, 
                atob(url), 
                posterUrl, 
                year, 
                plot, 
                trailer, 
                genres,
                null,
                country,
                null,
                null,
                null,
                rating,
                rec,
                [Season(res.seriesNo, episodes)]
            )
        }
    }
    async loadLinks(data: any): Promise<Array<mediaLink>> {
        const res = (await axios.get(Buffer.from(data, 'base64').toString())).data.data
        return res.qualities.map((index, element) => {
            let el = res.qualities[element]
            return mediaLink(
                "Netfilm",
                el.url,
                el.quality,
                res.subtitles.map(sub=> ({ name: sub.language, url: sub.url})),
                [],
                el.url.includes(".m3u8")
            )
        })
    }
}