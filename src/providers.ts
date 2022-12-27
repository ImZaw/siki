const { registerApi } = require("./utils/registerApi");
const akwam = require("./providers/akwam").default;

module.exports = async function attachApi(fastifyApp) {
    globalThis.app = fastifyApp;
    globalThis.app.get("/", async (request, reply) => {
        reply.send({
            "message": "Hello!",
            "author": "Zo#2966",
            "url": request.protocol + '://' + request.hostname
        })
    })
    globalThis.app.get("/current-providers", (req, res) => {
        res.send(globalThis.providers.map(c=>{
            var cc = new c()
            return {name: cc.name, language: cc.language}
        }))
    })
    globalThis.app.get("/routes", async (request, reply) => {
        reply.send(globalThis.app.printRoutes())
    })
    await registerApi(akwam)
	return globalThis.app
}