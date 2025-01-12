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

export const dontComplete = [
  'StringLiteral', 'Identifier',
  'LineComment', 'BlockComment',
  'PathExpression', 'Context',
  'Key', 'ParameterName'
];

export const doComplete = [
  'Expr',
  'ContextEntry'
];

export function ifExpression(completionSource: CompletionSource) : CompletionSource {

  const allNodes = [ ...dontComplete, ...doComplete ];

  return (context: CompletionContext) => {

    const { state, pos } = context;

    const match = matchUp(syntaxTree(state).resolveInner(pos, -1), allNodes);

    if (match) {

      const [ _, name ] = match;

      if (dontComplete.includes(name)) {
        return null;
      }
    }

    return completionSource(context);
  };
}

export function snippetCompletion(snippets: readonly Completion[]) : CompletionSource {
  return ifExpression(
    completeFromList(snippets.map(s => ({ ...s, type: 'text' })))
  );
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