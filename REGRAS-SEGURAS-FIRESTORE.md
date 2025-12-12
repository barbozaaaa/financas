# 🔒 Regras Seguras do Firestore

## ⚠️ IMPORTANTE: Segurança

As regras que configurei inicialmente (`allow read, write: if true`) são **INSEGURAS** e permitem que qualquer pessoa acesse seus dados.

## ✅ Solução: Adicionar Autenticação

Para proteger seus dados, você precisa adicionar autenticação. Aqui estão as opções:

### Opção 1: Autenticação com Email/Senha (RECOMENDADO)

**Passo 1: Ativar Authentication no Firebase**

1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto: **financas-833ad**
3. No menu lateral, clique em **Authentication**
4. Clique em **Começar**
5. Vá em **Sign-in method**
6. Ative **Email/Password**
7. Clique em **Salvar**

**Passo 2: Atualizar Regras do Firestore**

1. No Firestore, vá em **Regras**
2. Substitua por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas usuários autenticados podem ler/escrever
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Clique em **Publicar**

**Passo 3: Criar Contas**

Você e sua namorada precisarão criar contas:
- No Firebase Console > Authentication > Users
- Clique em **Adicionar usuário**
- Crie uma conta para você e outra para ela

**Passo 4: Atualizar o Código**

O código precisa ser atualizado para incluir login. Isso requer modificações no App.jsx.

---

### Opção 2: Chave Secreta (Mais Simples, Menos Seguro)

Se não quiser autenticação, você pode usar uma chave secreta compartilhada:

**Regras do Firestore:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Verifica se a chave secreta está correta
      allow read, write: if request.resource.data.secretKey == 'SUA_CHAVE_SECRETA_AQUI';
    }
  }
}
```

⚠️ **Nota**: Esta opção é menos segura, mas mais simples de implementar.

---

### Opção 3: Restringir por Domínio (Avançado)

Você pode restringir acesso apenas ao seu domínio do Firebase Hosting, mas isso é mais complexo.

---

## 🎯 Recomendação

Para uso pessoal entre duas pessoas, a **Opção 1 (Autenticação)** é a melhor escolha:
- ✅ Seguro
- ✅ Fácil de usar depois de configurado
- ✅ Cada pessoa tem sua própria conta
- ✅ Você pode ver quem fez cada transação

Quer que eu implemente a autenticação no código?
