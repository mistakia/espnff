const util = require('util')
const promisify = require('promisify-es6')
const { request } = require('../utils')

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

    cb(null, data)
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
    //console.log(util.inspect(result, false, null))
  })
}
