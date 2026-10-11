import {useState} from 'react';
import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {ConfigPanel} from '../src/app/studio/ConfigPanel.js';
import {defaultStudioConfig, parseStudioConfig, PRESET_STORAGE_KEY, type StudioConfig} from '../src/app/studio/config.js';

const fresh = () => parseStudioConfig(defaultStudioConfig);
function harness(onApply = vi.fn(), locale: 'en' | 'ja' = 'en') {
  function Harness() {
    const [config, setConfig] = useState<StudioConfig>(fresh());
    return <><ConfigPanel config={config} locale={locale} onApply={next => { onApply(next); setConfig(next); }} /><span data-testid="gap">{config.tokens.gap}</span><button onClick={() => setConfig({...config, tokens: {...config.tokens, gap: 27}})}>Change test gap</button></>;
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
    harness(); save('Editorial');
    expect(screen.getByRole('status').textContent).toContain('Preset saved');
    const stored = JSON.parse(localStorage.getItem(PRESET_STORAGE_KEY)!);
    expect(stored.schemaVersion).toBe(1); expect(stored.presets[0].config.tokens.gap).toBe(16);
    fireEvent.click(screen.getByRole('button', {name: 'Change test gap'})); expect(screen.getByTestId('gap').textContent).toBe('27');
    fireEvent.click(screen.getByRole('button', {name: 'Load'})); expect(screen.getByTestId('gap').textContent).toBe('16');
    fireEvent.click(screen.getByRole('button', {name: 'Delete'})); expect(JSON.parse(localStorage.getItem(PRESET_STORAGE_KEY)!).presets).toEqual([]);
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
    const valid = fresh(); valid.tokens.gap = 22; valid.actions[0].label.en = 'Applaud';
    importFile(JSON.stringify(valid));
    await waitFor(() => expect(screen.getByTestId('gap').textContent).toBe('22'));
    expect(onApply).toHaveBeenCalledTimes(1);
    importFile(JSON.stringify({...valid, tokens: {...valid.tokens, gap: 999}}));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Could not import'));
    expect(screen.getByTestId('gap').textContent).toBe('22'); expect(onApply).toHaveBeenCalledTimes(1);
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
  it('changes included actions and validates both editable labels transactionally', () => {
    const {onApply} = harness();
    fireEvent.click(screen.getByText('Actions & labels', {selector: 'summary'}));
    fireEvent.click(screen.getByLabelText('Save'));
    expect(onApply.mock.calls.at(-1)![0].actions.some((row: {action: string}) => row.action === 'bookmark')).toBe(true);
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
