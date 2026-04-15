import React, { useSyncExternalStore } from 'react'
import { AnimatePresence } from 'framer-motion'
import { store } from './store/store.js'
import WelcomeView from './views/WelcomeView.jsx'
import ChatView from './views/ChatView.jsx'
import NewProjectView from './views/NewProjectView.jsx'
import ProjectView from './views/ProjectView.jsx'

export default function App() {
  const { activeView } = useSyncExternalStore(store.subscribe, store.getSnapshot)

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#2C2522' }}>
      <AnimatePresence mode="wait">
        {activeView === 'welcome' && <WelcomeView key="welcome" />}
        {activeView === 'chat' && <ChatView key="chat" />}
        {activeView === 'new-project' && <NewProjectView key="new-project" />}
        {activeView === 'project' && <ProjectView key="project" />}
      </AnimatePresence>
    </div>
  )
}
