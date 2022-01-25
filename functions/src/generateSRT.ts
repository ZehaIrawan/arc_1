import * as functions from 'firebase-functions'
const fs = require('fs')
const { Storage } = require('@google-cloud/storage')
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
const speech = require('@google-cloud/speech')
const keyfile = require('../suboto-339002-588c76d20a36.json')
import { generateSRT } from './utils/generateSRT'

exports.generateSRT = functions.runWith({
        timeoutSeconds: 300,
        memory: '1GB',
    }).https.onRequest((request, response) => {
    const storageClient = new Storage()

    const config = {
        projectId: keyfile.project_id,
        keyFilename: require.resolve('../suboto-339002-588c76d20a36.json'),
    }

    const speechClient = new speech.SpeechClient(config)

    function getFilePathFromFile(storageFile: any) {
        return `gs://${storageFile.bucket.name}/${storageFile.name}`
    }

    function makeSpeechRequest(request: any) {
        console.log(`making request for ${JSON.stringify(request)}`)
        return new Promise((resolve, reject) => {
            speechClient
                .longRunningRecognize(request)
                .then(function (responses: any) {
                    var operation = responses[0]
                    return operation.promise()
                })
                .then(function (responses: any) {
                    resolve(responses[0])
                })
                .catch(function (err: any) {
                    reject(err)
                })
        })
    }

    async function transcribeAudio() {
        try {
            console.log('Transcribing audio')
            const flacBucket = storageClient.bucket('gs://suboto-audio/')
            const fileName = 'china.flac'

            const audioFile = flacBucket.file(fileName)

            const audioFilePath = getFilePathFromFile(audioFile)

            console.log(`audioFilePath: ${JSON.stringify(audioFilePath)}`)
            //    audioFileNameWithoutExtension = path.parse(audioFilePath).name;
            const request = {
                config: {
                    enableWordTimeOffsets: true,
                    languageCode: 'en-US',
                    encoding: 'FLAC',
                },
                audio: {
                    uri: audioFilePath,
                },
            }
            const googleSpeech = await makeSpeechRequest(request)

            const parsed = JSON.stringify(googleSpeech)

            // console.log(parsed);
            const generate =  generateSRT(parsed)
            // console.log(res)
            // console.log(`generate ${generate},Stringify ${JSON.stringify(generate)}`)
            response.send(`Transcribing audio:${JSON.stringify(generate)}`)
        } catch (error) {
            console.log(error,'error')
            response.send(error)
        }
    }

    transcribeAudio();
})
