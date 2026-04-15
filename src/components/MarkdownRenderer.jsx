import React from 'react'

function renderInline(text) {
  const parts = []
  const re = /\*\*(.+?)\*\*/g
  let last = 0, m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(<strong key={m.index} style={{ color: '#fff', fontWeight: 600 }}>{m[1]}</strong>)
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length ? parts : text
}

export default function MarkdownRenderer({ content = '' }) {
  const lines = content.split('\n')
  const els = []
  let key = 0

  for (const line of lines) {
    if (line.startsWith('## ')) {
      els.push(<p key={key++} style={{ color: '#E88B66', fontSize: '1rem', fontWeight: 700, marginTop: 14, marginBottom: 4 }}>{line.slice(3)}</p>)
    } else if (line.startsWith('### ')) {
      els.push(<p key={key++} style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, marginTop: 10, marginBottom: 4 }}>{line.slice(4)}</p>)
    } else if (line.trim() === '---') {
      els.push(<hr key={key++} style={{ border: 'none', borderTop: '1px solid rgba(168,158,154,0.2)', margin: '10px 0' }} />)
    } else if (line.startsWith('- ')) {
      els.push(
        <div key={key++} style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
          <span style={{ color: '#E88B66', flexShrink: 0 }}>•</span>
          <span style={{ fontSize: '0.85rem' }}>{renderInline(line.slice(2))}</span>
        </div>
      )
    } else if (/^\d+\.\s/.test(line)) {
      const [num, ...rest] = line.split(/\.\s(.+)/)
      els.push(
        <div key={key++} style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
          <span style={{ color: '#E88B66', fontWeight: 700, flexShrink: 0, minWidth: 16 }}>{num}.</span>
          <span style={{ fontSize: '0.85rem' }}>{renderInline(rest[0] || '')}</span>
        </div>
      )
    } else if (line.trim() === '') {
      els.push(<div key={key++} style={{ height: 6 }} />)
    } else {
      els.push(<p key={key++} style={{ fontSize: '0.85rem', lineHeight: 1.65, marginBottom: 2 }}>{renderInline(line)}</p>)
    }
  }

  return <div style={{ color: '#fff' }}>{els}</div>
}
