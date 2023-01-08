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
                            "home": hostUrl + "/home"
                        }
                    })
                } catch (err) {
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
                            value.posts = value.posts.map(obj => Object.assign(obj, { nextApi: hostUrl + "/load?url=" + obj.url }))
                            return value
                        })
                    })
                } catch (err) {
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
                            Object.assign(value, { nextApi: hostUrl + "/load?url=" + value.url })
                        )
                    })
                } catch (err) {
                    reply.code(500).send({
                        "status": 500,
                        "message": err.message
                    })
                }
            })
            instance.get("/load", async (request, reply) => {
                const hostUrl = request.protocol + '://' + request.hostname + "/" + newProviderClass.name.toLowerCase()
                try {
                    const url = request.query.url
                    if (!url || url.length <= 0) throw new Error("`url` is required");
                    new URL(url)
                    let response = await newProviderClass.load(url)
                    if (response.episodes != undefined) {
                        response.episodes = response.episodes.map(value => Object.assign(value, { nextApi: hostUrl + "/loadLinks?data=" + value.url }))
                    } else {
                        response = Object.assign(response, { nextApi: hostUrl + "/loadLinks?data=" + response.url })
                    }
                    reply.code(200).send({
                        "status": 200,
                        "result": response
                    })
                } catch (err) {
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