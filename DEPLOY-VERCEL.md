# 🚀 Deploy no Vercel via GitHub

## Passo 1: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `fiancas-app` (ou qualquer nome)
3. Deixe **público** ou **privado** (como preferir)
4. **NÃO** marque "Add a README file"
5. Clique em **Create repository**

## Passo 2: Conectar com o Repositório Local

No terminal (CMD), execute:

```bash
git remote add origin https://github.com/SEU_USUARIO/fiancas-app.git
```

(Substitua `SEU_USUARIO` pelo seu usuário do GitHub)

## Passo 3: Fazer Push para o GitHub

```bash
git branch -M main
git push -u origin main
```

Você precisará fazer login no GitHub quando pedir.

## Passo 4: Deploy no Vercel

1. Acesse: https://vercel.com
2. Clique em **Sign Up** ou **Login**
3. Escolha **Continue with GitHub**
4. Autorize o Vercel a acessar seus repositórios
5. Clique em **Add New Project**
6. Selecione o repositório `fiancas-app`
7. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
8. Clique em **Deploy**

## Passo 5: Configurar Variáveis de Ambiente (Opcional)

Se quiser usar variáveis de ambiente (mais seguro):

1. No Vercel, vá em **Settings** > **Environment Variables**
2. Adicione:
   - `VITE_FIREBASE_API_KEY` = `AIzaSyCS_j4JcHK0Lk2KmMFzQONL8UUQDNNyK2M`
   - `VITE_FIREBASE_AUTH_DOMAIN` = `financas-833ad.firebaseapp.com`
   - `VITE_FIREBASE_PROJECT_ID` = `financas-833ad`
   - `VITE_FIREBASE_STORAGE_BUCKET` = `financas-833ad.firebasestorage.app`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` = `996167071736`
   - `VITE_FIREBASE_APP_ID` = `1:996167071736:web:f312204e42ec822641080d`
   - `VITE_FIREBASE_MEASUREMENT_ID` = `G-FZ6F4QCF86`
3. Clique em **Save**
4. Vá em **Deployments** e faça um novo deploy

## ✅ Pronto!

Depois do deploy, o Vercel vai te dar um link tipo:
`https://fiancas-app.vercel.app`

Esse é o link que você e ela vão usar no celular!

## 🔄 Deploy Automático

A partir de agora, toda vez que você fizer `git push`, o Vercel vai fazer deploy automaticamente!
