const cheerio = require('cheerio')
const { request } = require('../utils')
const promisify = require('promisify-es6')

const get = promisify((opts = {}, cb) => {
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

    cb(null, data.teams)
  })
})

const parseHTML = function(html) {
  const $ = cheerio.load(html)

  const result = {}

  let teamId = 0
  $('table.playerTableTable.tableBody').each(function(index, element) {
    teamId++
    result[teamId] = []
    $(this).find('.pncPlayerRow').each(function(index, element) {
      const name = $(this).children().eq(1).find('a').text()
      result[teamId].push(name)
    })
  })

  return result
}

module.exports = {
  get: get,
  parseHTML: parseHTML
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
