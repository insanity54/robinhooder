#!/usr/bin/env node

require('dotenv').config()

const path = require('path')
const Nightmare = require('nightmare')
const nightmare = Nightmare({
  show: true,
  typeInterval: 1
});
const bunyan = require('bunyan')
var log = bunyan.createLogger({
  name: 'magnet-forwarder',
  streams: [{
      path: path.join(__dirname, 'magnet-forwarder.log'),
    },
    {
      level: 'debug',
      stream: process.stdout // log INFO and above to stdout
    },
  ]
});
const ruTorrentAddress = process.env.RUTORRENT_ADDRESS
const ruTorrentPassword = process.env.RUTORRENT_PASSWORD
const ruTorrentUsername = process.env.RUTORRENT_USERNAME
const magnetLink = process.argv[2]

log.debug('received argv as follows')
log.debug(process.argv)

if (typeof magnetLink === 'undefined')
  throw new Error('First CLI argument (magnetLink) was undefined!')
if (typeof ruTorrentAddress === 'undefined')
  throw new Error('RUTORRENT_ADDRESS is undefined in env')
if (typeof ruTorrentPassword === 'undefined')
  throw new Error('RUTORRENT_PASSWORD is undefined in env')
if (typeof ruTorrentUsername === 'undefined')
  throw new Error('RUTORRENT_USERNAME is undefined in env')



nightmare
  .authentication(ruTorrentUsername, ruTorrentPassword)
  .goto(ruTorrentAddress)
  .wait(() => {
    // wait for loading screen to disappear
    return document.querySelector('#cover').style.display === 'none'
  })
  .wait(250)
  .click('#add')
  .wait('#url')
  .type('#url', magnetLink)
  .click('#add_url')
  .wait('.noty_cont')
  .evaluate(() => document.querySelector('.noty_text').innerHTML)
  .end()
  .catch(e => {
    log.error(`oh noes: ${e}`)
  })
  .then((i) => {
    log.info(i)
  })
