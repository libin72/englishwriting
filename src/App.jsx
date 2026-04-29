import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

import { BookOpen, Anchor, ArrowRight, MessageCircle, Eye, Clock, CheckCircle2, ChevronRight, ChevronLeft, Edit3, Type, ListOrdered, Users, PlusCircle, Save, LogOut, Sparkles, User, Lock, Loader2, GraduationCap, Trash2, FileEdit, Library, ShieldCheck, UserCheck, UserX, KeyRound } from 'lucide-react';

// ==========================================
// 1. Firebase 初始化
// ==========================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "在这里填入你的真实数据";

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const auth = isFirebaseConfigured ? getAuth(app) : null;
const db = isFirebaseConfigured ? getFirestore(app) : null;
const appId = firebaseConfig.projectId || 'production-english-app';

// ==========================================
// 2. 默认课程数据
// ==========================================
const DEFAULT_LESSONS = [
  {
    id: "lesson_1",
    title: "Lesson 1: 完美的开篇",
    subtitle: "The Perfect Hook - Catching Your Reader",
    target: "I can hook my reader at the very beginning of a narrative by using action, dialogue, or a surprising statement instead of a boring introduction.",
    sections: {
      preClass: [
        { type: 'title', content: 'Activity A & B: The Anatomy of an Opening' },
        { type: 'info', content: 'Read the excerpts below. Dissect the texts by interacting with them.' },
        { 
          type: 'highlight', 
          instruction: 'The "Delete" Test: Click to highlight every sentence that describes a routine action that literally everyone does.',
          text: "I woke up early on Saturday morning. I felt a little bit sad but also excited. Today was the day I would officially graduate from Zhongguancun No. 1 Primary School. I got out of bed, put on my uniform for the last time, and ate my breakfast quickly. I grabbed my backpack, and my dad drove me to the school. I wondered what middle school in Haidian would be like next year.",
          correctKeywords: ["woke up", "got out of bed", "ate my breakfast", "grabbed my backpack"]
        },
        { type: 'info', content: '**Excerpt 2: In Media Res (The Action Hook)**\nThe heavy carbon-fiber shaft of my lacrosse stick cracked against the defender’s forearm with a loud THWACK. I didn\'t even blink. Ignoring the sting vibrating up my wrist, I spun left, checked my throwing strings, and cradled the ball tight against my chest. With five seconds left on the stadium clock, dodging this giant was the only thing standing between me and the championship.' },
        { type: 'write', instruction: 'Sensory Anchor: Find the sound detail and the touch/feeling detail the author uses in Excerpt 2. Write them below.', placeholder: 'Sound detail: ... \nTouch detail: ...' },
        { type: 'title', content: 'Activity C: "First Thought, Wrong Thought" Brainstorming' },
        { type: 'write', instruction: 'Prompt: "Write about a time you tried something completely new and failed."\nWrite three completely different, professional hooks for this prompt.', placeholder: 'Hook 1 (Action):\nHook 2 (Dialogue):\nHook 3 (Sensory/Setting):' }
      ],
      inClass: [
        { type: 'title', content: 'The Science of the Hook' },
        { type: 'info', content: '• **In Media Res**: Drop the reader into the scene one second *after* the action has already started.\n• **Dialogue Hook**: Start with a quote that creates immediate conflict, confusion, or tension.\n• **Sensory Hook**: Focus intensely on one hyper-specific detail.' },
        { type: 'title', content: 'Collaborative Lab: The "Makeover" Sprints' },
        { type: 'write', instruction: 'Sprint 1 (The Sports Scene)\nBoring Start: I was very nervous before my 5K running race started. There were a lot of people.\nYour Rewrite (Must use an Action Hook):', placeholder: 'Write your action hook here...' },
        { type: 'write', instruction: 'Sprint 2 (The Test Score)\nBoring Start: I checked my computer to see my final exam grade. I hoped I did well.\nYour Rewrite (Must use a Dialogue Hook):', placeholder: 'Write your dialogue hook here...' }
      ],
      postClass: [
        { type: 'title', content: 'Module A: Standardized Reading Comprehension' },
        { type: 'info', content: '"Don\'t you dare look down," Coach Miller hissed, his grip tightening on my shoulder harness.\nThe wind whipped across the sheer rock face, drowning out everything except the sound of my own ragged breathing and the metallic clinking of the carabiners.\nMy boots slipped slightly on the damp granite, sending a small shower of pebbles plummeting into the foggy abyss below.\nI swallowed hard, my mouth tasting like old pennies, and reached blindly for the next handhold.' },
        { type: 'quiz', question: 'Question 1: Which technique does the author use in sentence (1) to hook the reader?', options: ['Introducing the main character\'s backstory.', 'Using a dialogue hook that immediately establishes tension.', 'Describing the setting in chronological order.', 'Asking the reader a direct question.'], correct: 1 },
        { type: 'quiz', question: 'Question 2: How does sentence (3) function within this opening hook?', options: ['It provides a flashback to explain why the character is climbing.', 'It resolves the conflict established by the coach.', 'It uses action and sensory details (sound, sight) to raise the stakes and increase danger.', 'It transitions the story to a completely different setting.'], correct: 2 },
        { type: 'title', content: 'Module B: The "Three-Way" Draft Challenge' },
        { type: 'write', instruction: 'Scenario: You have just discovered a hidden door at the back of your school library that you\'ve never noticed before. The door is slightly cracked open, and a strange light is spilling out.\n\nTask: Write THREE different opening paragraphs (each 3-4 sentences long).', placeholder: 'Draft 1: The Action Hook (In Media Res)...\n\nDraft 2: The Dialogue Hook...\n\nDraft 3: The Sensory Hook...' }
      ]
    }
  },
  {
    id: "lesson_2",
    title: "Lesson 2: 逻辑定序",
    subtitle: "The Arrow of Time - Mastering Logical Sequencing",
    target: "I can sequence events logically in a narrative using a sophisticated 'Transition Matrix'.",
    sections: {
      preClass: [
        { type: 'title', content: 'Activity A & B: The Logic Detective' },
        { type: 'info', content: '**Excerpt 2: The Logical Arrow**\nInitially, early that Saturday morning, we packed the car with blue and white gear, our breath visible in the crisp autumn air. Upon arriving at Penn State, we set up our grill for a massive tailgate, throwing the football around with other fans. As soon as the gates swung open, we joined the sea of white-clad spectators pouring into the stands to find Section 102. Simultaneously, the band marched onto the field, their drums thumping like a heartbeat. Finally, just as the sun dipped behind the stadium walls, the winning touchdown was scored, and the entire valley shook with our cheers.' },
        { type: 'order', instruction: 'The Mini-Sequence: Click the 4 steps of a Lacrosse play below in the correct logical order (1 to 4).', items: ["I adjusted my grip and fired a shot into the top corner of the net.", "The referee blew the whistle to start the second half.", "I scooped up the ground ball near the midfield line.", "I dodged a defender who was trying to check my stick."], correctOrder: [3, 0, 1, 2] }
      ],
      inClass: [
        { type: 'title', content: 'Mini-Lesson: The Transition Matrix' },
        { type: 'info', content: '🕒 **Chronological**: Initially, Subsequently, Eventually, Ultimately\n⏳ **Simultaneous**: Meanwhile, Simultaneously, In the meantime\n⚡ **Causal**: Consequently, As a result, Accordingly' },
        { type: 'write', instruction: 'Collaborative Lab: The "Domino Effect" Challenge\nA 5K race at the Olympic Forest Park in Beijing. Fill in the missing events.', placeholder: 'Initially, the starter pistol fired and a thousand runners surged forward.\n(Use Meanwhile) ... \n(Use Gradually) ...\nConsequently, I crossed the finish line with a new personal record.' }
      ],
      postClass: [
         { type: 'title', content: 'Module A: Standardized Reading Check' },
         { type: 'info', content: 'Our team arrived at the Haidian Science Center just as the doors opened at 8:00 AM.\n(2) Initially, we spent an hour carefully assembling our model of a digital carbon credit registry.\n(3) In the meantime, the judges began walking through the other rows, taking notes on their clipboards.\n(4) Consequently, we were perfectly prepared by the time they reached our booth at noon.\n(5) Ultimately, our hard work paid off when they announced the first-place winners.' },
         { type: 'quiz', question: 'Which transition word in the passage shows that two different things were happening at the exact same time?', options: ['Initially', 'In the meantime', 'Consequently', 'Ultimately'], correct: 1 },
         { type: 'write', instruction: 'Module B: The "Chaos to Order" Writing Challenge\nWrite a two-paragraph story about "A Lacrosse Practice Gone Wrong."\nPara 1: Use Initially and Subsequently.\nPara 2: Use Simultaneously and As a result.', placeholder: 'Draft your 2 paragraphs here...' }
      ]
    }
  }
];

// ==========================================
// 3. Shared Interactive Components
// ==========================================
const HighlightText = ({ text, instruction, value = [], onChange, teacherFeedback, readOnly }) => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const toggleSentence = (index) => { if (readOnly) return; if (value.includes(index)) onChange(value.filter(i => i !== index)); else onChange([...value, index]); };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 relative">
      <div className="flex items-center gap-2 mb-4 text-indigo-600 font-semibold"><Edit3 className="w-5 h-5" /><h3>互动练习: 文本分析</h3></div>
      <p className="text-slate-600 mb-4">{instruction}</p>
      <div className={`p-4 bg-slate-50 rounded-lg text-lg leading-relaxed select-none ${readOnly ? '' : 'cursor-pointer'}`}>
        {sentences.map((sentence, idx) => ( <span key={idx} onClick={() => toggleSentence(idx)} className={`transition-colors duration-200 ease-in-out px-1 rounded ${value.includes(idx) ? 'bg-yellow-300 text-slate-900 shadow-sm' : 'hover:bg-slate-200 text-slate-800'}`}>{sentence}</span> ))}
      </div>
      {teacherFeedback && ( <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg"><p className="text-sm font-bold text-orange-800 mb-1">Teacher's Feedback:</p><p className="text-orange-900 whitespace-pre-line">{teacherFeedback}</p></div> )}
    </div>
  );
};

const OrderingTask = ({ items, instruction, value = [], onChange, teacherFeedback, readOnly }) => {
  const currentOrder = value.length === items.length ? value : Array(items.length).fill(null);
  const currentStep = currentOrder.filter(x => x !== null).length + 1;
  const handleItemClick = (index) => { if (readOnly) return; const newOrder = [...currentOrder]; if (newOrder[index] !== null) { newOrder[index] = null; onChange(newOrder); } else if (currentStep <= items.length) { newOrder[index] = currentStep; onChange(newOrder); } };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2 text-indigo-600 font-semibold"><ListOrdered className="w-5 h-5" /><h3>互动练习: 逻辑排序</h3></div>{!readOnly && <button onClick={() => onChange([])} className="text-sm text-slate-500 hover:text-indigo-600">重置 (Reset)</button>}</div>
      <p className="text-slate-600 mb-4">{instruction}</p>
      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <div key={idx} onClick={() => handleItemClick(idx)} className={`flex items-center gap-4 p-4 rounded-lg transition-all ${readOnly ? '' : 'cursor-pointer'} ${currentOrder[idx] !== null ? 'bg-indigo-50 border border-indigo-200 shadow-sm' : 'bg-slate-50 border border-transparent hover:bg-slate-100'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentOrder[idx] !== null ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{currentOrder[idx] || '?'}</div>
            <p className="text-slate-800">{item}</p>
          </div>
        ))}
      </div>
      {teacherFeedback && ( <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg"><p className="text-sm font-bold text-orange-800 mb-1">Teacher's Feedback:</p><p className="text-orange-900 whitespace-pre-line">{teacherFeedback}</p></div> )}
    </div>
  );
};

const QuizBlock = ({ question, options, value, onChange, teacherFeedback, readOnly }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <h3 className="font-semibold text-slate-800 mb-4 text-lg">{question}</h3>
      <div className="flex flex-col gap-3">
        {options.map((opt, idx) => {
          const isSelected = value === idx;
          let btnClass = "text-left p-4 rounded-lg border transition-all duration-200 " + (isSelected ? "bg-indigo-50 border-indigo-500 text-indigo-800" : "bg-white border-slate-200 text-slate-700 " + (readOnly ? "" : "hover:border-indigo-300 hover:bg-slate-50"));
          return (
            <button key={idx} onClick={() => !readOnly && onChange(idx)} className={btnClass} disabled={readOnly}>
              <div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full border flex items-center justify-center text-sm ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300'}`}>{String.fromCharCode(65 + idx)}</div><span>{opt}</span></div>
            </button>
          );
        })}
      </div>
      {teacherFeedback && <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg"><p className="text-sm font-bold text-orange-800 mb-1">Teacher's Feedback:</p><p className="text-orange-900 whitespace-pre-line">{teacherFeedback}</p></div>}
    </div>
  );
};

const WritingPad = ({ instruction, placeholder, value = "", onChange, teacherFeedback, readOnly }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center gap-2 mb-3 text-indigo-600 font-semibold"><Type className="w-5 h-5" /><h3>写作练习 (Writing Task)</h3></div>
      <p className="text-slate-700 mb-4 whitespace-pre-line">{instruction}</p>
      {readOnly ? (
        <div className="w-full min-h-[160px] p-4 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-line text-slate-800">{value || <span className="text-slate-400 italic">No answer provided.</span>}</div>
      ) : (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-40 p-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y text-slate-800" />
      )}
      {teacherFeedback && <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg"><p className="text-sm font-bold text-orange-800 mb-1">Teacher's Feedback / Grade:</p><p className="text-orange-900 whitespace-pre-line">{teacherFeedback}</p></div>}
    </div>
  );
};

const InfoBlock = ({ content }) => ( <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-6 text-slate-800 whitespace-pre-line leading-relaxed shadow-sm">{content}</div> );

// ==========================================
// 4. Lesson Runner Component
// ==========================================
const LessonRunner = ({ lesson, answers, onUpdateAnswer, feedback = {}, onUpdateFeedback, mode = "student", onBack }) => {
  const [activeTab, setActiveTab] = useState('preClass');
  const tabs = [
    { id: 'preClass', label: '🟢 课前预习 (Discovery)' },
    { id: 'inClass', label: '🟡 随堂练习 (Mastery)' },
    { id: 'postClass', label: '🔴 课后巩固 (Assessment)' }
  ];

  const renderBlock = (block, idx) => {
    const blockKey = `${activeTab}-${idx}`;
    const value = answers[blockKey];
    const tbFeedback = feedback[blockKey];
    const isTeacherReview = mode === "review";
    const commonProps = { value: value, readOnly: isTeacherReview, teacherFeedback: !isTeacherReview ? tbFeedback : null, onChange: (val) => onUpdateAnswer(blockKey, val) };

    let component = null;
    switch (block.type) {
      case 'title': component = <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-8">{block.content}</h2>; break;
      case 'info': component = <InfoBlock content={block.content} />; break;
      case 'highlight': component = <HighlightText {...block} {...commonProps} />; break;
      case 'quiz': component = <QuizBlock {...block} {...commonProps} />; break;
      case 'order': component = <OrderingTask {...block} {...commonProps} />; break;
      case 'write': component = <WritingPad {...block} {...commonProps} />; break;
      default: return null;
    }

    return (
      <div key={blockKey}>
        {component}
        {isTeacherReview && ['write', 'quiz', 'highlight', 'order'].includes(block.type) && (
          <div className="mb-6 mt-[-10px] ml-4 border-l-4 border-orange-400 pl-4">
            <textarea placeholder="Leave feedback or grade for this answer..." value={tbFeedback || ""} onChange={(e) => onUpdateFeedback(blockKey, e.target.value)} className="w-full h-20 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm focus:ring-orange-500 outline-none" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-900 font-medium text-sm"><ChevronLeft className="w-5 h-5 mr-1" /> 返回 (Back)</button>
          <div className="font-semibold text-slate-800">{lesson.title}</div>
          <div className="w-24 flex justify-end">
            {mode === 'student' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center"><Save className="w-3 h-3 mr-1"/> Auto-saved</span>}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-slate-900 rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
          <h1 className="text-3xl font-bold mb-3">{lesson.subtitle}</h1>
          <div className="inline-block bg-white/10 px-4 py-2 rounded-lg text-sm font-medium mb-4">Learning Target</div>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">{lesson.target}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>{tab.label}</button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {(lesson.sections[activeTab] || []).map((block, idx) => renderBlock(block, idx))}
        </div>

        <div className="mt-12 flex justify-between items-center pt-6 border-t border-slate-200">
          <button disabled={activeTab === 'preClass'} onClick={() => setActiveTab(tabs[tabs.findIndex(t => t.id === activeTab) - 1].id)} className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'preClass' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>上一部分 (Prev)</button>
          {activeTab !== 'postClass' ? (
            <button onClick={() => setActiveTab(tabs[tabs.findIndex(t => t.id === activeTab) + 1].id)} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition-colors">下一部分 (Next)</button>
          ) : (
            <button onClick={onBack} className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm transition-colors flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> 完成 (Done)</button>
          )}
        </div>
      </main>
    </div>
  );
};

// ==========================================
// 5. Main Application Component
// ==========================================
export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Login State
  const [authMode, setAuthMode] = useState('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('student');
  const [adminSecret, setAdminSecret] = useState('');
  const [authError, setAuthError] = useState('');

  // Data State
  const [lessons, setLessons] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [studentProgress, setStudentProgress] = useState({});

  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [adminTab, setAdminTab] = useState('users'); 
  
  // Edit & Build State
  const [rawLessonText, setRawLessonText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingLessonText, setEditingLessonText] = useState('');

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-center">
        <div className="max-w-2xl bg-white p-10 rounded-2xl shadow-xl border border-red-100">
          <h1 className="text-3xl font-bold text-red-600 mb-4">⚠️ 生产环境缺少真实配置</h1>
          <p className="text-slate-700 text-lg mb-6">缺少环境变量信息，无法连接数据库。</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (err) { console.error("Firebase 匿名登录失败", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { setFirebaseUser(u); setIsInitializing(false); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseUser || !appUser || !db) return;
    
    // 监听课程并执行【智能排序】
    const lessonsRef = collection(db, 'artifacts', appId, 'app_lessons');
    const unsubLessons = onSnapshot(lessonsRef, (snap) => {
      const dbLessons = snap.docs.map(d => d.data());
      let merged = [...DEFAULT_LESSONS];
      dbLessons.forEach(dbl => {
        const index = merged.findIndex(l => l.id === dbl.id);
        if (index > -1) merged[index] = dbl; else merged.push(dbl);
      });
      
      // 1. 过滤掉被软删除的课程
      let activeLessons = merged.filter(l => !l._deleted);
      
      // 2. 智能提取 Lesson X 中的数字进行升序排列
      activeLessons.sort((a, b) => {
        // 使用正则提取标题里的数字，提取不到则默认为 9999 (排到最后面)
        const numA = parseInt((a.title.match(/Lesson\s*(\d+)/i) || [0, 9999])[1], 10);
        const numB = parseInt((b.title.match(/Lesson\s*(\d+)/i) || [0, 9999])[1], 10);
        return numA - numB;
      });

      setLessons(activeLessons);
    });

    const progRef = collection(db, 'artifacts', appId, 'app_progress');
    const unsubProg = onSnapshot(progRef, (snap) => {
      const progObj = {};
      snap.docs.forEach(d => { progObj[d.id] = d.data(); });
      setStudentProgress(progObj);
    });

    let unsubUsers = () => {};
    if (appUser.role === 'teacher' || appUser.role === 'admin') {
      const usersRef = collection(db, 'artifacts', appId, 'app_users');
      unsubUsers = onSnapshot(usersRef, (snap) => {
        const users = snap.docs.map(d => d.data());
        if (appUser.role === 'admin') setAllUsers(users); 
        else setAllUsers(users.filter(u => u.role === 'student' && u.isApproved !== false));
      });
    }

    return () => { unsubLessons(); unsubProg(); unsubUsers(); };
  }, [firebaseUser, appUser]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!usernameInput || !passwordInput) return setAuthError("请填写完整账号和密码。");
    if (!firebaseUser || !db) return setAuthError("数据库尚未准备好，请检查网络。");

    const usernameStr = usernameInput.toLowerCase().trim();
    const userRef = doc(db, 'artifacts', appId, 'app_users', usernameStr);
    
    try {
      const docSnap = await getDoc(userRef);
      if (authMode === 'register') {
        if (docSnap.exists()) return setAuthError("该用户名已被注册，请直接登录。");
        if (roleInput === 'admin' && adminSecret !== 'admin2026') return setAuthError("管理员邀请码错误！(Hint: admin2026)");

        const isApproved = roleInput === 'admin' ? true : false;
        const newUser = { username: usernameStr, password: passwordInput, role: roleInput, isApproved };
        
        await setDoc(userRef, newUser);
        
        if (isApproved) setAppUser(newUser);
        else {
          setAuthMode('login');
          setAuthError("注册成功！您的账号正在等待超级管理员审批，请稍后尝试登录。");
        }
      } else {
        if (!docSnap.exists()) return setAuthError("找不到该用户，请先注册。");
        const data = docSnap.data();
        if (data.password !== passwordInput) return setAuthError("密码错误！");
        if (data.role !== 'admin' && data.isApproved === false) return setAuthError("您的账号正在等待超级管理员审批，请联系管理员。");
        setAppUser(data);
      }
    } catch (err) { setAuthError("安全规则拦截或网络错误导致登录失败。"); }
  };

  const handleToggleApproval = async (username, currentStatus) => {
    try {
      const userRef = doc(db, 'artifacts', appId, 'app_users', username);
      await setDoc(userRef, { isApproved: !currentStatus }, { merge: true });
    } catch (err) { alert("操作失败"); }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`⚠️ 确定要彻底删除用户 ${username} 吗？`)) return;
    try {
      const userRef = doc(db, 'artifacts', appId, 'app_users', username);
      await deleteDoc(userRef);
    } catch (err) { alert("删除失败"); }
  };

  const handleUpdateAnswer = async (lessonId, blockKey, value) => {
    if (appUser.role !== 'student' || !db) return;
    const currentProg = studentProgress[appUser.username] || { answers: {}, feedback: {} };
    const newAnswers = { ...currentProg.answers, [lessonId]: { ...(currentProg.answers[lessonId] || {}), [blockKey]: value } };
    setStudentProgress(prev => ({ ...prev, [appUser.username]: { ...currentProg, answers: newAnswers } }));
    try {
      const progRef = doc(db, 'artifacts', appId, 'app_progress', appUser.username);
      await setDoc(progRef, { answers: newAnswers, feedback: currentProg.feedback || {} }, { merge: true });
    } catch (err) {}
  };

  const handleUpdateFeedback = async (studentName, lessonId, blockKey, value) => {
    if (appUser.role !== 'teacher' && appUser.role !== 'admin' || !db) return;
    const currentProg = studentProgress[studentName] || { answers: {}, feedback: {} };
    const newFeedback = { ...currentProg.feedback, [lessonId]: { ...(currentProg.feedback[lessonId] || {}), [blockKey]: value } };
    try {
      const progRef = doc(db, 'artifacts', appId, 'app_progress', studentName);
      await setDoc(progRef, { answers: currentProg.answers || {}, feedback: newFeedback }, { merge: true });
    } catch (err) {}
  };

  // Admin 功能：跨厂商高可用备课生成 (Gemini 主力 + DeepSeek 兜底)
  const handleGenerateLesson = async () => {
    if (!rawLessonText.trim()) return;
    setIsGenerating(true);
    
    try {
      const systemPrompt = `You are an educational curriculum assistant. Convert the text to this exact JSON schema: { "title": "...", "subtitle": "...", "target": "...", "sections": { "preClass": [], "inClass": [], "postClass": [] } }. Use types: "title", "info", "write", "quiz", "highlight", "order". Return valid JSON only.`;
      
      let generatedJSON = null;

      try {
        // 第一志愿：Google Gemini 2.5 Flash
        const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const geminiPayload = { contents: [{ parts: [{ text: rawLessonText }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { responseMimeType: "application/json" } };
        
        const res1 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(geminiPayload) 
        });
        
        const data1 = await res1.json();
        if (data1.error) throw new Error(data1.error.message);
        
        generatedJSON = JSON.parse(data1.candidates[0].content.parts[0].text);
        
      } catch (err1) {
        console.warn("⚠️ Gemini 主线路拥堵，正在无缝切换至 DeepSeek 备用线路...", err1.message);
        
        // 第二志愿：DeepSeek-V3 兜底
        const dsApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
        if (!dsApiKey) throw new Error("缺少 DeepSeek API Key，无法使用备用线路。");

        const dsPayload = {
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: rawLessonText }
          ],
          response_format: { type: "json_object" }
        };

        const res2 = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${dsApiKey}`
          },
          body: JSON.stringify(dsPayload)
        });

        const data2 = await res2.json();
        if (data2.error) throw new Error("DeepSeek 备用线路也发生拥堵: " + data2.error.message);
        
        generatedJSON = JSON.parse(data2.choices[0].message.content);
      }

      // 【后续通用处理：标题格式化与入库】
      let finalTitle = generatedJSON.title;
      if (!/^Lesson\s*\d+:/i.test(finalTitle)) {
         const nextLessonNum = lessons.length + 1;
         finalTitle = `Lesson ${nextLessonNum}: ${finalTitle.replace(/^Lesson\s*|^\d+[:.]?\s*/i, '')}`;
      }

      const newLesson = { 
        ...generatedJSON, 
        title: finalTitle, 
        id: `lesson_${Date.now()}` 
      };

      if (db) {
        const lessonRef = doc(db, 'artifacts', appId, 'app_lessons', newLesson.id);
        await setDoc(lessonRef, newLesson);
      }
      
      setRawLessonText('');
      setCurrentView('dashboard');
      
    } catch (error) { 
      alert("❌ 解析课件失败，双线均崩溃或配置错误。\n详情: " + error.message); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  // ==========================================
  // Render: Auth & Load
  // ==========================================
  if (isInitializing) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  if (!appUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-10">
            <GraduationCap className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Writing Masterclass</h1>
            <p className="mt-3 text-slate-500">Live Online Production Environment</p>
          </div>
          <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="flex mb-8 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${authMode === 'login' ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`}>登录 (Login)</button>
              <button onClick={() => setAuthMode('register')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${authMode === 'register' ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`}>注册 (Register)</button>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">账号 Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input type="text" value={usernameInput} onChange={e=>setUsernameInput(e.target.value)} className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. nathan_li" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">密码 Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
                </div>
              </div>
              
              {authMode === 'register' && (
                <div className="pt-2 border-t border-slate-100">
                   <label className="block text-sm font-medium text-slate-700 mb-3">我是... I am a...</label>
                   <div className="grid grid-cols-3 gap-2">
                     <label className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-colors ${roleInput === 'student' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                       <input type="radio" checked={roleInput === 'student'} onChange={() => setRoleInput('student')} className="hidden" /> 学生
                     </label>
                     <label className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-colors ${roleInput === 'teacher' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                       <input type="radio" checked={roleInput === 'teacher'} onChange={() => setRoleInput('teacher')} className="hidden" /> 老师
                     </label>
                     <label className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-colors ${roleInput === 'admin' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                       <input type="radio" checked={roleInput === 'admin'} onChange={() => setRoleInput('admin')} className="hidden" /> Admin
                     </label>
                   </div>
                   {roleInput === 'admin' && (
                     <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                       <label className="block text-sm font-bold text-red-700 mb-1">管理员邀请码 (Admin Invite Code)</label>
                       <div className="relative">
                         <KeyRound className="absolute left-3 top-3 h-5 w-5 text-red-400" />
                         <input type="password" value={adminSecret} onChange={e=>setAdminSecret(e.target.value)} className="pl-10 w-full p-3 bg-red-50 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-red-900" placeholder="Secret Key..." />
                       </div>
                     </div>
                   )}
                </div>
              )}
              {authError && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">{authError}</div>}
              <button type="submit" className={`w-full py-3 text-white font-bold rounded-lg transition-all shadow-md mt-4 ${roleInput === 'admin' && authMode === 'register' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {authMode === 'login' ? '进入系统 (Sign In)' : '创建账号 (Create Account)'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Render: Student App
  // ==========================================
  if (appUser.role === 'student') {
    if (currentView === 'lesson' && selectedLesson) {
      const answers = (studentProgress[appUser.username] && studentProgress[appUser.username].answers[selectedLesson.id]) || {};
      const feedback = (studentProgress[appUser.username] && studentProgress[appUser.username].feedback[selectedLesson.id]) || {};
      return <LessonRunner lesson={selectedLesson} answers={answers} feedback={feedback} onUpdateAnswer={(k, v) => handleUpdateAnswer(selectedLesson.id, k, v)} onBack={() => setCurrentView('dashboard')} />;
    }

    return (
      <div className="min-h-screen bg-slate-100 p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {appUser.username}! 👋</h1>
              <p className="text-slate-500 mt-1">Select a lesson below to continue your training.</p>
            </div>
            <button onClick={() => setAppUser(null)} className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors"><LogOut className="w-5 h-5"/> Logout</button>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div key={lesson.id} onClick={() => { setSelectedLesson(lesson); setCurrentView('lesson'); }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                  <BookOpen className="w-7 h-7 stroke-[2.5]" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">{lesson.title}</h3>
                <p className="text-base font-semibold text-indigo-600 mb-8">{lesson.subtitle}</p>
                <div className="flex items-center text-sm font-bold text-slate-400 group-hover:text-indigo-600 mt-auto pt-6 border-t border-slate-50 transition-colors">
                  进入学习 (Start) <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Render: Teacher App
  // ==========================================
  if (appUser.role === 'teacher') {
    if (currentView === 'teacher_review' && selectedStudent && selectedLesson) {
      const answers = (studentProgress[selectedStudent.username] && studentProgress[selectedStudent.username].answers[selectedLesson.id]) || {};
      const feedback = (studentProgress[selectedStudent.username] && studentProgress[selectedStudent.username].feedback[selectedLesson.id]) || {};
      return <LessonRunner lesson={selectedLesson} answers={answers} feedback={feedback} mode="review" onUpdateFeedback={(k, v) => handleUpdateFeedback(selectedStudent.username, selectedLesson.id, k, v)} onBack={() => setCurrentView('dashboard')} />;
    }

    return (
      <div className="min-h-screen bg-slate-100 p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex justify-between items-center bg-indigo-900 text-white p-6 rounded-2xl shadow-lg">
            <div><h1 className="text-3xl font-extrabold tracking-tight">Teacher Portal</h1><p className="text-indigo-200 mt-1">查看学生进度并进行批改 (Review & Grade)</p></div>
            <button onClick={() => setAppUser(null)} className="flex items-center gap-2 text-indigo-200 hover:text-white transition-colors"><LogOut className="w-5 h-5"/> 退出系统</button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <div className="font-bold text-lg text-slate-800 mb-6 border-b border-slate-100 pb-4">我的学生 (Approved Students)</div>
              <div className="space-y-3">
                {allUsers.length === 0 ? <p className="text-slate-500 text-sm">暂无获批学生。</p> : null}
                {allUsers.map(stu => (
                  <button key={stu.username} onClick={() => setSelectedStudent(stu)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedStudent?.username === stu.username ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'}`}>
                    <div className="font-semibold">{stu.username}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              {selectedStudent ? (
                <>
                  <h2 className="font-bold text-2xl text-slate-800 mb-2">{selectedStudent.username} 的作业进度</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {lessons.map(lesson => {
                      const hasStarted = studentProgress[selectedStudent.username]?.answers?.[lesson.id];
                      return (
                        <div key={lesson.id} onClick={() => { setSelectedLesson(lesson); setCurrentView('teacher_review'); }} className="p-5 border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group bg-slate-50">
                          <h3 className="font-bold text-slate-800 mb-1">{lesson.title}</h3>
                          <div className="flex justify-between items-center text-sm font-medium mt-4">
                            {hasStarted ? <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> 已提交</span> : <span className="text-slate-400">未开始</span>}
                            <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">点击批改 &rarr;</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
                  <Users className="w-16 h-16 mb-4 text-slate-200" />
                  <p>在左侧选择一名学生以查看其作业</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Render: Admin App
  // ==========================================
  if (appUser.role === 'admin') {
    if (currentView === 'teacher_build') {
      return (
        <div className="min-h-screen bg-slate-50 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-3"><Sparkles className="text-yellow-400 w-6 h-6" /><h2 className="text-xl font-bold">AI Lesson Builder (Admin)</h2></div>
              <button onClick={() => setCurrentView('dashboard')} className="text-slate-300 hover:text-white">取消 (Cancel)</button>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <textarea value={rawLessonText} onChange={(e) => setRawLessonText(e.target.value)} placeholder="Paste lesson text here..." className="w-full flex-grow p-4 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm mb-6" />
              <button onClick={handleGenerateLesson} disabled={isGenerating || !rawLessonText.trim()} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-slate-400">
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} {isGenerating ? "Analyzing & Building..." : "生成并发布课程 (Generate)"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (currentView === 'teacher_edit_lesson') {
      return (
        <div className="min-h-screen bg-slate-50 p-8">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-indigo-900 text-white">
              <div className="flex items-center gap-3"><FileEdit className="text-indigo-300 w-6 h-6" /><h2 className="text-xl font-bold">编辑课程源码 (Admin Override)</h2></div>
              <button onClick={() => setCurrentView('dashboard')} className="text-indigo-200 hover:text-white">放弃修改 (Cancel)</button>
            </div>
            <div className="p-6 flex-grow flex flex-col bg-slate-50">
              <textarea value={editingLessonText} onChange={(e) => setEditingLessonText(e.target.value)} className="w-full flex-grow p-4 bg-slate-900 text-green-400 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-[13px] leading-relaxed mb-6 shadow-inner" spellCheck="false" />
              <button onClick={handleSaveEditedLesson} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"><Save className="w-5 h-5" /> 保存并覆盖此课程 (Save Changes)</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-100 p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center"><ShieldCheck className="w-7 h-7 text-white" /></div>
              <div><h1 className="text-3xl font-extrabold tracking-tight">Super Admin Console</h1><p className="text-slate-400 mt-1">系统全局控制中心</p></div>
            </div>
            <button onClick={() => setAppUser(null)} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors"><LogOut className="w-5 h-5"/> 安全退出</button>
          </header>

          <div className="flex gap-4 mb-6">
            <button onClick={() => setAdminTab('users')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${adminTab === 'users' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}><Users className="w-5 h-5" /> 用户与审批管理</button>
            <button onClick={() => setAdminTab('lessons')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${adminTab === 'lessons' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}><Library className="w-5 h-5" /> 核心课程库管理</button>
          </div>

          {adminTab === 'users' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 animate-in fade-in">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div className="font-bold text-xl text-slate-800">系统用户列表 (Total: {allUsers.length})</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                      <th className="p-4 font-semibold rounded-tl-xl">Username</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right rounded-tr-xl">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => {
                      const isApproved = u.isApproved !== false; 
                      return (
                        <tr key={u.username} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-800">{u.username}</td>
                          <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'teacher' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>{u.role.toUpperCase()}</span></td>
                          <td className="p-4">{isApproved ? <span className="flex items-center gap-1 text-green-600 text-sm font-bold"><CheckCircle2 className="w-4 h-4"/> 正常 (Approved)</span> : <span className="flex items-center gap-1 text-orange-500 text-sm font-bold"><Clock className="w-4 h-4"/> 待审 (Pending)</span>}</td>
                          <td className="p-4 flex justify-end gap-2">
                            {u.role !== 'admin' && (
                              <>
                                <button onClick={() => handleToggleApproval(u.username, isApproved)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isApproved ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>{isApproved ? '封禁/撤销' : '✅ 批准通过'}</button>
                                <button onClick={() => handleDeleteUser(u.username)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="彻底删除账号"><Trash2 className="w-5 h-5"/></button>
                              </>
                            )}
                            {u.role === 'admin' && <span className="text-slate-400 text-sm italic">System Protected</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === 'lessons' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 animate-in fade-in">
               <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                 <div className="font-bold text-xl text-slate-800">课程核心数据 ({lessons.length} 节)</div>
                 <button onClick={() => setCurrentView('teacher_build')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold transition-colors shadow-sm"><Sparkles className="w-4 h-4" /> AI 一键新建课程</button>
               </div>
               <div className="space-y-4">
                 {lessons.map(lesson => (
                   <div key={lesson.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors gap-4">
                     <div>
                       <h3 className="font-bold text-slate-900 text-lg">{lesson.title}</h3>
                       <p className="text-slate-500 text-sm mt-1">{lesson.subtitle} • ID: {lesson.id}</p>
                     </div>
                     <div className="flex gap-2 w-full md:w-auto">
                       <button onClick={() => { setEditingLessonText(JSON.stringify(lesson, null, 2)); setCurrentView('teacher_edit_lesson'); }} className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition-colors font-medium text-sm"><FileEdit className="w-4 h-4" /> 源码级修改</button>
                       <button onClick={() => handleDeleteLesson(lesson.id)} className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"><Trash2 className="w-4 h-4" /> 强制下架</button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  return null;
}