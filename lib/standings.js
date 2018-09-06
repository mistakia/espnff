const request = require('request')
const cheerio = require('cheerio')
const argv = require('yargs').argv
const promisify = require('promisify-es6')

const get = promisify((opts, cb) => {
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
})

const parseHTML = function(html) {
  let result = {}
  let items = []

  const $ = cheerio.load(html)
  $('table tr.sortableRow').each(function(index, element) {

    const path = $(this).children().eq(1).find('a').attr('href')
    const team_id = parseInt(/teamId=(\d+)/ig.exec(path)[1], 10)

    items.push({
      team: $(this).children().eq(1).find('a').text(),
      team_id: team_id,
      team_href: 'http://games.espn.com' + path,
      record: $(this).children().eq(5).text(),
      points_for: parseFloat($(this).children().eq(1).text()),
      points_against: parseFloat($(this).children().eq(2).text())
    })
  })

  $('table tr.tableBody').each(function(index, element) {
    items[index].wins = parseInt($(this).children().eq(1).text(), 10)
    items[index].losses = parseInt($(this).children().eq(2).text(), 10)
    items[index].ties = parseInt($(this).children().eq(3).text(), 10)
  })

  $('table tr.sortableRow').each(function(index, element) {
    const owners = $(this).children().eq(2).text().split(',')
    owners.forEach(function(owner) {
      owner = owner.trim()
      result[owner] = items[index]
    })
  })

  return result
}

module.exports = {
  get: get,
  parseHTML: parseHTML
}

if (!module.parent) {
  get({
    leagueId: 147002,
    seasonId: 2017
  }, function(err, result) {
    if (err)
      console.log(err)

    console.log(result)
  })
}
