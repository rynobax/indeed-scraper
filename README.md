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
  jobType: 'fulltime',
  maxAge: '7',
  sort: 'date',
  limit: '100'
};

indeed.query(queryOptions).then(res => {
	console.log(res); // An array of Job objects
});
```

query() accepts a _queryOptions_ object and returns a Promise of an array of _Job_ objects.

* **queryOptions** object:
	* **query** - _string_ - The text to search. (i.e. Software Developer) - Default: _Empty String_
	* **city** - _string_ - The name of the city.  Should be in the format 'Seattle, WA'. - Default: _Empty String_
	* **radius** - _string_ - The search radius in miles - Default: '25'
	* **level** - _string_ entry_level, mid_level, or senior_level - Default: _Empty String_
	* **jobType** - _string_ - fulltime, contract, parttime, temporary, internship, commission - Default: _Empty String_
	* **maxAge** - _string_ - The maximum age of jobs that are returned - Default: _Empty String_ (No max age)
	* **sort** - _string_ - relevance, date - Default: 'relevance'
	* **limit** - _number_ - The maximum number of jobs to return - Default: 0 (No limit)

* **Job** object:
	* **title** - _string_ - Title of the job
	* **company** - _string_ - Company Name
	* **location** - _string_ - Location of the job
	* **summary** - _string_ - Beginning of the job description
	* **url** - _string_ - Url of the job page
	* **postDate** - _string_ - A string describing how long ago the job was posted

## Contributing
If you have an idea on how to improve this package, feel free to contribute!

1. Clone or fork the repository
2. Make changes
3. Submit a pull request