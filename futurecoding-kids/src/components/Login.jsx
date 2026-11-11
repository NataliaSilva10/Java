import React, { useState } from 'react';
import { hashPin } from '../lib/storage.js';

const AVATARS = ['🦊', '🐼', '🐙', '🦄', '🐸', '🐯', '🦖', '🤖', '🚀', '🐱', '🐧', '🦉'];

export default function Login({ users, onLogin, onCreate }) {
  const [mode, setMode] = useState(users.length ? 'pick' : 'new');
  const [picked, setPicked] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [newPin, setNewPin] = useState('');

  const tryLogin = (e) => {
    e.preventDefault();
    if (hashPin(pin) === picked.pinHash) onLogin(picked.id);
    else {
      setError('That PIN doesn’t match. Try again!');
      setPin('');
    }
  };

  const create = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Pick a name to use.');
    if (!/^\d{4}$/.test(newPin)) return setError('Your PIN needs exactly 4 numbers.');
    onCreate({ name, avatar, pin: newPin });
  };

  return (
    <main className="login">
      <div className="brand">
        <span className="brand-mark">{'</>'}</span>
        <h1>FutureCoding Kids</h1>
        <p>Learn to code, one mission at a time.</p>
      </div>

      {mode === 'pick' && !picked && (
        <section className="card">
          <h2>Who&rsquo;s coding today?</h2>
          <div className="profiles">
            {users.map((u) => (
              <button key={u.id} className="profile" onClick={() => { setPicked(u); setError(''); setPin(''); }}>
                <span className="avatar big">{u.avatar}</span>
                <span>{u.name}</span>
              </button>
            ))}
            <button className="profile add" onClick={() => { setMode('new'); setError(''); }}>
              <span className="avatar big">＋</span>
              <span>New explorer</span>
            </button>
          </div>
        </section>
      )}

      {mode === 'pick' && picked && (
        <form className="card narrow" onSubmit={tryLogin}>
          <span className="avatar big">{picked.avatar}</span>
          <h2>Hi, {picked.name}!</h2>
          <label htmlFor="pin">Enter your 4-number PIN</label>
          <input
            id="pin"
            className="pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
            autoFocus
          />
          {error && <p className="error" role="alert">{error}</p>}
          <div className="row">
            <button type="button" className="btn ghost" onClick={() => { setPicked(null); setError(''); }}>Back</button>
            <button className="btn" disabled={pin.length !== 4}>Let&rsquo;s go</button>
          </div>
        </form>
      )}

      {mode === 'new' && (
        <form className="card narrow" onSubmit={create}>
          <h2>Create your explorer</h2>
          <label htmlFor="name">Your first name or nickname</label>
          <input id="name" value={name} maxLength={16} onChange={(e) => { setName(e.target.value); setError(''); }} autoFocus />
          <label>Pick your buddy</label>
          <div className="avatars" role="radiogroup" aria-label="Avatar">
            {AVATARS.map((a) => (
              <button
                type="button"
                key={a}
                role="radio"
                aria-checked={avatar === a}
                className={`avatar-opt ${avatar === a ? 'on' : ''}`}
                onClick={() => setAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>
          <label htmlFor="newpin">Make a secret 4-number PIN</label>
          <input
            id="newpin"
            className="pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={newPin}
            onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, '')); setError(''); }}
          />
          <p className="fine">Tip: use a nickname, not your full name.</p>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="row">
            {users.length > 0 && (
              <button type="button" className="btn ghost" onClick={() => { setMode('pick'); setError(''); }}>Back</button>
            )}
            <button className="btn">Start coding</button>
          </div>
        </form>
      )}
    </main>
  );
}
