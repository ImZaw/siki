import {tvTypesToWord} from "./convert";
export function registerApi(providerClass: ProviderClass | any): boolean {
    try {
        globalThis.providers.push(providerClass)
        const newProviderClass = new providerClass()
        globalThis.app.register((instance, opts, next) => {
            instance.get("/", async (request, reply) => {
                const hostUrl = request.protocol + '://' + request.hostname + "/" + newProviderClass.name.toLowerCase()
                try {
                    reply.code(200).send({
                        "status": 200,
                        "result": { 
                            "name": newProviderClass.name, 
                            "language": newProviderClass.language, 
                            "url": newProviderClass.mainUrl,
                            "tvTypes": newProviderClass.tvTypes.map(value=> ({code: value, name: tvTypesToWord(value)})),
                            "home": hostUrl + "/home"
                        }
                    })
                } catch (err) {
                    console.log(err)
                    reply.code(500).send({
                        "status": 500,
                        "message": err.message
                    })
                }
            })
            instance.get("/home", async (request, reply) => {
                const hostUrl = request.protocol + '://' + request.hostname + "/" + newProviderClass.name.toLowerCase()
                try {
                    const response = await newProviderClass.homePage()
                    reply.code(200).send({
                        "status": 200,
                        "result": response.map(value => {
                            value.posts = value.posts.map(obj => Object.assign(obj, { nextApi: hostUrl + "/load?data=" + obj.data }))
                            return value
                        })
                    })
                } catch (err) {
                    console.log(err)
                    reply.code(500).send({
                        "status": 500,
                        "message": err.message
                    })
                }
            })
            instance.get("/search", async (request, reply) => {
                const hostUrl = request.protocol + '://' + request.hostname + "/" + newProviderClass.name.toLowerCase()
                try {
                    const query = request.query.q
                    if (!query || query.length <= 0) throw new Error("`q` is required");
                    const response = await newProviderClass.search(query)
                    reply.code(200).send({
                        "status": 200,
                        "result": response.map(value =>
                            Object.assign(value, { nextApi: hostUrl + "/load?data=" + value.data })
                        )
                    })
                } catch (err) {
                    console.log(err)
                    reply.code(500).send({
                        "status": 500,
                        "message": err.message
                    })
                }
            })
            instance.get("/load", async (request, reply) => {
                const hostUrl = request.protocol + '://' + request.hostname + "/" + newProviderClass.name.toLowerCase()
                try {
                    const data = request.query.data
                    if (!data || data.length <= 0) throw new Error("`data` is required");
                    let response = await newProviderClass.load(data)
                    if (response.seasons != undefined) {
                        response.seasons = response.seasons.map(value => {
                            value.episodes = value.episodes.map(v=> 
                                Object.assign(v, { nextApi: hostUrl + "/loadLinks?data=" + v.data })
                                )
                            return value
                        })
                    } else {
                        response = Object.assign(response, { nextApi: hostUrl + "/loadLinks?data=" + response.data })
                    }
                    response.recommendation = response.recommendation.map(val=> Object.assign(val, { nextApi: hostUrl + "/load?data=" + val.data }))
                    reply.code(200).send({
                        "status": 200,
                        "result": response
                    })
                } catch (err) {
                    console.log(err)
                    reply.code(500).send({
                        "status": 500,
                        "message": err.message
                    })
                }
            })
            instance.get("/loadLinks", async (request, reply) => {
                try {
                    const data = request.query.data
                    if (!data || data.length <= 0) throw new Error("`data` is required");
                    const response = await newProviderClass.loadLinks(data)
                    reply.code(200).send({
                        "status": 200,
                        "result": response
                    })
                } catch (err) {
                    console.log(err)
                    reply.code(500).send({
                        "status": 500,
                        "message": err.message
                    })
                }
            })
            next()
        }, { prefix: newProviderClass.name.toLowerCase() })
        return true
    } catch (err) {
        console.log(err);
        return false
    }
}