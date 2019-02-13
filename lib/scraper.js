const request = require('request');
const cheerio = require('cheerio');

module.exports.query = function(queryObject){
  const q = new Query(queryObject);
  return q.getJobs();
};

function Query(qo){
  // query variables
  this.host = qo.host || 'www.indeed.com';
  this.query = qo.query || '';
  this.city = qo.city || '';
  this.radius = qo.radius || '25';
  this.level = qo.level || '';
  this.maxAge = qo.maxAge || '';
  this.sort = qo.sort || '';
  this.jobType = qo.jobType || '';

  // internal variables
  this.start = 0;
  this.limit = Number(qo.limit) || 0;
}

Query.prototype.url = function(){
  let q = 'https://' + this.host + '/jobs';
  q += '?q=' + this.query;
  q += '&l=' + this._cityNameForWeb();
  q += '&radius=' + this.radius;
  q += '&explvl=' + this.level;
  q += '&fromage=' + this.maxAge;
  q += '&sort=' + this.sort;
  q += '&jt=' + this.jobType;
  q += '&start=' + this.start;
  return q;
}
Query.prototype._cityNameForWeb = function(){
  return this.city.replace(' ', '+').replace(',', '%2C');
};

/* Gets all the desired jobs for the city */
Query.prototype.getJobs = function(){
  return new Promise((resolve, reject) => {
    /* Recursive function that gets jobs until it can't anymore (Or shouldn't) */
    function getSomeJobs(self, jobs) {
      request(self.url(), (error, response, body) => {
        const parsed = parseJobList(body, self.host);
        jobs = jobs.concat(parsed.jobs);
        if(parsed.error !== null){
          // Got an error so reject
          reject(Error);
        }else if(parsed.continue === true){
          // If we reach the limit stop looping
          if(self.limit != 0 && jobs.length > self.limit){
            while(jobs.length != self.limit) jobs.pop();
            resolve(jobs);
          }else{
            // Continue getting more jobs
            self.start += 10;
            getSomeJobs(self, jobs);
          }
        }else{
          // We got all the jobs so stop looping
          resolve(jobs);
        }
      });
    }
    getSomeJobs(this, []);
  });
}

/* Parses a page of jobs */
function parseJobList(body, host){
  const $ = cheerio.load(body);
  const jobTable = $('#resultsCol');
  const jobs = jobTable.find('.result');
  let cont = true;

  // Filter out ads
  const filtered = jobs.filter((i, e) => {
    const job = $(e);
    const children = job.children();
    return !children.hasClass('sdn') && !children.hasClass('sjcl');
  })

  // Create objects
  const jobObjects = filtered.map((i, e) => {
    const job = $(e);

    const jobtitle = job.find('.jobtitle').text().trim();

    const url = 'https://' + host + job.find('.jobtitle').children('a').attr('href');

    const summary = job.find('.summary').text();

    const company = job.find('.company').text().trim() || null;

    const location = job.find('.location').text().trim();

    const postDate = job.find('.date').text().trim();

    const salary = job.find('.salary.no-wrap').text().trim();

    return {
      title: jobtitle,
      summary: summary,
      url: url,
      company: company,
      location: location,
      postDate: postDate,
      salary: salary
    };
  }).get();

  const pageText = $('#searchCount').text();
  const toNum = pageText.substring(pageText.indexOf('to ')+3, pageText.indexOf(' of'));
  const ofNum = pageText.substr(pageText.indexOf('of ')+3);

  if(jobTable.children().hasClass('dupetext')){
    // We haven't seen all the results but indeed says the rest are duplicates
    cont = false;
  }else if(toNum == ofNum){
    // We have seen all the results
    cont = false;
  }

  return {
    error: null,
    continue: cont,
    jobs: jobObjects
  };
}
