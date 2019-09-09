const cheerio = require('cheerio')
const { request } = require('../utils')
const promisify = require('promisify-es6')

const format = (data, players) => {
  let formatted = {}
  const { teams } = data
  teams.forEach((team) => {
    formatted[team.id] = []
    team.roster.entries.forEach((p) => {
      formatted[team.id].push(p.playerPoolEntry.player.fullName)
    })
  })

  return formatted
}

const get = promisify(async (opts = {}, cb) => {
  if (!opts.seasonId) {
    return cb(new Error('missing seasonId'))
  }

  if (!opts.leagueId) {
    return cb(new Error('missing leagueId'))
  }

  const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${opts.seasonId}/segments/0/leagues/${opts.leagueId}?view=mRoster&view=mTeam&view=modular&view=mNav`

  request({
    url: url,
    json: true
  }, function(err, res, data) {
    if (err)
      return cb(err)

    const formatted = format(data)
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
