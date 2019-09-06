const fs = require('fs')
const request = require('request')

const req = request.defaults({
  rejectUnauthorized: false
})

const cachedRequest = require('cached-request')(request)
const cacheDirectory = '/tmp/cache'

cachedRequest.setCacheDirectory(cacheDirectory)
cachedRequest.setValue('ttl', 900000) // 15 mins

module.exports = cachedRequest
