# 🔥 Como Configurar o Firebase

Para que você e sua namorada compartilhem os mesmos dados, você precisa configurar o Firestore.

## Passo 1: Ativar o Firestore

1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto (ID: 996167071736)
3. No menu lateral, clique em **Firestore Database**
4. Clique em **Criar banco de dados**
5. Escolha **Modo de teste** (para começar rápido)
6. Escolha uma localização (ex: `southamerica-east1` para Brasil)
7. Clique em **Ativar**

## Passo 2: Obter as Credenciais

1. No Firebase Console, clique no ícone de **engrenagem** ⚙️
2. Clique em **Configurações do projeto**
3. Role até **Seus apps**
4. Se não tiver um app web, clique em **Adicionar app** > **Web** (ícone `</>`)
5. Dê um nome (ex: "Fiancas App")
6. **NÃO marque** "Também configurar o Firebase Hosting"
7. Clique em **Registrar app**
8. Copie as credenciais que aparecem (firebaseConfig)

## Passo 3: Configurar no Projeto

Abra o arquivo `src/firebase.js` e substitua as credenciais:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "996167071736",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
}
```

## Passo 4: Configurar Regras do Firestore

1. No Firestore, vá em **Regras**
2. Substitua por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Clique em **Publicar**

⚠️ **IMPORTANTE**: Essas regras permitem qualquer pessoa ler/escrever. 
Para produção, você deve adicionar autenticação depois.

## Pronto! 

Depois disso, os dados serão salvos na nuvem e vocês dois verão as mesmas transações em tempo real! 🎉
