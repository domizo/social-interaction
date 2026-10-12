import {useLayoutEffect, useState} from 'react';
import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {ConfigPanel} from '../src/app/studio/ConfigPanel.js';
import {defaultStudioConfig, parseStudioConfig, PRESET_STORAGE_KEY, type StudioConfig} from '../src/app/studio/config.js';

const fresh = () => parseStudioConfig(defaultStudioConfig);
function harness(onApply = vi.fn(), locale: 'en' | 'ja' = 'en', initialConfig = fresh()) {
  function Harness() {
    const [config, setConfig] = useState<StudioConfig>(initialConfig);
    return <><ConfigPanel config={config} locale={locale} onApply={next => { onApply(next); setConfig(next); }} /><span data-testid="gap">{config.tokens.gap}</span><span data-testid="presentation">{config.presentation}</span><button onClick={() => setConfig({...config, tokens: {...config.tokens, gap: 27}})}>Change test gap</button><button onClick={() => setConfig({...config, presentation: 'labelled'})}>Use test labelled presentation</button></>;
  }
  return {view: render(<Harness />), onApply};
}
function save(name: string) {
  fireEvent.change(screen.getByLabelText('Preset name'), {target: {value: name}});
  fireEvent.click(screen.getByRole('button', {name: 'Save preset'}));
}
function importFile(content: string, name = 'config.json') {
  fireEvent.change(screen.getByLabelText('Import JSON'), {target: {files: [new File([content], name, {type: 'application/json'})]}});
}
beforeEach(() => { window.localStorage.clear(); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('preset and configuration UI', () => {
  it('saves, loads, and deletes a named preset without losing its config', () => {
    harness(vi.fn(), 'en', {...fresh(), presentation: 'icon-only'}); save('Editorial');
    expect(screen.getByRole('status').textContent).toContain('Preset saved');
    const stored = JSON.parse(localStorage.getItem(PRESET_STORAGE_KEY)!);
    expect(stored.schemaVersion).toBe(1); expect(stored.presets[0].config.tokens.gap).toBe(16);
    expect(stored.presets[0].config.presentation).toBe('icon-only');
    fireEvent.click(screen.getByRole('button', {name: 'Change test gap'})); expect(screen.getByTestId('gap').textContent).toBe('27');
    fireEvent.click(screen.getByRole('button', {name: 'Use test labelled presentation'})); expect(screen.getByTestId('presentation').textContent).toBe('labelled');
    fireEvent.click(screen.getByRole('button', {name: 'Load'})); expect(screen.getByTestId('gap').textContent).toBe('16');
    expect(screen.getByTestId('presentation').textContent).toBe('icon-only');
    fireEvent.click(screen.getByRole('button', {name: 'Delete'})); expect(JSON.parse(localStorage.getItem(PRESET_STORAGE_KEY)!).presets).toEqual([]);
  });
  it('loads a legacy stored preset with labelled presentation', () => {
    const {presentation: _presentation, ...legacy} = fresh();
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify({schemaVersion: 1, presets: [{name: 'Legacy', config: legacy}]}));
    const {onApply} = harness(vi.fn(), 'en', {...fresh(), presentation: 'icon-only'});
    fireEvent.change(screen.getByLabelText('Choose a preset'), {target: {value: 'Legacy'}});
    fireEvent.click(screen.getByRole('button', {name: 'Load'}));
    expect(screen.getByTestId('presentation').textContent).toBe('labelled');
    expect(onApply).toHaveBeenCalledWith({...fresh(), presentation: 'labelled'});
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('rejects duplicate names without overwriting, and renders names as text', () => {
    harness(); save('<img src=x onerror=alert(1)>');
    expect(document.querySelector('img')).toBeNull();
    save('<IMG SRC=X ONERROR=ALERT(1)>');
    expect(screen.getByRole('alert').textContent).toContain('already exists');
    expect(JSON.parse(localStorage.getItem(PRESET_STORAGE_KEY)!).presets).toHaveLength(1);
  });
  it('surfaces inaccessible storage without preventing JSON or React export', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Denied', 'SecurityError'); });
    harness();
    expect(screen.getByRole('alert').textContent).toContain('could not be read');
    expect((screen.getByRole('button', {name: 'Copy React'}) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole('button', {name: 'Download JSON'}) as HTMLButtonElement).disabled).toBe(false);
  });
  it('leaves corrupt storage untouched until explicitly cleared', () => {
    localStorage.setItem(PRESET_STORAGE_KEY, '{broken'); harness();
    expect(screen.getByRole('alert').textContent).toContain('invalid');
    expect(localStorage.getItem(PRESET_STORAGE_KEY)).toBe('{broken');
    fireEvent.click(screen.getByRole('button', {name: 'Clear invalid saved data'}));
    expect(localStorage.getItem(PRESET_STORAGE_KEY)).toBeNull(); save('Recovered');
    expect(screen.getByRole('status').textContent).toContain('Preset saved');
  });
  it('retries unavailable storage without deleting existing data', () => {
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify({schemaVersion: 1, presets: [{name: 'Retained', config: fresh()}]}));
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => { throw new Error('Temporarily unavailable'); });
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem');
    harness(); fireEvent.click(screen.getByRole('button', {name: 'Retry browser storage'}));
    expect(getItem).toHaveBeenCalledTimes(2); expect(removeItem).not.toHaveBeenCalled();
    expect(screen.getByRole('option', {name: 'Retained'})).toBeTruthy();
  });
  it('enforces the 20-preset limit without dropping a saved preset', () => {
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify({schemaVersion: 1, presets: Array.from({length: 20}, (_, i) => ({name: `Preset ${i}`, config: fresh()}))}));
    harness(); save('One too many');
    expect(screen.getByRole('alert').textContent).toContain('20 presets');
    expect(JSON.parse(localStorage.getItem(PRESET_STORAGE_KEY)!).presets).toHaveLength(20);
  });
  it('does not claim a preset was saved when localStorage quota fails', () => {
    harness(); vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Full', 'QuotaExceededError'); });
    save('Unsaved'); expect(screen.getByRole('alert').textContent).toContain('not saved');
    expect(screen.queryByRole('option', {name: 'Unsaved'})).toBeNull();
    expect((screen.getByLabelText('Preset name') as HTMLInputElement).value).toBe('Unsaved');
  });
  it('does not remove the saved entry from the UI if deletion cannot persist', () => {
    harness(); save('Keep me');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('No storage'); });
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    expect(screen.getByRole('alert').textContent).toContain('not deleted');
    expect(screen.getByRole('option', {name: 'Keep me'})).toBeTruthy();
  });
  it('applies valid imports and leaves current state unchanged after invalid imports', async () => {
    const {onApply} = harness();
    const valid = fresh(); valid.tokens.gap = 22; valid.presentation = 'icon-only'; valid.actions[0].label.en = 'Applaud';
    importFile(JSON.stringify(valid));
    await waitFor(() => expect(screen.getByTestId('gap').textContent).toBe('22'));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('presentation').textContent).toBe('icon-only');
    importFile(JSON.stringify({...valid, tokens: {...valid.tokens, gap: 999}}));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Could not import'));
    expect(screen.getByTestId('gap').textContent).toBe('22'); expect(onApply).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('presentation').textContent).toBe('icon-only');
  });
  it('keeps a new import started against a just-committed configuration current', async () => {
    const readers: FileReader[] = [];
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function(this: FileReader) { readers.push(this); });
    const valid = {...fresh(), tokens: {...fresh().tokens, gap: 22}};
    const invalid = {...valid, tokens: {...valid.tokens, gap: 999}};
    function ImmediateNextImport() {
      const [config, setConfig] = useState(fresh());
      useLayoutEffect(() => { if (config.tokens.gap === 22) importFile(JSON.stringify(invalid)); }, [config]);
      return <ConfigPanel config={config} locale="en" onApply={setConfig} />;
    }
    render(<ImmediateNextImport />); importFile(JSON.stringify(valid));
    Object.defineProperty(readers[0], 'result', {value: JSON.stringify(valid)});
    await act(async () => { readers[0].dispatchEvent(new ProgressEvent('load')); });
    expect(readers).toHaveLength(2);
    Object.defineProperty(readers[1], 'result', {value: JSON.stringify(invalid)});
    await act(async () => { readers[1].dispatchEvent(new ProgressEvent('load')); });
    expect(screen.getByRole('alert').textContent).toContain('Could not import');
    expect((screen.getByLabelText('Import JSON') as HTMLInputElement).disabled).toBe(false);
  });
  it('imports legacy JSON as labelled and rejects unsupported presentation transactionally', async () => {
    const {onApply} = harness(vi.fn(), 'en', {...fresh(), presentation: 'icon-only'});
    importFile(JSON.stringify({...fresh(), presentation: null}));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('presentation'));
    expect(screen.getByTestId('presentation').textContent).toBe('icon-only'); expect(onApply).not.toHaveBeenCalled();
    const {presentation: _presentation, ...legacy} = fresh();
    importFile(JSON.stringify(legacy));
    await waitFor(() => expect(screen.getByTestId('presentation').textContent).toBe('labelled'));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith(defaultStudioConfig);
  });
  it('ignores a slow import after a newer configuration choice', async () => {
    let reader: FileReader | undefined;
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function(this: FileReader) { reader = this; });
    const {onApply} = harness(); const imported = fresh(); imported.tokens.gap = 4;
    importFile(JSON.stringify(imported));
    expect((screen.getByLabelText('Import JSON') as HTMLInputElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', {name: 'Change test gap'}));
    Object.defineProperty(reader!, 'result', {value: JSON.stringify(imported)});
    await act(async () => { reader!.dispatchEvent(new ProgressEvent('load')); });
    expect(screen.getByTestId('gap').textContent).toBe('27'); expect(onApply).not.toHaveBeenCalled();
    expect((screen.getByLabelText('Import JSON') as HTMLInputElement).disabled).toBe(false);
  });
  it('rejects oversized files before applying anything', async () => {
    const {onApply} = harness(); importFile(' '.repeat(65537));
    expect(screen.getByRole('alert').textContent).toContain('64 KB'); expect(onApply).not.toHaveBeenCalled();
  });
  it('shows selectable complete code when clipboard access fails', async () => {
    Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: vi.fn().mockRejectedValue(new Error('Denied'))}});
    harness(); fireEvent.click(screen.getByRole('button', {name: 'Copy React'}));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Clipboard unavailable'));
    const code = screen.getByLabelText('Generated React code') as HTMLTextAreaElement;
    expect(code.readOnly).toBe(true); expect(code.value).toContain('export default function SocialActions');
    await waitFor(() => expect(code.selectionEnd).toBe(code.value.length));
  });
  it('provides an accurate selectable-code fallback when downloading fails', () => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => { throw new Error('Download unavailable'); });
    harness(); fireEvent.click(screen.getByRole('button', {name: 'Download TSX'}));
    expect(screen.getByRole('alert').textContent).toContain('download could not start');
    expect((screen.getByLabelText('Generated React code') as HTMLTextAreaElement).readOnly).toBe(true);
  });
  it('retains icon-only presentation in the JSON download fallback', () => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => { throw new Error('Download unavailable'); });
    harness(vi.fn(), 'en', {...fresh(), presentation: 'icon-only'});
    fireEvent.click(screen.getByRole('button', {name: 'Download JSON'}));
    const json = screen.getByLabelText('Configuration JSON') as HTMLTextAreaElement;
    expect(JSON.parse(json.value).presentation).toBe('icon-only');
    expect(JSON.parse(json.value).schemaVersion).toBe(1);
  });
  it.each(['en', 'ja'] as const)('retains icon-only presentation and labels in %s React exports', locale => {
    harness(vi.fn(), locale, {...fresh(), presentation: 'icon-only'});
    fireEvent.click(screen.getByRole('button', {name: locale === 'en' ? 'Show code' : 'コードを表示'}));
    const code = screen.getByLabelText(locale === 'en' ? 'Generated React code' : '生成した React コード') as HTMLTextAreaElement;
    expect(code.value).toContain('"presentation": "icon-only"');
    expect(code.value).toContain('presentation={studioConfig.presentation}');
    expect(code.value).toContain('label={item.label[locale]}');
    expect(code.value).toContain(`const locale = "${locale}"`);
    expect(screen.getByText(locale === 'en' ? /Icon-only buttons retain their accessible labels/ : /アイコンのみでも読み上げ用のラベルを保持/)).toBeTruthy();
  });
  it('validates both editable labels for the currently selected actions transactionally', () => {
    const config=fresh();config.actions.push({action:'bookmark',label:{en:'Save',ja:'保存'}});
    const {onApply} = harness(vi.fn(),'en',config);
    fireEvent.click(screen.getByText('Actions & labels', {selector: 'summary'}));
    fireEvent.change(screen.getByLabelText('bookmark English'), {target: {value: 'Keep this'}});
    fireEvent.change(screen.getByLabelText('bookmark Japanese'), {target: {value: '残す'}});
    fireEvent.click(screen.getByRole('button', {name: 'Apply labels'}));
    expect(onApply.mock.calls.at(-1)![0].actions.at(-1).label).toEqual({en: 'Keep this', ja: '残す'});
    const calls = onApply.mock.calls.length;
    fireEvent.change(screen.getByLabelText('bookmark English'), {target: {value: ''}});
    fireEvent.click(screen.getByRole('button', {name: 'Apply labels'}));
    expect(screen.getByRole('alert').textContent).toContain('not applied'); expect(onApply).toHaveBeenCalledTimes(calls);
  });
  it('provides Japanese labels and Japanese generated code', () => {
    harness(vi.fn(), 'ja'); fireEvent.click(screen.getByRole('button', {name: 'コードを表示'}));
    expect((screen.getByLabelText('生成した React コード') as HTMLTextAreaElement).value).toContain('const locale = "ja"');
    expect(screen.getByRole('button', {name: 'プリセットを保存'})).toBeTruthy();
  });
});


describe('label drafts and the single shared selection source',()=>{
 it('preserves dirty retained labels through reorder and applies them in current order only',()=>{
  const config=fresh(),onApply=vi.fn(),r=render(<ConfigPanel config={config} locale="en" onApply={onApply}/>);
  fireEvent.click(screen.getByText('Actions & labels',{selector:'summary'}));fireEvent.change(screen.getByLabelText('like English'),{target:{value:'Appreciate'}});
  const changed={...config,actions:[config.actions[3],config.actions[0]]};r.rerender(<ConfigPanel config={changed} locale="en" onApply={onApply}/>);
  expect((screen.getByLabelText('like English') as HTMLInputElement).value).toBe('Appreciate');expect(screen.queryByLabelText('comment English')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Apply labels'}));expect(onApply.mock.lastCall?.[0].actions.map((item:{action:string})=>item.action)).toEqual(['quote','like']);expect(onApply.mock.lastCall?.[0].actions[1].label.en).toBe('Appreciate');expect(screen.queryByRole('checkbox')).toBeNull();
 });
 it('does not resurrect a removed dirty action or overwrite externally changed labels',()=>{
  const config=fresh(),onApply=vi.fn(),r=render(<ConfigPanel config={config} locale="en" onApply={onApply}/>);fireEvent.click(screen.getByText('Actions & labels',{selector:'summary'}));fireEvent.change(screen.getByLabelText('like English'),{target:{value:'Old draft'}});fireEvent.change(screen.getByLabelText('comment English'),{target:{value:'Other draft'}});
  const changed={...config,actions:[{...config.actions[1],label:{en:'Imported discussion',ja:'話す'}}]};r.rerender(<ConfigPanel config={changed} locale="en" onApply={onApply}/>);expect(screen.queryByLabelText('like English')).toBeNull();expect((screen.getByLabelText('comment English') as HTMLInputElement).value).toBe('Imported discussion');fireEvent.click(screen.getByRole('button',{name:'Apply labels'}));expect(onApply.mock.lastCall?.[0].actions).toEqual(changed.actions);
 });
 it('treats explicit preset load as a draft reset even if the saved applied labels are unchanged',()=>{
  harness();save('Base');fireEvent.click(screen.getByText('Actions & labels',{selector:'summary'}));fireEvent.change(screen.getByLabelText('like English'),{target:{value:'Unsaved'}});fireEvent.click(screen.getByRole('button',{name:'Load'}));expect((screen.getByLabelText('like English') as HTMLInputElement).value).toBe('Like');
 });
});
