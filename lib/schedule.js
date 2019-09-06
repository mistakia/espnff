const request = require('request')
const cheerio = require('cheerio')
const argv = require('yargs').argv
const promisify = require('promisify-es6')

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
  })
}
