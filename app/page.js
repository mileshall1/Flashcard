'use client';

import { useEffect, useMemo, useState } from 'react';

const starterDecks = [
  {
    id: 'biology',
    title: 'AP Biology — Cell Division',
    subject: 'Biology',
    color: 'mint',
    cards: [
      { front: 'What happens during prophase?', back: 'Chromatin condenses into chromosomes, the spindle forms, and the nuclear envelope begins to break down.' },
      { front: 'What is the purpose of mitosis?', back: 'To produce two genetically identical daughter cells for growth, repair, and asexual reproduction.' },
      { front: 'When does DNA replication occur?', back: 'During the S phase of interphase, before mitosis begins.' },
      { front: 'What separates during anaphase?', back: 'Sister chromatids separate and move toward opposite poles of the cell.' },
      { front: 'How is cytokinesis different in plant cells?', back: 'Plant cells form a cell plate, while animal cells form a cleavage furrow.' },
      { front: 'What is the G1 checkpoint?', back: 'A control point that checks cell size, nutrients, growth signals, and DNA damage.' },
    ],
    mastered: 4,
    updated: 'Today',
  },
  {
    id: 'calculus',
    title: 'Calculus II — Integration',
    subject: 'Mathematics',
    color: 'lilac',
    cards: [
      { front: 'State integration by parts.', back: '∫u dv = uv − ∫v du' },
      { front: 'When is u-substitution useful?', back: 'When the integrand contains a function and a constant multiple of its derivative.' },
      { front: 'What does an improper integral contain?', back: 'An infinite interval of integration or an unbounded integrand.' },
      { front: 'What is ∫sec²(x) dx?', back: 'tan(x) + C' },
      { front: 'What does the comparison test determine?', back: 'Whether a positive improper integral or series converges by comparing it to a known one.' },
    ],
    mastered: 2,
    updated: 'Yesterday',
  },
  {
    id: 'history',
    title: 'U.S. History — The New Deal',
    subject: 'History',
    color: 'peach',
    cards: [
      { front: 'What were the three goals of the New Deal?', back: 'Relief, recovery, and reform.' },
      { front: 'What did the Social Security Act establish?', back: 'Federal old-age benefits, unemployment insurance, and aid for vulnerable groups.' },
      { front: 'What was the CCC?', back: 'The Civilian Conservation Corps employed young men on environmental projects.' },
      { front: 'What did the FDIC do?', back: 'It insured bank deposits and helped restore public confidence in banks.' },
    ],
    mastered: 1,
    updated: 'Jul 22',
  },
];

const subjects = [
  'Biology', 'Chemistry', 'Physics', 'Environmental Science', 'Anatomy',
  'Algebra', 'Geometry', 'Precalculus', 'Calculus', 'Statistics',
  'U.S. History', 'World History', 'Government', 'Economics', 'Geography',
  'Psychology', 'Sociology', 'Philosophy', 'Literature', 'English',
  'Spanish', 'French', 'Computer Science', 'Business', 'Nursing', 'Other',
];

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sanitizeDecks(value) {
  if (!Array.isArray(value)) return null;
  return value.filter((deck) => (
    deck && typeof deck.id === 'string' && typeof deck.title === 'string' &&
    typeof deck.subject === 'string' && Array.isArray(deck.cards) && deck.cards.length > 0 &&
    deck.cards.every((card) => card && typeof card.front === 'string' && typeof card.back === 'string')
  ));
}

function Icon({ name }) {
  const icons = { home: '⌂', library: '▤', create: '+', progress: '↗', settings: '⚙', search: '⌕', clock: '◷', cards: '▱', spark: '✦', close: '×', arrow: '→', back: '←', upload: '⇧', moon: '☾', sun: '☀', test: '✓', calendar: '□' };
  return <span aria-hidden="true">{icons[name]}</span>;
}

function CreateModal({ onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Biology');
  const [notes, setNotes] = useState('');
  const [cards, setCards] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('notes', notes);
      formData.append('subject', subject);
      formData.append('title', title);
      if (file) formData.append('file', file);
      const response = await fetch('/api/generate', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not generate cards.');
      setCards(data.cards);
      setStep(2);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="create-title">
      <div className="create-modal">
        <button className="icon-button close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        {step === 1 ? (
          <>
            <span className="eyebrow"><Icon name="spark" /> New study set</span>
            <h2 id="create-title">Turn your notes into flashcards</h2>
            <p className="modal-intro">Paste class notes, a study guide, or textbook highlights. We’ll pull out the ideas worth remembering.</p>
            <div className="form-grid">
              <label>
                Set name
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Chemistry midterm review" autoFocus />
              </label>
              <label>
                Subject
                <select value={subject} onChange={(event) => setSubject(event.target.value)}>
                  {subjects.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
            <label>
              Your notes
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Paste at least a few sentences here…" />
            </label>
            <label className={`upload-zone ${file ? 'has-file' : ''}`}>
              <input
                type="file"
                accept=".pdf,.txt,.md,.csv,.docx,.pptx,image/png,image/jpeg"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
              <span className="upload-icon"><Icon name="upload" /></span>
              <span>
                <strong>{file ? file.name : 'Upload class material'}</strong>
                <small>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Click to replace` : 'PDF, Word, PowerPoint, image, or text · up to 10 MB'}</small>
              </span>
              <b>{file ? 'Ready' : 'Browse'}</b>
            </label>
            {error && <div className="form-error">{error}</div>}
            <div className="modal-footer">
              <span>{file ? 'AI will read your upload and notes' : `${notes.trim().split(/\s+/).filter(Boolean).length} words`}</span>
              <button className="primary-button" disabled={loading || !title.trim() || (!file && notes.trim().length < 25)} onClick={generate}>
                {loading ? 'Building your set…' : <>Generate with AI <Icon name="spark" /></>}
              </button>
            </div>
          </>
        ) : (
          <>
            <button className="text-button back-button" onClick={() => setStep(1)}><Icon name="back" /> Edit notes</button>
            <span className="eyebrow"><Icon name="spark" /> Ready to study</span>
            <h2>{cards.length} cards created</h2>
            <p className="modal-intro">Here’s a quick preview. You can start studying right away.</p>
            <div className="preview-list">
              {cards.slice(0, 3).map((card, index) => (
                <div className="preview-row" key={card.front}>
                  <b>{index + 1}</b>
                  <div><strong>{card.front}</strong><span>{card.back}</span></div>
                </div>
              ))}
            </div>
            <button className="primary-button full-button" onClick={() => onCreate({ title: title.trim(), subject, cards })}>Save & study now <Icon name="arrow" /></button>
          </>
        )}
      </div>
    </div>
  );
}

function StudyView({ deck, initialCardIndex = 0, onExit, onUpdate, onReview, theme }) {
  const [index, setIndex] = useState(() => Math.min(Math.max(initialCardIndex, 0), deck.cards.length - 1));
  const [flipped, setFlipped] = useState(false);
  const [queue, setQueue] = useState(() => deck.cards.map((_, cardIndex) => cardIndex));
  const [knownCards, setKnownCards] = useState([]);
  const [complete, setComplete] = useState(false);

  const grade = (didKnow) => {
    const currentCardIndex = queue[index];
    onReview?.({ deckId: deck.id, cardIndex: currentCardIndex, correct: didKnow, source: 'flashcard' });
    const nextKnownCards = didKnow && !knownCards.includes(currentCardIndex) ? [...knownCards, currentCardIndex] : knownCards;
    const nextQueue = !didKnow && queue.length < deck.cards.length * 3 ? [...queue, currentCardIndex] : queue;
    setKnownCards(nextKnownCards);
    setQueue(nextQueue);
    if (index === nextQueue.length - 1) {
      setComplete(true);
      onUpdate(deck.id, Math.max(deck.mastered, nextKnownCards.length));
    } else {
      setIndex(index + 1);
      setFlipped(false);
    }
  };

  const reviewAgain = () => {
    const currentCardIndex = queue[index];
    onReview?.({ deckId: deck.id, cardIndex: currentCardIndex, correct: false, source: 'flashcard' });
    setFlipped(false);
  };

  useEffect(() => {
    const handleKey = (event) => {
      if (complete || event.repeat) return;

      if (event.code === 'Space' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        setFlipped((value) => !value);
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (!flipped) {
          setFlipped(true);
        } else if (event.key === 'ArrowLeft') reviewAgain();
        else grade(true);
        return;
      }

      if (flipped && event.key === '1') reviewAgain();
      if (flipped && event.key === '2') grade(true);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  if (complete) {
    const score = Math.round((knownCards.length / deck.cards.length) * 100);
    return (
      <main className={`study-page ${theme}`}>
        <div className="results-card">
          <span className="results-icon">✓</span>
          <span className="eyebrow">Session complete</span>
          <h1>{score >= 80 ? 'You crushed it.' : 'Nice work—keep going.'}</h1>
          <p>You mastered <strong>{knownCards.length} of {deck.cards.length}</strong> cards in {deck.title}.</p>
          <div className="score-ring" style={{ '--score': `${score * 3.6}deg` }}><span>{score}%</span></div>
          <div className="results-actions">
            <button className="secondary-button" onClick={onExit}>Back to dashboard</button>
            <button className="primary-button" onClick={() => { setIndex(0); setQueue(deck.cards.map((_, cardIndex) => cardIndex)); setKnownCards([]); setComplete(false); setFlipped(false); }}>Study again</button>
          </div>
        </div>
      </main>
    );
  }

  const card = deck.cards[queue[index]];
  return (
    <main className={`study-page ${theme}`}>
      <header className="study-header">
        <button className="icon-button" onClick={onExit} aria-label="Exit study session"><Icon name="close" /></button>
        <div><strong>{deck.title}</strong><span>{deck.subject}</span></div>
        <span>{index + 1} / {queue.length}</span>
      </header>
      <div className="progress-track"><i style={{ width: `${((index + 1) / queue.length) * 100}%` }} /></div>
      <section className="study-stage">
        <p className="study-prompt">{flipped ? 'How did you do?' : index >= deck.cards.length ? 'Adaptive review: this card needed another look.' : 'Think of the answer, then flip the card.'}</p>
        <button className={`flashcard ${flipped ? 'is-flipped' : ''}`} onClick={() => setFlipped(!flipped)} aria-label="Flip card">
          <span className="card-face card-front"><small>QUESTION</small><strong>{card.front}</strong><em>Click, Space, or an arrow key to reveal</em></span>
          <span className="card-face card-back"><small>ANSWER</small><strong>{card.back}</strong><em>← review again · got it →</em></span>
        </button>
        {flipped ? (
          <div className="grade-actions">
            <button className="again-button" onClick={reviewAgain}><span>←</span> Review again</button>
            <button className="know-button" onClick={() => grade(true)}><span>→</span> Got it</button>
          </div>
        ) : <button className="primary-button reveal-button" onClick={() => setFlipped(true)}>Reveal answer</button>}
      </section>
    </main>
  );
}

function TestView({ deck, onExit, onAnswer, theme }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');

  const questions = useMemo(() => deck.cards.map((card, cardIndex) => {
    const type = cardIndex % 3 === 0 ? 'multiple-choice' : cardIndex % 3 === 1 ? 'fill-blank' : 'true-false';
    const distractors = deck.cards
      .filter((_, optionIndex) => optionIndex !== cardIndex)
      .map((item) => item.back)
      .slice(0, 3);
    while (distractors.length < 3) distractors.push('None of the other answers correctly explains this concept.');
    const choices = [card.back, ...distractors];
    const offset = cardIndex % choices.length;
    if (type === 'fill-blank') {
      const ignored = new Set(['because', 'during', 'through', 'between', 'which', 'their', 'these', 'those', 'where', 'while', 'about']);
      const words = card.back.match(/[A-Za-z][A-Za-z'-]{4,}/g) || [];
      const blankAnswer = words.filter((word) => !ignored.has(word.toLowerCase())).sort((a, b) => b.length - a.length)[0] || words[0] || card.front;
      return { cardIndex, type, question: card.back.replace(blankAnswer, '________'), answer: blankAnswer, explanation: card.back, choices: [] };
    }
    if (type === 'true-false') {
      const useFalseStatement = Math.floor(cardIndex / 3) % 2 === 1;
      const negated = card.back.replace(/\b(is|are|does|do|can|will|has|have)\b/i, '$1 not');
      const statement = useFalseStatement ? (negated === card.back ? `It is not true that ${card.back.charAt(0).toLowerCase()}${card.back.slice(1)}` : negated) : card.back;
      return { cardIndex, type, question: statement, answer: useFalseStatement ? 'False' : 'True', explanation: `${card.front} — ${card.back}`, choices: ['True', 'False'] };
    }
    return { cardIndex, type, question: card.front, answer: card.back, explanation: card.back, choices: [...choices.slice(offset), ...choices.slice(0, offset)] };
  }), [deck]);

  const chooseAnswer = (choice) => {
    if (selected !== null) return;
    setSelected(choice);
    const correct = choice === questions[index].answer;
    if (correct) setScore((value) => value + 1);
    onAnswer?.({ deckId: deck.id, cardIndex: questions[index].cardIndex, correct, question: questions[index].question, answer: questions[index].answer, selected: choice });
  };

  const submitTypedAnswer = (event) => {
    event.preventDefault();
    if (!typedAnswer.trim() || selected !== null) return;
    const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isCorrect = normalize(typedAnswer) === normalize(questions[index].answer);
    setSelected(typedAnswer.trim());
    if (isCorrect) setScore((value) => value + 1);
    onAnswer?.({ deckId: deck.id, cardIndex: questions[index].cardIndex, correct: isCorrect, question: questions[index].question, answer: questions[index].answer, selected: typedAnswer.trim() });
  };

  const nextQuestion = () => {
    if (index === questions.length - 1) setFinished(true);
    else { setIndex((value) => value + 1); setSelected(null); setTypedAnswer(''); }
  };

  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <main className={`study-page test-page ${theme}`}>
        <div className="results-card test-results">
          <span className="results-icon">{percent >= 70 ? '✓' : '↗'}</span>
          <span className="eyebrow">Practice test complete</span>
          <h1>{percent >= 90 ? 'Exam ready.' : percent >= 70 ? 'Strong work.' : 'One more round.'}</h1>
          <p>You answered <strong>{score} of {questions.length}</strong> questions correctly.</p>
          <div className="score-ring" style={{ '--score': `${percent * 3.6}deg` }}><span>{percent}%</span></div>
          <div className="results-actions">
            <button className="secondary-button" onClick={onExit}>Back to dashboard</button>
            <button className="primary-button" onClick={() => { setIndex(0); setScore(0); setSelected(null); setTypedAnswer(''); setFinished(false); }}>Retake test</button>
          </div>
        </div>
      </main>
    );
  }

  const question = questions[index];
  return (
    <main className={`study-page test-page ${theme}`}>
      <header className="study-header">
        <button className="icon-button" onClick={onExit} aria-label="Exit practice test"><Icon name="close" /></button>
        <div><strong>{deck.title}</strong><span>Practice test</span></div>
        <span>{index + 1} / {questions.length}</span>
      </header>
      <div className="progress-track"><i style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
      <section className="test-stage">
        <div className="question-labels"><span className="eyebrow">QUESTION {index + 1}</span><b>{question.type === 'multiple-choice' ? 'Multiple choice' : question.type === 'fill-blank' ? 'Fill in the blank' : 'True or false'}</b></div>
        <h1>{question.question}</h1>
        {question.type === 'fill-blank' ? (
          <form className="fill-answer" onSubmit={submitTypedAnswer}>
            <label htmlFor="blank-answer">Type the missing word or term</label>
            <div><input id="blank-answer" value={typedAnswer} onChange={(event) => setTypedAnswer(event.target.value)} disabled={selected !== null} placeholder="Your answer…" autoComplete="off" autoFocus /><button className="primary-button" disabled={!typedAnswer.trim() || selected !== null}>Check answer</button></div>
          </form>
        ) : (
          <div className={`answer-grid ${question.type === 'true-false' ? 'true-false-grid' : ''}`}>
            {question.choices.map((choice, choiceIndex) => {
              const isCorrect = selected !== null && choice === question.answer;
              const isWrong = selected === choice && choice !== question.answer;
              return (
                <button key={`${choice}-${choiceIndex}`} className={`${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`} onClick={() => chooseAnswer(choice)}>
                  <span>{question.type === 'true-false' ? (choice === 'True' ? '✓' : '×') : String.fromCharCode(65 + choiceIndex)}</span><b>{choice}</b>
                </button>
              );
            })}
          </div>
        )}
        {selected !== null && (
          <div className="test-feedback">
            <div><span>{selected.toLowerCase().replace(/[^a-z0-9]/g, '') === question.answer.toLowerCase().replace(/[^a-z0-9]/g, '') ? '✓ Correct' : 'Review this one'}</span><small>Answer: {question.answer}{question.type === 'true-false' ? ` · ${question.explanation}` : ''}</small></div>
            <button className="primary-button" onClick={nextQuestion}>{index === questions.length - 1 ? 'See results' : 'Next question'} <Icon name="arrow" /></button>
          </div>
        )}
      </section>
    </main>
  );
}

function DeckManagerModal({ deck, mode, onClose, onSave }) {
  const [draft, setDraft] = useState(() => ({ ...deck, cards: deck.cards.map((card) => ({ ...card })) }));
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorMessages, setTutorMessages] = useState([{ role: 'assistant', text: `I’m ready to help with ${deck.title}. Ask for an explanation, example, analogy, or a mini-quiz.` }]);
  const [tutorLoading, setTutorLoading] = useState(false);

  const updateCard = (index, field, value) => {
    setDraft((current) => ({ ...current, cards: current.cards.map((card, cardIndex) => cardIndex === index ? { ...card, [field]: value } : card) }));
  };

  const askTutor = async (event) => {
    event.preventDefault();
    if (!tutorQuestion.trim() || tutorLoading) return;
    const question = tutorQuestion.trim();
    setTutorMessages((messages) => [...messages, { role: 'user', text: question }]);
    setTutorQuestion('');
    setTutorLoading(true);
    try {
      const response = await fetch('/api/tutor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deck, question }) });
      const data = await response.json();
      setTutorMessages((messages) => [...messages, { role: 'assistant', text: response.ok ? data.answer : data.error }]);
    } catch {
      setTutorMessages((messages) => [...messages, { role: 'assistant', text: 'I could not reach the tutor. Please try again.' }]);
    } finally { setTutorLoading(false); }
  };

  if (mode === 'tutor') {
    return (
      <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="AI tutor">
        <div className="create-modal tutor-modal">
          <button className="icon-button close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
          <span className="eyebrow"><Icon name="spark" /> AI TUTOR</span><h2>Learn it, don’t just memorize it.</h2>
          <div className="tutor-chips">{['Explain this simply', 'Give me an analogy', 'Quiz me', 'What am I missing?'].map((prompt) => <button key={prompt} onClick={() => setTutorQuestion(prompt)}>{prompt}</button>)}</div>
          <div className="tutor-thread">{tutorMessages.map((message, index) => <div className={message.role} key={index}><span>{message.role === 'assistant' ? 'st' : 'You'}</span><p>{message.text}</p></div>)}{tutorLoading && <div className="assistant"><span>st</span><p>Thinking through your material…</p></div>}</div>
          <form className="tutor-input" onSubmit={askTutor}><input value={tutorQuestion} onChange={(event) => setTutorQuestion(event.target.value)} placeholder="Ask about this study set…" /><button className="primary-button" disabled={!tutorQuestion.trim() || tutorLoading}><Icon name="arrow" /></button></form>
        </div>
      </div>
    );
  }

  if (mode === 'guide') {
    return (
      <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Study guide">
        <div className="create-modal guide-modal">
          <button className="icon-button close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
          <span className="eyebrow"><Icon name="spark" /> AI STUDY GUIDE</span>
          <h2>{deck.title}</h2>
          <p className="modal-intro">A focused review sheet built from your verified flashcards.</p>
          <div className="guide-summary"><b>{deck.subject}</b><span>{deck.cards.length} core concepts</span><span>{Math.round((deck.mastered / deck.cards.length) * 100)}% mastered</span></div>
          <div className="guide-sections">
            <section><h3>Key concepts</h3>{deck.cards.map((card, index) => <div key={card.front}><b>{index + 1}. {card.front}</b><p>{card.back}</p></div>)}</section>
            <section><h3>Exam checklist</h3>{deck.cards.slice(0, 6).map((card) => <label key={card.front}><input type="checkbox" /> I can explain: {card.front.replace(/[?]$/, '')}</label>)}</section>
          </div>
          <button className="primary-button full-button" onClick={() => window.print()}>Print or save as PDF</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit study set">
      <div className="create-modal editor-modal">
        <button className="icon-button close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        <span className="eyebrow">EDIT STUDY SET</span>
        <h2>Make this set yours</h2>
        <div className="form-grid">
          <label>Set name<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
          <label>Subject<select value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })}>{subjects.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
        </div>
        <div className="card-editor-list">
          {draft.cards.map((card, index) => (
            <div className="card-editor-row" key={index}>
              <span>{index + 1}</span>
              <input aria-label={`Question ${index + 1}`} value={card.front} onChange={(event) => updateCard(index, 'front', event.target.value)} />
              <textarea aria-label={`Answer ${index + 1}`} value={card.back} onChange={(event) => updateCard(index, 'back', event.target.value)} />
              <button aria-label={`Delete card ${index + 1}`} onClick={() => setDraft({ ...draft, cards: draft.cards.filter((_, cardIndex) => cardIndex !== index) })}>×</button>
            </div>
          ))}
        </div>
        <div className="editor-footer">
          <button className="secondary-button" onClick={() => setDraft({ ...draft, cards: [...draft.cards, { front: 'New question', back: 'New answer' }] })}>+ Add card</button>
          <button className="primary-button" disabled={!draft.title.trim() || !draft.cards.length} onClick={() => onSave({ ...draft, updated: 'Just now' })}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [decks, setDecks] = useState(starterDecks);
  const [showCreate, setShowCreate] = useState(false);
  const [activeDeck, setActiveDeck] = useState(null);
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState('light');
  const [activeMode, setActiveMode] = useState('study');
  const [calendarItems, setCalendarItems] = useState([
    { id: 'bio-final', title: 'Biology final', date: '2026-08-12', type: 'Exam' },
    { id: 'calc-review', title: 'Calculus review', date: '2026-08-05', type: 'Study' },
  ]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [monthOffset, setMonthOffset] = useState(0);
  const [reviewSchedule, setReviewSchedule] = useState({});
  const [mistakes, setMistakes] = useState([]);
  const [cloudSync, setCloudSync] = useState('checking');
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [managedDeck, setManagedDeck] = useState(null);
  const [managerMode, setManagerMode] = useState('edit');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [activePage, setActivePage] = useState('home');

  /* Local-only product state is intentionally hydrated after mount to keep SSR output deterministic. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = window.localStorage.getItem('studii-decks');
    if (saved) {
      try {
        const validDecks = sanitizeDecks(JSON.parse(saved));
        if (validDecks?.length) setDecks(validDecks);
      } catch { /* keep starter data */ }
    }
    const savedTheme = window.localStorage.getItem('studii-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
    }
    const savedCalendar = window.localStorage.getItem('studii-calendar');
    if (savedCalendar) {
      try { setCalendarItems(JSON.parse(savedCalendar)); } catch { /* keep starter schedule */ }
    }
    const savedReviews = window.localStorage.getItem('studii-review-schedule');
    if (savedReviews) try { setReviewSchedule(JSON.parse(savedReviews)); } catch { /* start a fresh schedule */ }
    const savedMistakes = window.localStorage.getItem('studii-mistakes');
    if (savedMistakes) try { setMistakes(JSON.parse(savedMistakes)); } catch { /* start a fresh notebook */ }
    fetch('/api/sync').then(async (response) => {
      if (response.status === 401) { setCloudSync('local'); return; }
      const data = await response.json();
      if (!response.ok) { setCloudSync('error'); return; }
      if (data.state) {
        const validDecks = sanitizeDecks(data.state.decks);
        if (validDecks?.length) setDecks(validDecks);
        if (Array.isArray(data.state.calendarItems)) setCalendarItems(data.state.calendarItems);
        if (data.state.reviewSchedule && typeof data.state.reviewSchedule === 'object') setReviewSchedule(data.state.reviewSchedule);
        if (Array.isArray(data.state.mistakes)) setMistakes(data.state.mistakes);
      }
      setCloudSync('ready');
      setSyncEnabled(true);
    }).catch(() => setCloudSync('error'));
    const syncPage = () => setActivePage(['sets', 'tests', 'calendar', 'progress', 'settings', 'review', 'mistakes'].includes(window.location.hash.slice(1)) ? window.location.hash.slice(1) : 'home');
    syncPage();
    window.addEventListener('hashchange', syncPage);
    setMounted(true);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!syncEnabled) return;
    const timer = window.setTimeout(() => {
      setCloudSync('saving');
      fetch('/api/sync', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state: { decks, calendarItems, reviewSchedule, mistakes } }) })
        .then((response) => setCloudSync(response.ok ? 'ready' : 'error'))
        .catch(() => setCloudSync('error'));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [decks, calendarItems, reviewSchedule, mistakes, syncEnabled]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem('studii-theme', nextTheme);
  };

  const save = (nextDecks) => {
    setDecks(nextDecks);
    window.localStorage.setItem('studii-decks', JSON.stringify(nextDecks));
  };

  const addDeck = ({ title, subject, cards }) => {
    const deck = { id: `${Date.now()}`, title, subject, cards, mastered: 0, color: ['mint', 'lilac', 'peach'][decks.length % 3], updated: 'Just now' };
    save([deck, ...decks]);
    setShowCreate(false);
    setActiveMode('study');
    setActiveCardIndex(0);
    setActiveDeck(deck);
  };

  const updateMastered = (id, mastered) => {
    const next = decks.map((deck) => deck.id === id ? { ...deck, mastered, updated: 'Just now' } : deck);
    save(next);
    setActiveDeck((deck) => deck?.id === id ? { ...deck, mastered } : deck);
  };

  const openDeck = (deck, mode, cardIndex = 0) => {
    setActiveMode(mode);
    setActiveCardIndex(cardIndex);
    setActiveDeck(deck);
  };

  const openManager = (deck, mode) => {
    setManagedDeck(deck);
    setManagerMode(mode);
  };

  const saveManagedDeck = (updatedDeck) => {
    save(decks.map((deck) => deck.id === updatedDeck.id ? updatedDeck : deck));
    setManagedDeck(null);
  };

  const recordReview = ({ deckId, cardIndex, correct, source = 'flashcard' }) => {
    const key = `${deckId}:${cardIndex}`;
    setReviewSchedule((current) => {
      const previous = current[key] || { interval: 0, streak: 0 };
      const streak = correct ? previous.streak + 1 : 0;
      const interval = correct ? [1, 3, 7, 14, 30, 60][Math.min(streak - 1, 5)] : 0;
      const due = new Date();
      due.setDate(due.getDate() + interval);
      const next = { ...current, [key]: { interval, streak, source, lastReviewed: new Date().toISOString(), due: localDateKey(due) } };
      window.localStorage.setItem('studii-review-schedule', JSON.stringify(next));
      return next;
    });
  };

  const recordTestAnswer = (result) => {
    recordReview({ ...result, source: 'test' });
    if (result.correct) return;
    setMistakes((current) => {
      const entry = { ...result, id: `${result.deckId}:${result.cardIndex}`, missedAt: new Date().toISOString() };
      const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 100);
      window.localStorage.setItem('studii-mistakes', JSON.stringify(next));
      return next;
    });
  };

  const addCalendarItem = (event) => {
    event.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;
    const nextItems = [...calendarItems, { id: `${Date.now()}`, title: eventTitle.trim(), date: eventDate, type: 'Study' }]
      .sort((a, b) => a.date.localeCompare(b.date));
    setCalendarItems(nextItems);
    window.localStorage.setItem('studii-calendar', JSON.stringify(nextItems));
    setEventTitle('');
    setEventDate('');
  };

  const filteredDecks = useMemo(() => decks.filter((deck) => `${deck.title} ${deck.subject}`.toLowerCase().includes(query.toLowerCase())), [decks, query]);
  const studied = decks.reduce((sum, deck) => sum + deck.mastered, 0);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return {
      iso: localDateKey(date),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      number: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
    };
  }), []);
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  const nextEvent = [...calendarItems].filter((item) => item.date >= weekDays[0].iso).sort((a, b) => a.date.localeCompare(b.date))[0];
  const todayIso = localDateKey();
  const dueCards = decks.flatMap((deck) => deck.cards.map((card, cardIndex) => ({ deck, card, cardIndex, schedule: reviewSchedule[`${deck.id}:${cardIndex}`] })))
    .filter((item) => !item.schedule || item.schedule.due <= todayIso);
  const monthView = useMemo(() => {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1, 12);
    const gridStart = new Date(first);
    gridStart.setDate(1 - first.getDay());
    const days = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return {
        iso: localDateKey(date),
        number: date.getDate(),
        currentMonth: date.getMonth() === first.getMonth(),
        isToday: date.toDateString() === today.toDateString(),
      };
    });
    return { label: first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), days };
  }, [monthOffset]);

  if (!mounted) return <div className="app-loading" aria-label="Loading Studii" />;

  if (activeDeck && activeMode === 'test') return <TestView deck={activeDeck} onExit={() => setActiveDeck(null)} onAnswer={recordTestAnswer} theme={theme} />;
  if (activeDeck) return <StudyView deck={activeDeck} initialCardIndex={activeCardIndex} onExit={() => setActiveDeck(null)} onUpdate={updateMastered} onReview={recordReview} theme={theme} />;

  return (
    <div className={`app-shell ${theme}`}>
      <aside className="sidebar">
        <a className="brand" href="#home"><span>st</span>studii</a>
        <nav aria-label="Main navigation">
          <a className={activePage === 'home' ? 'active' : ''} href="#home"><Icon name="home" /> Home</a>
          <a className={activePage === 'sets' ? 'active' : ''} href="#sets"><Icon name="library" /> My sets <b>{decks.length}</b></a>
          <a className={activePage === 'review' ? 'active' : ''} href="#review"><Icon name="cards" /> Daily review <b>{dueCards.length}</b></a>
          <button onClick={() => setShowCreate(true)}><Icon name="create" /> Create new</button>
          <a className={activePage === 'calendar' ? 'active' : ''} href="#calendar"><Icon name="calendar" /> Calendar</a>
          <a className={activePage === 'tests' ? 'active' : ''} href="#tests"><Icon name="test" /> Practice tests</a>
          <a className={activePage === 'mistakes' ? 'active' : ''} href="#mistakes"><Icon name="back" /> Mistakes <b>{mistakes.length}</b></a>
          <a className={activePage === 'progress' ? 'active' : ''} href="#progress"><Icon name="progress" /> Progress</a>
        </nav>
        <div className="sidebar-spacer" />
        <div className="streak-card"><span>🔥</span><div><strong>4 day streak</strong><small>Keep it going!</small></div></div>
        <nav className="bottom-nav">
          <button onClick={toggleTheme}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /> {theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
          <a className={activePage === 'settings' ? 'active' : ''} href="#settings"><Icon name="settings" /> Settings</a>
          <a href="/auth"><Icon name="progress" /> Account & sync</a>
        </nav>
        <div className="profile"><span>MH</span><div><strong>Miles</strong><small>Free early access</small></div><button aria-label="Profile options">•••</button></div>
      </aside>

      <main className="dashboard">
        <header className="topbar">
          <div className="mobile-brand">studii</div>
          <label className="search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your study sets…" /></label>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
          <button className="new-set-button" onClick={() => setShowCreate(true)}><Icon name="create" /> New set</button>
        </header>

        <div className="content">
          {activePage === 'home' && <>
          <section className="welcome">
            <div>
              <span className="date-label">{todayLabel}</span>
              <h1>Ready to lock it in?</h1>
              <p>Small sessions add up. Pick up where you left off or build a fresh study set.</p>
            </div>
            <div className="exam-pill"><Icon name="clock" /><div><small>NEXT UP</small><strong>{nextEvent?.title || 'Plan a study session'}</strong></div><b>{nextEvent ? new Date(`${nextEvent.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add date'}</b></div>
          </section>

          <section className="continue-card">
            <div className="continue-copy">
              <span className="eyebrow">CONTINUE STUDYING</span>
              <h2>{decks[0]?.title}</h2>
              <p>{decks[0]?.cards.length} cards · {decks[0]?.mastered} mastered</p>
              <div className="continue-actions">
                <button className="primary-button" onClick={() => openDeck(decks[0], 'study', 0)}>Study now <Icon name="arrow" /></button>
                <span>About 6 min</span>
              </div>
            </div>
            <div className="mini-stack">
              <div className="stack-card back-two" />
              <div className="stack-card back-one" />
              <div className="stack-card front-card"><small>CELL BIOLOGY</small><strong>What happens during prophase?</strong><span>Tap to reveal</span></div>
            </div>
          </section>

          <section className="stats-grid" id="progress">
            <div><span className="stat-icon purple"><Icon name="cards" /></span><p><strong>{decks.reduce((sum, deck) => sum + deck.cards.length, 0)}</strong><small>Total cards</small></p><em>+12 this week</em></div>
            <div><span className="stat-icon green">✓</span><p><strong>{studied}</strong><small>Mastered</small></p><em>{Math.round((studied / Math.max(1, decks.reduce((sum, deck) => sum + deck.cards.length, 0))) * 100)}% overall</em></div>
            <div><span className="stat-icon orange"><Icon name="clock" /></span><p><strong>2.4h</strong><small>Study time</small></p><em>+32 min today</em></div>
          </section>
          </>}

          {activePage === 'calendar' && <>
          <section className="page-heading"><span className="eyebrow">CALENDAR</span><h1>Plan your study week</h1><p>Turn every exam date into a realistic review plan.</p></section>
          <section className="planner-section">
            <div className="planner-heading">
              <div><span className="eyebrow">STUDY PLANNER</span><h2>Your next 7 days</h2><p>Keep exams, quizzes, and review blocks in one place.</p></div>
              <form className="quick-event" onSubmit={addCalendarItem}>
                <input aria-label="Event name" value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} placeholder="Add exam or study block" />
                <input aria-label="Event date" type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
                <button className="primary-button" type="submit" disabled={!eventTitle.trim() || !eventDate}><Icon name="create" /> Add</button>
              </form>
            </div>
            <div className="week-strip">
              {weekDays.map((date, index) => {
                const items = calendarItems.filter((item) => item.date === date.iso);
                return (
                  <article className={`day-card ${index === 0 ? 'today' : ''} ${items.length ? 'has-event' : ''}`} key={date.iso}>
                    <span>{date.day}</span><strong>{date.number}</strong><small>{date.month}</small>
                    <div className="day-events">
                      {items.slice(0, 2).map((item) => <b className={item.type.toLowerCase()} key={item.id}>{item.title}</b>)}
                      {!items.length && <i>Open</i>}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
          <section className="month-calendar" aria-label={`${monthView.label} calendar`}>
            <div className="month-toolbar">
              <div><span className="eyebrow">MONTH VIEW</span><h2>{monthView.label}</h2></div>
              <div><button onClick={() => setMonthOffset((value) => value - 1)} aria-label="Previous month">←</button><button onClick={() => setMonthOffset(0)}>Today</button><button onClick={() => setMonthOffset((value) => value + 1)} aria-label="Next month">→</button></div>
            </div>
            <div className="calendar-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>
            <div className="calendar-grid">
              {monthView.days.map((day) => {
                const items = calendarItems.filter((item) => item.date === day.iso);
                return <article className={`${day.currentMonth ? '' : 'outside'} ${day.isToday ? 'today' : ''}`} key={day.iso}>
                  <span>{day.number}</span>
                  <div>{items.map((item) => <b className={item.type.toLowerCase()} title={item.title} key={item.id}>{item.title}</b>)}</div>
                </article>;
              })}
            </div>
          </section>
          </>}

          {activePage === 'sets' && <section className="sets-section">
            <div className="section-heading"><div><h2>Your study sets</h2><p>Jump back into a subject or start something new.</p></div><button className="text-button" onClick={() => setShowCreate(true)}>Create a set <Icon name="arrow" /></button></div>
            <div className="deck-grid">
              {filteredDecks.map((deck) => {
                const percent = Math.round((deck.mastered / deck.cards.length) * 100);
                return (
                  <article className="deck-card" key={deck.id}>
                    <div className={`deck-cover ${deck.color}`}><span>{deck.subject.slice(0, 2).toUpperCase()}</span><small>{deck.subject}</small><b>{deck.title.split('—')[1]?.trim() || deck.title}</b></div>
                    <div className="deck-info">
                      <div className="deck-meta"><span>{deck.cards.length} cards</span><span>Updated {deck.updated}</span></div>
                      <h3>{deck.title}</h3>
                      <div className="deck-progress"><span><i style={{ width: `${percent}%` }} /></span><b>{percent}%</b></div>
                      <div className="deck-actions">
                        <button onClick={() => openDeck(deck, 'study')}>Study <Icon name="arrow" /></button>
                        <button className="test-button" onClick={() => openDeck(deck, 'test')}><Icon name="test" /> Test</button>
                      </div>
                      <div className="deck-tool-links"><button onClick={() => openManager(deck, 'guide')}>Study guide</button><button onClick={() => openManager(deck, 'tutor')}>AI tutor</button><button onClick={() => openManager(deck, 'edit')}>Edit cards</button></div>
                    </div>
                  </article>
                );
              })}
              <button className="add-deck-card" onClick={() => setShowCreate(true)}><span><Icon name="create" /></span><strong>Create a new set</strong><small>AI generation and every study tool are free</small></button>
            </div>
          </section>
          }

          {activePage === 'tests' && <section className="page-view">
            <div className="page-heading"><span className="eyebrow">PRACTICE TESTS</span><h1>Test what you actually know</h1><p>Choose a study set and practice with multiple choice, true/false, and fill-in-the-blank questions.</p></div>
            <div className="test-library">
              {filteredDecks.map((deck) => <article key={deck.id}><span className={`test-subject ${deck.color}`}>{deck.subject.slice(0, 2).toUpperCase()}</span><div><small>{deck.subject}</small><h3>{deck.title}</h3><p>{deck.cards.length} questions · Mixed formats · Instant feedback</p></div><button className="primary-button" onClick={() => openDeck(deck, 'test')}>Start test <Icon name="arrow" /></button></article>)}
            </div>
          </section>}

          {activePage === 'review' && <section className="page-view">
            <div className="page-heading"><span className="eyebrow">DAILY REVIEW</span><h1>{dueCards.length ? `${dueCards.length} cards ready today` : 'You’re caught up'}</h1><p>Studii schedules cards more often when they are new or difficult, then spaces them out as your recall improves.</p></div>
            <div className="review-queue">{dueCards.slice(0, 20).map(({ deck, card, cardIndex, schedule }) => <article key={`${deck.id}:${cardIndex}`}><div><small>{deck.subject} · {schedule ? `Due ${schedule.due}` : 'New card'}</small><h3>{card.front}</h3><p>{schedule ? `${schedule.streak} correct reviews in a row` : 'Not reviewed yet'}</p></div><button className="primary-button" onClick={() => openDeck(deck, 'study', cardIndex)}>Review card <Icon name="arrow" /></button></article>)}{!dueCards.length && <div className="empty-state"><span>✓</span><h3>Everything is on schedule</h3><p>Come back tomorrow or study any set whenever you want.</p></div>}</div>
          </section>}

          {activePage === 'mistakes' && <section className="page-view">
            <div className="page-heading"><span className="eyebrow">WRONG-ANSWER NOTEBOOK</span><h1>Turn misses into points</h1><p>Questions you miss on practice tests are saved here automatically for focused review.</p></div>
            <div className="mistake-list">{mistakes.map((mistake) => { const deck = decks.find((item) => item.id === mistake.deckId); return <article key={mistake.id}><div><small>{deck?.subject || 'Study set'}</small><h3>{mistake.question}</h3><p><b>Your answer:</b> {mistake.selected}</p><p><b>Correct answer:</b> {mistake.answer}</p></div>{deck && <button className="secondary-button" onClick={() => openDeck(deck, 'study')}>Review set</button>}</article>; })}{!mistakes.length && <div className="empty-state"><span>◎</span><h3>No missed questions yet</h3><p>Complete a practice test and anything you miss will appear here.</p></div>}</div>
          </section>}

          {activePage === 'progress' && <section className="page-view">
            <div className="page-heading"><span className="eyebrow">PROGRESS</span><h1>Your work is adding up</h1><p>See your momentum across every subject and find the sets that need another pass.</p></div>
            <div className="stats-grid">
              <div><span className="stat-icon purple"><Icon name="cards" /></span><p><strong>{decks.reduce((sum, deck) => sum + deck.cards.length, 0)}</strong><small>Total cards</small></p><em>Across {decks.length} sets</em></div>
              <div><span className="stat-icon green">✓</span><p><strong>{studied}</strong><small>Mastered</small></p><em>{Math.round((studied / Math.max(1, decks.reduce((sum, deck) => sum + deck.cards.length, 0))) * 100)}% overall</em></div>
              <div><span className="stat-icon orange"><Icon name="clock" /></span><p><strong>2.4h</strong><small>Study time</small></p><em>4 day streak</em></div>
            </div>
            <div className="progress-list">{decks.map((deck) => { const percent = Math.round((deck.mastered / deck.cards.length) * 100); return <article key={deck.id}><div><small>{deck.subject}</small><strong>{deck.title}</strong></div><span><i style={{ width: `${percent}%` }} /></span><b>{percent}%</b><button onClick={() => openDeck(deck, 'study')}>Keep studying</button></article>; })}</div>
          </section>}

          {activePage === 'settings' && <section className="page-view">
            <div className="page-heading"><span className="eyebrow">SETTINGS</span><h1>Make Studii yours</h1><p>Adjust your study experience and manage locally stored app data.</p></div>
            <div className="settings-grid">
              <article><div><h3>Appearance</h3><p>Choose the theme that feels best during long study sessions.</p></div><button className="secondary-button" onClick={toggleTheme}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /> Use {theme === 'dark' ? 'light' : 'dark'} mode</button></article>
              <article><div><h3>Keyboard controls</h3><p>Space flips cards. Left marks the current card for another look. Right marks it correct.</p></div><span className="setting-status">Enabled</span></article>
              <article><div><h3>AI study tools</h3><p>Gemini-generated cards, study guides, and tutoring are available during free early access.</p></div><span className="setting-status">Free</span></article>
              <article><div><h3>Your data</h3><p>{cloudSync === 'local' ? 'Sign in to back up your study data and sync it across devices.' : cloudSync === 'error' ? 'Cloud sync needs your Supabase project configuration and database schema.' : 'Your sets, reviews, mistakes, and calendar are connected to cloud backup.'}</p></div><span className={`setting-status ${cloudSync === 'ready' || cloudSync === 'saving' ? '' : 'neutral'}`}>{cloudSync === 'saving' ? 'Saving…' : cloudSync === 'ready' ? 'Synced' : cloudSync === 'checking' ? 'Checking' : cloudSync === 'error' ? 'Setup needed' : 'Local'}</span></article>
            </div>
          </section>}
        </div>
      </main>
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={addDeck} />}
      {managedDeck && <DeckManagerModal deck={managedDeck} mode={managerMode} onClose={() => setManagedDeck(null)} onSave={saveManagedDeck} />}
    </div>
  );
}
