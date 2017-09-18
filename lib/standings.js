const request = require('request')
const cheerio = require('cheerio')
const argv = require('yargs').argv

const get = function(opts, cb) {
  const url = 'http://games.espn.com/ffl/standings?' + [
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
  let items = []

  const $ = cheerio.load(html)
  $('table tr.sortableRow').each(function(index, element) {
    const self = this

    items.push({
      team: $(self).children().eq(0).find('a').text(),
      record: $(self).children().eq(5).text(),
      points_for: parseFloat($(self).children().eq(1).text()),
      points_against: parseFloat($(self).children().eq(2).text())
    })
  })

  return items
}

module.exports = {
  get: get,
  parseHTML: parseHTML
}
