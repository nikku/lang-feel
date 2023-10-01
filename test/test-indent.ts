import ist from 'ist';
import { EditorState } from '@codemirror/state';
import { getIndentation } from '@codemirror/language';
import { feel } from 'lang-feel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function check(code: string, options: any = {}) {
  return () => {
    code = /^\n*([^]*)/.exec(code)![1];
    const state = EditorState.create({ doc: code, extensions: [ feel(options).language ] });

    console.log(state.doc.text.join('\n').replace(/ /g, '·'));

    for (let pos = 0, lines = code.split('\n'), i = 0; i < lines.length; i++) {
      const line = lines[i], indent = /^\s*/.exec(line)![0].length;
      ist(`${getIndentation(state, pos)} (${i + 1})`, `${indent} (${i + 1})`);
      pos += line.length + 1;
    }
  };
}


describe('feel indentation', () => {

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
