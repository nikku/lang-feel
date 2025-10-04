import { EditorState } from '@codemirror/state';
import { feelLanguage } from '..';
import { ensureSyntaxTree } from '@codemirror/language';
import { Tree } from '@lezer/common';

function s(doc: string) {
  return EditorState.create({ doc, extensions: [ feelLanguage.extension ] });
}

function tr(state: EditorState) {
  return ensureSyntaxTree(state, state.doc.length, 1e9)!;
}


describe('syntax', function() {

  it('returns a tree', function() {
    const state = s('1 + 322'), tree = tr(state);

    expect(tree instanceof Tree).to.be.true;
    expect(tree.type.name).to.eql('Expression');
    expect(tree.length).to.eql(state.doc.length);

    const def = tree.resolve(5);
    expect(def.name).to.eql('NumericLiteral');
    expect(def.from).to.eql(4);
    expect(def.to).to.eql(7);
  });


  it('keeps the tree up to date through changes', function() {
    let state = s('if (2)\n  x');
    expect(tr(state).topNode.childAfter(0)!.name).to.eql('IfExpression');
    state = state.update({ changes: { from: 0, to: 3, insert: 'fac' } }).state;
    expect(tr(state).topNode.childAfter(0)!.name).to.eql('FunctionInvocation');
  });


  it('reuses nodes when parsing big documents', function() {
    let state = s('"hello"\n + "blah"\n +'.repeat(1000).replace(/[+]$/, ''));

    const buf = (tr(state).resolve(2) as any).buffer;
    state = state.update({ changes: { from: 600, to: 620, insert: 'xyz' } }).state;

    expect((tr(state).resolve(2) as any).buffer).to.eql(buf);
  });

});
