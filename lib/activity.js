let request = require('request')
const cheerio = require('cheerio')
const argv = require('yargs').argv

const get = function(opts, cb) {
  let params = [
    `leagueId=${opts.leagueId}`,
    `seasonId=${opts.seasonId}`
  ]

  if (opts.activityType)
    params.push(`activityType=${opts.activityType}`)

  if (opts.startDate)
    params.push(`startDate=${opts.startDate}`)

  if (opts.endDate)
    params.push(`endDate=${opts.endDate}`)

  if (opts.teamId)
    params.push(`teamId=${opts.teamId}`)

  if (opts.tranType)
    params.push(`tranType=${opts.tranType}`)

  const url = 'http://games.espn.com/ffl/recentactivity?' + params.join('&')

  request({
    url: url
  }, function(err, res, html) {
    if (err)
      return cb(err)

    const items = parseHTML(html)

    cb(null, items)
  })
}

const detail_parser = function(detail) {
  const re = /([\w\S]+)\s([\w\S]+)\s([^,]+),/ig
  const string = detail.replace('<b>', '').replace('</b>', '')
  const re_result = re.exec(string)
  const item = {
    full: string,
    player: re_result[3],
    team: re_result[1],
    action: re_result[2]
  }
  return item
}

const parseHTML = function(html) {
  const $ = cheerio.load(html)

  let items = []

  $('table.tableBody tr:not(:first-child):not(.tableSubHead)').each(function(index, element) {
    let detail = $(this).children().eq(2).html().split('<br>')

    detail = detail.map(detail_parser)

    items.push({
      date: $(this).children().eq(0).html().replace('<br>', ' '),
      type: $(this).children().eq(1).text(),
      detail: detail,
      action: $(this).children().eq(3).text()
    })
  })

  return items
}

module.exports = {
  get: get,
  parseHTML: parseHTML
}
