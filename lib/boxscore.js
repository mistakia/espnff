const util = require('util')
const promisify = require('promisify-es6')
const cheerio = require('cheerio')
const request = require('request')

const getPosition = function(string) {
  if (string.includes('QB'))
    return 'QB'

  if (string.includes('D/ST'))
    return 'D/ST'

  if (string.includes('RB'))
    return 'RB'

  if (string.includes('WR'))
    return 'WR'

  if (string.includes('TE'))
    return 'TE'

  if (string.includes('K'))
    return 'K'
}

const get = promisify((opts, cb) => {
  let params = [
    `leagueId=${opts.leagueId}`,
    'view=scoringperiod',
    'version=quick'
  ]

  if (opts.teamId)
    params.push(`teamId=${opts.teamId}`)

  if (opts.scoringPeriodId)
    params.push(`scoringPeriodId=${opts.scoringPeriodId}`)

  if (opts.seasonId)
    params.push(`seasonId=${opts.seasonId}`)

  const url = 'http://games.espn.com/ffl/boxscorequick?' + params.join('&')

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

  const result = []

  $('#teamInfos > div:not(:empty)').each(function(index, element) {
    let path = $('a', this).attr('href')
    let teamId = parseInt(/teamId=(\d+)/ig.exec(path)[1], 10)
    let team = {
      name: $('.bodyCopy div b:first-of-type', this).text(),
      href: 'http://games.espn.com' + path,
      image: $('a img', this).attr('src'),
      id: teamId,
      projection: parseFloat($(`#team_liveproj_${teamId}`).text()),
      minutes_remaining: parseInt($(`#team_pmr_${teamId}`).text(), 10),
      bench: [],
      players: []
    }

    result.push(team)
  })


  $('table.playerTableTable.tableBody:not(.hideableGroup)').each(function(teamIndex, element) {
    $('tr.pncPlayerRow', this).each(function(index, element) {
      result[teamIndex].players.push({
	name: $(this).children().eq(1).find('a:first-of-type').text(),
	points: parseFloat($(this).children().eq(4).text()),
	position: $(this).children().eq(0).text()
      })
    })
  })

  $('table.playerTableTable.tableBody.hideableGroup').each(function(teamIndex, element) {
    $('tr.pncPlayerRow', this).each(function(index, element) {
      result[teamIndex].bench.push({
	name: $(this).children().eq(1).find('a:first-of-type').text(),
	points: parseFloat($(this).children().eq(4).text()),
	position: getPosition($(this).children().eq(1).text())
      })
    })
  })

  $('.danglerBox.totalScore').each(function(teamIndex, element) {
    result[teamIndex].score = parseFloat($(this).text())
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
    teamId: 7,
    scoringPeriodId: 3,
    seasonId: 2017
  }, function(err, result) {
    if (err)
      console.log(err)

    console.log(util.inspect(result, false, null))
  })
}
