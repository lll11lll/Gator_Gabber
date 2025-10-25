import React from 'react';
// CREATE CSS FILE FOR MB TAILWIND? BOOTSTRAP? DEFAULT CSS? 
//import './MessageBubble.css'; // Make sure this file exists, or comment it out for now

// ADDED - Fix: Import from 'react-icons/fa' which is the Font Awesome icon set
import { FaUser, FaRobot, FaGlobe } from 'react-icons/fa'; 
import {FaRepeat} from 'react-icons/fa6';
import { LuTurtle } from "react-icons/lu";

// creates div to display onto screen
// ADDED - Feature 1: Component now accepts 'id' and new event handlers
const MessageBubble = ({ id, role, text, onRepeat, onSlow, onTranslate }) => {
  const isUser = role === 'user';
  const bubbleClass = isUser ? 'bubble-user' : 'bubble-assistant';
  
  // ADDED - Fix: This code now works because the icons are imported correctly
  const icon = isUser ? <FaUser /> : <FaRobot />;

  return (
    <div className={`bubble-container ${isUser ? 'align-right' : 'align-left'}`}>
      <div className="bubble-icon">{icon}</div>
      <div className={`bubble ${bubbleClass}`}>
        {text}

        {/* ADDED - Feature 1: Container for action buttons, shown only for AI messages */}
        {role === 'assistant' && text !== '...' && (
          <div className="action-buttons">
            {/* ADDED - Feature 1: "Repeat" button */}
            <button onClick={() => onRepeat(text)} title="Repeat">
              <FaRepeat />
            </button>
            {/* ADDED - Feature 1: "Slow" button */}
            <button onClick={() => onSlow(text)} title="Slow">
              <LuTurtle />
            </button>
            {/* ADDED - Feature 1: "Translate" button (passes message ID) */}
            <button onClick={() => onTranslate(text, id)} title="Translate">
              <FaGlobe />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;