import { EditorSelection, EditorState } from '@codemirror/state';
import { feel } from '..';
import { CompletionSource, autocompletion, currentCompletions, startCompletion } from '@codemirror/autocomplete';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';


describe('feel completion', () => {

  describe('built-in', () => {

    it('completes patterns', check({
      doc: '',
      expectedCompletions: [
        { label: 'context' },
        { label: 'function' },
        { label: 'for' },
        { label: 'if' },
        { label: 'some' },
        { label: 'every' }
      ]
    }));


    it('filteres matching', check({
      doc: 'if',
      expectedCompletions: [
        { label: 'context', excluded: true },
        { label: 'function', excluded: true },
        { label: 'for', excluded: true },
        { label: 'if' },
        { label: 'some', excluded: true },
        { label: 'every', excluded: true }
      ]
    }));


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


    it('completes snippet inside <expression>', check({
      doc: '{ a: }',
      selection: 5,
      expectedCompletions: [
        { label: 'if' },
        { label: 'context' }
      ]
    }));


    it('completes snippet inside (nested) <expression>', check({
      doc: 'a.b({ a: })',
      selection: 9,
      expectedCompletions: [
        { label: 'if' },
        { label: 'context' }
      ]
    }));


    it('does not complete snippet inside <pathExpression>', check({
      doc: '{ a: 1 }.',
      selection: 8,
      expectedCompletions: [
        { label: 'if', excluded: true },
        { label: 'context', excluded: true }
      ]
    }));


    it.skip('does not complete snippet <context> key', check({
      doc: '{  }',
      selection: 2,
      expectedCompletions: [
        { label: 'if', excluded: true },
        { label: 'context', excluded: true }
      ]
    }));


    it.skip('does not complete snippet inside <function> named parameter', check({
      doc: 'fn(: 100)',
      selection: 3,
      expectedCompletions: [
        { label: 'if', excluded: true },
        { label: 'context', excluded: true }
      ]
    }));

  });


  describe('customization', () => {

    it('completes custom', check({
      doc: '',
      config: {
        completions: [ customCompletion('HELLO') ]
      },
      expectedCompletions: [
        { label: 'HELLO' },
        { label: 'context', excluded: true },
        { label: 'function', excluded: true },
        { label: 'for', excluded: true },
        { label: 'if', excluded: true },
        { label: 'some', excluded: true },
        { label: 'every', excluded: true }
      ]
    }));


    it('completes <unaryTests>', check({
      doc: '',
      config: {
        completions: [ customCompletion('HELLO') ],
        dialect: 'unaryTests'
      },
      expectedCompletions: [
        { label: 'HELLO' },
        { label: 'context', excluded: true },
        { label: 'function', excluded: true },
        { label: 'for', excluded: true },
        { label: 'if', excluded: true },
        { label: 'some', excluded: true },
        { label: 'every', excluded: true }
      ]
    }));

  });

});



function check(options: {
  doc: string,
  selection?: number | [ number, number ],
  config?: {
    completions?: CompletionSource[],
    dialect?: 'expression' | 'unaryTests'
  },
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
          feel(options.config),
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

      const completion = completions.find(c => c.label === label);

      if (!excluded) {
        expect(
          completion,
          `expected <${label}> completion`
        ).to.exist;
      } else {
        expect(
          completion,
          `expected NO <${label}> completion`
        ).not.to.exist;
      }
    }

    view.destroy();
  };
}

function customCompletion(label: string): CompletionSource {

  return (context) => {

    return {
      from: 0,
      options: [
        { label, apply: () => {} }
      ]
    };
  };
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}