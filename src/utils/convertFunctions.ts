export function HomePage(
    title: string,
    posts: Array<searchInterface>
): homeInterface {
    return { title, posts }
}
export function searchResponse(
    title: string,
    isMovie: boolean,
    url: string,
    posterUrl: string,
    year: Number,
    rating: Number
): searchInterface {
    return { title, isMovie, url, posterUrl, year, rating }
}
export function movieResponse(
    title: string,
    url: string,
    posterUrl: string,
    year: Number,
    plot: string,
    trailer: string
): movieInterface {
    return { title, url, posterUrl, year, plot, trailer, isMovie: true }
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
    title: string,
    url: string,
    posterUrl: string,
    year: Number,
    plot: string,
    trailer: string,
    episodes: Array<episodeInterface>
): seriesInterface {
    return { title, url, posterUrl, year, plot, trailer, isMovie: false, episodes }
}
export function mediaLink(
    title: string,
    raw: string,
    quality: Number,
    headers: Array<Object>,
    m3u8: boolean,
): mediaLink {
    return { title, raw, quality, headers, m3u8 }
}