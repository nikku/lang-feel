import { Completion, snippetCompletion as snip } from '@codemirror/autocomplete';

// / A collection of FEEL-related
// / [snippets](#autocomplete.snippet).
export const snippets: readonly Completion[] = [
  snip('function(${params}) ${body}', {
    label: 'function',
    detail: 'definition',
    type: 'keyword'
  }),
  snip('for ${var} in ${collection} return ${value}', {
    label: 'for',
    detail: 'expression',
    type: 'keyword'
  }),
  snip('every ${var} in ${collection} satisfies ${condition}', {
    label: 'every',
    detail: 'quantified expression',
    type: 'keyword'
  }),
  snip('some ${var} in ${collection} satisfies ${condition}', {
    label: 'some',
    detail: 'quantified expression',
    type: 'keyword'
  }),
  snip('if ${condition} then ${value} else ${other value}', {
    label: 'if',
    detail: 'block',
    type: 'keyword'
  })
];
