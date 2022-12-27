
# Fastify siki

Provides you with tons of information with specific routes



## Usage/Examples

```javascript
const fastify = require("fastify")(); // a new fastify app
const attachApi = require("fastify-siki");

(async()=> {
    const app = await attachApi(fastify) // returns the fastifyApp after attaching certian routes.
    await app.listen({ port: 80 }, ()=> console.log("Server is up!")) // starting the server!
})()
```


## API Reference

#### Get current providers
```http
  GET /current-providers
```
#### Get all the routes registered
```http
  GET /routes
```
#### Information about the provider
```http
  GET /:provider_name
```
