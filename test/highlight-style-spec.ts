import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { ensureSyntaxTree } from '@codemirror/language';

import {
  feel,
  feelHighlighting
} from 'lang-feel';

import { expect } from 'chai';


describe('highlight-style', function() {

  let parent: Element;

  beforeEach(function() {
    parent = document.createElement('div');
    document.body.appendChild(parent);
  });

  afterEach(function() {
    parent.remove();
  });


  describe('styled rendering', function() {

    function getSpanByText(doc: string, text: string) {
      const view = new EditorView({
        state: EditorState.create({
          doc,
          extensions: [
            feel({ dialect: 'expression' }),
            feelHighlighting
          ]
        }),
        parent
      });

      ensureSyntaxTree(view.state, doc.length, 5000);
      view.dispatch();

      const spans = parent.querySelectorAll('.cm-line span');
      const span = Array.from(spans).find(s => s.textContent === text);

      return { span, view };
    }

    it('should style keywords', function() {
      const { span, view } = getSpanByText('for x in [1] return x', 'for');
      expect(span, 'for keyword should exist').to.exist;
      expect(window.getComputedStyle(span!).color).to.equal('rgb(175, 0, 219)');
      view.destroy();
    });

    it('should style strings', function() {
      const { span, view } = getSpanByText('"hello"', '"hello"');
      expect(span, 'string should exist').to.exist;
      expect(window.getComputedStyle(span!).color).to.equal('rgb(163, 21, 21)');
      view.destroy();
    });

    it('should style variables', function() {
      const { span, view } = getSpanByText('x', 'x');
      expect(span, 'variable should exist').to.exist;
      expect(window.getComputedStyle(span!).color).to.equal('rgb(0, 112, 193)');
      view.destroy();
    });

  });

});
