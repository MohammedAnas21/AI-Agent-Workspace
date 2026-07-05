import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  FileText,
  CheckSquare,
  Bell,
  Calendar,
  Plus,
  Trash2,
  Check,
  MapPin,
  Clock,
  Search,
  BookOpen,
  CalendarDays
} from 'lucide-react';

export const ProductivityHub: React.FC = () => {
  const {
    notes,
    todos,
    reminders,
    calendarEvents,
    addNote,
    updateNote,
    deleteNote,
    addTodo,
    toggleTodo,
    deleteTodo,
    addReminder,
    toggleReminder,
    deleteReminder,
    addCalendarEvent,
    deleteCalendarEvent
  } = useWorkspace();

  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'todos' | 'reminders' | 'calendar'>('notes');

  // Notes Form State
  const [noteSearch, setNoteSearch] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // Todo Form State
  const [todoText, setTodoText] = useState('');
  const [todoPriority, setTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [todoDueDate, setTodoDueDate] = useState('');

  // Reminder Form State
  const [reminderText, setReminderText] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  // Calendar Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  const currentSelectedNote = notes.find(n => n.id === selectedNoteId);

  useEffect(() => {
    if (notes.length > 0 && !notes.find(n => n.id === selectedNoteId)) {
      setSelectedNoteId(notes[0].id);
    } else if (notes.length === 0) {
      setSelectedNoteId(null);
    }
  }, [notes]);

  // ----------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------

  const handleCreateNote = () => {
    if (newNoteTitle.trim()) {
      addNote(newNoteTitle.trim(), 'Start typing note details...');
      setNewNoteTitle('');
      setIsCreatingNote(false);
      if (notes.length > 0) {
        setSelectedNoteId(notes[0].id);
      }
    }
  };

  const handleUpdateNoteBody = (body: string) => {
    if (currentSelectedNote) {
      updateNote(currentSelectedNote.id, currentSelectedNote.title, body);
    }
  };

  const handleUpdateNoteTitle = (title: string) => {
    if (currentSelectedNote) {
      updateNote(currentSelectedNote.id, title, currentSelectedNote.content);
    }
  };

  const handleAddTodoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (todoText.trim()) {
      addTodo(todoText.trim(), todoPriority, todoDueDate || undefined);
      setTodoText('');
      setTodoDueDate('');
    }
  };

  const handleAddReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reminderText.trim() && reminderTime) {
      addReminder(reminderText.trim(), reminderTime);
      setReminderText('');
      setReminderTime('');
    }
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventTitle.trim() && eventTime) {
      addCalendarEvent(eventTitle.trim(), eventTime, eventDesc || undefined, eventLocation || undefined);
      setEventTitle('');
      setEventTime('');
      setEventLocation('');
      setEventDesc('');
    }
  };

  const renderNotesView = () => {
    const filteredNotes = notes.filter(n =>
      n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(noteSearch.toLowerCase())
    );

    return (
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Note List */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-neutral-250 flex flex-col bg-white/45 shrink-0 h-48 md:h-full">
          <div className="p-3 border-b border-neutral-200">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-450" />
              <input
                type="text"
                placeholder="Search notes..."
                value={noteSearch}
                onChange={e => setNoteSearch(e.target.value)}
                className="w-full bg-white border border-neutral-350 rounded-xl py-1.5 pl-8 pr-3 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
              />
            </div>
            {isCreatingNote ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Note Title..."
                  value={newNoteTitle}
                  onChange={e => setNewNoteTitle(e.target.value)}
                  className="flex-1 bg-white border border-neutral-350 rounded-xl px-2.5 py-1 text-xs text-black focus:outline-none focus:border-black"
                  autoFocus
                />
                <button
                  onClick={handleCreateNote}
                  className="bg-black text-white rounded-xl px-3 py-1 text-xs font-semibold cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingNote(true)}
                className="w-full py-1.5 rounded-xl border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50/50 text-neutral-800 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> New notepad Note
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-none">
            {filteredNotes.length === 0 ? (
              <p className="text-[11px] text-neutral-450 font-mono italic text-center py-8">No notes created yet</p>
            ) : (
              filteredNotes.map(n => (
                <div
                  key={n.id}
                  onClick={() => setSelectedNoteId(n.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition-all ${
                    selectedNoteId === n.id
                      ? 'bg-white border border-neutral-300/80 shadow-2xs'
                      : 'hover:bg-white/40'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-neutral-800 truncate">{n.title}</p>
                    <p className="text-[10px] text-neutral-450 truncate mt-0.5">{n.content}</p>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteNote(n.id);
                      if (selectedNoteId === n.id) setSelectedNoteId(null);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-neutral-400 transition-opacity shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Note Editor */}
        <div className="flex-1 flex flex-col bg-[#EDEDED] p-6 overflow-y-auto">
          {currentSelectedNote ? (
            <div className="h-full flex flex-col">
              <input
                type="text"
                value={currentSelectedNote.title}
                onChange={e => handleUpdateNoteTitle(e.target.value)}
                className="bg-transparent text-black font-semibold text-xl tracking-tight focus:outline-none border-b border-transparent focus:border-neutral-300 pb-2 mb-4"
              />
              <span className="text-[10px] font-mono text-neutral-450 mb-4 block">
                Last modified: {new Date(currentSelectedNote.updatedAt).toLocaleString()}
              </span>
              <textarea
                value={currentSelectedNote.content}
                onChange={e => handleUpdateNoteBody(e.target.value)}
                className="flex-1 bg-transparent text-neutral-750 text-sm leading-relaxed focus:outline-none resize-none w-full font-sans"
                placeholder="Write your creative ideas, project blueprints, or journal entries here..."
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-neutral-250 mb-3 text-neutral-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-neutral-800">No active note selected</p>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-xs leading-relaxed font-sans">
                Choose a note from the left sidebar or start a new notepad note to keep track of tasks.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTodosView = () => (
      <div className="flex-1 overflow-y-auto bg-[#EDEDED] px-6 py-8 md:px-12 md:py-10 scrollbar-none">
        <div className="max-w-2xl mx-auto">
          {/* Add Todo Form */}
          <form onSubmit={handleAddTodoSubmit} className="bg-white border border-neutral-200 p-4 rounded-2xl mb-6 shadow-2xs">
            <h3 className="text-xs font-semibold text-neutral-800 mb-3 font-sans">Add New Task Item</h3>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="What needs to be accomplished today?"
                value={todoText}
                onChange={e => setTodoText(e.target.value)}
                className="flex-1 bg-neutral-50 border border-neutral-250 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-neutral-450"
                required
              />
              <div className="flex gap-2">
                <select
                  value={todoPriority}
                  onChange={e => setTodoPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="bg-neutral-50 border border-neutral-250 rounded-xl px-2.5 py-2 text-[11px] text-neutral-600 focus:outline-none font-sans"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input
                  type="date"
                  value={todoDueDate}
                  onChange={e => setTodoDueDate(e.target.value)}
                  className="bg-neutral-50 border border-neutral-250 rounded-xl px-2 py-2 text-[11px] text-neutral-600 focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white hover:bg-neutral-850 rounded-xl font-semibold text-xs transition-all shrink-0 cursor-pointer active:scale-97"
                >
                  Add Task
                </button>
              </div>
            </div>
          </form>

          {/* List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-neutral-800 font-sans">Active Tasks ({todos.length})</h3>
            {todos.length === 0 ? (
              <div className="border border-neutral-300 rounded-2xl p-8 text-center bg-white/40">
                <p className="text-xs text-neutral-500 font-mono italic">No tasks created yet</p>
              </div>
            ) : (
              todos.map(t => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 transition-all shadow-2xs ${
                    t.completed ? 'bg-white/40 opacity-65' : 'bg-white hover:bg-neutral-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleTodo(t.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        t.completed ? 'bg-black border-black text-white' : 'border-neutral-300 hover:border-neutral-450'
                      }`}
                    >
                      {t.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold text-neutral-800 ${t.completed ? 'line-through text-neutral-400' : ''}`}>
                        {t.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-mono border uppercase tracking-wider ${
                          t.priority === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          t.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-neutral-100 text-neutral-700 border-neutral-250'
                        }`}>
                          {t.priority}
                        </span>
                        {t.dueDate && (
                          <span className="text-[9px] font-mono text-neutral-450">Due: {t.dueDate}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTodo(t.id)}
                    className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );

  const renderRemindersView = () => (
      <div className="flex-1 overflow-y-auto bg-[#EDEDED] px-6 py-8 md:px-12 md:py-10 scrollbar-none">
        <div className="max-w-xl mx-auto">
          {/* Add Reminder Form */}
          <form onSubmit={handleAddReminderSubmit} className="bg-white border border-neutral-200 p-4 rounded-2xl mb-6 shadow-2xs">
            <h3 className="text-xs font-semibold text-neutral-800 mb-3 font-sans">Set Alert Reminder</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="What do you need to be reminded of?"
                value={reminderText}
                onChange={e => setReminderText(e.target.value)}
                className="bg-neutral-50 border border-neutral-250 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-neutral-450"
                required
              />
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  className="flex-1 bg-neutral-50 border border-neutral-250 rounded-xl px-3 py-2 text-xs text-neutral-600 focus:outline-none font-mono"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white hover:bg-neutral-850 rounded-xl font-semibold text-xs transition-all shrink-0 cursor-pointer active:scale-97 shadow-xs"
                >
                  Set Alarm
                </button>
              </div>
            </div>
          </form>

          {/* List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-neutral-800 font-sans">Configured Reminders ({reminders.length})</h3>
            {reminders.length === 0 ? (
              <div className="border border-neutral-300 rounded-2xl p-8 text-center bg-white/40">
                <p className="text-xs text-neutral-500 font-mono italic">No alarms set yet</p>
              </div>
            ) : (
              reminders.map(r => (
                <div
                  key={r.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 transition-all shadow-2xs ${
                    r.completed ? 'bg-white/40 opacity-65' : 'bg-white hover:bg-neutral-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleReminder(r.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        r.completed ? 'bg-black border-black text-white' : 'border-neutral-300 hover:border-neutral-450'
                      }`}
                    >
                      {r.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold text-neutral-800 ${r.completed ? 'line-through text-neutral-400' : ''}`}>
                        {r.text}
                      </p>
                      <div className="flex items-center gap-1.5 text-neutral-400 mt-1">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span className="text-[10px] font-mono">{new Date(r.datetime).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );

  const renderCalendarView = () => (
      <div className="flex-1 overflow-y-auto bg-[#EDEDED] px-6 py-8 md:px-12 md:py-10 scrollbar-none">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Left Side: Planner Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleAddEventSubmit} className="bg-white border border-neutral-200 p-4 rounded-2xl shadow-2xs">
              <h3 className="text-xs font-semibold text-neutral-800 mb-3 font-sans">Schedule Calendar Event</h3>
              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-mono text-neutral-450 uppercase tracking-wider block mb-1 font-semibold">Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Marketing Sync with Agent"
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-450 uppercase tracking-wider block mb-1 font-semibold">Time & Date</label>
                  <input
                    type="datetime-local"
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded-xl px-3 py-2 text-xs text-neutral-600 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-450 uppercase tracking-wider block mb-1 font-semibold">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Google Meet / AI Workspace"
                    value={eventLocation}
                    onChange={e => setEventLocation(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-450 uppercase tracking-wider block mb-1 font-semibold">Brief Description</label>
                  <textarea
                    placeholder="Describe agenda or instructions..."
                    value={eventDesc}
                    onChange={e => setEventDesc(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black resize-none h-16"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-black text-white hover:bg-neutral-850 rounded-xl font-semibold text-xs transition-all cursor-pointer active:scale-98"
                >
                  Confirm Event
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: Agenda List */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-800 mb-2 font-sans">Upcoming Workspace Schedule ({calendarEvents.length})</h3>
            
            {calendarEvents.length === 0 ? (
              <div className="border border-neutral-350 rounded-2xl p-12 text-center bg-white/40 flex flex-col items-center">
                <CalendarDays className="w-8 h-8 text-neutral-400 mb-2" />
                <p className="text-xs text-neutral-450 font-mono italic">No events scheduled on calendar</p>
              </div>
            ) : (
              [...calendarEvents].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()).map(evt => (
                <div
                  key={evt.id}
                  className="group relative flex items-start justify-between p-4 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-300 transition-all shadow-2xs"
                >
                  <div className="space-y-1.5 min-w-0 pr-4">
                    <p className="text-xs font-bold text-neutral-850 truncate">{evt.title}</p>
                    <div className="flex flex-col gap-1 text-[10px] text-neutral-450 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 shrink-0 text-black" />
                        <span>{new Date(evt.datetime).toLocaleString()}</span>
                      </div>
                      {evt.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 shrink-0 text-black" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                    </div>
                    {evt.description && (
                      <p className="text-[11px] text-neutral-550 leading-relaxed pt-1 font-sans">{evt.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteCalendarEvent(evt.id)}
                    className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col bg-[#EDEDED] h-full overflow-hidden">
      
      {/* Sub tabs header bar */}
      <div className="px-4 md:px-6 py-3.5 border-b border-neutral-200 bg-[#E5E5E5]/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-1.5 mt-6 md:mt-0">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-neutral-250 text-neutral-850 border border-neutral-300">
            Work Hub
          </span>
          <h2 className="text-sm font-semibold text-neutral-850 tracking-tight font-sans">Productivity Suite</h2>
        </div>

        <div className="flex bg-neutral-200/60 p-1 rounded-xl border border-neutral-300 overflow-x-auto max-w-full scrollbar-none shrink-0 gap-1">
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'notes' ? 'bg-white text-black shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Notes
          </button>
          <button
            onClick={() => setActiveSubTab('todos')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'todos' ? 'bg-white text-black shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            To-Do List
          </button>
          <button
            onClick={() => setActiveSubTab('reminders')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'reminders' ? 'bg-white text-black shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Reminders
          </button>
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'calendar' ? 'bg-white text-black shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Calendar
          </button>
        </div>
      </div>

      {/* Main Module Panel */}
      <div className="flex-1 overflow-hidden flex">
        {activeSubTab === 'notes' && renderNotesView()}
        {activeSubTab === 'todos' && renderTodosView()}
        {activeSubTab === 'reminders' && renderRemindersView()}
        {activeSubTab === 'calendar' && renderCalendarView()}
      </div>
    </div>
  );
};
