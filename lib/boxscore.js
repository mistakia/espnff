const promisify = require('promisify-es6')
const { request } = require('../utils')

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

const formatTeam = (team, data, opts) => {
  let projection = 0.0
  let starters = []
  let bench = []
  const leagueTeam = data.teams.find(t => t.id === team.teamId)
  if (team.rosterForCurrentScoringPeriod) {
    team.rosterForCurrentScoringPeriod.entries.forEach((entry) => {
      let positionId = entry.playerPoolEntry.player.defaultPositionId
      let player = {
        name: entry.playerPoolEntry.player.fullName,
        points: entry.playerPoolEntry.appliedStatTotal,
        position: getPosition(positionId),
        positionId
      }

      if (entry.lineupSlotId !== 20) {
        projection += entry.playerPoolEntry.player.stats[0].appliedTotal
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
    points: team.totalPoints,
    projection: projection,
    bench,
    starters
  }
}

const format = (data, opts) => {
  let formatted = []

  data.schedule.forEach((game) => {
    const { id, winner } = game

    const away = formatTeam(game.away, data, opts)
    const home = formatTeam(game.home, data, opts)
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

  const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${opts.seasonId}/segments/0/leagues/${opts.leagueId}?scoringPeriodId=${opts.scoringPeriodId}&view=mBoxscore&view=mMatchupScore&view=mRoster&view=mTeam&view=modular&view=mNav`

  request({
    url,
    json: true
  }, function(err, res, data) {
    if (err)
      return cb(err)

    const formatted = format(data, opts)
    cb(null, { formatted, data })
  })
})

module.exports = {
  get
}

if (!module.parent) {
  get({
    leagueId: 147002,
    scoringPeriodId: 2,
    seasonId: 2019
  }, function(err, result) {
    if (err)
      console.log(err)

    console.log(result.formatted)
  })
}
