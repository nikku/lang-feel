import {
  parser,
  trackVariables
} from 'lezer-feel';

import {
  LRLanguage,
  LanguageSupport,
  delimitedIndent,
  continuedIndent,
  indentNodeProp,
  foldNodeProp,
  foldInside
} from '@codemirror/language';

import {
  snippets
} from './snippets';

import {
  keywordCompletions,
  snippetCompletion
} from './completion';

import {
  CompletionSource
} from '@codemirror/autocomplete';


/**
 * A FEEL language provider based on the
 * [Lezer FEEL parser](https://github.com/nikku/lezer-feel),
 * extended with highlighting and indentation information.
 */
export const feelLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        'Context': delimitedIndent({
          closing: '}'
        }),
        'List FilterExpression': delimitedIndent({
          closing: ']'
        }),
        'ParenthesizedExpression FunctionInvocation': continuedIndent({
          except: /^\s*\)/
        }),
        'ForExpression QuantifiedExpression IfExpression': continuedIndent({
          except: /^\s*(then|else|return|satisfies)\b/
        }),
        'FunctionDefinition': continuedIndent({
          except: /^\s*(\(|\))/
        })
      }),
      foldNodeProp.add({
        Context: foldInside,
        List: foldInside,
        ParenthesizedExpression: foldInside,
        FunctionDefinition(node) {
          const last = node.getChild(')');

          if (!last) return null;

          return {
            from: last.to,
            to: node.to
          };
        }
      })
    ]
  }),
  languageData: {
    indentOnInput: /^\s*(\)|\}|\]|then|else|return|satisfies)$/,
    commentTokens: {
      line: '//',
      block: {
        open: '/*',
        close: '*/'
      }
    }
  }
});

/**
 * A language provider for FEEL Unary Tests
 */
export const unaryTestsLanguage = feelLanguage.configure({
  top: 'UnaryTests',
}, 'FEEL unary tests');

/**
 * Language provider for FEEL Expression
 */
export const expressionLanguage = feelLanguage.configure({
  top: 'Expression'
}, 'FEEL expression');



/**
 * Feel language support for CodeMirror.
 *
 * Includes [snippet](#lang-feel.snippets)
 */
export function feel(config: {
  dialect?: 'expression' | 'unaryTests',
  completions?: CompletionSource[],
  context?: Record<string, any>
} = {}) {
  const lang = config.dialect === 'unaryTests' ? unaryTestsLanguage : expressionLanguage;

  const contextualLang = lang.configure({
    contextTracker: trackVariables(config.context)
  });

  const completions = config.completions || [
    snippetCompletion(snippets),
    keywordCompletions,
  ].flat();

  return new LanguageSupport(contextualLang, [
    ...(
      completions.map(autocomplete => feelLanguage.data.of({
        autocomplete
      }))
    )
  ]);

}