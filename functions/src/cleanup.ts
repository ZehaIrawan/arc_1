import * as functions from 'firebase-functions'
const fs = require('fs')

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript


exports.cleanup = functions.https.onRequest((request, response) => {
    try {
        const tempFilePath = '/tmp/afghan.mp4'
        fs.unlinkSync(tempFilePath)
        response.send(`Temporary files removed.', ${tempFilePath}`)
    } catch (error) {
        console.log(error)
        response.send('error')
    }
})
