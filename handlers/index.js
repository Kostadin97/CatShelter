const homeHandler = require('./home');
const staticFiles = require('./static-files');
const catHandler = require('./cats');
const searchHandler = require('./search')

module.exports = [homeHandler, staticFiles, catHandler, searchHandler];