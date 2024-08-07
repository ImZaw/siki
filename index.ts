globalThis.providers = []
const { registerApi } = require("./src/utils/registerApi.js");
const axios = require("axios");

const akwam = require("./src/providers/akwam").default;
// const netfilm = require("./src/providers/netfilm").default; // no host
const wecima = require("./src/providers/wecima").default;

export { loadExtractor } from "./src/utils/extractors";
axios.interceptors.request.use(config => {
    config.headers['Accept-Encoding'] = 'null';
    return config;
});
export async function attachApi(fastifyApp) {
    globalThis.app = fastifyApp;
    globalThis.app.get("/", async (request, reply) => {
        reply.send({
            "message": "Hello!",
            "url": request.protocol + '://' + request.hostname
        })
    })
    globalThis.app.get("/current-providers", (req, res) => {
        res.send(globalThis.providers.map(c => {
            const cc = new c()
            return { name: cc.name, language: cc.language }
        }))
    })
    globalThis.app.get("/routes", async (request, reply) => {
        reply.send(globalThis.app.printRoutes())
    })
    // Init providers here
    await registerApi(akwam)
    await registerApi(wecima)
    // ====================
    return globalThis.app
}
export class Siki implements SikiClass {
    provider_name: string;
    providerClass: any;
    constructor(provider_name: string) {
        this.provider_name = provider_name
        const providerRequire = require("./src/providers/" + this.provider_name).default;
        this.providerClass = new providerRequire()
    }
    async homePage(): Promise<homeInterface[]> {
        try {
            return await this.providerClass.homePage()
        } catch(err) {
            return err.message
        }
    }
    async search(query: string): Promise<searchInterface[]> {
        try {
            return await this.providerClass.search(query)
        } catch(err) {
            return err.message
        }
    }
    async load(url: string): Promise<movieInterface | seriesInterface> {
        try {
            return await this.providerClass.load(url)
        } catch(err) {
            return err.message
        }
    }
    async loadLinks(data: any): Promise<mediaLink[]> {
        try {
            return await this.providerClass.loadLinks(data)
        } catch(err) {
            return err.message
        }
    }
}
// for tests
// (async()=>{
//     let app = await attachApi(require("fastify")({}));
//     await app.listen({port: 80}, () => {
//         console.log("Running")
//     })
// })()