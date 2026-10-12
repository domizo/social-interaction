import {useId} from 'react';
import type {StudioConfig} from './config.js';
import {ConfiguredActions} from './ConfiguredActions.js';
import './context.css';

type Locale = 'en' | 'ja';
const copy = {
  en: {eyebrow: 'THE SAME SYSTEM, DIFFERENT STORIES', title: 'See it in context', intro: 'One configuration, three places to try it. Your actions, labels, and motion travel together.', context: 'Preview context', feed: 'Social feed', article: 'Article footer', chat: 'AI chat', fixture: 'INTERACTIVE LOCAL FIXTURE', local: 'Sample content. All interactions stay in this preview.', author: 'Mika Tanaka', authorNote: 'Design notes · sample post', feedText: 'Small details make room for better conversations.', artKicker: 'A NOTE ON INTERACTION', artTitle: 'Less friction.\nMore feeling.', artFoot: 'Good things happen in the small moments.', articleKicker: 'FIELD NOTES / 004', articleTitle: 'The space between an intention and an action', articleText: 'A familiar symbol, a little room to breathe, a response that arrives at the right moment. These quiet choices shape how an interface feels.', articleEnd: 'Thanks for reading. Keep the conversation going.', read: '4 min read · sample article', prompt: 'How can a small interaction feel more considered?', assistant: 'Assistant · scripted example', answer: 'Start with a clear label and a generous target. Let motion confirm the action, then get out of the way.', answerEnd: 'Try the configured actions below this sample response.', chatNote: 'A fixed example response. No AI service is connected.', actions: 'Context preview actions'},
  ja: {eyebrow: '同じシステム、異なる場面', title: '使われる場面で見る', intro: 'ひとつの設定を3つの場面で。操作、ラベル、動きはそのまま引き継ぎます。', context: 'プレビューの場面', feed: 'ソーシャルフィード', article: '記事の末尾', chat: 'AIチャット', fixture: '操作できるローカルサンプル', local: 'サンプルコンテンツです。操作はこのプレビュー内だけに反映されます。', author: '田中 美香', authorNote: 'デザインノート · サンプル投稿', feedText: '小さな工夫が、よりよい会話の余白をつくる。', artKicker: 'インタラクションのメモ', artTitle: '迷いを減らす。\n心地よさを増やす。', artFoot: '小さな瞬間から、よい体験が生まれる。', articleKicker: 'フィールドノート / 004', articleTitle: '意図と操作のあいだにある余白', articleText: '見慣れた記号、少しの余白、ちょうどよいタイミングの応答。そんな静かな工夫が、インターフェースの心地よさをつくります。', articleEnd: 'お読みいただきありがとうございます。会話を続けましょう。', read: '4分で読める · サンプル記事', prompt: '小さな操作を、もっと心地よくするには？', assistant: 'アシスタント · 固定のサンプル', answer: 'まず、わかりやすいラベルと十分な操作領域を用意します。動きは操作を確かめるために使い、すぐに静かな状態へ戻しましょう。', answerEnd: 'このサンプル回答の下で、設定した操作を試せます。', chatNote: '固定のサンプル回答です。AIサービスには接続していません。', actions: '場面プレビューの操作'},
};

export function ContextPreview({config, onContext, locale, reducedMotion, active = true}: {config: StudioConfig; onContext: (context: StudioConfig['context']) => void; locale: Locale; reducedMotion: boolean; active?: boolean}) {
  const t = copy[locale], id = useId();
  return <section className="studio-context" aria-labelledby={`${id}-title`} data-reduced-motion={reducedMotion || !active || undefined}>
    <div className="context-section-heading"><div><p className="context-eyebrow">{t.eyebrow}</p><h2 id={`${id}-title`}>{t.title}</h2><p className="context-intro">{t.intro}</p></div><span className="context-section-index" aria-hidden="true">01</span></div>
    <div className="context-switch" role="group" aria-label={t.context}>
      {(['feed', 'article', 'chat'] as const).map((context, index) => <button key={context} type="button" aria-pressed={config.context === context} onClick={() => onContext(context)}><span aria-hidden="true">0{index + 1}</span>{t[context]}</button>)}
    </div>
    <div className={`context-window context-window-${config.context}`}>
      <div className="context-window-bar"><span className="context-window-dots" aria-hidden="true"><i/><i/><i/></span><span>{t.fixture}</span><span className="context-window-path" aria-hidden="true">/{config.context}</span></div>
      <div className="context-fixture-stage">
        <article className={`context-fixture context-fixture-${config.context}`} aria-label={t[config.context]}>
          {config.context === 'feed' && <div className="context-fixture-content">
            <div className="context-author"><span className="context-avatar" aria-hidden="true">MT</span><div><strong>{t.author}</strong><p>{t.authorNote}</p></div><span className="context-author-mark" aria-hidden="true">✳</span></div>
            <h3 className="context-feed-title">{t.feedText}</h3>
            <div className="context-editorial-art"><div><p>{t.artKicker}</p><strong>{t.artTitle}</strong><span>{t.artFoot}</span></div><svg viewBox="0 0 180 180" aria-hidden="true"><path d="M32 117C16 74 67 18 104 40s-12 99-42 77 49-87 77-58 13 90-23 77"/><circle cx="32" cy="117" r="7"/><circle cx="116" cy="136" r="7"/></svg></div>
          </div>}
          {config.context === 'article' && <div className="context-fixture-content context-article-copy"><p className="context-article-kicker">{t.articleKicker}</p><h3>{t.articleTitle}</h3><p className="context-article-meta">{t.author} · {t.read}</p><p className="context-article-paragraph">{t.articleText}</p><div className="context-article-rule" aria-hidden="true">✳</div><p className="context-article-end">{t.articleEnd}</p></div>}
          {config.context === 'chat' && <div className="context-fixture-content context-chat-copy"><div className="context-chat-question">{t.prompt}</div><div className="context-chat-heading"><span className="context-chat-avatar" aria-hidden="true">✳</span><strong>{t.assistant}</strong></div><h3 className="context-visually-hidden">{t.chat}</h3><p className="context-chat-answer">{t.answer}</p><p className="context-chat-answer-end">{t.answerEnd}</p><p className="context-chat-note">{t.chatNote}</p></div>}
          <div className="context-fixture-actions"><ConfiguredActions config={config} locale={locale} reducedMotion={reducedMotion} active={active} label={t.actions}/></div>
        </article>
      </div>
    </div>
    <p className="context-local-note"><span aria-hidden="true">◌</span>{t.local}</p>
  </section>;
}
