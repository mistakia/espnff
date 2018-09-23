let request = require('request')
const cheerio = require('cheerio')
const promisify = require('promisify-es6')
const argv = require('yargs').argv

const get = promisify((opts, cb) => {
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
})

const detail_cleanser = function(detail) {
  return detail.replace(/<b>/g, '').replace(/<\/b>/g, '')
}

const detail_parser = function(detail) {
  const re = /([\w\S]+)\s([\w\S]+)\s([^,]+),\s[\w]+\s([\w\/]+)/ig
  const re_result = re.exec(detail)

  const item = {
    full: detail,
    player: re_result && re_result[3],
    team: re_result && re_result[1],
    action: re_result && re_result[2],
    position: re_result && re_result[4]
  }
  return item
}

const parseHTML = function(html) {
  const $ = cheerio.load(html)

  let items = []

  $('table.tableBody tr:not(:first-child):not(.tableSubHead)').each(function(index, element) {
    let detail = $(this).children().eq(2).html().split('<br>')
    const type = $(this).children().eq(1).text()

    detail = detail.map(detail_cleanser).filter(Boolean).map(detail_parser)

    let teams = []
    $(this).children().eq(3).find('a').each(function(index, element) {
      const path = $(this).attr('href')
      try {
	const team_id = parseInt(/teamId=(\d+)/ig.exec(path)[1], 10)
	teams.push(team_id)
      } catch(e) {
	//console.log(e)
      }
    })

    items.push({
      date: $(this).children().eq(0).html().replace('<br>', ' '),
      type: type,
      detail: detail,
      teams: teams,
      action: $(this).children().eq(3).text()
    })
  })

  return items
}

module.exports = {
  get: get,
  parseHTML: parseHTML
}

if (!module.parent) {
  get({
    leagueId:147002,
    seasonId:2017,
    activityType:2,
    teamId:-1,
    tranType:3
  }, function(err, result) {
    if (err)
      console.log(err)

    console.log(result)
    console.log(result[0])
  })
}
