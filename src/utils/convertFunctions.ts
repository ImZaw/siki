export function HomePage(
    title: string,
    posts: Array<searchInterface>
): homeInterface {
    return { title, posts }
}
export function searchResponse(
    name: string,
    isMovie: boolean,
    url: string,
    posterUrl: string,
    year: Number
): searchInterface {
    return { name, isMovie, url, posterUrl, year }
}
export function movieResponse(
    name: string,
    url: string,
    posterUrl: string,
    year: Number,
    plot: string,
    trailer: string
): movieInterface {
    return { name, url, posterUrl, year, plot, trailer }
}
export function Episode(
    title: string,
    url: string,
    episode: Number,
    season: Number,
    thumbnail: string,
    plot: string,
): episodeInterface {
    return { title, url, episode, season, thumbnail, plot }
}
export function seriesResponse(
    name: string,
    url: string,
    posterUrl: string,
    year: Number,
    plot: string,
    trailer: string,
    episodes: Array<episodeInterface>
): seriesInterface {
    return { name, url, posterUrl, year, plot, trailer, episodes }
}
export function mediaLink(
    name: string,
    raw: string,
    quality: Number,
    headers: Array<Object>,
    m3u8: boolean,
): mediaLink {
    return { name, raw, quality, headers, m3u8 }
}