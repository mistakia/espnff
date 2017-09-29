const cheerio = require('cheerio')
const request = require('request')

const get = function(opts, cb) {
  let params = [
    `leagueId=${opts.leagueId}`,
    'mode=1'
  ]

  if (opts.seasonId)
    params.push(`seasonId=${opts.seasonId}`)  

  const url = 'http://games.espn.com/ffl/tools/draftrecap?' + params.join('&')

  request({
    url: url
  }, function(err, res, html) {
    if (err)
      return cb(err)

    let result = parseHTML(html)
    cb(null, result)
  })
}

const parseHTML = function(html) {
  const $ = cheerio.load(html)

  const result = {}

  $('.games-fullcol table table tbody').each(function(index, element) {
    const team_element = $('tr.tableHead a', this)
    const team_name = team_element.text()
    const team_path = team_element.attr('href')
    const team_id = parseInt(/teamId=(\d+)/ig.exec(team_path)[1], 10)
    $('tr.tableBody', this).each(function(index, element) {
      const player_name = $(this).children().eq(1).find('a').text()
      result[player_name] = {
	team_name: team_name,
	team_id: team_id
      }
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