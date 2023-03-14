export function HomePage(
    title: string,
    posts: Array<searchInterface>
): homeInterface {
    return { title, posts }
}
export function searchResponse(
    title: string,
    tvType: tvTypes,
    url: string,
    posterUrl: string,
    year: number,
    rating: number,
    genres: Array<string>,
    data: any
): searchInterface {
    return { title, tvType: {code: tvType, name: tvTypesToWord(tvType)}, url, posterUrl, year, rating, genres, data }
}
export function movieResponse(
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
    data: any
): movieInterface {
    return { title, url, posterUrl, year, plot, trailer, genres, age_rated, country, language, cast, imdbId, rating, recommendation, tvType: {code: tvTypes.MOVIE, name: tvTypesToWord(tvTypes.MOVIE)}, data }
}
export function Episode(
    title: string,
    url: string,
    episode: number,
    season: number,
    thumbnail: string,
    plot: string,
    type: "sub" | "dub" | "both",
    data: any,
): episodeInterface {
    return { title, url, episode, season, thumbnail, plot, type, data }
}
export function Season(
    season_number: number,
    episodes: Array<episodeInterface>
): seasonInterface {
    return { season_number, episodes }
}

export function seriesResponse(
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
    seasons: Array<seasonInterface>
): seriesInterface {
    return { title, url, posterUrl, year, plot, trailer, genres, age_rated, country, language, cast, imdbId, rating, recommendation, tvType: {code: tvTypes.SERIES, name: tvTypesToWord(tvTypes.SERIES)}, seasons }
}
export function animeResponse(
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
    seasons: Array<seasonInterface>
): animeInterface {
    return { title, url, posterUrl, year, plot, trailer, genres, age_rated, country, language, cast, malId, aniId, rating, recommendation, tvType: {code: tvTypes.ANIME, name: tvTypesToWord(tvTypes.ANIME)}, seasons }
}
export function mediaLink(
    title: string,
    url: string,
    quality: number,
    subtitles: Array<{language: string, url: string}>,
    headers: Array<Object>,
    isM3U8: boolean,
): mediaLink {
    return { title, url, quality, subtitles, headers, isM3U8 }
}
export function Cast(
    name: string,
    knownAs: string,
    profile: string,
) {
    return { name, knownAs, profile }
}
export function tvTypesToWord(tvType: tvTypes) {
    let types = {
        [tvTypes.MOVIE]: "Movie",
        [tvTypes.SERIES]: "TVSeries",
        [tvTypes.ANIME]: "Anime",
    }    
    return types[tvType]
}
export function getImdbId(url) {
    return url.match(/tt[1-9].*[1-9]/g)[0]
}