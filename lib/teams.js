const cheerio = require('cheerio')
const request = require('request')
const promisify = require('promisify-es6')

const get = promisify((opts, cb) => {
  let params = [
    `leagueId=${opts.leagueId}`
  ]

  if (opts.seasonId)
    params.push(`seasonId=${opts.seasonId}`)

  const url = 'http://games.espn.com/ffl/scoreboard?' + params.join('&')

  request({
    url: url
  }, function(err, res, html) {
    if (err)
      return cb(err)

    let result = parseHTML(html)
    cb(null, result)
  })
})

const parseHTML = function(html) {
  const $ = cheerio.load(html)

  const result = {}

  $('table.matchup td.team').each(function(index, element) {
    const path = $(this).find('.name a').attr('href')
    const id = parseInt(/teamId=(\d+)/ig.exec(path)[1], 10)

    result[id] = {
      abbrev: $(this).find('.abbrev').text().replace('(', '').replace(')',''),
      name: $(this).find('.name a').text(),
      href: 'http://games.espn.com' + path,
      owners: $(this).find('.owners').text().split(',')
    }
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
