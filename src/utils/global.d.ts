export { };

declare global {
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
        language: string,
        homePage(): Promise<Array<homeInterface>>,
        search(query: string): Promise<Array<searchInterface>>,
        load(url: string): Promise<movieInterface | seriesInterface>,
        loadLinks(data: any): Promise<Array<mediaLink>>
    }
    interface homeInterface {
        title: string,
        posts: Array<searchInterface>
    }
    interface searchInterface {
        name: string,
        isMovie: boolean,
        url: string,
        posterUrl: string,
        year: Number,
        rating: Number,
    }
    interface movieInterface {
        name: string,
        url: string,
        posterUrl: string,
        year: Number,
        plot: string,
        trailer: string
    }
    interface episodeInterface {
        title: string,
        url: string,
        episode: Number,
        season: Number,
        thumbnail: string,
        plot: string,
    }
    interface seriesInterface {
        name: string,
        url: string,
        posterUrl: string,
        year: Number,
        plot: string,
        trailer: string,
        episodes: Array<episodeInterface>
    }
    interface mediaLink {
        name: string,
        raw: string,
        quality: Number,
        headers: Array<Object>,
        m3u8: boolean,
    }
}