const request = require('request-promise-native');

class Client{

    constructor(token) {
        this.token = token;
        //use_backoff_sleep
    }

    async createSitemap(mySitemap) {

        const response = await request({
            url: `https://api.webscraper.io/api/v1/sitemap?api_token=${this.token}`,
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.parse(mySitemap),
            json: true

        });

        return response;
    }

    async createScrapingJob(sitemapId) {

         const response = await request({
            url : `https://api.webscraper.io/api/v1/scraping-job?api_token=${this.token}`,
            method :"POST",
            headers : {
                "content-type": "application/json",
            },
            body: {
                "sitemap_id": sitemapId,
                "driver": "fulljs",
                "page_load_delay": 2000,
                "request_interval": 2000
            },
            json: true
        });

        return response;
    }

    async getScrapingJob(scrapingJobId){

        const response = await request(`https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}?api_token=${this.token}`, {json: true}, function(err, res, body) {
            return body;
        });

        return response;
    }

    async getJson(scrapingJobId)
    {
        const response = await request(`https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}/json?api_token=${this.token}`, {json: true}, function(err, res, body) {
            return body;
        });
        return response;
    }
}

module.exports.Client = Client;
