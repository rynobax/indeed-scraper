const request = require("request");
const cheerio = require("cheerio");

module.exports.query = function(queryObject) {
  const q = new Query(queryObject);
  return q.getJobs();
};

function Query(qo) {
  // query variables
  this.host = qo.host || "www.indeed.com";
  this.query = qo.query || "";
  this.city = qo.city || "";
  this.radius = qo.radius || "25";
  this.level = qo.level || "";
  this.maxAge = qo.maxAge || "";
  this.sort = qo.sort || "";
  this.jobType = qo.jobType || "";
  this.excludeSponsored = qo.excludeSponsored || false;

  // internal variables
  this.start = 0;
  this.limit = Number(qo.limit) || 0;
}

Query.prototype.url = function() {
  let q = "https://" + this.host + "/jobs";
  q += "?q=" + this.query;
  q += "&l=" + this.city;
  q += "&radius=" + this.radius;
  q += "&explvl=" + this.level;
  q += "&fromage=" + this.maxAge;
  q += "&sort=" + this.sort;
  q += "&jt=" + this.jobType;
  q += "&start=" + this.start;
  q += "&limit=50";
  return encodeURI(q);
};

/* Gets all the desired jobs for the city */
Query.prototype.getJobs = function() {
  const excludeSponsored = this.excludeSponsored;
  return new Promise((resolve, reject) => {
    /* Recursive function that gets jobs until it can't anymore (Or shouldn't) */
    function getSomeJobs(self, jobs) {
      request(self.url(), (error, response, body) => {
        const parsed = parseJobList(body, self.host, excludeSponsored);
        jobs = jobs.concat(parsed.jobs);
        if (parsed.error !== null) {
          // Got an error so reject
          reject(Error);
        } else if (parsed.continue === true) {
          // If we reach the limit stop looping
          if (self.limit != 0 && jobs.length >= self.limit) {
            while (jobs.length != self.limit) jobs.pop();
            resolve(jobs);
          } else {
            // Continue getting more jobs
            self.start += 50;
            getSomeJobs(self, jobs);
          }
        } else {
          // We got all the jobs so stop looping
          resolve(jobs);
        }
      });
    }
    getSomeJobs(this, []);
  });
};

/* Parses a page of jobs */
function parseJobList(body, host, excludeSponsored) {
  const $ = cheerio.load(body);
  const jobTable = $("#resultsCol");
  const jobs = jobTable.find(".result");
  let cont = true;

  // Filter out ads
  const filtered = excludeSponsored
    ? jobs.filter((_, e) => {
        const job = $(e);
        const footer = job.find(".jobsearch-SerpJobCard-footer");
        const spanText = Array.from(
          footer.find("span").map((_, span) => $(span).text())
        );
        const isSponsered = spanText.some(text =>
          text.toLowerCase().includes("sponsored")
        );
        return !isSponsered;
      })
    : jobs;

  // Create objects
  const jobObjects = filtered
    .map((i, e) => {
      const job = $(e);

      const jobtitle = (job.find(".jobtitle").attr("title") || job.find(".jobtitle").text()).trim();

      const url = "https://" + host + job.find(".jobtitle").attr("href");

      const summary = job
        .find(".summary")
        .text()
        .trim();

      const company =
        job
          .find(".company")
          .text()
          .trim() || null;

      const location = job
        .find(".location")
        .text()
        .trim();

      const postDate = job
        .find(".date")
        .text()
        .trim();

      const salary = job
        .find(".salary.no-wrap")
        .text()
        .trim();

      const isEasyApply =
        job
          .find(".iaLabel")
          .text()
          .trim() === "Easily apply";

      return {
        title: jobtitle,
        summary: summary,
        url: url,
        company: company,
        location: location,
        postDate: postDate,
        salary: salary,
        isEasyApply: isEasyApply
      };
    })
    .get();

  const list = $(".pagination");

  if (!list.length) {
    // No paging of results
    cont = false;
  } else {
    // Indeed returns two different types of html
    // In one the links are nested inside of a ul, on the other they are just
    // a list, not nested in anything
    // I believe the nested one is SSRed, and the other one is hydrated?  Aria stuff
    // is not set for flat, and it doesn't use semantic tags.
    const type = list.children().length > 1 ? "flat" : "nested";
    const buttons =
      type === "flat"
        ? list.children()
        : list
            .children()
            .first()
            .children();

    // We determine if this is the last page by checking if the button for the last page is active
    const activeButton =
      type === "flat"
        ? buttons.filter("b")
        : buttons.filter((_, e) => $(e).children("b").length > 0);
    const activeText = activeButton.text();
    const buttonTexts = Array.from(buttons.map((_, e) => $(e).text()))
      // Filter out buttons that aren't numbers (like next/prev)
      .filter(e => e !== "" && !Number.isNaN(Number(e)));
    const lastButtonText = buttonTexts[buttonTexts.length - 1];
    const isLastPage = lastButtonText === activeText;
    if (isLastPage) {
      // We have seen all the results
      cont = false;
    }
  }

  return {
    error: null,
    continue: cont,
    jobs: jobObjects
  };
}
