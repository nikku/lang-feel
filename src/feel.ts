import {
  parser,
  trackVariables
} from 'lezer-feel';

import { LRLanguage, LanguageSupport,
  delimitedIndent, continuedIndent, indentNodeProp,
  foldNodeProp, foldInside } from '@codemirror/language';
import { completeFromList, ifNotIn } from '@codemirror/autocomplete';
import { snippets } from './snippets';

// / A language provider based on the [Lezer FEEL
// / parser](https://github.com/nikku/lezer-feel), extended with
// / highlighting and indentation information.
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

// / A language provider for TypeScript.
export const unaryTestsLanguage = feelLanguage.configure({ top: 'UnaryTests' });

// / Language provider for JSX.
export const expressionsLanguage = feelLanguage.configure({ top: 'Expressions' });

const keywords = 'return satisfies then in'.split(' ').map(kw => ({ label: kw, type: 'keyword' }));

export const dontComplete = [
  'StringLiteral', 'Name',
  'LineComment', 'BlockComment'
];

// / FEEL support. Includes [snippet](#lang-feel.snippets)
// / completion.
export function feel(config: {
  dialect?: 'expressions' | 'unaryTests',
  context?: Record<string, any>
} = {}) {
  const lang = config.dialect === 'unaryTests' ? unaryTestsLanguage : expressionsLanguage;

  const contextualLang = lang.configure({
    contextTracker: trackVariables(config.context)
  });

  return new LanguageSupport(contextualLang, [
    feelLanguage.data.of({
      autocomplete: ifNotIn(dontComplete, completeFromList(snippets.concat(keywords)))
    })
  ]);
}