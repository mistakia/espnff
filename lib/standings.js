const { request } = require('../utils')
const promisify = require('promisify-es6')

const get = promisify((opts, cb) => {
  if (!opts.leagueId) {
    return cb(new Error('missing leagueId'))
  }

  if (!opts.seasonId) {
    return cb(new Error('missing seasonId'))
  }

  const url = `https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/${opts.leagueId}?view=mLiveScoring&view=mMatchupScore&view=mRoster&view=mStandings&view=mStatus&view=mTeam&view=modular&view=mNav&seasonId=${opts.seasonId}`

  request({
    url,
    json: true
  }, function(err, res, data) {
    if (err)
      return cb(err)

    cb(null, data)
  })
})

module.exports = {
  get
}

if (!module.parent) {
  get({
    leagueId: 147002,
    seasonId: 2018
  }, function(err, result) {
    if (err)
      console.log(err)

    console.log(result)
  })
}
