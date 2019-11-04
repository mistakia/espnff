const { request } = require('../utils')
const cheerio = require('cheerio')
const promisify = require('promisify-es6')
const argv = require('yargs').argv
const puppeteer = require('puppeteer')

const get = promisify(async (opts, cb) => {
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
    params.push(`transactionType=${opts.tranType}`)

  const url = 'http://fantasy.espn.com/football/recentactivity?' + params.join('&')

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()

  if (opts.cookies) {
    await page.setCookie(...opts.cookies)
  }

  page.on('error', async (err) => {
    await browser.close()
    cb(err)
  })

  let details = []
  let pageCount = 0
  let hasDetails = true
  while(hasDetails) {
    pageCount += 1
    await page.goto(`${url}&page=${pageCount}`)
    try {
      await page.waitFor('.Table2__table-scroller.Table2__table tbody tr, .no-activity-msg')
      const collectDetails = async () => {
        const html = await page.content()
        return page.evaluate(() => {
          let result = []

          const detailParser = function(detail) {
            const re = /([\w\s]+)\s((?:moved)|(?:dropped)|(?:added)|(?:traded))\s([^,]+),\s[\w]+\s([\w\/]+)/ig
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


          document
            .querySelectorAll('.Table2__table-scroller.Table2__table tbody tr')
            .forEach((row, idx) => {
              const date = row.children[0].innerText.replace('\n', ' ')
              const text = row.children[2].innerText.split('\n')
              const type = row.children[1].innerText.replace('\n', ' ')

              let teams = []
              try {
                const href = document.querySelector(`.Table2__table-scroller.Table2__table tbody tr:nth-child(${idx + 1}) td:nth-child(4) a`).href
	            const team_id = parseInt(/teamId=(\d+)/ig.exec(href)[1], 10)
	            teams.push(team_id)
              } catch(e) {
	            //console.log(e)
              }

              text.forEach(t => result.push({ teams, date, type, detail: detailParser(t) }))
            })

          return result
        })
      }

      const result = await collectDetails()
      if (!result.length) hasDetails = false
      details = details.concat(result)
    } catch (e) {
      hasDetails = false
      console.log(e)
    }
  }
  await browser.close()
  cb(null, details)
})


module.exports = {
  get: get
}
