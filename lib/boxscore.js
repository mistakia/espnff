const util = require('util')
const promisify = require('promisify-es6')
const { request } = require('../utils')

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

    cb(null, data.schedule)
  })
})

module.exports = {
  get
}

if (!module.parent) {
  get({
    leagueId: 147002,
    scoringPeriodId: 1,
    seasonId: 2019
  }, function(err, result) {
    if (err)
      console.log(err)

    console.log(util.inspect(result, false, null))
  })
}
