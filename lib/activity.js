let request = require('request')
const cheerio = require('cheerio')
const argv = require('yargs').argv

const index = function(opts, cb) {
  const url = 'http://games.espn.com/ffl/recentactivity?' + [
    `leagueId=${opts.leagueId}`,
    `seasonId=${opts.seasonId}`,
    `activityType=${opts.activityType}`,
    `startDate=${opts.startDate}`,
    `endDate=${opts.endDate}`,
    `teamId=${opts.teamId}`,
    `tranType=${opts.tranType}`
  ].join('&')

  request({
    url: url
  }, function(err, res, html) {
    if (err)
      return cb(err)

    const $ = cheerio.load(html)

    let items = []

    $('table.tableBody tr:not(:first-child):not(.tableSubHead)').each(function(index, element) {
      items.push({
	date: $(this).children().eq(0).text(),
	type: $(this).children().eq(1).text(),
	detail: $(this).children().eq(2).text(),
	action: $(this).children().eq(3).text()
      })
    })

    cb(null, items)
  })
}

module.exports = index
