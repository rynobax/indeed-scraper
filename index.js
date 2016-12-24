'use strict';
const indeedScraper = require('./lib/scraper.js');

/**
 * @typedef Job
 * @property {string} jobtitle - Title of the job
 * @property {string} summary - Beginning of the job description
 * @property {string} url - Url of the job page
 * @property {string} company - Company Name
 * @property {string} location - Location of the job
 * @property {Date} date - The date the job was posted
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
module.exports.query = function(query, cityName, radius, experienceLevel, maxAge){
  return indeedScraper.query(query, cityName, radius, experienceLevel, maxAge);
}