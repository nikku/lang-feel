import { Compartment, EditorState, Facet } from '@codemirror/state';
import { feel } from '..';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { syntaxTree } from '@codemirror/language';

import { domify } from 'min-dom';

type Dialect = 'expression' | 'unaryTests';

type ParserDialect = undefined | 'camunda';

type EnvWindow = {
  __env__?: {
    SINGLE_START?: string
  }
};

const singleStart = (window as EnvWindow).__env__?.SINGLE_START === '1';


describe('basic', function() {

  let parent: HTMLDivElement;

  beforeEach(function() {

    parent = document.createElement('div');
    parent.setAttribute('style', 'width: 600px; border: solid 1px #CCC');

    document.body.appendChild(parent);
  });


  (singleStart ? it.only : it)('should configure editor', function() {
    const doc = `for
  fruit in [ "apple", "bananas" ], vegetable in vegetables
return
  { ingredients: [ fruit, vegetable ] }`;

    const languageConf = new Compartment();
    const dialectFacet = Facet.define<Dialect>();
    const parserDialectFacet = Facet.define<ParserDialect>();

    const languageExtension = (dialect: Dialect, parserDialect: ParserDialect) => {
      return [
        dialectFacet.of(dialect),
        parserDialectFacet.of(parserDialect),
        feel({
          dialect,
          parserDialect
        })
      ];
    };

    const view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [
          basicSetup,
          languageConf.of(languageExtension('expression', undefined)),
          EditorState.allowMultipleSelections.of(false)
        ]
      }),
      parent
    });

    const toggleDialectSelect = domify(`<select name="dialect" value="expression">
      <option value="expression">Type: Expression</option>
      <option value="unaryTests">Type: UnaryTest</option>
    </select>`) as HTMLSelectElement;

    toggleDialectSelect.onchange = () => {

      const parserDialect = view.state.facet(parserDialectFacet)[0];

      const dialect = toggleDialectSelect.value;

      view.dispatch({
        effects: [
          languageConf.reconfigure(languageExtension(dialect as Dialect, parserDialect))
        ]
      });
    };

    parent.appendChild(toggleDialectSelect);

    const toggleParserDialectSelect = domify(`<select name="parserDialect" value="">
      <option value="">Parser dialect: none</option>
      <option value="camunda">Parser dialect: camunda</option>
    </select>`) as HTMLSelectElement;

    toggleParserDialectSelect.onchange = () => {

      const dialect = view.state.facet(dialectFacet)[0];

      const parserDialect = toggleParserDialectSelect.value || undefined;

      view.dispatch({
        effects: [
          languageConf.reconfigure(languageExtension(dialect, parserDialect as ParserDialect))
        ]
      });
    };

    parent.appendChild(toggleParserDialectSelect);

    view.focus();
  });


  it('should configure parser dialect', function() {

    // given
    const doc = 'a.`b + c`';

    const state = EditorState.create({
      doc,
      extensions: [
        basicSetup,
        feel({
          dialect: 'expression',
          parserDialect: 'camunda'
        })
      ]
    });

    // when
    const tree = syntaxTree(state);

    const node = tree.resolve(4);

    // then
    expect(node.name).to.eql('BacktickIdentifier');
  });

});