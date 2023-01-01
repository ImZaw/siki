
# Siki

Provides you with movies/tvseries information in specific routes or using functions!
# Usage
## Using it in nodejs
```javascript
const { Siki } = require("siki");

(async()=> {
    const siki = new Siki("akwam")
    console.log(await siki.homePage())
    console.log(await siki.search("Red"))
    console.log(await siki.load("https://.."))
    console.log(await siki.loadLinks("https://..."))
})()
```
## Attaching routes to api
```javascript
const fastify = require("fastify")(); // a new fastify app
const { attachApi } = require("siki");

(async()=> {
    const app = await attachApi(fastify) // returns the fastifyApp after attaching certian routes.
    await app.listen({ port: 80 }, ()=> console.log("Server is up!")) // starting the server!
})()
```
### API Reference

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
#### Get homepage of provider

```http
  GET /:provider_name/home
```
#### Get search of movie/series in a provider

```http
  GET /:provider_name/search
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `q`      | `string` | **Required**. Query of search needed|

#### Get Information about a movie/series in a provider

```http
  GET /:provider_name/load
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `url`      | `string` | **Required**. The url of that movie/series |

#### Get video links of the movie/series episodes in a provider

```http
  GET /:provider_name/loadLinks
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `data`      | `any` | **Required**. The url of that movie/series episode (depends on site) |
