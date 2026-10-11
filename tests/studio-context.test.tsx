import {useState} from 'react';
import {readFileSync} from 'node:fs';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {actionLabels, socialActions, isToggleAction} from '../src/lib/index.js';
import {defaultStudioConfig, type StudioConfig} from '../src/app/studio/config.js';
import {ConfiguredActions} from '../src/app/studio/ConfiguredActions.js';
import {ContextPreview} from '../src/app/studio/ContextPreview.js';
import {DesignLens} from '../src/app/studio/DesignLens.js';
import {contrastRatio} from '../src/app/Inspector.js';

const config = (): StudioConfig => structuredClone(defaultStudioConfig);
afterEach(() => vi.restoreAllMocks());

describe('configured context previews', () => {
  it('changes only context and uses the same configured actions and tokens in all three fixtures', () => {
    const original = config();
    original.actions[0].label.en = 'Appreciate';
    original.tokens.iconSize = 24;
    original.motionTokens.duration = 780;
    const changed = vi.fn();
    function Harness() {
      const [current, setCurrent] = useState(original);
      return <ContextPreview config={current} onContext={context => {const next = {...current, context}; changed(next); setCurrent(next);}} locale="en" reducedMotion/>;
    }
    render(<Harness/>);
    const like = screen.getByRole('button', {name: 'Appreciate'});
    fireEvent.click(like);
    for (const [name, context] of [['Article footer', 'article'], ['AI chat', 'chat'], ['Social feed', 'feed']] as const) {
      fireEvent.click(screen.getByRole('button', {name}));
      expect(changed.mock.lastCall?.[0]).toEqual({...original, context});
      const action = screen.getByRole('button', {name: 'Appreciate'});
      expect(action.getAttribute('aria-pressed')).toBe('true');
      expect(action.style.getPropertyValue('--sil-icon')).toBe('24px');
      expect(action.getAttribute('data-icon-motion')).toBe(original.iconMotion);
      expect(action.getAttribute('data-reduced-motion')).toBe('true');
      expect(screen.getByRole('group', {name: 'Context preview actions'}).querySelectorAll('button')).toHaveLength(original.actions.length);
    }
  });

  it('clearly marks AI chat as a fixed, disconnected fixture', () => {
    render(<ContextPreview config={{...config(), context: 'chat'}} onContext={vi.fn()} locale="en" reducedMotion={false}/>);
    expect(screen.getByText('A fixed example response. No AI service is connected.')).toBeTruthy();
    expect(screen.getByText('Assistant · scripted example')).toBeTruthy();
    expect(screen.getByText('Sample content. All interactions stay in this preview.')).toBeTruthy();
  });

  it('localizes fixture text and custom action labels', () => {
    const current = config();
    current.actions[0].label.ja = '共感する';
    render(<ContextPreview config={current} onContext={vi.fn()} locale="ja" reducedMotion={false}/>);
    expect(screen.getByRole('heading', {level: 2, name: '使われる場面で見る'})).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: '共感する'}));
    expect(screen.getByRole('status').textContent).toContain('共感する: このプレビューでオン');
    expect(screen.queryByText('Social feed')).toBeNull();
  });

  it('gives toggles pressed state and commands an explicit local result', () => {
    const current = config();
    current.actions = socialActions.map(action => ({action, label: {...actionLabels[action]}}));
    render(<ConfiguredActions config={current} locale="en" reducedMotion/>);
    for (const action of socialActions) {
      const button = screen.getByRole('button', {name: actionLabels[action].en});
      if (isToggleAction(action)) {
        expect(button.getAttribute('aria-pressed')).toBe('false');
        fireEvent.click(button);
        expect(button.getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByRole('status').textContent).toContain('on in this preview');
        fireEvent.click(button);
        expect(button.getAttribute('aria-pressed')).toBe('false');
      } else {
        expect(button.hasAttribute('aria-pressed')).toBe(false);
        if (!['comment', 'quote', 'share'].includes(action)) {
          fireEvent.click(button);
          expect(screen.getByRole('status').textContent).toContain(`${actionLabels[action].en}: demo completed locally`);
        }
      }
    }
  });

  it('opens an accessible composer, saves only a local draft, and restores focus', async () => {
    const user = userEvent.setup();
    render(<ConfiguredActions config={config()} locale="en" reducedMotion/>);
    const comment = screen.getByRole('button', {name: 'Comment'});
    await user.click(comment);
    const dialog = screen.getByRole('dialog', {name: 'Local comment draft'});
    expect(comment.getAttribute('aria-haspopup')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(within(dialog).getByRole('textbox', {name: 'Your draft'}));
    expect((within(dialog).getByRole('button', {name: 'Save draft locally'}) as HTMLButtonElement).disabled).toBe(true);
    await user.type(within(dialog).getByRole('textbox'), 'A thoughtful local draft');
    await user.click(within(dialog).getByRole('button', {name: 'Save draft locally'}));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('Draft saved in this preview.');
    expect(screen.getByText('A thoughtful local draft')).toBeTruthy();
    expect(document.activeElement).toBe(comment);
  });

  it('keeps an open draft when locale changes and supports Escape and focus trapping', async () => {
    const user = userEvent.setup(), current = config();
    const view = render(<ConfiguredActions config={current} locale="en" reducedMotion/>);
    await user.click(screen.getByRole('button', {name: 'Quote'}));
    await user.type(screen.getByRole('textbox'), 'Keep this draft');
    view.rerender(<ConfiguredActions config={current} locale="ja" reducedMotion/>);
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Keep this draft');
    const save = screen.getByRole('button', {name: '下書きをローカル保存'});
    save.focus(); await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', {name: '下書きを閉じる'}));
    await user.tab({shift: true}); expect(document.activeElement).toBe(save);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', {name: '引用'}));
    expect(screen.queryByText('Keep this draft')).toBeNull();
  });

  it('implements Share menu keyboard navigation and returns focus on dismissal', async () => {
    const user = userEvent.setup();
    render(<ConfiguredActions config={config()} locale="en" reducedMotion/>);
    const share = screen.getByRole('button', {name: 'Share'});
    share.focus(); await user.keyboard('{ArrowUp}');
    expect(share.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', {name: 'Prepare local share'}));
    await user.keyboard('{Home}'); expect(document.activeElement).toBe(screen.getByRole('menuitem', {name: 'Show example link'}));
    await user.keyboard('{ArrowUp}'); expect(document.activeElement).toBe(screen.getByRole('menuitem', {name: 'Prepare local share'}));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull(); expect(document.activeElement).toBe(share);
    await user.keyboard('{ArrowDown}'); await user.keyboard('{End}{Enter}');
    expect(screen.getByRole('status').textContent).toContain('Nothing was sent');
    expect(document.activeElement).toBe(share);
  });

  it('moves Tab past hidden, inert, and closed-details controls after dismissing Share', async () => {
    const user = userEvent.setup(), current = config();
    current.actions = current.actions.filter(item => item.action === 'share');
    render(<><ConfiguredActions config={current} locale="en" reducedMotion/><button hidden>Hidden</button><div style={{display: 'none'}}><button>Display none</button></div><div style={{visibility: 'hidden'}}><button>Invisible</button></div><div inert><button>Inert</button></div><details><summary tabIndex={-1}>Closed details</summary><button>Concealed</button></details><button>Next visible</button></>);
    const share = screen.getByRole('button', {name: 'Share'});
    await user.click(share); await user.tab();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', {name: 'Next visible'}));
  });

  it('shows a fixture link locally without creating an external navigation', () => {
    render(<ConfiguredActions config={config()} locale="en" reducedMotion/>);
    fireEvent.click(screen.getByRole('button', {name: 'Share'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Show example link'}));
    expect((screen.getByRole('textbox', {name: 'Example link'}) as HTMLInputElement).value).toBe('https://example.com/preview/small-details');
    expect(screen.getByRole('status').textContent).toContain('not a published post');
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('design lens', () => {
  it('lets keyboard users cross the baseline in both directions without getting stuck', async () => {
    const user = userEvent.setup(), current = config(); current.tokens.gap = 8;
    render(<DesignLens config={current} locale="en" reducedMotion/>);
    const slider = screen.getByRole('slider') as HTMLInputElement;
    slider.focus();
    expect(slider.value).toBe('12');
    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}'); expect(slider.value).toBe('9');
    await user.keyboard('{ArrowLeft}'); expect(slider.value).toBe('7');
    await user.keyboard('{ArrowRight}'); expect(slider.value).toBe('9');
    await user.keyboard('{Home}'); expect(slider.value).toBe('4');
    await user.keyboard('{End}'); expect(slider.value).toBe('28');
  });
  it('changes exactly the selected token and keeps every other configuration field matched', () => {
    const current = config(), original = structuredClone(current);
    render(<DesignLens config={current} locale="en" reducedMotion/>);
    const baseline = screen.getByRole('article', {name: 'Baseline'}), adjusted = screen.getByRole('article', {name: 'Adjusted'});
    const tokenNames = ['--sil-icon', '--sil-stroke', '--sil-gap', '--sil-duration', '--sil-amplitude', '--sil-accent', '--sil-target'];
    for (const [variable, styleName, value] of [['gap', '--sil-gap', '24'], ['iconSize', '--sil-icon', '26'], ['strokeWidth', '--sil-stroke', '2.4']]) {
      fireEvent.change(screen.getByRole('combobox', {name: 'Compare one variable'}), {target: {value: variable}});
      fireEvent.change(screen.getByRole('slider'), {target: {value}});
      const a = within(baseline).getByRole('button', {name: 'Like'}), b = within(adjusted).getByRole('button', {name: 'Like'});
      expect(tokenNames.filter(name => a.style.getPropertyValue(name) !== b.style.getPropertyValue(name))).toEqual([styleName]);
      expect(a.className).toBe(b.className);
      expect(a.getAttribute('data-icon-motion')).toBe(b.getAttribute('data-icon-motion'));
      expect(a.getAttribute('data-reduced-motion')).toBe('true');
    }
    expect(current).toEqual(original);
  });

  it('keeps baseline and adjusted action states independent', () => {
    render(<DesignLens config={config()} locale="en" reducedMotion/>);
    const baseline = within(screen.getByRole('article', {name: 'Baseline'})), adjusted = within(screen.getByRole('article', {name: 'Adjusted'}));
    fireEvent.click(baseline.getByRole('button', {name: 'Like'}));
    expect(baseline.getByRole('button', {name: 'Like'}).getAttribute('aria-pressed')).toBe('true');
    expect(adjusted.getByRole('button', {name: 'Like'}).getAttribute('aria-pressed')).toBe('false');
  });

  it('exposes keyboard-operated overlays with numeric alternatives and a geometric-center caveat', async () => {
    const user = userEvent.setup();
    const view = render(<DesignLens config={config()} locale="en" reducedMotion/>);
    const centers = screen.getByRole('checkbox', {name: 'Geometric centers'});
    centers.focus(); await user.keyboard(' ');
    expect((centers as HTMLInputElement).checked).toBe(true);
    expect(view.container.querySelectorAll('[data-lens-centers="true"]')).toHaveLength(2);
    expect(screen.getAllByText('from left 10 px · from top 10 px')).toHaveLength(2);
    expect(screen.getByText(/it does not measure an optical center/)).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox', {name: 'Hit areas'}));
    expect(view.container.querySelectorAll('[data-lens-targets="true"]')).toHaveLength(2);
    expect(screen.getAllByText('44 × 44 px')).toHaveLength(2);
    fireEvent.click(screen.getByRole('checkbox', {name: 'Spacing'}));
    for (const layer of view.container.querySelectorAll('.lens-spacing-overlay')) expect(layer.getAttribute('aria-hidden')).toBe('true');
  });

  it('derives bounds and visible spacing from real element rectangles', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const isButton = this.classList.contains('sil-action');
      const index = isButton ? Array.from(this.parentElement!.children).indexOf(this) : 0;
      const left = isButton ? index * 96 : 0, top = isButton ? 20 : 0, width = isButton ? 80 : 500, height = isButton ? 44 : 100;
      return {x: left, y: top, left, top, right: left + width, bottom: top + height, width, height, toJSON: () => ({})};
    });
    const view = render(<DesignLens config={config()} locale="en" reducedMotion/>);
    fireEvent.click(screen.getByRole('checkbox', {name: 'Hit areas'}));
    fireEvent.click(screen.getByRole('checkbox', {name: 'Spacing'}));
    expect(screen.getAllByText('80 × 44 px')).toHaveLength(2);
    expect(view.container.querySelectorAll('.lens-spacing-overlay i')).toHaveLength(6);
    for (const gap of view.container.querySelectorAll<HTMLElement>('.lens-spacing-overlay i')) expect(gap.style.width).toBe('16px');
  });

  it('localizes learning controls and keeps a real difference at token bounds', () => {
    const current = config(); current.tokens.gap = 28;
    render(<DesignLens config={current} locale="ja" reducedMotion/>);
    expect(screen.getByRole('heading', {name: 'デザインレンズ', level: 2})).toBeTruthy();
    const slider = screen.getByRole('slider', {name: '調整後の値: 余白'}) as HTMLInputElement;
    expect(slider.value).toBe('24');
    fireEvent.change(slider, {target: {value: '28'}});
    expect(slider.value).toBe('27');
    expect(screen.getByText(/視覚的な重心を計測したものではありません/)).toBeTruthy();
  });
});

it('keeps small metadata and instructions readable on their actual surfaces', () => {
  const css = readFileSync('src/app/studio/context.css', 'utf8');
  const pairs = [
    ['.context-author p', '#ffffff'], ['.context-article-meta', '#ffffff'],
    ['.context-composer form>p', '#ffffff'], ['.context-draft-count', '#ffffff'],
    ['.lens-specimen-heading p', '#ffffff'], ['.context-editorial-art p', '#f3eee8'],
    ['.context-editorial-art span', '#f3eee8'], ['.context-window-bar', '#fafbfc'],
    ['.lens-rationale p', '#fbfaf7'], ['.lens-rationale p+p', '#fbfaf7'],
  ];
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)];
  for (const [selector, surface] of pairs) {
    const rule = rules.find(match => match[1].split(',').some(part => part.trim().endsWith(selector)));
    const foreground = rule?.[2].match(/(?<![-\w])color:(#[0-9a-f]{6})/)?.[1];
    expect(foreground, selector).toBeTruthy();
    expect(contrastRatio(foreground!, surface), `${selector}: ${foreground} on ${surface}`).toBeGreaterThanOrEqual(4.5);
  }
});
