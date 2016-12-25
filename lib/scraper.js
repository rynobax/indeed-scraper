const request = require('request');
const cheerio = require('cheerio');
const chrono = require('chrono-node')

module.exports.query = function(query, cityName, radius, experienceLevel, maxAge){
  const q = new Query(query, cityName, radius, experienceLevel, maxAge);
  return q.getJobs();
};

function Query(query, cityName, radius, experienceLevel, maxAge){
  this.query = query;
  this.cityName = cityName;
  this.radius = radius;
  this.experienceLevel = experienceLevel;
  this.maxAge = maxAge;
  this.start = 0;
}

Query.prototype.url = function(){
  let q = 'https://www.indeed.com/jobs';
  q += '?q=' + this.query;
  q += '&l=' + this._cityNameForWeb();
  q += '&explvl=' + this.experienceLevel;
  q += '&sort=date';
  q += '&start=' + this.start;
  q += '&fromage=' + this.maxAge;
  q += '&radius=' + this.radius;
  return q;
}
Query.prototype._cityNameForWeb = function(){
  return this.cityName.replace(' ', '+').replace(',', '%2C');
};

/* Gets all the desired jobs for the city */
Query.prototype.getJobs = function(){
  return new Promise((resolve, reject) => {
    /* Recursive function that gets jobs until it can't anymore (Or shouldn't) */
    function getSomeJobs(self, jobs) {
      request(self.url(), (error, response, body) => {
        const parsed = parseJobList(body);
        jobs = jobs.concat(parsed.jobs);
        if(parsed.error !== null){
          // Got an error so reject
          reject(Error);
        }else if(parsed.continue === true){
          // Continue getting more jobs
          self.start += 10;
          getSomeJobs(self, jobs);
        }else{
          // We got all the jobs so stop looping
          jobs.cityName = self.cityName;
          resolve(jobs);
        }
      });
    }
    getSomeJobs(this, []);
  });
}

/* Parses a page of jobs */
function parseJobList(body){
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

    const url = 'https://www.indeed.com' + job.find('.jobtitle').children('a').attr('href');

    const summary = job.find('.summary').text();

    const company = job.find('.company').text().trim() || null;

    const location = job.find('.location').text().trim();

    let dateString = job.find('.date').text().trim();

    const age = dateString;

    if(dateString == 'Just posted') {
        dateString = 'now';
    }else if(dateString == '30+ days ago'){
      dateString = '31 days ago';
    }

    const date = chrono.parse(dateString)[0].ref;

    return {
      title: jobtitle,
      summary: summary,
      url: url,
      company: company,
      location: location,
      date: date,
      age: age
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