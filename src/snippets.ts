import { Completion, snippetCompletion as snip } from '@codemirror/autocomplete';

// / A collection of FEEL-related
// / [snippets](#autocomplete.snippet).
export const snippets: readonly Completion[] = [
  snip('function(${params})\n\t${body}', {
    label: 'function',
    detail: 'definition',
    type: 'keyword'
  }),
  snip('for\n\t${a} in ${b}\nreturn\n\t${a}', {
    label: 'for',
    detail: 'expression',
    type: 'keyword'
  }),
  snip('every\n\t${a} in ${}\nsatisfies\n\t${a}', {
    label: 'every',
    detail: 'expression',
    type: 'keyword'
  }),
  snip('some\n\t${a} in ${}\nsatisfies\n\t${a}', {
    label: 'some',
    detail: 'expression',
    type: 'keyword'
  }),
  snip('if ${} then ${}', {
    label: 'if',
    detail: 'block',
    type: 'keyword'
  }),
  snip('if ${} then ${} else ${}', {
    label: 'if',
    detail: '/ else block',
    type: 'keyword'
  })
];
