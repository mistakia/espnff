const cheerio = require('cheerio')
const request = require('request')

const find = function(opts, cb) {
  let params = [
    `leagueId=${opts.leagueId}`,
    'avail=-1',
    'seasonTotals=true'
  ]

  if (typeof opts.slotCategoryId !== 'undefined')
    params.push(`slotCategoryId=${opts.slotCategoryId}`)

  if (opts.search)
    params.push(`search=${encodeURIComponent(opts.search)}`)

  if (opts.seasonId)
    params.push(`seasonId=${opts.seasonId}`)  

  const url = 'http://games.espn.com/ffl/freeagency?' + params.join('&')

  request({
    url: url
  }, function(err, res, html) {
    if (err)
      return cb(err)

    let result = findParseHTML(html)
    cb(null, result)
  })
}

const findParseHTML = function(html) {
  const $ = cheerio.load(html)

  const result = {}

  $('table.playerTableTable.tableBody tr.pncPlayerRow').each(function(index, element) {
    const a = $(this).children().eq(0).find('a')
    result.name = a.text()
    result.id = parseInt(a.attr('playerid'), 10)
    result.prk = parseInt($(this).children().eq(8).text(), 10)
    result.pts = parseFloat($(this).children().eq(9).text())
  })

  return result
}

const info = function(opts, cb) {
  let params = [
    `leagueId=${opts.leagueId}`,
    `playerId=${opts.playerId}`,
    'playerIdType=playerId'
  ]

  if (opts.seasonId)
    params.push(`seasonId=${opts.seasonId}`)  

  const url = 'http://games.espn.com/ffl/format/playerpop/overview?' + params.join('&')

  request({
    url: url
  }, function(err, res, html) {
    if (err)
      return cb(err)

    let result = infoParseHTML(html)
    cb(null, result)
  })  
}

const infoParseHTML = function(html) {
  const $ = cheerio.load(html)

  const player = {}

  let position = $('.player-details').find('[title="Position Eligibility"]').text()
  position = position.replace('ELIG:', '').trim()
  player.position = position

  const player_status = $('.ppc_league_status a')
  const path = player_status.attr('href')
  const team_id = parseInt(/teamId=(\d+)/ig.exec(path)[1], 10)

  player.owned_by = {
    team_id: team_id,
    abbrev: player_status.text(),
    name: player_status.attr('title')
  }

  player.weeks = {}

  $('#tabView0 #moreStatsView0 table tr:not(.pcStatHead)').each(function(index, element) {
    player.weeks[index + 1] = parseFloat($(this).children().eq(-1).text())
  })

  return player
}

module.exports = {
  find: find,
  findParseHTML: findParseHTML,
  info: info,
  infoParseHTML: infoParseHTML
}

if (!module.parent) {
  find({
    leagueId: 147002,
    slotCategoryId: -1,
    search: 'Zach Ertz',
    seasonId: 2017
  }, function(err, result) {
    if (err)
      console.log(err)

    console.log(result)

    info({
      leagueId: 147002,
      playerId: result.id,
      seasonId: 2017
    }, function(err, result) {
      if (err)
	console.log(err)

      console.log(result)
    })
  })
}
