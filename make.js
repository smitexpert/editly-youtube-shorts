import editly from 'editly';
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse'
import getStream from 'get-stream'
import { v4 as uuidv4 } from 'uuid'
import { titleFrameSource, slideInTextFrameSource, newTitleFrameSource, waterMarkText } from './source/custom.js'



const sheet = "./story.csv";
const width = 1080;
const height = 1920;

async function makeStory() {
    const stories = [];
    const data = await getStream.array(fs.createReadStream(sheet)
                        .pipe(parse({ delimiter: ',' })));

    data.map(item => {
        stories.push({
            title: item[0],
            question: item[1],
            answer: item[2]
        })
    })
    
    return stories;
}

async function getAudios() {
    let dir = './audios'

    const folderContents = fs.readdirSync(dir);
    const files = folderContents.filter(filename => fs.statSync(path.join(dir, filename)).isFile())
                                .map(filename => {
                                    return { path: path.join(dir, filename), tags: [] }
                                })

    return files;
}

async function getVideos() {
    let dir = './videos'

    const folderContents = fs.readdirSync(dir);
    const files = folderContents.filter(filename => fs.statSync(path.join(dir, filename)).isFile())
                                .map(filename => {
                                    return { path: path.join(dir, filename), tags: [] }
                                })

    return files;
}

const audios = await getAudios();
const videos = await getVideos();


const editSpec = {
    outPath: './',
    width: width,
    height: height,
    fps: 60,
    allowRemoteRequests: false,
    defaults: {
        layer: {
            fontPath: './fonts/Pacifico-Regular.ttf'
        }
    },
    clips: null,
    loopAudio: false,
    keepSourceAudio: false,
    clipsAudioVolume: 1,
    outputVolume: 1,
    audioTracks: [],
    audioNorm: {
      enable: false,
      gaussSize: 5,
      maxGain: 30,
    },
  
    // Testing options:
    enableFfmpegLog: false,
    verbose: false,
    fast: false,
  }


async function makeVideo( story ) {

    let video = videos[Math.floor(Math.random() * videos.length)].path;

    // const question = makeText( story.question, 0, 7 );
    // const answer = makeText( story.answer, 7, 10 );

    const clips = [
        { duration: 10, layers:  [
            { type: 'video', path: video, cutFrom: 0, cutTo: 10 },
            { type: 'fabric', func: newTitleFrameSource, text: story.title.toUpperCase() },
            { type: 'fabric', func: slideInTextFrameSource, text: story.question, fontSize: 0.07, start: 0, stop: 7 },
            { type: 'fabric', func: slideInTextFrameSource, text: story.answer, fontSize: 0.07, start: 7, stop: 10 },
            { type: 'fabric', func: waterMarkText, text: '@realTalkUnveiled', fontSize: 0.05, start: 0, stop: 10 }
        ] }
    ];

    const audioTracks = [
        {
          path: audios[Math.floor(Math.random() * audios.length)].path
        },
        // ...more audio tracks
      ];

    const datetime = new Date();

    editSpec.outPath = './outputs/'+story.question+'_'+datetime+'.mp4';
    editSpec.clips = clips;
    editSpec.audioTracks = audioTracks;

    // console.log("Processing: ", story.question);

    await editly(editSpec);
}

const stories = await makeStory();

for(let i=0; i < stories.length; i++) {
    await makeVideo( stories[i] );
}

function makeText( inputText, start = null, stop = null ) {
    const text = [];
    const inputWords = inputText.split(' ');

    let s = 0;
    let y = 0.5 - (((inputWords.length / 3) * 0.04 )/2);
    while(s < inputWords.length) {
        let makeWord = [];

        if(inputWords[s])
        {
            makeWord.push(inputWords[s]);
            s++;
        }
        if(inputWords[s])
        {
            makeWord.push(inputWords[s]);
            s++;
        }
        if(inputWords[s])
        {
            makeWord.push(inputWords[s]);
            s++;
        }

        if(makeWord.length > 0)
        {
            text.push( { type: 'slide-in-text', fontSize: 0.06, text: makeWord.join(" "), start: start, stop: stop, charSpacing: 0.0005, position: { y: y, originY: 'center', originX: 'center' } } )
            y = y + 0.04
        }
    }

    return text;
}
