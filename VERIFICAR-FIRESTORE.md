# ✅ Próximos Passos - Ativar Firestore

O código está configurado! Agora você só precisa ativar o Firestore no Firebase Console.

## 🔥 Ativar Firestore (IMPORTANTE!)

1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto: **financas-833ad**
3. No menu lateral, clique em **Firestore Database**
4. Se ainda não criou, clique em **Criar banco de dados**
5. Escolha **Modo de teste** (para começar rápido)
6. Escolha uma localização: **southamerica-east1** (Brasil)
7. Clique em **Ativar**

## 🔒 Configurar Regras do Firestore (IMPORTANTE!)

⚠️ **ATENÇÃO**: As regras públicas são **INSEGURAS**!

Veja o arquivo `REGRAS-SEGURAS-FIRESTORE.md` para opções seguras.

**Para começar rápido (TEMPORÁRIO - NÃO SEGURO):**

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

⚠️ **IMPORTANTE**: Essas regras permitem qualquer pessoa acessar seus dados!
Configure autenticação o quanto antes. Veja `REGRAS-SEGURAS-FIRESTORE.md`

## 🚀 Depois de Ativar

1. Execute `npm run dev` para testar localmente
2. Ou faça deploy com `DEPLOY-AGORA.bat`

## ✨ Funcionalidades

- ✅ Dados salvos na nuvem (Firestore)
- ✅ Sincronização em tempo real
- ✅ Você e sua namorada verão os mesmos dados
- ✅ Funciona em qualquer dispositivo
