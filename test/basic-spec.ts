import { Compartment, EditorState, Facet } from '@codemirror/state';
import { feel } from '..';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { syntaxTree } from '@codemirror/language';

type Dialect = 'expression' | 'unaryTests';


describe('basic', () => {

  let parent: HTMLDivElement;

  beforeEach(() => {

    parent = document.createElement('div');
    parent.setAttribute('style', 'width: 600px; border: solid 1px #CCC');

    document.body.appendChild(parent);
  });


  it('should configure editor', () => {
    const doc = `for
  fruit in [ "apple", "bananas" ], vegetable in vegetables
return
  { ingredients: [ fruit, vegetable ] }`;

    const languageConf = new Compartment();
    const dialectFacet = Facet.define<Dialect>();

    const languageExtension = (dialect: Dialect) => {
      return [
        dialectFacet.of(dialect),
        feel({
          dialect: dialect
        })
      ];
    };

    const view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [
          basicSetup,
          languageConf.of(languageExtension('expression')),
          EditorState.allowMultipleSelections.of(false)
        ]
      }),
      parent
    });

    const toggleDialectButton = document.createElement('button');
    toggleDialectButton.textContent = 'Current = expression, toggle';
    toggleDialectButton.onclick = () => {

      const dialect = view.state.facet(dialectFacet)[0];

      const next = dialect === 'expression' ? 'unaryTests' : 'expression';

      toggleDialectButton.textContent = `Current = ${next}, toggle`;

      view.dispatch({
        effects: [
          languageConf.reconfigure(languageExtension(next))
        ]
      });
    };

    parent.appendChild(toggleDialectButton);

    view.focus();
  });


  it('should configure parser dialect', () => {

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