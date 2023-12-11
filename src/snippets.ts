import { Completion, snippetCompletion } from '@codemirror/autocomplete';

/**
 * A collection of FEEL-related [snippets](#autocomplete.snippet).
 */
export const snippets: readonly Completion[] = [
  snippetCompletion('function(${params}) ${body}', {
    label: 'function',
    detail: 'definition',
    type: 'keyword'
  }),
  snippetCompletion('for ${var} in ${collection} return ${value}', {
    label: 'for',
    detail: 'expression',
    type: 'keyword'
  }),
  snippetCompletion('every ${var} in ${collection} satisfies ${condition}', {
    label: 'every',
    detail: 'quantified expression',
    type: 'keyword'
  }),
  snippetCompletion('some ${var} in ${collection} satisfies ${condition}', {
    label: 'some',
    detail: 'quantified expression',
    type: 'keyword'
  }),
  snippetCompletion('if ${condition} then ${value} else ${other value}', {
    label: 'if',
    detail: 'block',
    type: 'keyword'
  }),
  snippetCompletion('{ ${key}: ${value} }', {
    label: 'context',
    detail: 'block',
    type: 'keyword'
  })
];
