import {useEffect, useId, useMemo, useRef, useState} from 'react';
import {actionLabels, socialActions, type SocialAction} from '../../lib/index.js';
import {generateReactUsage, MAX_CONFIG_BYTES, MAX_PRESETS, parsePresetCollection, parseStudioConfig, PRESET_STORAGE_KEY, serializePresets, type StudioConfig, type StudioPreset} from './config.js';
import './config.css';

type Props = {config: StudioConfig; onApply: (config: StudioConfig) => void; locale: 'en' | 'ja'};
const copy = {
  en: {
    title: 'Make it yours', intro: 'Choose actions, save a setup, and take the complete React example with you.',
    actions: 'Actions & labels', actionHelp: 'Choose 1–12 actions. Apply label edits before exporting.', english: 'English', japanese: 'Japanese', apply: 'Apply labels', applied: 'Labels applied',
    presets: 'Saved presets', local: 'Stored only in this browser. Up to 20 presets; names must be unique.',
    name: 'Preset name', namePlaceholder: 'e.g. Editorial · soft', save: 'Save preset', select: 'Choose a preset', load: 'Load', remove: 'Delete', saved: 'Preset saved in this browser', loaded: 'Preset loaded', deleted: 'Preset deleted',
    duplicate: 'That name already exists. Choose another name, or delete the saved preset first.', limit: 'You have 20 presets. Delete one before saving another.', invalidName: 'Use a name with 1–60 characters and no control characters.',
    storageRead: 'Saved presets could not be read. Your current setup is still available.', storageWrite: 'Browser storage is unavailable or full. Your preset was not saved.', storageDelete: 'Browser storage is unavailable. The saved preset was not deleted.',
    corrupt: 'Saved preset data is invalid. It has been left untouched. You can clear it to save new presets.', clear: 'Clear invalid saved data', retryStorage: 'Retry browser storage', storageReady: 'Saved presets are available again', cleared: 'Invalid saved data cleared',
    transfer: 'Config JSON', jsonHelp: 'Schema v1 · maximum 64 KB. Imports apply only after the entire file passes validation.', import: 'Import JSON', export: 'Download JSON', imported: 'Configuration imported', invalid: 'Could not import the configuration',
    tooLarge: 'Choose a JSON file no larger than 64 KB.', downloadError: 'The download could not start. Select and copy the configuration below.', codeDownloadError: 'The download could not start. Select and copy the code below.',
    code: 'React example', codeHelp: 'A complete TSX component with controlled toggles, local composers, keyboard-friendly sharing, and an optional onCommand callback. Install the React package, then mount <SocialActions />.',
    codeScope: 'Includes this context, style, action order, both languages, design tokens, and motion. Temporary selections, drafts, and request state start fresh. The manual reduced-motion preview setting is not exported; the component honors the device’s reduced-motion preference.',
    copy: 'Copy React', download: 'Download TSX', copied: 'React example copied', clipboard: 'Clipboard unavailable. Select and copy the code below.', reveal: 'Show code', hide: 'Hide code', codeLabel: 'Generated React code', jsonLabel: 'Configuration JSON',
    last: 'Keep at least one action selected', validation: 'The change was not applied',
  },
  ja: {
    title: '自分の設定をつくる', intro: '操作を選び、設定を保存して、動く React のコードを持ち帰れます。',
    actions: '操作とラベル', actionHelp: '1〜12 個の操作を選べます。ラベルの編集は、書き出す前に適用してください。', english: '英語', japanese: '日本語', apply: 'ラベルを適用', applied: 'ラベルを適用しました',
    presets: '保存したプリセット', local: 'このブラウザーだけに保存します。最大 20 件、名前の重複はできません。',
    name: 'プリセット名', namePlaceholder: '例：記事向け・ソフト', save: 'プリセットを保存', select: 'プリセットを選択', load: '読み込む', remove: '削除', saved: 'このブラウザーに保存しました', loaded: 'プリセットを読み込みました', deleted: 'プリセットを削除しました',
    duplicate: '同じ名前が使われています。別の名前にするか、保存済みのプリセットを削除してください。', limit: '20 件保存されています。先に 1 件削除してください。', invalidName: '名前は制御文字を含まない 1〜60 文字で入力してください。',
    storageRead: '保存済みプリセットを読み込めませんでした。現在の設定はそのまま使えます。', storageWrite: 'ブラウザーの保存領域が使えないか、容量が不足しています。プリセットは保存されませんでした。', storageDelete: 'ブラウザーの保存領域が使えません。プリセットは削除されませんでした。',
    corrupt: '保存済みデータの形式が正しくありません。元のデータは変更していません。消去すると新しく保存できます。', clear: '無効な保存データを消去', retryStorage: '保存領域を再確認', storageReady: '保存済みプリセットを読み込めるようになりました', cleared: '無効な保存データを消去しました',
    transfer: '設定 JSON', jsonHelp: 'スキーマ v1・最大 64 KB。ファイル全体の検証に成功した場合だけ適用します。', import: 'JSON を読み込む', export: 'JSON をダウンロード', imported: '設定を読み込みました', invalid: '設定を読み込めませんでした',
    tooLarge: '64 KB 以下の JSON ファイルを選択してください。', downloadError: 'ダウンロードを開始できませんでした。下の設定を選択してコピーしてください。', codeDownloadError: 'ダウンロードを開始できませんでした。下のコードを選択してコピーしてください。',
    code: 'React のサンプル', codeHelp: '状態を管理するトグル、ローカルの入力フォーム、キーボード対応の共有メニュー、任意の onCommand コールバックを含む TSX です。React パッケージをインストールし、<SocialActions /> を表示してください。',
    codeScope: '表示コンテキスト、スタイル、操作の順序、両言語のラベル、デザイントークン、動きを含みます。一時的な選択、下書き、リクエスト状態は初期化されます。手動の動きの抑制はプレビュー専用です。コードは端末の「視差効果を減らす」設定に従います。',
    copy: 'React をコピー', download: 'TSX をダウンロード', copied: 'React のサンプルをコピーしました', clipboard: 'クリップボードを使えません。下のコードを選択してコピーしてください。', reveal: 'コードを表示', hide: 'コードを隠す', codeLabel: '生成した React コード', jsonLabel: '設定 JSON',
    last: '操作は 1 個以上選択してください', validation: '変更を適用できませんでした',
  },
} as const;

type Notice = {kind: 'status' | 'error'; text: string};
function detail(error: unknown) { return error instanceof Error ? error.message : 'Unknown error'; }
function downloadText(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], {type}));
  try {
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = name;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
  } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File could not be read'));
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Invalid file'));
    reader.readAsText(file);
  });
}

export function ConfigPanel({config, onApply, locale}: Props) {
  const t = copy[locale];
  const id = useId();
  const [presets, setPresets] = useState<StudioPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [storageIssue, setStorageIssue] = useState<'read' | 'corrupt' | null>(null);
  const [labels, setLabels] = useState(config.actions);
  const [showCode, setShowCode] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [importing, setImporting] = useState(false);
  const codeField = useRef<HTMLTextAreaElement>(null);
  const importVersion = useRef(0);
  const latestConfig = useRef(config);
  latestConfig.current = config;
  const generated = useMemo(() => generateReactUsage(config, locale), [config, locale]);
  const json = useMemo(() => JSON.stringify(config, null, 2), [config]);
  useEffect(() => { setLabels(config.actions); }, [config.actions]);
  // A later configuration choice wins over a slow file read.
  useEffect(() => { importVersion.current++; setImporting(false); }, [config]);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PRESET_STORAGE_KEY);
      if (stored !== null) {
        try { setPresets(parsePresetCollection(stored)); }
        catch { setStorageIssue('corrupt'); }
      }
    } catch { setStorageIssue('read'); }
    return () => { importVersion.current++; };
  }, []);

  const error = (text: string) => setNotice({kind: 'error', text});
  const success = (text: string) => setNotice({kind: 'status', text});
  function apply(next: StudioConfig, message?: string) {
    try { const parsed = parseStudioConfig(next); importVersion.current++; setImporting(false); onApply(parsed); if (message) success(message); else setNotice(null); }
    catch (problem) { error(`${t.validation}: ${detail(problem)}`); }
  }
  function toggle(action: SocialAction) {
    const selected = config.actions.some(item => item.action === action);
    if (selected && config.actions.length === 1) { error(t.last); return; }
    const nextActions = selected ? labels.filter(item => item.action !== action) : [...labels, {action, label: {...actionLabels[action]}}];
    apply({...config, actions: nextActions});
  }
  function savePreset() {
    const name = presetName.trim();
    if (!name || presetName.length > 60 || /[\u0000-\u001f\u007f]/.test(presetName)) { error(t.invalidName); return; }
    if (presets.some(item => item.name.toLowerCase() === name.toLowerCase())) { error(t.duplicate); return; }
    if (presets.length >= MAX_PRESETS) { error(t.limit); return; }
    if (storageIssue) { error(storageIssue === 'corrupt' ? t.corrupt : t.storageRead); return; }
    try {
      const next = [...presets, {name, config: parseStudioConfig(config)}];
      window.localStorage.setItem(PRESET_STORAGE_KEY, serializePresets(next));
      setPresets(next); setSelectedPreset(name); setPresetName(''); success(t.saved);
    } catch { error(t.storageWrite); }
  }
  function deletePreset() {
    if (!selectedPreset) return;
    const next = presets.filter(item => item.name !== selectedPreset);
    try {
      window.localStorage.setItem(PRESET_STORAGE_KEY, serializePresets(next));
      setPresets(next); setSelectedPreset(''); success(t.deleted);
    } catch { error(t.storageDelete); }
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    const version = ++importVersion.current;
    const startingConfig = config;
    if (file.size > MAX_CONFIG_BYTES) { error(t.tooLarge); return; }
    setImporting(true);
    try {
      const imported = parseStudioConfig(await readFile(file));
      if (version !== importVersion.current || latestConfig.current !== startingConfig) return;
      onApply(imported); success(t.imported);
    } catch (problem) { if (version === importVersion.current) error(`${t.invalid}: ${detail(problem)}`); }
    finally { if (version === importVersion.current) setImporting(false); }
  }
  async function copyCode() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(generated); success(t.copied);
    } catch {
      setShowCode(true); error(t.clipboard);
      requestAnimationFrame(() => { codeField.current?.focus(); codeField.current?.select(); });
    }
  }
  const chosen = presets.find(item => item.name === selectedPreset);
  return <section className="studio-config" aria-labelledby={id + '-title'}>
    <div className="studio-config-heading"><div><span className="studio-config-eyebrow">CONFIG / EXPORT</span><h2 id={id + '-title'}>{t.title}</h2><p>{t.intro}</p></div><span className="studio-config-version">SCHEMA 01</span></div>
    {storageIssue && <div className="studio-config-notice" role="alert"><p>{storageIssue === 'corrupt' ? t.corrupt : t.storageRead}</p><button type="button" onClick={() => {
      if (storageIssue === 'corrupt') {
        try { window.localStorage.removeItem(PRESET_STORAGE_KEY); setPresets([]); setStorageIssue(null); success(t.cleared); }
        catch { error(t.storageDelete); }
      } else {
        try {
          const stored = window.localStorage.getItem(PRESET_STORAGE_KEY);
          try { setPresets(stored === null ? [] : parsePresetCollection(stored)); setStorageIssue(null); success(t.storageReady); }
          catch { setStorageIssue('corrupt'); setNotice(null); }
        } catch { error(t.storageRead); }
      }
    }}>{storageIssue === 'corrupt' ? t.clear : t.retryStorage}</button></div>}
    <div className="studio-config-grid">
      <details className="studio-config-card studio-config-actions">
        <summary>{t.actions}<span>{config.actions.length} / 12</span></summary>
        <p className="studio-config-hint">{t.actionHelp}</p>
        <fieldset className="studio-config-action-picker"><legend className="studio-config-sr-only">{t.actions}</legend>{socialActions.map(action => <label key={action}>
          <input type="checkbox" checked={config.actions.some(item => item.action === action)} onChange={() => toggle(action)} />{actionLabels[action][locale]}
        </label>)}</fieldset>
        <div className="studio-config-labels">{labels.map((item, index) => <div className="studio-config-label-row" key={item.action}>
          <strong>{item.action}</strong>
          {(['en', 'ja'] as const).map(language => <label key={language}><span>{language === 'en' ? t.english : t.japanese}</span><input lang={language} aria-label={`${item.action} ${language === 'en' ? t.english : t.japanese}`} maxLength={80} value={item.label[language]} onChange={event => setLabels(previous => previous.map((entry, i) => i === index ? {...entry, label: {...entry.label, [language]: event.target.value}} : entry))} /></label>)}
        </div>)}</div>
        <button type="button" onClick={() => apply({...config, actions: labels}, t.applied)}>{t.apply}</button>
      </details>
      <div className="studio-config-card"><h3>{t.presets}</h3><p className="studio-config-hint">{t.local}</p>
        <form className="studio-config-save" onSubmit={event => { event.preventDefault(); savePreset(); }}><label htmlFor={id + '-name'}>{t.name}</label><div className="studio-config-row"><input id={id + '-name'} value={presetName} maxLength={60} placeholder={t.namePlaceholder} onChange={event => setPresetName(event.target.value)} /><button type="submit">{t.save}</button></div></form>
        <div className="studio-config-row studio-config-preset-select"><label className="studio-config-sr-only" htmlFor={id + '-preset'}>{t.select}</label><select id={id + '-preset'} value={selectedPreset} onChange={event => setSelectedPreset(event.target.value)}><option value="">{t.select} ({presets.length}/{MAX_PRESETS})</option>{presets.map(preset => <option value={preset.name} key={preset.name}>{preset.name}</option>)}</select><button type="button" disabled={!chosen} onClick={() => { if (chosen) apply(chosen.config, t.loaded); }}>{t.load}</button><button type="button" disabled={!chosen} onClick={deletePreset}>{t.remove}</button></div>
        <div className="studio-config-transfer"><h3>{t.transfer}</h3><p className="studio-config-hint">{t.jsonHelp}</p><div className="studio-config-row"><label className="studio-config-file-button">{t.import}<input aria-label={t.import} type="file" accept=".json,application/json" disabled={importing} onChange={event => { void importFile(event.currentTarget.files?.[0]); event.currentTarget.value = ''; }} /></label><button type="button" onClick={() => {
          try { downloadText('social-studio-config.json', json, 'application/json'); }
          catch { setShowJson(true); error(t.downloadError); }
        }}>{t.export}</button></div></div>
      </div>
      <div className="studio-config-card studio-config-code"><h3>{t.code}</h3><p className="studio-config-hint">{t.codeHelp}</p><p className="studio-config-hint">{t.codeScope}</p><div className="studio-config-row"><button type="button" className="studio-config-primary" onClick={() => void copyCode()}>{t.copy}</button><button type="button" onClick={() => {
        try { downloadText('SocialActions.tsx', generated, 'text/plain'); }
        catch { setShowCode(true); error(t.codeDownloadError); }
      }}>{t.download}</button><button type="button" aria-expanded={showCode} aria-controls={id + '-code'} onClick={() => setShowCode(value => !value)}>{showCode ? t.hide : t.reveal}</button></div>
      {showCode && <textarea ref={codeField} id={id + '-code'} className="studio-config-source" aria-label={t.codeLabel} value={generated} readOnly spellCheck={false} onFocus={event => event.currentTarget.select()} />}
      </div>
    </div>
    {showJson && <textarea className="studio-config-source" aria-label={t.jsonLabel} value={json} readOnly spellCheck={false} onFocus={event => event.currentTarget.select()} />}
    {notice && <p className={`studio-config-notice studio-config-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.text}</p>}
  </section>;
}
