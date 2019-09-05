const request = require('request')
const promisify = require('promisify-es6')

const getPlayers = require('./players').get

const get = promisify(async (opts = {}, cb) => {

  if (!opts.leagueId) {
    cb(new Error('leagueId missing'))
  }

  if (!opts.seasonId) {
    cb(new Error('leagueId missing'))
  }

  let { players } = opts
  if (!players) {
    players = await getPlayers(opts)
  }

  const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${opts.seasonId}/segments/0/leagues/${opts.leagueId}?view=mDraftDetail&view=mSettings&view=mTeam&view=modular&view=mNav`

  request({
    url: url,
    json: true
  }, function(err, res, data) {
    if (err)
      return cb(err)

    let result = parseData(data, players)
    cb(null, result)
  })
})

const parseData = function(data, players) {
  const result = []

  data.draftDetail.picks.forEach(pick => {
    const { playerId } = pick

    const player = players.find(p => p.id === playerId)

    result.push({
      player,
      ...pick
    })
  })

  return result
}

module.exports = {
  get: get
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
