const get_activity = require('./lib/activity')
const standings = require('./lib/standings')
const schedule = require('./lib/schedule')
const roster = require('./lib/roster')

module.exports = {
  get_activity: get_activity,
  standings: standings,
  schedule: schedule,
  roster: roster
}
