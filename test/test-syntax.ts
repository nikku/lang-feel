import ist from 'ist';
import { EditorState } from '@codemirror/state';
import { feelLanguage } from 'lang-feel';
import { ensureSyntaxTree } from '@codemirror/language';
import { Tree } from '@lezer/common';

function s(doc: string) {
  return EditorState.create({ doc, extensions: [ feelLanguage.extension ] });
}

function tr(state: EditorState) {
  return ensureSyntaxTree(state, state.doc.length, 1e9)!;
}

describe('javascript syntax queries', () => {
  it('returns a tree', () => {
    const state = s('1 + 322'), tree = tr(state);
    ist(tree instanceof Tree);
    ist(tree.type.name, 'Expressions');
    ist(tree.length, state.doc.length);
    const def = tree.resolve(5);
    ist(def.name, 'NumericLiteral');
    ist(def.from, 4);
    ist(def.to, 7);
  });


  it('keeps the tree up to date through changes', () => {
    let state = s('if (2)\n  x');
    ist(tr(state).topNode.childAfter(0)!.name, 'IfExpression');
    state = state.update({ changes: { from: 0, to: 3, insert: 'fac' } }).state;
    ist(tr(state).topNode.childAfter(0)!.name, 'FunctionInvocation');
  });


  it('reuses nodes when parsing big documents', () => {
    let state = s('"hello"\n" + "blah"\n'.repeat(1000));
    const buf = (tr(state).resolve(2) as any).buffer;
    state = state.update({ changes: { from: 600, to: 620, insert: 'xyz' } }).state;
    ist((tr(state).resolve(2) as any).buffer, buf);
  });

});
