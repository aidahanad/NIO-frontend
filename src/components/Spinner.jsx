import React from 'react'
import { motion } from 'framer-motion'

export default function Spinner({ size = 28 }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        border: `2.5px solid rgba(232,139,102,0.15)`,
        borderTopColor: '#E88B66',
      }}
    />
  )
}
