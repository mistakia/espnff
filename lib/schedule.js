const { request } = require('../utils')
const cheerio = require('cheerio')
const argv = require('yargs').argv
const promisify = require('promisify-es6')

const format = (data, leagueId) => {
  let formatted = {
    schedule: {},
    standings: {}
  }

  const { teams, schedule } = data
  teams.forEach((team) => {
    formatted.standings[team.id] = {
      wins: team.record.overall.wins,
      losses: team.record.overall.losses,
      ties: team.record.overall.ties,
      points_for: team.record.overall.pointsFor,
      points_against: team.record.overall.pointsAgainst,
      team: `${team.location} ${team.nickname}`,
      team_id: team.id,
      team_href: `https://fantasy.espn.com/football/team?leagueId=${leagueId}&teamId=${team.id}`
    }
  })

  schedule.forEach((game) => {
    const week = game.matchupPeriodId
    if (typeof formatted.schedule[week] === 'undefined') {
      formatted.schedule[week] = []
    }

    const playoff = game.playoffTierType === 'WINNERS_BRACKET'
    formatted.schedule[week].push({
      away_id: game.away && game.away.teamId,
      away_score: game.away && game.away.totalPoints,
      home_id: game.home.teamId,
      home_score: game.home.totalPoints,
      playoff,
      championship: playoff && game.matchupPeriodId === 16
    })
  })

  return formatted
}

const get = promisify((opts = {}, cb) => {
  if (!opts.leagueId) {
    return cb(new Error('missing leaugeId'))
  }

  if (!opts.seasonId) {
    return cb(new Error('missing seasonId'))
  }

  const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${opts.seasonId}/segments/0/leagues/${opts.leagueId}?view=mMatchupScore&view=mStatus&view=mSettings&view=mTeam&view=modular&view=mNav`

  request({
    url,
    json: true
  }, function(err, res, data) {
    if (err)
      return cb(err)

    const formatted = format(data, opts.leagueId)
    cb(null, { formatted, data })
  })
})

module.exports = {
  get
}

if (!module.parent) {
  get({
    leagueId: 147002,
    seasonId: 2019
  }, function(err, result) {
    if (err)
      console.log(err)

    console.log(result)
  })
}
