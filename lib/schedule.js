const request = require('request')
const cheerio = require('cheerio')
const argv = require('yargs').argv

const get = function(opts, cb) {
  const url = 'http://games.espn.com/ffl/schedule?' + [
    `leagueId=${opts.leagueId}`,
    `seasonId=${opts.seasonId}`
  ].join('&')

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
  let result = {}
  let week = 0
  
  const $ = cheerio.load(html)

  $('.games-fullcol > table.tableBody tr:not(.tableSubHead)').each(function(index, element) {
    if ($(this).hasClass('tableHead')) {
      week++
      return
    }

    const home_owners = $(this).children().eq(1).text().split(',')
    const away_owners = $(this).children().eq(4).text().split(',')
    const score = $(this).children().eq(5).text().split('-')
    const home_score = score[0]
    const away_score = score[1]

    home_owners.forEach(function(owner) {
      owner = owner.trim()

      if (!owner)
	return

      if (!result[owner]) {
	result[owner] = {}
      }
      
      result[owner][`week${week}`] = {
	points: home_score,
	points_against: away_score,
	opponents: away_owners
      }
    })

    away_owners.forEach(function(owner) {
      owner = owner.trim()

      if (!owner)
	return      

      if (!result[owner]) {
	result[owner] = {}
      }

      result[owner][`week${week}`] = {
	points: away_score,
	points_against: home_score,
	opponents: home_owners
      }
    })    

  })

  return result
}

module.exports = {
  get: get,
  parseHTML: parseHTML
}
