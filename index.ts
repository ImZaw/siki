globalThis.providers = []
const { registerApi } = require("./src/utils/registerApi.js");

const akwam = require("./src/providers/akwam").default;

export async function attachApi(fastifyApp) {
    globalThis.app = fastifyApp;
    globalThis.app.get("/", async (request, reply) => {
        reply.send({
            "message": "Hello!",
            "author": "Zo#2966",
            "url": request.protocol + '://' + request.hostname
        })
    })
    globalThis.app.get("/current-providers", (req, res) => {
        res.send(globalThis.providers.map(c => {
            var cc = new c()
            return { name: cc.name, language: cc.language }
        }))
    })
    globalThis.app.get("/routes", async (request, reply) => {
        reply.send(globalThis.app.printRoutes())
    })
    // Init providers here
    await registerApi(akwam)
    // ====================
    return globalThis.app
}
export class Siki implements SikiClass {
    provider_name: string;
    providerClass: any;
    constructor(provider_name: string) {
        this.provider_name = provider_name
        var providerRequire = require("./src/providers/" + this.provider_name + ".js").default;
        this.providerClass = new providerRequire()
    }
    async homePage(): Promise<homeInterface[]> {
        return await this.providerClass.homePage()
    }
    async search(query: string): Promise<searchInterface[]> {
        return await this.providerClass.search(query)
    }
    async load(url: string): Promise<movieInterface | seriesInterface> {
        return await this.providerClass.load(url)
    }
    async loadLinks(data: any): Promise<mediaLink[]> {
        return await this.providerClass.loadLinks(data)
    }
}