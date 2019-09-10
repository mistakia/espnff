const promisify = require('promisify-es6')
const { request } = require('../utils')

const format = (data, opts) => {
  let formatted = {}

  data.teams.forEach((team) => {
    const { abbrev, id } = team

    let owners = team.owners.map(owner => data.members.find(m => m.id === owner))
    owners = owners.map(o => `${o.firstName} ${o.lastName}`)

    formatted[id] = {
      abbrev,
      name: `${team.location} ${team.nickname}`,
      href: `https://fantasy.espn.com/football/team?leagueId=${opts.leagueId}&teamId=${id}&seasonId=${opts.seasonId}`,
      owners
    }
  })

  return formatted
}

const get = promisify((opts, cb) => {
  if (!opts.leagueId) {
    return cb(new Error('missing leagueId'))
  }

  const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${opts.seasonId}/segments/0/leagues/${opts.leagueId}?view=mStatus&view=mTeam&view=mSettings`

  request({
    url,
    json: true
  }, (err, res, data) => {
    if (err) {
      return cb(err)
    }

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
    seasonId: 2019
  }, function(err, result) {
    if (err)
      console.log(err)

    console.log(result.formatted)
  })
}
