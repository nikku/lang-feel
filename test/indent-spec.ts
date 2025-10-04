import { EditorState } from '@codemirror/state';
import { getIndentation } from '@codemirror/language';
import { feel, FeelConfig } from '..';

function check(code: string, options: FeelConfig = {}) {
  return () => {
    code = /^\n*([^]*)/.exec(code)![1];
    const state = EditorState.create({ doc: code, extensions: [ feel(options).language ] });

    for (let pos = 0, lines = code.split('\n'), i = 0; i < lines.length; i++) {
      const line = lines[i], indent = /^\s*/.exec(line)![0].length;
      expect(`${getIndentation(state, pos)} (${i + 1})`).to.eql(`${indent} (${i + 1})`);
      pos += line.length + 1;
    }
  };
}


describe('indent', function() {

  it('indents context', check(`
{
  bar: 1,
  baz: {
    boo: 1,
    "asd": {
      foo: 10
    }
  }
}
`));


  it('indents parenthesis', check(`
(
  (
    (
      1
    )
  )
)
`));


  it('indents nested calls', check(`
one(
  two(
    three(
      four()
    )
  )
)`));


  it('indents unfinished nodes', check(`
if (foo &&
  `));


  it('deindents then/else', check(`
if
  a
then
  x
else
  b
`));


  it('indents list members', check(`
[
  a,
  b
]
`));


  it('indents function args (named)', check(`
foo(
  a: 10,
  b: 100
)
`));


  it('indents function args (positional)', check(`
foo(
  10,
  100
)
`));


  it('intents function definition arguments', check(`
function(
  a: string,
  b: list
) a + b
`));


  it('intents function definition body', check(`
function(a, b)
  a + b
`));


  it('indents for expressions', check(`
for
  a in b
return
  a
`));


  it('indents quantified expression', check(`
every
  foo in bar,
  x in y
satisfies
  foo > 10 and
  x = 1
`));

});
