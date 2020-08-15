# Melody

Melody is an audio programming language influenced from music trackers like Renoise. The language is designed to compile down into MIDI messages that can be sent to a synthesizer. This is not a real-time synthesis engine like CSound or ChucK. Initially, it is being written to use Repl.it's audio feature and generate tone messages.

## Overview

A Melody file is called a _document_. Inside of a _document_, there are different types of _blocks_. The two main ones are the _composition_ block and the _melody_ block. Every Melody _document_ is required to have exactly _composition_ block. This will serve as the entrypoint into your music. From there, a _composition_ block contains _statements_ that can include _notes_, _melody references_, and _parameters_. A _melody_ block contains similar _statements_ to a _composition_, however _parameters_ are scoped only for that _melody_ block.

## Notes

A _note_ has syntax like this: `{ $noteName $noteAccidental $noteOctave -> $noteLength }`

* `$noteName` is the name of the musical note to play
* `$noteAccidental` is the accidental type of the note. `-` for natural, `#` for sharp, and `b` for flat
* `$noteOctave` is what octave number to play
* `$noteLength` is the number of beats the note should be on. This is in relation to the `#bpm` parameter of the current scope. It can be omitted for a default value of 1.