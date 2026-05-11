import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

const feelHighlightStyle = HighlightStyle.define([
  { tag: t.controlKeyword, color: '#af00db', fontWeight: 'bold' },
  { tag: t.operatorKeyword, color: '#0000ff', fontWeight: 'bold' },
  { tag: t.definitionKeyword, color: '#0000ff', fontWeight: 'bold' },
  { tag: t.keyword, color: '#0000ff' },

  { tag: t.string, color: '#a31515' },
  { tag: t.special(t.string), color: '#a31515' },
  { tag: t.number, color: '#087c52' },
  { tag: t.bool, color: '#0000ff' },
  { tag: t.null, color: '#0000ff' },

  { tag: t.typeName, color: '#247891' },

  { tag: t.variableName, color: '#0070c1' },
  { tag: t.definition(t.variableName), color: '#0070c1' },
  { tag: t.special(t.variableName), color: '#0000ff' },

  { tag: t.function(t.variableName), color: '#795e26' },
  { tag: t.function(t.special(t.variableName)), color: '#795e26' },
  { tag: t.function(t.definition(t.variableName)), color: '#795e26' },
  { tag: t.function(t.propertyName), color: '#795e26' },

  { tag: t.definition(t.propertyName), color: '#0070c1' },
  { tag: t.definition(t.literal), color: '#383a42' },

  { tag: t.arithmeticOperator, color: '#383a42' },
  { tag: t.compareOperator, color: '#383a42' },

  { tag: t.lineComment, color: '#008000', fontStyle: 'italic' },
  { tag: t.blockComment, color: '#008000', fontStyle: 'italic' },

  { tag: t.list, color: '#383a42' },
  { tag: t.paren, color: '#383a42' },
  { tag: t.squareBracket, color: '#383a42' },
  { tag: t.brace, color: '#383a42' },
  { tag: t.derefOperator, color: '#383a42' },
  { tag: t.separator, color: '#383a42' },
  { tag: t.punctuation, color: '#383a42' }
]);

export const feelHighlighting = syntaxHighlighting(feelHighlightStyle);
