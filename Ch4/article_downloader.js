var request = require('request');
var fs = require('fs');

let page = 0;
let interval = undefined;
const TOTAL_PAGES = 100;

let download = (section_name = undefined) => {
        request.get({
                url: "https://api.nytimes.com/svc/search/v2/articlesearch.json",
                qs: {
                        'api-key': process.argv[3],
                        'fq':'section_name=' + section_name,
                        'type_of_material': "Article",
                        'sort':'newest',
                        'fl':'web_url,headline',
                        'page': page
                },
        }, (err, response, body) => {
                if(err || response.statusCode !== 200){
                        throw new Error(JSON.stringify(response.toJSON()));
                }
                body = JSON.parse(body);
                console.log("downloaded " + body.response.docs.length 
                        + " for section " + section_name 
                        + ", page " + page);
                body.response.docs.map((doc) => request.get(doc.web_url, 
                                (err, res, bod)=>{
                                        if(err){
                                                throw new Error(err);
                                        }
                                        fs.writeFileSync(section_name + ".csv", doc.web_url + "\t" + 
                                                doc.headline.main + "\t" + 
                                                bod.trim().replace(/(\n|\r|\t)/g, '') + "'" + "\n", {flag:"a"})
                                }));
                page = page + 1;
                if(page === TOTAL_PAGES){
                        clearInterval(interval);
                } 
        });     
}

interval = setInterval(download, 1500, process.argv[2]); 