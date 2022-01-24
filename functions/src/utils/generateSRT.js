import { stringifySync } from 'subtitle'

function join_words(words, lang) {
    if (language == 'ja-JP' || language == 'th-TH') {
        return words.join(' ')
    }
    return words.join(' ')
}

let timestamp = []
let transcript = []
let tokens = []
let start = 0.0
let offset_threshold = -0.0
let language = 'en-US'

function get_seconds(nanoseconds, wordInfo) {
    if (nanoseconds === 0) {
        // console.log(parseFloat(wordInfo.startTime.seconds)*100_000_000 );
        const secondsInt = parseInt(wordInfo.startTime.seconds)
        // console.log(secondsInt);
        return secondsInt
    }
    return Math.round(nanoseconds / 10_000_000, 2)
}

// seconds to nanos 1_000_000_000
export function generateSRT(json) {
    const data = JSON.parse(json)
    // console.log(typeof data.results,data.results, 'RAA')
    // data = JSON.parse(data)
    let result = ''
data.results.forEach((result, index) => {
        // console.log(`Transcription: ${result.alternatives[0].transcript}`);
        // console.log(result.alternatives[0].words, 'words');
        result.alternatives[0].words.forEach((wordInfo) => {
            // NOTE: If you have a time offset exceeding 2^32 seconds, use the
            // wordInfo.{x}Time.seconds.high to calculate seconds.
            const startSecs =
                `${wordInfo.startTime.seconds}` +
                '.' +
                wordInfo.startTime.nanos / 100_000_000
            const endSecs =
                `${wordInfo.endTime.seconds}` +
                '.' +
                wordInfo.endTime.nanos / 100000000
            // console.log(`Word: ${wordInfo.word}`);
            // console.log(`\t ${startSecs} secs - ${endSecs} secs`);

            // Calculate difference between start and end times
            const difference = Math.round(startSecs - endSecs, 2)
            // console.log(`\t ${Math.round(startSecs-endSecs,2)} secs`);

            //  set start if tokens is empty indicating start of sentence
            if (!tokens) {
                start = startSecs
            }
            tokens.push(wordInfo)

            // build sentence if exceeds threhold, clear tokens and set start to next offset
            // console.log(difference<offset_threshold);

            // console.log(timestamp[timestamp.length - 1]?.text)
            if (difference < offset_threshold) {
                // if(wordInfo.startTime.nanos === 0){
                //   console.log('zero');
                // } else{

                //   console.log(wordInfo.word);
                //   console.log(get_seconds(wordInfo.startTime.nanos));
                // }
                const sentence = tokens.map((token) => token.word)
                // console.log(sentence);

                timestamp.push({
                    // text: join_words(tokens, language).replace(
                    //   timestamp[timestamp.length - index]?.text,
                    //   '',
                    // ),
                    text: join_words(sentence, language),
                    start:
                        tokens[0].startTime.seconds * 1000 +
                        get_seconds(tokens[0].startTime.nanos, wordInfo),
                    end:
                        tokens[tokens.length - 1].endTime.seconds * 1000 +
                        get_seconds(
                            tokens[tokens.length - 1].endTime.nanos,
                            wordInfo
                        ),
                })
                // {
                //               startTime: { seconds: '23', nanos: 100000000 },
                //               endTime: { seconds: '23', nanos: 500000000 },
                //               word: 'billion.',
                //               confidence: 0,
                //               speakerTag: 0,
                //             },

                // console.log('====');
                // console.log(`${tokens[0].startTime.seconds + get_seconds(tokens[0].startTime.nanos,wordInfo)}`);
                // console.log(tokens[0].word);
                // console.log(tokens[0].startTime.nanos);
                tokens = []
            } else if (index === data.length - 2) {
                console.log('FAIL')
            }
        })
        const list = []

        timestamp.map((item, index) => {
            list.push({
                type: 'cue',
                data: item,
            })
        })

        // const res = stringifySync(data, { format: 'SRT' });
        const res = stringifySync(list, { format: 'SRT' })
        // console.log(timestamp)
        console.log(res, 'GEN')
        result = res
      })
      return  result
}
//  Last year for the first time ever,
//  -1 secs
//  the public got a glimpse
//  -1 secs
// into the financials
//  -1 secs
// of Airline frequent
//  -1 secs
