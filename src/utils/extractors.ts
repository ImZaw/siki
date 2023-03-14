const fs = require('fs');
interface result {
    success: boolean,
    result: Array<mediaLink>,
    error: string
}
export async function loadExtractor(url: string): Promise<result> {
    try {
        let uri = new URL(url)
        let extractors = fs.readdirSync("./src/extractors").map(file=> {
            let eClass = require("../extractors/"+file.replace(/\..*/g, "")).default
            return new eClass()
        })
        let matchedUrls = extractors.map(eClass=> eClass.mainUrl).map(url => {
            let mainUri = new URL(url)
            if(
                mainUri.origin == uri.origin
            ) return url
            else return null
        }).filter(Boolean);
        if(matchedUrls.length <= 0) throw Error("No such a provider")
        let eClass = extractors.find(eClass=> eClass.mainUrl == matchedUrls[0]) as ExtractorClass
        let result = await eClass.load(url)
        return { success: true, result: result, error: null }
    } catch(err) {
        return { success: false, result: [], error: err.message }
    }
}