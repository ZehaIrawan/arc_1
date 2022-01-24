import * as functions from 'firebase-functions'
const ffmpeg = require('fluent-ffmpeg')
const { Storage } = require('@google-cloud/storage')
const path = require('path')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const speech = require('@google-cloud/speech')
const keyfile = require('../suboto-339002-588c76d20a36.json')

const config = {
    projectId: keyfile.project_id,
    keyFilename: require.resolve('../suboto-339002-588c76d20a36.json'),
}

const speechClient = new speech.SpeechClient(config)
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

ffmpeg.setFfmpegPath(ffmpegPath)

exports.cleanup = functions.https.onRequest((request, response) => {
     response.send(`NRW`)
})
