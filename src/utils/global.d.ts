export { };

declare global {
    const enum tvTypes {
        MOVIE = 0,
        SERIES = 1,
        ANIME = 2,
    }
    interface SikiClass {
        provider_name: string,
        homePage(): Promise<Array<homeInterface>>,
        search(query: string): Promise<Array<searchInterface>>,
        load(url: string): Promise<movieInterface | seriesInterface>,
        loadLinks(data: any): Promise<Array<mediaLink>>
    }
    interface ProviderClass {
        name: string,
        mainUrl: string,
        tvTypes: Array<tvTypes>,
        language: string,
        homePage(): Promise<Array<homeInterface>>,
        search(query: string): Promise<Array<searchInterface>>,
        load(url: string): Promise<movieInterface | seriesInterface>,
        loadLinks(data: any): Promise<Array<mediaLink>>
    }
    interface ExtractorClass {
        name: string,
        mainUrl: string,
        load(url: string): Promise<Array<mediaLink>>
    }
    interface homeInterface {
        title: string,
        posts: Array<searchInterface>
    }
    interface searchInterface {
        title: string,
        tvType: {code: tvTypes, name: string},
        url: string,
        posterUrl: string,
        year: number,
        rating: number,
        genres: Array<string>,
        data: any
    }
    interface movieInterface {
        title: string,
        url: string,
        posterUrl: string,
        year: number,
        plot: string,
        trailer: string,
        genres: Array<string>,
        age_rated: string,
        country: string,
        language: string,
        cast: Array<castInterface>,
        imdbId: string,
        rating: number,
        recommendation: Array<searchInterface>,
        tvType: {code: tvTypes.MOVIE, name: string},
        data: any
    }
    interface castInterface {
        name: string,
        knownAs: string,
        profile: string,
    }
    interface episodeInterface {
        title: string,
        url: string,
        episode: number,
        season: number,
        thumbnail: string,
        plot: string,
        type: "sub" | "dub" | "both",
        data: any,
    }
    interface seasonInterface {
        season_number: number,
        episodes: Array<episodeInterface>
    }
    interface seriesInterface {
        title: string,
        url: string,
        posterUrl: string,
        year: number,
        plot: string,
        trailer: string,
        genres: Array<string>,
        age_rated: string,
        country: string,
        language: string,
        cast: Array<castInterface>,
        imdbId: string,
        rating: number,
        recommendation: Array<searchInterface>,
        tvType: {code: tvTypes.SERIES, name: string},
        seasons: Array<seasonInterface>
    }
    interface animeInterface {
        title: string,
        url: string,
        posterUrl: string,
        year: number,
        plot: string,
        trailer: string,
        genres: Array<string>,
        age_rated: string,
        country: string,
        language: string,
        cast: Array<castInterface>,
        malId: string,
        aniId: string,
        rating: number,
        recommendation: Array<searchInterface>,
        tvType: {code: tvTypes.ANIME, name: string},
        seasons: Array<seasonInterface>
    }
    interface mediaLink {
        title: string,
        url: string,
        quality: number,
        subtitles: Array<{language: string, url: string}>,
        headers: Array<Object>,
        isM3U8: boolean,
    }
}
