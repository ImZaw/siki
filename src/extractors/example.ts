export default class Example implements ExtractorClass {
    name = "Example"
    mainUrl= "https://example.com";
    async load(url: string): Promise<mediaLink[]> {
        return []
    }
}