const fs = require('fs');
const ohm = require('ohm-js');
const util = require('util');
const lodash = require('lodash');
const net = require('net');

const bpm = 120;

const node_to_source = node => {
    if (node.ctorName == "_terminal") {
        return node.primitiveValue
    } else {
        return node.children.map(n => node_to_source(n)).join('')
    }
}

const semitone_count = (name, acc, octave) => {
  const mapping = {
    C: -9,
    D: -7,
    E: -5,
    F: -4,
    G: -2,
    A: 0,
    B: 2
  }
  // Get number of semitones of the natural relative to A4
  let count = mapping[name];
  // Account for accidentals
  if(acc === '#') {
    count += 1; // Sharp raises by a semitone
  } else if(acc === 'b') {
    count -= 1; // Flat lowers by a semitone
  }

  // Scale to the octave
  return count + ((octave - 4) * 12);
}

const note_to_freq = note => {
  // Useful link: https://pages.mtu.edu/~suits/NoteFreqCalcs.html
  // Anchor frequency: A-4 = f[0] = 440 Hz
  // f[n] = f[0] * (a)^n
  const a = 2 ** (1 / 12);
  const n = semitone_count(note.name, note.acc, note.octave);
  return parseInt(440 * (a ** n));
}

const interval_to_seconds = interval => {
  const beats_per_second = 60 / bpm;
  if(interval.type === "*") {
    return interval.value * beats_per_second;
  } else if(interval.type === "/") {
    return (1 / interval.value) * beats_per_second;
  } else {
    throw Exception("unknown interval type");
  }
}

const grammarData = fs.readFileSync('grammar.ohm');
const grammar = ohm.grammar(grammarData);

let melodies = {};

const melodyData = fs.readFileSync('examples/single-note.mldy');
const result = grammar.match(melodyData);

const playMessage = (msg) => {
  return new Promise((resolve, reject) => {
    fs.promises.writeFile('/tmp/audio', JSON.stringify(msg))
      .then(() => { console.log('wrote') });
    setTimeout(() => {
      console.log('on to the next note: ', msg["Args"]["Seconds"] * 1000);
      resolve(Date.now());
    }, msg["Args"]["Seconds"] * 1000)
  });
}

if(result.succeeded()) {
  console.log('Successfully parsed Melody document');

  const semantics = grammar.createSemantics();
  semantics.addOperation('compile', {
    CompositionBlock: (_k, _l, statements, _r) => {
      return statements.compile();
    },
    Statement: (obj, _) => {
      return obj.compile();
    },
    MelodyBlock: (_k, identifier, _l, statements, _r) => {
      melodies[identifier.compile()] = statements.compile()
    },
    melodyReference: (_, identifier) => {
      return melodies[identifier.compile()];
    },
    ident: (i) => {
      return node_to_source(i);
    },
    Note: (_l, note, interval, _r) => {
      const compiledInterval = interval.compile();
      return {
        note: note.compile(),
        interval: compiledInterval.length > 0 ? 
                    compiledInterval[0] : 
                    { type: '*', value: 1 }
      }
    },
    nonRestNote: (name, acc, octave) => {
      return {
        type: "tone",
        name: node_to_source(name),
        acc: node_to_source(acc),
        octave: node_to_source(octave)
      }
    },
    restNote: (_) => {
      return {
        type: "rest"
      }
    },
    IntervalPair: (intervalType, interval) => {
      return {
        type: node_to_source(intervalType),
        value: node_to_source(interval)
      }
    }
  })
  const compiledScore = lodash.filter(lodash.flattenDeep(semantics(result).compile()));
  console.log(util.inspect(compiledScore));
  
  let noteMessages = lodash.map(compiledScore, (note) => {
    if(note.note.type === "tone") {
      return {
        "Paused": false,
        "Name": "melody-lang",
        "Type": "tone",
        "Volume": 1,
        "DoesLoop": false,
        "LoopCount": 0,
        "Args": {
          "Pitch": note_to_freq(note.note),
          "Seconds": interval_to_seconds(note.interval),
          "Type": 2,
          "Path": ""
        }
      }
    } else {
      return {
        "Args": {
          "Seconds": interval_to_seconds(note.interval)
        }
      }
    }
  });
  console.log(noteMessages);

  noteMessages.reduce( (previousPromise, nextMsg) => {
    return previousPromise.then(() => {
      return playMessage(nextMsg);
    });
  }, Promise.resolve());
} else {
  console.log('Failed to parse Melody document');
  console.log(result.message);
} 