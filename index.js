const activity = require('./lib/activity')
const standings = require('./lib/standings')
const schedule = require('./lib/schedule')
const draft = require('./lib/draft')
const roster = require('./lib/roster')
const boxscore = require('./lib/boxscore')

module.exports = {
  activity: activity,
  standings: standings,
  draft: draft,
  schedule: schedule,
  roster: roster,
  boxscore: boxscore
}
