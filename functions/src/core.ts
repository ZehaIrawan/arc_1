import * as functions from 'firebase-functions'
const ffmpeg = require('fluent-ffmpeg')
const { Storage } = require('@google-cloud/storage')
const path = require('path')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path


const fs = require('fs')


// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

ffmpeg.setFfmpegPath(ffmpegPath)

exports.core = functions
    .runWith({
        timeoutSeconds: 300,
        memory: '1GB',
    })
    .https.onRequest((request, response) => {
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
                    .setFfmpegPath(ffmpegPath)
                    .format('flac')
                    .audioChannels(1)
                    .output(tempAudioPath)
                    .on('end', async () => {
                        console.log('Audio file created')
                        const res = await uploadFlac(tempAudioPath)
                        console.log('Audio file uploaded')
                        response.send(
                            `Extracted Audio :${JSON.stringify(
                                res[0].metadata
                            )}`
                        )
                        fs.unlinkSync(`/tmp/afghan.flac`)
                        console.log(`/tmp/afghan.flac deleted`)

                        fs.unlinkSync(`/tmp/afghan.mp4`)
                        console.log(`/tmp/afghan.mp4 deleted`)
                    })
                    .on('error', (err: any) => {
                        console.log(err)
                    })
                    .run()
                await ffmpeg.ffprobe(
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

        async function extractAudio() {
            try {
                const videoFile = await videoBucket.file(fileName)
                const downloadedFile = await downloadFile(videoFile, fileName)
                const fileinfo = await downloadedFile
                const audioFile = await getAudio(fileinfo)
            } catch (error) {
                response.send(error)
            }
        }

        extractAudio()
        // transcribeAudio()
    })
