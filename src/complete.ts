import { NodeWeakMap, SyntaxNodeRef, SyntaxNode, IterMode } from '@lezer/common';
import { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import { Text } from '@codemirror/state';

const cache = new NodeWeakMap<readonly Completion[]>();

const ScopeNodes = new Set([
  'Expressions',
  'FunctionDeclaration',
  'Context'
]);

function defID(type: string) {
  return (node: SyntaxNodeRef, def: (node: SyntaxNodeRef, type: string) => void) => {
    const id = node.node.getChild('Name');
    if (id) def(id, type);
    return true;
  };
}

const functionContext = [ 'FunctionDeclaration' ];

const gatherCompletions: {
  [node: string]: (node: SyntaxNodeRef, def: (node: SyntaxNodeRef, type: string) => void) => void | boolean
} = {
  FunctionDeclaration: defID('function'),
  Context: defID('context'),
  VariableDefinition(node, def) { if (!node.matchContext(functionContext)) def(node, 'variable'); },
  __proto__: null as any
};

function getScope(doc: Text, node: SyntaxNode) {
  const cached = cache.get(node);
  if (cached) return cached;

  console.log(node);

  const completions: Completion[] = [], top = true;
  function def(node: SyntaxNodeRef, type: string) {
    const name = doc.sliceString(node.from, node.to);
    completions.push({ label: name, type });
  }

  node.cursor(IterMode.IncludeAnonymous).iterate(node => {
    if (top) {
      top = false;
    } else if (node.name) {
      const gather = gatherCompletions[node.name];
      if (gather && gather(node, def) || ScopeNodes.has(node.name)) return false;
    } else if (node.to - node.from > 8192) {

      // Allow caching for bigger internal nodes
      for (const c of getScope(doc, node.node)) completions.push(c);
      return false;
    }
  });
  cache.set(node, completions);
  return completions;
}

const Identifier = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/;

export const dontComplete = [
  'StringLiteral',
  'LineComment', 'BlockComment',
  'VariableName'
];

// / Completion source that looks up locally defined names in
// / JavaScript code.
export function localCompletionSource(context: CompletionContext): CompletionResult | null {
  const inner = syntaxTree(context.state).resolveInner(context.pos, -1);

  console.log(inner);

  if (dontComplete.indexOf(inner.name) > -1) return null;
  const isWord = inner.to - inner.from < 20 && Identifier.test(context.state.sliceDoc(inner.from, inner.to));
  if (!isWord && !context.explicit) return null;
  let options: Completion[] = [];
  for (let pos: SyntaxNode | null = inner; pos; pos = pos.parent) {
    if (ScopeNodes.has(pos.name)) options = options.concat(getScope(context.state.doc, pos));
  }
  return {
    options,
    from: isWord ? inner.from : context.pos,
    validFor: Identifier
  };
}
