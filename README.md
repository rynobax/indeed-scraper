# indeed-scraper
[![npm package](https://nodei.co/npm/indeed-scraper.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/request/)

### A Node.js package for getting job listings from Indeed.com

## Installation

You can install using [npm](https://www.npmjs.com/package/indeed-scraper).
```
npm install indeed-scraper
```
Include the package
```
const indeed = require('indeed-scraper');
```
Query Indeed:
```
indeed.query('Software', 'Seattle, WA', 25, 'entry_level', 7).then(res => {
	console.log(res); // An array of objects which represent jobs
});
```

## API
query() returns a Promise, the result of which is an array of Job objects
```
/**
 * @typedef Job
 * @property {string} title - Title of the job
 * @property {string} summary - Beginning of the job description
 * @property {string} url - Url of the job page
 * @property {string} company - Company Name
 * @property {string} location - Location of the job
 * @property {Date} date - The date the job was posted (Parsed using chrono)
 * @property {string} age - How many days ago the job was posted
 */

/**
 * Get job results from Indeed
 * @param {query} The text to search (i.e. Software Developer)
 * @param {cityName} The name of the city.  Must be in the format 'Seattle, WA'
 * @param {radius} The search radius (Default is 25)
 * @param {experienceLevel} 'entry_level', mid_level', or 'senior_level'
 * @param {maxAge} The maximum age of jobs that are returned
 * @return {promise<Job[]>}  
 */
query(query, cityName, radius, experienceLevel, maxAge)
```

## Contributing
If you have an idea on how to improve this, feel free to contribute!

1. Clone or fork the repository
2. Make changes
3. Submit a pull request