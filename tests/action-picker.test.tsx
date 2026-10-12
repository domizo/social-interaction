import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ActionPicker} from '../src/app/studio/ActionPicker.js';
import {defaultStudioConfig, parseStudioConfig, type StudioConfig} from '../src/app/studio/config.js';
import {actionLabels, socialActions} from '../src/lib/index.js';

const fresh = () => parseStudioConfig(defaultStudioConfig);
function harness(initial = fresh(), locale: 'en' | 'ja' = 'en') {
  const onChange = vi.fn();
  function Harness() {
    const [config, setConfig] = useState(initial);
    return <ActionPicker config={config} locale={locale} onChange={next => {onChange(next); setConfig(next);}}/>;
  }
  return {...render(<Harness/>), onChange};
}
const checked = () => screen.getAllByRole('checkbox').filter(input => (input as HTMLInputElement).checked);
const ordered = () => within(screen.getByRole('list')).getAllByRole('listitem').map(item => item.getAttribute('data-action'));

describe('visible Studio action picker', () => {
  it('shows all 12 canonical decorative glyphs and keeps the default four', () => {
    const {container, onChange} = harness();
    const options = screen.getByRole('group', {name: 'Included icons'});
    expect(within(options).getAllByRole('checkbox')).toHaveLength(12);
    expect(options.querySelectorAll('svg.sil-icon[aria-hidden="true"][focusable="false"]')).toHaveLength(12);
    for (const action of socialActions) expect(screen.getByRole('checkbox', {name: actionLabels[action].en})).toBeTruthy();
    expect(checked().map(input => (input.closest('label')?.textContent))).toEqual(['Like', 'Comment', 'Share', 'Quote']);
    expect(ordered()).toEqual(['like', 'comment', 'share', 'quote']);
    expect(screen.getByText('4 / 12 selected')).toBeTruthy();
    expect(container.querySelector('details')?.open).toBe(false);
    expect(screen.getAllByRole('button', {name: /^Reorder /})).toHaveLength(4);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes a subset and appends additions while retaining order, labels, and other settings', async () => {
    const user = userEvent.setup();
    const initial = fresh();
    initial.actions = [initial.actions[3], initial.actions[0], initial.actions[1]];
    initial.actions[1].label = {en: 'Applaud', ja: '拍手'};
    initial.presentation = 'icon-only';
    initial.tokens.gap = 23;
    const {onChange} = harness(initial);
    const comment = screen.getByRole('checkbox', {name: 'Comment'});
    await user.click(comment);
    expect(document.activeElement).toBe(comment);
    const save = screen.getByRole('checkbox', {name: 'Save'});
    await user.click(save);
    expect(document.activeElement).toBe(save);
    const result = onChange.mock.lastCall![0] as StudioConfig;
    expect(result).toEqual({...initial, actions: [initial.actions[0], initial.actions[1], {action: 'bookmark', label: actionLabels.bookmark}]});
    expect(result.actions[1]).toBe(initial.actions[1]);
    expect(result.actions[2].label).not.toBe(actionLabels.bookmark);
    expect(ordered()).toEqual(['quote', 'like', 'bookmark']);
    expect(screen.getByText('Applaud')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Save added. 3 of 12');
    expect(initial.actions.map(item => item.action)).toEqual(['quote', 'like', 'comment']);
  });

  it.each(['en', 'ja'] as const)('keeps at least one selected and announces the limit in %s', async locale => {
    const user = userEvent.setup();
    const initial = fresh();
    initial.actions = [initial.actions[0]];
    const {onChange} = harness(initial, locale);
    const checkbox = screen.getByRole('checkbox', {name: actionLabels.like[locale]});
    await user.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
    expect(document.activeElement).toBe(checkbox);
    expect(checkbox.getAttribute('aria-disabled')).toBe('true');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('status').textContent).toBe(locale === 'en' ? 'Keep at least one icon selected.' : 'アイコンを1つ以上選んでください。');
    await user.keyboard(' ');
    expect(checked()).toHaveLength(1);
    expect(document.activeElement).toBe(checkbox);
  });

  it.each(['en', 'ja'] as const)('selects exactly 12 icons and announces the maximum in %s', locale => {
    const {onChange} = harness(fresh(), locale);
    for (const action of socialActions.slice(4)) fireEvent.click(screen.getByRole('checkbox', {name: actionLabels[action][locale]}));
    expect(checked()).toHaveLength(12);
    expect(ordered()).toEqual(socialActions);
    expect(onChange.mock.lastCall![0].actions).toHaveLength(12);
    expect(screen.getByRole('status').textContent).toBe(locale === 'en' ? 'All 12 icons selected. Maximum 12.' : '12個すべてを選択しました。最大12個です。');
  });

  it('uses incoming config as the source of truth after an import or preset switch', () => {
    const onChange = vi.fn();
    const {rerender} = render(<ActionPicker config={fresh()} onChange={onChange} locale="en"/>);
    const imported = fresh();
    imported.actions = [{action: 'bell', label: {en: 'Updates', ja: '更新'}}, {action: 'star', label: {...actionLabels.star}}];
    rerender(<ActionPicker config={imported} onChange={onChange} locale="ja"/>);
    expect(checked()).toHaveLength(2);
    expect((screen.getByRole('checkbox', {name: 'いいね'}) as HTMLInputElement).checked).toBe(false);
    expect((screen.getByRole('checkbox', {name: '通知'}) as HTMLInputElement).checked).toBe(true);
    expect(ordered()).toEqual(['bell', 'star']);
    expect(screen.getByText('更新')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each(['en', 'ja'] as const)('reorders with keyboard controls, preserving labels and focus at both boundaries in %s', async locale => {
    const user = userEvent.setup();
    const initial = fresh();
    initial.actions[1].label = {en: 'Discuss', ja: '話し合う'};
    const {onChange} = harness(initial, locale);
    await user.click(screen.getByText(locale === 'en' ? 'Reorder without dragging' : 'ドラッグせずに並べ替える'));
    const earlier = screen.getByRole('button', {name: locale === 'en' ? 'Move Comment earlier' : 'コメントを前へ'});
    earlier.focus();
    await user.keyboard('{Enter}');
    expect(ordered()).toEqual(['comment', 'like', 'share', 'quote']);
    expect(document.activeElement).toBe(earlier);
    expect(earlier.getAttribute('aria-disabled')).toBe('true');
    expect(onChange.mock.lastCall![0].actions[0]).toBe(initial.actions[1]);
    expect(screen.getByRole('status').textContent).toBe(locale === 'en' ? 'Comment moved to position 1 of 4.' : 'コメントを4個中1番目に移動しました。');
    const calls = onChange.mock.calls.length;
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(calls);
    expect(document.activeElement).toBe(earlier);
    const later = screen.getByRole('button', {name: locale === 'en' ? 'Move Comment later' : 'コメントを後ろへ'});
    later.focus();
    await user.keyboard('{Enter}{Enter}{Enter}');
    expect(ordered()).toEqual(['like', 'share', 'quote', 'comment']);
    expect(document.activeElement).toBe(later);
    expect(later.getAttribute('aria-disabled')).toBe('true');
    expect(onChange.mock.lastCall![0].actions[3].label).toEqual({en: 'Discuss', ja: '話し合う'});
    expect(screen.getByRole('status').textContent).toBe(locale === 'en' ? 'Comment moved to position 4 of 4.' : 'コメントを4個中4番目に移動しました。');
    await user.keyboard('{Enter}');
    expect(ordered()).toEqual(['like', 'share', 'quote', 'comment']);
    expect(document.activeElement).toBe(later);
  });
});
