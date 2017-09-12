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
  let playoff_games = 0
  
  const $ = cheerio.load(html)

  $('.games-fullcol > table.tableBody tr:not(.tableSubHead)').each(function(index, element) {
    if ($(this).hasClass('tableHead')) {
      week++
      playoff_games = 0
      return
    }

    const playoff = ([14,15,16].indexOf(week) > -1) ? true : false
    const championship = week === 16    

    if (playoff) {
      playoff_games++
    }

    if ((week === 14 || week === 15) && playoff_games > 2)
      return

    if (week === 16 && playoff_games > 1)
      return

    let home_owners = $(this).children().eq(1).text().split(',')
    let away_owners = $(this).children().eq(4).text().split(',')
    const score = $(this).children().eq(5).text().split('-')
    const home_score = score[0]
    const away_score = score[1]

    home_owners = home_owners.map(function(owner) {
      return owner.trim()
    })

    away_owners = away_owners.map(function(owner) {
      return owner.trim()
    })

    home_owners.forEach(function(owner) {
      if (!owner)
	return

      if (!result[owner]) {
	result[owner] = {}
      }
      
      result[owner][`week${week}`] = {
	points: home_score,
	points_against: away_score,
	opponents: away_owners,
	playoff: playoff,
	championship: championship
      }
    })

    away_owners.forEach(function(owner) {
      if (!owner)
	return      

      if (!result[owner]) {
	result[owner] = {}
      }

      result[owner][`week${week}`] = {
	points: away_score,
	points_against: home_score,
	opponents: home_owners,
	playoff: playoff,
	championship: championship
      }
    })    

  })

  return result
}

module.exports = {
  get: get,
  parseHTML: parseHTML
}
