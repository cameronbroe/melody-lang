d# Melody

Melody is an audio programming language influenced from music trackers like Renoise. The language is designed to compile down into MIDI messages that can be sent to a synthesizer. This is not a real-time synthesis engine like CSound or ChucK. Initially, it is being written to use Repl.it's audio feature and generate tone messages.

### Overview

A Melody file is called a _document_. Inside of a _document_, there are different types of _blocks_. The two main ones are the _composition_ block and the _melody_ block. Every Melody _document_ is required to have exactly a single _composition_ block. This will serve as the entrypoint into your music. From there, a _composition_ block contains _statements_ that can be _notes_, _melody references_, or _parameters_. A _melody_ block contains similar _statements_ to a _composition_, however _parameters_ are scoped only for that _melody_ block.

## Notes

A _note_ has syntax like this: `{ $noteName $noteAccidental $noteOctave $noteInterval? }`

`$noteName` is the name of the musical note to play

`$noteAccidental` is the accidental type of the note. `-` for natural, `#` for sharp, and `b` for flat

`$noteOctave` is what octave number to play

`$noteInterval` is a pair of values to help calculate the length the note should play. It can be omitted with a default pair of `* 1`, which is 1 beat.
`$divisionType` is how the length is calculated. `*` is multiplicative and will cause the note to play for `$noteLength` beats. `/` is division.
* `* 1` means one beat.
* `* 4` means 4 beats.
* `/ 2` means half of a beat.

`$noteLength` is the operand for the `$divisionType` operation. This is in relation to the `#bpm` parameter of the current scope. It can be omitted for a default value of 1.

### Example syntax

`${G-5}` G natural of the 5th octave

`${F#4}` F sharp of the 4th octave

`${Eb5 * 2}` 2 beat E flat of the 5th octave

`${A-4 / 2}` 1/2 beat A natural of the 4th octave

## Blocks

There are two supported types of blocks. Composition and melody blocks. They are effectively the same thing where they consist of statements that consist of either notes, melody references, or parameters. Each statement is evaluated in order, synchronously. There is only one composition block allowed per document, as this acts as the entrypoint into the document. From there, melody blocks act as scoping mechanisms for melodic lines and parameters are scoped within a melody.

### Example syntax

```
composition {
  ${C-4};
  ${D-4};
  ${E-4};
  ${F-4};
  ${G-4};
  ${A-4};
  ${B-4};
  ${C-5};
}
```

```
melody arpeg {
  ${C-4};
  ${E-4};
  ${G-4 * 2};
}

composition {
  $arpeg;
}
```