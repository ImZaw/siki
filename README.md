
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
| `data`      | `any` | **Required**. The url of that movie/series (depends on site) |

#### Get video links of the movie/series episodes in a provider

```http
  GET /:provider_name/loadLinks
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `data`      | `any` | **Required**. The url of that movie/series episode (depends on site) |


## Warning
This code does not provide any media data. It is designed to perform specific functions and does not include any multimedia elements such as images, audio, or video. Users should not expect to find any media files or data when using this code. If you require media data, it may need to be sourced from an external source and integrated into the code accordingly.
