import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';

import {
  CompletionSource,
  Completion,
  completeFromList,
  ifNotIn
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
  'LineComment', 'BlockComment'
];

export function snippetCompletion(snippets: readonly Completion[]) : CompletionSource {
  return ifNotIn(
    dontComplete, completeFromList(snippets.map(s => ({ ...s, type: 'text' })))
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

function matchUp(node: SyntaxNode, nodeNames: string | undefined | (string | undefined)[]) {

  if (!Array.isArray(nodeNames)) {
    nodeNames = [ nodeNames ];
  }

  for (; node; node = node.parent!) {
    if (nodeNames.includes(node.name)) {
      return node;
    }

    if (node.type.isTop) {
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

    const node = matchUp(syntaxTree(state).resolveInner(pos, -1), nodes);

    if (!node) {
      return null;
    }

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