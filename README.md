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
const queryOptions = {
  query: 'Software',
  city: 'Seattle, WA',
  radius: '25',
  level: 'entry_level',
  maxAge: '7',
  jobType: 'fulltime',
  limit: '100',
  sort: 'date'
};

indeed.query(queryOptions).then(res => {
	console.log(res); // An array of Job objects
});
```

query() accepts a _queryOptions_ object and returns a Promise of an array of _Job_ objects.

* **queryOptions** object:
	* **query** - _string_ - The text to search. (i.e. Software Developer) - Default: ''
	* **cityName** - _string_ - The name of the city.  Should be in the format 'Seattle, WA'. - Default: ''
	* **radius** - _string_ - The search radius in miles - Default: '25'
	* **experienceLevel** - _string_ - '', 'entry_level', mid_level', or 'senior_level' - Default: ''
	* **jobType** - _string_ - '', 'fulltime', 'contract', 'parttime', 'temporary', 'internship', or 'commission' - Default: ''
	* **maxAge** - _string_ - The maximum age of jobs that are returned - Default: '' (No max age)
	* **sort** - _string_ - 'relevance' or 'date' - Default: 'relevance'
	* **limit** - _number_ - The maximum number of jobs to return - Default: 0 (No limit)

* **Job** object:
	* **title** - _string_ - Title of the job
	* **summary** - _string_ - Beginning of the job description
	* **url** - _string_ - Url of the job page
	* **company** - _string_ - Company Name
	* **location** - _string_ - Location of the job
	* **postDate** - _string_ - A string describing how long ago the job was posted

## Contributing
If you have an idea on how to improve this package, feel free to contribute!

1. Clone or fork the repository
2. Make changes
3. Submit a pull request