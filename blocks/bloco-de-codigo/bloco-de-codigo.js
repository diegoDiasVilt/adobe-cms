// import { highlightCodeBlock } from "../../scripts/delayed.js";
import { isInEditor } from '../../scripts/scripts.js';

const BRACE_LANGUAGES = ['c', 'cpp', 'csharp', 'cs', 'dotnet', 'arduino', 'ino', 'java', 'javascript', 'js', 'typescript', 'ts', 'php', 'css', 'scss', 'less', 'json', 'json5', 'kotlin', 'kt', 'kts', 'swift', 'go', 'dart'];
const PREPROCESSOR_LANGUAGES = ['c', 'cpp', 'csharp', 'cs', 'dotnet', 'arduino', 'ino'];
const TEMPLATE_LANGUAGES = ['javascript', 'js', 'typescript', 'ts', 'go'];
const INDENT_UNITS = { 2: '  ', 4: '    ' };
const OPENERS = '{([';
const CLOSERS = '})]';
const CASE_LABEL = /^(case\b|default\s*:)/;

function allowsLineComment(language, line, index) {
  if (language === 'css') return false;
  if (language === 'scss' || language === 'less') return index === 0 || /\s/.test(line[index - 1]);
  return true;
}

function levelOf(stack) {
  return new Set(stack).size;
}

function scanLine(line, lineIndex, state, language) {
  const next = { ...state, stack: [...state.stack] };
  let quote = null;
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    const pair = line.slice(i, i + 2);
    let step = 1;
    if (next.inBlockComment) {
      if (pair === '*/') {
        next.inBlockComment = false;
        step = 2;
      }
    } else if (next.inTemplate || quote) {
      if (ch === '\\') step = 2;
      else if (next.inTemplate && ch === '`') next.inTemplate = false;
      else if (quote === ch) quote = null;
    } else if (pair === '/*') {
      next.inBlockComment = true;
      step = 2;
    } else if ((pair === '//' && allowsLineComment(language, line, i)) || (ch === '#' && language === 'php')) {
      step = line.length;
    } else if (ch === '`' && TEMPLATE_LANGUAGES.includes(language)) {
      next.inTemplate = true;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (OPENERS.includes(ch)) {
      next.stack.push(lineIndex);
    } else if (CLOSERS.includes(ch)) {
      next.stack.pop();
    }
    i += step;
  }
  return next;
}

function indentCode(code, language, size) {
  const unit = INDENT_UNITS[size] || INDENT_UNITS[4];
  const preprocessor = PREPROCESSOR_LANGUAGES.includes(language);
  let state = { stack: [], inBlockComment: false, inTemplate: false };
  let caseDepths = [];
  const labelBlockLines = [];
  return code.split('\n').map((line, lineIndex) => {
    const trimmed = line.trim();
    const manual = /^\s/.test(line);
    let result = line;
    let isLabel = false;
    if (trimmed && !state.inTemplate) {
      const inComment = state.inBlockComment;
      const closers = inComment ? 0 : (trimmed.match(/^[\])}]+/) || [''])[0].length;
      const level = levelOf(state.stack.slice(0, Math.max(0, state.stack.length - closers)));
      isLabel = !inComment && CASE_LABEL.test(trimmed);
      if (isLabel && !caseDepths.includes(level)) caseDepths.push(level);
      const labelBlocks = levelOf(state.stack.filter((l) => labelBlockLines.includes(l)));
      const extra = caseDepths.filter((d) => d < level || (d === level && !isLabel)).length
        - labelBlocks;
      const prefix = unit.repeat(level + extra);
      if (!manual) {
        if (inComment) result = `${prefix}${trimmed.startsWith('*') ? ' ' : ''}${trimmed}`;
        else if (preprocessor && trimmed.startsWith('#')) result = trimmed;
        else result = `${prefix}${trimmed}`;
      }
    }
    state = scanLine(line, lineIndex, state, language);
    if (isLabel && state.stack.includes(lineIndex)) labelBlockLines.push(lineIndex);
    caseDepths = caseDepths.filter((d) => d <= levelOf(state.stack));
    return result;
  }).join('\n');
}

function getCodeText(codeElement) {
  const clone = codeElement.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  return clone.textContent.replace(/\r\n?/g, '\n');
}

export default function decorate(block) {
  const autoIndent = block?.children[4]?.textContent?.trim() === 'true';
  const indentSize = block?.children[5]?.textContent?.trim();
  block?.children[5]?.remove();
  block?.children[4]?.remove();

  const language = block?.children[1]?.textContent?.trim();
  // eslint-disable-next-line radix
  const lineNumber = parseInt(block?.children[2]?.textContent?.trim() || 1);
  const id = block?.children[3];
  if (id) {
    id.remove();
    block.setAttribute('id', id?.textContent?.trim());
  }

  block?.children[1]?.remove();
  block?.children[1]?.remove();

  let codeElement = block.querySelector('pre > code');
  if (!codeElement) {
    const preElement = block.querySelector('pre');
    codeElement = document.createElement('code');
    codeElement.innerHTML = preElement.innerHTML;
    preElement.innerHTML = '';
    preElement.appendChild(codeElement);
  }

  const normalizedLanguage = language?.toLowerCase();
  if (autoIndent && BRACE_LANGUAGES.includes(normalizedLanguage)) {
    codeElement.textContent = indentCode(getCodeText(codeElement), normalizedLanguage, indentSize);
  }

  block?.classList?.add('line-numbers');
  block?.querySelector('pre').setAttribute('data-start', lineNumber);
  block?.querySelector('code')?.classList?.add(`language-${language}`);

  const languages = ['markup', 'html', 'xml', 'svg', 'mathml', 'ssml', 'atom', 'rss', 'css', 'clike', 'javascript', 'js', 'abap', 'abnf', 'actionscript', 'ada', 'agda', 'al', 'antlr4', 'g4', 'apacheconf', 'apex', 'apl', 'applescript', 'aql', 'arduino', 'ino', 'arff', 'armasm', 'arm-asm', 'arturo', 'art', 'asciidoc', 'adoc', 'aspnet', 'asm6502', 'asmatmel', 'autohotkey', 'autoit', 'avisynth', 'avs', 'avro-idl', 'avdl', 'awk', 'gawk', 'bash', 'sh', 'shell', 'basic', 'batch', 'bbcode', 'shortcode', 'bbj', 'bicep', 'birb', 'bison', 'bnf', 'rbnf', 'bqn', 'brainfuck', 'brightscript', 'bro', 'bsl', 'oscript', 'c', 'csharp', 'cs', 'dotnet', 'cpp', 'cfscript', 'cfc', 'chaiscript', 'cil', 'cilkc', 'cilk-c', 'cilkcpp', 'cilk-cpp', 'cilk', 'clojure', 'cmake', 'cobol', 'coffeescript', 'coffee', 'concurnas', 'conc', 'csp', 'cooklang', 'coq', 'crystal', 'css-extras', 'csv', 'cue', 'cypher', 'd', 'dart', 'dataweave', 'dax', 'dhall', 'diff', 'django', 'jinja2', 'dns-zone-file', 'dns-zone', 'docker', 'dockerfile', 'dot', 'gv', 'ebnf', 'editorconfig', 'eiffel', 'ejs', 'eta', 'elixir', 'elm', 'etlua', 'erb', 'erlang', 'excel-formula', 'xlsx', 'xls', 'fsharp', 'factor', 'false', 'firestore-security-rules', 'flow', 'fortran', 'ftl', 'gml', 'gamemakerlanguage', 'gap', 'gcode', 'gdscript', 'gedcom', 'gettext', 'po', 'gherkin', 'git', 'glsl', 'gn', 'gni', 'linker-script', 'ld', 'go', 'go-module', 'go-mod', 'gradle', 'graphql', 'groovy', 'haml', 'handlebars', 'hbs', 'mustache', 'haskell', 'hs', 'haxe', 'hcl', 'hlsl', 'hoon', 'http', 'hpkp', 'hsts', 'ichigojam', 'icon', 'icu-message-format', 'idris', 'idr', 'ignore', 'gitignore', 'hgignore', 'npmignore', 'inform7', 'ini', 'io', 'j', 'java', 'javadoc', 'javadoclike', 'javastacktrace', 'jexl', 'jolie', 'jq', 'jsdoc', 'js-extras', 'json', 'webmanifest', 'json5', 'jsonp', 'jsstacktrace', 'js-templates', 'julia', 'keepalived', 'keyman', 'kotlin', 'kt', 'kts', 'kumir', 'kum', 'kusto', 'latex', 'tex', 'context', 'latte', 'less', 'lilypond', 'ly', 'liquid', 'lisp', 'emacs', 'elisp', 'emacs-lisp', 'livescript', 'llvm', 'log', 'lolcode', 'lua', 'magma', 'makefile', 'markdown', 'md', 'markup-templating', 'mata', 'matlab', 'maxscript', 'mel', 'mermaid', 'metafont', 'mizar', 'mongodb', 'monkey', 'moonscript', 'moon', 'n1ql', 'n4js', 'n4jsd', 'nand2tetris-hdl', 'naniscript', 'nani', 'nasm', 'neon', 'nevod', 'nginx', 'nim', 'nix', 'nsis', 'objectivec', 'objc', 'ocaml', 'odin', 'opencl', 'openqasm', 'qasm', 'oz', 'parigp', 'parser', 'pascal', 'objectpascal', 'pascaligo', 'psl', 'pcaxis', 'px', 'peoplecode', 'pcode', 'perl', 'php', 'phpdoc', 'php-extras', 'plant-uml', 'plantuml', 'plsql', 'powerquery', 'pq', 'mscript', 'powershell', 'processing', 'prolog', 'promql', 'properties', 'protobuf', 'pug', 'puppet', 'pure', 'purebasic', 'pbfasm', 'purescript', 'purs', 'python', 'py', 'qsharp', 'qs', 'q', 'qml', 'qore', 'r', 'racket', 'rkt', 'cshtml', 'razor', 'jsx', 'tsx', 'reason', 'regex', 'rego', 'renpy', 'rpy', 'rescript', 'res', 'rest', 'rip', 'roboconf', 'robotframework', 'robot', 'ruby', 'rb', 'rust', 'sas', 'sass', 'scss', 'scala', 'scheme', 'shell-session', 'sh-session', 'shellsession', 'smali', 'smalltalk', 'smarty', 'sml', 'smlnj', 'solidity', 'sol', 'solution-file', 'sln', 'soy', 'sparql', 'rq', 'splunk-spl', 'sqf', 'sql', 'squirrel', 'stan', 'stata', 'iecst', 'stylus', 'supercollider', 'sclang', 'swift', 'systemd', 't4-templating', 't4-cs', 't4', 't4-vb', 'tap', 'tcl', 'tt2', 'textile', 'toml', 'tremor', 'trickle', 'troy', 'turtle', 'trig', 'twig', 'typescript', 'ts', 'typoscript', 'tsconfig', 'unrealscript', 'uscript', 'uc', 'uorazor', 'uri', 'url', 'v', 'vala', 'vbnet', 'velocity', 'verilog', 'vhdl', 'vim', 'visual-basic', 'vb', 'vba', 'warpscript', 'wasm', 'web-idl', 'webidl', 'wgsl', 'wiki', 'wolfram', 'mathematica', 'nb', 'wl', 'wren', 'xeora', 'xeoracube', 'xml-doc', 'xojo', 'xquery', 'yaml', 'yml', 'yang', 'zig'];
  if (!languages.includes(language) && isInEditor()) {
    const wrongLanguageValueErrorHTML = `
            <div class="oaerror warning">
                <strong>Atenção</strong> - O campo "Linguagem" possui um valor inválido.
            </div>
        `;

    const msgElement = document.createElement('div');
    msgElement.classList.add('error-notice');
    msgElement.innerHTML += wrongLanguageValueErrorHTML;

    block.insertBefore(msgElement, block.firstChild);
  }

  if (isInEditor()) {
    const intervalId = setInterval(() => {
      if (window.Prism) {
        window.Prism.highlightAll();
        clearInterval(intervalId);
      }
    }, 1500);
  }

  // highlightCodeBlock();
}
