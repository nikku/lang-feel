import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';

import {
  CompletionSource,
  Completion,
  completeFromList,
  CompletionContext
} from '@codemirror/autocomplete';


export function contextualKeyword(options: {
  before?: string,
  after?: string,
  context: string,
  keyword: string
}) : CompletionSource {

  const {
    context: nodes,
    after,
    before,
    keyword
  } = options;

  return ifInside({ nodes, before, after, keyword }, completeFromList([
    { label: keyword, type: 'keyword', boost: 10 }
  ]));
}

export const keywordCompletions = [
  contextualKeyword({
    context: 'InExpression',
    keyword: 'in'
  }),
  contextualKeyword({
    context: 'IfExpression',
    keyword: 'then',
    after: 'if',
    before: 'else'
  }),
  contextualKeyword({
    context: 'IfExpression',
    keyword: 'else',
    after: 'then'
  }),
  contextualKeyword({
    context: 'QuantifiedExpression',
    keyword: 'satisfies'
  }),
  contextualKeyword({
    context: 'ForExpression',
    after: 'InExpressions',
    keyword: 'return'
  })
];

export const dontCompleteLiteral = [
  'StringLiteral',
  'LineComment', 'BlockComment',
  'PathExpression', 'Context',
  'Key', 'ParameterName'
];

export const dontCompleteExpression = [
  'Identifier',
  ...dontCompleteLiteral
];

export const doCompleteExpression = [
  'Expr',
  'ContextEntry'
];

export function ifNode(completionSource: CompletionSource, {
  include,
  exclude
} : {
  include: string[],
  exclude: string[]
}) {

  const allNodes = [ ...exclude, ...include ];

  return (context: CompletionContext) => {

    const { state, pos } = context;

    const match = matchUp(syntaxTree(state).resolveInner(pos, -1), allNodes);

    if (match) {

      const [ _, name ] = match;

      if (exclude.includes(name)) {
        return null;
      }
    }

    return completionSource(context);
  };
}

export function ifExpression(completionSource: CompletionSource) : CompletionSource {
  return ifNode(completionSource, {
    include: doCompleteExpression,
    exclude: dontCompleteExpression
  });
}

export function ifExpressionOrIdentifier(completionSource: CompletionSource) : CompletionSource {
  return ifNode(completionSource, {
    include: doCompleteExpression,
    exclude: dontCompleteLiteral
  });
}

export function combineCompletionSources(sources: CompletionSource[]) : CompletionSource {

  return async (context) => {
    const results = await Promise.all(
      sources.map(source => source(context))
    );

    const matchedResults = results.filter(r => !!r);

    if (!matchedResults.length) {
      return null;
    }

    if (matchedResults.length === 1) {
      return matchedResults[0];
    }

    return {
      from: Math.min(...matchedResults.map(r => r.from)),
      options: matchedResults.flatMap(r => r.options)
    };
  };
}

export function snippetCompletion(snippets: readonly Completion[]) : CompletionSource {

  const taggedSnippets = snippets.map(s => ({ ...s, type: 'text' }));

  // split literal completions from other completions
  // literal completions may appear in place of <Identifier> nodes,
  // other snippets may only appear in place of <Expression> nodes
  const literalSnippets = taggedSnippets.filter(s => s.detail === 'literal');
  const regularSnippets = taggedSnippets.filter(s => s.detail !== 'literal');

  const sources: CompletionSource[] = [];

  if (regularSnippets.length) {
    sources.push(ifExpression(
      completeFromList(regularSnippets)
    ));
  }

  if (literalSnippets.length) {
    sources.push(ifExpressionOrIdentifier(
      completeFromList(literalSnippets)
    ));
  }

  return combineCompletionSources(sources);
}

export function matchLeft(node: SyntaxNode, position: number, nodes: (string|undefined)[]) : SyntaxNode | null {
  return matchChildren(node, position, nodes, -1);
}

export function matchRight(node: SyntaxNode, position: number, nodes: (string|undefined)[]) : SyntaxNode | null {
  return matchChildren(node, position, nodes, 1);
}

export function matchChildren(node: SyntaxNode, position: number, nodes: (string|undefined)[], direction: 1 | -1) : SyntaxNode | null {

  let child = node[direction > 0 ? 'childAfter' : 'childBefore'](position);

  while (child) {
    if (nodes.includes(child.name)) {
      return child;
    }

    if (child.type.isError && child.firstChild) {
      if (nodes.includes(child.firstChild.name)) {
        return child.firstChild;
      }
    }

    child = child[direction > 0 ? 'nextSibling' : 'prevSibling'];
  }

  return null;
}

function matchUp(node: SyntaxNode, nodeNames: string | string[]) : [ SyntaxNode, string ] | null {

  if (!Array.isArray(nodeNames)) {
    nodeNames = [ nodeNames ];
  }

  for (; node; node = node.parent!) {

    const nodeType = node.type;

    const matchedName = nodeNames.find(name => name && nodeType.is(name));

    if (matchedName) {
      return [ node, matchedName ];
    }

    if (nodeType.isTop) {
      break;
    }
  }

  return null;
}

export function ifInside(options: {
  nodes: string | string[],
  keyword: string,
  before?: string,
  after?: string
}, source: CompletionSource): CompletionSource {

  const {
    nodes,
    before,
    after,
    keyword
  } = options;

  return (context) => {

    const { state, pos } = context;

    const match = matchUp(syntaxTree(state).resolveInner(pos, -1), nodes);

    if (!match) {
      return null;
    }

    const [ node ] = match;

    if (matchLeft(node, pos, [ keyword, before ])) {
      return null;
    }

    if (matchRight(node, pos, [ keyword, after ])) {
      return null;
    }

    if (after && !matchLeft(node, pos, [ after ])) {
      return null;
    }

    return source(context);
  };
}