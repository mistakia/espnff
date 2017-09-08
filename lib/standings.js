const request = require('request')
const cheerio = require('cheerio')
const argv = require('yargs').argv

const get = function(opts, cb) {
  const url = 'http://games.espn.com/ffl/tools/finalstandings?' + [
    `leagueId=${opts.leagueId}`,
    `seasonId=${opts.seasonId}`
  ].join('&')

  request({
    url: url
  }, function(err, res, html) {
    if (err)
      return cb(err)

    let items = parseHTML(html)

    cb(null, items)
  })
}

const parseHTML = function(html) {
  let items = {}

  const $ = cheerio.load(html)
  $('table tr.sortableRow').each(function(index, element) {
    const self = this
    const owners = $(this).children().eq(2).text().split(',')

    owners.forEach(function(owner) {
      owner = owner.trim()
      items[owner] = {
	team_name: $(self).children().eq(1).text(),
	record: $(self).children().eq(4).text(),
	points_for: parseFloat($(self).children().eq(5).text()),
	points_against: parseFloat($(self).children().eq(6).text())
      }
    })
  })

  return items
}

module.exports = {
  get: get,
  parseHTML: parseHTML
}
