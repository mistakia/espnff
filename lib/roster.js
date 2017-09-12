const cheerio = require('cheerio')
const request = require('request')

const get = function(leagueId, cb) {
  const url = `http://games.espn.com/ffl/leaguerosters?leagueId=${leagueId}`

  request({
    url: url
  }, function(err, res, html) {
    if (err)
      return cb(err)

    let result = parseHTML(html)
    cb(null, result)
  })
}

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
