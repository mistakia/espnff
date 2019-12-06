const promisify = require('promisify-es6')
const { request } = require('../utils')
const parallel = require('async/parallel')

const getPosition = (id) => {
  switch (id) {
    case 1:
      return 'QB'
    case 2:
      return 'RB'
    case 3:
      return 'WR'
    case 4:
      return 'TE'
    case 5:
      return 'K'
    case 16:
      return 'D/ST'
    default:
      throw new Error('unknow position id')
  }
}

const formatTeam = (team, data, opts, games) => {
  let projection = 0.0
  let projectionRate = 0.0
  let timeRemaining = 0
  let starters = []
  let bench = []
  const leagueTeam = data.teams.find(t => t.id === team.teamId)
  if (team.rosterForCurrentScoringPeriod) {
    team.rosterForCurrentScoringPeriod.entries.forEach((entry) => {
      let positionId = entry.playerPoolEntry.player.defaultPositionId
      let player = {
        name: entry.playerPoolEntry.player.fullName,
        points: entry.playerPoolEntry.appliedStatTotal,
        active: false,
        position: getPosition(positionId),
        positionId
      }

      if (entry.lineupSlotId !== 20) {
        const projectedStats = entry.playerPoolEntry.player.stats.find(s => s.statSourceId === 1)
        const liveStats = entry.playerPoolEntry.player.stats.find(s => s.statSourceId === 0)
        if (liveStats) {
          player.active = true
          const game = games.events.find(g => g.id === liveStats.externalId)
          const playerTimeRemaining = game.fullStatus.clock + ((4 - game.fullStatus.period) * 900)
          const playerTimePlayed = 3600 - playerTimeRemaining
          const playerPercentComplete = playerTimeRemaining / 3600
          const remainingProjection = projectedStats.appliedTotal * playerPercentComplete
          timeRemaining += playerTimeRemaining
          projection += (liveStats.appliedTotal + remainingProjection)
          projectionRate += (liveStats.appliedTotal / playerTimePlayed) * 3600
        } else if (projectedStats) {
          timeRemaining += 3600 // 1hr in seconds
          projection += projectedStats.appliedTotal
          projectionRate += projectedStats.appliedTotal
        }
        starters.push(player)
      } else {
        bench.push(player)
      }
    })
  }

  return {
    id: team.teamId,
    abbrev: leagueTeam.abbrev,
    logo: leagueTeam.logo,
    name: `${leagueTeam.location} ${leagueTeam.nickname}`,
    href: `https://fantasy.espn.com/football/team?leagueId=${opts.leagueId}&teamId=${team.teamId}&seasonId=${opts.seasonId}`,
    points: team.rosterForCurrentScoringPeriod ? team.rosterForCurrentScoringPeriod.appliedStatTotal : team.totalPoints,
    projection,
    projectionRate,
    timeRemaining,
    bench,
    starters
  }
}

const format = (data, opts, games) => {
  let formatted = []

  data.schedule.forEach((game) => {
    const { id, winner } = game

    if (!game.away) return

    const away = formatTeam(game.away, data, opts, games)
    const home = formatTeam(game.home, data, opts, games)
    formatted.push({
      away,
      home,
      id,
      winner,
      week: game.matchupPeriodId
    })
  })

  return formatted
}

const get = promisify((opts, cb) => {
  if (!opts.leagueId) {
    return cb(new Error('missing leagueId'))
  }

  if (!opts.scoringPeriodId) {
    return cb(new Error('missing scoringPeriodId'))
  }

  if (!opts.seasonId) {
    return cb(new Error('missing seasonId'))
  }

  parallel({
    games: (done) => {
      if (!opts.weekStart || !opts.weekEnd) {
        return done(null, {})
      }
      const url = `https://site.api.espn.com/apis/fantasy/v2/games/ffl/games?useMap=true&dates=${opts.weekStart}-${opts.weekEnd}&pbpOnly=true`
      request({
        url,
        json: true
      }, (err, res, data) => {
        done(err, data)
      })
    },
    data: (done) => {
      const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${opts.seasonId}/segments/0/leagues/${opts.leagueId}?scoringPeriodId=${opts.scoringPeriodId}&view=mBoxscore&view=mMatchupScore&view=mRoster&view=mTeam&view=modular&view=mNav`
      request({
        url,
        json: true
      }, function(err, res, data) {
        done(err, data)
      })
    }
  }, function(err, results) {
    if (err)
      return cb(err)

    const formatted = format(results.data, opts, results.games)
    cb(null, { formatted, data: results.data })
  })
})

module.exports = {
  get
}

if (!module.parent) {
  get({
    leagueId: 147002,
    scoringPeriodId: 2,
    weekStart: '20190912',
    weekEnd: '20190916',
    seasonId: 2019
  }, function(err, result) {
    if (err)
      console.log(err)

    console.log(result.formatted)
  })
}
