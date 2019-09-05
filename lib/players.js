const promisify = require('promisify-es6')
const request = require('request')

const get = promisify((opts = {}, cb) => {
  if (!opts.seasonId) {
    cb(new Error('missing seasonId'))
  }

  const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${opts.seasonId}/players?scoringPeriodId=0&view=players_wl`

  request({
    url,
    json: true
  }, (err, res, data) => {
    cb(err, data)
  })
})

module.exports = {
  get
}

if (!module.parent) {
  get({
    seasonId: 2019
  }, function(err, result) {
    if (err) {
      console.log(err)
    }

    console.log(result)
  })
}
