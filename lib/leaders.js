const cheerio = require('cheerio')
const request = require('request')
const promisify = require('promisify-es6')

const get = promisify((opts, cb) => {
  let params = [
    `leagueId=${opts.leagueId}`,
    'seasonTotals=true'
  ]

  if (typeof opts.slotCategoryId !== 'undefined')
    params.push(`slotCategoryId=${opts.slotCategoryId}`)

  if (opts.startIndex)
    params.push(`startIndex=${opts.startIndex}`)

  if (opts.seasonId)
    params.push(`seasonId=${opts.seasonId}`)

  const url = 'http://games.espn.com/ffl/leaders?' + params.join('&')

  request({
    url: url
  }, function(err, res, html) {
    if (err)
      return cb(err)

    let result = parseHTML(html)
    cb(null, result)
  })
})

const parseHTML = function(html) {
  const $ = cheerio.load(html)

  const result = {}

  $('table.playerTableTable.tableBody tr.pncPlayerRow').each(function(index, element) {
    const name = $(this).children().eq(0).find('a').text()
    result[name] = parseFloat($(this).children().eq(-1).text())
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
    slotCategoryId: 0,
    seasonId: 2017
  }, function(err, result) {
    if (err)
      console.log(err)

    console.log(result)
  })
}
