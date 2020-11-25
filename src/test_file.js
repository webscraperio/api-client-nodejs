const request = require('request-promise-native');

var today = new Date();
var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();

let mySitemap = `{"_id":"${time}","startUrl":["https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"],"selectors":[{"id":"element","type":"SelectorElement","parentSelectors":["_root"],"selector":"div.col-sm-4","multiple":true,"delay":0},{"id":"product_name","type":"SelectorText","parentSelectors":["element"],"selector":"a","multiple":false,"regex":"","delay":0},{"id":"product_price","type":"SelectorText","parentSelectors":["element"],"selector":"h4.pull-right","multiple":false,"regex":"","delay":0}]}`;

(async () => {
    const response = await request({
        url : 'https://api.webscraper.io/api/v1/sitemap?api_token=kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8',
        method :"POST",
        headers : {
            "content-type": "application/json",
        },
        body: JSON.parse(mySitemap),
        json: true
    });

    const res = await request({
        url : 'https://api.webscraper.io/api/v1/scraping-job?api_token=kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8',
        method :"POST",
        headers : {
            "content-type": "application/json",
        },
        body: {
            "sitemap_id": JSON.parse(response.data.id),
            "driver": "fulljs",
            "page_load_delay": 2000,
            "request_interval": 2000
        },
        json: true
    });

    var finished = false;
    while(!finished){

        request(`https://api.webscraper.io/api/v1/scraping-job/${JSON.stringify(res.data.id)}?api_token=kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8`, {json: true}, function(err, resii, body) {
            if(body.data.status == "finished"){
                console.log("this job is finished");
                doThingsWithJson();
                finished = true;
            }else
                console.log(body.data.status);
        });
        await sleep(2000)
    }
    function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};

    function doThingsWithJson(){

        request(`https://api.webscraper.io/api/v1/scraping-job/${JSON.stringify(res.data.id)}/json?api_token=kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8`, {json: true}, function(err, resi, body) {

            let strLines = body.split("\n");
            let currentHighest = [0,0];
            let current = 0;

            for(var i = 0; i < strLines.length - 1; i++){
                current = parseInt(JSON.parse(strLines[i]).product_price.replace("$", ""));

                if (current > currentHighest[0]){
                    currentHighest[0] = current;
                    currentHighest[1] = i;
                }
            }

            console.log(`the most expensive product is ${JSON.parse(strLines[currentHighest[1]]).product_name} and its price is ${JSON.parse(strLines[currentHighest[1]]).product_price}`)

            let mynumber = 1;
        });

    }

})();
