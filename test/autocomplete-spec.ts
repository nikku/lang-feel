import { EditorSelection, EditorState } from '@codemirror/state';
import { feel } from '..';
import { autocompletion, currentCompletions, startCompletion } from '@codemirror/autocomplete';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';


function check(options: {
  doc: string,
  selection?: number | [ number, number ],
  expectedCompletions: { label: string, excluded?: boolean }[]
}) {

  return async () => {
    let {
      selection
    } = options;

    const {
      doc,
      expectedCompletions
    } = options;

    if (typeof selection === 'undefined') {
      selection = doc.length;
    }

    const editorSelection = Array.isArray(selection)
      ? EditorSelection.single(selection[0], selection[1])
      : EditorSelection.single(selection);

    const parent = document.createElement('div');
    document.querySelector('body')?.appendChild(parent);
    parent.style.height = '400px';

    const view = new EditorView({
      state: EditorState.create({
        doc,
        selection: editorSelection,
        extensions: [
          basicSetup,
          feel(),
          autocompletion({ interactionDelay: 0 }),
          EditorState.allowMultipleSelections.of(false)
        ]
      }),
      parent
    });

    startCompletion(view);

    await wait(50);

    const completions = currentCompletions(view.state);

    for (const expectedCompletion of expectedCompletions) {
      const {
        label,
        excluded
      } = expectedCompletion;

      if (!excluded) {
        expect(
          completions.some(c => c.label === label),
          `expected <${label}> completion`
        ).to.be.true;
      } else {
        expect(
          completions.every(c => c.label !== label),
          `expected NO <${label}> completion`
        ).to.be.true;
      }
    }

    view.destroy();
  };
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('feel completion', () => {

  it('completes next token', check({
    doc: 'if v > 10 ',
    expectedCompletions: [
      { label: 'then' },
      { label: 'else', excluded: true }
    ]
  }));


  it('does not complete existing token', check({
    doc: 'if v > 10 then ',
    expectedCompletions: [
      { label: 'then', excluded: true },
      { label: 'else' }
    ]
  }));

  it('does not complete out of bounds token', check({
    doc: 'if v > 10 then',
    selection: 10,
    expectedCompletions: [
      { label: 'then', excluded: true }
    ]
  }));

});
