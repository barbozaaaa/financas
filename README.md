# 💰 Controle de Finanças

Um aplicativo simples e bonito para controlar suas finanças pessoais, com suporte para duas pessoas compartilharem dados em tempo real.

## 🚀 Como usar

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acessar no navegador:**
   O site abrirá automaticamente em `http://localhost:3000`

## ✨ Funcionalidades

- ➕ Adicionar receitas (entradas)
- ➖ Adicionar despesas (saídas)
- 💰 Visualizar saldo atual
- 📋 Ver histórico de transações
- 🗑️ Excluir transações
- 👥 Dados separados por pessoa (Meus Dados / Dados Dela)
- 📊 Visualização conjunta (Todos Juntos)
- ☁️ Dados salvos na nuvem (Firestore) - sincronização em tempo real

## 🛠️ Tecnologias

- React
- Vite
- Firebase (Firestore)
- CSS puro (sem frameworks)

## 📦 Build para produção

```bash
npm run build
```

Os arquivos estarão na pasta `dist/`.

## 🔥 Configuração do Firebase

1. Crie um arquivo `src/firebase.js` baseado em `src/firebase.example.js`
2. Configure suas credenciais do Firebase
3. Ative o Firestore no Firebase Console
4. Configure as regras do Firestore

## 🚀 Deploy no Vercel

Este projeto está configurado para deploy automático no Vercel via GitHub.

### Variáveis de Ambiente no Vercel:

Configure estas variáveis no Vercel:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

Ou use os valores padrão no código (não recomendado para produção).
