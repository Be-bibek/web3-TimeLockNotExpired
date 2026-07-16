# ⏳ StellarFlow — Time-Locked Escrow Vault

> **Lock your XLM in a cryptographically enforced time-locked smart contract on Stellar Testnet. Not even you can touch it until the time expires.**

[![CI/CD Pipeline](https://github.com/Be-bibek/web3-TimeLockNotExpired/actions/workflows/ci.yml/badge.svg)](https://github.com/Be-bibek/web3-TimeLockNotExpired/actions)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-blue)](https://testnet.steexp.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Table of Contents
- [What It Does](#-what-it-does)
- [Smart Contract Architecture](#-smart-contract-architecture)
  - [Escrow Contract](#1-escrow-contract)
  - [Policy Contract](#2-policy-contract)
  - [Transaction Flow Diagram](#-transaction-flow)
  - [Cross-Contract Auth Flow](#-cross-contract-authorization-flow)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Testing](#-testing)

---

## 🔐 What It Does

StellarFlow Vault allows users to **lock XLM in a Soroban smart contract** with a strict time lock. The funds are:
- **Completely inaccessible** until the time lock expires — even by the depositor
- **Protected by cross-contract policy** — a second smart contract enforces the withdrawal rules
- **Fully on-chain** — no centralized backend; all logic lives in Soroban contracts on Stellar

**Real Example:** Lock 50 XLM for 10 years → The blockchain guarantees no one can touch those funds until 2036.

---

## 🏗 Smart Contract Architecture

This project deploys **two interconnected Soroban smart contracts** on Stellar Testnet.

### 1. Escrow Contract
**Address:** `CCQYG4ISLQD4KOSGWEN3YBP5FOLIT34V2EMJVKRERW2ZC5AE6JPSUCCR`

[🔍 View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCQYG4ISLQD4KOSGWEN3YBP5FOLIT34V2EMJVKRERW2ZC5AE6JPSUCCR)

This is the **main vault contract**. It stores the user's XLM balance and the timestamp of when it was locked. It has two public functions:

| Function | Arguments | Description |
|---|---|---|
| `deposit(user, amount, unlock_time)` | `Address`, `i128`, `u64` | Locks XLM into the vault with a specific UNIX timestamp unlock time |
| `withdraw(user, policy)` | `Address`, `Address` | Withdraws funds **only after** calling the Policy contract for authorization |

**Custom Error Codes (L2):**
| Error Code | Name | Meaning |
|---|---|---|
| `#1` | `InsufficientFunds` | No balance is locked in escrow for this user |
| `#2` | `TimeLockNotExpired` | The time lock is still active — withdrawal blocked |
| `#3` | `UnauthorizedPolicy` | The policy contract rejected the withdrawal |

```svg
<svg viewBox="0 0 700 300" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;border-radius:12px;background:#0f1117">
  <!-- Background -->
  <rect width="700" height="300" fill="#0f1117" rx="12"/>
  
  <!-- Title -->
  <text x="350" y="32" font-family="monospace" font-size="14" fill="#a78bfa" text-anchor="middle" font-weight="bold">ESCROW CONTRACT — CCQYG4...UCCR</text>

  <!-- Contract Box -->
  <rect x="200" y="55" width="300" height="200" rx="10" fill="#1e1b4b" stroke="#7c3aed" stroke-width="2"/>
  <text x="350" y="78" font-family="monospace" font-size="11" fill="#c4b5fd" text-anchor="middle">📦 Storage</text>
  <rect x="220" y="85" width="260" height="50" rx="6" fill="#312e81"/>
  <text x="350" y="104" font-family="monospace" font-size="10" fill="#e2e8f0" text-anchor="middle">balance: Map&lt;Address, i128&gt;</text>
  <text x="350" y="122" font-family="monospace" font-size="10" fill="#e2e8f0" text-anchor="middle">unlock_time: Map&lt;Address, u64&gt;</text>

  <!-- deposit function -->
  <rect x="220" y="148" width="120" height="40" rx="6" fill="#065f46" stroke="#34d399" stroke-width="1.5"/>
  <text x="280" y="165" font-family="monospace" font-size="9" fill="#34d399" text-anchor="middle" font-weight="bold">fn deposit()</text>
  <text x="280" y="180" font-family="monospace" font-size="8" fill="#a7f3d0" text-anchor="middle">user, amount, unlock_time</text>

  <!-- withdraw function -->
  <rect x="360" y="148" width="120" height="40" rx="6" fill="#7f1d1d" stroke="#f87171" stroke-width="1.5"/>
  <text x="420" y="165" font-family="monospace" font-size="9" fill="#f87171" text-anchor="middle" font-weight="bold">fn withdraw()</text>
  <text x="420" y="180" font-family="monospace" font-size="8" fill="#fca5a5" text-anchor="middle">user, policy_addr</text>

  <!-- Error codes -->
  <text x="350" y="218" font-family="monospace" font-size="9" fill="#94a3b8" text-anchor="middle">Errors: #1 InsufficientFunds</text>
  <text x="350" y="232" font-family="monospace" font-size="9" fill="#94a3b8" text-anchor="middle">#2 TimeLockNotExpired  #3 UnauthorizedPolicy</text>

  <!-- Left arrow (User → deposit) -->
  <line x1="40" y1="168" x2="195" y2="168" stroke="#34d399" stroke-width="1.5" stroke-dasharray="5,3"/>
  <polygon points="195,163 207,168 195,173" fill="#34d399"/>
  <text x="20" y="150" font-family="monospace" font-size="10" fill="#34d399">User</text>
  <text x="15" y="163" font-family="monospace" font-size="10" fill="#34d399">Wallet</text>

  <!-- Right arrow (withdraw → Policy) -->
  <line x1="507" y1="168" x2="640" y2="168" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="5,3"/>
  <polygon points="640,163 652,168 640,173" fill="#f59e0b"/>
  <text x="648" y="155" font-family="monospace" font-size="10" fill="#f59e0b">Policy</text>
  <text x="645" y="168" font-family="monospace" font-size="10" fill="#f59e0b">Contract</text>
  <text x="645" y="181" font-family="monospace" font-size="10" fill="#f59e0b">↓</text>
  <text x="636" y="194" font-family="monospace" font-size="10" fill="#f59e0b">is_auth()</text>

  <!-- Network badge -->
  <rect x="240" y="248" width="220" height="22" rx="6" fill="#1e293b"/>
  <text x="350" y="263" font-family="monospace" font-size="9" fill="#64748b" text-anchor="middle">🌐 Stellar Soroban Testnet</text>
</svg>
```

---

### 2. Policy Contract
**Address:** `CCIHX5MY44KTE3MKLUIAOYGBA3NHRF6DTPPGVSDHQPZHGRVCCNMOU7VE`

[🔍 View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCIHX5MY44KTE3MKLUIAOYGBA3NHRF6DTPPGVSDHQPZHGRVCCNMOU7VE)

This is the **governance/authorization contract** (L3 Cross-Contract Architecture). When the Escrow contract receives a `withdraw` call, it does NOT immediately pay out. Instead, it first calls this Policy contract's `is_auth` function and only proceeds if authorization is granted.

| Function | Arguments | Description |
|---|---|---|
| `is_auth(user)` | `Address` | Returns `true` if the caller is authorized to receive the withdrawal |

```svg
<svg viewBox="0 0 700 280" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;border-radius:12px;background:#0f1117">
  <!-- Background -->
  <rect width="700" height="280" fill="#0f1117" rx="12"/>

  <!-- Title -->
  <text x="350" y="32" font-family="monospace" font-size="14" fill="#f59e0b" text-anchor="middle" font-weight="bold">POLICY CONTRACT — CCIHX5...U7VE</text>

  <!-- Contract Box -->
  <rect x="220" y="55" width="260" height="170" rx="10" fill="#1c1008" stroke="#d97706" stroke-width="2"/>
  <text x="350" y="78" font-family="monospace" font-size="11" fill="#fbbf24" text-anchor="middle">🔑 Authorization Engine</text>

  <!-- is_auth function -->
  <rect x="245" y="90" width="210" height="50" rx="6" fill="#78350f" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="350" y="110" font-family="monospace" font-size="10" fill="#fcd34d" text-anchor="middle" font-weight="bold">fn is_auth(user: Address) → bool</text>
  <text x="350" y="128" font-family="monospace" font-size="9" fill="#fde68a" text-anchor="middle">Validates caller is authorized</text>

  <!-- Logic description -->
  <rect x="245" y="152" width="210" height="60" rx="6" fill="#1e293b"/>
  <text x="350" y="170" font-family="monospace" font-size="9" fill="#94a3b8" text-anchor="middle">✅ Returns true → withdrawal proceeds</text>
  <text x="350" y="185" font-family="monospace" font-size="9" fill="#94a3b8" text-anchor="middle">❌ Returns false → Error(Contract, #3)</text>
  <text x="350" y="200" font-family="monospace" font-size="9" fill="#64748b" text-anchor="middle">Extendable: add DAO, multisig, etc.</text>

  <!-- From Escrow Arrow -->
  <line x1="40" y1="140" x2="215" y2="140" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="5,3"/>
  <polygon points="215,135 227,140 215,145" fill="#7c3aed"/>
  <text x="5" y="128" font-family="monospace" font-size="10" fill="#a78bfa">Escrow</text>
  <text x="2" y="141" font-family="monospace" font-size="10" fill="#a78bfa">Contract</text>
  <text x="7" y="154" font-family="monospace" font-size="10" fill="#a78bfa">calls →</text>

  <!-- To Escrow Result Arrow -->
  <line x1="485" y1="140" x2="620" y2="140" stroke="#34d399" stroke-width="1.5" stroke-dasharray="5,3"/>
  <polygon points="620,135 632,140 620,145" fill="#34d399"/>
  <text x="632" y="133" font-family="monospace" font-size="10" fill="#34d399">bool</text>
  <text x="628" y="146" font-family="monospace" font-size="10" fill="#34d399">result</text>
  <text x="625" y="159" font-family="monospace" font-size="10" fill="#34d399">→ back</text>

  <!-- Network badge -->
  <rect x="240" y="232" width="220" height="22" rx="6" fill="#1e293b"/>
  <text x="350" y="247" font-family="monospace" font-size="9" fill="#64748b" text-anchor="middle">🌐 Stellar Soroban Testnet</text>
</svg>
```

---

### 🔄 Transaction Flow

The complete end-to-end flow for a **Deposit** and a **Withdrawal**.

```svg
<svg viewBox="0 0 760 520" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;border-radius:12px;background:#0d1117">
  <rect width="760" height="520" fill="#0d1117" rx="12"/>

  <!-- Title -->
  <text x="380" y="30" font-family="monospace" font-size="15" fill="#e2e8f0" text-anchor="middle" font-weight="bold">End-to-End Transaction Flow</text>

  <!-- === ACTORS === -->
  <!-- User -->
  <rect x="20" y="55" width="90" height="36" rx="8" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="65" y="78" font-family="monospace" font-size="11" fill="#e2e8f0" text-anchor="middle">👤 User</text>
  <!-- Wallet Kit -->
  <rect x="160" y="55" width="110" height="36" rx="8" fill="#1e1b4b" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="215" y="78" font-family="monospace" font-size="11" fill="#c4b5fd" text-anchor="middle">🔌 Wallet Kit</text>
  <!-- Frontend -->
  <rect x="320" y="55" width="110" height="36" rx="8" fill="#0c2340" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="375" y="78" font-family="monospace" font-size="11" fill="#93c5fd" text-anchor="middle">⚡ Frontend</text>
  <!-- Escrow -->
  <rect x="480" y="55" width="115" height="36" rx="8" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
  <text x="537" y="70" font-family="monospace" font-size="10" fill="#d8b4fe" text-anchor="middle">📦 Escrow</text>
  <text x="537" y="84" font-family="monospace" font-size="9" fill="#a78bfa" text-anchor="middle">Contract</text>
  <!-- Policy -->
  <rect x="635" y="55" width="110" height="36" rx="8" fill="#1c1008" stroke="#d97706" stroke-width="1.5"/>
  <text x="690" y="70" font-family="monospace" font-size="10" fill="#fcd34d" text-anchor="middle">🔑 Policy</text>
  <text x="690" y="84" font-family="monospace" font-size="9" fill="#fbbf24" text-anchor="middle">Contract</text>

  <!-- Lifelines -->
  <line x1="65" y1="91" x2="65" y2="510" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="215" y1="91" x2="215" y2="510" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="375" y1="91" x2="375" y2="510" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="537" y1="91" x2="537" y2="510" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="690" y1="91" x2="690" y2="510" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>

  <!-- === DEPOSIT FLOW === -->
  <rect x="20" y="105" width="720" height="22" rx="4" fill="#064e3b" opacity="0.5"/>
  <text x="380" y="121" font-family="monospace" font-size="11" fill="#34d399" text-anchor="middle" font-weight="bold">── DEPOSIT FLOW ──</text>

  <!-- 1. User enters amount -->
  <line x1="65" y1="145" x2="370" y2="145" stroke="#60a5fa" stroke-width="1.5" marker-end="url(#arrow-blue)"/>
  <text x="215" y="140" font-family="monospace" font-size="9" fill="#60a5fa" text-anchor="middle">Enter amount + lock duration</text>

  <!-- 2. Frontend builds tx -->
  <line x1="375" y1="165" x2="532" y2="165" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#arrow-purple)"/>
  <text x="455" y="160" font-family="monospace" font-size="9" fill="#a78bfa" text-anchor="middle">simulateTransaction()</text>

  <!-- 3. RPC returns simulation -->
  <line x1="532" y1="183" x2="375" y2="183" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arrow-purple)"/>
  <text x="455" y="178" font-family="monospace" font-size="9" fill="#a78bfa" text-anchor="middle">simulation result + fee</text>

  <!-- 4. Frontend asks user to sign -->
  <line x1="375" y1="203" x2="220" y2="203" stroke="#c4b5fd" stroke-width="1.5" marker-end="url(#arrow-violet)"/>
  <text x="298" y="198" font-family="monospace" font-size="9" fill="#c4b5fd" text-anchor="middle">signTx(preparedXDR)</text>

  <!-- 5. Wallet Kit prompts user -->
  <line x1="215" y1="223" x2="70" y2="223" stroke="#e879f9" stroke-width="1.5" marker-end="url(#arrow-pink)"/>
  <text x="143" y="218" font-family="monospace" font-size="9" fill="#e879f9" text-anchor="middle">Show signing prompt</text>

  <!-- 6. User approves -->
  <line x1="65" y1="243" x2="210" y2="243" stroke="#34d399" stroke-width="1.5" marker-end="url(#arrow-green)"/>
  <text x="138" y="238" font-family="monospace" font-size="9" fill="#34d399" text-anchor="middle">✅ User approves</text>

  <!-- 7. Signed XDR returned -->
  <line x1="215" y1="263" x2="370" y2="263" stroke="#c4b5fd" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arrow-violet)"/>
  <text x="292" y="258" font-family="monospace" font-size="9" fill="#c4b5fd" text-anchor="middle">signedXDR</text>

  <!-- 8. Submit to network -->
  <line x1="375" y1="283" x2="532" y2="283" stroke="#a855f7" stroke-width="2" marker-end="url(#arrow-purple2)"/>
  <text x="455" y="278" font-family="monospace" font-size="9" fill="#d8b4fe" text-anchor="middle" font-weight="bold">sendTransaction() → deposit()</text>

  <!-- 9. Contract stores balance -->
  <rect x="490" y="295" width="95" height="22" rx="4" fill="#1e1b4b" stroke="#7c3aed" stroke-width="1"/>
  <text x="537" y="310" font-family="monospace" font-size="9" fill="#c4b5fd" text-anchor="middle">Store balance + unlock_time</text>

  <!-- Tx Hash back -->
  <line x1="532" y1="325" x2="375" y2="325" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arrow-green)"/>
  <text x="455" y="320" font-family="monospace" font-size="9" fill="#34d399" text-anchor="middle">tx_hash ✅ Confirmed</text>

  <!-- === WITHDRAW FLOW === -->
  <rect x="20" y="342" width="720" height="22" rx="4" fill="#7f1d1d" opacity="0.5"/>
  <text x="380" y="358" font-family="monospace" font-size="11" fill="#f87171" text-anchor="middle" font-weight="bold">── WITHDRAWAL FLOW (after lock expires) ──</text>

  <!-- 1. User clicks withdraw -->
  <line x1="65" y1="382" x2="370" y2="382" stroke="#60a5fa" stroke-width="1.5" marker-end="url(#arrow-blue)"/>
  <text x="215" y="377" font-family="monospace" font-size="9" fill="#60a5fa" text-anchor="middle">Click Withdraw button</text>

  <!-- 2. withdraw() call -->
  <line x1="375" y1="402" x2="532" y2="402" stroke="#f87171" stroke-width="2" marker-end="url(#arrow-red)"/>
  <text x="455" y="397" font-family="monospace" font-size="9" fill="#f87171" text-anchor="middle" font-weight="bold">withdraw(user, policy_addr)</text>

  <!-- 3. Escrow calls Policy -->
  <line x1="537" y1="422" x2="685" y2="422" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow-amber)"/>
  <text x="612" y="417" font-family="monospace" font-size="9" fill="#f59e0b" text-anchor="middle">is_auth(user)</text>

  <!-- 4. Policy returns -->
  <line x1="685" y1="442" x2="537" y2="442" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arrow-amber)"/>
  <text x="612" y="437" font-family="monospace" font-size="9" fill="#fbbf24" text-anchor="middle">true (authorized) ✅</text>

  <!-- 5. Check time lock -->
  <rect x="490" y="452" width="95" height="22" rx="4" fill="#7f1d1d" stroke="#ef4444" stroke-width="1"/>
  <text x="537" y="467" font-family="monospace" font-size="9" fill="#fca5a5" text-anchor="middle">Check: now ≥ unlock_time?</text>

  <!-- 6. Transfer funds -->
  <line x1="532" y1="484" x2="375" y2="484" stroke="#34d399" stroke-width="2" marker-end="url(#arrow-green)"/>
  <text x="455" y="479" font-family="monospace" font-size="9" fill="#34d399" text-anchor="middle" font-weight="bold">Transfer XLM to user ✅</text>

  <!-- Arrow Markers -->
  <defs>
    <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#60a5fa"/>
    </marker>
    <marker id="arrow-purple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#a78bfa"/>
    </marker>
    <marker id="arrow-purple2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#a855f7"/>
    </marker>
    <marker id="arrow-violet" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#c4b5fd"/>
    </marker>
    <marker id="arrow-pink" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#e879f9"/>
    </marker>
    <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#34d399"/>
    </marker>
    <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#f87171"/>
    </marker>
    <marker id="arrow-amber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#f59e0b"/>
    </marker>
  </defs>
</svg>
```

---

### 🔒 Cross-Contract Authorization Flow

The most critical piece of the L3 architecture: when `withdraw()` is called on the Escrow contract, it **cannot** release funds on its own. It must first call the Policy contract's `is_auth()` function. This design means:

1. **The withdrawal rule is governed externally** — you can upgrade or replace the Policy contract without touching the Escrow.
2. **Future extensibility** — the Policy could be replaced with a DAO vote, a multisig, or any other on-chain governance logic.
3. **Security** — the Escrow never has unilateral control over withdrawals.

```svg
<svg viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;border-radius:12px;background:#0d1117">
  <rect width="700" height="200" fill="#0d1117" rx="12"/>
  <text x="350" y="30" font-family="monospace" font-size="13" fill="#e2e8f0" text-anchor="middle" font-weight="bold">Cross-Contract Authorization Architecture</text>

  <!-- User box -->
  <rect x="20" y="60" width="100" height="80" rx="8" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="70" y="96" font-family="monospace" font-size="11" fill="#e2e8f0" text-anchor="middle">👤 User</text>
  <text x="70" y="112" font-family="monospace" font-size="9" fill="#94a3b8" text-anchor="middle">Wallet</text>

  <!-- Arrow User → Escrow -->
  <line x1="120" y1="100" x2="238" y2="100" stroke="#60a5fa" stroke-width="2"/>
  <polygon points="238,95 250,100 238,105" fill="#60a5fa"/>
  <text x="182" y="93" font-family="monospace" font-size="9" fill="#60a5fa" text-anchor="middle">withdraw()</text>

  <!-- Escrow box -->
  <rect x="250" y="60" width="140" height="80" rx="8" fill="#1e1b4b" stroke="#7c3aed" stroke-width="2"/>
  <text x="320" y="88" font-family="monospace" font-size="10" fill="#c4b5fd" text-anchor="middle">📦 Escrow</text>
  <text x="320" y="103" font-family="monospace" font-size="9" fill="#a78bfa" text-anchor="middle">CCQYG4...UCCR</text>
  <rect x="265" y="112" width="110" height="18" rx="4" fill="#312e81"/>
  <text x="320" y="125" font-family="monospace" font-size="8" fill="#e2e8f0" text-anchor="middle">check: now ≥ unlock_time</text>

  <!-- Arrow Escrow → Policy -->
  <line x1="390" y1="100" x2="498" y2="100" stroke="#f59e0b" stroke-width="2"/>
  <polygon points="498,95 510,100 498,105" fill="#f59e0b"/>
  <text x="447" y="93" font-family="monospace" font-size="9" fill="#f59e0b" text-anchor="middle">is_auth(user)</text>

  <!-- Policy box -->
  <rect x="510" y="60" width="160" height="80" rx="8" fill="#1c1008" stroke="#d97706" stroke-width="2"/>
  <text x="590" y="88" font-family="monospace" font-size="10" fill="#fcd34d" text-anchor="middle">🔑 Policy</text>
  <text x="590" y="103" font-family="monospace" font-size="9" fill="#fbbf24" text-anchor="middle">CCIHX5...U7VE</text>
  <rect x="525" y="112" width="130" height="18" rx="4" fill="#78350f"/>
  <text x="590" y="125" font-family="monospace" font-size="8" fill="#fde68a" text-anchor="middle">returns: true / false</text>

  <!-- Return arrow Policy → Escrow -->
  <line x1="510" y1="152" x2="395" y2="152" stroke="#34d399" stroke-width="1.5" stroke-dasharray="5,3"/>
  <polygon points="395,147 383,152 395,157" fill="#34d399"/>
  <text x="450" y="168" font-family="monospace" font-size="9" fill="#34d399" text-anchor="middle">true → release funds</text>

  <!-- Return arrow Escrow → User -->
  <line x1="250" y1="152" x2="125" y2="152" stroke="#34d399" stroke-width="1.5" stroke-dasharray="5,3"/>
  <polygon points="125,147 113,152 125,157" fill="#34d399"/>
  <text x="185" y="168" font-family="monospace" font-size="9" fill="#34d399" text-anchor="middle">XLM transferred ✅</text>
</svg>
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Smart Contracts** | Rust + Soroban SDK (Stellar) |
| **Blockchain Network** | Stellar Soroban Testnet |
| **Frontend Framework** | Next.js 16 (App Router) |
| **Wallet Integration** | `@creit.tech/stellar-wallets-kit` v2.5 |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS v4, Framer Motion |
| **Testing** | Jest + ts-jest |
| **CI/CD** | GitHub Actions |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A Stellar-compatible wallet (Freighter, Albedo, or any WalletConnect wallet like xBull, Lobstr)

### Installation

```bash
git clone https://github.com/Be-bibek/web3-TimeLockNotExpired.git
cd web3-TimeLockNotExpired
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Mobile Testing
WalletConnect requires HTTPS. To test on mobile, tunnel your local server:

```bash
# In a second terminal
npx -y cloudflared tunnel --url http://127.0.0.1:3000
```

Open the `https://....trycloudflare.com` URL on your mobile device.

> **Note:** Make sure both `npm run dev` AND `cloudflared` are running in **separate terminals** simultaneously.

---

## ⚙️ CI/CD Pipeline

This project uses **GitHub Actions** for continuous integration. Every push to `main` automatically:

1. ✅ Installs dependencies
2. ✅ Runs the full TypeScript type check (`tsc --noEmit`)
3. ✅ Runs all contract and wallet unit tests (`npm test`)
4. ✅ Builds the production Next.js bundle (`npm run build`)

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the workflow configuration.

---

## 🧪 Testing

Tests cover:
- **XLM → Stroops conversion accuracy**
- **Time lock calculation** (including 10-year lock validation)
- **L2 custom error code parsing** (`#1 InsufficientFunds`, `#2 TimeLockNotExpired`, `#3 UnauthorizedPolicy`)
- **Input validation** (public key format, zero-amount guard)
- **Contract ID configuration** (valid C-prefixed Stellar contract addresses)
- **Wallet store** (connect/disconnect state management)

```bash
npm test              # Run all tests
npm run test:coverage # Generate coverage report
```
