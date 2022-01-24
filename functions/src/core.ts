import * as functions from 'firebase-functions'
import { parse } from 'path/posix'
import { generateSRT } from './utils/generateSRT'
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

exports.core = functions.https.onRequest((request, response) => {
    const storageClient = new Storage()
    const videoBucket = storageClient.bucket('gs://suboto.appspot.com')
    const flacBucket = storageClient.bucket('gs://suboto-audio/')

    // The ID of your GCS file
    const fileName = 'afghan.mp4'

    function downloadFile(file: any, fileName: any) {
        console.log('Download started for ' + fileName)
        let sourcePath = path.parse(fileName)
        return new Promise((resolve, reject) => {
            let tempDestination = '/tmp/' + fileName
            file.download({
                destination: tempDestination,
            }).then((error: any) => {
                console.log('Download is done ' + error)
                if (error.length > 0) {
                    reject(error)
                } else {
                    resolve({
                        source: {
                            name: sourcePath.name,
                            ext: sourcePath.ext,
                        },
                        destination: { temp: { video: tempDestination } },
                    })
                }
            })
        })
    }

    async function getAudio(fileinfo: any) {
        let tempAudioPath = '/tmp/' + fileinfo.source.name + '.flac'
        // fileinfo.destination.temp.audio = tempAudioPath
        try {
            await ffmpeg(fileinfo.destination.temp.video)
                // .videoBitrate(19200)
                // .inputOptions('-vn')
                .format('flac')
                .audioChannels(1)
                .output(tempAudioPath)
                .on('end', () => {
                    console.log('Audio file created')
                })
                .on('error', (err: any) => {
                    console.log(err)
                })
                .run()
            ffmpeg.ffprobe(
                fileinfo.destination.temp.video,
                function (err: unknown, metadata: any) {
                    console.log('VIDEO', metadata.format.duration)
                }
            )
            return tempAudioPath
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async function uploadToBucket(bucket: any, filepath: any) {
        try {
             ffmpeg.ffprobe(
                filepath,
                function (err: unknown, metadata: any) {
                    console.log('AUDIO', metadata.format.duration)
                }
            )
            console.log(`${filepath} uploaded to bucket.`)
            return await bucket.upload(filepath)
        } catch (err) {
            console.error('ERROR:', err)
        }
    }

    function uploadFlac(filepath: any) {
        try {
            console.log('Uploading flac to bucket')
            return uploadToBucket(flacBucket, filepath)
        } catch (error) {
            console.log(error)
            return error
        }
    }

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

    async function extractAudio() {
        try {
            const videoFile = await videoBucket.file(fileName)
            const downloadedFile = await downloadFile(videoFile, fileName)
            const fileinfo = await downloadedFile
            const audioFile = await getAudio(fileinfo)
            const res = await uploadFlac(audioFile)
            response.send(`Extracted Audio :${JSON.stringify(res[0].metadata)}`)
        } catch (error) {
            response.send(error)
        }
    }

    async function transcribeAudio() {
        try {
            console.log('Transcribing audio')
            const flacBucket = storageClient.bucket('gs://suboto-audio/')
            const fileName = 'afghan.flac'

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
            const generate = generateSRT(parsed)
            // console.log(res)
            console.log(generate, JSON.stringify(generate), 'INDEX')
            response.send(`Transcribing audio:${generate}`)
        } catch (error) {
            console.log('error')
        }
    }

    extractAudio()
    // transcribeAudio()
})
