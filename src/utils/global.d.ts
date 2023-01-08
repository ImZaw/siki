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
        title: string,
        isMovie: boolean,
        url: string,
        posterUrl: string,
        year: number,
        rating: number,
    }
    interface movieInterface {
        title: string,
        url: string,
        posterUrl: string,
        year: number,
        plot: string,
        trailer: string,
        isMovie: true
    }
    interface episodeInterface {
        title: string,
        url: string,
        episode: number,
        season: number,
        thumbnail: string,
        plot: string,
    }
    interface seriesInterface {
        title: string,
        url: string,
        posterUrl: string,
        year: number,
        plot: string,
        trailer: string,
        isMovie: false,
        episodes: Array<episodeInterface>
    }
    interface mediaLink {
        title: string,
        raw: string,
        quality: number,
        headers: Array<Object>,
        m3u8: boolean,
    }
}