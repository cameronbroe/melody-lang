const fs = require('fs');
const ohm = require('ohm-js');
const util = require('util');
const lodash = require('lodash');

const node_to_source = node => {
    if (node.ctorName == "_terminal") {
        return node.primitiveValue
    } else {
        return node.children.map(n => node_to_source(n)).join('')
    }
}

const grammarData = fs.readFileSync('grammar.ohm');
const grammar = ohm.grammar(grammarData);

let melodies = {};

const melodyData = fs.readFileSync('examples/ode-to-joy.mldy');
const result = grammar.match(melodyData);
if(result.succeeded()) {
  console.log('Successfully parsed Melody document');

  const semantics = grammar.createSemantics();
  semantics.addOperation('compile', {
    CompositionBlock: (_k, _l, statements, _r) => {
      return lodash.flatten(statements.compile());
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
    Note: (_l, name, acc, octave, _, int, _r) => {
      return {
        name: node_to_source(name),
        acc: node_to_source(acc),
        octave: parseInt(node_to_source(octave)),
        int: node_to_source(int) === '' ? 1 : parseInt(node_to_source(int))
      }
    }
  })
  const compiledScore = lodash.filter(lodash.flattenDeep(semantics(result).compile()));
  console.log(compiledScore);
} else {
  console.log('Failed to parse Melody document');
}