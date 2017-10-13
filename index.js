const activity = require('./lib/activity')
const standings = require('./lib/standings')
const schedule = require('./lib/schedule')
const draft = require('./lib/draft')
const roster = require('./lib/roster')
const leaders = require('./lib/leaders')
const boxscore = require('./lib/boxscore')
const teams = require('./lib/teams')
const player = require('./lib/player')

module.exports = {
  activity: activity,
  standings: standings,
  draft: draft,
  schedule: schedule,
  roster: roster,
  leaders: leaders,
  boxscore: boxscore,
  player: player,
  teams: teams
}
